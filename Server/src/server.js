const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/Connection");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file at the very beginning
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Use express.json() for parsing JSON request bodies (preferred over bodyParser.json())
app.use(express.json());
// Use bodyParser.urlencoded() for parsing URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Conditional CORS configuration based on environment
// This should be the ONLY place CORS is configured unless specific routes need different rules.
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN, // Ensure CORS_ORIGIN is defined in your .env (e.g., http://localhost:3000)
    })
  );
  console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN}`);
} else {
  console.log(
    "Running in production mode. CORS might not be explicitly needed if serving static files."
  );
  // If your frontend is served from a different domain in production, you would configure CORS here:
  // app.use(cors({ origin: 'https://yourproductionfrontend.com' }));
}

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  // Assuming 'Client' is the root directory of your React app
  // and 'dist' is the build output directory within 'Client'
  // Adjusted path to match typical relative structure from server root to client build
  app.use(express.static(path.join(__dirname, "../../Client", "dist")));

  // Handle any requests that don't match the above routes by serving React's index.html
  // NOTE: This line `app.get("*", ...)` uses a wildcard and does NOT cause the
  // "Missing parameter name" error. That error is caused by malformed dynamic
  // route parameters (e.g., '/path/:') elsewhere in your route definitions.
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../Client", "dist", "index.html"));
  });
}

// Import and use API routes
const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");

// Prefix all note routes with /api/notes
app.use("/api/notes", noteRoutes);
// Prefix all user routes with /api/user
app.use("/api/user", userRoutes);

// Basic test routes (these might be shadowed by the imported routers if they handle the same paths)
// It's generally better to define all API endpoints within their respective router files.
app.get("/api/notes", (req, res) => {
  res.send(
    "Welcome to the Notes API! (This route might be shadowed by noteRoutes)"
  );
});
app.get("/api/user", (req, res) => {
  res.send(
    "Welcome to the User API! (This route might be shadowed by userRoutes)"
  );
});

// Root API endpoints
app.get("/", (req, res) => {
  res.send("Welcome to the API! Try /api/notes or /api/user");
});
app.get("/api", (req, res) => {
  res.send("Connected to the API!");
});

// Connect to MongoDB and then start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    // Exit the process if database connection fails, as the app cannot function without it
    process.exit(1);
  });

// Export the app for testing or further configuration
module.exports = app;

// IMPORTANT: The "TypeError: Missing parameter name" is almost certainly
// within your 'userRoutes.js' file (or any other route file you might have that's not shown).
// Please double-check all route definitions in 'userRoutes.js' for paths
// that contain a colon (':') but are missing the parameter name immediately after it.
//
// Example of an INCORRECT route (causes the error):
// router.get('/users/:', ...)
//
// Example of a CORRECT route:
// router.get('/users/:id', ...)
// router.post('/users/register', ...) // For static paths, no colon is needed.
