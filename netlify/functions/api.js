// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple proxy endpoint - handle all routes
app.all('*', async (req, res) => {
  const apiUrl = process.env.BACKEND_API_URL || 'https://gym-tracker-api.onrender.com';
  console.log('Backend API URL:', apiUrl);
  // Add /api prefix to the path for the backend
  const path = req.path;
  const fullUrl = apiUrl + '/api' + path;
  
  try {
    // Prepare headers (excluding host which can cause issues)
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key !== 'host' && key !== 'connection') {
        headers[key] = value;
      }
    }
    
    // Forward the request with axios
    const response = await axios({
      url: fullUrl,
      method: req.method,
      headers: headers,
      data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      validateStatus: () => true, // Don't throw on any status code
    });
    
    // Set the status code
    res.status(response.status);
    
    // Set response headers
    for (const [key, value] of Object.entries(response.headers)) {
      // Skip headers that might cause issues
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.set(key, value);
      }
    }
    
    // Send the response
    if (typeof response.data === 'object') {
      res.json(response.data);
    } else {
      res.send(response.data);
    }
  } catch (error) {
    console.error('Error in API proxy:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Export the serverless function
module.exports.handler = serverless(app);
