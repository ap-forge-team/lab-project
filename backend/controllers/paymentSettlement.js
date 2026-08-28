import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import crypto from "crypto";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";

export const getSettlementStatistics = async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: "Paid" });

    const statistics = {
      totalRevenue: 0,
      systemCommission: 0,
      totalLabShare: 0,
      pendingSettlement: 0,
      sentSettlement: 0,
      verifiedSettlement: 0,
      totalTransactions: bookings.length,
    };

    bookings.forEach((booking) => {
      statistics.totalRevenue += booking.paymentAmount;
      statistics.systemCommission += booking.systemCommission;
      statistics.totalLabShare += booking.labShare;

      if (booking.labPaymentStatus === "Pending") {
        statistics.pendingSettlement += booking.labShare;
      }
      if (booking.labPaymentStatus === "Sent") {
        statistics.sentSettlement += booking.labShare;
      }
      if (booking.labPaymentStatus === "Verified") {
        statistics.verifiedSettlement += booking.labShare;
      }
    });

    res.json({ success: true, statistics });
  } catch (error) {
    logger.error("Get settlement statistics error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const getSettlementList = async (req, res) => {
  try {
    const { status, labOwner } = req.query;

    const filter = {
      paymentStatus: "Paid",
      status: "Completed",
    };

    if (status) {
      filter.labPaymentStatus = status;
    } else {
      filter.labPaymentStatus = "Pending";
    }

    if (labOwner) {
      filter.labOwner = labOwner;
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name")
      .populate("labOwner", "name")
      .populate("test", "title")
      .populate("package", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    logger.error("Get settlement list error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const sendSettlement = async (req, res) => {
  try {
    const { utr, bankName, remark } = req.body;
    const paymentProof = req.file?.path || "";

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: MESSAGES.SETTLEMENT.BOOKING_NOT_FOUND });
    }

    if (booking.paymentStatus !== "Paid") {
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.CUSTOMER_PAYMENT_PENDING });
    }

    if (booking.labPaymentStatus !== "Pending") {
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.ALREADY_PROCESSED });
    }

    if (!utr || !utr.trim()) {
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.UTR_REQUIRED });
    }

    if (!bankName || !bankName.trim()) {
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.BANK_NAME_REQUIRED });
    }

    const existingUTR = await Booking.findOne({ settlementUTR: utr });
    if (existingUTR) {
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.UTR_EXISTS });
    }

    const batchId = "SET-" + crypto.randomUUID().split("-")[0].toUpperCase();

    booking.labPaymentStatus = "Sent";
    booking.labPaidAt = new Date();
    booking.labPaidBy = req.user._id;
    booking.settlementBatchId = batchId;
    booking.settlementUTR = utr.trim();
    booking.bankName = bankName.trim();
    booking.paymentProof = paymentProof;
    booking.settlementRemark = remark || "";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: MESSAGES.SETTLEMENT.SENT,
      booking,
    });
  } catch (error) {
    logger.error("Send settlement error", { message: error.message });
    return res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const getSettlementDetails = async (req, res) => {
  try {
    const bookings = await Booking.find({
      settlementBatchId: req.params.batchId,
    })
      .populate("user", "name")
      .populate("labOwner", "name")
      .populate("test", "title")
      .populate("package", "title");

    if (!bookings.length) {
      return res.status(404).json({ success: false, message: MESSAGES.SETTLEMENT.NOT_FOUND });
    }

    if (
      req.user.role !== "admin" &&
      bookings[0].labOwner?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: MESSAGES.UNAUTHORIZED });
    }

    const summary = {
      batchId: bookings[0].settlementBatchId,
      labOwner: bookings[0].labOwner?.name || "-",
      bankName: bookings[0].bankName || "-",
      utr: bookings[0].settlementUTR || "-",
      remark: bookings[0].settlementRemark || "",
      paymentProof: bookings[0].paymentProof || "",
      settledAt: bookings[0].labPaidAt,
      status: bookings[0].labPaymentStatus,
      totalBookings: bookings.length,
      totalAmount: bookings.reduce((sum, b) => sum + (b.paymentAmount || 0), 0),
      commission: bookings.reduce((sum, b) => sum + (b.systemCommission || 0), 0),
      labShare: bookings.reduce((sum, b) => sum + (b.labShare || 0), 0),
    };

    const bookingList = bookings.map((booking) => ({
      _id: booking._id,
      patientName: booking.patientName || booking.user?.name || "-",
      phone: booking.phone,
      test: booking.test,
      package: booking.package,
      paymentAmount: booking.paymentAmount,
      labShare: booking.labShare,
      commission: booking.systemCommission,
      paymentStatus: booking.paymentStatus,
      labPaymentStatus: booking.labPaymentStatus,
      createdAt: booking.createdAt,
    }));

    return res.status(200).json({ success: true, summary, bookings: bookingList });
  } catch (error) {
    logger.error("Get settlement details error", { message: error.message });
    return res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const getSettlementHistory = async (req, res) => {
  try {
    const history = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          settlementBatchId: { $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: "$settlementBatchId",
          settlementBatchId: { $first: "$settlementBatchId" },
          totalBookings: { $sum: 1 },
          totalAmount: { $sum: "$paymentAmount" },
          labShare: { $sum: "$labShare" },
          commission: { $sum: "$systemCommission" },
          labOwner: { $first: "$labOwner" },
          bankName: { $first: "$bankName" },
          utr: { $first: "$settlementUTR" },
          paymentProof: { $first: "$paymentProof" },
          remark: { $first: "$settlementRemark" },
          status: { $first: "$labPaymentStatus" },
          settledAt: { $first: "$labPaidAt" },
          patientName: { $first: "$patientName" },
          test: { $first: "$test" },
          package: { $first: "$package" },
        },
      },
      { $lookup: { from: "users", localField: "labOwner", foreignField: "_id", as: "labOwner" } },
      { $unwind: { path: "$labOwner", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "tests", localField: "test", foreignField: "_id", as: "test" } },
      { $unwind: { path: "$test", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          settlementType: {
            $cond: [{ $gt: ["$totalBookings", 1] }, "batch", "single"],
          },
        },
      },
      { $sort: { settledAt: -1 } },
    ]);

    res.status(200).json({ success: true, history });
  } catch (error) {
    logger.error("Get settlement history error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const bulkSettlement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { labOwnerId, bookingIds, utr, bankName, remark } = req.body;
    const paymentProof = req.file?.path || "";

    const existingUTR = await Booking.findOne({ settlementUTR: utr });
    if (existingUTR) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.UTR_EXISTS });
    }

    if (!labOwnerId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.LAB_OWNER_REQUIRED });
    }

    if (!bookingIds || bookingIds.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.SELECT_BOOKINGS });
    }

    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      labOwner: labOwnerId,
      paymentStatus: "Paid",
      labPaymentStatus: "Pending",
    }).session(session);

    const labOwnerIds = new Set(bookings.map((b) => b.labOwner.toString()));
    if (labOwnerIds.size > 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.DIFFERENT_LABS });
    }

    if (!bookings.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: MESSAGES.SETTLEMENT.NO_PENDING });
    }

    const batchId = "SET-" + Date.now();
    let totalAmount = 0;

    for (const booking of bookings) {
      totalAmount += booking.labShare;
      booking.labPaymentStatus = "Sent";
      booking.labPaidAt = new Date();
      booking.labPaidBy = req.user._id;
      booking.settlementUTR = utr;
      booking.bankName = bankName;
      booking.paymentProof = paymentProof;
      booking.settlementRemark = remark;
      booking.settlementBatchId = batchId;
      await booking.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: MESSAGES.SETTLEMENT.SENT_SUCCESS,
      batchId,
      totalBookings: bookings.length,
      totalAmount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error("Bulk settlement error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const verifySettlement = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: MESSAGES.SETTLEMENT.BOOKING_NOT_FOUND });
    }

    if (booking.labOwner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: MESSAGES.UNAUTHORIZED });
    }

    if (booking.labPaymentStatus !== "Sent") {
      return res.status(400).json({ success: false, message: MESSAGES.SETTLEMENT.NOT_READY_VERIFY });
    }

    booking.labPaymentStatus = "Verified";
    booking.labVerifiedAt = new Date();
    booking.labVerifiedBy = req.user._id;

    await booking.save();

    res.status(200).json({ success: true, message: MESSAGES.SETTLEMENT.VERIFIED, booking });
  } catch (error) {
    logger.error("Verify settlement error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const verifyBulkSettlement = async (req, res) => {
  try {
    const { batchId } = req.params;

    const bookings = await Booking.find({
      settlementBatchId: batchId,
      labOwner: req.user._id,
      labPaymentStatus: "Sent",
    });

    if (!bookings.length) {
      return res.status(404).json({ success: false, message: MESSAGES.SETTLEMENT.NOT_FOUND });
    }

    for (const booking of bookings) {
      booking.labPaymentStatus = "Verified";
      booking.labVerifiedAt = new Date();
      booking.labVerifiedBy = req.user._id;
      await booking.save();
    }

    res.json({ success: true, message: MESSAGES.SETTLEMENT.VERIFIED_SUCCESS });
  } catch (error) {
    logger.error("Verify bulk settlement error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const getLabSettlementHistory = async (req, res) => {
  try {
    const history = await Booking.aggregate([
      {
        $match: {
          labOwner: req.user._id,
          paymentStatus: "Paid",
          labPaymentStatus: "Verified",
          settlementBatchId: { $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: "$settlementBatchId",
          settlementBatchId: { $first: "$settlementBatchId" },
          totalBookings: { $sum: 1 },
          totalAmount: { $sum: "$paymentAmount" },
          labShare: { $sum: "$labShare" },
          commission: { $sum: "$systemCommission" },
          labOwner: { $first: "$labOwner" },
          bankName: { $first: "$bankName" },
          utr: { $first: "$settlementUTR" },
          paymentProof: { $first: "$paymentProof" },
          remark: { $first: "$settlementRemark" },
          status: { $first: "$labPaymentStatus" },
          settledAt: { $first: "$labPaidAt" },
          patientName: { $first: "$patientName" },
          test: { $first: "$test" },
          package: { $first: "$package" },
        },
      },
      { $lookup: { from: "users", localField: "labOwner", foreignField: "_id", as: "labOwner" } },
      { $unwind: { path: "$labOwner", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "tests", localField: "test", foreignField: "_id", as: "test" } },
      { $unwind: { path: "$test", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          settlementType: {
            $cond: [{ $gt: ["$totalBookings", 1] }, "batch", "single"],
          },
        },
      },
      { $sort: { settledAt: -1 } },
    ]);

    return res.status(200).json({ success: true, history });
  } catch (error) {
    logger.error("Get lab settlement history error", { message: error.message });
    return res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const getLabSettlementPending = async (req, res) => {
  try {
    const bookings = await Booking.find({
      labOwner: req.user._id,
      paymentStatus: "Paid",
      labPaymentStatus: "Sent",
    })
      .populate("user", "name")
      .populate("labOwner", "name")
      .populate("test", "title")
      .populate("package", "title")
      .sort({ labPaidAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    logger.error("Get lab settlement pending error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const getLabSettlementStatistics = async (req, res) => {
  try {
    const bookings = await Booking.find({
      labOwner: req.user._id,
      paymentStatus: "Paid",
    });

    const statistics = {
      pendingSettlement: 0,
      verifiedSettlement: 0,
      totalSettlement: 0,
      totalTransactions: 0,
    };

    bookings.forEach((booking) => {
      statistics.totalTransactions++;
      statistics.totalSettlement += booking.labShare || 0;

      if (booking.labPaymentStatus === "Sent") {
        statistics.pendingSettlement += booking.labShare || 0;
      }
      if (booking.labPaymentStatus === "Verified") {
        statistics.verifiedSettlement += booking.labShare || 0;
      }
    });

    res.status(200).json({ success: true, statistics });
  } catch (error) {
    logger.error("Get lab settlement statistics error", { message: error.message });
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};
