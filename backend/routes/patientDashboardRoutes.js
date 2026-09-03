import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import { getPatientDashboardStats } from "../controllers/patientDashboardController.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  protect,
  authorizePermissions("bookings", "read"),
  getPatientDashboardStats
);

export default router;
