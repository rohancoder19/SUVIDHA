const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Grievance = require('../models/Grievance');
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
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, PNG, JPG, and JPEG are allowed.'));
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

// @route   POST /api/grievances/classify
// @desc    AI Smart Classification helper from natural language problem description
router.post('/classify', auth, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, error: 'Description is required for AI classification.' });
    }

    const text = description.toLowerCase();
    let category = 'Other';
    let department = 'Department of Public Grievances';
    let suggestedPriority = 'MEDIUM';

    if (text.includes('payment') || text.includes('money') || text.includes('installment') || text.includes('amount') || text.includes('bank')) {
      category = 'Payment Issue';
      department = 'Direct Benefit Transfer (DBT) Cell / Finance Dept';
      suggestedPriority = 'HIGH';
    } else if (text.includes('scholarship') || text.includes('student') || text.includes('school') || text.includes('fee')) {
      category = 'Scholarship Issue';
      department = 'Department of Education & Social Justice';
      suggestedPriority = 'MEDIUM';
    } else if (text.includes('pension') || text.includes('senior') || text.includes('elderly') || text.includes('old age')) {
      category = 'Pension Issue';
      department = 'Social Security & Elderly Welfare Dept';
      suggestedPriority = 'HIGH';
    } else if (text.includes('reject') || text.includes('disallow')) {
      category = 'Application Rejected';
      department = 'Scheme Sanctioning Authority';
      suggestedPriority = 'HIGH';
    } else if (text.includes('delay') || text.includes('pending') || text.includes('waiting')) {
      category = 'Application Delayed';
      department = 'District Nodal Officer Cell';
      suggestedPriority = 'MEDIUM';
    } else if (text.includes('document') || text.includes('certificate') || text.includes('aadhaar')) {
      category = 'Documentation Problem';
      department = 'Revenue & e-Seva Kendra Desk';
      suggestedPriority = 'LOW';
    } else if (text.includes('corrupt') || text.includes('bribe') || text.includes('fake')) {
      category = 'Corruption/Irregularity';
      department = 'Vigilance & Public Grievance Commission';
      suggestedPriority = 'URGENT';
    }

    res.json({
      success: true,
      data: {
        category,
        department,
        suggestedPriority,
        aiExplanation: `Based on terms analyzed in your description, this grievance is classified under "${category}" and routed to "${department}".`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/create
// @desc    Register a new public grievance with reference number & optional file attachments
router.post('/create', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { category, schemeName, department, state, district, subject, description, incidentDate, applicationNumber, priority } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, error: 'Category, subject, and problem description are required.' });
    }

    const refNumber = await generateRefNumber();
    const attachmentPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const newGrievance = new Grievance({
      referenceNumber: refNumber,
      user: req.user._id,
      category,
      schemeName: schemeName || 'General Welfare Scheme',
      department: department || 'Department of Public Grievances',
      state: state || req.user.profile?.state || 'All India',
      district: district || req.user.profile?.district || '',
      subject,
      description,
      incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
      applicationNumber: applicationNumber || '',
      attachments: attachmentPaths,
      priority: priority || 'MEDIUM',
      status: 'SUBMITTED',
      statusHistory: [{
        status: 'SUBMITTED',
        remark: 'Grievance submitted successfully by citizen.',
        updatedBy: req.user._id,
        timestamp: new Date()
      }]
    });

    await newGrievance.save();

    // Trigger Notification for User
    await Notification.create({
      user: req.user._id,
      title: 'Grievance Registered',
      message: `Your grievance #${refNumber} (${subject}) has been registered successfully.`,
      type: 'grievance',
      link: `/grievances`
    });

    // Record Audit Log
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
    const grievances = await Grievance.find({ user: req.user._id }).sort({ createdAt: -1 });
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
      .populate('assignedOfficer', 'name email role')
      .populate('statusHistory.updatedBy', 'name role');

    if (!grievance) {
      return res.status(404).json({ success: false, error: 'No grievance found with reference number ' + req.params.refNumber });
    }

    res.json({
      success: true,
      grievance
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
      .populate('assignedOfficer', 'name email role')
      .populate('statusHistory.updatedBy', 'name role');

    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    // Citizen can only access their own grievance, Officers/Admins can access all
    if (req.user.role === 'Citizen' && grievance.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    res.json({ success: true, grievance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/grievances/:id/add-info
// @desc    Citizen adds additional information or response to a grievance
router.post('/:id/add-info', auth, upload.array('attachments', 3), async (req, res) => {
  try {
    const { remark } = req.body;
    if (!remark) {
      return res.status(400).json({ success: false, error: 'Remark is required.' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    if (grievance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const attachmentPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    grievance.citizenRemarks.push({
      remark,
      attachments: attachmentPaths,
      timestamp: new Date()
    });

    grievance.statusHistory.push({
      status: grievance.status,
      remark: `Citizen added info: "${remark}"`,
      updatedBy: req.user._id,
      timestamp: new Date()
    });

    await grievance.save();

    res.json({ success: true, grievance, message: 'Additional information added.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/grievances/:id/status
// @desc    Officer / Admin updates grievance status, assigns officer & adds remarks
router.put('/:id/status', auth, requireRole(['Officer', 'Admin']), async (req, res) => {
  try {
    const { status, remark, assignedOfficerId, priority } = req.body;

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, error: 'Grievance not found.' });
    }

    if (status) grievance.status = status;
    if (priority) grievance.priority = priority;
    if (assignedOfficerId) grievance.assignedOfficer = assignedOfficerId;
    if (remark) grievance.officerRemarks = remark;

    grievance.statusHistory.push({
      status: grievance.status,
      remark: remark || `Status updated to ${grievance.status}`,
      updatedBy: req.user._id,
      timestamp: new Date()
    });

    await grievance.save();

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
