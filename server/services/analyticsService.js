const { DateTime } = require("luxon");
const { pool } = require("../config/database");
const { getCurrentLocalDate } = require("../utils/timezone");
const { calculateStreaks } = require("./streakService");

const ACHIEVEMENT_DEFINITIONS = [
  { key: "first_step", title: "First Step", description: "Complete your first check-in.", icon: "check" },
  { key: "three_habits", title: "Building Momentum", description: "Track 3 habits.", icon: "layers" },
  { key: "five_habits", title: "Habit Builder", description: "Track 5 habits.", icon: "grid" },
  { key: "week_strong", title: "One Week Strong", description: "Reach a 7-day streak.", icon: "flame" },
  { key: "two_weeks_strong", title: "Two Weeks Strong", description: "Reach a 14-day streak.", icon: "spark" },
  { key: "consistency", title: "Consistency", description: "Reach 30 total check-ins.", icon: "target" },
  { key: "dedicated", title: "Dedicated", description: "Reach 100 total check-ins.", icon: "award" }
];

async function getUser(userId) {
  const [rows] = await pool.execute(
    "SELECT id, timezone FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  if (rows.length === 0) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return rows[0];
}

async function getUserHabitData(userId) {
  const user = await getUser(userId);
  const [habits] = await pool.execute(
    `SELECT id, name, created_local_date
     FROM habits
     WHERE user_id = ?
     ORDER BY created_at ASC`,
    [userId]
  );

  const [checkIns] = await pool.execute(
    `SELECT
      h.id AS habit_id,
      h.name,
      DATE_FORMAT(h.created_local_date, '%Y-%m-%d') AS created_local_date,
      DATE_FORMAT(c.local_date, '%Y-%m-%d') AS local_date
     FROM habits h
     LEFT JOIN habit_check_ins c ON c.habit_id = h.id
     WHERE h.user_id = ?
     ORDER BY c.local_date ASC`,
    [userId]
  );

  const data = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    createdLocalDate: normalizeDate(habit.created_local_date),
    dates: []
  }));
  const byId = new Map(data.map((habit) => [habit.id, habit]));

  for (const row of checkIns) {
    if (row.local_date && byId.has(row.habit_id)) {
      byId.get(row.habit_id).dates.push(row.local_date);
    }
  }

  return { user, habits: data };
}

function normalizeDate(value) {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: "UTC" }).toISODate();
  }
  return value ? String(value).slice(0, 10) : null;
}

function daysBetweenInclusive(startDate, endDate) {
  if (!startDate || startDate > endDate) return 0;
  return Math.floor(DateTime.fromISO(endDate, { zone: "UTC" }).diff(
    DateTime.fromISO(startDate, { zone: "UTC" }),
    "days"
  ).days) + 1;
}

function buildStats({ user, habits }) {
  const today = getCurrentLocalDate(user.timezone);
  const enriched = habits.map((habit) => {
    const uniqueDates = [...new Set(habit.dates)].sort();
    const streaks = calculateStreaks(uniqueDates, today);
    const possibleDays = daysBetweenInclusive(habit.createdLocalDate, today);
    const consistency = possibleDays === 0
      ? 0
      : Math.min(100, Math.round((uniqueDates.length / possibleDays) * 100));

    return { ...habit, dates: uniqueDates, streaks, consistency };
  });
  const allDates = new Set(enriched.flatMap((habit) => habit.dates));
  const totalCheckIns = enriched.reduce((total, habit) => total + habit.dates.length, 0);
  const completedToday = enriched.filter((habit) => habit.dates.includes(today)).length;
  const totalPossibleDays = enriched.reduce(
    (total, habit) => total + daysBetweenInclusive(habit.createdLocalDate, today),
    0
  );
  const mostConsistentHabit = [...enriched].sort((left, right) => {
    if (right.consistency !== left.consistency) return right.consistency - left.consistency;
    return right.dates.length - left.dates.length;
  })[0];

  return {
    today,
    habits: enriched,
    totalHabits: enriched.length,
    activeHabits: enriched.length,
    totalCheckIns,
    completedToday,
    todayTotal: enriched.length,
    todayCompletionRate: enriched.length ? Math.round((completedToday / enriched.length) * 100) : 0,
    activeStreaks: enriched.filter((habit) => habit.streaks.currentStreak > 0).length,
    bestStreak: enriched.reduce((best, habit) => Math.max(best, habit.streaks.longestStreak), 0),
    overallConsistency: totalPossibleDays ? Math.min(100, Math.round((totalCheckIns / totalPossibleDays) * 100)) : 0,
    totalCompletedLocalDays: allDates.size,
    mostConsistentHabit: mostConsistentHabit
      ? { id: mostConsistentHabit.id, name: mostConsistentHabit.name, consistency: mostConsistentHabit.consistency }
      : null
  };
}

async function getAnalytics(userId) {
  const stats = buildStats(await getUserHabitData(userId));
  return {
    totalHabits: stats.totalHabits,
    activeHabits: stats.activeHabits,
    totalCheckIns: stats.totalCheckIns,
    completedToday: stats.completedToday,
    todayTotal: stats.todayTotal,
    todayCompletionRate: stats.todayCompletionRate,
    activeStreaks: stats.activeStreaks,
    bestStreak: stats.bestStreak,
    overallConsistency: stats.overallConsistency,
    totalCompletedLocalDays: stats.totalCompletedLocalDays,
    mostConsistentHabit: stats.mostConsistentHabit
  };
}

async function getActivity(userId, requestedDays = 90) {
  const days = Number(requestedDays);
  if (!Number.isInteger(days) || days < 1 || days > 366) {
    const error = new Error("Days must be an integer between 1 and 366.");
    error.statusCode = 400;
    throw error;
  }

  const { user } = await getUserHabitData(userId);
  const endDate = getCurrentLocalDate(user.timezone);
  const startDate = DateTime.fromISO(endDate, { zone: "UTC" })
    .minus({ days: days - 1 })
    .toISODate();
  const [rows] = await pool.execute(
    `SELECT
      DATE_FORMAT(c.local_date, '%Y-%m-%d') AS date,
      COUNT(*) AS count
     FROM habit_check_ins c
     INNER JOIN habits h ON h.id = c.habit_id
     WHERE h.user_id = ?
       AND c.local_date BETWEEN ? AND ?
     GROUP BY c.local_date
     ORDER BY c.local_date ASC`,
    [userId, startDate, endDate]
  );

  const countsByDate = new Map(
    rows.map((row) => [row.date, Number(row.count)])
  );
  const activityDays = [];
  let cursor = DateTime.fromISO(startDate, { zone: "UTC" });
  const end = DateTime.fromISO(endDate, { zone: "UTC" });

  while (cursor <= end) {
    const date = cursor.toISODate();
    activityDays.push({ date, count: countsByDate.get(date) || 0 });
    cursor = cursor.plus({ days: 1 });
  }

  return { startDate, endDate, days: activityDays };
}

async function getAchievements(userId) {
  const stats = buildStats(await getUserHabitData(userId));
  return ACHIEVEMENT_DEFINITIONS.map((achievement) => {
    let unlocked = false;
    if (achievement.key === "first_step") unlocked = stats.totalCheckIns >= 1;
    if (achievement.key === "three_habits") unlocked = stats.totalHabits >= 3;
    if (achievement.key === "five_habits") unlocked = stats.totalHabits >= 5;
    if (achievement.key === "week_strong") unlocked = stats.bestStreak >= 7;
    if (achievement.key === "two_weeks_strong") unlocked = stats.bestStreak >= 14;
    if (achievement.key === "consistency") unlocked = stats.totalCheckIns >= 30;
    if (achievement.key === "dedicated") unlocked = stats.totalCheckIns >= 100;
    return { ...achievement, unlocked, unlockedAt: null };
  });
}

async function getInsight(userId) {
  const stats = buildStats(await getUserHabitData(userId));
  if (stats.totalHabits === 0) {
    return { type: "neutral", title: "Your rhythm starts here", message: "Create your first habit and give your day a direction.", habitId: null };
  }
  if (stats.completedToday === stats.todayTotal) {
    return { type: "progress", title: "Everything checked off", message: "You showed up for every habit today. Let that momentum carry forward.", habitId: null };
  }
  if (stats.completedToday > 0) {
    return { type: "progress", title: "Keep the momentum", message: `You're building momentum - ${stats.completedToday} of ${stats.todayTotal} habits are complete today.`, habitId: null };
  }
  const strongest = stats.mostConsistentHabit;
  if (strongest) {
    return { type: "consistency", title: "A rhythm worth returning to", message: `${strongest.name} is your strongest habit at ${strongest.consistency}% consistency.`, habitId: strongest.id };
  }
  return { type: "neutral", title: "One small step", message: "Choose one habit and make today count.", habitId: null };
}

module.exports = {
  getAnalytics,
  getActivity,
  getAchievements,
  getInsight,
  buildStats
};
