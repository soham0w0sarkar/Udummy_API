import express from "express";
import { getMyProfile, login, logout, register } from "../controllers/user.js";
import isAuthentiated from "../middlewares/isAuth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(isAuthentiated, logout);
router.route("/me").get(isAuthentiated, getMyProfile);

export default router;
