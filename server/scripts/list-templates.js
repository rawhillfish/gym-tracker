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

const listTemplates = async () => {
  try {
    await connectDB();
    
    console.log('Fetching all workout templates...');
    const templates = await WorkoutTemplate.find().lean();
    
    console.log(`Found ${templates.length} templates:`);
    templates.forEach((template, index) => {
      console.log(`\n--- Template ${index + 1} ---`);
      console.log(`ID: ${template._id}`);
      console.log(`Name: ${template.name}`);
      console.log(`Description: ${template.description}`);
      console.log(`User ID: ${template.userId}`);
      console.log(`Is Global: ${template.isGlobal}`);
      console.log(`Exercises: ${template.exercises.length}`);
      
      // Print first exercise as an example
      if (template.exercises.length > 0) {
        console.log('\nFirst exercise:');
        console.log(JSON.stringify(template.exercises[0], null, 2));
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Error listing templates: ${error.message}`);
    process.exit(1);
  }
};

listTemplates();
