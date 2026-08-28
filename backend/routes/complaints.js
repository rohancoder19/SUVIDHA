const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const { auth, requireRole } = require('../middleware/auth');

// Multer Storage Configuration
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper to generate COMP-XXXXX tracking ID
const generateComplaintId = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `COMP-${randomNum}`;
};

// @route   POST /api/complaints
// @desc    File a new grievance (Citizen)
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, category, description, schemeName, state, pincode, priority } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ success: false, error: 'Title, category, and description are required.' });
    }

    const attachmentPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const complaint = new Complaint({
      complaintId: generateComplaintId(),
      user: req.user._id,
      title,
      category,
      description,
      schemeName: schemeName || '',
      state: state || req.user.profile?.state || 'All India',
      pincode: pincode || req.user.profile?.pincode || '',
      priority: priority || 'Medium',
      attachments: attachmentPaths,
      status: 'Pending',
      logs: [{
        status: 'Pending',
        remark: 'Grievance submitted successfully by citizen.',
        updatedBy: req.user._id,
        timestamp: new Date()
      }]
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Grievance registered successfully.',
      complaint
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/complaints/my
// @desc    Get all complaints filed by the logged-in citizen
router.get('/my', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('logs.updatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/complaints/track/:complaintId
// @desc    Track grievance by complaint ID (Public or authenticated)
router.get('/track/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId.toUpperCase() })
      .populate('user', 'name email profile')
      .populate('logs.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'No grievance found with this Complaint ID.' });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints (Officer/Admin only) with state, status, category filters
router.get('/admin/list', auth, requireRole(['Officer', 'Admin']), async (req, res) => {
  try {
    const { status, state, priority, category, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (state) filter.state = state;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { schemeName: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email profile')
      .populate('assignedOfficer', 'name email')
      .populate('logs.updatedBy', 'name role')
      .sort({ createdAt: -1 });

    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
      },
      count: complaints.length,
      complaints
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status, priority, and append officer remark log
router.put('/admin/:id/status', auth, requireRole(['Officer', 'Admin']), async (req, res) => {
  try {
    const { status, remark, priority, assignedOfficer } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;

    const logEntry = {
      status: status || complaint.status,
      remark: remark || `Status updated to ${status || complaint.status}`,
      updatedBy: req.user._id,
      timestamp: new Date()
    };

    complaint.logs.push(logEntry);
    await complaint.save();

    const updated = await Complaint.findById(req.params.id)
      .populate('user', 'name email profile')
      .populate('logs.updatedBy', 'name role');

    res.json({
      success: true,
      message: 'Complaint status updated successfully.',
      complaint: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
