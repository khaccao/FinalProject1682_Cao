const nodemailer = require("nodemailer");
const OTP = require("../models/otpModel");
const OTPForgot = require("../models/otpForgotModel");
const User = require("../models/userModel");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const generateHtmlTemplate = (otp, title) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #333;">🔐 ${title}</h2>
        <p style="text-align: center; color: #666;">Your OTP verification code is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; letter-spacing: 10px; background-color: #f0f8ff; padding: 15px 25px; border-radius: 8px; color: #2c3e50; font-weight: bold; display: inline-block; border: 2px dashed #3498db;">
            ${otp}
          </span>
        </div>
        <p style="text-align: center; color: #999;">This code is valid for 5 minutes.  Please do not share it with anyone to ensure your account security.</p>
        <hr style="margin: 30px 0;">
        <p style="text-align: center; font-size: 12px; color: #bbb;">If you did not request this code, please ignore this email.</p>
      </div>
    </div>
  `;
};

const sendOTP = async (email) => {
  try {
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiry, verified: false },
      { upsert: true, new: true }
    );

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Account Registration OTP",
      html: generateHtmlTemplate(otp, "Email Verification (Registration)"),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending registration OTP:", error);
    return false;
  }
};

const sendOTPForgot = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await OTPForgot.findOneAndUpdate(
      { email },
      { otp, expiry, verified: false },
      { upsert: true, new: true }
    );

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Password Reset OTP",
      html: generateHtmlTemplate(otp, "Email Verification (Forgot Password)"),
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent to your email" };
  } catch (error) {
    console.error("Error sending forgot password OTP:", error);
    return { success: false, message: "Server error" };
  }
};

module.exports = { sendOTP, sendOTPForgot };
