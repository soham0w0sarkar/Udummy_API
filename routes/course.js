import express from "express";
import { createCourse, getAllCourses } from "../controllers/course.js";

const router = express.Router();

router.route("/courses").get(getAllCourses);
router.route("/createCourse").post(createCourse);

export default router;
