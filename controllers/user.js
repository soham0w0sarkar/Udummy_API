import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";

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
