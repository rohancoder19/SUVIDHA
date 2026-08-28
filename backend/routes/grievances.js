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
// @desc    AI Smart Classification helper from title, description & location
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
      console.warn('ML Service offline, using local fallback classifier:', mlErr.message);

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
// @desc    Register a new public grievance with reference number, coordinates, & photo evidence
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

    if (subject.length < 5 || subject.length > 150) {
      return res.status(400).json({ success: false, error: 'Issue title must be between 5 and 150 characters.' });
    }

    if (description.length < 20 || description.length > 3000) {
      return res.status(400).json({ success: false, error: 'Detailed description must be between 20 and 3000 characters.' });
    }

    const refNumber = await generateRefNumber();
    const attachmentPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const parsedLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : null;
    const parsedLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : null;

    const newGrievance = new Grievance({
      referenceNumber: refNumber,
      user: req.user._id,
      category,
      schemeName: schemeName || 'General Civic & Welfare Service',
      department: department || aiDepartment || 'Department of Public Grievances',
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
      priority: priority || aiPriority || 'MEDIUM',
      aiCategory: aiCategory || category,
      aiPriority: aiPriority || priority || 'MEDIUM',
      aiDepartment: aiDepartment || department || 'Department of Public Grievances',
      aiReason: aiReason || '',
      urgencyScore: urgencyScore ? Number(urgencyScore) : 50,
      finalCategory: category,
      finalPriority: priority || 'MEDIUM',
      status: 'SUBMITTED',
      statusHistory: [{
        status: 'SUBMITTED',
        remark: 'Grievance submitted successfully with GPS coordinates and evidence proof.',
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
