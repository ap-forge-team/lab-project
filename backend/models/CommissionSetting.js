import mongoose from "mongoose";

const commissionSettingSchema = new mongoose.Schema(
  {
    commissionType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      default: "Percentage"
    },

    commissionValue: {
      type: Number,
      required: true,
      default: 10
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "CommissionSetting",
  commissionSettingSchema
);
