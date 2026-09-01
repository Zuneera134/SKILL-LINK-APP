const router = require("express").Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Great-circle distance in km between two lat/lng points (Haversine).
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function esc(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Emergency booking (client only)
router.post("/emergency", requireAuth, requireRole("client"), async (req, res) => {
  try {
    const { service, address, lat, lng, locationLabel } = req.body;
    if (!service || !address) return res.status(400).json({ message: "Missing fields" });

    const clientLat = toNum(lat);
    const clientLng = toNum(lng);
    const hasClientCoords = clientLat !== null && clientLng !== null;

    const providers = await User.find({
      role: "serviceProvider",
      approved: true,
      skill: new RegExp(`^${esc(service)}$`, "i"),
    }).select("name skill city price avgRating totalReviews phone lat lng avatarUrl");

    if (!providers.length) {
      return res.status(404).json({ message: "No approved worker available" });
    }

    // Choose nearest provider when we have both client coords and provider coords.
    let provider = providers[0];
    if (hasClientCoords) {
      let best = null;
      let bestDist = Infinity;
      for (const p of providers) {
        const pLat = toNum(p.lat);
        const pLng = toNum(p.lng);
        if (pLat === null || pLng === null) continue;
        const d = haversineKm(clientLat, clientLng, pLat, pLng);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
      if (best) {
        provider = best;
        provider._nearestDistKm = Number(bestDist.toFixed(2));
      }
    }

    const booking = await Booking.create({
      clientId: req.user.id,
      providerId: provider._id,
      skill: String(service).trim(),
      city: provider.city || "",
      address: String(address).trim(),
      lat: clientLat,
      lng: clientLng,
      locationLabel: String(locationLabel || "").trim(),
      schedule: new Date(),
      notes: "Emergency request",
      paymentMethod: "Cash",
      days: 1,
      status: "emergency",
      totalAmount: Number(provider.price || 0),
    });

    const populated = await Booking.findById(booking._id)
      .populate("providerId", "name skill city price avgRating totalReviews phone lat lng avatarUrl")
      .populate("clientId", "name email");

    const out = populated.toObject ? populated.toObject() : { ...populated };
    out.workerId = out.providerId;
    out.service = out.skill;
    out.nearestDistKm = provider._nearestDistKm || null;
    out.location = {
      lat: out.lat,
      lng: out.lng,
      label: out.locationLabel,
      address: out.address,
    };

    res.status(201).json(out);
  } catch (e) {
    res.status(500).json({ message: "Emergency request failed", error: e.message });
  }
});

module.exports = router;
