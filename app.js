const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//GLOBAL MIDDLEWARES
//produces http security headers
app.use(helmet());

//limits too many request
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests. Please try again later.',
});
app.use('/api', limiter);

//Body parser, reads data from req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitisation against noSQL query injection
app.use(mongoSanitize());

//Data sanitisation against XSS attacks
app.use(xss());

//Prevent parameter pollution. Clears up query string.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Debugging middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Will reach here if other routers do not catch the request. Can handle unknown route requests here.
//.all for all http methods, '*' is a wildcard to catch all other urls
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

//Global error handler middleware function
app.use(globalErrorController);

module.exports = app;
