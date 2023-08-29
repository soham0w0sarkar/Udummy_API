import express from "express";
import {
  getMyProfile,
  login,
  logout,
  register,
  updatePass,
} from "../controllers/user.js";
import isAuthentiated from "../middlewares/isAuth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(isAuthentiated, logout);
router.route("/me").get(isAuthentiated, getMyProfile);
router.route("/updatePass").put(isAuthentiated, updatePass);

export default router;
