const {
  createCheckIn,
  getCheckIns
} = require("../services/checkInService");

async function create(req, res, next) {
  try {
    const habitId = Number(req.params.habitId);
    const { date } = req.body;

    if (!Number.isInteger(habitId) || habitId <= 0) {
      const error = new Error("Invalid habit ID.");
      error.statusCode = 400;
      throw error;
    }

    const habit = await createCheckIn({
      habitId,
      userId: req.user.id,
      date,
    });

    return res.status(201).json({
      success: true,
      message: "Check-in added successfully.",
      data: {
        habit,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const habitId = Number(req.params.habitId);

    if (!Number.isInteger(habitId) || habitId <= 0) {
      const error = new Error("Invalid habit ID.");
      error.statusCode = 400;
      throw error;
    }

    const checkIns = await getCheckIns({
      habitId,
      userId: req.user.id
    });

    return res.status(200).json({
      success: true,
      data: {
        checkIns
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  list
};
