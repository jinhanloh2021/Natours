const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getSpecificUser)
  .patch(userController.patchSpecificUser)
  .delete(userController.deleteSpecificUser);

module.exports = router;
