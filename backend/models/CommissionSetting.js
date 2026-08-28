import mongoose from "mongoose";

const commissionSettingSchema = new mongoose.Schema(
  {
    labOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commissionPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CommissionSetting = mongoose.model("CommissionSetting", commissionSettingSchema);

export default CommissionSetting;
