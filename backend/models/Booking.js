const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    skill: { type: String, default: "" },
    city: { type: String, default: "" },

    address: { type: String, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    locationLabel: { type: String, default: "" },
    schedule: { type: Date, default: null },
    notes: { type: String, default: "" },

    paymentMethod: { type: String, default: "Cash" },

    days: { type: Number, default: 1, min: 1 },
    totalAmount: { type: Number, default: 0 },

    reviewedByClient: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "emergency"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
