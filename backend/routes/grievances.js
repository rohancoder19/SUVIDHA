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

// Centralized Status Enum & Transition Rule Map
const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'ACTION_TAKEN',
  'RESOLVED',
  'CLOSED',
  'NEED_CLARIFICATION',
  'ESCALATED',
  'REOPENED',
  'REJECTED'
];

const VALID_TRANSITIONS = {
  'SUBMITTED': ['UNDER_REVIEW', 'ASSIGNED', 'REJECTED'],
  'UNDER_REVIEW': ['ASSIGNED', 'REJECTED'],
  'ASSIGNED': ['IN_PROGRESS', 'NEED_CLARIFICATION', 'REJECTED'],
  'IN_PROGRESS': ['ACTION_TAKEN', 'NEED_CLARIFICATION', 'ESCALATED', 'RESOLVED'],
  'ACTION_TAKEN': ['RESOLVED', 'NEED_CLARIFICATION'],
  'RESOLVED': ['CLOSED', 'REOPENED'],
  'NEED_CLARIFICATION': ['IN_PROGRESS', 'UNDER_REVIEW'],
  'ESCALATED': ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  'REOPENED': ['UNDER_REVIEW', 'IN_PROGRESS'],
  'CLOSED': ['REOPENED'],
  'REJECTED': ['UNDER_REVIEW', 'REOPENED']
};

// Helper: Generate Unique SUV-2026-XXXXXX Reference Number
const generateRefNumber = async () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const ref = `SUV-${year}-${randomNum}`;
  const existing = await Grievance.findOne({ referenceNumber: ref });
  if (existing) return generateRefNumber();
  return ref;
};

// Helper: Record Persistent History Audit
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
    const { subject, category } = req.body;
    if (!subject || !category) {
      return res.json({ success: true, isDuplicate: false, duplicates: [] });
    }

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

    await recordHistory({
      grievanceId: newGrievance._id,
      refNumber,
      actor: req.user,
      action: 'GRIEVANCE_REGISTERED',
      newStatus: 'SUBMITTED',
      comment: `Registered grievance under category ${category}`,
      attachments: attachmentPaths
    });

    await Notification.create({
      user: req.user._id,
      title: 'Grievance Registered',
      message: `Your grievance #${refNumber} (${subject}) has been registered successfully.`,
      type: 'grievance',
      link: `/grievances/track?ref=${refNumber}`
    });

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
// @desc    Get list of grievances registered by authenticated citizen directly from DB
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
// @desc    Get grievances assigned to authenticated Nodal Officer or department directly from DB
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
// @desc    Track single grievance by SUV-2026-XXXXXX reference number directly from DB
router.get('/track/:refNumber', async (req, res) => {
  try {
    const ref = req.params.refNumber.toUpperCase().trim();
    const grievance = await Grievance.findOne({
      $or: [
        { referenceNumber: ref },
        { _id: mongoose.Types.ObjectId.isValid(ref) ? ref : null }
      ]
    })
      .populate('user', 'name email role profile')
      .populate('assignedOfficer', 'name email role profile');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        error: `No grievance found matching reference number ${ref}`
      });
    }

    let history = await GrievanceHistory.find({
      $or: [
        { grievance: grievance._id },
        { referenceNumber: grievance.referenceNumber }
      ]
    }).sort({ createdAt: 1 });

    if (!history || history.length === 0) {
      history = (grievance.statusHistory || []).map(sh => ({
        grievance: grievance._id,
        referenceNumber: grievance.referenceNumber,
        action: sh.status,
        oldStatus: '',
        newStatus: sh.status,
        comment: sh.remark,
        actorName: sh.updatedByName || 'System',
        actorRole: sh.updatedByRole || 'Nodal Officer',
        timestamp: sh.timestamp
      }));
    }

    res.json({
      success: true,
      data: {
        grievanceId: grievance.referenceNumber,
        title: grievance.subject,
        category: grievance.category,
        status: grievance.status,
        priority: grievance.priority,
        department: grievance.department,
        createdAt: grievance.createdAt,
        updatedAt: grievance.updatedAt
      },
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

    if (req.user.role === 'Citizen' && grievance.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const history = await GrievanceHistory.find({ grievance: grievance._id }).sort({ createdAt: 1 });

    res.json({ success: true, grievance, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Core Handler: Update Grievance Status & Persist Database History + Notification
const handleStatusUpdate = async (req, res) => {
  try {
    const { status, remark, comment, assignedOfficerId, priority, resolution, rejectionReason } = req.body;
    const updateComment = comment || remark || '';

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status value '${status}'. Allowed values: ${VALID_STATUSES.join(', ')}`
      });
    }

    const idOrRef = req.params.id || req.params.grievanceId;
    let grievance = null;

    if (mongoose.Types.ObjectId.isValid(idOrRef)) {
      grievance = await Grievance.findById(idOrRef);
    }
    if (!grievance) {
      grievance = await Grievance.findOne({ referenceNumber: idOrRef.toUpperCase().trim() });
    }

    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    const oldStatus = grievance.status;

    // Validate transition rule (unless Admin override)
    if (req.user.role !== 'Admin' && oldStatus !== status) {
      const allowed = VALID_TRANSITIONS[oldStatus] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from ${oldStatus} to ${status}. Allowed: ${allowed.join(', ') || 'None'}`
        });
      }
    }

    grievance.status = status;
    if (priority) grievance.priority = priority;
    if (assignedOfficerId) grievance.assignedOfficer = assignedOfficerId;
    if (updateComment) grievance.officerRemarks = updateComment;
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
      status,
      remark: updateComment || `Status changed from ${oldStatus} to ${status}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      attachments: proofPaths,
      timestamp: new Date()
    });

    await grievance.save();

    // Create persistent Audit History Record
    await recordHistory({
      grievanceId: grievance._id,
      refNumber: grievance.referenceNumber,
      actor: req.user,
      action: 'STATUS_UPDATED',
      oldStatus,
      newStatus: status,
      comment: updateComment || `Status changed to ${status}`,
      attachments: proofPaths
    });

    // Create Citizen Notification
    await Notification.create({
      user: grievance.user,
      title: `Grievance Status Updated (${status})`,
      message: `Your grievance #${grievance.referenceNumber} status changed from ${oldStatus} to ${status}. ${updateComment ? 'Comment: ' + updateComment : ''}`,
      type: 'grievance',
      link: `/grievances/track?ref=${grievance.referenceNumber}`
    });

    // Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'GRIEVANCE_STATUS_UPDATED',
      resource: 'Grievance',
      resourceId: grievance.referenceNumber,
      details: `Updated status from ${oldStatus} to ${status}. Comment: ${updateComment || 'N/A'}`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Grievance status updated successfully',
      data: {
        grievanceId: grievance.referenceNumber,
        oldStatus,
        status: grievance.status,
        updatedAt: grievance.updatedAt
      },
      grievance
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @route   PUT /api/grievances/:id/status
// @route   PATCH /api/grievances/:id/status
router.put('/:id/status', auth, requireRole(['Officer', 'Admin']), upload.array('resolutionProof', 3), handleStatusUpdate);
router.patch('/:id/status', auth, requireRole(['Officer', 'Admin']), upload.array('resolutionProof', 3), handleStatusUpdate);

module.exports = router;
