import crypto from "crypto";
import cloudinary from "cloudinary";
import User from "../models/user.js";
import Course from "../models/course.js";
import Stats from "../models/stats.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import getDataUri from "../middlewares/dataUri.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter the required fields", 400));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User already exist", 409));

  const file = req.file;
  const fileUri = getDataUri(file);

  const uploadCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password,
    Avatar: {
      public_id: uploadCloud.public_id,
      url: uploadCloud.secure_url,
    },
  });

  sendToken(res, user, "User succesfully Registered!!", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter the required fields", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!User) return next(new ErrorHandler("Invalid Email or Password", 404));

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return next(new ErrorHandler("Invalid Email or Password", 404));

  sendToken(res, user, "User Succesfully Logined!!", 201);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logout Succesfully!!",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const updatePass = catchAsyncError(async (req, res, next) => {
  const { oldPass, newPass } = req.body;

  if (!oldPass || !newPass)
    return next(new ErrorHandler("Please enter the required fields", 400));

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPass);
  if (!isMatch) return next(new ErrorHandler("Invalid Password", 404));

  user.password = newPass;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Updated Succesfully!!",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const file = req.file;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (file) {
    const fileUri = getDataUri(file);

    const uploadCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.Avatar.public_id);

    user.Avatar.public_id = uploadCloud.public_id;
    user.Avatar.url = uploadCloud.secure_url;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Succesfully!!",
  });
});

export const deleteMe = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  const user = await User.findById(id);

  await cloudinary.v2.uploader.destroy(user.Avatar.public_id);

  await user.deleteOne();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Removed Successfully!!",
    });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new ErrorHandler("Please enter required field", 400));

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User Not Found!!!", 404));

  const resetToken = await user.getResetToken();

  const url = process.env.FRONTEND_URL + /resetPassword/ + `${resetToken}`;

  const message = `Click on the fucking link to reset your password:\n LINK : ${url}`;

  await sendEmail(user.email, "Reset PassWord Token", message);

  await user.save();

  res.status(200).json({
    success: true,
    message: `Reset token sent to your email ${user.email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Wrong Token or Token Expired!!", 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  res.status(200).json({
    success: true,
    message: "Password updated succesfully Now you can go ahead and login!!",
  });
});

export const addToPLaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 400));

  const itemExists = user.playlist.find(
    (item) => item.courseId.toString() === course._id.toString()
  );

  if (itemExists) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    courseId: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to Playlist  succesfully",
  });
});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 400));

  user.playlist = user.playlist.filter((item) => {
    if (item.courseId.toString() !== course._id.toString()) return item;
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from Playlist succesfully",
  });
});

export const getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid User Id", 404));

  user.role = user.role === "admin" ? "user" : "admin";

  await user.save();

  res.status(200).json({
    success: true,
    message: "Role Changed Succesfully",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) return next(new ErrorHandler("Invalid User Id", 404));

  await cloudinary.v2.uploader.destroy(user.Avatar.public_id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Removed Successfully!!",
  });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscriptions = await User.find({ "subcription.status": "active" });

  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscriptions.length;
  stats[0].createdAt = Date.now();

  await stats[0].save();
});
