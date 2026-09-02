import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { authorizePermissions } from "../middleware/roleMiddleware.js";
import {
  createBooking,
  getMyBookings,
  uploadReport,
  getAllBookings,
  getLabOwnerBookings,
  assignAssistant,
  getAssignedBookings,
  markReached,
  uploadSample,
  markPaymentDone,
  searchAssignedBookings,
  searchLabOwnerBookings,
  cancelBooking,
  updateBookingRequest,
  updateBookingLab,
  getAllLabOwners,
  addTestsToBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

/* -------- PATIENT -------- */

router.post(
  "/",
  protect,
  authorizePermissions("bookings", "create"),
  createBooking
);

router.get(
  "/my-bookings",
  protect,
  authorizePermissions("bookings", "read"),
  getMyBookings
);

router.put(
  "/cancel/:id",
  protect,
  authorizePermissions("bookings", "update"),
  cancelBooking
);

router.put(
  "/manage/:id",
  protect,
  authorizePermissions("bookings", "update"),
  updateBookingRequest
);

/* -------- ADMIN -------- */

router.get(
  "/all",
  protect,
  authorizePermissions("bookings", "read"),
  getAllBookings
);

router.put(
  "/update-booking-lab/:bookingId",
  protect,
  authorizePermissions("bookings", "update"),
  updateBookingLab
);

router.get(
  "/lab-owners",
  protect,
  authorizePermissions("users", "read"),
  getAllLabOwners
);

/* -------- LAB OWNER -------- */

router.get(
  "/lab-owner",
  protect,
  authorizePermissions("bookings", "read"),
  getLabOwnerBookings
);

router.put(
  "/assign-assistant",
  protect,
  authorizePermissions("bookings", "update"),
  assignAssistant
);

router.put(
  "/upload-report/:id",
  protect,
  authorizePermissions("reports", "create"),
  upload.single("report"),
  uploadReport
);

router.get(
  "/lab-owner/search",
  protect,
  authorizePermissions("bookings", "read"),
  searchLabOwnerBookings
);

/* -------- LAB ASSISTANT -------- */

router.get(
  "/assigned",
  protect,
  authorizePermissions("bookings", "read"),
  getAssignedBookings
);

router.get(
  "/assigned/search",
  protect,
  authorizePermissions("bookings", "read"),
  searchAssignedBookings
);

router.put(
  "/reached/:id",
  protect,
  authorizePermissions("bookings", "update"),
  markReached
);

router.put(
  "/add-tests/:id",
  protect,
  authorizePermissions("bookings", "update"),
  addTestsToBooking
);

router.put(
  "/sample/:id",
  protect,
  authorizePermissions("bookings", "update"),
  upload.array("sampleImages", 10),
  uploadSample
);

router.put(
  "/payment/:id",
  protect,
  authorizePermissions("payments", "create"),
  upload.single("receipt"),
  markPaymentDone
);

export default router;
