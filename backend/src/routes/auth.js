const express = require('express');
const router = express.Router();
const {
  register,
  login,
  firebaseRegister,
  firebaseLogin,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Traditional auth routes (keep for backward compatibility)
router.post('/register', register);
router.post('/login', login);

// Firebase auth routes (new)
router.post('/firebase-register', firebaseRegister);
router.post('/firebase-login', firebaseLogin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
