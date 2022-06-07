const Review = require('../models/reviewModel');
const AppError = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const allReviews = await Review.find(filter);
  res.status(200).json({
    status: 'Sucess.',
    data: {
      allReviews,
    },
  });
});

//POST ../tour/23i2b324g/reviews //tourID from url, userID from req.user.id
//POST ../review //tour from req.body, userId from req.user.id
exports.addReview = catchAsync(async (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; //have access to params because of merge params.
  if (!req.body.user) req.body.user = req.user.id; //req.user is from authController.protect. req.user = currentUser = await User.findById(decoded.id);
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

//GET /tour/23i2b324g/reviews/932hdsak //get review from a specific tour from a specific review
// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) {
//     next(new AppError('Invalid ID.', 404));
//     return;
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
