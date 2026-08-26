const {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit
} = require("../services/habitService");
async function create(req, res, next) {
  try {
    const { name, description } = req.body;

    const habit = await createHabit({
      userId: req.user.id,
      name,
      description
    });

    return res.status(201).json({
      success: true,
      message: "Habit created successfully.",
      data: {
        habit
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const habits = await getHabits(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        habits
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const habitId = Number(req.params.id);

    if (!Number.isInteger(habitId) || habitId <= 0) {
      const error = new Error("Invalid habit ID.");
      error.statusCode = 400;
      throw error;
    }

    const habit = await getHabit(
      habitId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: {
        habit
      }
    });
  } catch (error) {
    next(error);
  }
}
async function update(req, res, next) {
  try {
    const habitId = Number(req.params.id);

    if (!Number.isInteger(habitId) || habitId <= 0) {
      const error = new Error("Invalid habit ID.");
      error.statusCode = 400;
      throw error;
    }

    const { name, description } = req.body;

    const habit = await updateHabit({
      habitId,
      userId: req.user.id,
      name,
      description
    });

    return res.status(200).json({
      success: true,
      message: "Habit updated successfully.",
      data: {
        habit
      }
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const habitId = Number(req.params.id);

    if (!Number.isInteger(habitId) || habitId <= 0) {
      const error = new Error("Invalid habit ID.");
      error.statusCode = 400;
      throw error;
    }

    await deleteHabit(
      habitId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Habit deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove
};