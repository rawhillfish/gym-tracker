import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import apiService from '../services/api';

// Predefined color options
const colorOptions = [
  '#1976d2', // Blue
  '#f44336', // Red
  '#4caf50', // Green
  '#ff9800', // Orange
  '#9c27b0', // Purple
  '#00bcd4', // Cyan
  '#ffeb3b', // Yellow
  '#795548', // Brown
  '#607d8b', // Blue Grey
  '#e91e63'  // Pink
];

// Styled components
const ColorPreview = styled(Box)(({ theme }) => ({
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`
}));

const ColorOption = styled(Box)(({ theme, selected }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

const UserManager = ({ isSubTab }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [retiredUsers, setRetiredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: '', color: '#1976d2', retired: false });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch users from the API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers({ includeDeleted: true });
      
      // Process users
      if (response && Array.isArray(response)) {
        // Separate active and retired users
        const active = response.filter(user => !user.isDeleted && !user.retired);
        const retired = response.filter(user => user.isDeleted || user.retired);
        setActiveUsers(active);
        setRetiredUsers(retired);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Separate active and retired users
        const active = response.data.filter(user => !user.isDeleted && !user.retired);
        const retired = response.data.filter(user => user.isDeleted || user.retired);
        setActiveUsers(active);
        setRetiredUsers(retired);
      } else {
        setActiveUsers([]);
        setRetiredUsers([]);
        setError('Invalid response format from server');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setActiveUsers([]);
      setRetiredUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle dialog open for editing an existing user
  const handleEditUser = (user) => {
    setCurrentUser({ ...user });
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setCurrentUser({ ...currentUser, color });
  };

  // Handle form submission for updating a user
  const handleSubmit = async () => {
    if (!currentUser.name.trim()) {
      setSnackbar({
        open: true,
        message: 'User name is required',
        severity: 'error'
      });
      return;
    }

    try {
      // Update existing user
      await apiService.updateUser(currentUser._id, {
        name: currentUser.name,
        color: currentUser.color,
        retired: currentUser.retired
      });
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
      
      // Close dialog and refresh user list
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setSnackbar({
        open: true,
        message: `Failed to update user: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle retiring a user
  const handleRetireUser = async (userId) => {
    if (!window.confirm('Are you sure you want to retire this user?')) {
      return;
    }

    try {
      await apiService.retireUser(userId);
      setSnackbar({
        open: true,
        message: 'User retired successfully',
        severity: 'success'
      });
      fetchUsers();
    } catch (err) {
      console.error('Error retiring user:', err);
      setSnackbar({
        open: true,
        message: `Failed to retire user: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle permanent deletion of a user
  const handleHardDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.hardDeleteUser(userId);
      setSnackbar({
        open: true,
        message: 'User permanently deleted',
        severity: 'success'
      });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: `Failed to delete user: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle restoration of a retired user
  const handleRestoreUser = async (userId) => {
    try {
      // Find the user in the retired users list
      const user = retiredUsers.find(u => u._id === userId);
      
      if (!user) {
        setSnackbar({
          open: true,
          message: 'User not found in retired list',
          severity: 'error'
        });
        return;
      }
      
      // Check if the user is deleted (soft deleted) or just retired
      if (user.isDeleted) {
        // If the user is soft deleted, use the restore endpoint
        await apiService.restoreUser(userId);
      } else if (user.retired) {
        // If the user is just retired but not deleted, update the user to un-retire them
        await apiService.updateUser(userId, { retired: false });
      }
      
      setSnackbar({
        open: true,
        message: 'User restored successfully',
        severity: 'success'
      });
      fetchUsers();
    } catch (err) {
      console.error('Error restoring user:', err);
      setSnackbar({
        open: true,
        message: `Failed to restore user: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: isSubTab ? 0 : 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5" component="h1">
          User Management
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          New users can be created through the registration page
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Active Users */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">
                Active Users ({activeUsers.length})
              </Typography>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Active Users
                </Typography>
                <List>
                  {activeUsers.map((user) => (
                    <ListItem key={user._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <ColorPreview bgcolor={user.color} />
                        <ListItemText primary={user.name} />
                        <Box>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleEditUser(user)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRetireUser(user._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Retired Users */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'error.main', color: 'white' }}>
              <Typography variant="h6">
                Retired Users ({retiredUsers.length})
              </Typography>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                {retiredUsers.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                      Retired Users
                    </Typography>
                    <List>
                      {retiredUsers.map((user) => (
                        <ListItem key={user._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', opacity: 0.7 }}>
                            <ColorPreview bgcolor={user.color} />
                            <ListItemText 
                              primary={`${user.name}${user.retired ? ' (Retired)' : ' (Deleted)'}`} 
                            />
                            <Box>
                              <IconButton
                                edge="end"
                                aria-label="restore"
                                onClick={() => handleRestoreUser(user._id)}
                                sx={{ mr: 1 }}
                              >
                                <RestoreIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                aria-label="delete permanently"
                                onClick={() => handleHardDeleteUser(user._id)}
                                color="error"
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog for editing users */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="User Name"
              fullWidth
              variant="outlined"
              value={currentUser.name}
              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              User Color
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <ColorPreview sx={{ bgcolor: currentUser.color, width: 40, height: 40 }} />
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {colorOptions.map((color) => (
                    <ColorOption 
                      key={color}
                      sx={{ bgcolor: color }}
                      selected={currentUser.color === color}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch
                  checked={currentUser.retired}
                  onChange={(e) => setCurrentUser({ ...currentUser, retired: e.target.checked })}
                />
              }
              label="Retired"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManager;
