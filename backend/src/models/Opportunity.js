const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyEmail: {
    type: String,
    trim: true
  },
  companyPhone: {
    type: String
  },
  title: {
    type: String,
    required: [true, 'Opportunity title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    enum: ['internship', 'industrial-attachment', 'both'],
    required: [true, 'Opportunity type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'IT',
      'Engineering',
      'Business',
      'Healthcare',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  requirements: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  positions: {
    type: Number,
    required: [true, 'Number of positions is required'],
    min: 1,
    default: 1
  },
  // Support old field name for compatibility
  availableSlots: {
    type: Number,
    min: 1
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  // New fields for admin/API integration
  stipend: {
    type: String,
    default: 'Not specified'
  },
  applyUrl: {
    type: String // External application URL if available
  },
  source: {
    type: String,
    enum: ['manual', 'adzuna', 'jooble', 'rss'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'pending', 'approved', 'rejected', 'deleted'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for backward compatibility
opportunitySchema.virtual('companyName').get(function() {
  return this.company;
});

// Ensure virtuals are included in JSON
opportunitySchema.set('toJSON', { virtuals: true });
opportunitySchema.set('toObject', { virtuals: true });

// Index for searching
opportunitySchema.index({ title: 'text', description: 'text', company: 'text' });

// Pre-save middleware to sync positions and availableSlots
opportunitySchema.pre('save', function(next) {
  if (this.positions && !this.availableSlots) {
    this.availableSlots = this.positions;
  } else if (this.availableSlots && !this.positions) {
    this.positions = this.availableSlots;
  }
  next();
});

module.exports = mongoose.model('Opportunity', opportunitySchema);

