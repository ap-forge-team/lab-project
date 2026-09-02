import User from "../models/User.js";

import bcrypt from "bcryptjs";
import logger from "../Utils/logger.js";
import MESSAGES from "../Utils/messages.js";


export const createLabAssistant = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      documents,
    } = req.body;

    // Validation

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: MESSAGES.USER.ALL_FIELDS_REQUIRED,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: MESSAGES.USER.PASSWORD_MIN_6,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: MESSAGES.USER.INVALID_EMAIL_FORMAT,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.USER.ALREADY_EXISTS
      });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.USER.PHONE_EXISTS
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      password,
      salt,
    );


    const user = await User.create({
      name,
      email,
      phone,
      documents,
      password: hashedPassword,
      role: "lab_assistant",
      labOwner: req.user._id,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      success: true,
      message: MESSAGES.ADMIN.LAB_ASSISTANT_CREATED,
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error("Create Lab Assistant error", { message: error.message, stack: error.stack });
    res.status(500).json({
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/* -----------------------------------------
   CREATE LAB OWNER
------------------------------------------ */
export const createLabOwner = async (req, res) => {
  try {
   const {
  name,
  email,
  phone,
  password,
  servicePincodes,
  labAddress,
  latitude,
  longitude
} = req.body
    // Validation
    if (!name || !email || !password || !phone || !labAddress ||
  !latitude ||
  !longitude) {
      return res.status(400).json({
        message: MESSAGES.USER.ALL_FIELDS_REQUIRED,
      });
    }
    // Password Length
    if (password.length < 6) {
      return res.status(400).json({
        message: MESSAGES.USER.PASSWORD_MIN_6,
      });
    }
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: MESSAGES.USER.INVALID_EMAIL_FORMAT,
      });
    }
    // Existing User
    const userExists = await User.findOne({
      email,
    });
    if (userExists) {
      return res.status(400).json({
        message: MESSAGES.USER.ALREADY_EXISTS_CAP,
      });
    }
    const phoneExists = await User.findOne({
      phone,
    });
    if (phoneExists) {
      return res.status(400).json({
        message: MESSAGES.USER.PHONE_EXISTS_CAP,
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      password,
      salt,
    );
    // Create Lab Owner
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "lab_owner",
      labAddress,
      latitude,
      longitude,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      success: true,
      message: MESSAGES.ADMIN.LAB_OWNER_CREATED,
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error("Create Lab Owner error", { message: error.message, stack: error.stack });
    res.status(500).json({
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const getLabOwners =
async (req, res) => {

  try {

    const labOwners = await User.find({ role: "lab_owner" }).select("-password");

    res.status(200).json({
      success: true,
      labOwners,
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    })
  }
}
