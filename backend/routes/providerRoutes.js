const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * PUBLIC: list approved service providers
 * GET /api/providers?skill=Electrician&city=Mansehra
 */
router.get("/", async (req, res) => {
  try {
    const { skill, city } = req.query;

    const allowedRoles = ["serviceProvider", "worker", "provider"];

    const q = {
      role: { $in: allowedRoles },
      $or: [{ approved: true }, { isApproved: true }, { verified: true }],
    };

    if (skill && String(skill).trim()) {
      const sk = String(skill).trim();
      q.skill = new RegExp(`^\\s*${escapeRegex(sk)}\\s*$`, "i");
    }

    if (city && String(city).trim()) {
      const ct = String(city).trim();
      q.city = new RegExp(escapeRegex(ct), "i");
    }

    const providers = await User.find(q)
      .select("name skill city price avatarUrl experience approved isApproved verified role")
      .sort({ createdAt: -1 });

    return res.json(providers);
  } catch (err) {
    console.error("PROVIDERS LIST ERROR:", err);
    return res.status(500).json({ message: "Failed to load providers" });
  }
});

/**
 * PUBLIC: provider profile
 * GET /api/providers/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const allowedRoles = ["serviceProvider", "worker", "provider"];

    const provider = await User.findOne({
      _id: req.params.id,
      role: { $in: allowedRoles },
    }).select("name email skill city price avatarUrl experience approved isApproved verified role");

    if (!provider) return res.status(404).json({ message: "Provider not found" });

    return res.json(provider);
  } catch (err) {
    console.error("PROVIDER PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to load provider" });
  }
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;
