const express = require('express');
const morgan = require('morgan'); //https request logger
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`)); //now root is public folder
app.use((req, res, next) => {
  // console.log('Hello middleware.');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Route handlers in separate file.

//Routes
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getSpecificTour);
// app.post('/api/v1/tours', addTour);
// app.patch('/api/v1/tours/:id', patchSpecificTour);
// app.delete('/api/v1/tours/:id', deleteSpecificTour);

//Create new routers. Mount new router on existing route.
app.use('/api/v1/tours', tourRouter); //use tourRouter for the specific /api/v1/tours route
app.use('/api/v1/users', userRouter);

module.exports = app;
