const axios = require('axios');

const API_BASE = 'http://localhost:3002';
const AUTH_BASE = 'http://localhost:3001';
const KEYCLOAK_BASE = 'http://localhost:8080/realms/myrealm';

async function getTokenFromKeycloak() {
  console.log('🔑 Getting token directly from Keycloak...');
  
  // You need to replace these with actual credentials
  const username = process.env.TEST_USERNAME || 'testuser';
  const password = process.env.TEST_PASSWORD || 'testpass';
  const clientId = process.env.KEYCLOAK_CLIENT_ID || 'myclient';
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', clientId);
    params.append('username', username);
    params.append('password', password);
    
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    
    const response = await axios.post(`${KEYCLOAK_BASE}/protocol/openid-connect/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return response.data.access_token;
  } catch (err) {
    console.log('❌ Failed to get token from Keycloak:', err.response?.data?.error_description || err.message);
    return null;
  }
}

// ...existing code...

async function testMicroservice() {
  console.log('🧪 Testing Microservice Layer...\n');

  // Test 1: Health check
  try {
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data.status);
  } catch (err) {
    console.log('❌ Health check failed:', err.message);
    return; // Exit if microservice is not running
  }

  // Test 2: Get token from Keycloak directly
  let token = await getTokenFromKeycloak();
  
  if (!token) {
    console.log('\n📋 Alternative: Copy token from browser console and run:');
    console.log('node test-microservice.js --token="YOUR_TOKEN_HERE"');
    
    // Check if token was provided via command line
    const tokenArg = process.argv.find(arg => arg.startsWith('--token='));
    if (tokenArg) {
      token = tokenArg.split('=')[1].replace(/"/g, '');
      console.log('✅ Using provided token');
    } else {
      return;
    }
  } else {
    console.log('✅ Got token from Keycloak');
    console.log('🔍 Token preview:', token.substring(0, 50) + '...');
  }

  // Test 3: Validate token with auth service
  try {
    console.log('🔍 Testing token validation...');
    const validation = await axios.post(`${AUTH_BASE}/validate-token`, { token });
    console.log('✅ Token validation:', validation.data.valid ? 'Valid' : 'Invalid');
    if (validation.data.user) {
      console.log('   User:', validation.data.user.preferred_username);
      console.log('   Roles:', validation.data.user.roles.join(', '));
    }
  } catch (err) {
    console.log('❌ Token validation failed:');
    console.log('   Status:', err.response?.status);
    console.log('   Error:', err.response?.data?.error);
    console.log('   Details:', err.response?.data?.details);
    console.log('   Raw error:', err.message);
    
    // If token validation fails, other tests will also fail
    console.log('\n🛑 Stopping tests - fix token validation first');
    return;
  }

  // Test 4: Protected endpoint
  try {
    const protected = await axios.get(`${API_BASE}/protected`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint:', protected.data.message);
  } catch (err) {
    console.log('❌ Protected endpoint failed:');
    console.log('   Status:', err.response?.status);
    console.log('   Error:', err.response?.data?.error);
  }

  // Test 5: Business logic endpoint
  try {
    const orders = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Orders endpoint:', orders.data.orders.length, 'orders');
  } catch (err) {
    console.log('❌ Orders endpoint failed:');
    console.log('   Status:', err.response?.status);
    console.log('   Error:', err.response?.data?.error);
  }

  // Test 6: Admin endpoint (may fail if user isn't admin)
  try {
    const admin = await axios.get(`${API_BASE}/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Admin endpoint:', admin.data.message);
  } catch (err) {
    console.log('⚠️ Admin endpoint:');
    console.log('   Status:', err.response?.status);
    console.log('   Error:', err.response?.data?.error);
  }

  // Test 7: Invalid token
  try {
    await axios.get(`${API_BASE}/protected`, {
      headers: { Authorization: 'Bearer invalid_token' }
    });
  } catch (err) {
    console.log('✅ Invalid token properly rejected:', err.response?.data?.error);
  }

  console.log('\n🎉 Microservice testing complete!');
}

// ...existing code...

testMicroservice();
