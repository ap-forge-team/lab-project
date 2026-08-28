import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;
const { align, cli } = winston.format;

/* ---------- Constants ---------- */

const LOG_DIR = process.env.LOG_DIR || "logs";
const SERVICE_NAME = process.env.SERVICE_NAME || "lab-booking-api";
const NODE_ENV = process.env.NODE_ENV || "development";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const SENSITIVE_FIELDS = [
  "password",
  "passwordConfirm",
  "oldPassword",
  "newPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "secret",
  "jwt_secret",
  "salt_key",
  "merchant_id",
  "api_key",
  "apiKey",
  "creditCard",
  "cardNumber",
  "cvv",
  "otp",
];

/* ---------- Helpers ---------- */

const maskSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitive(item));
  }

  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((f) => lowerKey.includes(f.toLowerCase()))) {
      if (typeof masked[key] === "string" && masked[key].length > 4) {
        masked[key] = masked[key].slice(0, 2) + "****" + masked[key].slice(-2);
      } else if (typeof masked[key] === "string") {
        masked[key] = "****";
      }
    } else if (typeof masked[key] === "object") {
      masked[key] = maskSensitive(masked[key]);
    }
  }
  return masked;
};

/* ---------- Formats ---------- */

const consoleFormat = printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
  let log = `${timestamp} [${level}]`;
  if (requestId) log += ` [${requestId}]`;
  log += `: ${message}`;
  if (stack) log += `\n${stack}`;
  if (Object.keys(meta).length > 0) {
    const masked = maskSensitive(meta);
    log += ` ${JSON.stringify(masked)}`;
  }
  return log;
});

const fileFormat = printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
  const logData = {
    timestamp,
    level,
    message,
    ...(requestId && { requestId }),
    ...(stack && { stack }),
  };
  if (Object.keys(meta).length > 0) {
    Object.assign(logData, maskSensitive(meta));
  }
  return JSON.stringify(logData);
});

/* ---------- Transports ---------- */

const transports = [];

// Error log — daily rotation, 30 days retention, 20MB max size
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "30d",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), fileFormat),
  })
);

// Combined log — daily rotation, 30 days retention, 20MB max size
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), fileFormat),
  })
);

// HTTP access log — daily rotation, 30 days retention
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, "access-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "http",
    maxSize: "20m",
    maxFiles: "14d",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), fileFormat),
  })
);

// Console — always enabled, colorized in dev, JSON in production
if (NODE_ENV === "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), json()),
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss.SSS" }),
        align(),
        consoleFormat
      ),
    })
  );
}

/* ---------- Logger ---------- */

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: SERVICE_NAME, env: NODE_ENV },
  transports,
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), fileFormat),
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), fileFormat),
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), fileFormat),
    }),
  ],
  exitOnError: false,
});

/* ---------- Child Logger ---------- */

logger.child = (meta) => {
  const childLogger = winston.createLogger({
    level: LOG_LEVEL,
    defaultMeta: { ...logger.defaultMeta, ...meta },
    transports: logger.transports.map((t) => {
      if (t instanceof DailyRotateFile || t instanceof winston.transports.Console) {
        return t;
      }
      return t;
    }),
    exceptionHandlers: logger.exceptionHandlers,
    rejectionHandlers: logger.rejectionHandlers,
    exitOnError: false,
  });

  // Copy format from parent
  childLogger.format = logger.format;

  return childLogger;
};

/* ---------- Stream (for Morgan integration) ---------- */

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;
