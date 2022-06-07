const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //so that reviewRouter has access to the prevoius :tourId, req.params.tourId

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.addReview
  );

// router.route('/:id').get(reviewController.getReview);

module.exports = router;
