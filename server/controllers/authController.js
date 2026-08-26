const {
  registerUser,
  loginUser,
  getCurrentUser
} = require("../services/authService");

async function register(req, res, next) {
  try {
    const { email, password, timezone } = req.body;

    const result = await registerUser({
      email,
      password,
      timezone
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({
      email,
      password
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logout successful."
  });
}

module.exports = {
  register,
  login,
  me,
  logout
};