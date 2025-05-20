const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  age: {
    type: BigInt,
    required: true,
  },
  eyecolor: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "TrackingApplication",
  AccountSchema,
  (error) => {
    error ? console.log("Database Error!") : console.log("Database Connected!");
  }
);
