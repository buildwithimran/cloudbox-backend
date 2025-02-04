const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    device: String, // Example: "Chrome on Windows"
    ip: String, // Store user IP
    token: String, // Store JWT Token
    createdAt: { type: Date, default: Date.now }, // Timestamp
});


// Define the schema
const currencySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String },
    verified: { type: Boolean, required: true, default: false },
    sessions: [sessionSchema],
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('user', currencySchema);
