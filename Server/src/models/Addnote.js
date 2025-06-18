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
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Addnote", AddnoteSchema);
