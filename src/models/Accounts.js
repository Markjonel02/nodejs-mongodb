const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  name: String,
  address: String,
  age: Number,
  eyecolor: String,
});

module.exports = mongoose.model("Accounts", AccountSchema);
