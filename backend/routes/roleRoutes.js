import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  getAvailableResources,
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  updateRolePermissions,
  assignRole,
} from "../controllers/roleController.js";

const router = express.Router();

router.get("/resources", protect, authorizePermissions("roles", "read"), getAvailableResources);
router.post("/", protect, authorizePermissions("roles", "create"), createRole);
router.get("/", protect, authorizePermissions("roles", "read"), getAllRoles);
router.get("/:id", protect, authorizePermissions("roles", "read"), getRoleById);
router.put("/:id", protect, authorizePermissions("roles", "update"), updateRole);
router.delete("/:id", protect, authorizePermissions("roles", "delete"), deleteRole);
router.put("/:id/permissions", protect, authorizePermissions("roles", "update"), updateRolePermissions);
router.post("/assign", protect, authorizePermissions("roles", "update"), assignRole);

export default router;
