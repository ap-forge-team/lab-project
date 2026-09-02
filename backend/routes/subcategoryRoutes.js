import express from "express";
import {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus,
} from "../controllers/subcategoryController.js";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizePermissions("subcategories", "create"), createSubcategory);

router.get("/", protect, authorizePermissions("subcategories", "read"), getAllSubcategories);

router.get("/:id", protect, authorizePermissions("subcategories", "read"), getSubcategoryById);

router.put("/:id", protect, authorizePermissions("subcategories", "update"), updateSubcategory);

router.delete("/:id", protect, authorizePermissions("subcategories", "delete"), deleteSubcategory);

router.patch("/:id/toggle-status", protect, authorizePermissions("subcategories", "update"), toggleSubcategoryStatus);

export default router;
