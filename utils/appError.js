//This is only for operational errors. Compare with programming error.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail.' : 'Error.';
    this.isOperational = true;

    //creates stack trace for the AppError class
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
