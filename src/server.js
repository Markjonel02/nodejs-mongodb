const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

/* middleware  */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* routes */
const accountRoutes = require("./routes/Accountuser");
app.use("/accounts", accountRoutes);

/* mongo db connection */
const dbConfig = "mongodb://localhost:27017";
const dbName = "TrackingApplication";

const uri = `${dbConfig}/${dbName}`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* starting server */
app.listen(port, () => {
  console.log(`Applicatioon is running on port:${port}`, {
    useNewUrlParser: true,
    usedUnifiedtopology: true,
  });
});
