const mongoose = require('mongoose');

// Define the schema
const currencySchema = new mongoose.Schema({
    baseCurrency: { type: String, required: true },
    targetCurrency: { type: String, required: true },
    amount: { type: Number, required: true },
    conversionRate: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Export the model
module.exports = mongoose.model('Currency', currencySchema);
