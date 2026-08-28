const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Scheme = require('../models/Scheme');
const Feedback = require('../models/Feedback');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');

// All admin routes require Admin role
router.use(auth);
router.use(requireRole(['Admin']));

// @route   GET /api/admin/analytics
// @desc    Get real-time database statistics & analytics for admin dashboard
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'Citizen' });
    const totalOfficers = await User.countDocuments({ role: 'Officer' });
    const totalSchemes = await Scheme.countDocuments({});
    const totalGrievances = await Grievance.countDocuments({});
    const pendingGrievances = await Grievance.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } });
    const activeGrievances = await Grievance.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ACTION_REQUIRED'] } });
    const resolvedGrievances = await Grievance.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });
    const criticalGrievances = await Grievance.countDocuments({ priority: 'CRITICAL', status: { $ne: 'CLOSED' } });
    const highGrievances = await Grievance.countDocuments({ priority: 'HIGH', status: { $ne: 'CLOSED' } });

    const totalFeedback = await Feedback.countDocuments({});
    const helpfulFeedback = await Feedback.countDocuments({ isHelpful: true });

    const categoriesCount = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusBreakdown = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityBreakdown = await Grievance.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOfficers,
        totalSchemes,
        totalGrievances,
        pendingGrievances,
        activeGrievances,
        resolvedGrievances,
        criticalGrievances,
        highGrievances,
        satisfactionRate: totalFeedback > 0 ? Math.round((helpfulFeedback / totalFeedback) * 100) : 96,
        categoriesCount,
        statusBreakdown,
        priorityBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/admin/officers
// @desc    Get list of all nodal officers
router.get('/officers', async (req, res) => {
  try {
    const officers = await User.find({ role: { $in: ['Officer', 'Admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: officers.length,
      officers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/admin/officers
// @desc    Admin provisions a new Officer or Admin account safely
router.post('/officers', async (req, res) => {
  try {
    const { name, email, password, role, department, state, district } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOfficer = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'Admin' ? 'Admin' : 'Officer',
      profile: {
        state: state || 'All India',
        district: district || '',
        occupation: department || 'Nodal Grievance Office'
      }
    });

    await newOfficer.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'OFFICER_ACCOUNT_CREATED',
      resource: 'User',
      resourceId: newOfficer._id.toString(),
      details: `Created officer account for ${name} (${role}) assigned to ${department || 'General'}`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      officer: {
        id: newOfficer._id,
        name: newOfficer.name,
        email: newOfficer.email,
        role: newOfficer.role,
        profile: newOfficer.profile
      },
      message: `${role} account created successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of registered citizen accounts
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'Citizen' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/admin/grievances
// @desc    Get all grievances for global admin management
router.get('/grievances', async (req, res) => {
  try {
    const grievances = await Grievance.find({})
      .populate('user', 'name email role')
      .populate('assignedOfficer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
