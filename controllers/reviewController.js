const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');

//MIDDLEWARE
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId; //have access to params because of merge params.
  if (!req.body.user) req.body.user = req.user.id; //req.user is from authController.protect. req.user = currentUser = await User.findById(decoded.id);
  next();
};

exports.setTourId = (req, res, next) => {
  //req.query is everything after the ? in /api/v1/tours/i2j4ghds9/reviews?difficulty=easy,duration[gte]=6
  //req.params is the :tourId in ../i2j4ghds9/..
  if (req.params.tourId) req.query.tour = req.params.tourId;
  //the tourID will then be filtered in the queryObj in the apiFeatures.filter()
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getSpecificReview = factory.getOne(Review);
exports.addReview = factory.createOne(Review);
exports.patchSpecificReview = factory.updateOne(Review);
exports.deleteSpecificReview = factory.deleteOne(Review);
