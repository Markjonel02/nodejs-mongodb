const Addnote = require("../models/Addnote");
const Trashnotes = require("../models/Trash");
const Archived = require("../models/Archived");
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

    //find notes before deleting
    const noteArchive = await Addnote.findById(id);
    if (!noteArchive) {
      return res.status(404).json({ message: "Note could note be Found!" });
    }
    //mobe and create collection
    await Archived.create(noteArchive.toObject());

    await Addnote.findByIdAndDelete(id);

    // Check if any document was actually deleted
    if (noteArchive === 0) {
      return res.status(404).json({ message: "Note not Found!" });
    }

    // If successful, send a success message.
    return res.status(200).json({ message: "Successfully moved to Archived!" });
  } catch (error) {
    console.error("Error Deleting notes:", error);
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
exports.createFavorite = async (req, res) => {
  try {
    const { id } = req.params; // Get the note ID from the URL parameters
    const { isFavorite } = req.body; // Get the new favorite status from the request body

    console.log(`Request received to toggle favorite for note ID: ${id}`);
    console.log(`New isFavorite status: ${isFavorite}`);

    // Find the note by ID and update its isFavorite status
    const updatedNote = await Addnote.findByIdAndUpdate(
      id,
      { isFavorite: isFavorite },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      console.log(`Note with ID: ${id} not found.`);
      return res.status(404).json({ message: "Note not found." });
    }

    console.log("Note favorite status updated successfully:", updatedNote);
    res.status(200).json({
      message: "Note favorite status updated successfully",
      updatedNote,
    });
  } catch (error) {
    console.error("Error in toggleFavorite controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFavoriteById = async (req, res) => {
  try {
    const favoriteNotes = await Addnote.find({ isFavorite: true });
    res.status(200).json(favoriteNotes);
  } catch (error) {
    console.error("Error fetching favorite notes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
