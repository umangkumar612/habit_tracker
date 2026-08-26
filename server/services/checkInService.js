const { pool } = require("../config/database");
const { DateTime } = require("luxon");
const {
  getCurrentLocalDate,
  getDateTimeForLocalDate,
} = require("../utils/timezone");
const { calculateStreaks } = require("./streakService");

async function getHabitForUser(connection, habitId, userId) {
  const [rows] = await connection.execute(
    `SELECT
      id,
      user_id,
      name,
      description,
      DATE_FORMAT(created_local_date, '%Y-%m-%d') AS created_local_date,
      created_at,
      updated_at
     FROM habits
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [habitId, userId],
  );

  return rows[0] || null;
}

async function getCheckInDates(connection, habitId) {
  const [rows] = await connection.execute(
    `SELECT local_date
     FROM habit_check_ins
     WHERE habit_id = ?
     ORDER BY local_date ASC`,
    [habitId],
  );

  return rows.map((row) => {
    if (row.local_date instanceof Date) {
      return DateTime.fromJSDate(row.local_date, {
        zone: "UTC",
      }).toISODate();
    }

    return String(row.local_date).slice(0, 10);
  });
}

async function createCheckIn({ habitId, userId, date }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const habit = await getHabitForUser(connection, habitId, userId);

    if (!habit) {
      const error = new Error("Habit not found.");
      error.statusCode = 404;
      throw error;
    }

    const [users] = await connection.execute(
      `SELECT id, timezone
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId],
    );

    if (users.length === 0) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const timezone = users[0].timezone;

    const requestedDate =
      date === undefined || date === null
        ? getCurrentLocalDate(timezone)
        : date;

    if (typeof requestedDate !== "string" || !requestedDate.trim()) {
      const error = new Error("A valid local date is required.");
      error.statusCode = 400;
      throw error;
    }

    const localDateTime = getDateTimeForLocalDate(requestedDate, timezone);

    const requestedLocalDate = localDateTime.toISODate();
    const todayLocalDate = getCurrentLocalDate(timezone);

    if (requestedLocalDate > todayLocalDate) {
      const error = new Error("You cannot check in for a future date.");
      error.statusCode = 400;
      throw error;
    }

    if (!habit.created_local_date) {
      const error = new Error("Habit creation date is not available.");
      error.statusCode = 500;
      throw error;
    }

    const habitCreationLocalDate = habit.created_local_date;

    if (requestedLocalDate < habitCreationLocalDate) {
      const error = new Error(
        "You cannot check in before this habit was created.",
      );
      error.statusCode = 400;
      throw error;
    }

    const [existingCheckIns] = await connection.execute(
      `SELECT id
       FROM habit_check_ins
       WHERE habit_id = ? AND local_date = ?
       LIMIT 1`,
      [habitId, requestedLocalDate],
    );

    if (existingCheckIns.length > 0) {
      const error = new Error(
        "This habit has already been checked in for this day.",
      );
      error.statusCode = 409;
      throw error;
    }

    const checkedInAtUtc = DateTime.utc().toFormat("yyyy-MM-dd HH:mm:ss");

    await connection.execute(
      `INSERT INTO habit_check_ins
        (habit_id, checked_in_at_utc, local_date)
       VALUES (?, ?, ?)`,
      [habitId, checkedInAtUtc, requestedLocalDate],
    );

    const checkInDates = await getCheckInDates(connection, habitId);

    const streaks = calculateStreaks(checkInDates, todayLocalDate);

    await connection.commit();

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      created_local_date: habit.created_local_date,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      completedToday: checkInDates.includes(todayLocalDate),
    };
  } catch (error) {
    await connection.rollback();

    console.error("createCheckIn error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      const duplicateError = new Error(
        "This habit has already been checked in for this day.",
      );

      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function getCheckIns({ habitId, userId }) {
  const habit = await getHabitForUser(pool, habitId, userId);

  if (!habit) {
    const error = new Error("Habit not found.");
    error.statusCode = 404;
    throw error;
  }

  const [rows] = await pool.execute(
    `SELECT
      id,
      DATE_FORMAT(local_date, '%Y-%m-%d') AS local_date,
      DATE_FORMAT(checked_in_at_utc, '%Y-%m-%dT%H:%i:%sZ') AS checked_in_at
     FROM habit_check_ins
     WHERE habit_id = ?
     ORDER BY local_date DESC, id DESC`,
    [habitId],
  );

  return rows.map((row) => ({
    id: row.id,
    localDate: row.local_date,
    checkedInAt: row.checked_in_at,
  }));
}

module.exports = {
  createCheckIn,
  getCheckIns,
};
