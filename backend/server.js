const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const schemeRoutes = require('./routes/schemes');
const complaintRoutes = require('./routes/complaints');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SUVIDHA Express Backend API',
    port: PORT,
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Connect to MongoDB with automatic Memory Server fallback
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/suvidha';
  try {
    console.log(`Attempting MongoDB connection at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Connected Successfully to local instance.');
  } catch (err) {
    console.warn('Local MongoDB daemon unavailable. Booting in-memory MongoDB server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB Server running at ${memoryUri}`);

      // Seed in-memory database automatically
      const fs = require('fs');
      const Scheme = require('./models/Scheme');
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');

      const jsonPath = path.join(__dirname, '../ml_service/data/preprocessed_schemes.json');
      if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, 'utf-8');
        const schemesData = JSON.parse(rawData);
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
        console.log(`Auto-seeded ${schemesToInsert.length} schemes into in-memory MongoDB.`);
      }

      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('Admin@123', salt);
      const officerPass = await bcrypt.hash('Officer@123', salt);
      const citizenPass = await bcrypt.hash('Citizen@123', salt);

      await User.insertMany([
        {
          name: 'District Collector (Admin)',
          email: 'admin@suvidha.gov.in',
          password: adminPass,
          role: 'Admin',
          profile: { state: 'Madhya Pradesh', age: 42, gender: 'Male', income: 1200000, category: 'General', isStudent: false, occupation: 'Government Service', pincode: '462001' }
        },
        {
          name: 'Nodal Welfare Officer',
          email: 'officer@suvidha.gov.in',
          password: officerPass,
          role: 'Officer',
          profile: { state: 'Madhya Pradesh', age: 38, gender: 'Female', income: 900000, category: 'General', isStudent: false, occupation: 'Government Service', pincode: '462002' }
        },
        {
          name: 'Ramesh Sharma (Citizen)',
          email: 'citizen@suvidha.gov.in',
          password: citizenPass,
          role: 'Citizen',
          profile: { state: 'Madhya Pradesh', age: 28, gender: 'Male', income: 180000, category: 'OBC', isStudent: false, occupation: 'Farmer', pincode: '462003' }
        }
      ]);
      console.log('Auto-seeded default user credentials into in-memory MongoDB.');

    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB server:', memErr);
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SUVIDHA Express Backend API Server listening on port ${PORT}`);
  });
});
