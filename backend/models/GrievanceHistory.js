const mongoose = require('mongoose');

const grievanceHistorySchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  referenceNumber: { type: String, required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, enum: ['Citizen', 'Officer', 'Admin', 'System'], default: 'System' },
  action: { type: String, required: true }, // e.g. CREATED, ASSIGNED, STATUS_CHANGE, PRIORITY_OVERRIDE, REMARK_ADDED, CLARIFICATION_SUBMITTED, RESOLVED, ESCALATED, REOPENED
  oldStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  comment: { type: String, default: '' },
  attachments: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GrievanceHistory', grievanceHistorySchema);
