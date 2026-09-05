import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import crypto from "crypto";
import cloudinary from "../services/storage.service.ts";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const filename = crypto.randomBytes(12).toString("hex");
    return {
      folder: "Medicall_Fundus_Scans",
      allowed_formats: ["png", "jpg", "jpeg"],
      public_id: filename,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

export default upload;
