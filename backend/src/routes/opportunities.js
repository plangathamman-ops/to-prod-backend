const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getCategories
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getOpportunities);
router.get('/meta/categories', getCategories);
router.get('/:id', getOpportunity);

// Admin/Company routes
router.post('/', protect, authorize('admin', 'company'), createOpportunity);
router.put('/:id', protect, authorize('admin', 'company'), updateOpportunity);
router.delete('/:id', protect, authorize('admin', 'company'), deleteOpportunity);

module.exports = router;
