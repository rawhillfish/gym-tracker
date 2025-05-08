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

const updateTemplate = async (templateId, updates) => {
  try {
    await connectDB();
    
    console.log(`Updating template with ID: ${templateId}`);
    console.log('Updates:', JSON.stringify(updates, null, 2));
    
    const template = await WorkoutTemplate.findById(templateId);
    
    if (!template) {
      console.error(`Template not found with ID: ${templateId}`);
      process.exit(1);
    }
    
    console.log('Original template:');
    console.log(`Name: ${template.name}`);
    console.log(`Description: ${template.description}`);
    console.log(`User ID: ${template.userId}`);
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      template[key] = updates[key];
    });
    
    // Save the template
    await template.save();
    
    console.log('Template updated successfully!');
    console.log('Updated template:');
    console.log(`Name: ${template.name}`);
    console.log(`Description: ${template.description}`);
    console.log(`User ID: ${template.userId}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Error updating template: ${error.message}`);
    process.exit(1);
  }
};

// Get template ID from command line arguments
const templateId = process.argv[2];

if (!templateId) {
  console.error('Please provide a template ID as an argument');
  console.log('Usage: node direct-template-update.js <templateId>');
  process.exit(1);
}

// Updates to apply
const updates = {
  description: "Andrew's personal pull workout routine (Updated directly in DB)"
};

updateTemplate(templateId, updates);
