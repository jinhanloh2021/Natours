const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //so that reviewRouter has access to the prevoius :tourId, req.params.tourId

router.use(authController.protect); //all routes below are protected.

router
  .route('/')
  .get(reviewController.setTourId, reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.addReview
  );

router
  .route('/:id')
  .get(reviewController.getSpecificReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteSpecificReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.patchSpecificReview
  );

module.exports = router;
