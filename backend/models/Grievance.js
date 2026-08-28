const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true }, // e.g. SUV-2026-000184
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Scheme Benefit Not Received',
      'Application Rejected',
      'Application Delayed',
      'Payment Issue',
      'Scholarship Issue',
      'Pension Issue',
      'Subsidy Issue',
      'Documentation Problem',
      'Eligibility Dispute',
      'Government Service Issue',
      'Corruption/Irregularity',
      'Other'
    ]
  },
  schemeName: { type: String, default: 'General Welfare Service' },
  department: { type: String, default: 'Department of Revenue & Public Grievances' },
  state: { type: String, required: true, default: 'All India' },
  district: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  incidentDate: { type: Date, default: Date.now },
  applicationNumber: { type: String, default: '' },
  attachments: [{ type: String }],
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
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
  }]
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);
