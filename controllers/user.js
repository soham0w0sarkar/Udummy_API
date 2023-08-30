import crypto from "crypto";
import User from "../models/user.js";
import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  //const file = req.file;

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter the required fields", 400));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User already exist", 409));

  user = await User.create({
    name,
    email,
    password: hashedPass,
    Avatar: {
      public_id: "temp",
      url: "temp",
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
    status: true,
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
    status: true,
    message: "Password Updated Succesfully!!",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    status: true,
    message: "Profile Updated Succesfully!!",
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
    status: true,
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
    status: true,
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
    status: true,
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
    status: true,
    message: "Removed from Playlist succesfully",
  });
});
