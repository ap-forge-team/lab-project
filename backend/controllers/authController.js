import User from "../models/User.js";
import Role from "../models/Role.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../Utils/logger.js";
import MESSAGES from "../Utils/messages.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.FILL_ALL_FIELDS,
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_EMAIL_FORMAT,
      });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.PHONE_MUST_BE_10_DIGITS,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.PASSWORD_MIN_6,
      });
    }

    const userExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });

    if (userExists || phoneExists) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.AUTH.USER_OR_PHONE_EXISTS,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error("Register error", { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.FILL_ALL_FIELDS,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    const roleDoc = await Role.findOne({ name: user.role });
    const permissions = roleDoc ? roleDoc.permissions : {};

    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error("Login error", { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};
