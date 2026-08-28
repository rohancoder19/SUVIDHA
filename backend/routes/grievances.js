const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Grievance = require('../models/Grievance');
const GrievanceHistory = require('../models/GrievanceHistory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');

// Multer Disk Storage Configuration
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'grievance-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, PNG, JPG, JPEG, DOC are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Helper: Generate Unique SUV-2026-XXXXXX Reference Number
const generateRefNumber = async () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const ref = `SUV-${year}-${randomNum}`;
  const existing = await Grievance.findOne({ referenceNumber: ref });
  if (existing) return generateRefNumber();
  return ref;
};

// Helper: Record History & Audit
const recordHistory = async ({ grievanceId, refNumber, actor, actorName, actorRole, action, oldStatus, newStatus, comment, attachments = [] }) => {
  try {
    await GrievanceHistory.create({
      grievance: grievanceId,
      referenceNumber: refNumber,
      actor: actor ? actor._id || actor : null,
      actorName: actorName || (actor ? actor.name : 'System'),
      actorRole: actorRole || (actor ? actor.role : 'System'),
      action,
      oldStatus: oldStatus || '',
      newStatus: newStatus || '',
      comment: comment || '',
      attachments: attachments || []
    });
  } catch (err) {
    console.error('Grievance History Log error:', err);
  }
};

// @route   POST /api/grievances/check-duplicate
// @desc    Pre-submission duplicate grievance detection check
router.post('/check-duplicate', auth, async (req, res) => {
  try {
    const { subject, category, description } = req.body;
    if (!subject || !category) {
      return res.json({ success: true, isDuplicate: false, duplicates: [] });
    }

    // Search for recent open grievances by same user or identical title/category
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await Grievance.find({
      user: req.user._id,
      category,
      createdAt: { $gte: sevenDaysAgo },
      status: { $ne: 'CLOSED' }
    }).select('referenceNumber subject category status createdAt');

    const matches = existing.filter(g => {
      const gSub = g.subject.toLowerCase();
      const sub = subject.toLowerCase();
      return gSub.includes(sub) || sub.includes(gSub) || g.category === category;
    });

    if (matches.length > 0) {
      return res.json({
        success: true,
        isDuplicate: true,
        count: matches.length,
        duplicates: matches,
        message: 'A similar grievance in this category was recently submitted.'
      });
    }

    res.json({ success: true, isDuplicate: false, duplicates: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/classify
// @desc    AI Smart Classification helper
router.post('/classify', auth, async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    if (!description && !title) {
      return res.status(400).json({ success: false, error: 'Title or description is required for AI classification.' });
    }

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    try {
      const axios = require('axios');
      const mlRes = await axios.post(`${ML_SERVICE_URL}/classify-grievance`, {
        title: title || '',
        description: description || '',
        category: category || 'Other',
        location: location || ''
      }, { timeout: 4000 });

      return res.json(mlRes.data);
    } catch (mlErr) {
      const text = `${title} ${description}`.toLowerCase();
      let resCategory = category || 'Other';
      let department = 'Department of Public Grievances';
      let suggestedPriority = 'MEDIUM';
      let urgencyScore = 50;

      if (text.includes('fire') || text.includes('transformer') || text.includes('wire') || text.includes('electric shock')) {
        resCategory = 'Electricity';
        department = 'Electricity Department';
        suggestedPriority = 'CRITICAL';
        urgencyScore = 95;
      } else if (text.includes('payment') || text.includes('money') || text.includes('bank') || text.includes('installment')) {
        resCategory = 'Payment Issue';
        department = 'Direct Benefit Transfer (DBT) Cell';
        suggestedPriority = 'HIGH';
        urgencyScore = 80;
      } else if (text.includes('drainage') || text.includes('sewage') || text.includes('water')) {
        resCategory = text.includes('water') ? 'Water Supply' : 'Drainage & Sewage';
        department = 'Water & Sanitation Department';
        suggestedPriority = 'HIGH';
        urgencyScore = 85;
      } else if (text.includes('road') || text.includes('pothole') || text.includes('accident')) {
        resCategory = 'Road & Infrastructure';
        department = 'Public Works Department (PWD)';
        suggestedPriority = 'HIGH';
        urgencyScore = 75;
      }

      return res.json({
        success: true,
        category: resCategory,
        priority: suggestedPriority,
        urgencyScore,
        department,
        reason: 'Rule-based classification fallback — subject to officer verification.',
        disclaimer: 'AI service unavailable — manual officer review required.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/create
// @desc    Register a new public grievance
router.post('/create', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      category, schemeName, department, state, district, subject, description,
      incidentDate, applicationNumber, priority, address, latitude, longitude,
      aiCategory, aiPriority, aiDepartment, aiReason, urgencyScore
    } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, error: 'Category, subject, and problem description are required.' });
    }

    if (subject.length < 3 || subject.length > 150) {
      return res.status(400).json({ success: false, error: 'Issue title must be between 3 and 150 characters.' });
    }

    if (description.length < 10 || description.length > 3000) {
      return res.status(400).json({ success: false, error: 'Detailed description must be between 10 and 3000 characters.' });
    }

    const refNumber = await generateRefNumber();
    const attachmentPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const parsedLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null;
    const parsedLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null;

    const assignedDept = department || aiDepartment || 'Department of Revenue & Public Grievances';
    const assignedPriority = priority || aiPriority || 'MEDIUM';

    const newGrievance = new Grievance({
      referenceNumber: refNumber,
      user: req.user._id,
      category,
      schemeName: schemeName || 'General Civic & Welfare Service',
      department: assignedDept,
      assignedDepartment: assignedDept,
      state: state || req.user.profile?.state || 'All India',
      district: district || req.user.profile?.district || '',
      subject,
      description,
      incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
      applicationNumber: applicationNumber || '',
      address: address || '',
      latitude: parsedLat,
      longitude: parsedLng,
      attachments: attachmentPaths,
      priority: assignedPriority,
      aiCategory: aiCategory || category,
      aiPriority: aiPriority || assignedPriority,
      aiDepartment: aiDepartment || assignedDept,
      aiReason: aiReason || '',
      urgencyScore: urgencyScore ? Number(urgencyScore) : 50,
      finalCategory: category,
      finalPriority: assignedPriority,
      status: 'SUBMITTED',
      statusHistory: [{
        status: 'SUBMITTED',
        remark: 'Grievance registered by citizen.',
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      }]
    });

    await newGrievance.save();

    // Log History
    await recordHistory({
      grievanceId: newGrievance._id,
      refNumber,
      actor: req.user,
      action: 'GRIEVANCE_REGISTERED',
      newStatus: 'SUBMITTED',
      comment: `Registered grievance under category ${category}`,
      attachments: attachmentPaths
    });

    // Trigger Notification for User
    await Notification.create({
      user: req.user._id,
      title: 'Grievance Registered',
      message: `Your grievance #${refNumber} (${subject}) has been registered successfully.`,
      type: 'grievance',
      link: `/grievances`
    });

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'GRIEVANCE_REGISTERED',
      resource: 'Grievance',
      resourceId: refNumber,
      details: `Registered grievance under category ${category}`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      referenceNumber: refNumber,
      grievance: newGrievance,
      message: 'Grievance registered successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/grievances/my-grievances
// @desc    Get list of grievances registered by authenticated citizen
router.get('/my-grievances', auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ user: req.user._id })
      .populate('assignedOfficer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/grievances/officer/queue
// @desc    Get grievances assigned to authenticated Nodal Officer or department
router.get('/officer/queue', auth, requireRole(['Officer', 'Admin']), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Officer') {
      const officerDept = req.user.profile?.occupation || '';
      query = {
        $or: [
          { assignedOfficer: req.user._id },
          { department: { $regex: new RegExp(officerDept, 'i') } },
          { assignedDepartment: { $regex: new RegExp(officerDept, 'i') } }
        ]
      };
    }

    const grievances = await Grievance.find(query)
      .populate('user', 'name email role profile')
      .populate('assignedOfficer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/grievances/track/:refNumber
// @desc    Track grievance timeline & status by reference number (SUV-2026-XXXXXX)
router.get('/track/:refNumber', async (req, res) => {
  try {
    const grievance = await Grievance.findOne({ referenceNumber: req.params.refNumber.toUpperCase() })
      .populate('user', 'name email role')
      .populate('assignedOfficer', 'name email role');

    if (!grievance) {
      return res.status(404).json({ success: false, error: 'No grievance found with reference number ' + req.params.refNumber });
    }

    const history = await GrievanceHistory.find({ grievance: grievance._id }).sort({ createdAt: 1 });

    res.json({
      success: true,
      grievance,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/grievances/:id
// @desc    Get single grievance detail by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('user', 'name email role profile')
      .populate('assignedOfficer', 'name email role');

    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    // Citizen can only access their own grievance, Officers/Admins can access assigned/all
    if (req.user.role === 'Citizen' && grievance.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const history = await GrievanceHistory.find({ grievance: grievance._id }).sort({ createdAt: 1 });

    res.json({ success: true, grievance, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/:id/reply
// @desc    Citizen submits requested clarification or additional evidence
router.post('/:id/reply', auth, upload.array('attachments', 3), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message / clarification response is required.' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    if (grievance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const attachmentPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    grievance.citizenReplies.push({
      message,
      attachments: attachmentPaths,
      createdAt: new Date()
    });

    const oldStatus = grievance.status;
    if (grievance.status === 'NEED_CLARIFICATION') {
      grievance.status = 'IN_PROGRESS';
    }

    grievance.statusHistory.push({
      status: grievance.status,
      remark: `Citizen submitted response: "${message}"`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await grievance.save();

    await recordHistory({
      grievanceId: grievance._id,
      refNumber: grievance.referenceNumber,
      actor: req.user,
      action: 'CLARIFICATION_SUBMITTED',
      oldStatus,
      newStatus: grievance.status,
      comment: message,
      attachments: attachmentPaths
    });

    res.json({ success: true, grievance, message: 'Clarification submitted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/:id/feedback
// @desc    Citizen rates resolution satisfaction
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment, isHelpful } = req.body;
    if (!rating) {
      return res.status(400).json({ success: false, error: 'Rating (1-5) is required.' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    if (grievance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    grievance.feedback = {
      rating: Number(rating),
      comment: comment || '',
      isHelpful: isHelpful !== undefined ? isHelpful : true,
      createdAt: new Date()
    };

    if (grievance.status === 'RESOLVED') {
      grievance.status = 'CLOSED';
      grievance.closedAt = new Date();
      grievance.statusHistory.push({
        status: 'CLOSED',
        remark: `Citizen rated resolution (${rating}/5 stars). Grievance closed.`,
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      });
    }

    await grievance.save();

    await recordHistory({
      grievanceId: grievance._id,
      refNumber: grievance.referenceNumber,
      actor: req.user,
      action: 'FEEDBACK_SUBMITTED',
      oldStatus: 'RESOLVED',
      newStatus: 'CLOSED',
      comment: `Citizen feedback rating: ${rating}/5. ${comment || ''}`
    });

    res.json({ success: true, grievance, message: 'Thank you for your feedback!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/:id/reopen
// @desc    Citizen reopens / appeals an unresolved dispute
router.post('/:id/reopen', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Appeal / reopen reason is required.' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    if (grievance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const oldStatus = grievance.status;
    grievance.status = 'REOPENED';
    grievance.statusHistory.push({
      status: 'REOPENED',
      remark: `Citizen reopened grievance: "${reason}"`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await grievance.save();

    await recordHistory({
      grievanceId: grievance._id,
      refNumber: grievance.referenceNumber,
      actor: req.user,
      action: 'REOPENED',
      oldStatus,
      newStatus: 'REOPENED',
      comment: reason
    });

    res.json({ success: true, grievance, message: 'Grievance reopened for administrative review.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/grievances/:id/status
// @desc    Officer / Admin updates grievance status, priority, resolution & uploads proof
router.put('/:id/status', auth, requireRole(['Officer', 'Admin']), upload.array('resolutionProof', 3), async (req, res) => {
  try {
    const { status, remark, assignedOfficerId, priority, resolution, rejectionReason } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    const oldStatus = grievance.status;

    if (status) grievance.status = status;
    if (priority) grievance.priority = priority;
    if (assignedOfficerId) grievance.assignedOfficer = assignedOfficerId;
    if (remark) grievance.officerRemarks = remark;
    if (resolution) grievance.resolution = resolution;
    if (rejectionReason) grievance.rejectionReason = rejectionReason;

    const proofPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    if (proofPaths.length > 0) {
      grievance.resolutionProof = [...(grievance.resolutionProof || []), ...proofPaths];
    }

    if (['RESOLVED', 'CLOSED'].includes(status)) {
      grievance.resolvedAt = new Date();
      grievance.slaStatus = 'RESOLVED';
    }

    grievance.statusHistory.push({
      status: grievance.status,
      remark: remark || `Status updated to ${grievance.status}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      attachments: proofPaths,
      timestamp: new Date()
    });

    await grievance.save();

    await recordHistory({
      grievanceId: grievance._id,
      refNumber: grievance.referenceNumber,
      actor: req.user,
      action: 'STATUS_UPDATED',
      oldStatus,
      newStatus: grievance.status,
      comment: remark || `Status changed to ${grievance.status}`,
      attachments: proofPaths
    });

    // Trigger Notification for Citizen
    await Notification.create({
      user: grievance.user,
      title: `Grievance Status Updated (${grievance.status})`,
      message: `Your grievance #${grievance.referenceNumber} status changed to ${grievance.status}. ${remark ? 'Officer remark: ' + remark : ''}`,
      type: 'grievance',
      link: `/grievances`
    });

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'GRIEVANCE_STATUS_UPDATED',
      resource: 'Grievance',
      resourceId: grievance.referenceNumber,
      details: `Updated status to ${grievance.status}. Remark: ${remark || 'N/A'}`,
      ip: req.ip
    });

    res.json({ success: true, grievance, message: 'Grievance status updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
