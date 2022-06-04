const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, tourController.getAllTours) //checks auth before getAllTours.
  .post(tourController.addTour);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getSpecificTour)
  .patch(tourController.patchSpecificTour)
  .delete(
    authController.protect, //checks if logged in
    authController.restrictTo('admin', 'lead-guide'), //checks if authorised user
    tourController.deleteSpecificTour
  );

module.exports = router;
