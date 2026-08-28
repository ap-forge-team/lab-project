import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "patient",
    },
    labOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    labAddress: {
      type: String,
      required: function () {
        return this.role === "lab_owner";
      },
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    serviceRadius: {
      type: Number,
      default: 10,
    },
    document: {
      type: String,
    },
    servicePincodes: {
      type: [String],
      default: [],
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
