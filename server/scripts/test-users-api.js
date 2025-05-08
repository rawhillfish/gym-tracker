require('dotenv').config();
const fetch = require('node-fetch');

const testUsersApi = async () => {
  try {
    console.log('Testing users API endpoint');
    
    // Get token from localStorage if available
    const token = process.argv[2] || '';
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'GET',
      headers
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} users`);
    } else {
      console.log('Response is not an array');
    }
    
  } catch (error) {
    console.error('Error testing users API:', error);
  }
};

testUsersApi();
