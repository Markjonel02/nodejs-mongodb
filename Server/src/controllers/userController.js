const Users = require("../models/User");
const crypto = require("crypto");
dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Use a strong secret in .env!

exports.createuser = async (req, res) => {
  try {
    const { username, password, firstname, lastname, email } = req.body;

    // --- Input Validation ---
    if (!username || !password || !firstname || !lastname || !email) {
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
      firstname,
      lastname,
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
          firstname: cUser.firstname,
          lastname: cUser.lastname,
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
  // We'll use 'identifier' for the field that could be either username or email
  const { identifier, password } = req.body;

  // --- 1. Input Validation ---
  if (!identifier || !password) {
    return res.status(400).json({
      message: "Identifier (username or email) and password are required.",
    });
  }

  try {
    // --- 2. Find the user in the database.
    // We use $or to check if the identifier matches either the username or the email.
    const user = await Users.findOne({
      $or: [
        { username: identifier }, // Check if identifier matches username
        { email: identifier }, // Check if identifier matches email
      ],
    });

    // --- 3. Check if user exists ---
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    // --- 4. Compare the provided password with the stored hashed password ---
    // Use the comparePassword method from your User model (which uses bcrypt)
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    // --- 5. Login successful: Generate a JWT ---
    // The token payload contains essential user information (e.g., _id, username).
    const token = jwt.sign(
      { id: user._id, username: user.username }, // Payload: data to store in the token
      JWT_SECRET, // Your secret key for signing
      { expiresIn: "1h" } // Token expiration time (e.g., 1 hour)
    );

    // --- 6. Send success response with token ---
    res.status(200).json({
      message: "Login successful!",
      token: token, // Send the generated token back to the client
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
