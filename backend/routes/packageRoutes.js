import express from "express";

import {
  createPackage,
  getAllPackages,
  getSinglePackage,
  updatePackage,
  deletePackage,
} from "../controllers/packageController.js";

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import imageUpload from "../middleware/imageUpload.js";

const router = express.Router();

// Public Routes
router.get("/", getAllPackages);
router.get("/:id", getSinglePackage);

// Admin Routes
router.post(
  "/",
  protect,
  authorizePermissions("packages", "create"),
  imageUpload.single("image"),
  createPackage
);

router.put(
  "/:id",
  protect,
  authorizePermissions("packages", "update"),
  imageUpload.single("image"),
  updatePackage
);

router.delete(
  "/:id",
  protect,
  authorizePermissions("packages", "delete"),
  deletePackage
);

export default router;
