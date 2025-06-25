const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Import bcrypt instead of crypto for hashing

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Add unique constraint for username
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // Add unique constraint for email
      trim: true,
      lowercase: true, // Store emails in lowercase for consistency
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
  },
  { timestamps: true }
); // Add timestamps for createdAt and updatedAt fields

// --- Mongoose Middleware to Hash Password Before Saving ---
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds (cost factor)
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// --- Method to Compare Passwords ---
// This method will be called on a User document (e.g., user.comparePassword('plainTextPassword'))
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Compare the provided plaintext password with the hashed password stored in the database
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
