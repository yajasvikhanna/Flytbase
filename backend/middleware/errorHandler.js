/**
 * Global error handler middleware
 * Processes errors and returns standardized responses
 */
const errorHandler = (err, req, res, next) => {
    // Log error for server-side visibility
    console.error(err.stack);
  
    let error = { ...err };
    error.message = err.message;
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }
  
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate field value entered for ${field}. Please use another value.`;
      error = { message, statusCode: 400 };
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      error = { message, statusCode: 400 };
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  };
  
  module.exports = errorHandler;