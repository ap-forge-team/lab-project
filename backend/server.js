import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import { seedRoles } from "./seeder/roleSeeder.js";
import { seedAdmin } from "./seeder/userSeeder.js";
import logger from "./Utils/logger.js";
import requestLogger from "./middleware/requestLogger.js";

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminSetupRoute from "./routes/adminSetupRoute.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import forgotPasswordRoute from "./routes/forgotPasswordRoute.js";
import paymentSettingRoutes from "./routes/paymentSettingRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";
import paymentStatisticRoutes from "./routes/paymentStatistic.js";
import exportSettlementHistoryRoute from "./routes/exportSettlementHistoryRoute.js";
import paymentSettlementRoute from "./routes/paymentSettlementRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";

/* ---------- Env Validation ---------- */

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "SALT_KEY", "MERCHANT_ID"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

/* ---------- Database ---------- */

await connectDB();
await seedRoles();
await seedAdmin();

/* ---------- Security Middleware ---------- */

app.use(helmet());

/* ---------- CORS ---------- */

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    credentials: true,
  })
);

/* ---------- Body Parsing ---------- */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));


/* ---------- Custom Mongo Sanitize ---------- */
const sanitize = (obj) => {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  }
  if (Array.isArray(obj)) {
    obj.forEach((item) => sanitize(item));
  }
};

app.use((req, res, next) => {
  sanitize(req.body);
  sanitize(req.params);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later" },
});
app.use("/api/auth/", authLimiter);
app.use("/api/pass/", authLimiter);


/* ---------- Request Logger ---------- */

app.use(requestLogger);

/* ---------- Health ---------- */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Running Successfully",
  });
});

/* ---------- Routes ---------- */

app.use("/api/setup", adminSetupRoute);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/pass", forgotPasswordRoute);
app.use("/api/payment-setting", paymentSettingRoutes);
app.use("/api/payment-statistic", paymentStatisticRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/export", exportSettlementHistoryRoute);
app.use("/api/settlements", paymentSettlementRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);

/* ---------- 404 ---------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* ---------- Error Handler ---------- */

app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(err.status || 500).json({
    success: false,
    message,
  });
});

/* ---------- Process Error Handlers (Winston handles these too, but kept as safety net) ---------- */

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    message: reason?.message || String(reason),
    stack: reason?.stack,
    type: reason?.name || typeof reason,
  });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    message: err.message,
    stack: err.stack,
    type: err.name,
  });
  process.exit(1);
});

/* ---------- Server ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || "development" });
});

export default app;
