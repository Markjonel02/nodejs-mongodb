const mongoose = require("mongoose");
const ArchivedSchema = new mongoose.Schema(
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
    isFavorite: {
      type: Boolean,
      default: false, // Default value for favorite status
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    ArchivedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Archived", ArchivedSchema);
