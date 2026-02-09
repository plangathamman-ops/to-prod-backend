const Application = require('../models/Application');
const { uploadToCloudinary } = require('../utils/fileUpload');

// @desc    Upload resume
// @route   POST /api/upload/resume/:applicationId
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file,
      `applications/${req.params.applicationId}/resumes`
    );

    // Update application
    application.resume = {
      url: result.url,
      publicId: result.publicId,
      uploadedAt: new Date()
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: application.resume
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// @desc    Upload referral form
// @route   POST /api/upload/referral/:applicationId
// @access  Private
exports.uploadReferralForm = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file,
      `applications/${req.params.applicationId}/referrals`
    );

    // Update application
    application.referralForm = {
      url: result.url,
      publicId: result.publicId,
      uploadedAt: new Date()
    };

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Referral form uploaded successfully',
      referralForm: application.referralForm
    });
  } catch (error) {
    console.error('Upload referral form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading referral form',
      error: error.message
    });
  }
};
