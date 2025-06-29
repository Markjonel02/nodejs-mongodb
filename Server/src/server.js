const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Connection");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create the Express app
const app = express();
const port = process.env.PORT || 5000; // Use PORT from .env or default to 5000

// Configure CORS to allow requests from your Vercel frontend URL
const corsOptions = {
  origin: process.env.CLIENT_URL, // Use CLIENT_URL from .env
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200,
};

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data
app.use(cors(corsOptions)); // Apply the configured CORS options

// Import and use routes
const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api/notes", noteRoutes); // Prefix all note routes with /api/notes
app.use("/api/user", userRoutes); // Prefix all user routes with /api/user

// Sample root API route
app.get("/api", (req, res) => {
  res.send("Connected to API");
});

// Export the app for testing or further configuration
module.exports = app;

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process with an error code
  });
