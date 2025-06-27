const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/Connection");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

// Load environment variables
const app = express();
const port = process.env.PORT || 5000; // Use PORT from .env or default to 5000
// __dirname is a global variable in Node.js, no need to declare it.

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  // Serve static files from the React app in development mode
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
    })
  );
}

if (process.env.NODE_ENV === "production") {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, "../../Client/dist")));

  // Handle any requests that don't match the above routes with React's index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../Client", "dist", "index.html"));
  });
}

const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api/notes", noteRoutes); // Prefix all note routes with /api/notes
app.use("/api/user", userRoutes);
app.get("/api/notes", (req, res) => {
  res.send("Welcome to the Notes API!");
});
app.get("/", (req, res) => {
  res.send("Welcome to the API! Try /api/notes or /api/user");
});
app.get("/api", (req, res) => {
  res.send("Connected to the API!");
});
app.get("/api/user", (req, res) => {
  res.send("welcome to user");
});

/* app.get("/api/user/settings", (req, res) => {
  res.send("Welcome to the Notes API!");
}); */

module.exports = app; // Export the app for testing or further configuration
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
