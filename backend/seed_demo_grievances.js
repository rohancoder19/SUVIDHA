require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Grievance = require('./models/Grievance');
const GrievanceHistory = require('./models/GrievanceHistory');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/suvidha';

const DEMO_GRIEVANCES = [
  {
    referenceNumber: 'SUV-2026-000001',
    subject: 'Street Light Not Working',
    category: 'Electricity',
    department: 'Municipal Corporation Electricity Division',
    priority: 'HIGH',
    status: 'SUBMITTED',
    description: 'The street lights on Park Street ward 4 have been non-functional for 5 days, causing safety hazards at night.',
    address: 'Park Street, Ward 4, Kolkata',
    latitude: 22.5539,
    longitude: 88.3516,
    urgencyScore: 75,
    aiReason: 'Public safety hazard in high footfall residential area.'
  },
  {
    referenceNumber: 'SUV-2026-000002',
    subject: 'Garbage Collection Not Happening Regularly',
    category: 'Garbage & Sanitation',
    department: 'Municipal Corporation Conservancy Department',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    description: 'Municipal garbage collection truck has not visited Sector 2 for 4 consecutive days.',
    address: 'Block B, Sector 2, Salt Lake, Kolkata',
    latitude: 22.5867,
    longitude: 88.4172,
    urgencyScore: 55,
    aiReason: 'Sanitation and hygiene concern for residential block.'
  },
  {
    referenceNumber: 'SUV-2026-000003',
    subject: 'Water Supply Disruption',
    category: 'Water Supply',
    department: 'Public Health Engineering Department',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    description: 'Clean drinking water pipeline pressure is low and supply is interrupted during morning hours.',
    address: 'Rashbehari Avenue, Gariahat, Kolkata',
    latitude: 22.5186,
    longitude: 88.3661,
    urgencyScore: 82,
    aiReason: 'Essential utility disruption affecting households.'
  },
  {
    referenceNumber: 'SUV-2026-000004',
    subject: 'Damaged Road Near Residential Area',
    category: 'Road & Infrastructure',
    department: 'Public Works Department (PWD)',
    priority: 'HIGH',
    status: 'ACTION_TAKEN',
    description: 'Large potholes on main arterial road near school gate causing traffic bottlenecks and minor skid accidents.',
    address: 'Dunlop Crossing, BT Road, Kolkata',
    latitude: 22.6521,
    longitude: 88.3712,
    urgencyScore: 88,
    aiReason: 'High hazard risk for two-wheelers and pedestrians.'
  },
  {
    referenceNumber: 'SUV-2026-000005',
    subject: 'Illegal Waste Dumping',
    category: 'Garbage & Sanitation',
    department: 'Municipal Corporation Conservancy Department',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Uncovered waste accumulation near community playground.',
    address: 'Behala Chowrasta, Kolkata',
    latitude: 22.4981,
    longitude: 88.3184,
    urgencyScore: 60,
    aiReason: 'Environmental sanitation issue.'
  },
  {
    referenceNumber: 'SUV-2026-000006',
    subject: 'Drainage Blockage During Rain',
    category: 'Drainage & Sewage',
    department: 'Drainage & Sewerage Board',
    priority: 'CRITICAL',
    status: 'ESCALATED',
    description: 'Main storm drainage line clogged causing waterlogging in low-lying residential streets.',
    address: 'Amherst Street, College Street Ward, Kolkata',
    latitude: 22.5744,
    longitude: 88.3683,
    urgencyScore: 95,
    aiReason: 'Critical flood risk and waterlogging hazard.'
  },
  {
    referenceNumber: 'SUV-2026-000007',
    subject: 'Public Toilet Maintenance Issue',
    category: 'Other',
    department: 'Municipal Corporation Public Amenities',
    priority: 'LOW',
    status: 'CLOSED',
    description: 'Flush valve repair required in market public restroom facility.',
    address: 'Shyambazar Metro Station Area, Kolkata',
    latitude: 22.6001,
    longitude: 88.3734,
    urgencyScore: 35,
    aiReason: 'Minor public amenity maintenance.'
  },
  {
    referenceNumber: 'SUV-2026-000008',
    subject: 'Traffic Signal Malfunction',
    category: 'Public Safety',
    department: 'Traffic Police Department',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    description: 'Traffic signals flickering randomly at busy 4-way intersection causing gridlock.',
    address: 'Exide Crossing, AJC Bose Road, Kolkata',
    latitude: 22.5392,
    longitude: 88.3524,
    urgencyScore: 92,
    aiReason: 'Critical public traffic safety hazard.'
  },
  {
    referenceNumber: 'SUV-2026-000009',
    subject: 'Stray Animal Safety Concern',
    category: 'Public Safety',
    department: 'Municipal Animal Control Division',
    priority: 'MEDIUM',
    status: 'NEED_CLARIFICATION',
    description: 'Aggressive stray dogs near bus stop.',
    address: 'Jadavpur 8B Bus Stand, Kolkata',
    latitude: 22.4990,
    longitude: 88.3718,
    urgencyScore: 58,
    aiReason: 'Public safety inquiry requiring field check.'
  },
  {
    referenceNumber: 'SUV-2026-000010',
    subject: 'Roadside Street Vendor Obstruction',
    category: 'Government Service',
    department: 'Municipal Estate Department',
    priority: 'MEDIUM',
    status: 'REJECTED',
    description: 'Encroachment on pedestrian footpath.',
    address: 'Gariahat Market Footpath, Kolkata',
    latitude: 22.5190,
    longitude: 88.3670,
    urgencyScore: 40,
    aiReason: 'Commercial estate dispute.'
  }
];

const seedDemoGrievances = async () => {
  try {
    console.log('Connecting to MongoDB Atlas at:', MONGO_URI.split('@')[1] || 'cluster');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas successfully!');

    // Ensure test citizen & admin accounts exist
    let citizen = await User.findOne({ role: 'Citizen' });
    if (!citizen) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Password@123', salt);
      citizen = await User.create({
        name: 'Rohan Sharma',
        email: 'citizen@suvidha.gov.in',
        password: hash,
        role: 'Citizen',
        profile: { state: 'West Bengal', district: 'Kolkata' }
      });
      console.log('Created demo citizen account: citizen@suvidha.gov.in');
    }

    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Admin@123', salt);
      admin = await User.create({
        name: 'Rahul Nodal Officer',
        email: 'admin@suvidha.gov.in',
        password: hash,
        role: 'Admin',
        profile: { state: 'West Bengal', district: 'Kolkata', occupation: 'Public Grievance Directorate' }
      });
      console.log('Created demo admin account: admin@suvidha.gov.in');
    }

    console.log('Seeding 10 demo grievances (SUV-2026-000001 to SUV-2026-000010)...');

    for (const data of DEMO_GRIEVANCES) {
      let grievance = await Grievance.findOne({ referenceNumber: data.referenceNumber });
      if (!grievance) {
        grievance = new Grievance({
          ...data,
          user: citizen._id,
          assignedOfficer: admin._id,
          assignedDepartment: data.department,
          aiCategory: data.category,
          aiPriority: data.priority,
          aiDepartment: data.department,
          statusHistory: [
            {
              status: 'SUBMITTED',
              remark: 'Grievance submitted via Citizen Web Portal.',
              updatedBy: citizen._id,
              updatedByName: citizen.name,
              updatedByRole: citizen.role,
              timestamp: new Date(Date.now() - 3600000 * 24)
            },
            {
              status: data.status,
              remark: `Initial status set to ${data.status}.`,
              updatedBy: admin._id,
              updatedByName: admin.name,
              updatedByRole: admin.role,
              timestamp: new Date()
            }
          ]
        });
        await grievance.save();
        console.log(`✓ Seeded ${data.referenceNumber} - ${data.subject} [${data.status}]`);
      } else {
        grievance.status = data.status;
        grievance.priority = data.priority;
        grievance.subject = data.subject;
        grievance.description = data.description;
        await grievance.save();
        console.log(`✓ Updated existing ${data.referenceNumber} - ${data.subject} [${data.status}]`);
      }

      // Create GrievanceHistory audit log
      await GrievanceHistory.deleteMany({ referenceNumber: data.referenceNumber });
      await GrievanceHistory.create({
        grievance: grievance._id,
        referenceNumber: data.referenceNumber,
        actor: citizen._id,
        actorName: citizen.name,
        actorRole: citizen.role,
        action: 'CREATED',
        oldStatus: '',
        newStatus: 'SUBMITTED',
        comment: 'Grievance registered by citizen.',
        timestamp: new Date(Date.now() - 3600000 * 24)
      });

      if (data.status !== 'SUBMITTED') {
        await GrievanceHistory.create({
          grievance: grievance._id,
          referenceNumber: data.referenceNumber,
          actor: admin._id,
          actorName: admin.name,
          actorRole: admin.role,
          action: 'STATUS_UPDATED',
          oldStatus: 'SUBMITTED',
          newStatus: data.status,
          comment: `Status updated to ${data.status}`,
          timestamp: new Date()
        });
      }
    }

    console.log('\n🎉 ALL 10 DEMO GRIEVANCES SEEDED SUCCESSFULLY INTO MONGO DB ATLAS!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDemoGrievances();
