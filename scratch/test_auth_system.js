const axios = require('axios');

async function testAuthSystem() {
  console.log('=== SUVIDHA 2.0 Security & Auth System Test ===');
  
  // 1. Unauthenticated Request to Protected Endpoint
  try {
    await axios.post('http://127.0.0.1:5000/api/schemes/recommend', {});
    console.error('❌ FAIL: Unauthenticated request was allowed!');
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ PASS: Unauthenticated request blocked with HTTP 401 Unauthorized.');
    } else {
      console.error('❓ UNEXPECTED status:', err.response?.status);
    }
  }

  // 2. Login as Citizen
  let token = null;
  try {
    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'citizen@suvidha.gov.in',
      password: 'Citizen@123'
    });
    if (loginRes.data.success) {
      token = loginRes.data.token;
      console.log('✅ PASS: Login successful for Citizen user:', loginRes.data.user.name);
    }
  } catch (err) {
    console.error('❌ FAIL: Citizen login failed:', err.message);
  }

  // 3. Authenticated Request using Bearer Token
  if (token) {
    try {
      const meRes = await axios.get('http://127.0.0.1:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ PASS: Session restored via /api/auth/me:', meRes.data.user.email);
    } catch (err) {
      console.error('❌ FAIL: Authenticated /api/auth/me failed:', err.message);
    }

    try {
      const recRes = await axios.post('http://127.0.0.1:5000/api/schemes/recommend', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ PASS: Authenticated scheme recommendation returned', recRes.data.count, 'schemes.');
    } catch (err) {
      console.error('❌ FAIL: Authenticated recommendation failed:', err.message);
    }
  }

  console.log('=== Security Audit Complete ===');
}

testAuthSystem();
