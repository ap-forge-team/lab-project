import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus,
} from "../controllers/subcategoryController.js";

const router = express.Router();

router.get("/", protect, getAllSubcategories);
router.get("/:id", protect, getSubcategoryById);
router.post("/", protect, authorizePermissions("subcategories", "create"), createSubcategory);
router.put("/:id", protect, authorizePermissions("subcategories", "update"), updateSubcategory);
router.delete("/:id", protect, authorizePermissions("subcategories", "delete"), deleteSubcategory);
router.put("/:id/toggle-status", protect, authorizePermissions("subcategories", "update"), toggleSubcategoryStatus);

export default router;
