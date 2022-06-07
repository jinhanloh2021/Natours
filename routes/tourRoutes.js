const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter); //merge params so that review is decoupled from tour

router
  .route('/')
  .get(authController.protect, tourController.getAllTours) //checks auth before getAllTours.
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.addTour
  );

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getSpecificTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.patchSpecificTour
  )
  .delete(
    authController.protect, //checks if logged in
    authController.restrictTo('admin', 'lead-guide'), //checks if authorised user
    tourController.deleteSpecificTour
  );

module.exports = router;
