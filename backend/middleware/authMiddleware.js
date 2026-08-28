import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User Not Found",
        });
      }

      const role = await Role.findOne({ name: user.role });

      req.user = user;
      req.user.rolePermissions = role?.permissions
        ? JSON.parse(JSON.stringify(role.permissions))
        : {};

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "No Token",
    });
  }
};

export default protect;
