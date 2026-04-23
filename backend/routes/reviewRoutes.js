const router = require("express").Router();
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");


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

    if (booking.status !== "Completed") {
      return res.status(400).json({ message: "Review allowed only after completion" });
    }

    const exists = await Review.findOne({ bookingId });
    if (exists) return res.status(400).json({ message: "Already reviewed" });

    const review = await Review.create({
      bookingId,
      clientId: booking.clientId,
      workerId: booking.workerId,
      rating: Number(rating),
      comment: String(comment),
    });

    //  Update worker rating stats
    const all = await Review.find({ workerId: booking.workerId });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / (all.length || 1);

    await User.findByIdAndUpdate(booking.workerId, {
      totalReviews: all.length,
      avgRating: Number(avg.toFixed(2)),
    });

    res.status(201).json({ message: "Review submitted ", review });
  } catch (err) {
    res.status(500).json({ message: "Review failed" });
  }
});


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


router.get("/worker/:workerId", async (req, res) => {
  try {
    const reviews = await Review.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to load worker reviews" });
  }
});

module.exports = router;
