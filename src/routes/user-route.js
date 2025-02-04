const router = require("express").Router();
const {
    registerUser,
    loginUser,
    fetchLoggedInUser,
    verifyOtpCode,
    resetPasswordRequest,
    resetPasswordVerifyOtp,
    updatePassword
} = require("../controllers/user-controller");

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/fetchLoggedInUser", fetchLoggedInUser);

// OTP Verification
router.post("/verifyOtpCode", verifyOtpCode);

// Password Reset Routes
router.post("/resetPasswordRequest", resetPasswordRequest); // Request OTP
router.post("/resetPasswordVerifyOtp", resetPasswordVerifyOtp); // Verify OTP
router.post("/updatePassword", updatePassword); // Update Password

module.exports = router;
