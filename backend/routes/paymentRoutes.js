import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import { createPayment, checkPaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create", protect, authorizePermissions("payments", "create"), createPayment);

router.get("/status/:txnId", checkPaymentStatus);

export default router;
