const axios = require('axios');

const API_BASE = 'http://localhost:3002';
const AUTH_BASE = 'http://localhost:3001';
const KEYCLOAK_BASE = 'http://localhost:8080/realms/myrealm';

async function getTokenFromKeycloak() {
  console.log('🔑 Getting token directly from Keycloak...');
  
  // Secure credential management from environment variables
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });
    
    return response.data.access_token;
  } catch (err) {
    console.log('❌ Failed to get token from Keycloak:', err.response?.data?.error_description || err.message);
    if (err.response?.data?.error === 'invalid_grant') {
      console.log('💡 Hint: Check if Direct Access Grants is enabled in Keycloak client settings');
    }
    return null;
  }
}

async function testMicroservice() {
  console.log('🧪 Testing SSO Microservice Architecture...\n');
  console.log('📋 Test Configuration:');
  console.log(`   Auth Service: ${AUTH_BASE}`);
  console.log(`   Microservice: ${API_BASE}`);
  console.log(`   Keycloak: ${KEYCLOAK_BASE}\n`);

  // Test 1: Microservice Health Check
  try {
    const health = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    console.log('✅ Microservice health check:', health.data.status);
  } catch (err) {
    console.log('❌ Microservice health check failed:', err.message);
    console.log('💡 Make sure node-api-2 is running on port 3002');
    return;
  }

  // Test 2: Auth Service Health Check
  try {
    const authHealth = await axios.get(`${AUTH_BASE}/health`, { timeout: 5000 });
    console.log('✅ Auth service health check:', authHealth.data.status);
  } catch (err) {
    console.log('❌ Auth service health check failed:', err.message);
    console.log('💡 Make sure node-api-1 is running on port 3001');
    return;
  }

  // Test 3: Token Acquisition
  let token = await getTokenFromKeycloak();
  
  if (!token) {
    console.log('\n📋 Alternative methods to get token:');
    console.log('1. Copy from browser console (logged in Angular app):');
    console.log('   fetch("http://localhost:3001/user-info", {credentials: "include"}).then(r => r.json()).then(d => console.log("Token:", d.token))');
    console.log('2. Run with manual token:');
    console.log('   node test-microservice.js --token="YOUR_TOKEN_HERE"');
    
    // Check for command line token
    const tokenArg = process.argv.find(arg => arg.startsWith('--token='));
    if (tokenArg) {
      token = tokenArg.split('=')[1].replace(/"/g, '');
      console.log('✅ Using provided token');
    } else {
      return;
    }
  } else {
    console.log('✅ Successfully obtained token from Keycloak');
    console.log('🔍 Token preview:', token.substring(0, 50) + '...');
  }

  // Test 4: Centralized Token Validation
  try {
    console.log('\n🔍 Testing centralized token validation...');
    const validation = await axios.post(`${AUTH_BASE}/validate-token`, 
      { token }, 
      { timeout: 5000 }
    );
    
    if (validation.data.valid) {
      console.log('✅ Token validation: Valid');
      console.log(`   User: ${validation.data.user.preferred_username}`);
      console.log(`   Roles: ${validation.data.user.roles.join(', ')}`);
      console.log(`   Expires: ${new Date(validation.data.user.exp * 1000).toLocaleString()}`);
    } else {
      console.log('❌ Token validation: Invalid');
      return;
    }
  } catch (err) {
    console.log('❌ Token validation failed:');
    console.log(`   Status: ${err.response?.status}`);
    console.log(`   Error: ${err.response?.data?.error}`);
    console.log(`   Details: ${err.response?.data?.details}`);
    console.log('\n🛑 Stopping tests - fix token validation first');
    return;
  }

  // Test 5: Microservice Protected Endpoint
  try {
    console.log('\n🔒 Testing microservice protected endpoint...');
    const protected = await axios.get(`${API_BASE}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    console.log('✅ Protected endpoint access successful');
    console.log(`   Message: ${protected.data.message}`);
    console.log(`   Service: ${protected.data.service}`);
  } catch (err) {
    console.log('❌ Protected endpoint failed:');
    console.log(`   Status: ${err.response?.status}`);
    console.log(`   Error: ${err.response?.data?.error}`);
  }

  // Test 6: Business Logic Endpoint
  try {
    console.log('\n📊 Testing business logic endpoint...');
    const orders = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    console.log('✅ Orders endpoint access successful');
    console.log(`   Orders count: ${orders.data.orders.length}`);
    console.log(`   Sample order: ${orders.data.orders[0]?.id || 'N/A'}`);
  } catch (err) {
    console.log('❌ Orders endpoint failed:');
    console.log(`   Status: ${err.response?.status}`);
    console.log(`   Error: ${err.response?.data?.error}`);
  }

  // Test 7: Role-Based Access (Admin Endpoint)
  try {
    console.log('\n👑 Testing role-based access (admin endpoint)...');
    const admin = await axios.get(`${API_BASE}/admin`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    console.log('✅ Admin endpoint access successful');
    console.log(`   Message: ${admin.data.message}`);
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('⚠️ Admin endpoint access denied (expected if user lacks admin role)');
      console.log(`   Error: ${err.response?.data?.error}`);
    } else {
      console.log('❌ Admin endpoint failed:');
      console.log(`   Status: ${err.response?.status}`);
      console.log(`   Error: ${err.response?.data?.error}`);
    }
  }

  // Test 8: Security - Invalid Token Rejection
  try {
    console.log('\n🛡️ Testing security - invalid token rejection...');
    await axios.get(`${API_BASE}/protected`, {
      headers: { Authorization: 'Bearer invalid_token_12345' },
      timeout: 5000
    });
    console.log('❌ Security failure: Invalid token was accepted');
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('✅ Security check passed: Invalid token properly rejected');
    } else {
      console.log('⚠️ Unexpected error for invalid token:', err.response?.status);
    }
  }

  // Test 9: Security - Missing Authorization Header
  try {
    console.log('\n🛡️ Testing security - missing authorization header...');
    await axios.get(`${API_BASE}/protected`, { timeout: 5000 });
    console.log('❌ Security failure: Request without authorization was accepted');
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('✅ Security check passed: Missing authorization properly rejected');
    } else {
      console.log('⚠️ Unexpected error for missing auth:', err.response?.status);
    }
  }

  // Test 10: Service Resilience
  console.log('\n🔧 Testing service resilience...');
  console.log('💡 To test auth service unavailability, temporarily stop node-api-1 and run this test again');

  console.log('\n🎉 SSO Microservice testing complete!');
  console.log('\n📊 Test Summary:');
  console.log('   - Token acquisition and validation');
  console.log('   - Distributed authentication across microservices');
  console.log('   - Role-based authorization');
  console.log('   - Security boundary enforcement');
  console.log('   - Service health monitoring');
}

// Execute tests
testMicroservice().catch(err => {
  console.error('🚨 Test execution failed:', err.message);
  process.exit(1);
});

// Contains AI-generated edits.