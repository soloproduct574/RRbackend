import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const mediaUploadFields = multer({ storage }).fields([
  { name: "bannerImage", maxCount: 5 },
  { name: "normalImage", maxCount: 5 },
  { name: "photo", maxCount: 1 }, // payment photo
]);
