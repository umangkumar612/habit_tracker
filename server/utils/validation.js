const { validateTimezone } = require("./timezone");

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function isValidTimezone(timezone) {
  return validateTimezone(timezone);
}

function validateRegistrationInput({ email, password, timezone }) {
  if (!isValidEmail(email)) {
    return "Please provide a valid email address.";
  }

  if (!isValidPassword(password)) {
    return "Password must be at least 8 characters long.";
  }

  if (!isValidTimezone(timezone)) {
    return "Please provide a valid IANA timezone.";
  }

  return null;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidTimezone,
  validateRegistrationInput
};