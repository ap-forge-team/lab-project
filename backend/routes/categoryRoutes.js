import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", protect, getAllCategories);
router.get("/:id", protect, getCategoryById);
router.post("/", protect, authorizePermissions("categories", "create"), createCategory);
router.put("/:id", protect, authorizePermissions("categories", "update"), updateCategory);
router.delete("/:id", protect, authorizePermissions("categories", "delete"), deleteCategory);
router.put("/:id/toggle-status", protect, authorizePermissions("categories", "update"), toggleCategoryStatus);

export default router;
