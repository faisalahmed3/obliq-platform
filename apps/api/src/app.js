const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const permissionRoutes = require("./routes/permission.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.set("trust proxy", true);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
  message: {
    success: false,
    message: "Too many auth requests. Try again later.",
  },
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/users", userRoutes);

module.exports = app;