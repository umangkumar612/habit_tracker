const { pool } = require("../config/database");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const { validateRegistrationInput, isValidEmail } = require("../utils/validation");

async function registerUser({ email, password, timezone }) {
  const validationError = validateRegistrationInput({
    email,
    password,
    timezone
  });

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [existingUsers] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const [result] = await pool.execute(
    `INSERT INTO users (email, password, timezone)
     VALUES (?, ?, ?)`,
    [normalizedEmail, hashedPassword, timezone]
  );

  const user = {
    id: result.insertId,
    email: normalizedEmail,
    timezone
  };

  const token = generateToken(user.id);

  return {
    user,
    token
  };
}

async function loginUser({ email, password }) {
  if (!isValidEmail(email)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (typeof password !== "string" || password.length === 0) {
    const error = new Error("Password is required.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [users] = await pool.execute(
    `SELECT id, email, password, timezone, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail]
  );

  if (users.length === 0) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const userRecord = users[0];

  const passwordMatches = await comparePassword(
    password,
    userRecord.password
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const user = {
    id: userRecord.id,
    email: userRecord.email,
    timezone: userRecord.timezone,
    created_at: userRecord.created_at,
    updated_at: userRecord.updated_at
  };

  const token = generateToken(user.id);

  return {
    user,
    token
  };
}

async function getCurrentUser(userId) {
  const [users] = await pool.execute(
    `SELECT id, email, timezone, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (users.length === 0) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return users[0];
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};