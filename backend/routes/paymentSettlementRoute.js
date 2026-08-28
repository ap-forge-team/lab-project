import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  getPendingSettlements,
  settlePayments,
  getSettlementHistory,
} from "../controllers/paymentSettlement.js";

const router = express.Router();

router.get("/pending", protect, authorizePermissions("settlements", "read"), getPendingSettlements);
router.post("/settle", protect, authorizePermissions("settlements", "update"), settlePayments);
router.get("/history", protect, authorizePermissions("settlements", "read"), getSettlementHistory);

export default router;
