const express = require('express');
const tourController = require('./../controllers/tourController');
// const {getAllTours, addTour, getSpecificTour, patchSpecificTour, deleteSpecificTour} = require('./../controllers/tourController');
const router = express.Router();

//param middleware function. Validates ID.
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.addTour);
router
  .route('/:id')
  .get(tourController.getSpecificTour)
  .patch(tourController.patchSpecificTour)
  .delete(tourController.deleteSpecificTour);

module.exports = router;
