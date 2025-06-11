const mongoose = require("mongoose");

const TrashSchema = new mongoose.Schema(
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
    isFavorite: {
      type: Boolean,
      default: false, // Default value for favorite status
    },
    archivedAt: {
      // Keep this from the original archived note
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    DeletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trashnotes", TrashSchema);
