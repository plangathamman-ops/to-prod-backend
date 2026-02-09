const express = require('express');
const router = express.Router();
const { uploadResume, uploadReferralForm } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/resume/:applicationId', protect, upload.single('resume'), uploadResume);
router.post('/referral/:applicationId', protect, upload.single('referralForm'), uploadReferralForm);

module.exports = router;
