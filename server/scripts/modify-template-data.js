require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const modifyTemplateData = async (templateId) => {
  try {
    console.log(`Looking for template with ID: ${templateId}`);
    
    // Find the template
    const template = await WorkoutTemplate.findById(templateId);
    
    if (!template) {
      console.error(`No template found with ID: ${templateId}`);
      return;
    }
    
    console.log('Template found:');
    console.log(JSON.stringify(template, null, 2));
    
    // Create a client-side representation of the template
    const clientTemplate = {
      _id: template._id.toString(),
      name: template.name,
      description: template.description,
      userId: template.userId ? template.userId.toString() : null,
      exercises: template.exercises,
      isDeleted: template.isDeleted,
      deletedAt: template.deletedAt,
      isGlobal: template.userId === null
    };
    
    console.log('\nClient-side representation of the template:');
    console.log(JSON.stringify(clientTemplate, null, 2));
    
    // Create a modified version that would be sent back to the server
    const modifiedTemplate = {
      ...clientTemplate,
      description: template.description + ' (Modified by client)'
    };
    
    console.log('\nModified template that would be sent back to the server:');
    console.log(JSON.stringify(modifiedTemplate, null, 2));
    
    // Update the template with the modified data
    console.log('\nAttempting to update the template with the modified data...');
    
    // Extract only the fields that the server expects
    const updateData = {
      name: modifiedTemplate.name,
      description: modifiedTemplate.description,
      exercises: modifiedTemplate.exercises,
      userId: modifiedTemplate.userId,
      isGlobal: modifiedTemplate.isGlobal
    };
    
    // Update the template in the database
    Object.assign(template, updateData);
    
    // If isGlobal is true and userId is not null, set userId to null
    if (updateData.isGlobal === true) {
      template.userId = null;
    }
    
    const updatedTemplate = await template.save();
    
    console.log('Template updated successfully!');
    console.log('Updated template:');
    console.log(JSON.stringify(updatedTemplate, null, 2));
    
  } catch (error) {
    console.error('Error modifying template data:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get template ID from command line arguments
const templateId = process.argv[2];

if (!templateId) {
  console.error('Please provide a template ID as an argument');
  console.log('Usage: node modify-template-data.js <template-id>');
  process.exit(1);
}

modifyTemplateData(templateId);
