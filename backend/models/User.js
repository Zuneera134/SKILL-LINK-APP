const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    cnic: { type: String, default: "" },

    role: { type: String, enum: ["client", "serviceProvider", "admin"], default: "client" },
    approved: { type: Boolean, default: true },

    skill: { type: String, default: "" },
    city: { type: String, default: "" },
    price: { type: Number, default: 0 },
    phone: { type: String, default: "" },
    age: { type: Number, default: null },
    experience: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {

  if (this.isModified("role")) {
    this.approved = this.role === "serviceProvider" ? false : true;
  }

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
