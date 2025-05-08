require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const Auth = require('../models/Auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testTemplateUpdate = async (templateId, email) => {
  try {
    console.log(`Testing template update for ID: ${templateId}`);
    
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
    
    // Create a mock req.user object like in the protect middleware
    const reqUser = {
      id: user._id.toString(),
      name: user.name,
      color: user.color,
      isAdmin: auth.isAdmin
    };
    
    console.log('Mocked req.user:', reqUser);
    
    // Check authorization like in the route
    const isOwner = template.userId && template.userId.toString() === reqUser.id;
    const isGlobalAndAdmin = template.userId === null && reqUser.isAdmin;
    
    console.log('Authorization check:', {
      isOwner,
      isGlobalAndAdmin,
      templateUserId: template.userId ? template.userId.toString() : null,
      requestUserId: reqUser.id,
      userIsAdmin: reqUser.isAdmin
    });
    
    if (!isOwner && !isGlobalAndAdmin) {
      console.log('Authorization would fail for this template update');
      return;
    }
    
    console.log('Authorization would succeed for this template update');
    
    // Create a mock request body like what would be sent from the client
    const reqBody = {
      name: template.name,
      description: template.description + ' (Updated via test script)',
      exercises: template.exercises,
      isGlobal: template.userId === null
    };
    
    console.log('Mock request body:', reqBody);
    
    // Update fields like in the route
    template.name = reqBody.name;
    template.description = reqBody.description;
    template.exercises = reqBody.exercises;
    
    // If admin is converting a personal template to global
    if (reqBody.isGlobal === true && reqUser.isAdmin && template.userId !== null) {
      console.log('Converting template to global');
      template.userId = null;
    }
    // If admin is converting a global template to personal
    else if (reqBody.isGlobal === false && template.userId === null && reqUser.isAdmin) {
      console.log('Converting global template to personal');
      template.userId = reqUser.id;
    }
    
    const updatedTemplate = await template.save();
    console.log('Template updated successfully!');
    console.log('Updated template:');
    console.log(JSON.stringify(updatedTemplate, null, 2));
    
    // Generate a new token for the user
    const token = jwt.sign(
      { id: auth._id, userId: auth.userId, isAdmin: auth.isAdmin },
      process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    console.log('\nNew token for testing:');
    console.log(token);
    console.log('\nUse this token for testing by setting it in localStorage:');
    console.log('localStorage.setItem("token", "' + token + '")');
    
  } catch (error) {
    console.error('Error testing template update:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get template ID and email from command line arguments
const templateId = process.argv[2];
const email = process.argv[3];

if (!templateId || !email) {
  console.error('Please provide both template ID and email as arguments');
  console.log('Usage: node test-template-update.js <template-id> <email>');
  process.exit(1);
}

testTemplateUpdate(templateId, email);
