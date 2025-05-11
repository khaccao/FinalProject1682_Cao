const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiry: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("OTP", otpSchema);
