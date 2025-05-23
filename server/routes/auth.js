const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Auth = require('../models/Auth');
const User = require('../models/User');

// Middleware for protected routes
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-default-jwt-secret-key-for-development'
    );

    console.log('Decoded token:', decoded);

    // Find user by token
    const auth = await Auth.findById(decoded.id);
    if (!auth) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to access this route' 
      });
    }

    // Find associated user
    const user = await User.findById(auth.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Add user and auth to request object
    req.user = {
      _id: user._id,  // Use _id to match the MongoDB document field
      id: user._id,   // Keep id for backward compatibility
      name: user.name,
      color: user.color,
      // Use isAdmin from token if available, otherwise from auth record
      isAdmin: decoded.isAdmin !== undefined ? decoded.isAdmin : auth.isAdmin
    };
    
    console.log('User in protect middleware:', req.user);
    
    req.auth = auth;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, color } = req.body;

    // Check if user already exists
    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    // Create a new user first
    const user = await User.create({ 
      name, 
      color: color || '#1976d2' // Default color if not provided
    });

    // Create auth record linked to user
    const auth = await Auth.create({
      email,
      password,
      userId: user._id,
      isAdmin: false // Default to non-admin
    });

    // Generate token
    const token = auth.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        color: user.color,
        isAdmin: auth.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);
    
    // Validate email and password
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }

    // Find user by email and explicitly select password
    const auth = await Auth.findOne({ email }).select('+password');
    if (!auth) {
      console.log('Login failed: Auth record not found for email:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    console.log('Auth record found:', auth._id);

    // Check if password matches
    const isMatch = await auth.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Login failed: Password does not match');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Find associated user
    const user = await User.findById(auth.userId);
    if (!user) {
      console.log('Login failed: User not found for userId:', auth.userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    console.log('User found:', user._id, user.name);

    // Generate token
    const token = auth.getSignedJwtToken();
    console.log('Token generated successfully');

    // Check if password reset is required
    const passwordResetRequired = auth.passwordResetRequired || false;
    console.log('Password reset required:', passwordResetRequired);

    res.status(200).json({
      success: true,
      token,
      passwordResetRequired,
      user: {
        id: user._id,
        name: user.name,
        color: user.color,
        isAdmin: auth.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // User is already available from the protect middleware
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        color: req.user.color,
        email: req.auth.email,
        isAdmin: req.user.isAdmin,
        passwordResetRequired: req.auth.passwordResetRequired || false
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching user data'
    });
  }
});

// @route   PUT /api/auth/changepassword
// @desc    Change user password and clear reset flag
// @access  Private
router.put('/changepassword', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a new password'
      });
    }
    
    // Find auth record and select password
    const auth = await Auth.findById(req.auth._id).select('+password');
    
    // If password reset is required, we don't need to check the current password
    // Otherwise, verify the current password
    if (!auth.passwordResetRequired) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please provide your current password'
        });
      }
      
      const isMatch = await auth.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
    }
    
    // Set new password and clear reset flag
    auth.password = newPassword;
    auth.passwordResetRequired = false;
    await auth.save();
    
    console.log('Password changed successfully for user:', req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password change'
    });
  }
});

// @route   PUT /api/auth/update-password
// @desc    Update password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const auth = await Auth.findById(req.auth._id).select('+password');

    // Check current password
    const isMatch = await auth.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    auth.password = newPassword;
    await auth.save();

    // Generate new token
    const token = auth.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while updating password' 
    });
  }
});

// Export the router and the protect middleware
module.exports = router;
module.exports.protect = protect;
