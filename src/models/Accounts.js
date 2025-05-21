const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define schema
const AccountSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  age: { type: Number, required: true },
  eyecolor: { type: String, required: true },
});

// Create and export model
const AccountModel = mongoose.model("TrackingApplication", AccountSchema);

module.exports = AccountModel;
