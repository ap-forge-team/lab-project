import mongoose from "mongoose";

const paymentSettingSchema = new mongoose.Schema(
  {
    qrImage: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      default: "",
    },
    upiId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PaymentSetting", paymentSettingSchema);
