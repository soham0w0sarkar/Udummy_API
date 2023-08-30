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

  const uploaCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: uploaCloud.public_id,
      url: uploaCloud.secure_url,
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
    status: true,
    lectures: course.lectures,
  });
});

export const addCourseLecture = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  course.lectures.push({
    title,
    description,
    vedio: {
      public_id: "temp",
      url: "temp",
    },
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    status: true,
    message: "Lecture added in course",
  });
});
