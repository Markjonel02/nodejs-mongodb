import Users from "../models/User.mjs";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config(); // Load environment variables from .env file

const JWT_SECRET = process.env.JWT_SECRET;
exports.createuser = async (req, res) => {
  try {
    // Changed firstname and lastname to firstName and lastName to match frontend
    const { username, password, firstName, lastName, email } = req.body;

    // --- Input Validation ---
    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Basic email format validation (optional: you can also rely on Mongoose schema match)
    const emailreg = /^\S+@\S+\.\S+$/;
    if (!emailreg.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address!" });
    }

    // --- Check for Existing User (Username or Email) ---
    // This is crucial to prevent duplicate registrations
    const existingUser = await Users.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({
          message: "Username already exists. Please choose a different one.",
        });
      }
      if (existingUser.email === email) {
        return res.status(409).json({
          message:
            "Email address already registered. Please use a different one or log in.",
        });
      }
    }

    // --- Create User ---
    // The password will be automatically hashed by the pre('save') hook in your User model
    const cUser = await Users.create({
      username,
      password, // Send plain password, Mongoose pre-save hook will hash it
      // Ensure these fields match your Mongoose schema property names
      firstname: firstName, // Map frontend firstName to backend firstname
      lastname: lastName, // Map frontend lastName to backend lastname
      email,
    });

    // --- Generate JWT (Optional: Auto-login after registration) ---
    // If you want the user to be automatically logged in after successful registration,
    // generate a JWT here and send it back.
    const token = jwt.sign(
      { id: cUser._id, username: cUser.username },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // --- Success Response ---
    return res
      .status(201) // 201 Created is more semantically correct for resource creation
      .json({
        message: "User registered successfully!",
        user: {
          id: cUser._id,
          username: cUser.username,
          email: cUser.email,
          firstname: cUser.firstname, // Send back as 'firstname' if your frontend expects it
          lastname: cUser.lastname, // Send back as 'lastname' if your frontend expects it
        },
        token: token, // Send the token if auto-logging in
      });
  } catch (error) {
    console.error("Error creating user:", error);

    // More specific error handling for Mongoose duplicate key errors (code 11000)
    // This catches cases where the 'unique: true' constraint on username/email is violated.
    if (error.code === 11000) {
      let field = Object.keys(error.keyValue)[0];
      let value = error.keyValue[field];
      return res
        .status(409)
        .json({ message: `${field} '${value}' already exists.` });
    }

    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
exports.loginuser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      message: "Identifier (username or email) and password are required.",
    });
  }

  try {
    const user = await Users.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        // Ensure these match your database schema and frontend expectations
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};
