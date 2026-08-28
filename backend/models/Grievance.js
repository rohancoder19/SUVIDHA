const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true }, // e.g. SUV-2026-000184
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Road & Infrastructure',
      'Electricity',
      'Water Supply',
      'Drainage & Sewage',
      'Garbage & Sanitation',
      'Street Light',
      'Public Safety',
      'Welfare Scheme',
      'Scholarship',
      'Pension',
      'Subsidy',
      'Healthcare',
      'Government Service',
      'Application Delay',
      'Payment Issue',
      'Documentation Issue',
      'Other'
    ]
  },
  schemeName: { type: String, default: 'General Civic & Welfare Service' },
  department: { type: String, default: 'Department of Revenue & Public Grievances' },
  state: { type: String, required: true, default: 'All India' },
  district: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  incidentDate: { type: Date, default: Date.now },
  applicationNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  attachments: [{ type: String }],
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  
  // AI Triage & Classification Output
  aiCategory: { type: String, default: '' },
  aiPriority: { type: String, default: '' },
  aiDepartment: { type: String, default: '' },
  aiReason: { type: String, default: '' },
  urgencyScore: { type: Number, default: 50 },

  finalCategory: { type: String, default: '' },
  finalPriority: { type: String, default: '' },

  status: {
    type: String,
    enum: [
      'SUBMITTED',
      'UNDER_REVIEW',
      'ASSIGNED',
      'IN_PROGRESS',
      'ACTION_REQUIRED',
      'RESOLVED',
      'REJECTED',
      'CLOSED'
    ],
    default: 'SUBMITTED'
  },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  officerRemarks: { type: String, default: '' },
  citizenRemarks: [{
    remark: { type: String },
    attachments: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: { type: String, required: true },
    remark: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);

