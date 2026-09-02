import express from "express";

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import imageUpload from "../middleware/imageUpload.js";

import {
  createTest,
  getAllTests,
  getSingleTest,
  updateTest,
  deleteTest,
} from "../controllers/testController.js";

const router = express.Router();

// Public Routes
router.get("/", getAllTests);
router.get("/:id", getSingleTest);

// Admin Routes
router.post(
  "/",
  protect,
  authorizePermissions("tests", "create"),
  imageUpload.single("image"),
  createTest
);

router.put(
  "/:id",
  protect,
  authorizePermissions("tests", "update"),
  imageUpload.single("image"),
  updateTest
);

router.delete(
  "/:id",
  protect,
  authorizePermissions("tests", "delete"),
  deleteTest
);

export default router;
