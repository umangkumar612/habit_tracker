const { DateTime, IANAZone } = require("luxon");

function validateTimezone(timezone) {
  if (typeof timezone !== "string" || !timezone.trim()) {
    return false;
  }

  if (/^[+-]\d{2}:\d{2}$/.test(timezone)) {
    return false;
  }

  if (/^UTC[+-]/i.test(timezone)) {
    return false;
  }

  if (/^[A-Z]{2,5}$/.test(timezone) && timezone !== "UTC") {
    return false;
  }

  return IANAZone.isValidZone(timezone);
}

function getCurrentLocalDate(timezone) {
  if (!validateTimezone(timezone)) {
    const error = new Error("Invalid timezone.");
    error.statusCode = 400;
    throw error;
  }

  return DateTime.now()
    .setZone(timezone)
    .toISODate();
}

function convertUtcToLocalDate(utcInstant, timezone) {
  if (!validateTimezone(timezone)) {
    const error = new Error("Invalid timezone.");
    error.statusCode = 400;
    throw error;
  }

  const localDate = DateTime
    .fromJSDate(new Date(utcInstant), { zone: "utc" })
    .setZone(timezone)
    .toISODate();

  if (!localDate) {
    const error = new Error("Invalid UTC instant.");
    error.statusCode = 400;
    throw error;
  }

  return localDate;
}

function getLocalDateFromInstant(utcInstant, timezone) {
  return convertUtcToLocalDate(utcInstant, timezone);
}

function getDateTimeForLocalDate(localDate, timezone) {
  if (!validateTimezone(timezone)) {
    const error = new Error("Invalid timezone.");
    error.statusCode = 400;
    throw error;
  }

  const dateTime = DateTime.fromISO(localDate, {
    zone: timezone
  });

  if (!dateTime.isValid || dateTime.toISODate() !== localDate) {
    const error = new Error("Invalid local date.");
    error.statusCode = 400;
    throw error;
  }

  return dateTime;
}

module.exports = {
  validateTimezone,
  getCurrentLocalDate,
  convertUtcToLocalDate,
  getLocalDateFromInstant,
  getDateTimeForLocalDate
};