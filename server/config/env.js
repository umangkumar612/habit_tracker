const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

module.exports = {
  port: process.env.PORT || 5000,
  database: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || "habit_tracker",
    user: process.env.DB_USER || "habit_app",
    password: process.env.DB_PASSWORD || ""
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};