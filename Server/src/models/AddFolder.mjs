const mongoose = require("mongoose");

const addFolderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  color: { type: String, default: "blue.100" },
  createdAt: { type: Date, default: Date.now },
});

const AddFolder = mongoose.model("AddFolder", addFolderSchema);
