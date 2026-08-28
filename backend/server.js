const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const schemeRoutes = require('./routes/schemes');
const complaintRoutes = require('./routes/complaints');
const chatbotRoutes = require('./routes/chatbot');
const bookmarkRoutes = require('./routes/bookmarks');
const applicationRoutes = require('./routes/applications');
const feedbackRoutes = require('./routes/feedback');

const Scheme = require('./models/Scheme');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Feedback = require('./models/Feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting for Auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again after 15 minutes.' }
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static upload attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes with rate limiting on Auth
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Admin Analytics Endpoint
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSchemes = await Scheme.countDocuments({});
    const totalComplaints = await Complaint.countDocuments({});
    const totalFeedback = await Feedback.countDocuments({});
    const helpfulFeedback = await Feedback.countDocuments({ isHelpful: true });

    const categoriesCount = await Scheme.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const statesCount = await Scheme.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSchemes,
        totalComplaints,
        totalFeedback,
        satisfactionRate: totalFeedback > 0 ? Math.round((helpfulFeedback / totalFeedback) * 100) : 98,
        categoriesCount,
        statesCount
      },
      message: 'Admin analytics retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SUVIDHA 2.0 Auth-Protected Express API',
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
    console.log('MongoDB Connected Successfully to Atlas / local instance.');
  } catch (err) {
    console.warn('Local MongoDB daemon unavailable. Booting in-memory MongoDB server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB Server running at ${memoryUri}`);

      const fs = require('fs');
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
          requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'Residence Certificate', 'Bank Passbook'],
          applicationProcess: ['Visit official portal', 'Register with mobile & Aadhaar', 'Fill application form', 'Submit required document proofs']
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
    console.log(`🚀 SUVIDHA 2.0 Auth-Protected Express API Server listening on port ${PORT}`);
  });
});
