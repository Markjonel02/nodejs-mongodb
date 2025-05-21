const Accounts = require("../models/Accounts");

module.exports = async (_id, set) => {
  try {
    const result = await Accounts.findByIdAndUpdate(
      _id,
      { $set: set }, // Directly pass the update object
      { new: true } // Returns the updated document
    );

    if (!result) {
      console.log("No document found with the given ID.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("MongoDB update error:", error);
    return false;
  }
};
