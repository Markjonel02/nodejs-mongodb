const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.post("/notes", noteController.createNote);
router.get("/getnotes", noteController.getNotes);
router.put("/updatenotes/:id", noteController.updateNotes);

// --- DELETE & TRASH ---

router.get("/trashview", noteController.getTrashNotes);
router.delete("/trashdelete/:id", noteController.delPermanently);
router.delete("/delnotes/:id", noteController.delNotes);
// --- ARCHIVED NOTES ---
router.delete("/archivednotes/:id", noteController.archivedNotes);
router.delete(
  "/archivednotes/del-single/:id",
  noteController.delArchivedNoteSingle
);
router.post(
  "/archivednotes/delete-multiple",
  noteController.deleteMultipleArchivedNotes
);
router.get("/getarchivenotes", noteController.getArchivedNotes);

// --- NEW RESTORE ROUTES ---
router.put("/arcnotes/restore-multiple", noteController.restoreMultipleNotes);
// Route for restoring a single note
router.put("/arcnotes/restore/:id", noteController.restoreSingleNote); // Using PUT for idempotent update

//--- FAVORITES ROUTES ---
router.put("/favorites/:id", noteController.createFavorite);

module.exports = router;
