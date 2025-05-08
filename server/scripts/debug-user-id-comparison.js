require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gym-tracker');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const debugUserIdComparison = async (templateId, token) => {
  try {
    await connectDB();
    
    console.log(`Debugging userId comparison for template: ${templateId}`);
    
    // Decode the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development'
    );
    
    console.log('Decoded token:', decoded);
    console.log('User ID from token:', decoded.userId);
    console.log('User ID type from token:', typeof decoded.userId);
    
    // Get the template
    const template = await WorkoutTemplate.findById(templateId);
    
    if (!template) {
      console.error(`Template not found with ID: ${templateId}`);
      process.exit(1);
    }
    
    console.log('Template details:');
    console.log(`Name: ${template.name}`);
    console.log(`User ID from template: ${template.userId}`);
    console.log(`User ID type from template: ${typeof template.userId}`);
    
    if (template.userId) {
      console.log(`Template userId as string: ${template.userId.toString()}`);
      console.log(`Token userId as string: ${decoded.userId.toString()}`);
      
      // Compare the two IDs
      const isEqual = template.userId.toString() === decoded.userId.toString();
      console.log(`Are the IDs equal? ${isEqual}`);
      
      // Try different comparison methods
      console.log(`Using == comparison: ${template.userId == decoded.userId}`);
      console.log(`Using === comparison: ${template.userId === decoded.userId}`);
      console.log(`Using ObjectId equals: ${template.userId.equals(new mongoose.Types.ObjectId(decoded.userId))}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error debugging userId comparison: ${error.message}`);
    process.exit(1);
  }
};

// Get template ID and token from command line arguments
const templateId = process.argv[2];
const token = process.argv[3];

if (!templateId || !token) {
  console.error('Please provide both template ID and token as arguments');
  console.log('Usage: node debug-user-id-comparison.js <templateId> <token>');
  process.exit(1);
}

debugUserIdComparison(templateId, token);
