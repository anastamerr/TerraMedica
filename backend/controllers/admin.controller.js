import Admin from "../models/admin.model.js";
import TourGuide from "../models/tourGuide.model.js";
import Tourist from "../models/tourist.model.js";
import Advertiser from "../models/advertiser.model.js";
import Seller from "../models/seller.model.js";
import PromoCode from "../models/promoCode.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Booking from "../models/booking.model.js";
import ProductPurchase from "../models/productPurchase.model.js";
import Otp from "../models/otp.model.js";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

// Generate JWT Token with admin role
const generateToken = (admin) => {
  return jwt.sign(
    {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Register an Admin
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });
    if (existingAdmin) {
      return res.status(400).json({
        message:
          existingAdmin.email === email
            ? "Email already exists"
            : "Username already taken",
      });
    }

    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();
    const token = generateToken(newAdmin);

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering admin", error });
  }
};

// In admin.controller.js

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required" });
    }

    // Find the admin and explicitly select the password field
    const admin = await Admin.findById(_id).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Set new password (it will be hashed by the pre-save middleware)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
};
// Login an Admin
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");
    if (!admin) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(admin);
    return res.status(200).json({
      message: "Login successful",
      admin: { id: admin._id, username: admin.username, email: admin.email },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
};

// List all users (Protected Admin Route)
export const listAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    const [tourGuides, tourists, advertisers, sellers, admins] =
      await Promise.all([
        TourGuide.find({}).select("-password"),
        Tourist.find({}).select("-password"),
        Advertiser.find({}).select("-password"),
        Seller.find({}).select("-password"),
        Admin.find({}).select("-password"),
      ]);

    const allUsers = [
      ...tourGuides.map((user) => ({
        ...user.toObject(),
        userType: "Tour Guide",
      })),
      ...tourists.map((user) => ({ ...user.toObject(), userType: "Tourist" })),
      ...advertisers.map((user) => ({
        ...user.toObject(),
        userType: "Advertiser",
      })),
      ...sellers.map((user) => ({ ...user.toObject(), userType: "Seller" })),
      ...admins.map((user) => ({ ...user.toObject(), userType: "Admin" })),
    ];

    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

// Delete user (Protected Admin Route)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Admin access required" });
    }

    const { userId, userType } = req.body;
    let deletedUser;

    switch (userType.toLowerCase()) {
      case "tour guide":
        deletedUser = await TourGuide.findByIdAndDelete(userId);
        break;
      case "tourist":
        deletedUser = await Tourist.findByIdAndDelete(userId);
        break;
      case "advertiser":
        deletedUser = await Advertiser.findByIdAndDelete(userId);
        break;
      case "seller":
        deletedUser = await Seller.findByIdAndDelete(userId);
        break;
      case "admin":
        const adminCount = await Admin.countDocuments();
        if (adminCount <= 1) {
          return res
            .status(400)
            .json({ message: "Cannot delete the last admin account" });
        }
        deletedUser = await Admin.findByIdAndDelete(userId);
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser: {
        id: deletedUser._id,
        userType,
        email: deletedUser.email,
        username: deletedUser.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

// Get Admin Profile (Protected Route)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin profile", error });
  }
};

// Get unverified sellers
export const getUnverifiedSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ isVerified: false }).select(
      "username email createdAt businessLicense identificationDocument isVerified"
    );
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unverified advertisers
export const getUnverifiedAdvertisers = async (req, res) => {
  try {
    const advertisers = await Advertiser.find({ isVerified: false }).select(
      "username email createdAt businessLicense identificationDocument isVerified"
    );
    res.json(advertisers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unverified tour guides
export const getUnverifiedTourGuides = async (req, res) => {
  try {
    const tourGuides = await TourGuide.find({ isVerified: false }).select(
      "username email createdAt identificationDocument certificate isVerified"
    );
    res.json(tourGuides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify seller
export const verifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isVerified = isApproved;
    await seller.save();

    res.json({
      message: `Seller ${isApproved ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify advertiser
export const verifyAdvertiser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const advertiser = await Advertiser.findById(id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    advertiser.isVerified = isApproved;
    await advertiser.save();

    res.json({
      message: `Advertiser ${
        isApproved ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify tour guide
export const verifyTourGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const tourGuide = await TourGuide.findById(id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour guide not found" });
    }

    tourGuide.isVerified = isApproved;
    await tourGuide.save();

    res.json({
      message: `Tour guide ${
        isApproved ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPromoCode = async (req, res) => {
  const { code, discount, expiryDate, usageLimit } = req.body;

  if (!code || !discount || !expiryDate || !usageLimit) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if promo code already exists
    const existingPromoCode = await PromoCode.findOne({ code });
    if (existingPromoCode) {
      return res.status(400).json({ message: "Promo code already exists" });
    }

    // Create new promo code
    const newPromoCode = new PromoCode({
      code,
      discount,
      expiryDate,
      usageLimit,
    });

    await newPromoCode.save();
    res.status(201).json({
      message: "Promo code created successfully",
      promoCode: newPromoCode,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating promo code", error });
  }
};

// Update an existing promo code (Admin Only)
export const updatePromoCode = async (req, res) => {
  const { id } = req.params; // Promo code ID from URL
  const { code, discount, expiryDate, usageLimit, isActive } = req.body;

  try {
    // Find promo code by ID
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    // Update fields
    promoCode.code = code || promoCode.code;
    promoCode.discount = discount || promoCode.discount;
    promoCode.expiryDate = expiryDate || promoCode.expiryDate;
    promoCode.usageLimit = usageLimit || promoCode.usageLimit;
    promoCode.isActive = isActive !== undefined ? isActive : promoCode.isActive;

    await promoCode.save();
    res
      .status(200)
      .json({ message: "Promo code updated successfully", promoCode });
  } catch (error) {
    res.status(500).json({ message: "Error updating promo code", error });
  }
};

// Delete a promo code (Admin Only)
export const deletePromoCode = async (req, res) => {
  const { id } = req.params; // Promo code ID from URL

  try {
    // Find and delete the promo code by ID
    const promoCode = await PromoCode.findByIdAndDelete(id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.status(200).json({ message: "Promo code deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting promo code", error });
  }
};

// Get all promo codes (Admin Only)
export const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching promo codes", error });
  }
};
export const triggerBirthdayPromos = async (req, res) => {
  try {
    const results = await checkAndSendBirthdayPromos();
    res.status(200).json({
      message: "Birthday promos processed successfully",
      results,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing birthday promos", error });
  }
};

export const getItinerarySales = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingType: "Itinerary",
      status: { $in: ["confirmed", "completed", "attended"] },
    }).populate({
      path: "itemId",
      select: "name totalPrice",
    });

    const sales = bookings
      .filter((booking) => booking.itemId)
      .map((booking) => ({
        purchaseDate: booking.bookingDate,
        totalPrice: booking.itemId.totalPrice || 0,
        itemName: booking.itemId.name,
        bookingId: booking._id,
      }));

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getItinerarySales:", error);
    res.status(500).json({
      message: "Error fetching itinerary sales",
      error: error.message,
    });
  }
};
export const getUserStats = async (req, res) => {
  try {
    // Count all users across different models
    const totalTourists = await Tourist.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalSellers = await Seller.countDocuments();
    const totalAdvertisers = await Advertiser.countDocuments();
    const totalTourGuides = await TourGuide.countDocuments();

    // Total users
    const totalUsers =
      totalTourists +
      totalAdmins +
      totalSellers +
      totalAdvertisers +
      totalTourGuides;

    // Get the first and last day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Count new users this month using createdAt field
    const [
      newTouristsThisMonth,
      newAdminsThisMonth,
      newSellersThisMonth,
      newAdvertisersThisMonth,
      newTourGuidesThisMonth,
    ] = await Promise.all([
      Tourist.countDocuments({
        createdAt: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      }),
      Admin.countDocuments({
        createdAt: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      }),
      Seller.countDocuments({
        createdAt: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      }),
      Advertiser.countDocuments({
        createdAt: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      }),
      TourGuide.countDocuments({
        createdAt: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      }),
    ]);

    // Sum up new users this month across all types
    const newUsersThisMonth =
      newTouristsThisMonth +
      newAdminsThisMonth +
      newSellersThisMonth +
      newAdvertisersThisMonth +
      newTourGuidesThisMonth;

    res.status(200).json({
      totalUsers,
      newUsersThisMonth,
      breakdown: {
        tourists: {
          total: totalTourists,
          newThisMonth: newTouristsThisMonth,
        },
        admins: {
          total: totalAdmins,
          newThisMonth: newAdminsThisMonth,
        },
        sellers: {
          total: totalSellers,
          newThisMonth: newSellersThisMonth,
        },
        advertisers: {
          total: totalAdvertisers,
          newThisMonth: newAdvertisersThisMonth,
        },
        tourGuides: {
          total: totalTourGuides,
          newThisMonth: newTourGuidesThisMonth,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};
export const getActivitySales = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingType: "Activity",
      status: { $in: ["confirmed", "completed", "attended"] },
    }).populate({
      path: "itemId",
      select: "name price",
    });

    const sales = bookings
      .filter((booking) => booking.itemId) // Ensure itemId exists
      .map((booking) => ({
        purchaseDate: booking.bookingDate,
        totalPrice: booking.itemId.price || 0, // Ensure price exists
        itemName: booking.itemId.name,
        bookingId: booking._id,
      }));

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getActivitySales:", error);
    res.status(500).json({
      message: "Error fetching activity sales",
      error: error.message,
    });
  }
};

export const getProductSales = async (req, res) => {
  try {
    console.log("Starting product sales query...");

    // Use ProductPurchase model instead of Booking
    const purchases = await ProductPurchase.find({
      status: "completed",
    })
      .populate({
        path: "productId",
        select: "name price productImage seller",
      })
      .populate({
        path: "userId",
        select: "username",
      });

    console.log("Initial purchases query result:", {
      purchasesFound: purchases.length,
      firstPurchase: purchases[0]
        ? {
            id: purchases[0]._id,
            status: purchases[0].status,
            productDetails: purchases[0].productId,
          }
        : "No purchases found",
    });

    // Map and calculate sales data
    const sales = purchases
      .filter((purchase) => purchase.productId) // Filter out null productId entries
      .map((purchase) => ({
        purchaseDate: purchase.purchaseDate,
        itemName: purchase.productId?.name || "Unknown Product",
        totalPrice: purchase.totalPrice,
        quantity: purchase.quantity,
        purchaseId: purchase._id,
        status: purchase.status,
        buyerName: purchase.userId?.username || "Unknown Buyer",
      }));

    // Detailed logging for debugging
    console.log("Product Sales Processing:", {
      totalPurchases: purchases.length,
      validSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      samplePurchase: purchases[0]
        ? {
            id: purchases[0]._id,
            status: purchases[0].status,
            totalPrice: purchases[0].totalPrice,
          }
        : "No purchases",
      sampleSale: sales[0] || "No sales",
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getProductSales:", error);
    res.status(500).json({
      message: "Error fetching product sales",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
// Historical Place Sales
export const getHistoricalPlaceSales = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingType: "HistoricalPlace",
      bookingTypeModel: "HistoricalPlace",
      status: { $in: ["confirmed", "completed"] },
    }).populate({
      path: "itemId",
      select: "name ticketPrices",
      model: "HistoricalPlace",
    });

    const sales = bookings
      .filter((booking) => booking.itemId)
      .map((booking) => {
        const price = booking.itemId?.ticketPrices?.[0]?.price || 0;
        const quantity = booking.quantity || 1;
        const totalPrice = price * quantity;
        const platformFee = totalPrice * 10; // Calculate 10% fee

        return {
          purchaseDate: booking.bookingDate,
          totalPrice: platformFee, // Only return the platform's 10% cut
          itemName: booking.itemId?.name || "Unknown Historical Place",
          bookingId: booking._id,
          originalPrice: totalPrice, // For reference
        };
      });

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getHistoricalPlaceSales:", error);
    res.status(500).json({
      message: "Error fetching historical place sales",
      error: error.message,
    });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Save OTP in the database
    await Otp.create({
      userId: admin._id,
      userType: "Admin",
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Valid for 5 minutes
    });

    // Send OTP email
    const subject = "Tripify Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`;
    const html = `<p>Your OTP for password reset is: <strong>${otp}</strong>. This OTP is valid for <strong>5 minutes</strong>.</p>`;

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: "OTP sent successfully", email });
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // First find the admin to get their ID
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Look up the OTP using userId and the OTP value
    const otpRecord = await Otp.findOne({
      userId: admin._id,
      userType: "Admin",
      otp: otp,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await otpRecord.deleteOne(); // Clean up expired OTP
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid - you might want to mark it as used or delete it
    await otpRecord.deleteOne();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Hash the password manually
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password directly without triggering middleware
    await Admin.updateOne({ email }, { $set: { password: hashedPassword } });

    await Otp.deleteMany({
      userId: admin._id,
      userType: "Admin",
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
