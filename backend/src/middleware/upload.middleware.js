import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_DIR = path.resolve(__dirname, "../../storage/documents");

// Ensure upload storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Configurable maximum file size in MB
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const safeFilename = `${uniqueId}.pdf`;
    cb(null, safeFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdfExt = ext === ".pdf";
  const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";

  if (isPdfExt && isPdfMime) {
    cb(null, true);
  } else {
    const error = new Error("INVALID_FILE_TYPE");
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

/**
 * Middleware handling single PDF upload with standardized error responses.
 */
export function uploadSinglePdf(req, res, next) {
  const uploadHandler = upload.single("file");

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error: "Payload Too Large",
            message: `File size exceeds the configured limit of ${MAX_FILE_SIZE_MB}MB`,
          });
        }
        return res.status(400).json({
          error: "Upload Error",
          message: err.message,
        });
      }

      if (err.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({
          error: "Invalid file type",
          message: "Only PDF documents (.pdf) with MIME type 'application/pdf' are supported",
        });
      }

      return res.status(400).json({
        error: "Upload Error",
        message: err.message || "Failed to process uploaded file",
      });
    }

    next();
  });
}

export default uploadSinglePdf;
