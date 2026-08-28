const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  department: { type: String, default: '' },
  level: { type: String, enum: ['Central', 'State'], default: 'Central' },
  state: { type: String, default: 'All India' },
  districts: [{ type: String }],
  category: { type: String, default: 'General Welfare' },
  description: { type: String, default: '' },
  eligibilityText: { type: String, default: '' },
  benefits: { type: String, default: '' },
  applicationUrl: { type: String, default: '#' },
  officialSource: { type: String, default: '#' },
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 100 },
  gender: { type: String, default: 'All' },
  maxIncome: { type: Number, default: 10000000 },
  isStudentOnly: { type: Boolean, default: false },
  targetOccupations: [{ type: String }],
  allowedCategories: [{ type: String }],
  beneficiaryType: { type: String, default: 'All Citizens' },
  educationLevel: { type: String, default: 'Any' },
  requiredDocuments: [{ type: String }],
  applicationProcess: [{ type: String }],
  faqs: [{ question: String, answer: String }],
  tags: [{ type: String }],
  status: { type: String, enum: ['Active', 'Archived', 'Draft'], default: 'Active' },
  lastVerifiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);

