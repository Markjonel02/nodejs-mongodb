const Addnote = require("../models/Addnote");

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
exports.delNotes = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Note ID is Required!" });
    }

    const deleteNote = await Addnote.deleteOne({ _id: id });

    // Check if any document was actually deleted
    if (deleteNote.deletedCount === 0) {
      return res.status(404).json({ message: "Note not Found!" });
    }

    // If successful, send a success message.
    return res.status(200).json({ message: "Note deleted Successfully!" });
  } catch (error) {
    console.error("Error Deleting notes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateNotes = async (req, res) => {
  try {
    const { id } = req.params; // Get the note ID from request parameters
    const { title, notes, color } = req.body; // Get updated fields from request body

    if (!id) {
      return res.status(400).json({ message: "Note ID is required!" });
    }

    const update = await Addnote.updateOne(
      { _id: id }, // Find the document by ID
      { $set: { title, notes, color } } // Update fields using $set
    );

    if (update.modifiedCount === 0) {
      // This means the note was not found or no fields were actually changed
      return res
        .status(404)
        .json({ message: "Note not found or no changes made!" });
    }

    // Success: Return a 200 status with a success message
    return res.status(200).json({ message: "Note updated successfully!" });
  } catch (error) {
    console.error(`Error updating notes: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};