const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  department: { type: String, default: '' },
  level: { type: String, enum: ['Central', 'State'], default: 'Central' },
  state: { type: String, default: 'All India' },
  description: { type: String, default: '' },
  eligibilityText: { type: String, default: '' },
  benefits: { type: String, default: '' },
  applicationUrl: { type: String, default: '#' },
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 100 },
  gender: { type: String, default: 'All' },
  maxIncome: { type: Number, default: 10000000 },
  isStudentOnly: { type: Boolean, default: false },
  targetOccupations: [{ type: String }],
  allowedCategories: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
