require('dotenv').config();
const jwt = require('jsonwebtoken');

// Generate a token for testing
const generateToken = () => {
  const payload = {
    id: '6819eba6e7328ce27b9da301',
    userId: '6819eba6e7328ce27b9da2f8',
    isAdmin: true
  };
  
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
  
  console.log('Generated token:');
  console.log(token);
  
  console.log('\nDecoded token:');
  console.log(JSON.stringify(jwt.decode(token), null, 2));
  
  console.log('\nUse this token for testing by setting it in localStorage:');
  console.log('localStorage.setItem("token", "' + token + '")');
};

generateToken();
