import express from "express";
const router = express.Router();

import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";

import {
  getSettlementStatistics,
  getSettlementList,
  sendSettlement,
  getSettlementDetails,
  getSettlementHistory,
  bulkSettlement,
  verifyBulkSettlement,
  verifySettlement,
  getLabSettlementHistory,
  getLabSettlementPending,
  getLabSettlementStatistics,
} from "../controllers/paymentSettlement.js";

// =========================
// Admin Routes
// =========================

router.get(
  "/statistics",
  protect,
  authorizePermissions("settlements", "read"),
  getSettlementStatistics
);

router.get(
  "/",
  protect,
  authorizePermissions("settlements", "read"),
  getSettlementList
);

// Single Settlement
router.put(
  "/send/:bookingId",
  protect,
  authorizePermissions("settlements", "create"),
  upload.single("paymentProof"),
  sendSettlement
);

// Bulk Settlement
router.post(
  "/bulk",
  protect,
  authorizePermissions("settlements", "create"),
  upload.single("paymentProof"),
  bulkSettlement
);

router.get(
  "/history",
  protect,
  authorizePermissions("settlements", "read"),
  getSettlementHistory
);

router.get(
  "/details/:batchId",
  protect,
  authorizePermissions("settlements", "read"),
  getSettlementDetails
);

// =========================
// Lab Owner Routes
// =========================
router.get(
  "/lab/statistics",
  protect,
  authorizePermissions("settlements", "read"),
  getLabSettlementStatistics
);

router.get(
  "/lab/pending",
  protect,
  authorizePermissions("settlements", "read"),
  getLabSettlementPending
);

router.get(
  "/lab/history",
  protect,
  authorizePermissions("settlements", "read"),
  getLabSettlementHistory
);

router.get(
  "/lab/details/:batchId",
  protect,
  authorizePermissions("settlements", "read"),
  getSettlementDetails
);

router.patch(
  "/verify/:bookingId",
  protect,
  authorizePermissions("settlements", "update"),
  verifySettlement
);

router.patch(
  "/verify-bulk/:batchId",
  protect,
  authorizePermissions("settlements", "update"),
  verifyBulkSettlement
);

export default router;
