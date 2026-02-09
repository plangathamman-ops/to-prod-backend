const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  
  // Educational Information
  institution: {
    type: String,
    required: [true, 'Institution is required']
  },
  course: {
    type: String,
    required: [true, 'Course is required']
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required']
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required']
  },
  
  // Application Type
  applicationType: {
    type: String,
    enum: ['internship', 'industrial-attachment'],
    required: [true, 'Application type is required']
  },
  
  // Document Uploads
  resume: {
    url: {
      type: String,
      required: [true, 'Resume is required']
    },
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  referralForm: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  
  // Cover Letter
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  
  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    amount: {
      type: Number,
      default: 500
    },
    transactionId: String,
    mpesaReceiptNumber: String,
    phoneNumber: String,
    paymentDate: Date
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'shortlisted', 'accepted', 'rejected'],
    default: 'draft'
  },
  
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying
applicationSchema.index({ applicant: 1, opportunity: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
