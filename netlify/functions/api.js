// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple proxy endpoint
app.get('/api/*', async (req, res) => {
  const apiUrl = process.env.BACKEND_API_URL || 'https://gym-tracker-api.onrender.com';
  const path = req.path.replace('/api', '');
  
  try {
    // Return a placeholder response for now
    res.json({
      message: 'This is a placeholder response from the Netlify Function',
      note: 'The actual backend is deployed separately on Render',
      requestedPath: path,
      backendUrl: apiUrl + path
    });
  } catch (error) {
    console.error('Error in API proxy:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Export the serverless function
module.exports.handler = serverless(app);
