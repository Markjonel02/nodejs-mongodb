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
      type: String,
      default: "gray.200",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    ArchivedAt: {
      type: Date,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false, // Default value for favorite status
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
      ref: "User", // This should match your User model's name
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now, // Automatically set to the current date when the note is deleted
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trashnotes", TrashSchema);
