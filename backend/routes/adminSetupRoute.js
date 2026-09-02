import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create-admin", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const adminExists = await User.findOne({ email });
    if (adminExists) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
