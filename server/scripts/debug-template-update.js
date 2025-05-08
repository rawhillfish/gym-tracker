require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const WorkoutTemplate = require('../models/WorkoutTemplate');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const debugTemplateUpdate = async (templateId, token) => {
  try {
    console.log(`Debugging template update for ID: ${templateId}`);
    console.log(`Using token: ${token}`);
    
    // Decode the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development'
    );
    
    console.log('Decoded token:', decoded);
    
    // Find the auth record
    const auth = await Auth.findById(decoded.id);
    if (!auth) {
      console.error('Auth record not found');
      return;
    }
    
    console.log('Auth record found:', auth);
    
    // Find the user
    const user = await User.findById(auth.userId);
    if (!user) {
      console.error('User not found');
      return;
    }
    
    console.log('User found:', user);
    
    // Create a mock req.user object like in the protect middleware
    const reqUser = {
      id: user._id.toString(),
      name: user.name,
      color: user.color,
      isAdmin: decoded.isAdmin !== undefined ? decoded.isAdmin : auth.isAdmin
    };
    
    console.log('Mocked req.user:', reqUser);
    
    // Find the template
    const template = await WorkoutTemplate.findById(templateId);
    if (!template) {
      console.error('Template not found');
      return;
    }
    
    console.log('Template found:', template);
    
    // Check authorization like in the route
    const isOwner = template.userId && template.userId.toString() === reqUser.id;
    const isGlobalAndAdmin = template.userId === null && reqUser.isAdmin;
    
    console.log('Authorization check:', {
      isOwner,
      isGlobalAndAdmin,
      templateUserId: template.userId ? template.userId.toString() : null,
      requestUserId: reqUser.id,
      userIsAdmin: reqUser.isAdmin,
      templateUserIdType: template.userId ? typeof template.userId : 'null',
      requestUserIdType: typeof reqUser.id,
      areEqual: template.userId && template.userId.toString() === reqUser.id
    });
    
    if (!isOwner && !isGlobalAndAdmin) {
      console.log('Authorization would fail for this template update');
    } else {
      console.log('Authorization would succeed for this template update');
    }
    
  } catch (error) {
    console.error('Error debugging template update:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Get template ID and token from command line arguments
const templateId = process.argv[2];
const token = process.argv[3];

if (!templateId || !token) {
  console.error('Please provide both template ID and token as arguments');
  console.log('Usage: node debug-template-update.js <template-id> <token>');
  process.exit(1);
}

debugTemplateUpdate(templateId, token);
