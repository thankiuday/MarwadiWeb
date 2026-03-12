export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again.';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const firstError = Object.values(err.errors)[0];
    message = firstError?.message || 'Please check your input and try again.';
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = field === 'email' ? 'This email is already in use.' : 'A record with this value already exists.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data provided.';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
