const express = require("express");

const {
    registerSendOTP, registerVerifyOTP, loginUser, verifyOTPForgot,
    updatePassword,
    emailOTPForgot,
    registerResendOTP,
    forgotResendOTP
} = require("../controllers/authController");

const router = express.Router();

router.post("/registerSendOTP", registerSendOTP);
router.post("/registerVerifyOTP", registerVerifyOTP);
router.post("/loginUser", loginUser);
router.post("/registerResendOTP", registerResendOTP)
router.post("/emailOTPForgot", emailOTPForgot);
router.post("/verifyOTPForgot", verifyOTPForgot);
router.post("/updatePassword", updatePassword);
router.post("/forgotResendOTP", forgotResendOTP);
module.exports = router;