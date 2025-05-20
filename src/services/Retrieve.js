const Accounts = require("../models/Accounts");

module.exports = async () => {
  try {
    const results = await Accounts.find();
    return results;
  } catch (error) {
    console.log(error);
    return [];
  }
};
