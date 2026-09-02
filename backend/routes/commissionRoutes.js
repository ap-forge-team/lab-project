import express from "express";

import {
  createCommission,
  getCommission,
  updateCommission,
  getCommissionHistory,
  deleteCommission,
} from "../controllers/commissionController.js";

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizePermissions("commissions", "create"),
  createCommission
);

router.get(
  "/history",
  protect,
  authorizePermissions("commissions", "read"),
  getCommissionHistory
);

router.get(
  "/",
  protect,
  authorizePermissions("commissions", "read"),
  getCommission
);

router.put(
  "/",
  protect,
  authorizePermissions("commissions", "update"),
  updateCommission
);

router.delete(
  "/",
  protect,
  authorizePermissions("commissions", "delete"),
  deleteCommission
);

export default router;
