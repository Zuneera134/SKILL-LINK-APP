const express = require("express");
const multer = require("multer");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// memory upload (no disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // allow common image types (+ jfif because many phones use it)
  const ok = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/jfif",
  ].includes(file.mimetype);

  if (!ok) return cb(new Error("Only jpg/jpeg/png/webp/jfif allowed"), false);
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.post("/register", upload.single("avatar"), authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.me);

module.exports = router;
