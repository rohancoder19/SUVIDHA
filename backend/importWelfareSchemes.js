const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Scheme = require('./models/Scheme');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/suvidha';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // Seed Schemes
    const jsonPath = path.join(__dirname, '../ml_service/data/preprocessed_schemes.json');
    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const schemesData = JSON.parse(rawData);

      await Scheme.deleteMany({});
      console.log('Cleared existing schemes.');

      const schemesToInsert = schemesData.map(s => ({
        slug: s.scheme_slug,
        title: s.scheme_name,
        department: s.department,
        level: s.level,
        state: s.state_name,
        description: s.description,
        eligibilityText: s.eligibility_text,
        benefits: s.benefits,
        applicationUrl: s.application_url,
        minAge: s.min_age,
        maxAge: s.max_age,
        gender: s.gender,
        maxIncome: s.max_income,
        isStudentOnly: s.is_student_only,
        targetOccupations: s.target_occupations,
        allowedCategories: s.allowed_categories
      }));

      await Scheme.insertMany(schemesToInsert);
      console.log(`Inserted ${schemesToInsert.length} schemes into MongoDB.`);
    }

    // Seed Admin & Officer users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const officerPassword = await bcrypt.hash('Officer@123', salt);
    const citizenPassword = await bcrypt.hash('Citizen@123', salt);

    await User.deleteMany({ email: { $in: ['admin@suvidha.gov.in', 'officer@suvidha.gov.in', 'citizen@suvidha.gov.in'] } });

    const seedUsers = [
      {
        name: 'District Collector (Admin)',
        email: 'admin@suvidha.gov.in',
        password: adminPassword,
        role: 'Admin',
        profile: { state: 'Madhya Pradesh', age: 42, gender: 'Male', income: 1200000, category: 'General', isStudent: false, occupation: 'Government Service', pincode: '462001' }
      },
      {
        name: 'Nodal Welfare Officer',
        email: 'officer@suvidha.gov.in',
        password: officerPassword,
        role: 'Officer',
        profile: { state: 'Madhya Pradesh', age: 38, gender: 'Female', income: 900000, category: 'General', isStudent: false, occupation: 'Government Service', pincode: '462002' }
      },
      {
        name: 'Ramesh Sharma (Citizen)',
        email: 'citizen@suvidha.gov.in',
        password: citizenPassword,
        role: 'Citizen',
        profile: { state: 'Madhya Pradesh', age: 28, gender: 'Male', income: 180000, category: 'OBC', isStudent: false, occupation: 'Farmer', pincode: '462003' }
      }
    ];

    await User.insertMany(seedUsers);
    console.log('Seeded default Admin, Officer, and Citizen accounts.');

    console.log('Database seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
