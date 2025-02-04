const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const { getUserIdFromToken } = require("../utility/tokenToId")
const { sendOtpEmail } = require("../utility/mailer-service");
const { generateOTP } = require("../utility/helper");
const useragent = require('useragent');
require('dotenv').config();
const passwordVerificationCode = require("../models/user-otp-model");


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const verificationCode = generateOTP();
        await sendOtpEmail(verificationCode, email);

        const userVerificationObj = new passwordVerificationCode({ email, verificationCode });
        await userVerificationObj.save();

        res.status(201).json({ success: true, message: "Registration successful. You can now log in.", verified: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again later." });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials. Please check your email and password.' });
        }

        // If user is not verified, send OTP for verification
        if (!user.verified) {
            const verificationCode = generateOTP();

            // Check if a verification record exists for this email
            let userVerificationObj = await passwordVerificationCode.findOne({ email });

            if (userVerificationObj) {
                // Update existing record with new OTP
                userVerificationObj.verificationCode = verificationCode;
                await userVerificationObj.save();
            } else {
                // Create a new verification record
                userVerificationObj = new passwordVerificationCode({ email, verificationCode });
                await userVerificationObj.save();
            }

            // Send OTP via email
            await sendOtpEmail(verificationCode, email);

            return res.json({
                success: false,
                verified: false,
                message: 'Your account is not verified. Please check your email for the verification code.'
            });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Extract device info
        const agent = useragent.parse(req.headers['user-agent']);
        const session = {
            device: `${agent.family} on ${agent.os.family}`, // Example: "Chrome on Windows"
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            token,
        };

        // Add session to user
        user.sessions.push(session);
        await user.save();

        res.json({ success: true, token, user, verified: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
};

const fetchLoggedInUser = async (req, res) => {
    try {
        const userId = getUserIdFromToken(req.header("Authorization"));
        const user = await User.findById(userId).select("name email");
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
}

const verifyOtpCode = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Find the stored verification code
        const storedCode = await passwordVerificationCode.findOne({ email });

        if (!storedCode) {
            return res.status(400).json({ success: false, message: "No verification code found for this email." });
        }

        // Check if the provided code matches
        if (storedCode.verificationCode !== verificationCode) {
            return res.status(400).json({ success: false, message: "Invalid verification code." });
        }

        // Update user verification status
        await User.findOneAndUpdate({ email }, { $set: { verified: true } });

        // Remove the verification code from the database after successful verification
        await passwordVerificationCode.deleteOne({ email });
        const user = await User.findOne({ email });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, message: "Verification successfully completed", token, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
    }
};

const resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Check if the user exists by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Generate OTP
        const otp = generateOTP();

        // 3. Save OTP in the database (along with email and expiration time)
        // Check if a verification record exists for this email
        let userVerificationObj = await passwordVerificationCode.findOne({ email });

        if (userVerificationObj) {
            // Update existing record with new OTP
            userVerificationObj.verificationCode = otp;
            await userVerificationObj.save();
        } else {
            // Create a new verification record
            userVerificationObj = new passwordVerificationCode({ email, verificationCode: otp });
            await userVerificationObj.save();
        }

        // Send OTP via email
        await sendOtpEmail(otp, email);

        // 5. Respond with success
        return res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const resetPasswordVerifyOtp = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Check if the OTP exists in the database
        const storedCode = await passwordVerificationCode.findOne({ email });

        if (!storedCode) {
            return res.status(400).json({ success: false, message: "No verification code found for this email." });
        }

        // Validate OTP
        if (storedCode.verificationCode !== verificationCode) {
            return res.status(400).json({ success: false, message: "Invalid verification code." });
        }

        // OTP is valid, allow user to proceed to password update
        return res.status(200).json({ success: true, message: "OTP verified successfully. You can now reset your password." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the password in the database
        await User.findOneAndUpdate({ email }, { $set: { password: hashedPassword } });

        // Remove OTP record after successful password update
        await passwordVerificationCode.deleteOne({ email });

        return res.status(200).json({ success: true, message: "Password updated successfully. You can now log in with the new password." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
    }
};

module.exports = {
    registerUser,
    loginUser,
    fetchLoggedInUser,
    verifyOtpCode,
    resetPasswordRequest,
    resetPasswordVerifyOtp,
    updatePassword
};