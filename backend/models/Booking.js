const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    address: { type: String, required: true },
    schedule: { type: Date, default: null },
    notes: { type: String, default: "" },

    paymentMethod: { type: String, default: "Cash" },

    days: { type: Number, default: 1, min: 1 },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
