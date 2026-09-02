import express from "express";

import {
  exportSettlementHistory,
  exportLabSettlementHistory,
} from "../controllers/exportSettlementHistory.js";

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/history",
  protect,
  authorizePermissions("settlements", "read"),
  exportSettlementHistory
);

router.get(
  "/lab/history",
  protect,
  authorizePermissions("settlements", "read"),
  exportLabSettlementHistory
);

export default router;
