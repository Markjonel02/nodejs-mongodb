const Addnote = require("../models/Addnote");
const Trashnotes = require("../models/Trash");
const Archived = require("../models/Archived");
const Trash = require("../models/Trash");
const mongoose = require("mongoose");
// Create a new note
exports.createNote = async (req, res) => {
  console.log("Request received for createNote.");
  console.log("Request body:", req.body); // Check if data is coming through

  try {
    // IMPORTANT: This controller ASSUMES that the `authenticateToken` middleware
    // has run BEFORE this controller and has populated `req.user` with the
    // decoded JWT payload (e.g., { id: userId, username: userUsername }).

    // 1. Get the authenticated user's ID from req.user
    const userId = req.user.id;

    // Check if userId is available (should be if middleware ran correctly)
    if (!userId) {
      console.warn("Attempt to create note without authenticated user ID.");
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found. Please log in." });
    }

    const { title, notes, color } = req.body;

    // Basic input validation (optional, but good practice)
    if (!title || !notes) {
      return res
        .status(400)
        .json({ message: "Title and notes content are required." });
    }

    console.log("Attempting to create note in DB for user:", userId);
    // 2. Create the note, associating it with the authenticated userId
    const note = await Addnote.create({
      title,
      notes,
      color: color || "#FFFFFF", // Provide a default color if not specified
      userId: userId, // Associate the note with the user's ID
    });

    console.log("Note created successfully:", note);
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    console.error("Error in createNote controller:", error); // Log the full error object
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from req.user
    if (!userId) {
      return;
      console.warn("Attempt to fetch notes without authenticated user ID.");
      res
        .status(401)
        .json({ message: "Unauthorized: User ID not found. Please log in." });
    }
    // Corrected to fetch ALL notes as there's no user ID to filter by yet.
    // .sort({ createdAt: -1 }) is optional, but good for showing newest notes first.
    const notes = await Addnote.find({ userId: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, notes, color } = req.body;

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Note ID and user authentication required!" });
    }

    // Securely find the user's note and update it
    const updatedNote = await Addnote.findOneAndUpdate(
      { _id: id, userId: userId }, // Match both note ID and user
      { title, notes, color },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied." });
    }

    return res
      .status(200)
      .json({ message: "Note updated successfully!", updatedNote });
  } catch (error) {
    console.error(`Error updating notes: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a note and move it to the Trash collection

exports.delNotes = async (req, res) => {
  try {
    const { id } = req.params;
    // Get the authenticated user's ID from req.user (populated by JWT middleware)
    const userId = req.user.id;

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Note ID and user ID are required." });
    }

    // 1. Find the note in the main collection, ensuring it belongs to the authenticated user.
    const noteToDelete = await Addnote.findOne({ _id: id, userId });
    if (!noteToDelete) {
      // Return 404 if not found, or 403 if found but doesn't belong to user
      return res.status(404).json({
        message: "Note not found or you don't have permission to delete it.",
      });
    }

    // 2. Create a new document in the Trashnotes collection.
    // CRUCIAL: Pass the userId to the Trashnotes document to keep it user-specific.
    // Use `noteToDelete.toObject()` to get a plain JS object, then add/override fields.
    await Trashnotes.create({
      ...noteToDelete.toObject(), // Copy all properties from the original note
      _id: noteToDelete._id, // Keep the same _id for easier restoration later if needed
      userId: userId, // Explicitly set the userId for the trash entry
      deletedAt: new Date(), // Add a timestamp for when it was moved to trash

      //
    });

    // 3. Delete the original note from the main collection.
    await Addnote.deleteOne({ _id: id, userId });

    return res
      .status(200)
      .json({ message: "Note successfully moved to trash!" });
  } catch (error) {
    console.error("Error moving note to trash:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --- DELETE TRASH PERMANENTLY ---
exports.getTrashNotes = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from req.user
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found. Please log in." });
    }
    console.log(`Fetching trashed notes for user ID: ${userId}`);
    // Fetch all notes from the Trash collection
    const trashNotes = await Trash.find({ userId: userId }).sort({
      deletedAt: -1,
    });
    console.log(`Found ${trashNotes.length} trashed notes for user ${userId}`);
    res.status(200).json(trashNotes);
  } catch (error) {
    console.error("Error fetching trash notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.delPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "ID and Authentication are required!" });
    }

    // Make sure the note belongs to the user
    const tDelete = await Trash.findOne({ _id: id, userId });
    if (!tDelete) {
      return res
        .status(404)
        .json({ message: "Trash note not found or unauthorized access." });
    }

    // Delete the trash note
    await Trash.deleteOne({ _id: id, userId });

    return res
      .status(200)
      .json({ message: "Trash note deleted successfully!" });
  } catch (error) {
    console.error("Error deleting trash note:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

exports.delPermanentSingle = async (req, res) => {
  try {
    const { id } = req.params; // ID of the note to permanently delete
    const userId = req.user.id; // Get the authenticated user's ID

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Note ID and user ID are required." });
    }

    // Delete only the note belonging to the authenticated user from the Trashnotes collection
    const result = await Trashnotes.deleteOne({ _id: id, userId: userId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Note not found in trash or access denied." });
    }

    res.status(200).json({ message: "Note permanently deleted from trash." });
  } catch (error) {
    console.error("Error permanently deleting single note from trash:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.delPermanentMultiple = async (req, res) => {
  try {
    const { ids } = req.body; // Array of note IDs to permanently delete
    const userId = req.user.id; // Get the authenticated user's ID

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !userId) {
      return res
        .status(400)
        .json({ message: "Note IDs and user ID are required." });
    }

    // Delete only notes belonging to the authenticated user from the Trashnotes collection
    const result = await Trashnotes.deleteMany({
      _id: { $in: ids },
      userId: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message:
          "No matching notes found in trash for permanent deletion or access denied.",
      });
    }

    res.status(200).json({
      message: `${result.deletedCount} note(s) permanently deleted from trash.`,
    });
  } catch (error) {
    console.error(
      "Error permanently deleting multiple notes from trash:",
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --- RESTORE TO NOTES (Single Note from Trash) ---
exports.restoreSingleNotetrash = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Note ID and user ID are required." });
    }

    // Find the note in trash
    const trashNote = await Trash.findOne({ _id: id, userId }).lean();
    if (!trashNote) {
      return res.status(404).json({ message: "Note not found in trash." });
    }

    // Recreate in Addnote
    const { _id, ...rest } = trashNote;
    const newNote = new Addnote({
      ...rest,
      isArchived: false,
      ArchivedAt: null,
      updatedAt: new Date(),
      createdAt: trashNote.createdAt,
    });
    const restoredNote = await newNote.save();

    // Delete from Trash
    await Trash.deleteOne({ _id: id, userId });

    res.status(200).json({
      message: "Note restored successfully!",
      note: restoredNote,
    });
  } catch (error) {
    console.error("Error restoring note:", error);
    res.status(500).json({
      message: "Server error while restoring note.",
      error: error.message,
    });
  }
};

exports.restoreMultipleTrash = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    // 1. Validate input
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every((id) => typeof id === "string")
    ) {
      return res.status(400).json({
        message:
          "Invalid request: 'ids' must be a non-empty array of note IDs.",
      });
    }

    // 2. Find only the trash notes that belong to the authenticated user
    const noteTrash = await Trash.find({
      _id: { $in: ids },
      userId: userId,
    }).lean();

    if (noteTrash.length === 0) {
      return res.status(404).json({
        message: "No matching trash notes found for this user.",
      });
    }

    // 3. Prepare the notes for restoration
    const restoredNotesData = noteTrash.map(({ _id, ...note }) => ({
      ...note,
      isArchived: false,
      ArchivedAt: null,
      updatedAt: new Date(),
      createdAt: note.createdAt,
    }));

    // 4. Insert into Addnote collection
    await Addnote.insertMany(restoredNotesData);

    // 5. Delete from Trash only the matched notes
    await Trash.deleteMany({
      _id: { $in: noteTrash.map((n) => n._id.toString()) },
      userId: userId,
    });

    return res.status(200).json({
      message: `Successfully restored ${noteTrash.length} note(s).`,
      restoredCount: noteTrash.length,
    });
  } catch (error) {
    console.error("Error restoring multiple Trash notes:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid note ID format provided.",
      });
    }
    return res.status(500).json({
      message: "Server error: Unable to restore notes. Please try again later.",
    });
  }
};

//getting deleted notes from trash

//Archived  controller section

exports.archivedNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || !userId) {
      return res.status(400).json({ message: "Note ID is required!" });
    }

    // Securely find note with both ID and user
    const noteToArchive = await Addnote.findOne({ _id: id, userId }).lean();
    if (!noteToArchive) {
      return res
        .status(404)
        .json({ message: "Note could not be found or you don't have access." });
    }

    const archivedNoteData = {
      ...noteToArchive,
      isArchived: true,
      ArchivedAt: new Date(),
    };

    await Archived.create(archivedNoteData);

    await Addnote.deleteOne({ _id: id, userId });

    return res.status(200).json({ message: "Successfully moved to Archived!" });
  } catch (error) {
    console.error("Error archiving notes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//getting archived notes
exports.getArchivedNotes = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from req.user
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found. Please log in." });
    }
    // Fetch all notes from the Archived collection
    const archivedNotes = await Archived.find({ userId }).sort({
      ArchivedAt: -1,
    });
    res.status(200).json(archivedNotes);
  } catch (error) {
    console.error("Error fetching archived notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//delete single Archived notes in archivedNotes
exports.delArchivedNoteSingle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Note ID and user ID are required." });
    }

    const archivedNote = await Archived.findOne({ _id: id, userId }).lean();
    if (!archivedNote) {
      return res.status(404).json({ message: "Note not found in archive." });
    }

    const trashNote = await Trash.create({
      ...archivedNote,
      DeletedAt: new Date(),
    });

    await Archived.deleteOne({ _id: id, userId });

    res.status(200).json({
      message: "Archived note moved to trash successfully!",
      trashNoteID: trashNote._id,
    });
  } catch (error) {
    console.error("Error moving archived note to trash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete Multiple in Archived notes
exports.deleteMultipleArchivedNotes = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0 || !userId) {
      return res.status(400).json({
        message:
          "Invalid request: 'ids' must be a non-empty array of note IDs.",
      });
    }

    let movedCount = 0;
    let failedCount = 0;
    const failedIds = [];

    for (const id of ids) {
      try {
        const archivedNote = await Archived.findOne({ _id: id, userId }).lean();
        if (archivedNote) {
          await Trash.create({
            ...archivedNote,
            deletedAt: new Date(),
          });

          await Archived.deleteOne({ _id: id, userId });
          movedCount++;
        } else {
          console.warn(`Note with ID ${id} not found or unauthorized.`);
        }
      } catch (innerError) {
        console.error(`Error processing note ID ${id}:`, innerError);
        failedCount++;
        failedIds.push(id);
      }
    }

    res.status(200).json({
      message: `${movedCount} note(s) moved to trash successfully. ${failedCount} note(s) failed.`,
      movedCount,
      failedCount,
      failedIds,
    });
  } catch (error) {
    console.error("Error moving multiple archived notes to trash:", error);
    res
      .status(500)
      .json({ message: "Internal server error during batch deletion." });
  }
};

//restore multiple
exports.restoreMultipleNotes = async (req, res) => {
  try {
    const { ids } = req.body;

    // 1. Input Validation: Ensure 'ids' is a valid array
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every((id) => typeof id === "string")
    ) {
      return res.status(400).json({
        message:
          "Invalid request: 'ids' must be a non-empty array of note IDs.",
      });
    }

    // 2. Find and Prepare Notes for Restoration:
    //    Fetch notes from Archived collection and prepare them for Addnote collection.
    const notesToRestore = await Archived.find({ _id: { $in: ids } }).lean(); // .lean() for plain JS objects

    if (notesToRestore.length === 0) {
      return res.status(404).json({
        message: "No archived notes found with the provided IDs.",
      });
    }

    const restoredNotesData = notesToRestore.map((note) => ({
      ...note, // Spread existing note properties
      _id: undefined, // Let Mongoose generate a new _id for Addnote
      isArchived: false,
      ArchivedAt: null,
      updatedAt: new Date(),
      createdAt: note.createdAt,
    }));

    // 3. Move Notes to Addnote Collection:
    //    Insert all prepared notes into the Addnote collection.
    await Addnote.insertMany(restoredNotesData);

    // 4. Delete Notes from Archived Collection:
    //    Remove the notes from the Archived collection.
    await Archived.deleteMany({ _id: { $in: ids } });

    // 5. Success Response:
    return res.status(200).json({
      message: `Successfully restored ${notesToRestore.length} note(s).`,
      restoredCount: notesToRestore.length,
    });
  } catch (error) {
    console.error("Error restoring multiple archived notes:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid note ID format provided.",
      });
    }
    return res.status(500).json({
      message: "Server error: Unable to restore notes. Please try again later.",
    });
  }
};
//restore single notes
exports.restoreSingleNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // This is correctly extracted from the middleware

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Note ID and user ID are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID format." });
    }

    const archivedNote = await Archived.findOne({ _id: id, userId }).lean();
    if (!archivedNote) {
      return res.status(404).json({ message: "Archived note not found." });
    }

    // --- FIX IS HERE: Add userId to the Addnote.create object ---
    const restoredNote = await Addnote.create({
      title: archivedNote.title,
      notes: archivedNote.notes,
      color: archivedNote.color,
      isFavorite: archivedNote.isFavorite || false,
      createdAt: archivedNote.createdAt,
      userId: userId, // <--- ADD THIS LINE
    });

    // Optionally, if your Addnote schema has a updatedAt field and it's set to auto-update
    // you might want to consider if createdAt should be specifically carried over or if the new
    // note should get a fresh createdAt timestamp. For restoration, carrying it over might be desired.

    await Archived.deleteOne({ _id: id, userId });

    return res.status(200).json({
      message: "Archived note restored successfully!",
      note: restoredNote,
    });
  } catch (error) {
    console.error("Error restoring single archived note:", error);
    // Be more specific in the error message if it's a validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createFavorite = async (req, res) => {
  try {
    const { id } = req.params; // Expects ID from URL param
    let { isFavorite } = req.body; // Expects the new status from body (boolean)
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Note ID is required." });
    }
    if (!userId) {
      // Should be caught by auth middleware, but good as a fallback
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found." });
    }
    if (typeof isFavorite !== "boolean") {
      // Ensure isFavorite is a boolean
      return res
        .status(400)
        .json({ message: "isFavorite status must be a boolean." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID format." });
    }

    const note = await Addnote.findOneAndUpdate(
      { _id: id, userId: userId }, // Find by ID AND userId to ensure ownership
      { $set: { isFavorite: isFavorite } },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you do not have permission to modify it.",
      });
    }

    const message = isFavorite
      ? "Note added to favorites."
      : "Note removed from favorites.";
    res.status(200).json({ message, note }); // Send back message and the updated note
  } catch (error) {
    console.error("Error in toggleFavoriteStatus controller:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Invalid Note ID format.", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getFavoriteNotes = async (req, res) => {
  try {
    console.log("Fetching favorite notes...");
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User ID not found. Please log in.",
      });
    }

    const favoriteNotes = await Addnote.find({
      userId,
      isFavorite: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!favoriteNotes.length) {
      console.log("No favorite notes found for user:", userId); // More specific
      return res.status(200).json([]);
    }
    console.log(
      `Retrieved ${favoriteNotes.length} favorite notes for user:`,
      userId
    ); // Only logs if notes exist
    return res.status(200).json(favoriteNotes);
  } catch (error) {
    console.error("Error fetching favorite notes:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.unfavoriteSingle = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[INFO] Request received to unfavorite note ID: ${id}`);

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`[ERROR] Invalid ID format: ${id}`);
      return res.status(400).json({ message: "Invalid note ID format." });
    }

    // Update isFavorite to false and return updated document
    const note = await Addnote.findByIdAndUpdate(
      id,
      { isFavorite: false },
      { new: true }
    );

    if (!note) {
      console.log(`[ERROR] Note with ID ${id} not found.`);
      return res.status(404).json({ message: "Note not found." });
    }

    // Fetch remaining favorite notes
    const favoriteNotes = await Addnote.find({ isFavorite: true }).lean();

    console.log(`[SUCCESS] Note ${id} unfavorited successfully.`);

    res.status(200).json({
      message: `Note with ID ${id} has been unfavorited successfully.`,
      unfavoritedNote: note,
      favoriteNotes,
    });
  } catch (error) {
    console.error("[ERROR] unfavoriteNote controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Correct controller (with IDs in req.body)
exports.unfavoriteMultiple = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "An array of IDs is required." });
    }

    // Validate IDs
    const invalidIds = ids.filter((id) => !mongoose.isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json({ message: "Some IDs are invalid.", invalidIds });
    }

    // Perform update
    const result = await Addnote.updateMany(
      { _id: { $in: ids } },
      { $set: { isFavorite: false } }
    );

    res.status(200).json({
      message: "Notes unfavorited.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error.", error });
  }
};
