import User from "../models/User.js";
import sendMail from "../Utils/sendMail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_REQUIRED,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendMail(email, "Password Reset OTP", `Your OTP is ${otp}`);

    res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.OTP_SENT,
    });
  } catch (error) {
    logger.error("Forgot password error", { message: error.message });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_AND_OTP_REQUIRED,
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_OTP,
      });
    }

    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.OTP_EXPIRED,
      });
    }

    res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.OTP_VERIFIED,
    });
  } catch (error) {
    logger.error("Verify OTP error", { message: error.message });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_OTP_PASSWORD_REQUIRED,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.PASSWORD_MIN_6,
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_OTP,
      });
    }

    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.AUTH.OTP_EXPIRED,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetOtp = "";
    user.resetOtpExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_UPDATED,
    });
  } catch (error) {
    logger.error("Reset password error", { message: error.message });
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};
