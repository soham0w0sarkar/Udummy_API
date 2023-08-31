import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import Stats from "./models/stats.js";
import { catchAsyncError } from "./middlewares/catchAsyncError.js";

connectDB();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

nodeCron.schedule(
  "0 0 0 1 * *",
  catchAsyncError(async () => {
    await Stats.create({});
  })
);

app.listen(process.env.PORT, () => {
  console.log(`Server running  on port ${process.env.PORT}`);
});
