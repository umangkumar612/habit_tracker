const express = require("express");
const cors = require("cors");
const { clientUrl } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const checkInRoutes = require("./routes/checkInRoutes");
const habitRoutes = require("./routes/habitRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors({
  origin: clientUrl,
  credentials: true
}));

app.use(express.json());
app.use("/api", checkInRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Habit Tracker API is running."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", analyticsRoutes);

app.use(errorMiddleware);

module.exports = app;