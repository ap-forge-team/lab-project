import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import { exportSettlementHistory } from "../controllers/exportSettlementHistory.js";

const router = express.Router();

router.get("/settlement-history", protect, authorizePermissions("settlements", "read"), exportSettlementHistory);

export default router;
