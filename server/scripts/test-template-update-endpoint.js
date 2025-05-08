require('dotenv').config();
const fetch = require('node-fetch');

// Get token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error('Please provide a token as an argument');
  console.log('Usage: node test-template-update-endpoint.js <token>');
  process.exit(1);
}

// Test template to update
const templateToUpdate = {
  _id: '6819eba6e7328ce27b9da334', // Andrew's Pull Day template
  name: 'Andrew\'s Pull Day',
  description: 'Andrew\'s personal pull workout routine (Updated via test script)',
  exercises: [
    {
      exerciseId: '6819eba6e7328ce27b9da30d',
      name: 'Pull Ups',
      category: 'Back',
      sets: 3,
      reps: 8
    },
    {
      exerciseId: '6819eba6e7328ce27b9da30e',
      name: 'Barbell Row',
      category: 'Back',
      sets: 3,
      reps: 10
    },
    {
      exerciseId: '6819eba6e7328ce27b9da30c',
      name: 'Bicep Curl',
      category: 'Arms (Biceps)',
      sets: 3,
      reps: 12
    },
    {
      exerciseId: '6819eba6e7328ce27b9da30b',
      name: 'Deadlift',
      category: 'Back',
      sets: 3,
      reps: 5
    }
  ],
  userId: '6819eba6e7328ce27b9da2f9', // Andrew's user ID
  isGlobal: false // Keep as personal template
};

const testTemplateUpdate = async () => {
  try {
    console.log('Testing template update endpoint');
    console.log('Template data:', JSON.stringify(templateToUpdate, null, 2));
    
    const response = await fetch(`http://localhost:5000/api/workout-templates/${templateToUpdate._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(templateToUpdate)
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('Template update successful!');
    } else {
      console.log('Template update failed!');
    }
    
  } catch (error) {
    console.error('Error testing template update endpoint:', error);
  }
};

testTemplateUpdate();
