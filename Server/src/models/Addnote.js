const mongoose = require("mongoose");

const AddnoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    color: {
      // To store the color associated with the note (e.g., 'yellow.200' from Chakra UI)
      type: String,
      default: "gray.200", // A default color if none is provided
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
// Update 'updatedAt' field on save
AddnoteSchema.pre("save", function (next) {
  if (this.isNew) {
    this.date = new Date();
  }
  next();
});

module.exports = mongoose.model("Addnote", AddnoteSchema);
