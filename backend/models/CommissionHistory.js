import mongoose from "mongoose";

const commissionHistorySchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    labOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    commissionPercent: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    settlementStatus: {
      type: String,
      enum: ["pending", "settled"],
      default: "pending",
    },
    settledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const CommissionHistory = mongoose.model("CommissionHistory", commissionHistorySchema);

export default CommissionHistory;
