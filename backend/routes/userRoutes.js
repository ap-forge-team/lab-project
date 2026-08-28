import express from "express";

const router = express.Router();

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";

import {
  getMyAssistants,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

/* -------- LAB OWNER - User Management -------- */

router.get(
  "/my-assistants",
  protect,
  authorizePermissions("users", "read"),
  getMyAssistants
);

/* -------- ADMIN - User Management -------- */

router.get(
  "/",
  protect,
  authorizePermissions("users", "read"),
  getAllUsers
);

router.get(
  "/:id",
  protect,
  authorizePermissions("users", "read"),
  getSingleUser
);

router.put(
  "/:id",
  protect,
  authorizePermissions("users", "update"),
  updateUser
);

router.delete(
  "/:id",
  protect,
  authorizePermissions("users", "delete"),
  deleteUser
);

export default router;
