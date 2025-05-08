require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const fixTemplatePermissions = async (templateId, email) => {
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
    
    // Find the user by email
    const auth = await Auth.findOne({ email });
    if (!auth) {
      console.error(`No user found with email: ${email}`);
      return;
    }
    
    const user = await User.findById(auth.userId);
    if (!user) {
      console.error(`No user record found for auth ID: ${auth._id}`);
      return;
    }
    
    console.log(`Found user: ${user.name} (${user._id})`);
    console.log(`Current admin status: ${auth.isAdmin}`);
    
    // Check if the template belongs to the user
    const isOwner = template.userId && template.userId.toString() === user._id.toString();
    const isGlobalAndAdmin = template.userId === null && auth.isAdmin;
    
    console.log('Authorization check:', {
      isOwner,
      isGlobalAndAdmin,
      templateUserId: template.userId ? template.userId.toString() : null,
      userId: user._id.toString(),
      userIsAdmin: auth.isAdmin
    });
    
    // If the user doesn't own the template and it's not a global template that the admin can edit
    if (!isOwner && !isGlobalAndAdmin) {
      console.log('User does not have permission to edit this template.');
      console.log('Fixing permissions by setting the template userId to the user...');
      
      // Update the template to belong to the user
      template.userId = user._id;
      const updatedTemplate = await template.save();
      
      console.log('Template updated successfully!');
      console.log('Updated template:');
      console.log(JSON.stringify(updatedTemplate, null, 2));
    } else {
      console.log('User already has permission to edit this template.');
    }
    
  } catch (error) {
    console.error('Error fixing template permissions:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get template ID and email from command line arguments
const templateId = process.argv[2];
const email = process.argv[3];

if (!templateId || !email) {
  console.error('Please provide both template ID and email as arguments');
  console.log('Usage: node fix-template-permissions.js <template-id> <email>');
  process.exit(1);
}

fixTemplatePermissions(templateId, email);
