// middleware/authMiddleware.js
const jwt = require("jsonwebtoken"); // Assuming you use jsonwebtoken
const User = require("../models/User"); // Import your User model

// Make sure you have a JWT_SECRET in your .env or config
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user from token payload to request object
      req.user = await User.findById(decoded.id).select("-password"); // Exclude password
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
