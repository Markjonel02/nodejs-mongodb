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


exports.delNotes = async (req,res) => {
  
  try {
    const {id} = req.params

    if(!id){
    return res.status(400).json({message:"Note Id is Required!"})
    }    // Corrected to fetch ALL notes as there's no user ID to filter by yet.
    // .sort({ createdAt: -1 }) is optional, but good for showing newest notes first.
    const deleteNote = await Addnote.deleteOne({_id:id})
 if (!deleteNote) {
  return res.status(404).json({message:"Notes not Found!"})
 }
  //if success ({message:"Notes deleted Successfully!"})
  } catch (error) {
  return res.staus(200).json
    console.error("Error Deleting notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}