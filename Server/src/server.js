// server.js

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/Connection"); // Assuming this connects to MongoDB
const dotenv = require("dotenv");

// Load environment variables from .env file (for local development)
dotenv.config();

// Initialize the Express application
const app = express();

// --- Database Connection ---
// Connect to MongoDB as soon as the server file is loaded.
// For Vercel serverless functions, this connection will be established
// when the function is "warmed up" or on the first request.
connectDB()
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    // Exit the process if DB connection fails, or handle gracefully
    process.exit(1);
  });

// --- CORS Configuration ---
// Define allowed origins for CORS.
// This allows your local development server AND your deployed Vercel frontend.
const allowedOrigins = [
  process.env.CLIENT_URL, // This will be your deployed Vercel frontend URL from environment variables
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the Origin ${origin}.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// --- Middleware ---
// Use express's built-in body parsers instead of body-parser package
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded requests

// --- Routes ---
const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");

// Prefix all note routes with /api/notes
app.use("/api/notes", noteRoutes);
// Prefix all user routes with /api/user
app.use("/api/user", userRoutes);

// Root API endpoint for testing
app.get("/api", (req, res) => {
  res.send("Welcome to the MERN Stack API!");
});

// Specific API endpoint for notes (if noteRoutes doesn't handle root)
app.get("/api/notes", (req, res) => {
  res.send("Welcome to the Notes API!");
});

// Specific API endpoint for users (if userRoutes doesn't handle root)
app.get("/api/user", (req, res) => {
  res.send("Welcome to the User API!");
});

// --- Server Export (for Vercel Serverless Functions) ---
// For Vercel, you export the app instance. Vercel's runtime will handle
// starting the server and listening on the appropriate port.
module.exports = app;

// --- Local Server Start (Conditional) ---
// This part is ONLY for local development. Vercel does NOT use app.listen().
// It's good practice to wrap it in a condition or separate it for clarity.
// We're using process.env.NODE_ENV to check if we're not in a Vercel environment.

const port = process.env.PORT || 5000; // Default to 5000 if PORT is not set
app.listen(port, () => {
  console.log(`Server is running locally on http://localhost:${port}`);
});
