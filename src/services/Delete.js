const Accounts = require("../models/Accounts");

module.exports = async (_id) => {
  try {
    await Accounts.deleteOne({ _id: _id });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
