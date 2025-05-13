import express from "express";
import {
  registerAdvertiser,
  loginAdvertiser,
  getAllAdvertisers,
  getAdvertiserById,
  getAdvertiserByUsername,
  updateAdvertiserByUsername,
  deleteAdvertiser,
  getAdvertiserActivities,
  changePassword,
  getAdvertiserSalesReport,
  getTouristReport,
  sendPasswordResetOtp,
  resetPassword,
  verifyPasswordResetOtp,
} from "../controllers/advertiser.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import uploadMiddleware from "../utils/upload.js";

const router = express.Router();

// Required files configuration for both registration and update
const documentUpload = uploadMiddleware.fields([
  { name: "businessLicense", maxCount: 1 },
  { name: "identificationDocument", maxCount: 1 },
]);

// Public routes (no authentication required)
router.post("/register", documentUpload, registerAdvertiser);
router.post("/login", loginAdvertiser);
router.get("/all", getAllAdvertisers);

// Protected routes (requires authentication)
// Profile routes
router.get("/profile/:username", authMiddleware, getAdvertiserByUsername);
router.put(
  "/profile/:username",
  authMiddleware,
  documentUpload,
  updateAdvertiserByUsername
);
router.put("/change-password", authMiddleware, changePassword);

// Activities route
router.get("/activities/my", authMiddleware, getAdvertiserActivities);
router.post("/forgot-password/send-otp", sendPasswordResetOtp);
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPassword);
// ID-based routes
router.get("/:id", authMiddleware, getAdvertiserById);
router.delete("/:id", authMiddleware, deleteAdvertiser);
router.get("/sales-report/:id", authMiddleware, getAdvertiserSalesReport);
// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      message: "File upload error",
      error: error.message,
    });
  } else if (error) {
    return res.status(400).json({
      message: "Invalid file type. Only images and PDFs are allowed",
      error: error.message,
    });
  }
  next();
});

router.get("/:id/tourist-report", getTouristReport);




export default router;
