const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  approveOpportunity,
  rejectOpportunity,
  syncAdzunaJobs,
  syncJoobleJobs,
  getAnalytics
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard stats
router.get('/stats', getAdminStats);

// Analytics
router.get('/analytics', getAnalytics);

// Opportunity management
router.get('/opportunities', getAdminOpportunities);
router.post('/opportunities', createOpportunity);
router.put('/opportunities/:id', updateOpportunity);
router.delete('/opportunities/:id', deleteOpportunity);

// Opportunity approval/rejection
router.patch('/opportunities/:id/approve', approveOpportunity);
router.patch('/opportunities/:id/reject', rejectOpportunity);

// Job API sync
router.post('/sync/adzuna', syncAdzunaJobs);
router.post('/sync/jooble', syncJoobleJobs);

module.exports = router;
