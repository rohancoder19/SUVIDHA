const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');

async function seedDemoData() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('FATAL: MONGODB_URI is not configured in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri, { family: 4 });
    console.log('MongoDB Connected successfully.');

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const officerPass = await bcrypt.hash('Officer@123', salt);
    const citizenPass = await bcrypt.hash('Citizen@123', salt);
    const userPass = await bcrypt.hash('Password@123', salt);

    const demoUsers = [
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
      },
      {
        name: 'Rohan User',
        email: 'rohan@gmail.com',
        password: userPass,
        role: 'Citizen',
        profile: { state: 'West Bengal', age: 24, gender: 'Male', income: 250000, category: 'General', isStudent: false, occupation: 'Student', pincode: '700001' }
      }
    ];

    console.log('\nSeeding demo accounts into database...');
    for (const uData of demoUsers) {
      const existing = await User.findOne({ email: uData.email });
      if (!existing) {
        await User.create(uData);
        console.log(`+ Created demo user: ${uData.email} (${uData.role})`);
      } else {
        console.log(`= Demo user already exists: ${uData.email}`);
      }
    }

    const citizen = await User.findOne({ email: 'citizen@suvidha.gov.in' });
    const officer = await User.findOne({ email: 'officer@suvidha.gov.in' });

    if (citizen) {
      const sampleGrievances = [
        {
          referenceNumber: 'SUV-2026-104829',
          user: citizen._id,
          category: 'Payment Issue',
          schemeName: 'PM Kisan Samman Nidhi',
          department: 'Department of Agriculture & Farmers Welfare',
          state: 'Madhya Pradesh',
          district: 'Bhopal',
          subject: 'PM Kisan 16th Installment Amount Not Credited to Bank Account',
          description: 'My PM Kisan beneficiary status shows Active, but the 16th installment payment of Rs 2,000 has not been credited to my bank account.',
          priority: 'HIGH',
          status: 'UNDER_REVIEW',
          assignedOfficer: officer ? officer._id : null,
          officerRemarks: 'Verification under process with District Agriculture Officer.',
          statusHistory: [
            { status: 'SUBMITTED', remark: 'Grievance submitted by citizen', updatedBy: citizen._id, timestamp: new Date(Date.now() - 3*86400000) },
            { status: 'UNDER_REVIEW', remark: 'Assigned to Nodal Officer for bank Aadhaar link verification', updatedBy: officer?._id || citizen._id, timestamp: new Date(Date.now() - 1*86400000) }
          ]
        },
        {
          referenceNumber: 'SUV-2026-392014',
          user: citizen._id,
          category: 'Scholarship',
          schemeName: 'Post Matric Scholarship for OBC Students',
          department: 'Department of Social Justice & Empowerment',
          state: 'Madhya Pradesh',
          district: 'Bhopal',
          subject: 'Scholarship Disbursal Delayed for Academic Session 2025-26',
          description: 'College verified application on portal, but scholarship funds pending at state treasury desk for over 45 days.',
          priority: 'MEDIUM',
          status: 'SUBMITTED',
          statusHistory: [
            { status: 'SUBMITTED', remark: 'Grievance submitted by citizen', updatedBy: citizen._id, timestamp: new Date(Date.now() - 1*86400000) }
          ]
        }
      ];

      for (const gData of sampleGrievances) {
        const existingG = await Grievance.findOne({ referenceNumber: gData.referenceNumber });
        if (!existingG) {
          await Grievance.create(gData);
          console.log(`+ Created sample grievance: #${gData.referenceNumber}`);
        }
      }
    }

    console.log('\n✅ Demo Data Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
    process.exit(1);
  }
}

seedDemoData();
