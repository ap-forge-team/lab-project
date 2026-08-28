import Role from "../models/Role.js";

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    const roleExists = await Role.findOne({ name: req.user.role });
    if (roleExists) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access Denied",
    });
  };
};

const authorizePermissions = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    const rolePermissions = req.user.rolePermissions || {};

    if (rolePermissions[resource] && rolePermissions[resource][action]) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access Denied",
    });
  };
};

export { authorizePermissions };
export default authorizeRoles;
