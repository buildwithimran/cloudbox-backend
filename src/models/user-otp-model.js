const mongoose = require('mongoose');

const passwordVerificationCodeSchema = new mongoose.Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('passwordVerificationCode', passwordVerificationCodeSchema);
