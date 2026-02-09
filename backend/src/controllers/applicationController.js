const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const mpesaService = require('../utils/mpesaService');
const config = require('../config/config');

// @desc    Create/Save application draft
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      applicant: req.user.id,
      status: 'draft'
    };

    const application = await Application.create(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application draft saved',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);

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
        message: 'Not authorized to update this application'
      });
    }

    // Only allow updates if application is in draft or payment pending
    if (!['draft', 'pending'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update submitted application'
      });
    }

    application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Application updated',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

// @desc    Initiate payment for application
// @route   POST /api/applications/:id/payment
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const application = await Application.findById(req.params.id);

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

    // Check if payment already completed
    if (application.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this application'
      });
    }

    // Initiate M-Pesa STK Push
    const paymentResponse = await mpesaService.initiateSTKPush(
      phoneNumber,
      config.applicationFee,
      `APP-${application._id}`,
      'Application Fee'
    );

    // Update application with payment info
    application.payment.phoneNumber = phoneNumber;
    application.payment.transactionId = paymentResponse.checkoutRequestId;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Payment initiated. Please check your phone for M-Pesa prompt.',
      checkoutRequestId: paymentResponse.checkoutRequestId,
      customerMessage: paymentResponse.customerMessage
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error initiating payment'
    });
  }
};

// @desc    M-Pesa callback
// @route   POST /api/applications/mpesa/callback
// @access  Public (M-Pesa)
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const { stkCallback } = Body;

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find application by checkout request ID
    const application = await Application.findOne({
      'payment.transactionId': CheckoutRequestID
    });

    if (!application) {
      console.error('Application not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find(item => item.Name === 'Amount')?.Value;

      application.payment.status = 'completed';
      application.payment.mpesaReceiptNumber = mpesaReceiptNumber;
      application.payment.amount = amount;
      application.payment.paymentDate = new Date();
      application.status = 'submitted';
      application.submittedAt = new Date();

      await application.save();

      console.log('Payment completed for application:', application._id);
    } else {
      // Payment failed
      application.payment.status = 'failed';
      await application.save();

      console.log('Payment failed for application:', application._id, ResultDesc);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
};

// @desc    Check payment status
// @route   GET /api/applications/:id/payment/status
// @access  Private
exports.checkPaymentStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

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

    res.status(200).json({
      success: true,
      paymentStatus: application.payment.status,
      applicationStatus: application.status,
      payment: application.payment
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status',
      error: error.message
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('opportunity', 'title companyName type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('opportunity')
      .populate('applicant', 'email firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership or admin
    if (
      application.applicant._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Private/Admin
exports.getAllApplications = async (req, res) => {
  try {
    const { status, opportunity, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (opportunity) query.opportunity = opportunity;

    const applications = await Application.find(query)
      .populate('opportunity', 'title companyName type')
      .populate('applicant', 'email firstName lastName phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.id;

    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};
