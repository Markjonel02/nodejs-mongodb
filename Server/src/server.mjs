import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/Connection.js";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create the Express app
const app = express();
const port = process.env.PORT || 5000;

// __dirname is a global variable in Node.js, so no need to declare it.
// We can directly use it for path operations.

// CORS configuration
// Determine the CORS origin based on the environment
let corsOrigin;
if (process.env.NODE_ENV === "production") {
  // In production, use the CLIENT_URL environment variable
  corsOrigin = process.env.CLIENT_URL;
} else {
  // In development, allow localhost:5173 (or your frontend dev server port)
  corsOrigin = "http://localhost:5173";
}

const corsOptions = {
  origin: corsOrigin, // Dynamic origin based on environment
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Explicitly allow OPTIONS for preflight requests
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200, // For preflight requests
};

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(bodyParser.json()); // bodyParser for JSON (redundant with express.json() but kept as per your input)
app.use(bodyParser.urlencoded({ extended: true })); // bodyParser for URL-encoded data

// Apply the configured CORS options unconditionally
// This ensures CORS headers are sent for ALL routes, including preflight OPTIONS requests
app.use(cors(corsOptions));

// Import and use routes

import noteRoutes from "./routes/noteRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs"; // Assuming this file exists and contains login/register routes

// Route for notes, now prefixed with /api and using authenticateToken
app.use("/api", authenticateToken, noteRoutes);
// Route for user-related actions
app.use("/api/user", userRoutes);

// --- API Health Checks / Sample Routes ---
// These are fine for testing if the API is reachable
app.get("/api", (req, res) => {
  res.send("Welcome to the Notes API!");
});

app.get("/api/user", (req, res) => {
  res.send("welcome to user");
});

// Serve static files from the React app's build directory (Client/dist)
// This block should only run in production when the backend is also serving the frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Client/dist")));
  // Catch-all route to serve the React app's index.html for any other requests
  // This must come AFTER all your API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Client", "dist", "index.html"));
  });
}

// Export the app for testing or further configuration (e.g., if using a serverless function)
module.exports = app;

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      // Log the CORS origin to confirm it's loaded correctly from environment variables or set for dev
      console.log(`CORS Origin set to: ${corsOrigin}`);
      console.log(`Node Environment: ${process.env.NODE_ENV}`); // Log the environment
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit the process with an error code
  });
