import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  createPaymentSetting,
  getPaymentSetting,
  updatePaymentSetting,
  deletePaymentSetting,
} from "../controllers/paymentSettingController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizePermissions("paymentSettings", "create"),
  upload.single("qrImage"),
  createPaymentSetting
);

router.get("/", protect, authorizePermissions("paymentSettings", "read"), getPaymentSetting);

router.put(
  "/",
  protect,
  authorizePermissions("paymentSettings", "update"),
  upload.single("qrImage"),
  updatePaymentSetting
);

router.delete("/", protect, authorizePermissions("paymentSettings", "delete"), deletePaymentSetting);

export default router;
