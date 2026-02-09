const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const User = require('../models/User');
const axios = require('axios');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalOpportunities,
      activeOpportunities,
      pendingApplications,
      totalUsers
    ] = await Promise.all([
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: 'active' }),
      Application.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'student' })
    ]);

    res.json({
      totalOpportunities,
      activeOpportunities,
      pendingApplications,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all opportunities with filtering (admin)
// @route   GET /api/admin/opportunities
// @access  Private/Admin
exports.getAdminOpportunities = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const opportunities = await Opportunity.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new opportunity (admin)
// @route   POST /api/admin/opportunities
// @access  Private/Admin
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      location,
      duration,
      positions,
      applicationDeadline,
      type,
      category,
      stipend,
      applyUrl,
      source
    } = req.body;

    // Validation
    if (!title || !company || !description || !location || !applicationDeadline) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    const opportunity = await Opportunity.create({
      title,
      company,
      description,
      requirements: requirements || [],
      location,
      duration,
      positions: positions || 1,
      applicationDeadline,
      type: type || 'internship',
      category: category || 'IT',
      stipend,
      applyUrl,
      source: source || 'manual',
      status: 'active' // Manually created opportunities are auto-approved
    });

    res.status(201).json({
      message: 'Opportunity created successfully',
      opportunity
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update opportunity (admin)
// @route   PUT /api/admin/opportunities/:id
// @access  Private/Admin
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      opportunity[key] = req.body[key];
    });

    await opportunity.save();

    res.json({
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete opportunity (admin)
// @route   DELETE /api/admin/opportunities/:id
// @access  Private/Admin
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Soft delete (change status to 'deleted')
    opportunity.status = 'deleted';
    await opportunity.save();

    // Or hard delete:
    // await opportunity.remove();

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve opportunity
// @route   PATCH /api/admin/opportunities/:id/approve
// @access  Private/Admin
exports.approveOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    opportunity.status = 'approved';
    await opportunity.save();

    res.json({
      message: 'Opportunity approved successfully',
      opportunity
    });
  } catch (error) {
    console.error('Error approving opportunity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject opportunity
// @route   PATCH /api/admin/opportunities/:id/reject
// @access  Private/Admin
exports.rejectOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    opportunity.status = 'rejected';
    await opportunity.save();

    res.json({
      message: 'Opportunity rejected',
      opportunity
    });
  } catch (error) {
    console.error('Error rejecting opportunity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== JOB API INTEGRATION ====================

// @desc    Sync opportunities from Adzuna API
// @route   POST /api/admin/sync/adzuna
// @access  Private/Admin
exports.syncAdzunaJobs = async (req, res) => {
  try {
    const APP_ID = process.env.ADZUNA_APP_ID;
    const APP_KEY = process.env.ADZUNA_APP_KEY;

    if (!APP_ID || !APP_KEY) {
      return res.status(400).json({ 
        message: 'Adzuna API credentials not configured' 
      });
    }

    // Fetch jobs from Adzuna API (Kenya)
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/ke/search/1`,
      {
        params: {
          app_id: APP_ID,
          app_key: APP_KEY,
          results_per_page: 50,
          what: 'intern OR internship OR graduate OR attachment',
          content-type: 'application/json'
        }
      }
    );

    const jobs = response.data.results || [];
    let imported = 0;
    let skipped = 0;

    for (const job of jobs) {
      try {
        // Check if job already exists (by title and company)
        const existing = await Opportunity.findOne({
          title: job.title,
          company: job.company.display_name
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Map Adzuna job to our schema
        await Opportunity.create({
          title: job.title,
          company: job.company.display_name || 'Unknown Company',
          description: job.description || 'No description provided',
          requirements: extractRequirements(job.description),
          location: job.location.display_name || 'Kenya',
          duration: 'Not specified',
          positions: 1,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          type: 'internship',
          category: categorizeJob(job.category.label),
          stipend: job.salary_min ? `KES ${job.salary_min} - ${job.salary_max}` : 'Not specified',
          applyUrl: job.redirect_url,
          source: 'adzuna',
          status: 'pending' // Require admin approval
        });

        imported++;
      } catch (error) {
        console.error('Error importing job:', error);
      }
    }

    res.json({
      message: 'Adzuna sync completed',
      imported,
      skipped,
      total: jobs.length
    });
  } catch (error) {
    console.error('Error syncing Adzuna jobs:', error);
    res.status(500).json({ 
      message: 'Failed to sync Adzuna jobs',
      error: error.message 
    });
  }
};

// @desc    Sync opportunities from Jooble API
// @route   POST /api/admin/sync/jooble
// @access  Private/Admin
exports.syncJoobleJobs = async (req, res) => {
  try {
    const API_KEY = process.env.JOOBLE_API_KEY;

    if (!API_KEY) {
      return res.status(400).json({ 
        message: 'Jooble API key not configured' 
      });
    }

    // Fetch jobs from Jooble API
    const response = await axios.post(
      `https://jooble.org/api/${API_KEY}`,
      {
        keywords: 'intern OR internship OR graduate program OR attachment',
        location: 'Kenya',
        page: 1
      }
    );

    const jobs = response.data.jobs || [];
    let imported = 0;
    let skipped = 0;

    for (const job of jobs) {
      try {
        // Check if job already exists
        const existing = await Opportunity.findOne({
          title: job.title,
          company: job.company
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Map Jooble job to our schema
        await Opportunity.create({
          title: job.title,
          company: job.company || 'Unknown Company',
          description: job.snippet || 'No description provided',
          requirements: [],
          location: job.location || 'Kenya',
          duration: 'Not specified',
          positions: 1,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          type: 'internship',
          category: 'Other',
          stipend: job.salary || 'Not specified',
          applyUrl: job.link,
          source: 'jooble',
          status: 'pending'
        });

        imported++;
      } catch (error) {
        console.error('Error importing Jooble job:', error);
      }
    }

    res.json({
      message: 'Jooble sync completed',
      imported,
      skipped,
      total: jobs.length
    });
  } catch (error) {
    console.error('Error syncing Jooble jobs:', error);
    res.status(500).json({ 
      message: 'Failed to sync Jooble jobs',
      error: error.message 
    });
  }
};

// Helper function to extract requirements from job description
function extractRequirements(description) {
  if (!description) return [];
  
  const requirements = [];
  const lines = description.split('\n');
  
  for (const line of lines) {
    if (line.match(/^[-•*]\s/)) {
      requirements.push(line.replace(/^[-•*]\s/, '').trim());
    }
  }
  
  return requirements.slice(0, 5); // Max 5 requirements
}

// Helper function to categorize jobs
function categorizeJob(categoryLabel) {
  const category = categoryLabel.toLowerCase();
  
  if (category.includes('it') || category.includes('tech') || category.includes('software')) {
    return 'IT';
  } else if (category.includes('engineer')) {
    return 'Engineering';
  } else if (category.includes('business') || category.includes('finance') || category.includes('marketing')) {
    return 'Business';
  } else if (category.includes('health') || category.includes('medical')) {
    return 'Healthcare';
  }
  
  return 'Other';
}

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    // Get various analytics data
    const [
      opportunitiesByCategory,
      opportunitiesBySource,
      applicationsByStatus,
      recentApplications
    ] = await Promise.all([
      Opportunity.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Opportunity.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'firstName lastName email')
        .populate('opportunity', 'title company')
    ]);

    res.json({
      opportunitiesByCategory,
      opportunitiesBySource,
      applicationsByStatus,
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
