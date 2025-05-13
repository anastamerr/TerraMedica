// Import necessary modules
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path"; // Import path module
import { connectDB } from "./config/db.js";
// import Preference from "./models/preference.model.js"; 
import Preference from "./models/preference.model.js"; // Import the Preference model
import { fileURLToPath } from "url";
import { dirname } from "path";

// Other imports for routes
import activityRoutes from "./routes/activity.route.js";
import itineraryRoutes from "./routes/itinerary.route.js";
import historicalplacesRoutes from "./routes/historicalplaces.route.js";
import touristRoutes from "./routes/tourist.route.js";
import tourguideRoutes from "./routes/tourGuide.route.js";
import sellerRoutes from "./routes/seller.route.js";
import adminRoutes from "./routes/admin.route.js";
import advertiserRoutes from "./routes/advertiser.route.js";
import tourismGovernorRoutes from "./routes/toursimGovernor.route.js";
import preferenceTagRoutes from "./routes/preferenceTag.route.js";
import tagRoutes from "./routes/tag.route.js";
import productRoutes from "./routes/product.route.js";
import complaintRoutes from "./routes/complaints.route.js";
import flightRoutes from "./routes/flight.route.js";
import hotelRoutes from "./routes/hotel.route.js";
import bookingRoutes from "./routes/booking.route.js";
import transportationRoutes from "./routes/transportation.route.js";
import sendEmail from "./utils/sendEmail.js";
import { checkAndSendBirthdayPromos } from "./services/birthdayPromo.service.js";
import { runBookingNotificationCheck } from "./services/bookingReminder.js";
import notificationRoutes from "./routes/notification.route.js";
import stripeRoutes from "./routes/stripe.route.js";
import wishlistRoutes from './routes/wishlist.route.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const runBirthdayPromoCheck = async () => {
  console.log("Checking for birthdays on server start...");
  try {
    const results = await checkAndSendBirthdayPromos();
    console.log("Birthday promo check completed:", results);
  } catch (error) {
    console.error("Birthday promo check failed:", error);
  }
};

// Database connection
connectDB()
  .then(async () => {
    app.listen(process.env.PORT || 5000, async () => {
      console.log(
        `Server started at http://localhost:${process.env.PORT || 5000}`
      );
      // Run birthday check when server starts
      await runBirthdayPromoCheck();
      await runBookingNotificationCheck();

      //Check every hour while server is running
      setInterval(runBirthdayPromoCheck, 1000 * 60 * 60);
      setInterval(runBookingNotificationCheck, 1000 * 60 * 60);
    });
  })
  .catch((error) => {
    console.error("Database connection failed. Server not started.", error);
    process.exit(1);
  });

// Serve static files (uploaded documents) from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Ensure this line is correct

// Routes configuration
app.use("/api/activities", activityRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/historicalplace", historicalplacesRoutes);
app.use("/api/tourist", touristRoutes);
app.use("/api/tourguide", tourguideRoutes);
app.use("/api/toursimGovernor", tourismGovernorRoutes);

app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advertiser", advertiserRoutes);
app.use("/api/preference-tags", preferenceTagRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/products", productRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);

app.use("/api/transportation", transportationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stripe", stripeRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Tourist preferences routes
const router = express.Router();

// Create or update preferences for a tourist
router.put("/preferences/:userId", async (req, res) => {
  const { userId } = req.params;
  const { tripTypes, budgetLimit, preferredDestinations } = req.body;

  try {
    let preference = await Preference.findOne({ user: userId });

    if (preference) {
      // Update existing preferences
      preference.tripTypes = tripTypes;
      preference.budgetLimit = budgetLimit;
      preference.preferredDestinations = preferredDestinations;
    } else {
      // Create new preferences
      preference = new Preference({
        user: userId,
        tripTypes,
        budgetLimit,
        preferredDestinations,
      });
    }

    await preference.save();
    res.status(200).json(preference);
  } catch (error) {
    res.status(500).json({ message: "Error updating preferences", error });
  }
});

// Get preferences for a tourist
router.get("/preferences/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const preferences = await Preference.findOne({ user: userId });
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    res.status(200).json(preferences);
  } catch (error) {
    res.status(500).json({ message: "Error fetching preferences", error });
  }
});

// Attach preferences routes to the application
app.use("/api/tourist", router);

app.post("/api/notify", async (req, res) => {
  const { email, message } = req.body;

  try {
    await sendEmail(email, "Notification", message);
    res.status(200).json({ success: true, message: "Email sent!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
});

export default app;
