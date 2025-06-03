const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ConnectDB = require("./config/Connection");

ConnectDB(); // Connect to MongoDB
// Load environment variables
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Sample route

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
