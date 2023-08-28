import express from "express";
import { config } from "dotenv";

import course from "./routes/course.js";
import user from "./routes/user.js";

import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";

config({
  path: "./config/config.env",
});

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

export default app;

app.use(errorMiddleware);
