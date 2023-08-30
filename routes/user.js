import express from "express";
import {
  addToPLaylist,
  forgotPassword,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetPassword,
  updatePass,
  updateProfile,
} from "../controllers/user.js";
import isAuthentiated from "../middlewares/isAuth.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(isAuthentiated, logout);
router.route("/me").get(isAuthentiated, getMyProfile);
router.route("/updatePass").put(isAuthentiated, updatePass);
router.route("/updateProfile").put(isAuthentiated, updateProfile);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").post(resetPassword);
router.route("/addToPLaylist").post(isAuthentiated, addToPLaylist);
router.route("/removeFromPlaylist").delete(isAuthentiated, removeFromPlaylist);

export default router;
