import Booking from "../models/Booking.js";
import CommissionSetting from "../models/CommissionSetting.js";
import User from "../models/User.js";
import Test from "../models/Test.js";
import { getDistance } from "geolib";
import crypto from "crypto";
import logger from "../Utils/logger.js";
import MESSAGES from "../Utils/messages.js";

export const createBooking = async (req, res) => {
  try {
    const {
      test,
      package: packageId,
      patientName,
      age,
      gender,
      phone,
      flatNo,
      landmark,
      city,
      pincode,
      address,
      bookingDate,
      bookingTime,
      latitude,
      longitude,
    } = req.body;

    if (
      (!test && !packageId) ||
      !patientName ||
      !age ||
      !gender ||
      !phone ||
      !flatNo ||
      !city ||
      !pincode ||
      !address ||
      !bookingDate ||
      !bookingTime
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields Are Required",
      });
    }

    if (patientName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Patient Name Must Be At Least 3 Characters",
      });
    }

    if (age < 1 || age > 99) {
      return res.status(400).json({
        success: false,
        message: "Age Must Be Between 1 and 99",
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter Valid 10 Digit Phone Number",
      });
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Enter Valid 6 Digit Pincode",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Booking Date Cannot Be In Past",
      });
    }

    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Gender Selected",
      });
    }

    const labOwners = await User.find({ role: "lab_owner" });

    let nearestLab = null;
    let nearestDistance = Infinity;
    const MAX_DISTANCE = 10000;

    if (labOwners.length) {
      for (const lab of labOwners) {
        if (!lab.latitude || !lab.longitude) continue;

        const distance = getDistance(
          { latitude, longitude },
          { latitude: lab.latitude, longitude: lab.longitude }
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestLab = lab;
        }
      }
    }

    const labFound = nearestLab && nearestDistance <= MAX_DISTANCE;

    const bookingData = {
      user: req.user._id,
      patientName,
      age,
      gender,
      phone,
      flatNo,
      landmark,
      city,
      pincode,
      address,
      bookingDate,
      bookingTime,
      labOwner: labFound ? nearestLab._id : null,
      assignedDistance: labFound ? nearestDistance : 0,
      patientLatitude: latitude,
      patientLongitude: longitude,
      location: { latitude, longitude },
      reportId: "REP-" + crypto.randomInt(100000, 999999),
    };

    if (test) bookingData.test = test;
    if (packageId) bookingData.package = packageId;

    const booking = await Booking.create(bookingData);

    if (test) {
      const testDoc = await Test.findById(test);
      if (testDoc) {
        booking.totalAmount = testDoc.offerPrice || testDoc.price;
        await booking.save();
      }
    } else if (packageId) {
      const Package = (await import("../models/Package.js")).default;
      const pkg = await Package.findById(packageId);
      if (pkg) {
        booking.totalAmount = pkg.offerPrice || pkg.price;
        await booking.save();
      }
    }

    res.status(201).json({
      success: true,
      message: labFound
        ? "Booking Created Successfully"
        : "Booking Created Successfully. No lab found within 10 km. We will assign a lab.",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("test", "title price")
      .populate("package", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const uploadReport = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No File Uploaded",
      });
    }
    booking.report = req.file.path;
    booking.status = "Completed";
    booking.assignedLabAssistant = req.user._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Report Uploaded Successfully",
      reportUrl: booking.report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("test")
      .populate("user")
      .populate("package")
      .populate("assignedLabAssistant", "name email")
      .populate("labOwner", "name email labAddress")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getLabOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ labOwner: req.user._id })
      .populate("test")
      .populate("package")
      .populate("user")
      .populate("assignedLabAssistant", "name email");

    bookings.sort((a, b) => {
      const aCompleted = a.status === "Completed";
      const bCompleted = b.status === "Completed";

      if (!aCompleted && bCompleted) return -1;
      if (aCompleted && !bCompleted) return 1;

      const aDate = new Date(a.bookingDate);
      const bDate = new Date(b.bookingDate);

      if (aDate.getTime() !== bDate.getTime()) {
        return aDate - bDate;
      }

      return (a.bookingTime || "").localeCompare(b.bookingTime || "");
    });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const assignAssistant = async (req, res) => {
  try {
    const { bookingId, assistantId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.labOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const assistant = await User.findById(assistantId);
    if (!assistant) {
      return res.status(400).json({
        success: false,
        message: "Invalid Assistant",
      });
    }

    if (assistant.labOwner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Assistant Does Not Belong To Your Lab",
      });
    }

    booking.assignedLabAssistant = assistantId;
    booking.status = "Assigned";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Assistant Assigned Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAssignedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      assignedLabAssistant: req.user._id,
    })
      .populate("test", "title price")
      .populate("package", "title price")
      .populate("user");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    bookings.sort((a, b) => {
      const aDate = new Date(a.bookingDate);
      const bDate = new Date(b.bookingDate);

      const aCompleted = a.status === "Completed";
      const bCompleted = b.status === "Completed";

      if (!aCompleted && bCompleted) return -1;
      if (aCompleted && !bCompleted) return 1;

      const aToday = aDate.getTime() === today.getTime();
      const bToday = bDate.getTime() === today.getTime();

      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;

      if (aDate.getTime() !== bDate.getTime()) {
        return aDate - bDate;
      }

      return (a.bookingTime || "").localeCompare(b.bookingTime || "");
    });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const markReached = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.assignedLabAssistant?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    booking.status = "Reached";
    booking.reachedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Assistant Reached Patient Home",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const uploadSample = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.assignedLabAssistant?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one sample image",
      });
    }

    booking.sampleImages = req.files.map((file) => file.path);
    booking.sampleId = "SMP-" + crypto.randomInt(100000, 999999);
    booking.sampleCollectedAt = new Date();
    booking.assistantNotes = req.body.assistantNotes;
    booking.status = "Sample Collected";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Sample Uploaded Successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const markPaymentDone = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("test", "price")
      .populate("package", "price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.assignedLabAssistant?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload payment receipt.",
      });
    }

    const commissionSetting = await CommissionSetting.findOne({ isActive: true });

    if (!commissionSetting) {
      return res.status(400).json({
        success: false,
        message: "Commission setting not found.",
      });
    }

    const amount = booking.test?.price || booking.package?.price || 0;

    booking.paymentAmount = amount;
    booking.amountReceived = amount;
    booking.commissionType = commissionSetting.commissionType;
    booking.commissionValue = commissionSetting.commissionValue;

    let commissionAmount = 0;

    if (commissionSetting.commissionType === "Percentage") {
      commissionAmount = (amount * commissionSetting.commissionValue) / 100;
    } else {
      commissionAmount = commissionSetting.commissionValue;
      if (commissionAmount > amount) commissionAmount = amount;
    }

    booking.systemCommission = Number(commissionAmount.toFixed(2));
    booking.labShare = Number((amount - commissionAmount).toFixed(2));
    booking.paymentScreenshot = req.file.path;
    booking.paymentStatus = "Paid";
    booking.labPaymentStatus = "Pending";
    booking.paidAt = new Date();
    booking.status = "Processing";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment completed successfully.",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const searchAssignedBookings = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const bookings = await Booking.find({
      assignedLabAssistant: req.user._id,
    })
      .populate("test", "title price")
      .populate("package", "title price")
      .populate("user");

    const searchText = search.toLowerCase();

    const filteredBookings = bookings.filter((booking) => {
      return (
        booking.patientName?.toLowerCase().includes(searchText) ||
        booking.phone?.includes(search) ||
        booking.test?.title?.toLowerCase().includes(searchText) ||
        booking.package?.title?.toLowerCase().includes(searchText)
      );
    });

    res.status(200).json({
      success: true,
      bookings: filteredBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const searchLabOwnerBookings = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const bookings = await Booking.find({ labOwner: req.user._id })
      .populate("test", "title price")
      .populate("package", "title price")
      .populate("user")
      .populate("assignedLabAssistant", "name email");

    const searchText = search.toLowerCase();

    const filtered = bookings.filter((booking) => {
      return (
        booking.patientName?.toLowerCase().includes(searchText) ||
        booking.phone?.includes(search) ||
        booking.test?.title?.toLowerCase().includes(searchText) ||
        booking.package?.title?.toLowerCase().includes(searchText) ||
        booking.assignedLabAssistant?.name?.toLowerCase().includes(searchText)
      );
    });

    res.status(200).json({
      success: true,
      bookings: filtered,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled",
      });
    }

    booking.status = "Cancelled";
    booking.cancelReason = reason;
    booking.cancelledBy = "patient";
    booking.cancelledAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking Cancelled Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateBookingRequest = async (req, res) => {
  try {
    const { action, reason, bookingDate, bookingTime } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be modified",
      });
    }

    if (action === "cancel") {
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason required",
        });
      }

      booking.status = "Cancelled";
      booking.cancelReason = reason;
      booking.cancelledBy = "patient";
      booking.cancelledAt = new Date();

      await booking.save();

      return res.status(200).json({
        success: true,
        message: "Booking Cancelled Successfully",
      });
    }

    if (action === "reschedule") {
      if (!bookingDate || !bookingTime) {
        return res.status(400).json({
          success: false,
          message: "New Date and Time Required",
        });
      }

      booking.oldBookingDate = booking.bookingDate;
      booking.oldBookingTime = booking.bookingTime;
      booking.bookingDate = bookingDate;
      booking.bookingTime = bookingTime;
      booking.rescheduleReason = reason || "";
      booking.rescheduledAt = new Date();
      booking.status = "Rescheduled";

      await booking.save();

      return res.status(200).json({
        success: true,
        message: "Booking Rescheduled Successfully",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Action",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateBookingLab = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { labOwnerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    const labOwner = await User.findOne({ _id: labOwnerId, role: "lab_owner" });
    if (!labOwner) {
      return res.status(404).json({
        success: false,
        message: "Lab Owner Not Found",
      });
    }

    booking.labOwner = labOwnerId;
    booking.assignedLabAssistant = null;

    if (booking.patientLatitude && booking.patientLongitude && labOwner.latitude && labOwner.longitude) {
      booking.assignedDistance = getDistance(
        { latitude: booking.patientLatitude, longitude: booking.patientLongitude },
        { latitude: labOwner.latitude, longitude: labOwner.longitude }
      );
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Lab Assigned Successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllLabOwners = async (req, res) => {
  try {
    const labOwners = await User.find({ role: "lab_owner" }).select(
      "name email labAddress"
    );

    res.status(200).json({
      success: true,
      labOwners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const addTestsToBooking = async (req, res) => {
  try {
    const { testIds } = req.body;

    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one test ID",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found",
      });
    }

    if (booking.assignedLabAssistant?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status !== "Reached") {
      return res.status(400).json({
        success: false,
        message: "Tests can only be added when status is Reached",
      });
    }

    const tests = await Test.find({ _id: { $in: testIds } });

    if (tests.length !== testIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more test IDs are invalid",
      });
    }

    const newTests = tests.map((t) => ({
      test: t._id,
      price: t.offerPrice || t.price,
    }));

    booking.additionalTests.push(...newTests);

    const additionalTotal = newTests.reduce((sum, t) => sum + t.price, 0);
    booking.totalAmount = (booking.totalAmount || 0) + additionalTotal;

    await booking.save();

    const populated = await booking.populate("additionalTests.test", "title price");

    res.status(200).json({
      success: true,
      message: "Tests added successfully",
      booking: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
