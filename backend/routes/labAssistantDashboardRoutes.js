import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import { getLabAssistantDashboardStats } from "../controllers/labAssistantDashboardController.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  protect,
  authorizePermissions("bookings", "read"),
  getLabAssistantDashboardStats
);

export default router;
