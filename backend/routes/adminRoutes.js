const express = require('express');
const router = express.Router();
const { getAllComplaints, updateComplaintStatus, overrideAIDecision, getAdminAnalytics } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/complaints', protect, authorizeRoles('Admin', 'Officer'), getAllComplaints); //getAPI
router.put('/complaints/:id/status', protect, authorizeRoles('Admin', 'Officer'), updateComplaintStatus); // put API
router.put('/complaints/:id/decision', protect, authorizeRoles('Admin', 'Officer'), overrideAIDecision);// put API
router.get('/analytics', protect, authorizeRoles('Admin', 'Officer'), getAdminAnalytics);

module.exports = router;
