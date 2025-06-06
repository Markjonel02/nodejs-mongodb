const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ConnectDB = require("./config/Connection");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

ConnectDB(); // Connect to MongoDB
// Load environment variables
const app = express();
const port = /* process.env.PORT ||  */ 5000; // Use PORT from .env or default to 5000

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Sample route

const noteRoutes = require("./routes/noteRoutes");
app.use("/api", noteRoutes); // Prefix all note routes with /api/notes

app.get("/api", (req, res) => {
  res.send("Welcome to the Notes API!");
});

app.delete("/api", (req, res) => {
  res.send("Deleted Successfully!");
});

app.put("/api", (res, req) => {
  res.send("Updated Successfully");
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
