const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/usercreate", userController.createuser);
router.post("/userlogin", userController.loginuser);
router.get("/porfile", authMiddleware, userController.getUserProfile);
router.put("/updateprofile", authMiddleware, userController.updateUserProfile);
router.post("/profile/upload-img", authMiddleware, userController.uploadMiddleware, userController.uploadProfileImage);

module.exports = router;
