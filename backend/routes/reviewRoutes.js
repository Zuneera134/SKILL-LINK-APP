const router = require("express").Router();
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

// Create review (client only, must be completed booking)
router.post("/", requireAuth, requireRole("client"), async (req, res) => {
  try {
    const { bookingId, rating, comment = "" } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "bookingId and rating are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.clientId) !== req.user.id) {
      return res.status(403).json({ message: "Not your booking" });
    }

    if (String(booking.status).toLowerCase() !== "completed") {
      return res.status(400).json({ message: "Review allowed only after completion" });
    }

    const exists = await Review.findOne({ bookingId });
    if (exists) return res.status(400).json({ message: "Already reviewed" });

    const review = await Review.create({
      bookingId,
      clientId: booking.clientId,
      workerId: booking.providerId,
      rating: Number(rating),
      comment: String(comment),
    });

    // mark booking as reviewed by client
    await Booking.findByIdAndUpdate(booking._id, { reviewedByClient: true });

    // update worker rating stats
    const all = await Review.find({ workerId: booking.providerId });
    const sum = all.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = all.length ? sum / all.length : 0;

    await User.findByIdAndUpdate(booking.providerId, {
      totalReviews: all.length,
      avgRating: Number(avg.toFixed(2)),
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ message: "Review failed" });
  }
});

// My reviews (client)
router.get("/my", requireAuth, requireRole("client"), async (req, res) => {
  try {
    const reviews = await Review.find({ clientId: req.user.id }).select(
      "bookingId rating comment workerId createdAt"
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reviews" });
  }
});

// Reviews for a worker
router.get("/worker/:workerId", async (req, res) => {
  try {
    const reviews = await Review.find({ workerId: req.params.workerId }).sort({
      createdAt: -1,
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to load worker reviews" });
  }
});

module.exports = router;
