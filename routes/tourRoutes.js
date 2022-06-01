const express = require('express');
const tourController = require('../controllers/tourController');
// const {getAllTours, addTour, getSpecificTour, patchSpecificTour, deleteSpecificTour} = require('./../controllers/tourController');
const router = express.Router();

//param middleware function. Validates ID.
// router.param('id', tourController.checkID);

router.route('/').get(tourController.getAllTours).post(tourController.addTour);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getSpecificTour)
  .patch(tourController.patchSpecificTour)
  .delete(tourController.deleteSpecificTour);

module.exports = router;
