jest.mock("../utils/timezone", () => ({
  getCurrentLocalDate: jest.fn(() => "2026-08-26")
}));

const { buildStats } = require("../services/analyticsService");

describe("Analytics service", () => {
  test("returns zero-safe analytics for no habits", () => {
    const result = buildStats({
      user: { timezone: "Asia/Kolkata" },
      habits: []
    });

    expect(result).toMatchObject({
      totalHabits: 0,
      totalCheckIns: 0,
      completedToday: 0,
      todayCompletionRate: 0,
      activeStreaks: 0,
      bestStreak: 0,
      overallConsistency: 0,
      totalCompletedLocalDays: 0,
      mostConsistentHabit: null
    });
  });

  test("calculates multi-habit stats from local dates and server streaks", () => {
    const result = buildStats({
      user: { timezone: "Asia/Kolkata" },
      habits: [
        { id: 1, name: "Read", createdLocalDate: "2026-08-24", dates: ["2026-08-24", "2026-08-25", "2026-08-26"] },
        { id: 2, name: "Move", createdLocalDate: "2026-08-26", dates: ["2026-08-26"] }
      ]
    });

    expect(result).toMatchObject({
      totalHabits: 2,
      totalCheckIns: 4,
      completedToday: 2,
      todayCompletionRate: 100,
      activeStreaks: 2,
      bestStreak: 3,
      totalCompletedLocalDays: 3,
      mostConsistentHabit: { id: 1, name: "Read", consistency: 100 }
    });
  });
});
