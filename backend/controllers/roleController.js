import Role from "../models/Role.js";
import User from "../models/User.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

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
        message: MESSAGES.ROLE.NAME_DISPLAY_NAME_REQUIRED,
      });
    }

    const existing = await Role.findOne({ name: name.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.ROLE.ALREADY_EXISTS,
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
      message: MESSAGES.ROLE.CREATED,
      role,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
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
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.ROLE.NOT_FOUND,
      });
    }

    res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
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
        message: MESSAGES.ROLE.NOT_FOUND,
      });
    }

    if (displayName) role.displayName = displayName;
    if (description !== undefined) role.description = description;

    await role.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.ROLE.UPDATED,
      role,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.ROLE.NOT_FOUND,
      });
    }

    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.ROLE.CANNOT_DELETE_SYSTEM,
      });
    }

    const usersWithRole = await User.countDocuments({ role: role.name });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.ROLE.CANNOT_DELETE_ASSIGNED(usersWithRole),
      });
    }

    await role.deleteOne();

    res.status(200).json({
      success: true,
      message: MESSAGES.ROLE.DELETED,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({
        success: false,
        message: MESSAGES.ROLE.PERMISSIONS_OBJECT_REQUIRED,
      });
    }

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.ROLE.NOT_FOUND,
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
      message: MESSAGES.ROLE.PERMISSIONS_UPDATED,
      role,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.ROLE.USER_ID_ROLE_NAME_REQUIRED,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.USER.NOT_FOUND,
      });
    }

    const role = await Role.findOne({ name: roleName.toLowerCase() });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.ROLE.NOT_FOUND,
      });
    }

    user.role = role.name;
    await user.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.ROLE.ASSIGNED(role.displayName, user.name),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};
