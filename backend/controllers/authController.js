const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const SERVER_URL = process.env.SERVER_URL || "http://localhost:7000";

// helper
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
};

// True only when real Cloudinary keys exist in .env
function cloudConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Save an uploaded avatar buffer.
// - When Cloudinary keys are configured, uploads go to Cloudinary (secure CDN URL).
// - Otherwise (no keys) we fall back to a local file in backend/uploads/.
// Returns an absolute URL, or "" when there is no upload / on any error.
function saveAvatarImage(file) {
  return new Promise((resolve) => {
    if (!file || !file.buffer || !file.mimetype) return resolve("");

    // Local fallback: write to uploads/ folder.
    const saveLocal = () => {
      try {
        const extMap = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/jfif": "jpg",
        };
        const ext = extMap[file.mimetype] || "jpg";
        const fname = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        fs.writeFileSync(path.join(UPLOAD_DIR, fname), file.buffer);
        resolve(`${SERVER_URL}/uploads/${fname}`);
      } catch (e) {
        console.error("AVATAR LOCAL SAVE ERROR:", e.message);
        resolve("");
      }
    };

    // Cloudinary primary path (only when keys are configured).
    if (cloudConfigured()) {
      cloudinary.uploader
        .upload_stream(
          { folder: "skilllink", resource_type: "image" },
          (err, result) => {
            if (err || !result || !result.secure_url) {
              console.error("CLOUDINARY UPLOAD ERROR:", err?.message);
              return saveLocal();
            }
            resolve(result.secure_url);
          }
        )
        .end(file.buffer);
    } else {
      saveLocal();
    }
  });
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      cnic,
      role,
      skill,
      city,
      price,
      phone,
      age,
      experience,
      avatarUrl, 
      lat,
      lng,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const finalRole = role === "serviceProvider" ? "serviceProvider" : "client";

    const avatarSaved = await saveAvatarImage(req.file);

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password),

      cnic: cnic || "",

      role: finalRole,

      
      skill: skill || "",
      city: city || "",
      price: price ? Number(price) : 0,
      phone: phone || "",
      age: age ? Number(age) : null,
      experience: experience || "",
      avatarUrl: avatarSaved || avatarUrl || "",

      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,

    
      approved: finalRole === "serviceProvider" ? false : true,
    });

    return res.status(201).json({
      message:
        user.role === "serviceProvider"
          ? "Registered. Wait for admin approval before login."
          : "Registered. You can login now.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: err.message || "Register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await user.comparePassword(String(password));
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

   
    if (user.role === "serviceProvider" && !user.approved) {
      return res.status(403).json({ message: "Not approved yet. Wait for admin approval." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: err.message || "Login failed" });
  }
};

exports.me = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed" });
  }
};
