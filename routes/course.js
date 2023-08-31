import express from "express";
import {
  addCourseLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../controllers/course.js";
import singleStorage from "../middlewares/multer.js";
import { isAdmin, isAuthentiated, isSubsciber } from "../middlewares/auth.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);
router
  .route("/createCourse")
  .post(isAuthentiated, isAdmin, singleStorage, createCourse);
router
  .route("/course/:id")
  .get(isAuthentiated, isSubsciber, getCourseLectures)
  .post(isAuthentiated, isAdmin, singleStorage, addCourseLecture)
  .delete(isAuthentiated, isAdmin, deleteCourse);
router
  .route("/lecture")
  .delete(isAuthentiated, isAdmin, singleStorage, deleteLecture);

export default router;
