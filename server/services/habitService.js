const { pool } = require("../config/database");
const { getCurrentLocalDate } = require("../utils/timezone");
const { calculateStreaks } = require("./streakService");

async function getUserById(userId) {
  const [rows] = await pool.execute(
    `SELECT id, timezone
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function getHabitCheckInDates(habitId) {
  const [rows] = await pool.execute(
    `SELECT local_date
     FROM habit_check_ins
     WHERE habit_id = ?
     ORDER BY local_date ASC`,
    [habitId]
  );

  return rows.map((row) => {
    if (row.local_date instanceof Date) {
      return row.local_date.toISOString().slice(0, 10);
    }

    return String(row.local_date).slice(0, 10);
  });
}

async function buildHabitResponse(habit, timezone) {
  const today = getCurrentLocalDate(timezone);
  const checkInDates = await getHabitCheckInDates(habit.id);

  const streaks = calculateStreaks(
    checkInDates,
    today
  );

  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    created_local_date: habit.created_local_date,
    created_at: habit.created_at,
    updated_at: habit.updated_at,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    completedToday: checkInDates.includes(today)
  };
}

async function createHabit({ userId, name, description }) {
  const user = await getUserById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const createdLocalDate = getCurrentLocalDate(user.timezone);

  if (typeof name !== "string" || !name.trim()) {
    const error = new Error("Habit name cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  const cleanName = name.trim();
  const cleanDescription =
    typeof description === "string"
      ? description.trim()
      : null;

  if (cleanName.length > 100) {
    const error = new Error(
      "Habit name cannot exceed 100 characters."
    );
    error.statusCode = 400;
    throw error;
  }

  if (cleanDescription && cleanDescription.length > 500) {
    const error = new Error(
      "Habit description cannot exceed 500 characters."
    );
    error.statusCode = 400;
    throw error;
  }

  const [result] = await pool.execute(
  `INSERT INTO habits
    (user_id, name, description, created_local_date)
   VALUES (?, ?, ?, ?)`,
  [
    userId,
    cleanName,
    cleanDescription || null,
    createdLocalDate
  ]
);

  const [rows] = await pool.execute(
  `SELECT
    id,
    name,
    description,
    created_local_date,
    created_at,
    updated_at
   FROM habits
   WHERE id = ? AND user_id = ?
   LIMIT 1`,
  [result.insertId, userId]
);

  return buildHabitResponse(
    rows[0],
    user.timezone
  );
}

async function getHabits(userId) {
  const user = await getUserById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const [habits] = await pool.execute(
    `SELECT
      id,
      name,
      description,
      created_local_date,
      created_at,
      updated_at
     FROM habits
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  const result = [];

  for (const habit of habits) {
    result.push(
      await buildHabitResponse(
        habit,
        user.timezone
      )
    );
  }

  return result;
}

async function getHabit(habitId, userId) {
  const user = await getUserById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const [rows] = await pool.execute(
    `SELECT
      id,
      name,
      description,
      created_local_date,
      created_at,
      updated_at
     FROM habits
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [habitId, userId]
  );

  if (rows.length === 0) {
    const error = new Error("Habit not found.");
    error.statusCode = 404;
    throw error;
  }

  return buildHabitResponse(
    rows[0],
    user.timezone
  );
}
async function updateHabit({ habitId, userId, name, description }) {
  const user = await getUserById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const [habits] = await pool.execute(
    `SELECT id
     FROM habits
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [habitId, userId]
  );

  if (habits.length === 0) {
    const error = new Error("Habit not found.");
    error.statusCode = 404;
    throw error;
  }

  if (typeof name !== "string" || !name.trim()) {
    const error = new Error("Habit name cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  const cleanName = name.trim();

  const cleanDescription =
    typeof description === "string"
      ? description.trim()
      : null;

  if (cleanName.length > 100) {
    const error = new Error(
      "Habit name cannot exceed 100 characters."
    );
    error.statusCode = 400;
    throw error;
  }

  if (cleanDescription && cleanDescription.length > 500) {
    const error = new Error(
      "Habit description cannot exceed 500 characters."
    );
    error.statusCode = 400;
    throw error;
  }

  await pool.execute(
    `UPDATE habits
     SET name = ?, description = ?
     WHERE id = ? AND user_id = ?`,
    [
      cleanName,
      cleanDescription || null,
      habitId,
      userId
    ]
  );

  return getHabit(habitId, userId);
}

async function deleteHabit(habitId, userId) {
  const [habits] = await pool.execute(
    `SELECT id
     FROM habits
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [habitId, userId]
  );

  if (habits.length === 0) {
    const error = new Error("Habit not found.");
    error.statusCode = 404;
    throw error;
  }

  await pool.execute(
    `DELETE FROM habits
     WHERE id = ? AND user_id = ?`,
    [habitId, userId]
  );

  return true;
}

module.exports = {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit
};