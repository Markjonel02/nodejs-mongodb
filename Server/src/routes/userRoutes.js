const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/usercreate", userController.createuser);
router.post("/userlogin", userController.loginuser);
/* router.get("/profile", authMiddleware, userController.getUserProfile);

// Update user profile details: Requires authentication
router.put("/updateprofile", authMiddleware, userController.updateUserProfile); // Matches frontend endpoint

// Upload profile image: Requires authentication and Multer middleware for file processing
router.post(
  "/profile/upload-image",
  authMiddleware,
  userController.upload.single("profileImage"), // Use the exported upload instance
  userController.uploadProfileImage
);
 */
module.exports = router;
