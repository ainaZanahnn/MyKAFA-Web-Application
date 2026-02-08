import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // PDF validation
    if (file.mimetype !== "application/pdf") {
      throw new Error("ONLY_PDF_ALLOWED");
    }

    return {
      folder: "upkk-papers",
      resource_type: "raw", // IMPORTANT for PDFs
      format: "pdf",
    };
  },
});

export const upload = multer({ storage });
