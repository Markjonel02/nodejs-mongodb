const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.mjs");
const { authMiddleware } = require("../middleware/authMiddleware.mjs");
router.post("/usercreate", userController.createuser);
router.post("/userlogin", userController.loginuser);

module.exports = router;
