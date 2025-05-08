require('dotenv').config();
const axios = require('axios');

const simulateUpdateRequest = async (templateId, token, templateData) => {
  try {
    console.log(`Simulating update request for template ID: ${templateId}`);
    console.log(`Using token: ${token}`);
    console.log('Template data:', templateData);
    
    const response = await axios.put(
      `http://localhost:5000/api/workout-templates/${templateId}`,
      templateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Update successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Error simulating update request:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
};

// Template data to send
const templateData = {
  _id: '6819eba6e7328ce27b9da333',
  name: "Jason's Push Day",
  description: "Jason's personal push workout routine (Updated via script)",
  userId: '6819eba6e7328ce27b9da2f8',
  exercises: [
    {
      exerciseId: '6819eba6e7328ce27b9da307',
      name: 'Bench Press',
      category: 'Chest',
      sets: 3,
      reps: 8
    },
    {
      exerciseId: '6819eba6e7328ce27b9da315',
      name: 'Military Shoulder Press',
      category: 'Shoulders',
      sets: 3,
      reps: 10
    },
    {
      exerciseId: '6819eba6e7328ce27b9da309',
      name: 'Dips',
      category: 'Chest',
      sets: 3,
      reps: 10
    },
    {
      exerciseId: '6819eba6e7328ce27b9da30a',
      name: 'Tricep Extensions',
      category: 'Arms',
      sets: 3,
      reps: 12
    }
  ],
  isDeleted: false,
  deletedAt: null,
  isGlobal: false
};

// Get template ID and token from command line arguments
const templateId = process.argv[2];
const token = process.argv[3];

if (!templateId || !token) {
  console.error('Please provide both template ID and token as arguments');
  console.log('Usage: node simulate-update-request.js <template-id> <token>');
  process.exit(1);
}

simulateUpdateRequest(templateId, token, templateData);
