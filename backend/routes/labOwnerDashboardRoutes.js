import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import { getLabOwnerDashboardStats } from "../controllers/labOwnerDashboardController.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  protect,
  authorizePermissions("bookings", "read"),
  getLabOwnerDashboardStats
);

export default router;
