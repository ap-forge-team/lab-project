import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/categoryController.js";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import imageUpload from "../middleware/imageUpload.js";

const router = express.Router();

router.post("/", protect, authorizePermissions("categories", "create"),  imageUpload.fields([
    {
      name: "icon",
      maxCount: 1,
    },
    {
      name: "illustration",
      maxCount: 1,
    },
    {
      name: "customIcon",
      maxCount: 1,
    },
  ]),createCategory);

router.get("/", protect, authorizePermissions("categories", "read"), getAllCategories);

router.get("/:id", protect, authorizePermissions("categories", "read"), getCategoryById);

router.put("/:id", protect, authorizePermissions("categories", "update"),  imageUpload.fields([
    {
      name: "icon",
      maxCount: 1,
    },
    {
      name: "illustration",
      maxCount: 1,
    },
    {
      name: "customIcon",
      maxCount: 1,
    },
  ]),updateCategory);

router.delete("/:id", protect, authorizePermissions("categories", "delete"), deleteCategory);

router.patch("/:id/toggle-status", protect, authorizePermissions("categories", "update"), toggleCategoryStatus);

export default router;
