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
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

app.get("/", (req, res) => {
  res.send("<h1>Hello Everynian!!</h1>");
});

export default app;

app.use(errorMiddleware);
