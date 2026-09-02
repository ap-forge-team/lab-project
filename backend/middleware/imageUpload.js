import multer from "multer";
import path from "path";

import {
  CloudinaryStorage,
} from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".bmp",
];

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
];

const folderFromUrl = (req) => {
  const url = req.originalUrl || "";

  if (url.includes("/categories")) return "categories";
  if (url.includes("/packages")) return "packages";
  if (url.includes("/tests")) return "tests";

  return "images";
};

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!IMAGE_EXTENSIONS.includes(ext)) {
      const error = new Error(
        "Only image files are allowed: jpg, jpeg, png, webp, gif, svg, bmp"
      );
      error.code = "INVALID_IMAGE_TYPE";
      throw error;
    }

    const fileName = file.originalname
      .replace(ext, "")
      .replace(/\s+/g, "-");

    return {
      folder: folderFromUrl(req),
      resource_type: "image",
      type: "upload",
      public_id: `${Date.now()}-${fileName}`,
      format: ext.replace(".", ""),
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Only image files are allowed: jpg, jpeg, png, webp, gif, svg, bmp"
    );
    error.code = "INVALID_IMAGE_TYPE";
    cb(error, false);
  }
};

const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default imageUpload;
