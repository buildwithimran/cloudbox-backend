require("dotenv").config();
const express = require("express");
const { connectToDB } = require("./config/dbConnect");
require("dotenv").config();
const cors = require('cors');
const app = express();
const morgan = require('morgan');

// Middleware
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Connect to Database
connectToDB();

// Routes
const indexRoutes = require("./routes/index-route");
const userRoutes = require("./routes/user-route");
const folderRoutes = require("./routes/folder-route");
const fileRoutes = require("./routes/file-route");

app.use("/", indexRoutes);
app.use("/api/users", userRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/file", fileRoutes);

// Start Server
app.listen(process.env.DB_PORT, () => console.log("Server running on port 3001"));