const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Citizen', 'Officer', 'Admin'], default: 'Citizen' },
  profile: {
    state: { type: String, default: 'All India' },
    district: { type: String, default: '' },
    age: { type: Number, default: 25 },
    gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Other', 'All'], default: 'All' },
    income: { type: Number, default: 250000 },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], default: 'General' },
    isStudent: { type: Boolean, default: false },
    occupation: { type: String, default: 'All' },
    education: { type: String, default: 'Graduate' },
    employmentStatus: { type: String, default: 'Employed' },
    disabilityStatus: { type: Boolean, default: false },
    maritalStatus: { type: String, default: 'Single' },
    pincode: { type: String, default: '' }
  },
  savedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' }],
  trackedApplications: [{
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
    status: {
      type: String,
      enum: ['Saved', 'Preparing Documents', 'Ready to Apply', 'Applied', 'Under Review', 'Approved', 'Rejected'],
      default: 'Saved'
    },
    notes: { type: String, default: '' },
    appliedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now }
  }],
  documentStatuses: {
    type: Map,
    of: { type: String, enum: ['not_available', 'ready', 'uploaded'], default: 'not_available' },
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

