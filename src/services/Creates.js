const Accounts = require("../models/Accounts");

module.exports = async (name, address, age, eyecolor) => {
  try {
    await Accounts.Tbl_user.insertMany({ name, address, age, eyecolor }); // Wrap in an array
    return true;
  } catch (error) {
    console.error("MongoDB insertMany error:", error);
    return false;
  }
};
