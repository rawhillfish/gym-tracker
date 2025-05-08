/**
 * Script to sync workout templates between local and production databases
 * 
 * This script will:
 * 1. Connect to the local database to get templates
 * 2. Connect to the production database
 * 3. Remove all existing templates from production
 * 4. Add the local templates to production
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import models
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Database connection strings
const LOCAL_DB_URI = 'mongodb://localhost:27017/gym-tracker';
const PROD_DB_URI = 'mongodb+srv://jasonnicholaspovey:XrrKaWVfdWuLGTTw@workitout.rjrut.mongodb.net/?retryWrites=true&w=majority&appName=WorkItOut';

// Connect to a specific MongoDB instance
const connectToDatabase = async (uri, name) => {
  try {
    console.log(`Connecting to ${name} database...`);
    const connection = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`Connected to ${name} database: ${connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to ${name} database:`, error);
    throw error;
  }
};

// Get templates from local database
const getLocalTemplates = async (localConn) => {
  try {
    // Create model using the connection
    const LocalWorkoutTemplate = localConn.model('WorkoutTemplate', WorkoutTemplate.schema);
    
    // Get all templates
    const templates = await LocalWorkoutTemplate.find({});
    console.log(`Found ${templates.length} templates in local database`);
    
    // Log template details
    templates.forEach(template => {
      console.log(`- ${template.name} (${template._id}) - Global: ${template.isGlobal}`);
    });
    
    return templates;
  } catch (error) {
    console.error('Error getting local templates:', error);
    throw error;
  }
};

// Remove all templates from production database
const removeProductionTemplates = async (prodConn) => {
  try {
    // Create model using the connection
    const ProdWorkoutTemplate = prodConn.model('WorkoutTemplate', WorkoutTemplate.schema);
    
    // Delete all templates
    const result = await ProdWorkoutTemplate.deleteMany({});
    console.log(`Removed ${result.deletedCount} templates from production database`);
  } catch (error) {
    console.error('Error removing production templates:', error);
    throw error;
  }
};

// Add local templates to production database
const addTemplatesToProduction = async (prodConn, templates) => {
  try {
    // Create model using the connection
    const ProdWorkoutTemplate = prodConn.model('WorkoutTemplate', WorkoutTemplate.schema);
    
    // Convert templates to plain objects and remove _id to create new ones
    const templateData = templates.map(template => {
      const plainTemplate = template.toObject();
      
      // Keep the same ID to maintain references
      // plainTemplate._id = new mongoose.Types.ObjectId();
      
      return plainTemplate;
    });
    
    // Insert templates
    const result = await ProdWorkoutTemplate.insertMany(templateData);
    console.log(`Added ${result.length} templates to production database`);
    
    // Log added templates
    result.forEach(template => {
      console.log(`- ${template.name} (${template._id}) - Global: ${template.isGlobal}`);
    });
  } catch (error) {
    console.error('Error adding templates to production:', error);
    throw error;
  }
};

// Main function
const syncWorkoutTemplates = async () => {
  let localConn = null;
  let prodConn = null;
  
  try {
    // Connect to both databases
    localConn = await connectToDatabase(LOCAL_DB_URI, 'local');
    prodConn = await connectToDatabase(PROD_DB_URI, 'production');
    
    // Get templates from local database
    const localTemplates = await getLocalTemplates(localConn);
    
    // Remove all templates from production database
    await removeProductionTemplates(prodConn);
    
    // Add local templates to production database
    await addTemplatesToProduction(prodConn, localTemplates);
    
    console.log('Workout templates synced successfully!');
  } catch (error) {
    console.error('Error syncing workout templates:', error);
  } finally {
    // Close connections
    if (localConn) await localConn.close();
    if (prodConn) await prodConn.close();
    console.log('Database connections closed');
  }
};

// Run the script
syncWorkoutTemplates().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
