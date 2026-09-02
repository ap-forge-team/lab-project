import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getAvailableResources,
  assignRole,
} from "../controllers/roleController.js";

const router = express.Router();

router.get("/resources", protect, authorizePermissions("roles", "read"), getAvailableResources);

router.get("/", protect, authorizePermissions("roles", "read"), getAllRoles);

router.get("/:id", protect, authorizePermissions("roles", "read"), getRoleById);

router.post("/", protect, authorizePermissions("roles", "create"), createRole);

router.put("/:id", protect, authorizePermissions("roles", "update"), updateRole);

router.put("/:id/permissions", protect, authorizePermissions("roles", "update"), updateRolePermissions);

router.delete("/:id", protect, authorizePermissions("roles", "delete"), deleteRole);

router.post("/assign", protect, authorizePermissions("roles", "update"), assignRole);

export default router;
