import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      unique: true,
    },

    shortName: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
     
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    offerPrice: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    reportTime: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    preparationInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    reportIncludes: {
      type: String,
      trim: true,
      default: "",
    },

    fastingRequired: {
      type: Boolean,
      default: false,
    },

    collectionMethod: {
      type: String,
      trim: true,
      default: "",
    },

    sampleType: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
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

const Test = mongoose.model(
  "Test",
  testSchema
);

export default Test;
