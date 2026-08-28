const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true }, // e.g. SUV-2026-000184
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
  
  // SLA & Escalation Tracking
  slaHours: { type: Number, default: 48 }, // Critical: 24, High: 48, Medium: 120, Low: 168
  slaStatus: { type: String, enum: ['ACTIVE', 'SLA_BREACHED', 'RESOLVED'], default: 'ACTIVE' },
  escalatedAt: { type: Date },
  escalatedReason: { type: String, default: '' },

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
      'ACTION_TAKEN',
      'NEED_CLARIFICATION',
      'RESOLVED',
      'REJECTED',
      'CLOSED',
      'ESCALATED',
      'REOPENED'
    ],
    default: 'SUBMITTED',
    index: true
  },

  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  assignedDepartment: { type: String, default: '' },
  adminRemarks: { type: String, default: '' },
  officerRemarks: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },

  // Resolution Details & Evidence Proof
  resolution: { type: String, default: '' },
  resolutionProof: [{ type: String }],
  resolvedAt: { type: Date },
  closedAt: { type: Date },

  // Citizen Replies & Clarifications
  citizenReplies: [{
    message: { type: String, required: true },
    attachments: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }],

  // Citizen Resolution Rating & Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    isHelpful: { type: Boolean, default: true },
    createdAt: { type: Date }
  },

  statusHistory: [{
    status: { type: String, required: true },
    remark: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String, default: 'System' },
    updatedByRole: { type: String, default: 'System' },
    attachments: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-save SLA calculation helper
grievanceSchema.pre('save', function (next) {
  if (this.isNew) {
    if (this.priority === 'CRITICAL') this.slaHours = 24;
    else if (this.priority === 'HIGH') this.slaHours = 48;
    else if (this.priority === 'MEDIUM') this.slaHours = 120; // 5 days
    else if (this.priority === 'LOW') this.slaHours = 168; // 7 days
  }
  next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);
