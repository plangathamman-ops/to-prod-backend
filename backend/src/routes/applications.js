const express = require('express');
const router = express.Router();
const {
  createApplication,
  updateApplication,
  initiatePayment,
  mpesaCallback,
  checkPaymentStatus,
  getMyApplications,
  getApplication,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/mpesa/callback', mpesaCallback);

// Protected routes
router.post('/', protect, createApplication);
router.get('/my', protect, getMyApplications);
router.get('/:id', protect, getApplication);
router.put('/:id', protect, updateApplication);
router.post('/:id/payment', protect, initiatePayment);
router.get('/:id/payment/status', protect, checkPaymentStatus);

// Admin routes
router.get('/', protect, authorize('admin'), getAllApplications);
router.put('/:id/status', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
