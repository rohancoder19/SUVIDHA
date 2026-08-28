const mongoose = require('mongoose');

const grievanceHistorySchema = new mongoose.Schema({
  grievance: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', required: true, index: true },
  referenceNumber: { type: String, required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, default: 'System' },
  actorRole: { type: String, default: 'System' },
  action: { type: String, default: 'STATUS_UPDATED' },
  oldStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  comment: { type: String, default: '' },
  attachments: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GrievanceHistory', grievanceHistorySchema);
