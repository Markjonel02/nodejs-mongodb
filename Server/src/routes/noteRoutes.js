const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.post("/notes", noteController.createNote);
router.get("/getnotes", noteController.getNotes);
router.delete("/delnotes/:id", noteController.delNotes);
router.put("/updatenotes/:id", noteController.updateNotes);
router.delete("/archivednotes/:id", noteController.archivedNotes);
module.exports = router;
