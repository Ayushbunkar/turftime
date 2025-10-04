const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// User profile routes
router.get('/me', userController.getMe);
router.patch(
  '/me', 
  userController.uploadUserAvatar,
  userController.resizeUserAvatar,
  userController.updateMe
);

// Admin-only routes
router.use(authController.restrictTo('admin'));

// Admin routes for user management
router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
