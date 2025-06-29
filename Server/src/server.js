const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/Connection");
/* const path = require("path"); */
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

// Load environment variables
const app = express();
const port = process.env.PORT; // Use PORT from .env or default to 5000

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* app.use(express.static(path.join(__dirname, "public"))); */
// Sample route
// Configure CORS to allow requests from your Vercel frontend URL
const corsOptions = {
  origin: process.env.CLIENT_URL, // Set this in Vercel env variables
  credentials: true, // If you're sending cookies/auth headers
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api", noteRoutes); // Prefix all note routes with /api/notes
app.use("/api/user", userRoutes);
app.get("/api", (req, res) => {
  res.send("Welcome to the Notes API!");
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
