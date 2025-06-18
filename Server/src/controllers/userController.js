Users = require("../models/User");

exports.createuser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(404)
        .json({ message: "username and password are required" });
    }
    const cUser = await Users.create({ username, passsword });
    return res
      .status(200)
      .json({ message: "successfully created a new user!", user: cUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
