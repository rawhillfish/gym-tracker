// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple proxy endpoint
app.all('/api/*', async (req, res) => {
  const apiUrl = process.env.BACKEND_API_URL || 'https://gym-tracker-api.onrender.com';
  const path = req.path.replace('/api', '');
  const fullUrl = apiUrl + path;
  
  try {
    // Use node-fetch to forward the request to the backend
    const fetch = require('node-fetch');
    
    // Prepare headers (excluding host which can cause issues)
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key !== 'host' && key !== 'connection') {
        headers[key] = value;
      }
    }
    
    // Forward the request with the same method, body, and headers
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    // Get the response data
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Set the status code and send the response
    res.status(response.status);
    
    // Set response headers
    for (const [key, value] of response.headers.entries()) {
      // Skip headers that might cause issues
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.set(key, value);
      }
    }
    
    // Send the response
    if (typeof data === 'object') {
      res.json(data);
    } else {
      res.send(data);
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
