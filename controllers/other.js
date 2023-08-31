import Stats from "../models/stats.js";
import sendEmail from "../utils/sendEmail.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;

  const to = process.env.MY_MAIL;
  const subject = "Contact from Udummy!!";
  const text = `I'm ${name}, and my mail is ${email}\n${message}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Mail has been sent!!",
  });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

  const statData = [];

  stats.forEach((stat) => {
    statData.unshift(stat);
  });

  const requiredSize = 12 - stats.length;

  for (let i = 0; i < requiredSize; i++) {
    statData.unshift({
      users: 0,
      subscription: 0,
      views: 0,
    });
  }

  const userCount = statData[11].users;
  const subCount = statData[11].subscription;
  const viewCount = statData[11].views;

  let userPercentage = 0,
    viewPercentage = 0,
    subPercentage = 0;

  let userProfit = false,
    viewProfit = false,
    subProfit = false;

  if (statData[10].users == 0) userPercentage = userCount * 100;
  if (statData[10].views == 0) viewPercentage = viewCount * 100;
  if (statData[10].subscription == 0) subPercentage = subCount * 100;
  else {
    const diff = {
      users: statData[11].users - statData[10].users,
      views: statData[11].views - statData[10].views,
      subs: statData[11].subs - statData[10].subs,
    };

    userPercentage = (diff.users / userCount) * 100;
    viewPercentage = (diff.views / viewCount) * 100;
    subPercentage = (diff.subs / subCount) * 100;
  }
  console.log("4th");

  userProfit = userPercentage > 0;
  viewProfit = viewPercentage > 0;
  subProfit = subPercentage > 0;

  res.status(201).json({
    succes: true,
    statData,
    userCount,
    viewCount,
    subCount,
    userPercentage,
    viewPercentage,
    subPercentage,
    userProfit,
    viewProfit,
    subProfit,
  });
});
