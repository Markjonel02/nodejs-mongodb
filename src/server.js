const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Database Connection Error:", err));

// Import Routes
const accountRoutes = require("./routes/Accountuser");
app.use("/accounts", accountRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`MongoDB URL: ${process.env.MONGO_URL}`);
});
