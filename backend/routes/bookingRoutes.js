const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// CREATE booking
router.post("/", protect, async (req, res) => {
  try {
    // only client can book
    if (req.user?.role !== "client") {
      return res.status(403).json({ message: "Only client can create booking" });
    }

    const { providerId, skill, city, address, schedule, notes, paymentMethod, days } = req.body;

    if (!providerId) return res.status(400).json({ message: "providerId required" });
    if (!address) return res.status(400).json({ message: "address required" });

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "serviceProvider" || !provider.approved) {
      return res.status(400).json({ message: "Invalid provider" });
    }

    // fall back to provider details when skill/city are not supplied
    const finalSkill = skill || provider.skill || "";
    const finalCity = city || provider.city || "";

    const d = Math.max(1, Number(days || 1));
    const rate = Number(provider.price || 0);
    const subtotal = rate * d;
    const fee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const totalAmount = subtotal + fee;

    const booking = await Booking.create({
      clientId: req.user.id,
      providerId,
      skill: String(finalSkill).trim(),
      city: String(finalCity).trim(),
      address: String(address).trim(),
      schedule,
      notes: notes || "",
      paymentMethod: paymentMethod || "Cash",
      days: d,
      totalAmount,
      status: "pending",
      reviewedByClient: false,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message || "Booking failed" });
  }
});

// GET my bookings (client)
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user?.role !== "client") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookings = await Booking.find({ clientId: req.user.id })
      .populate("providerId", "name skill city price avatarUrl")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load bookings" });
  }
});

// GET my assigned jobs (worker/serviceProvider)
router.get("/worker/me", protect, async (req, res) => {
  try {
    if (req.user?.role !== "serviceProvider") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookings = await Booking.find({ providerId: req.user.id })
      .populate("clientId", "name email")
      .populate("providerId", "name skill city price avatarUrl")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load jobs" });
  }
});

// Update booking status (worker action: accept / complete / cancel)
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "accepted", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // only the assigned provider (or admin) may update status
    if (
      String(booking.providerId) !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = status;
    await booking.save();

    // when a provider completes a job, mark reviews as enabled
    if (status === "completed") {
      await Booking.findByIdAndUpdate(booking._id, { reviewedByClient: false });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message || "Status update failed" });
  }
});

// Convenience action routes: /bookings/:id/accept etc.
router.patch("/:id/accept", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.providerId) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    booking.status = "accepted";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message || "Action failed" });
  }
});

router.patch("/:id/complete", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.providerId) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    booking.status = "completed";
    booking.reviewedByClient = false;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message || "Action failed" });
  }
});

router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.providerId) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message || "Action failed" });
  }
});

module.exports = router;
