function errorMiddleware(err, req, res, next) {
  console.error("API Error:", err);

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred."
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong."
  });
}

module.exports = errorMiddleware;