import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import connectDB from "./config/Connection.js";
import noteRoutes from "../src/routes/noteRoutes.mjs";
import userRoutes from "../src/routes/userRoutes.mjs";

// Load environment variables from .env file
dotenv.config();

// ES module workaround for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express application
const app = express();
const port = process.env.PORT || 5000; // Use port from environment or default to 5000

// Determine CORS origin based on environment
// In production, use CLIENT_URL from .env; otherwise, use http://localhost:5173 for development
let corsOrigin = process.env.CLIENT_URL;

// IMPORTANT FIX: Ensure the corsOrigin does NOT have a trailing slash
// The client's Origin header typically does not include a trailing slash,
// so the server's Access-Control-Allow-Origin must match exactly.
if (corsOrigin && corsOrigin.endsWith("/")) {
  corsOrigin = corsOrigin.slice(0, -1);
}

// Configure CORS options
const corsOptions = {
  origin: corsOrigin, // Set the determined origin
  credentials: true, // Allow cookies to be sent with requests
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed HTTP methods
  optionsSuccessStatus: 200, // For preflight requests
};

// Middleware setup
app.use(cors(corsOptions)); // Apply CORS middleware with configured options
app.use(express.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API routes
app.use("/api", noteRoutes); // Mount note-related routes under /api
app.use("/api/user", userRoutes); // Mount user-related routes under /api/user

// Health check route for the API
app.get("/api", (req, res) => {
  res.send("Welcome to the Notes API!");
});

// Serve static frontend files in production environment

// Serve static files from the client's build directory
app.use(express.static(path.join(__dirname, "../Client/dist")));

// For any other GET requests, serve the main index.html file
// This ensures that client-side routing works correctly
// Corrected syntax: `/*` instead of `{*any}`
app.get("/{*any}", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/dist", "index.html"));
});

// Connect to MongoDB and then start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`🌐 CORS Origin: ${corsOrigin}`);
      console.log(`🌱 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1); // Exit process if DB connection fails
  });
