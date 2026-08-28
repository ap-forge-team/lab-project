import express from "express";
import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  createLabAssistant,
  createLabOwner,
  getLabOwners,
} from "../controllers/adminController.js";

const router = express.Router();

router.post(
  "/create-lab-assistant",
  protect,
  authorizePermissions("users", "create"),
  createLabAssistant
);

router.post(
  "/create-lab-owner",
  protect,
  authorizePermissions("users", "create"),
  createLabOwner
);

router.get(
  "/lab-owners",
  protect,
  authorizePermissions("users", "read"),
  getLabOwners
);

export default router;
