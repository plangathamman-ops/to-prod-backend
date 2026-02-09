const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res) => {
  try {
    const {
      type,
      category,
      location,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { status: 'active' };
    
    if (type) query.type = { $in: [type, 'both'] };
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    if (search) {
      query.$text = { $search: search };
    }

    // Check if deadline has not passed
    query.applicationDeadline = { $gte: new Date() };

    const opportunities = await Opportunity.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('postedBy', 'firstName lastName email');

    const count = await Opportunity.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      opportunities
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunities',
      error: error.message
    });
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    res.status(200).json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunity',
      error: error.message
    });
  }
};

// @desc    Create opportunity
// @route   POST /api/opportunities
// @access  Private/Admin
exports.createOpportunity = async (req, res) => {
  try {
    const opportunityData = {
      ...req.body,
      postedBy: req.user.id
    };

    const opportunity = await Opportunity.create(opportunityData);

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating opportunity',
      error: error.message
    });
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private/Admin
exports.updateOpportunity = async (req, res) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating opportunity',
      error: error.message
    });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private/Admin
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting opportunity',
      error: error.message
    });
  }
};

// @desc    Get opportunity categories
// @route   GET /api/opportunities/meta/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      'IT & Software',
      'Engineering',
      'Business & Finance',
      'Marketing & Sales',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Hospitality',
      'Media & Communications',
      'Other'
    ];

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};
