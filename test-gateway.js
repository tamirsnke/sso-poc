const axios = require('axios');

async function getSessionCookie() {
  try {
    // Login first to get session
    const loginResponse = await axios.get('http://localhost:3001/auth/login', {
      withCredentials: true
    });
    return loginResponse.headers['set-cookie'][0];
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

async function testGateway() {
  try {
    console.log('Starting gateway test...');
    
    // Get session cookie
    const sessionCookie = await getSessionCookie();
    
    console.log('Testing gateway with session...');
    
    // Test datasources endpoint
    const response = await axios.get(
      'http://localhost:3001/gateway/application-portal/datasources/test',
      {
        withCredentials: true,
        headers: {
          Cookie: sessionCookie
        }
      }
    );
    
    console.log('Gateway Response:', {
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('Gateway Test Failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run tests
testGateway();
