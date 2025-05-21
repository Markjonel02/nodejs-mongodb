const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

/* Middleware */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Routes */
const accountRoutes = require("./routes/Accountuser");
app.use("/accounts", accountRoutes);

/* MongoDB Connection */
const dbConfig = "mongodb://localhost:27017";
const dbName = "TrackingApplications";
const uri = `${dbConfig}/${dbName}`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    /* Start server only after successful DB connection */
    app.listen(port, () => {
      console.log(`Application is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if DB connection fails
  });
