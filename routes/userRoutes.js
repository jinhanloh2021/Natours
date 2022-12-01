const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //everything below will be protected.

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getSpecificUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getSpecificUser)
  .patch(userController.patchSpecificUser)
  .delete(
    authController.restrictTo('admin'),
    userController.deleteSpecificUser
  );

module.exports = router;
