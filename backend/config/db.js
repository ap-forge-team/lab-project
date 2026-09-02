import mongoose from "mongoose";
import logger from "../Utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info("MongoDB Connected");
  } catch (err) {
    logger.error("MongoDB Connection Failed", { message: err.message });

    process.exit(1);
  }
};

export default connectDB;
