const {
  getAnalytics,
  getActivity,
  getAchievements,
  getInsight
} = require("../services/analyticsService");

async function analytics(req, res, next) {
  try {
    const data = await getAnalytics(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function activity(req, res, next) {
  try {
    const data = await getActivity(req.user.id, req.query.days || 90);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function achievements(req, res, next) {
  try {
    const data = await getAchievements(req.user.id);
    return res.status(200).json({ success: true, data: { achievements: data } });
  } catch (error) {
    next(error);
  }
}

async function insight(req, res, next) {
  try {
    const data = await getInsight(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { analytics, activity, achievements, insight };
