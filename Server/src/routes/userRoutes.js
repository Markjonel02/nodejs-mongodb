const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/usercreate", userController.createuser);
router.post("/userlogin", userController.loginuser);
module.exports = router;
