const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, requireAdmin } = require("../middleware/authMiddleware");

// PUBLIC: providers list (Services + ClientDashboard + Emergency use this)
// GET /api/users/providers?skill=Electrician&city=Abbottabad
router.get("/providers", async (req, res) => {
  try {
    const skill = String(req.query.skill || "").trim();
    const city = String(req.query.city || "").trim();

    const q = { role: "serviceProvider", approved: true };
    if (skill) q.skill = new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    if (city) q.city = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

    const providers = await User.find(q).select("-password").sort({ createdAt: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load providers" });
  }
});

// ADMIN: list pending service providers (not yet approved)
router.get("/pending-providers", protect, requireAdmin, async (req, res) => {
  try {
    const providers = await User.find({
      role: "serviceProvider",
      approved: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load pending providers" });
  }
});

// ADMIN: list all users
router.get("/all", protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load users" });
  }
});

// ADMIN: approve a service provider
router.patch("/approve/:id", protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "serviceProvider") {
      return res.status(400).json({ message: "Only service providers can be approved" });
    }

    user.approved = true;
    await user.save();

    res.json({ message: "Provider approved", user });
  } catch (err) {
    res.status(500).json({ message: err.message || "Approve failed" });
  }
});

// PUBLIC: single provider profile (used by ProviderProfile page)
// NOTE: must be declared AFTER the static routes above so it does not
// accidentally capture /providers, /pending-providers, /all etc.
router.get("/:id", async (req, res) => {
  try {
    const provider = await User.findOne({
      _id: req.params.id,
      role: "serviceProvider",
    }).select("-password");

    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load provider" });
  }
});

module.exports = router;
