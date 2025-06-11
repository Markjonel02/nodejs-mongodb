const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.post("/notes", noteController.createNote);
router.get("/getnotes", noteController.getNotes);
router.delete("/delnotes/:id", noteController.delNotes);
router.put("/updatenotes/:id", noteController.updateNotes);
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
router.put("/favorites/:id", noteController.createFavorite);

//trashview
router.get("/trashview", noteController.getTrashNotes);

module.exports = router;
