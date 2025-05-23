const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Auth = require('../models/Auth');
const CompletedWorkout = require('../models/CompletedWorkout');

// Get all users
router.get('/', async (req, res) => {
  try {
    // Check if we should include deleted users
    const includeDeleted = req.query.includeDeleted === 'true';
    
    // Build query
    let query = {};
    if (!includeDeleted) {
      query.isDeleted = { $ne: true };
    }
    
    // Get basic user data
    const users = await User.find(query).sort('name');
    
    // Get all auth records with their emails
    const authRecords = await Auth.find({}, 'userId email');
    console.log(`Found ${authRecords.length} auth records`);
    
    // Create a map of userId to email for quick lookup
    const emailMap = {};
    authRecords.forEach(auth => {
      if (auth.userId) {
        // Convert ObjectId to string for comparison
        const userIdStr = auth.userId.toString();
        emailMap[userIdStr] = auth.email;
      }
    });
    
    // Log the mapping for debugging
    console.log('Email mapping:', emailMap);
    
    // Add email to each user object and perform direct lookups for missing emails
    const usersWithEmail = [];
    
    for (const user of users) {
      const userObj = user.toObject();
      const userId = user._id.toString();
      
      // Try to find the email from the map first
      userObj.email = emailMap[userId];
      
      // If no email found in the map, try direct lookup
      if (!userObj.email) {
        try {
          const authRecord = await Auth.findOne({ userId: user._id });
          if (authRecord && authRecord.email) {
            userObj.email = authRecord.email;
            console.log(`Found email via direct lookup for user ${userId}: ${authRecord.email}`);
          } else {
            userObj.email = 'No email found';
          }
        } catch (err) {
          console.error(`Error looking up email for user ${userId}:`, err);
          userObj.email = 'No email found';
        }
      }
      
      usersWithEmail.push(userObj);
    }
    for (const user of usersWithEmail) {
      if (user.email === 'No email found') {
        try {
          // Try to find an auth record with this userId
          const authRecord = await Auth.findOne({ userId: user._id });
          if (authRecord && authRecord.email) {
            user.email = authRecord.email;
            console.log(`Found email ${authRecord.email} for user ${user.name} by direct lookup`);
          }
        } catch (err) {
          console.error(`Error looking up auth for user ${user._id}:`, err);
        }
      }
    }
    
    res.json(usersWithEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const user = new User({
    name: req.body.name,
    color: req.body.color,
    isDeleted: false
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { name, color, isAdmin, email } = req.body;
    
    // Find user by ID and update
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { name, color, isAdmin },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If email is provided, update the auth record
    if (email) {
      // Find the auth record for this user
      const auth = await Auth.findOne({ userId: req.params.id });
      
      if (auth) {
        // Check if email is already in use by another user
        const existingAuth = await Auth.findOne({ 
          email, 
          _id: { $ne: auth._id } // Exclude the current auth record
        });
        
        if (existingAuth) {
          return res.status(400).json({ 
            message: 'Email is already in use by another user' 
          });
        }
        
        // Update the email
        auth.email = email;
        await auth.save();
        
        console.log(`Email updated for user ${req.params.id} to ${email}`);
      } else {
        console.log(`No auth record found for user ${req.params.id}`);
      }
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Soft delete a user
router.delete('/:id', async (req, res) => {
  try {
    // Find the user first to make sure it exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if this user has any completed workouts
    const workoutCount = await CompletedWorkout.countDocuments({ user: req.params.id });
    
    // Update the user to mark it as deleted
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();
    
    res.json({ 
      message: 'User successfully marked as deleted',
      user,
      hasWorkouts: workoutCount > 0,
      workoutCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset user password
router.post('/:id/reset-password', async (req, res) => {
  try {
    // Find the user first to make sure it exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the auth record for this user
    const auth = await Auth.findOne({ userId: req.params.id });
    
    if (!auth) {
      return res.status(404).json({ message: 'Auth record not found for this user' });
    }
    
    // Set the new password to 'password'
    // We don't need to hash it manually here because the Auth model
    // has a pre-save hook that will hash the password for us
    auth.password = 'password';
    
    // Set the flag to require password change on next login
    auth.passwordResetRequired = true;
    
    // Save the auth record which will trigger the pre-save hook
    await auth.save();
    
    console.log('Password reset successfully for user:', req.params.id, 'Password change required on next login.');
    
    res.json({ 
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user email by ID
router.get('/:id/email', async (req, res) => {
  try {
    // Find the user first to make sure it exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the auth record for this user
    const auth = await Auth.findOne({ userId: req.params.id });
    
    if (!auth) {
      return res.status(404).json({ message: 'Auth record not found for this user' });
    }
    
    res.json({ 
      userId: req.params.id,
      email: auth.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore a soft-deleted user
router.patch('/:id/restore', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.isDeleted) {
      return res.status(400).json({ message: 'User is not deleted' });
    }
    
    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();
    
    res.json({ 
      message: 'User successfully restored',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hard delete a user (permanent deletion)
router.delete('/:id/permanent', async (req, res) => {
  try {
    // Find the user first to make sure it exists
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user is already soft-deleted
    if (!user.isDeleted) {
      return res.status(400).json({ 
        message: 'User must be soft-deleted before permanent deletion. Use the regular delete endpoint first.' 
      });
    }
    
    // Check if this user has any completed workouts
    const workoutCount = await CompletedWorkout.countDocuments({ user: req.params.id });
    
    if (workoutCount > 0) {
      return res.status(400).json({
        message: `Cannot permanently delete user with ${workoutCount} associated workouts. Consider keeping the user in retired state.`,
        hasWorkouts: true,
        workoutCount
      });
    }
    
    // Perform the hard deletion of the user record
    await User.findByIdAndDelete(req.params.id);
    
    // Also delete any associated authentication data
    const authResult = await Auth.deleteOne({ userId: req.params.id });
    
    res.json({ 
      message: 'User permanently deleted',
      userId: req.params.id,
      authDeleted: authResult.deletedCount > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
