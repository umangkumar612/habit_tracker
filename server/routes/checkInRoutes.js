const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  create,
  list
} = require("../controllers/checkInController");

const router = express.Router();

router.post(
  "/habits/:habitId/check-ins",
  authMiddleware,
  create
);
router.get(
  "/habits/:habitId/check-ins",
  authMiddleware,
  list
);

module.exports = router;