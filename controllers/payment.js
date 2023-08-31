import crypto from "crypto";
import User from "../models/user.js";
import Payment from "../models/payment.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { instance } from "../server.js";

export const buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role === "admin")
    return next(new ErrorHandler("Admin can't buy subscription!!", 400));

  const plan_id = process.env.PLAN_ID || "plan_MWTpXSz40Yingl";

  const subscription = await instance.subscriptions.create({
    plan_id,
    customer_notify: 1,
    total_count: 12,
  });

  user.subcription.id = subscription.id;
  user.subcription.status = subscription.status;

  await user.save();

  res.status(201).json({
    success: true,
    message: "Subscription started!!",
    subscriptionId: subscription.id,
  });
});

export const paymentVerify = catchAsyncError(async (req, res, next) => {
  const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
    req.body;

  const user = await User.findById(req.user._id);

  const subscription_id = user.subcription.id;
  const generated_signature = crypto
    .createHmac("sha256")
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic) res.redirect(process.env.FRONTEND_URL + "/paymentFailed");

  await Payment.create({
    razorpay_signature,
    razorpay_payment_id,
    razorpay_subscription_id,
  });

  user.subcription.status = "active!!!";
  await user.save();

  res.redirect(
    `${process.env.FRONTEND_URL}/paymentSuccess?reference=${razorpay_payment_id}`
  );
});

export const getRazorKey = (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

export const cancelSubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const subcriptionId = user.subcription.id;

  await instance.subscriptions.cancel(subcriptionId);

  const payment = await Payment.findOne({
    razorpay_subscription_id: subcriptionId,
  });

  const gap = Date.now() - user.createdAt;

  const refundTime = process.env.REFUND_TIME * 24 * 60 * 60 * 1000;

  if (refundTime > gap)
    await instance.payments.refund(payment.razorpay_payment_id);

  await payment.deleteOne();

  user.subcription.id = undefined;
  user.subcription.status = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription Canceled!!!",
  });
});
