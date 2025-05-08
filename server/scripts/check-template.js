require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutTemplate = require('../models/WorkoutTemplate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkTemplate = async (templateId) => {
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
    
    // Check userId type and value
    console.log('\nUserId details:');
    console.log({
      userId: template.userId,
      type: typeof template.userId,
      isObjectId: template.userId instanceof mongoose.Types.ObjectId,
      stringValue: template.userId ? template.userId.toString() : null
    });
    
    // Try to update the template
    console.log('\nAttempting to update the template...');
    template.description = template.description + ' (Updated via script)';
    const updatedTemplate = await template.save();
    console.log('Template updated successfully!');
    console.log('Updated template:');
    console.log(JSON.stringify(updatedTemplate, null, 2));
    
  } catch (error) {
    console.error('Error checking template:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get template ID from command line arguments
const templateId = process.argv[2];

if (!templateId) {
  console.error('Please provide a template ID as an argument');
  console.log('Usage: node check-template.js <template-id>');
  process.exit(1);
}

checkTemplate(templateId);
