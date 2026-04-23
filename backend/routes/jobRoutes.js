const router = require("express").Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");


router.post("/emergency", requireAuth, requireRole("client"), async (req, res) => {
  try {
    const { service, address } = req.body;
    if (!service || !address) return res.status(400).json({ message: "Missing fields" });

    const provider = await User.findOne({
      role: "serviceProvider",
      approved: true,
      skill: new RegExp(`^${service}$`, "i"),
    });

    if (!provider) return res.status(404).json({ message: "No approved worker available" });

    const booking = await Booking.create({
      clientId: req.user.id,
      workerId: provider._id,
      service,
      address,
      scheduledAt: new Date(),
      price: provider.price || 0,
      status: "Emergency",
      notes: "Emergency request",
    });

 
    const populated = await Booking.findById(booking._id)
      .populate("workerId", "name skill city price avgRating totalReviews phone avatarUrl bio")
      .populate("clientId", "name email");

    res.status(201).json(populated);
  } catch (e) {
    res.status(500).json({ message: "Emergency request failed", error: e.message });
  }
});

module.exports = router;
