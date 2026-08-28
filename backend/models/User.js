const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Citizen', 'Officer', 'Admin'], default: 'Citizen' },
  profile: {
    state: { type: String, default: 'All India' },
    age: { type: Number, default: 25 },
    gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Other', 'All'], default: 'All' },
    income: { type: Number, default: 250000 },
    category: { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS'], default: 'General' },
    isStudent: { type: Boolean, default: false },
    occupation: { type: String, default: 'All' },
    pincode: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
