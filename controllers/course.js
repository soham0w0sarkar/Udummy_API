import Stats from "../models/stats.js";
import cloudinary from "cloudinary";
import Course from "../models/course.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import getDataUri from "../middlewares/dataUri.js";

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).json({
    success: true,
    courses,
  });
});

export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  const file = req.file;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please enter the required fields", 400));

  const fileUri = getDataUri(file);

  const uploadCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: uploadCloud.public_id,
      url: uploadCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "course uploaded succesfully",
  });
});

export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  course.views += 1;

  await course.save();

  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

export const addCourseLecture = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description)
    return next(new ErrorHandler("Please enter the required fields", 400));

  const course = await Course.findById(id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const file = req.file;

  const fileUri = getDataUri(file);

  const uploadCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  course.lectures.push({
    title,
    description,
    video: {
      public_id: uploadCloud.public_id,
      url: uploadCloud.secure_url,
    },
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture added in course",
  });
});

export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  course.lectures.forEach(async (lecture) => {
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
    });
  });

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course Deleted Succesfully!!!",
  });
});

export const deleteLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  const course = await Course.findById(courseId);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const lecture = course.lectures.find((lecture) => {
    if (lecture._id.toString() === lectureId.toString()) return lecture;
  });

  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });

  course.lectures = course.lectures.filter((lecture) => {
    if (lecture._id.toString() !== lectureId.toString()) return lecture;
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture Removed Succesfully!!",
  });
});

Course.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const courses = await Course.find({});

  let totalView = 0;

  courses.forEach((course) => {
    totalView += course.views;
  });

  stats[0].views = totalView;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
