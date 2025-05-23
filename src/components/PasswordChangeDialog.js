import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert
} from '@mui/material';
import apiService from '../services/api';

const PasswordChangeDialog = ({ open, onClose, isResetRequired }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate inputs
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // If not a reset, require current password
    if (!isResetRequired && !currentPassword) {
      setError('Please enter your current password');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to change password
      await apiService.changePassword({
        currentPassword: currentPassword || 'password', // Use 'password' if reset required
        newPassword
      });
      
      // Clear form and close dialog
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
      
      // Close dialog and notify parent
      onClose(true);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={isResetRequired ? null : () => onClose(false)}>
      <DialogTitle>
        {isResetRequired ? 'Password Reset Required' : 'Change Password'}
      </DialogTitle>
      <DialogContent>
        {isResetRequired && (
          <DialogContentText>
            Your password has been reset by an administrator. You must create a new password to continue.
          </DialogContentText>
        )}
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          {!isResetRequired && (
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          )}
          
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </form>
      </DialogContent>
      <DialogActions>
        {!isResetRequired && (
          <Button onClick={() => onClose(false)} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;
