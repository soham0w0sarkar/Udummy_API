import express from "express";
import { contact, getDashboardStats } from "../controllers/other.js";
import { isAdmin, isAuthentiated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/contact").post(contact);
router
  .route("/admin/dashBoardStats")
  .get(isAuthentiated, isAdmin, getDashboardStats);
export default router;
