const jwt = require('jsonwebtoken');
require("dotenv").config();

const getUserIdFromToken = (authorization) => {
    try {
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const token = authorization.split(" ")[1]; // Extract only the token

        // Verify the token and extract user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;  // The userId is stored in the token payload
    } catch (error) {
        console.error("Invalid token:", error);
        return null;  // Return null if the token is invalid
    }
};

module.exports = { getUserIdFromToken };