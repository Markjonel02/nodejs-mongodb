import express from "express";

<<<<<<< HEAD:Server/src/routes/noteRoutes.js
router.post("/createnotes", authenticateToken, noteController.createNote);
=======
import * as noteController from "../controllers/noteController.mjs";
import { authenticateToken } from "../middleware/authMiddleware.mjs";

// Corrected router initialization:
const router = express.Router();

// --- NOTES MANAGEMENT ---
router.post("/notes", authenticateToken, noteController.createNote);
>>>>>>> production:Server/src/routes/noteRoutes.mjs
router.get("/getnotes", authenticateToken, noteController.getNotes);
router.put("/updatenotes/:id", authenticateToken, noteController.updateNotes);

// --- TRASH MANAGEMENT ---
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
  authenticateToken,
  noteController.delArchivedNoteSingle
);
router.post(
  "/archivednotes/delete-multiple",
  authenticateToken,
  noteController.deleteMultipleArchivedNotes
);

// --- NEW RESTORE ROUTES ---
router.put(
  "/arcnotes/restore-multiple",
  authenticateToken,
  noteController.restoreMultipleNotes
);
// Route for restoring a single note
router.put(
  "/arcnotes/restore/:id",
  authenticateToken,
  noteController.restoreSingleNote
); // Using PUT for idempotent update

//--- FAVORITES ROUTES ---
router.put("/favorites/:id", authenticateToken, noteController.createFavorite);
router.get("/getfavorites", authenticateToken, noteController.getFavoriteNotes);
router.put(
  "/favorites/single-unfavorite/:id",
  authenticateToken,
  noteController.unfavoriteSingle
);
router.patch(
  "/favorite/multiple-unfavorite",
  authenticateToken,
  noteController.unfavoriteMultiple
);

// Changed from module.exports = router; to export default router; for ES Modules
export default router;
