require('dotenv').config();
const fetch = require('node-fetch');

const testLoginEndpoint = async (email, password) => {
  try {
    console.log(`Testing login endpoint with email: ${email}`);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('Login successful!');
      
      // Decode and display the token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(data.token);
      console.log('\nDecoded token:');
      console.log(JSON.stringify(decoded, null, 2));
      
      console.log('\nUse this token for testing by setting it in localStorage:');
      console.log('localStorage.setItem("token", "' + data.token + '")');
    } else {
      console.log('Login failed!');
    }
    
  } catch (error) {
    console.error('Error testing login endpoint:', error);
  }
};

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide both email and password as arguments');
  console.log('Usage: node test-login-endpoint.js <email> <password>');
  process.exit(1);
}

testLoginEndpoint(email, password);
