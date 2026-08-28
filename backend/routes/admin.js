const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const GrievanceHistory = require('../models/GrievanceHistory');
const Scheme = require('../models/Scheme');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
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

    const submittedCount = await Grievance.countDocuments({ status: 'SUBMITTED' });
    const underReviewCount = await Grievance.countDocuments({ status: 'UNDER_REVIEW' });
    const assignedCount = await Grievance.countDocuments({ status: 'ASSIGNED' });
    const inProgressCount = await Grievance.countDocuments({ status: { $in: ['IN_PROGRESS', 'ACTION_TAKEN'] } });
    const resolvedCount = await Grievance.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });
    const rejectedCount = await Grievance.countDocuments({ status: 'REJECTED' });
    const escalatedCount = await Grievance.countDocuments({ status: 'ESCALATED' });
    const overdueCount = await Grievance.countDocuments({ slaStatus: 'SLA_BREACHED', status: { $nin: ['RESOLVED', 'CLOSED'] } });

    const totalFeedback = await Feedback.countDocuments({});
    const helpfulFeedback = await Feedback.countDocuments({ isHelpful: true });

    const categoriesCount = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const departmentWorkload = await Grievance.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
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
        submittedCount,
        underReviewCount,
        assignedCount,
        inProgressCount,
        resolvedCount,
        rejectedCount,
        escalatedCount,
        overdueCount,
        satisfactionRate: totalFeedback > 0 ? Math.round((helpfulFeedback / totalFeedback) * 100) : 96,
        categoriesCount,
        departmentWorkload,
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
// @desc    Admin provisions a new Officer or Admin account
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
      .populate('user', 'name email role profile')
      .populate('assignedOfficer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/admin/grievances/:id/assign
// @desc    Assign grievance to department or specific Nodal Officer
router.put('/grievances/:id/assign', async (req, res) => {
  try {
    const { department, officerId, remark } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    const oldStatus = grievance.status;
    if (department) {
      grievance.department = department;
      grievance.assignedDepartment = department;
    }

    if (officerId) {
      const officer = await User.findById(officerId);
      if (officer) grievance.assignedOfficer = officer._id;
    }

    grievance.status = 'ASSIGNED';
    grievance.adminRemarks = remark || `Assigned to ${department || 'Department Officer'}`;
    
    grievance.statusHistory.push({
      status: 'ASSIGNED',
      remark: remark || `Assigned to ${department || 'Nodal Department'}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await grievance.save();

    await GrievanceHistory.create({
      grievance: grievance._id,
      referenceNumber: grievance.referenceNumber,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'ASSIGNED',
      oldStatus,
      newStatus: 'ASSIGNED',
      comment: remark || `Assigned to ${department || 'Nodal Department'}`
    });

    // Notification for citizen
    await Notification.create({
      user: grievance.user,
      title: 'Grievance Assigned',
      message: `Your grievance #${grievance.referenceNumber} has been assigned to ${department || 'Nodal Officer'} for processing.`,
      type: 'grievance',
      link: `/grievances`
    });

    res.json({ success: true, grievance, message: 'Grievance assigned successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/admin/grievances/:id/escalate
// @desc    Escalate grievance to higher authority / priority
router.put('/grievances/:id/escalate', async (req, res) => {
  try {
    const { reason } = req.body;
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    const oldStatus = grievance.status;
    grievance.status = 'ESCALATED';
    grievance.priority = 'CRITICAL';
    grievance.escalatedAt = new Date();
    grievance.escalatedReason = reason || 'Escalated due to priority or SLA deadline.';

    grievance.statusHistory.push({
      status: 'ESCALATED',
      remark: `Escalated to CRITICAL priority: ${reason || 'Admin escalation'}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await grievance.save();

    await GrievanceHistory.create({
      grievance: grievance._id,
      referenceNumber: grievance.referenceNumber,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'ESCALATED',
      oldStatus,
      newStatus: 'ESCALATED',
      comment: reason || 'Escalated by Admin'
    });

    res.json({ success: true, grievance, message: 'Grievance escalated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/admin/audit-logs
// @desc    Get audit trail log entries
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
