const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ PUBLIC: providers list (Services + ClientDashboard use this)
// GET /api/users/providers?skill=Electrician&city=Abbottabad
router.get("/providers", async (req, res) => {
  try {
    const skill = String(req.query.skill || "").trim();
    const city = String(req.query.city || "").trim();

    const q = { role: "serviceProvider", approved: true };
    if (skill) q.skill = skill;
    if (city) q.city = new RegExp(`^${city}$`, "i");

    const providers = await User.find(q).select("-password").sort({ createdAt: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load providers" });
  }
});

module.exports = router;
