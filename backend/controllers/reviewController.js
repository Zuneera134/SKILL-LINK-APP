const Review = require("../models/Review");
const Booking = require("../models/Booking");


exports.createReview = async (req, res) => {
  try {

    if (req.user?.role !== "client") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    
    const booking = await Booking.findOne({ _id: bookingId, clientId: req.user.id })
      .populate("providerId", "name");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    
    const status = String(booking.status || "").trim().toLowerCase();
    if (status !== "completed") {
      return res.status(400).json({ message: "Review allowed only after completion" });
    }

    
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this booking" });
    }

    const review = await Review.create({
      bookingId,
      clientId: req.user.id,
      providerId: booking.providerId?._id,
      rating: parsedRating,
      comment: comment || "",
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    return res.status(500).json({ message: "Failed to create review" });
  }
};


exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.find({ providerId })
      .populate("clientId", "name")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (err) {
    console.error("GET PROVIDER REVIEWS ERROR:", err);
    return res.status(500).json({ message: "Failed to load reviews" });
  }
};
