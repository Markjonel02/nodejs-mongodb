const Users = require("../models/User");
const crypto = require("crypto");
dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Use a strong secret in .env!
const path = require("path");
const fs = require("fs");
const multer = require("multer");
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

// Configure Multer for image uploads
// IMPORTANT: For production, consider cloud storage like Cloudinary, AWS S3, etc.
// This is a basic local storage setup.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../assets/user_img"); // Path relative to your backend root
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Append timestamp and original extension to avoid filename conflicts
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// @desc    Get authenticated user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// @desc    Update authenticated user profile details
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save(); // Mongoose will run validators on save

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    if (error.code === 11000) {
      // Duplicate key error (e.g., email already exists)
      return res.status(400).json({
        message: "Email already exists. Please use a different email.",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// @desc    Upload user profile image
// @route   POST /api/user/profile/upload-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      // If user not found but auth middleware passed, something is wrong.
      return res.status(404).json({ message: "User not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    // If there was an old image, delete it to prevent accumulation
    if (user.profileImageUrl) {
      const oldImagePath = path.join(__dirname, "..", user.profileImageUrl);
      // Check if the old path exists and is not the default placeholder
      if (
        fs.existsSync(oldImagePath) &&
        !oldImagePath.includes("placehold.co")
      ) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old profile image:", err);
        });
      }
    }

    // Store the relative path to the image
    // Assuming your server is configured to serve static files from '/public'
    // E.g., app.use(express.static(path.join(__dirname, 'public')));
    const imageUrl = `/uploads/profile_images/${req.file.filename}`;
    user.profileImageUrl = imageUrl;
    await user.save();

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error in uploadProfileImage:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Make multer upload middleware available to routes
exports.uploadMiddleware = upload.single("profileImage"); // 'profileImage' is the field name from the frontend FormData.append
