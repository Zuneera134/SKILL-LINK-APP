const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    service: { type: String, required: true },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Completed", "Emergency"],
      default: "Pending",
    },

    address: { type: String, required: true },
    notes: { type: String, default: "" },

    price: { type: Number, default: 0 },

    scheduledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);

