const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const OTP = require("../models/otpModel"); // Registration OTP
const OTPForgot = require("../models/otpForgotModel"); // Forgot password OTP
const { sendOTP, sendOTPForgot } = require("../services/otpService");

const JWT_SECRET = process.env.JWT_SECRET;

const registerSendOTP = async (req, res) => {
  try {
    const { email, password, codesx } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (codesx === "910JQK") {
      await sendOTP(email);
    }

    const user = new User({ email, password: hashedPassword, codesx });
    await user.save();

    res.status(201).json({ message: "User registered successfully, OTP sent to email." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerResendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered." });
    if (user.verified) return res.status(400).json({ message: "Account already verified." });

    await sendOTP(email); 

    res.status(200).json({ message: "New OTP resent successfully." });
  } catch (error) {
    console.error("Error resending OTP (register):", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const registerVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });
    if (otpRecord.verified) return res.status(200).json({ message: "Email already verified" });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (otpRecord.expiry < new Date()) return res.status(400).json({ message: "OTP expired" });

    otpRecord.verified = true;
    await otpRecord.save();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.verified) {
      user.verified = true;
      await user.save();
    }

    return res.status(200).json({ message: "OTP verified and account activated" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).json({ error: "User not found" });
    if (!user.verified) return res.status(400).json({ error: "Email not verified. Please verify using OTP." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, codesx: user.codesx }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, email, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};

const emailOTPForgot = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).json({ message: "Email not registered." });

    const result = await sendOTPForgot(email);

    if (result.success) {
      return res.status(200).json({ message: result.message, email, userId: user._id });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error sending forgot password OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotResendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered." });

    const result = await sendOTPForgot(email);

    if (result.success) {
      return res.status(200).json({ message: "New OTP resent successfully." });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error resending OTP (forgot):", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOTPForgot = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTPForgot.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });
    if (otpRecord.verified) return res.status(200).json({ message: "OTP already verified" });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (otpRecord.expiry < new Date()) return res.status(400).json({ message: "OTP expired" });

    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    console.error("OTP verification error (forgot):", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const otpRecord = await OTPForgot.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerSendOTP,
  registerResendOTP,
  registerVerifyOTP,
  loginUser,
  emailOTPForgot,
  forgotResendOTP,
  verifyOTPForgot,
  updatePassword,
};
