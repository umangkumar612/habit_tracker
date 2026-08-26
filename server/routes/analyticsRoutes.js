const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  analytics,
  activity,
  achievements,
  insight
} = require("../controllers/analyticsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/analytics", analytics);
router.get("/analytics/activity", activity);
router.get("/achievements", achievements);
router.get("/insights", insight);

module.exports = router;
