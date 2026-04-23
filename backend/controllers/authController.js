const jwt = require("jsonwebtoken");
const User = require("../models/User");

// helper
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
};

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
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const finalRole = role === "serviceProvider" ? "serviceProvider" : "client";

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
      avatarUrl: avatarUrl || "",

    
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
