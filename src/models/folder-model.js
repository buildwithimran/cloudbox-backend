const mongoose = require('mongoose');

// Define the schema
const currencySchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('folder', currencySchema);
