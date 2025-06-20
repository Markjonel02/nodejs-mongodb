const Users = require("../models/User");
const crypto = require("crypto");
exports.createuser = async (req, res) => {
  try {
    const { username, password, firstname, lastname, email } = req.body;

    const emailreg = /^\S+@\S+\.\S+$/;

    if (!username || !password || !firstname || !lastname || !email) {
      return res.status(400).json({ message: "All Fields are required!" });
    }

    if (!emailreg.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address!" });
    }

    const cUser = await Users.create({
      username,
      password,
      firstname,
      lastname,
      email,
    });

    return res
      .status(200)
      .json({ message: "Successfully created a new user!", user: cUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.loginuser = async (req, res) => {
  // We'll use 'identifier' for the field that could be either username or email
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      message: "Identifier (username or email) and password are required.",
    });
  }

  try {
    // 1. Hash the incoming password using the same MD5 method for comparison
    const hashedPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    // 2. Find the user in the database.
    //    We use $or to check if the identifier matches either the username or the email.
    const user = await Users.findOne({
      $or: [
        { username: identifier }, // Check if identifier matches username
        { email: identifier }, // Check if identifier matches email
      ],
    });

    // 3. Check if user exists and if the hashed password matches
    if (!user || user.password !== hashedPassword) {
      return res
        .status(401)
        .json({ message: "Invalid identifier or password." });
    }

    // 4. Login successful
    res.status(200).json({
      message: "Login successful!",
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
