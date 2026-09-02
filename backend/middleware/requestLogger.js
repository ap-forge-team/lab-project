import { randomUUID } from "crypto";
import logger from "../Utils/logger.js";

const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS, 10) || 3000;
const LOGRequestBody = process.env.LOG_REQUEST_BODY === "true";

const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return body;

  const sensitive = ["password", "passwordConfirm", "oldPassword", "newPassword", "token", "otp"];
  const sanitized = { ...body };

  for (const key of Object.keys(sanitized)) {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "****";
    }
  }
  return sanitized;
};

const requestLogger = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || randomUUID();
  const start = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const reqLog = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers["user-agent"],
    contentType: req.headers["content-type"],
    userId: req.user?._id || null,
  };

  if (LOGRequestBody && req.body && Object.keys(req.body).length > 0) {
    reqLog.body = sanitizeBody(req.body);
  }

  logger.info("Incoming request", reqLog);

  res.on("finish", () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationMs = Number(durationNs / 1000000n);

    const resLog = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userId: req.user?._id || null,
    };

    if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn("Slow request detected", resLog);
    }

    if (res.statusCode >= 500) {
      logger.error("Request error", resLog);
    } else if (res.statusCode >= 400) {
      logger.warn("Request client error", resLog);
    } else if (res.statusCode >= 300) {
      logger.http("Request redirect", resLog);
    } else {
      logger.http("Request completed", resLog);
    }
  });

  next();
};

export default requestLogger;
