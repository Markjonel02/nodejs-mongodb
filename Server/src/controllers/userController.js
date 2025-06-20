const Users = require("../models/User");

exports.createuser = async (req, res) => {
  try {
    const { username, password, firstname, lastname, email } = req.body;
    const emailreg = "/^S+@S+.S+$/";
    if (!username || !password || !firstname || !lastname || !email) {
      return res.status(400).json({ message: "All Fields are required!" });
    }
    if (emailreg.test(email)) {
      return res
        .status(400)
        .json({ message: "please enter a valid emailaddress" });
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
      .json({ message: "successfully created a new user!", user: cUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
