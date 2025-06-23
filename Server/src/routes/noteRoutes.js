const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/notes", authenticateToken, noteController.createNote);
router.get("/getnotes", authenticateToken, noteController.getNotes);
router.put("/updatenotes/:id", authenticateToken, noteController.updateNotes);

// --- DELETE & TRASH ---

router.delete("/delnotes/:id", authenticateToken, noteController.delNotes);
router.get("/trashview", authenticateToken, noteController.getTrashNotes);
router.delete(
  "/delpermanentmutiple",
  authenticateToken,
  noteController.delPermanentMultiple
);
router.post(
  "/restore-single-trash/:id",
  authenticateToken,
  noteController.restoreSingleNotetrash
);
router.put(
  "/restore-multiple-trash",
  authenticateToken,
  noteController.restoreMultipleTrash
);

router.delete(
  "/trashdelete/:id",
  authenticateToken,
  noteController.delPermanently
);

// --- ARCHIVED NOTES ---
router.get(
  "/getarchivenotes",
  authenticateToken,
  noteController.getArchivedNotes
);
router.delete(
  "/archivednotes/:id",
  authenticateToken,
  noteController.archivedNotes
);
router.delete(
  "/archivednotes/del-single/:id",
  noteController.delArchivedNoteSingle
);
router.post(
  "/archivednotes/delete-multiple",
  noteController.deleteMultipleArchivedNotes
);

// --- NEW RESTORE ROUTES ---
router.put("/arcnotes/restore-multiple", noteController.restoreMultipleNotes);
// Route for restoring a single note
router.put("/arcnotes/restore/:id", noteController.restoreSingleNote); // Using PUT for idempotent update

//--- FAVORITES ROUTES ---
router.put("/favorites/:id", noteController.createFavorite);
router.get("/getfavorites", noteController.getFavoriteNotes);
router.put("/favorites/single-unfavorite/:id", noteController.unfavoriteSingle);
router.put("/favorite/multiple-unfavorite", noteController.unfavoriteMultiple);
module.exports = router;
