const Accounts = require("../models/Accounts");

module.exports = async (name, address, age, eyecolor) => {
  try {
    // Ensure data is wrapped in an array
    await Accounts.create({ name, address, age, eyecolor });

    return { success: true, message: "Data inserted successfully" };
  } catch (error) {
    console.error("MongoDB insertMany error:", error);

    return { success: false, error: error.message };
  }
};
