import express from "express";
import {
  addToPLaylist,
  deleteMe,
  deleteUser,
  forgotPassword,
  getAllUser,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetPassword,
  updatePass,
  updateProfile,
  updateUserRole,
} from "../controllers/user.js";
import singleStorage from "../middlewares/multer.js";
import { isAdmin, isAuthentiated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(singleStorage, register);
router.route("/login").post(login);
router.route("/logout").get(isAuthentiated, logout);
router.route("/me").get(isAuthentiated, getMyProfile);
router.route("/updatePass").put(isAuthentiated, updatePass);
router
  .route("/updateProfile")
  .put(isAuthentiated, singleStorage, updateProfile);
router.route("/deleteMe").delete(isAuthentiated, deleteMe);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").post(resetPassword);
router.route("/addToPLaylist").post(isAuthentiated, addToPLaylist);
router.route("/removeFromPlaylist").delete(isAuthentiated, removeFromPlaylist);
router.route("/admin/users").get(isAuthentiated, isAdmin, getAllUser);
router
  .route("/admin/users/:id")
  .put(isAuthentiated, isAdmin, updateUserRole)
  .delete(isAuthentiated, isAdmin, deleteUser);

export default router;
