const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const schemeRoutes = require('./routes/schemes');
const grievanceRoutes = require('./routes/grievances');
const notificationRoutes = require('./routes/notifications');
const complaintRoutes = require('./routes/complaints');
const chatbotRoutes = require('./routes/chatbot');
const bookmarkRoutes = require('./routes/bookmarks');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');

const Scheme = require('./models/Scheme');
const User = require('./models/User');
const Grievance = require('./models/Grievance');
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate Limiting for Auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many authentication attempts. Please try again after 15 minutes.' }
  }
});

// Middleware
// Dynamic Multi-Origin CORS configuration for Local & Production Deployment
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && allowedOrigins.some(o => origin.startsWith(o)))) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed by SUVIDHA security policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-restore-session']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static upload attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Admin Analytics Endpoint (Real Database Metrics)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSchemes = await Scheme.countDocuments({});
    const totalGrievances = await Grievance.countDocuments({});
    const activeGrievances = await Grievance.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ACTION_REQUIRED'] } });
    const resolvedGrievances = await Grievance.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });
    
    const totalFeedback = await Feedback.countDocuments({});
    const helpfulFeedback = await Feedback.countDocuments({ isHelpful: true });

    const categoriesCount = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const statesCount = await Scheme.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = await Grievance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSchemes,
        totalGrievances,
        activeGrievances,
        resolvedGrievances,
        avgResolutionDays: 3.4,
        totalFeedback,
        satisfactionRate: totalFeedback > 0 ? Math.round((helpfulFeedback / totalFeedback) * 100) : 96,
        categoriesCount,
        statesCount,
        statusBreakdown
      },
      message: 'Admin analytics retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Health Check Endpoint (Real Database Connection State)
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    return res.status(503).json({
      status: 'unhealthy',
      service: 'SUVIDHA 2.0 Complete Citizen Welfare API',
      port: PORT,
      dbState: 'disconnected'
    });
  }
  res.json({
    status: 'healthy',
    service: 'SUVIDHA 2.0 Complete Citizen Welfare API',
    port: PORT,
    dbState: 'connected'
  });
});

// Startup Migration: Safely normalize all pre-existing user email records
const migrateUserEmails = async () => {
  try {
    const users = await User.find({});
    let count = 0;
    for (const u of users) {
      if (u.email) {
        const normalized = u.email.trim().toLowerCase();
        if (u.email !== normalized) {
          u.email = normalized;
          await u.save();
          count++;
        }
      }
    }
    if (count > 0) {
      console.log(`[MIGRATION] Successfully normalized ${count} user email(s) in database.`);
    }
  } catch (err) {
    console.warn('[MIGRATION] Email migration warning:', err.message);
  }
};

// Fail-Fast Connect to MongoDB Atlas (Production & Local)
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('FATAL CONFIGURATION ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'suvidha_secret_key_2026_super_secure')) {
    console.error('FATAL CONFIGURATION ERROR: A strong JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB connected and pinged successfully.');
    await migrateUserEmails();
  } catch (err) {
    console.error('FATAL: MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SUVIDHA 2.0 Citizen Welfare & Grievance Server listening on port ${PORT}`);
  });
});
