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
    const { title, notes, color } = req.body;
    // ... rest of your code ...
    console.log("Attempting to create note in DB...");
    const note = await Addnote.create({ title, notes, color });
    console.log("Note created successfully:", note);
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    console.error("Error in createNote controller:", error); // Log the full error object
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getNotes = async (req, res) => {
  try {
    // Corrected to fetch ALL notes as there's no user ID to filter by yet.
    // .sort({ createdAt: -1 }) is optional, but good for showing newest notes first.
    const notes = await Addnote.find({}).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a note and move it to the Trash collection
exports.delNotes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Note ID is Required!" });
    }

    //find notes before deleting
    const noteDelete = await Addnote.findById(id);
    if (!noteDelete) {
      return res.status(404).json({ message: "Note could note be Found!" });
    }
    //mobe and create collection
    await Trashnotes.create(noteDelete.toObject());

    await Addnote.findByIdAndDelete(id);

    // Check if any document was actually deleted
    if (noteDelete === 0) {
      return res.status(404).json({ message: "Note not Found!" });
    }

    // If successful, send a success message.
    return res
      .status(200)
      .json({ message: "Successfully deleted and moved to trash!" });
  } catch (error) {
    console.error("Error Deleting notes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// --- DELETE TRASH PERMANENTLY ---
exports.delPermanently = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID presence
    if (!id) {
      return res.status(400).json({ message: "ID is required!" });
    }

    // Check if the note exists before deletion
    const tDelete = await Trash.findById(id);
    if (!tDelete) {
      return res
        .status(404)
        .json({ message: "No trash note found with the given ID!" });
    }

    // Delete the trash note
    await Trash.findByIdAndDelete(id);

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
exports.delPermanentlyMultiple = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate that IDs are provided and it's an array
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid note IDs provided for deletion." });
    }

    // Validate all IDs are valid MongoDB ObjectId formats
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res
        .status(400)
        .json({ message: "None of the provided IDs are valid." });
    }

    // Perform bulk delete operation
    const deleteResult = await Trash.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      message: `${deleteResult.deletedCount} note(s) permanently deleted.`,
      deletedCount: deleteResult.deletedCount,
      invalidIds: ids.filter((id) => !validIds.includes(id)), // Return invalid IDs for reference
    });
  } catch (error) {
    console.error("Error permanently deleting multiple notes:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during batch deletion." });
  }
};

// --- RESTORE TO NOTES (Single Note from Trash) ---
exports.restoreSingleNotetrash = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID of the note to restore from the URL parameters

    // 1. Find the note in the Trash collection
    const trashNote = await Trash.findById(id);

    // If no note is found in trash with the given ID, return a 404 error
    if (!trashNote) {
      return res.status(404).json({ message: "Note not found in trash." });
    }

    // 2. Create a new Addnote instance with the data from the trash note
    // We carefully select the fields relevant for Addnote, resetting 'isArchived' and 'ArchivedAt'
    const newAddnote = new Addnote({
      title: trashNote.title,
      notes: trashNote.notes,
      color: trashNote.color,
      isFavorite: trashNote.isFavorite,
      isArchived: false, // When restoring, it should no longer be archived
      ArchivedAt: null, // Reset ArchivedAt
      createdAt: trashNote.createdAt, // Set a new createdAt timestamp for the restored note
      updatedAt: new Date(), // Set a new updatedAt timestamp
    });

    // Save the new note to the Addnote collection
    const restoredNote = await newAddnote.save();

    // 3. Delete the original note from the Trash collection
    await Trash.findByIdAndDelete(id);

    // Respond with a success message and the newly restored note
    res.status(200).json({
      message: "Note restored successfully!",
      note: restoredNote,
    });
  } catch (error) {
    // Handle any errors that occur during the process
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
    const noteTrash = await Trash.find({ _id: { $in: ids } }).lean(); // .lean() for plain JS objects

    if (noteTrash.length === 0) {
      return res.status(404).json({
        message: "No archived notes found with the provided IDs.",
      });
    }

    const restoredNotesData = noteTrash.map((note) => ({
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
    await Trash.deleteMany({ _id: { $in: ids } });

    // 5. Success Response:
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
exports.getTrashNotes = async (req, res) => {
  try {
    // Fetch all notes from the Trash collection
    const trashNotes = await Trashnotes.find({}).sort({ createdAt: -1 });
    res.status(200).json(trashNotes);
  } catch (error) {
    console.error("Error fetching trash notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Archived  controller section
exports.updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes, color } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Note ID is required!" });
    }

    // Find and update the note
    const updatedNote = await Addnote.findOneAndUpdate(
      { _id: id },
      { $set: { title, notes, color } },
      { new: true, runValidators: true } // Returns the updated document
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found!" });
    }

    return res
      .status(200)
      .json({ message: "Note updated successfully!", updatedNote });
  } catch (error) {
    console.error(`Error updating notes: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.archivedNotes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Note ID is Required!" });
    }

    // Find the note before archiving
    const noteToArchive = await Addnote.findById(id);
    if (!noteToArchive) {
      return res.status(404).json({ message: "Note could not be Found!" });
    }

    // Prepare the note for archiving: set isArchived to true and ArchivedAt to now
    const archivedNoteData = noteToArchive.toObject();
    archivedNoteData.isArchived = true;
    archivedNoteData.ArchivedAt = new Date(); // Set current date and time

    // Move and create collection in Archived
    await Archived.create(archivedNoteData);

    // Delete the note from Addnote collection
    await Addnote.findByIdAndDelete(id);

    // If successful, send a success message.
    return res.status(200).json({ message: "Successfully moved to Archived!" });
  } catch (error) {
    console.error("Error archiving notes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//getting archived notes
exports.getArchivedNotes = async (req, res) => {
  try {
    // Fetch all notes from the Archived collection
    const archivedNotes = await Archived.find({}).sort({ createdAt: -1 });
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
    //always find the id first
    const archivedNote = await Archived.findById(id);

    if (!archivedNote) {
      return res.status(404).json({ message: "error" });
      console.log(`error cannot fint the:${archivedNote}`);
    }
    // 2. Create a new document in the Trash collection using the archived note's data
    // destructure the archivedNote object to get its properties,
    // excluding _id and __v so Mongoose generates a new _id for the trash document.
    const trashNote = await Trash.create({
      ...archivedNote.toObject(), // Convert Mongoose document to a plain JavaScript object

      DeletedAt: new Date(), // Set the deletion timestamp
    });

    // 3. Delete the original note from the Archived collection
    await Archived.findByIdAndDelete(id);

    res.status(200).json({
      mesage: "Archived note moved to trash Successfully!",
      trashNoteID: trashNote._id, //return new ._id in server
    });
  } catch (error) {
    console.error("Error moving archived note to trash:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//delete Multiple in Archived notes
exports.deleteMultipleArchivedNotes = async (req, res) => {
  try {
    const { ids } = req.body; // Get the array of note IDs from the request body

    // Validate that IDs are provided and it's an array
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No note IDs provided for deletion." });
    }

    let movedCount = 0; // Counter for successfully moved notes
    let failedCount = 0; // Counter for notes that failed to move
    const failedIds = []; // To store IDs that failed

    // Iterate over each ID sequentially using a for...of loop
    for (const id of ids) {
      try {
        const archivedNote = await Archived.findById(id);

        // Create a new document in T
        if (archivedNote) {
          rash;
          await Trash.create({
            ...archivedNote.toObject(),
            deletedAt: new Date(),
          });

          // Delete from Archived
          await Archived.findByIdAndDelete(id);
          movedCount++; // Increment counter for each successful move
        } else {
          // If note not found, it's not necessarily a failure but means it wasn't moved
          console.warn(`Note with ID ${id} not found in Archived collection.`);
        }
      } catch (innerError) {
        // Log individual errors but don't stop the whole batch process
        console.error(`Error processing note ID ${id}:`, innerError);
        failedCount++;
        failedIds.push(id);
      }
    }

    // Send a response with the counts of notes moved and any failures
    res.status(200).json({
      message: `${movedCount} note(s) moved to trash successfully. ${failedCount} note(s) failed.`,
      movedCount: movedCount,
      failedCount: failedCount,
      failedIds: failedIds, // Optionally send back the IDs that failed
    });
  } catch (error) {
    console.error("Error moving multiple archived notes to trash:", error);
    // This catch block handles errors that occur outside the loop (e.g., issues with req.body)
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID format." });
    }

    const archivedNote = await Archived.findById(id);
    if (!archivedNote) {
      return res.status(404).json({ message: "Archived note not found." });
    }

    const restoredNote = await Addnote.create({
      title: archivedNote.title,
      notes: archivedNote.notes,
      color: archivedNote.color,
      isFavorite: archivedNote.isFavorite || false,
      createdAt: archivedNote.createdAt, // Retain original creation date
    });

    await Archived.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Archived note restored successfully!",
      note: restoredNote,
    });
  } catch (error) {
    console.error("Error restoring single archived note:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createFavorite = async (req, res) => {
  try {
    const { id } = req.params; // Expects ID from URL param
    const { isFavorite } = req.body; // Expects the new status from body

    // --- This is where "multiple-unfavorite" is being treated as an ID ---
    console.log(`Request received to toggle favorite for note ID: ${id}`);
    console.log(`New isFavorite status: ${isFavorite}`);

    if (!id) {
      return res.status(400).json({ message: "Note ID is required." });
    }

    const note = await Addnote.findByIdAndUpdate(
      id, // Mongoose is trying to cast "multiple-unfavorite" to an ObjectId here
      { $set: { isFavorite: isFavorite } },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in createFavorite controller:", error);
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

    const favoriteNotes = await Addnote.find({ isFavorite: true }).lean();

    if (!favoriteNotes || favoriteNotes.length === 0) {
      console.log("No favorite notes found. Returning empty array.");
      // Change: Return 200 OK with an empty array instead of 404
      return res.status(200).json([]); // <--- FIXED HERE
    }

    console.log("Retrieved favorite notes:", favoriteNotes);
    res.status(200).json(favoriteNotes);
  } catch (error) {
    console.error("Error fetching favorite notes:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

exports.unfavoriteMultiple = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting 'ids' as per your frontend

    // --- Debugging step: Log incoming data ---
    console.log("Received multiple-unfavorite request.");
    console.log("Request Body:", req.body);
    console.log("IDs to unfavorite:", ids);
    // --- End Debugging step ---

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      console.log("Validation Error: No IDs or invalid IDs array provided.");
      return res
        .status(400)
        .json({ message: "An array of note IDs ('ids') is required." });
    }

    // Mongoose will automatically cast valid string IDs to ObjectIds
    const result = await Addnote.updateMany(
      { _id: { $in: ids } }, // Match documents where _id is in the provided 'ids' array
      { $set: { isFavorite: false } } // Set isFavorite to false
    );

    console.log("Mongoose updateMany result:", result);

    if (result.matchedCount === 0) {
      console.log("No notes found for the provided IDs.");
      // It's not necessarily a 404 if some IDs were valid but none matched due to prior unfavorite
      // A 200 with 0 modifiedCount is often acceptable here, but 404 is also okay.
      return res.status(200).json({
        message:
          "No notes found with the provided IDs to unfavorite, or they were already unfavorited.",
        modifiedCount: 0,
      });
    }

    res.status(200).json({
      message: `${result.modifiedCount} note(s) successfully unfavorited.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    // Log the full error for server-side debugging
    console.error("Critical Error in /multiple-unfavorite route:", error);
    // Send a generic error message to the client for security
    res.status(500).json({
      message: "Internal server error occurred while unfavoriting notes.",
      error: error.message,
    });
  }
};
