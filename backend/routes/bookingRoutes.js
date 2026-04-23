const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// ✅ CREATE booking
router.post("/", protect, async (req, res) => {
  try {
    // only client can book
    if (req.user?.role !== "client") {
      return res.status(403).json({ message: "Only client can create booking" });
    }

    const { providerId, skill, city, address, schedule, notes, paymentMethod, days } = req.body;

    if (!providerId) return res.status(400).json({ message: "providerId required" });
    if (!skill) return res.status(400).json({ message: "skill required" });
    if (!address) return res.status(400).json({ message: "address required" });
    if (!schedule) return res.status(400).json({ message: "schedule required" });

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "serviceProvider" || !provider.approved) {
      return res.status(400).json({ message: "Invalid provider" });
    }

    const d = Math.max(1, Number(days || 1));
    const rate = Number(provider.price || 0);
    const subtotal = rate * d;
    const fee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const totalAmount = subtotal + fee;

    const booking = await Booking.create({
      clientId: req.user.id,
      providerId,
      skill: String(skill).trim(),
      city: String(city || "").trim(),
      address: String(address).trim(),
      schedule,
      notes: notes || "",
      paymentMethod: paymentMethod || "Cash",
      days: d,
      totalAmount,
      status: "Pending",
      reviewedByClient: false,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message || "Booking failed" });
  }
});

// ✅ GET my bookings
router.get("/my", protect, async (req, res) => {
  try {
    const q = {};
    if (req.user?.role === "client") q.clientId = req.user.id;
    else if (req.user?.role === "serviceProvider") q.providerId = req.user.id;
    else return res.status(403).json({ message: "Forbidden" });

    const bookings = await Booking.find(q)
      .populate("providerId", "name skill city price avatarUrl")
      .populate("clientId", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load bookings" });
  }
});

module.exports = router;
