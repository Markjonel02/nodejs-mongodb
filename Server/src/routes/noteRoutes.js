const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.post("/notes", noteController.createNote);
router.get("/getnotes", noteController.getNotes);
router.delete("/delnotes/:id", noteController.delNotes);
router.delete("/updatenotes/:id", noteController.updateNotes);
module.exports = router;
