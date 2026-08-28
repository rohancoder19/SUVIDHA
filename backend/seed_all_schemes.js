const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Scheme = require('./models/Scheme');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/suvidha';

async function seedAllSchemes() {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    const jsonPath = path.join(__dirname, '../ml_service/data/preprocessed_schemes.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('Error: preprocessed_schemes.json not found!');
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const schemesData = JSON.parse(rawData);

    console.log(`Clearing existing schemes and seeding ${schemesData.length} schemes...`);
    await Scheme.deleteMany({});

    const schemesToInsert = schemesData.map(s => ({
      slug: s.scheme_slug,
      title: s.scheme_name,
      department: s.department,
      level: s.level,
      state: s.state_name,
      category: s.category || 'General Welfare',
      description: s.description,
      eligibilityText: s.eligibility_text,
      benefits: s.benefits,
      applicationUrl: s.application_url,
      officialSource: s.official_source || s.application_url || 'https://myscheme.gov.in',
      minAge: s.min_age,
      maxAge: s.max_age,
      gender: s.gender,
      maxIncome: s.max_income,
      isStudentOnly: s.is_student_only,
      targetOccupations: s.target_occupations,
      allowedCategories: s.allowed_categories,
      requiredDocuments: s.required_documents,
      applicationProcess: s.application_process
    }));

    // Batch insert for performance
    const batchSize = 500;
    for (let i = 0; i < schemesToInsert.length; i += batchSize) {
      const batch = schemesToInsert.slice(i, i + batchSize);
      await Scheme.insertMany(batch, { ordered: false });
      console.log(`Seeded batch ${i / batchSize + 1} (${Math.min(i + batchSize, schemesToInsert.length)} / ${schemesToInsert.length} schemes)`);
    }

    const count = await Scheme.countDocuments({});
    console.log(`🎉 SUCCESS: Total ${count} government schemes seeded into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seedAllSchemes();
