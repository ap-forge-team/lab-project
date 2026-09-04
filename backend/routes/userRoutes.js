import express from "express";

const router = express.Router();

import protect from "../middleware/authMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import labDocumentUpload from "../middleware/labDocumentUpload.js";

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

router.get(
  "/my-assistants/:id",
  protect,
  authorizePermissions("users", "read"),
  getSingleUser
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
  labDocumentUpload.fields([
    { name: "labCertificate", maxCount: 1 },
    { name: "labRegistration", maxCount: 1 },
    { name: "otherDocuments", maxCount: 5 },
    { name: "idProof", maxCount: 1 },
  ]),
  updateUser
);

router.delete(
  "/:id",
  protect,
  authorizePermissions("users", "delete"),
  deleteUser
);

export default router;
