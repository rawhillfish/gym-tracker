require('dotenv').config();
const mongoose = require('mongoose');
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

const checkTemplateOwnership = async (templateId) => {
  try {
    await connectDB();
    
    console.log(`Checking template with ID: ${templateId}`);
    
    const template = await WorkoutTemplate.findById(templateId);
    
    if (!template) {
      console.error(`Template not found with ID: ${templateId}`);
      process.exit(1);
    }
    
    console.log('Template details:');
    console.log(`Name: ${template.name}`);
    console.log(`Description: ${template.description}`);
    console.log(`User ID: ${template.userId}`);
    console.log(`User ID type: ${typeof template.userId}`);
    console.log(`Is global: ${template.userId === null}`);
    console.log(`Is deleted: ${template.isDeleted}`);
    
    // Check if the userId is a valid ObjectId
    if (template.userId) {
      console.log(`Is userId a valid ObjectId: ${mongoose.Types.ObjectId.isValid(template.userId)}`);
      console.log(`userId as string: ${template.userId.toString()}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error checking template: ${error.message}`);
    process.exit(1);
  }
};

// Get template ID from command line arguments
const templateId = process.argv[2];

if (!templateId) {
  console.error('Please provide a template ID as an argument');
  console.log('Usage: node check-template-ownership.js <templateId>');
  process.exit(1);
}

checkTemplateOwnership(templateId);
