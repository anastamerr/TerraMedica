import mongoose from "mongoose";

const transportationSchema = new mongoose.Schema({
  advertiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advertiser",
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ["Car", "Van", "Bus", "Minibus", "Limousine"],
  },
  model: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  availabilityStart: {
    type: Date,
    required: true,
  },
  availabilityEnd: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  dropoffLocation: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: [
    {
      type: String,
    },
  ],
  // New sustainability fields
  carbon: {
    type: Number,
    default: function() {
      // Generate random CO2 emissions between 80-350 g/km
      return Math.floor(Math.random() * (350 - 80 + 1)) + 80;
    }
  },
  fuelType: {
    type: String,
    enum: ["Gasoline", "Diesel", "Electric", "Hybrid", "Hydrogen", "Natural Gas"],
    default: "Gasoline"
  },
  sustainabilityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: function() {
      // Generate random rating between 1-5
      return Math.floor(Math.random() * 5) + 1;
    }
  },
  ecoFriendlyFeatures: [String],
  status: {
    type: String,
    enum: ["available", "booked", "maintenance", "inactive"],
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for calculating more accurate carbon emissions based on distance
transportationSchema.virtual('estimatedCarbonEmissions').get(function() {
  // This is where you could implement a more sophisticated calculation
  // For now, return the random value
  return this.carbon;
});

transportationSchema.methods.calculateEmissions = function(distance) {
  const emissionFactors = {
    Car: 120,        // g CO2/km
    Van: 180,        // g CO2/km
    Bus: 70,         // g CO2/person/km
    Minibus: 90,     // g CO2/person/km
    Limousine: 250   // g CO2/km
  };
  
  const baseFactor = emissionFactors[this.vehicleType] || 150;
  return (baseFactor * distance) / (this.fuelType === "Electric" ? 5 : 1);
};

const Transportation = mongoose.model("Transportation", transportationSchema);
export default Transportation;
