import express from "express";

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";

import { getLabOwnerPaymentStats, getAdminPaymentStats } from "../controllers/PaymentStatistic.js";

const router = express.Router();

router.get(
  "/lab-owner",
  protect,
  authorizePermissions("payments", "read"),
  getLabOwnerPaymentStats
);

router.get(
  "/admin",
  protect,
  authorizePermissions("payments", "read"),
  getAdminPaymentStats
);

export default router;
