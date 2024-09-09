import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// For origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// To limit json to avoid server crash
app.use(express.json({ limit: "16kb" }));

// For url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// For public assets
app.use(express.static("public"));

// For cookies
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js";
import commentRouter from "./routes/comment.route.js";

// Apply routes
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/healthcheck", healthcheckRouter);
app.use("/comments", commentRouter);

export { app };
