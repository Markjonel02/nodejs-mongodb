const Accounts = require("../models/Accounts");

module.exports = async (name, address, age, eyecolor) => {
  try {
    await Accounts.insertMany({ name, address, age, eyecolor });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
