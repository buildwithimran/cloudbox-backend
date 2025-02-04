const mongoose = require("mongoose");
require("dotenv").config();

const connectToDB = async () => {
    mongoose.connect(process.env.DB_URI, {
        autoIndex: true
    }).then(() => console.log("✅ Connected to MasterDB"))
        .catch(err => console.error("❌ MasterDB Connection Failed:", err));
};

module.exports = { connectToDB };
