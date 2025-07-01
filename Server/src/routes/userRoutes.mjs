import express from "express";
import * as userController from "../controllers/userController.mjs";

const router = express.Router();
router.post("/usercreate", userController.createuser);
router.post("/userlogin", userController.loginuser);

export default router;
