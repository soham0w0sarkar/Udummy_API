import express from "express";
import {
  addCourseLecture,
  createCourse,
  getAllCourses,
  getCourseLectures,
} from "../controllers/course.js";
import singleStorage from "../middlewares/multer.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);
router.route("/createCourse").post(singleStorage, createCourse);
router
  .route("/getLecture/:id")
  .get(getCourseLectures)
  .post(singleStorage, addCourseLecture);

export default router;
