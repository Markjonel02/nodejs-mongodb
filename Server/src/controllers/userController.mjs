// Server/src/controllers/userController.js

// Change import statements to require

import Users from "../models/User.mjs"; // Ensure this path is correct for your project structure
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config(); // Load environment variables from .env file

const JWT_SECRET = process.env.JWT_SECRET;

// Define functions
export const createuser = async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const emailreg = /^\S+@\S+\.\S+$/;
    if (!emailreg.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address!" });
    }

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

    const cUser = await Users.create({
      username,
      password,
      firstname: firstName,
      lastname: lastName,
      email,
    });

    const token = jwt.sign(
      { id: cUser._id, username: cUser.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: cUser._id,
        username: cUser.username,
        email: cUser.email,
        firstname: cUser.firstname,
        lastname: cUser.lastname,
      },
      token: token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
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

export const loginuser = async (req, res) => {
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

    // Assuming user.comparePassword is a method on your Mongoose User model
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

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user is set by your auth middleware

    const user = await Users.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstname, lastname, email } = req.body;

    if (!firstname || !lastname || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { firstname, lastname, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      id: updatedUser._id,
      username: updatedUser.username,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await Users.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    res.status(200).json({
      message: "Password reset token generated successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("Error generating password reset token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- ESSENTIAL CHANGE: Export all functions as properties of module.exports ---
// This acts like a "default object export" in CommonJS, allowing other files
// to 'require' this file and access its functions.
