const Accounts = require("../models/Accounts");

module.exports = async (_id, obj) => {
  try {
    await Accounts.update(
      { _id },
      {
        $set: {
          ...obj,
        },
      }
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
