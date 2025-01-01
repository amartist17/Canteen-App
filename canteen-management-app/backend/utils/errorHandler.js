/**
 * Custom Error Class
 * Allows creation of error objects with a status code.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Error Handling Middleware
 * Handles errors globally and returns a consistent response structure.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = {
  AppError,
  errorHandler,
};
