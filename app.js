import express from "express";
import { config } from "dotenv";

config({
  path: "./config/config.env",
});

import course from "./routes/course.js";
import user from "./routes/user.js";
import payment from "./routes/payment.js";
import other from "./routes/other.js";

import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

app.use(errorMiddleware);

export default app;
