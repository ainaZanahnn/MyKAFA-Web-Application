import { Request, Response, NextFunction } from "express";

export const uploadErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // PDF validation error
  if (err.message === "ONLY_PDF_ALLOWED") {
    return res.status(400).json({
      success: false,
      message: "Hanya fail PDF dibenarkan.",
    });
  }

  // Multer file size limit etc (optional)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Saiz fail terlalu besar.",
    });
  }

  // Pass unknown errors forward
  return next(err);
};
