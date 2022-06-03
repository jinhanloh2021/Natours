const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Will reach here if other routers do not catch the request. Can handle uncaught requests here.
//.all for all http methods, '*' is a wildcard to catch all other urls
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Fail.',
  //   message: `Cannot find ${req.originalUrl}`,
  // });
  // const err = new Error(`Cannot find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Cannot find ${req.originalUrl}`, 404)); //express assumes that whatever we pass into next is an error.
  //then express will skip all other middlewares and send the error to the global errorhandling middleware
});

//Global error handler middleware function
app.use(globalErrorController);

module.exports = app;
