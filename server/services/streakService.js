const { DateTime } = require("luxon");

function normalizeDates(checkInDates) {
  return [...new Set(checkInDates)]
    .filter((date) => typeof date === "string")
    .sort();
}

function isValidLocalDate(date) {
  if (typeof date !== "string") {
    return false;
  }

  const dateTime = DateTime.fromISO(date, {
    zone: "UTC"
  });

  return dateTime.isValid && dateTime.toISODate() === date;
}

function getPreviousDate(date) {
  return DateTime.fromISO(date, {
    zone: "UTC"
  })
    .minus({ days: 1 })
    .toISODate();
}

function getNextDate(date) {
  return DateTime.fromISO(date, {
    zone: "UTC"
  })
    .plus({ days: 1 })
    .toISODate();
}

function calculateCurrentStreak(checkInDates, today) {
  const dates = normalizeDates(checkInDates);

  if (!isValidLocalDate(today)) {
    throw new Error("Invalid current local date.");
  }

  const checkInSet = new Set(dates);

  let startDate = today;

  if (!checkInSet.has(today)) {
    startDate = getPreviousDate(today);

    if (!checkInSet.has(startDate)) {
      return 0;
    }
  }

  let streak = 0;
  let currentDate = startDate;

  while (checkInSet.has(currentDate)) {
    streak += 1;
    currentDate = getPreviousDate(currentDate);
  }

  return streak;
}

function calculateLongestStreak(checkInDates) {
  const dates = normalizeDates(checkInDates);

  if (dates.length === 0) {
    return 0;
  }

  for (const date of dates) {
    if (!isValidLocalDate(date)) {
      throw new Error("Invalid check-in local date.");
    }
  }

  const checkInSet = new Set(dates);
  let longestStreak = 1;

  for (const date of dates) {
    const previousDate = getPreviousDate(date);

    if (checkInSet.has(previousDate)) {
      continue;
    }

    let currentDate = date;
    let currentStreak = 1;

    while (checkInSet.has(getNextDate(currentDate))) {
      currentDate = getNextDate(currentDate);
      currentStreak += 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return longestStreak;
}

function calculateStreaks(checkInDates, today) {
  return {
    currentStreak: calculateCurrentStreak(checkInDates, today),
    longestStreak: calculateLongestStreak(checkInDates)
  };
}

module.exports = {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateStreaks
};