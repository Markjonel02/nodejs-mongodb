const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.post("/create", noteController.createNote);
router.get("/get", noteController.getNotes);

module.exports = router;
