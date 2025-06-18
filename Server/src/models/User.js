const mongoose = require("mongoose");
const crypto = require("crypto");

const Users = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// Function to hash passwords before saving
loginUserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = crypto.createHash("md5").update(this.password).digest("hex");
  next();
});

module.exports = mongoose.model("Users", Users);
