import mongoose from "mongoose";

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
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Defines this as an ObjectId
      ref: "User", // References the 'User' model
      required: true, // A note must belong to a user
    },
    /*     user: { type: mongoose.Types.ObjectId, ref: "User", required: true }, */
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Addnote", AddnoteSchema);
