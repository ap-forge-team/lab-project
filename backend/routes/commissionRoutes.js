import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  getCommissionSettings,
  getCommissionSettingByLabOwner,
  createOrUpdateCommissionSetting,
  deleteCommissionSetting,
  getCommissionHistory,
  createCommissionEntry,
} from "../controllers/commissionController.js";

const router = express.Router();

router.get("/", protect, authorizePermissions("commissions", "read"), getCommissionSettings);
router.post("/", protect, authorizePermissions("commissions", "create"), createOrUpdateCommissionSetting);
router.put("/", protect, authorizePermissions("commissions", "update"), createOrUpdateCommissionSetting);
router.delete("/:id", protect, authorizePermissions("commissions", "delete"), deleteCommissionSetting);

router.get("/settings", protect, authorizePermissions("commissions", "read"), getCommissionSettings);
router.get("/settings/:labOwnerId", protect, getCommissionSettingByLabOwner);
router.post("/settings", protect, authorizePermissions("commissions", "create"), createOrUpdateCommissionSetting);
router.delete("/settings/:id", protect, authorizePermissions("commissions", "delete"), deleteCommissionSetting);
router.get("/history", protect, authorizePermissions("commissions", "read"), getCommissionHistory);
router.post("/entry", protect, authorizePermissions("commissions", "create"), createCommissionEntry);

export default router;
