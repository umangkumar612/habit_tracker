const {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateStreaks,
} = require("../services/streakService");

describe("Streak Service", () => {
  describe("calculateCurrentStreak", () => {
    test("returns 1 for a single check-in today", () => {
      const result = calculateCurrentStreak(["2026-03-12"], "2026-03-12");

      expect(result).toBe(1);
    });

    test("calculates consecutive days ending today", () => {
      const result = calculateCurrentStreak(
        ["2026-03-10", "2026-03-11", "2026-03-12"],
        "2026-03-12",
      );

      expect(result).toBe(3);
    });

    test("continues streak from yesterday when today is missing", () => {
      const result = calculateCurrentStreak(
        ["2026-03-09", "2026-03-10", "2026-03-11"],
        "2026-03-12",
      );

      expect(result).toBe(3);
    });

    test("returns zero when today and yesterday are missing", () => {
      const result = calculateCurrentStreak(["2026-03-10"], "2026-03-12");

      expect(result).toBe(0);
    });

    test("returns one when only today is checked in after a gap", () => {
      const result = calculateCurrentStreak(
        ["2026-03-08", "2026-03-10", "2026-03-12"],
        "2026-03-12",
      );

      expect(result).toBe(1);
    });

    test("handles unsorted check-in dates", () => {
      const result = calculateCurrentStreak(
        ["2026-03-12", "2026-03-10", "2026-03-11"],
        "2026-03-12",
      );

      expect(result).toBe(3);
    });

    test("ignores duplicate local dates", () => {
      const result = calculateCurrentStreak(
        ["2026-03-10", "2026-03-11", "2026-03-11", "2026-03-12"],
        "2026-03-12",
      );

      expect(result).toBe(3);
    });

    test("throws for an invalid current date", () => {
      expect(() => {
        calculateCurrentStreak(["2026-03-12"], "invalid-date");
      }).toThrow("Invalid current local date.");
    });
  });

  describe("calculateLongestStreak", () => {
    test("returns zero when there are no check-ins", () => {
      const result = calculateLongestStreak([]);

      expect(result).toBe(0);
    });

    test("returns one for a single check-in", () => {
      const result = calculateLongestStreak(["2026-03-12"]);

      expect(result).toBe(1);
    });

    test("calculates longest consecutive streak", () => {
      const result = calculateLongestStreak([
        "2026-03-01",
        "2026-03-02",
        "2026-03-03",
        "2026-03-07",
        "2026-03-08",
        "2026-03-10",
        "2026-03-11",
        "2026-03-12",
        "2026-03-13",
      ]);

      expect(result).toBe(4);
    });

    test("handles backfill creating a longer streak", () => {
      const beforeBackfill = calculateLongestStreak([
        "2026-03-10",
        "2026-03-12",
      ]);

      const afterBackfill = calculateLongestStreak([
        "2026-03-10",
        "2026-03-11",
        "2026-03-12",
      ]);

      expect(beforeBackfill).toBe(1);
      expect(afterBackfill).toBe(3);
    });

    test("handles unsorted dates", () => {
      const result = calculateLongestStreak([
        "2026-03-12",
        "2026-03-01",
        "2026-03-11",
        "2026-03-03",
        "2026-03-02",
        "2026-03-13",
        "2026-03-10",
      ]);

      expect(result).toBe(4);
    });

    test("ignores duplicate local dates", () => {
      const result = calculateLongestStreak([
        "2026-03-10",
        "2026-03-11",
        "2026-03-11",
        "2026-03-12",
      ]);

      expect(result).toBe(3);
    });

    test("throws for invalid local dates", () => {
      expect(() => {
        calculateLongestStreak(["2026-03-10", "invalid-date"]);
      }).toThrow("Invalid check-in local date.");
    });
  });

  describe("calculateStreaks", () => {
    test("returns both current and longest streak", () => {
      const result = calculateStreaks(
        ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-10", "2026-03-11"],
        "2026-03-12",
      );

      expect(result).toEqual({
        currentStreak: 2,
        longestStreak: 3,
      });
    });

    test("handles today missing but yesterday completed", () => {
      const result = calculateStreaks(
        ["2026-03-08", "2026-03-09", "2026-03-10", "2026-03-11"],
        "2026-03-12",
      );

      expect(result).toEqual({
        currentStreak: 4,
        longestStreak: 4,
      });
    });
  });

  describe("Local calendar day behavior", () => {
    test("treats consecutive local dates as consecutive days regardless of elapsed hours", () => {
      const result = calculateCurrentStreak(
        ["2026-03-10", "2026-03-11"],
        "2026-03-11",
      );

      expect(result).toBe(2);
    });

    test("does not treat a missing local calendar day as consecutive", () => {
      const result = calculateCurrentStreak(
        ["2026-03-10", "2026-03-12"],
        "2026-03-12",
      );

      expect(result).toBe(1);
    });
  });
});
