import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import { seedRoles } from "./seeder/roleSeeder.js";
import { seedAdmin } from "./seeder/userSeeder.js";

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminSetupRoute from "./routes/adminSetupRoute.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import forgotPasswordRoute from "./routes/forgotePasswordRoute.js";
import paymentSettingRoutes from "./routes/paymentSettingRoutes.js";
import paymentStatisticRoutes from "./routes/paymentStatistic.js";
import roleRoutes from "./routes/roleRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";
import paymentSettlementRoute from "./routes/paymentSettlementRoute.js";
import exportSettlementHistoryRoute from "./routes/exportSettlementHistoryRoute.js";

const app = express();

/* ---------- Database ---------- */

await connectDB();
await seedRoles();
await seedAdmin();

/* ---------- Middleware ---------- */

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

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/commission", commissionRoutes);
app.use("/api/payment-settlement", paymentSettlementRoute);
app.use("/api/export", exportSettlementHistoryRoute);

/* ---------- 404 ---------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* ---------- Error Handler ---------- */

app.use((err, req, res, next) => {
  console.error(err);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(err.status || 500).json({
    success: false,
    message,
  });
});

/* ---------- Process Error Handlers ---------- */

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

/* ---------- Server ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
