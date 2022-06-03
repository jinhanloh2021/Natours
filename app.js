const express = require('express');
const morgan = require('morgan');
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
  res.status(404).json({
    status: 'Fail.',
    message: `Cannot find ${req.originalUrl}`,
  });
});

module.exports = app;
