import User from '../models/User.js'
import bcrypt from "bcryptjs";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";


export const getMyAssistants =
  async (req, res) => {

    try {

      const assistants =
        await User.find({

          role:
            'lab_assistant',

          labOwner:
            req.user._id

        }).select('-password')

      res.status(200)
        .json(assistants)

    } catch (error) {
      logger.error(error);

      res.status(500).json({

        message:
          error.message

      })
    }
  }

// =============================
// Get All Users
// =============================
export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    logger.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =============================
// Get Single User
// =============================
export const getSingleUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {

      return res.status(404).json({
        success: false,
        message: MESSAGES.USER.NOT_FOUND
      });

    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =============================
// Update User
// =============================
export const updateUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: MESSAGES.USER.NOT_FOUND
      });

    }

    const {
      name,
      email,
      phone,
      password,
      role,
      labAddress,
      latitude,
      longitude,
      serviceRadius,
      servicePincodes,
      document
    } = req.body;

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.role = role ?? user.role;
    user.labAddress = labAddress ?? user.labAddress;
    user.latitude = latitude ?? user.latitude;
    user.longitude = longitude ?? user.longitude;
    user.serviceRadius = serviceRadius ?? user.serviceRadius;
    user.servicePincodes =
      servicePincodes ?? user.servicePincodes;
    user.document = document ?? user.document;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.USER.UPDATED,
      data: user
    });

  } catch (error) {
    logger.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =============================
// Delete User
// =============================
export const deleteUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: MESSAGES.USER.NOT_FOUND
      });

    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: MESSAGES.USER.DELETED
    });

  } catch (error) {
    logger.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
