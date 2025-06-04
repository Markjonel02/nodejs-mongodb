const Note = require("../models/Addnote");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, notes, color } = req.body;
    if (!title || !notes) {
      return res.status(400).json({ message: "Title and notes are required" });
    }

    const newNote = new Note({
      title,
      notes,
      color: color || "gray.200", // Default color if not provided
    });
    // Validate input
    const savedNote = await newNote.save();
    res
      .status(201)
      .json({ message: "Note created successfully", note: savedNote });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
