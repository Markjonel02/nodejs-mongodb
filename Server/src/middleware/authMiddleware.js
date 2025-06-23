const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library
dotenv = require("dotenv"); // Import dotenv to manage environment variables
dotenv.config(); // Load environment variables from .env file
const JWT_SECRET = process.env.JWT_SECRET; // Use a strong secret from .env for signing JWTs

/**
 * Middleware to authenticate JWT tokens from incoming requests.
 * It checks for a token in the 'Authorization' header, verifies it,
 * and attaches the decoded user payload to the `req.user` object.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
exports.authenticateToken = (req, res, next) => {
  // 1. Get the Authorization header from the request.
  //    Tokens are typically sent as: "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers["authorization"];

  // 2. Extract the token.
  //    If authHeader exists, split it by space and take the second part (the token itself).
  const token = authHeader && authHeader.split(" ")[1];

  // 3. Check if a token was provided.
  if (!token) {
    // If no token is found, return a 401 Unauthorized response.
    // This means the client tried to access a protected resource without authentication.
    console.warn("Authentication failed: No token provided.");
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided." });
  }

  // 4. Verify the token.
  //    jwt.verify(token, secretKey, callback)
  //    This function decodes the token and verifies its signature using the secret key.
  try {
    // If verification is successful, `decoded` will contain the payload
    // that was signed into the token (e.g., { id: userId, username: userUsername }).
    const decoded = jwt.verify(token, JWT_SECRET);

    // 5. Attach the decoded user payload to the request object.
    //    This makes the user's information (like their ID) available
    //    to subsequent middleware and route handlers (e.g., `req.user.id`).
    req.user = decoded;

    // 6. Call `next()` to pass control to the next middleware or the route handler.
    next();
  } catch (error) {
    // 7. Handle token verification errors.
    //    If jwt.verify throws an error, it means the token is invalid (e.g., malformed, expired, bad signature).
    console.error("JWT verification error:", error.message);

    // Return a 403 Forbidden response.
    // This typically means the client provided a token, but it was invalid or expired.
    return res
      .status(403)
      .json({ message: "Access Denied: Invalid or expired token." });
  }
};
