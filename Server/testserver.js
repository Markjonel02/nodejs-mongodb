// server/index.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Use port from environment variable or 5000

// Middleware
app.use(cors()); // Enables CORS for all routes
app.use(express.json()); // Parses incoming JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas and Models ---

// Folder Schema
const folderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, default: new Date().toLocaleDateString() }, // Store date as string for simplicity, consider Date type for advanced operations
  color: { type: String, default: 'blue.100' }, // Default color
  createdAt: { type: Date, default: Date.now }
});
const Folder = mongoose.model('Folder', folderSchema);

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, default: new Date().toLocaleDateString() },
  time: { type: String, default: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) },
  color: { type: String, default: 'yellow.200' }, // Default color
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// --- API Endpoints ---

// Folders API
app.get('/api/folders', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 }).limit(4); // Get recent 4 folders
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/folders', async (req, res) => {
  const { title } = req.body;
  const newFolder = new Folder({ title }); // Create new folder with default date and color
  try {
    const savedFolder = await newFolder.save();
    res.status(201).json(savedFolder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Notes API
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).limit(4); // Get recent 4 notes
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  const newNote = new Note({ title, content }); // Create new note with default date, time, and color
  try {
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});