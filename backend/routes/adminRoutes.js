import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import labDocumentUpload from "../middleware/labDocumentUpload.js";
import {
  createLabAssistant,
  createLabOwner,
  getLabOwners,
} from "../controllers/adminController.js";
import { getAdminDashboardStats } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  protect,
  authorizePermissions("bookings", "read"),
  getAdminDashboardStats
);

router.post(
  "/create-lab-assistant",
  protect,
  authorizePermissions("users", "create"),
  labDocumentUpload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "otherDocuments", maxCount: 5 },
  ]),
  createLabAssistant
);

router.post(
  "/create-lab-owner",
  protect,
  authorizePermissions("users", "create"),
  labDocumentUpload.fields([
    { name: "labCertificate", maxCount: 1 },
    { name: "labRegistration", maxCount: 1 },
    { name: "otherDocuments", maxCount: 5 },
  ]),
  createLabOwner
);

router.get(
  "/lab-owners",
  protect,
  authorizePermissions("users", "read"),
  getLabOwners
);

export default router;
