/** @format */

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "upkk-papers",
      resource_type: "raw", // REQUIRED for PDF
      format: "pdf",
    };
  },
});

const upload = multer({ storage });

export default upload;
