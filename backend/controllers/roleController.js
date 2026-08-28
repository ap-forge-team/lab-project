import Role from "../models/Role.js";
import User from "../models/User.js";

const AVAILABLE_RESOURCES = [
  "users",
  "roles",
  "bookings",
  "tests",
  "packages",
  "categories",
  "subcategories",
  "payments",
  "reports",
  "commissions",
  "settlements",
  "paymentSettings",
];

const ACTIONS = ["create", "read", "update", "delete"];

export const getAvailableResources = async (req, res) => {
  res.status(200).json({
    success: true,
    resources: AVAILABLE_RESOURCES,
    actions: ACTIONS,
  });
};

export const createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Name and display name are required",
      });
    }

    const existing = await Role.findOne({ name: name.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Role already exists",
      });
    }

    const sanitizedPermissions = {};

    if (permissions && typeof permissions === "object") {
      for (const [resource, perms] of Object.entries(permissions)) {
        if (!AVAILABLE_RESOURCES.includes(resource)) continue;
        sanitizedPermissions[resource] = {
          create: Boolean(perms.create),
          read: Boolean(perms.read),
          update: Boolean(perms.update),
          delete: Boolean(perms.delete),
        };
      }
    }

    const role = await Role.create({
      name: name.toLowerCase(),
      displayName,
      description: description || "",
      permissions: sanitizedPermissions,
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();

    const order = ["admin", "lab_owner", "lab_assistant", "patient"];

    roles.sort((a, b) => {
      const aIndex = order.indexOf(a.name);
      const bIndex = order.indexOf(b.name);
      const aOrder = aIndex === -1 ? order.length : aIndex;
      const bOrder = bIndex === -1 ? order.length : bIndex;
      return aOrder - bOrder;
    });

    res.status(200).json({
      success: true,
      count: roles.length,
      roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    let role;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      role = await Role.findById(id);
    } else {
      role = await Role.findOne({ name: id.toLowerCase() });
    }

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { displayName, description } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (displayName) role.displayName = displayName;
    if (description !== undefined) role.description = description;

    await role.save();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    if (role.isSystem && role.name === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin role",
      });
    }

    const usersWithRole = await User.countDocuments({ role: role.name });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${usersWithRole} user(s) assigned to this role.`,
      });
    }

    await role.deleteOne();

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({
        success: false,
        message: "Permissions object is required",
      });
    }

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const currentPerms = role.permissions?.toObject() || {};

    for (const [resource, perms] of Object.entries(permissions)) {
      if (!AVAILABLE_RESOURCES.includes(resource)) continue;

      if (perms === null || perms === false) {
        delete currentPerms[resource];
      } else {
        currentPerms[resource] = {
          create: Boolean(perms.create),
          read: Boolean(perms.read),
          update: Boolean(perms.update),
          delete: Boolean(perms.delete),
        };
      }
    }

    role.permissions = currentPerms;
    await role.save();

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: "userId and roleName are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = await Role.findOne({ name: roleName.toLowerCase() });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    user.role = role.name;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Role "${role.displayName}" assigned to ${user.name}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
