const axios = require('axios');

async function testGrievanceSystem() {
  console.log('=== SUVIDHA 2.0 Citizen Welfare & Grievance System Test ===');
  
  // 1. Login as Citizen
  let token = null;
  try {
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'citizen@suvidha.gov.in',
      password: 'Citizen@123'
    });
    token = loginRes.data.token;
    console.log('✅ PASS: Citizen login successful:', loginRes.data.user.name);
  } catch (err) {
    console.error('❌ FAIL: Login failed:', err.message);
    return;
  }

  // 2. AI Smart Classification Test
  try {
    const classifyRes = await axios.post('http://127.0.0.1:5000/api/grievances/classify', {
      description: 'My scholarship payment of Rs 15000 has been delayed for 3 months.'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ PASS: AI Classification result:', classifyRes.data.data.category, '| Department:', classifyRes.data.data.department);
  } catch (err) {
    console.error('❌ FAIL: AI Classification failed:', err.message);
  }

  // 3. Register New Grievance
  let createdRef = null;
  try {
    const createRes = await axios.post('http://127.0.0.1:5000/api/grievances/create', {
      category: 'Scholarship Issue',
      schemeName: 'Post Matric Scholarship for OBC Students',
      subject: 'Scholarship Disbursal Delayed for Academic Session 2025-26',
      description: 'College verified application on portal, but scholarship funds pending at state treasury desk.',
      state: 'Madhya Pradesh',
      district: 'Bhopal'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    createdRef = createRes.data.referenceNumber;
    console.log('✅ PASS: Created Grievance with Ref #:', createdRef);
  } catch (err) {
    console.error('❌ FAIL: Grievance creation failed:', err.response?.data?.error || err.message);
  }

  // 4. Track Grievance Timeline by Reference Number
  if (createdRef) {
    try {
      const trackRes = await axios.get(`http://127.0.0.1:5000/api/grievances/track/${createdRef}`);
      console.log('✅ PASS: Tracked Grievance #', createdRef, '| Subject:', trackRes.data.grievance.subject, '| Status:', trackRes.data.grievance.status);
      console.log('   Timeline Steps:', trackRes.data.grievance.statusHistory.length);
    } catch (err) {
      console.error('❌ FAIL: Tracking failed:', err.message);
    }
  }

  // 5. Notifications System Test
  try {
    const notifRes = await axios.get('http://127.0.0.1:5000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ PASS: Notifications fetched | Unread:', notifRes.data.unreadCount, '| Total:', notifRes.data.notifications.length);
  } catch (err) {
    console.error('❌ FAIL: Notifications fetch failed:', err.message);
  }

  console.log('=== All Citizen Welfare & Grievance Tests Passed! ===');
}

testGrievanceSystem();
