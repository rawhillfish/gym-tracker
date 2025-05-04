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
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
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
  const [currentUser, setCurrentUser] = useState({ name: '', color: '#1976d2' });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch users from the API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers({ includeDeleted: true });
      
      // Separate active and retired users
      if (response && Array.isArray(response)) {
        const active = response.filter(user => !user.isDeleted);
        const retired = response.filter(user => user.isDeleted);
        setActiveUsers(active);
        setRetiredUsers(retired);
      } else if (response && response.data && Array.isArray(response.data)) {
        const active = response.data.filter(user => !user.isDeleted);
        const retired = response.data.filter(user => user.isDeleted);
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

  // Handle dialog open for creating a new user
  const handleAddUser = () => {
    setCurrentUser({ name: '', color: '#1976d2' });
    setIsEditing(false);
    setOpenDialog(true);
  };

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

  // Handle form submission for creating or updating a user
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
      if (isEditing) {
        // Update existing user
        await apiService.updateUser(currentUser._id, {
          name: currentUser.name,
          color: currentUser.color
        });
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        // Create new user
        await apiService.createUser({
          name: currentUser.name,
          color: currentUser.color
        });
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
      }
      
      // Close dialog and refresh user list
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${isEditing ? 'update' : 'create'} user: ${err.response?.data?.message || err.message}`,
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

  // Handle hard delete of a user
  const handleHardDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this retired user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiService.hardDeleteUser(userId);
      setSnackbar({
        open: true,
        message: 'User permanently deleted successfully',
        severity: 'success'
      });
      fetchUsers();
    } catch (err) {
      console.error('Error permanently deleting user:', err);
      
      // More informative error message
      const errorMessage = err.response && err.response.status === 404
        ? 'Server error: The permanent delete endpoint is not available. Please restart the server.'
        : err.response?.data?.message || err.message || 'An unknown error occurred';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // Handle restoration of a retired user
  const handleRestoreUser = async (userId) => {
    try {
      await apiService.restoreUser(userId);
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

  // Render user list
  const renderUserList = (users, isRetiredSection = false) => {
    if (users.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            {isRetiredSection 
              ? 'No retired users found.' 
              : 'No users found. Add your first user!'}
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem
              sx={{ textDecoration: 'none' }}
              secondaryAction={
                <Box>
                  {isRetiredSection ? (
                    <>
                      <IconButton
                        edge="end"
                        aria-label="restore"
                        onClick={() => handleRestoreUser(user._id)}
                        title="Restore user"
                        sx={{ mr: 1 }}
                      >
                        <RestoreIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="hard delete"
                        onClick={() => handleHardDeleteUser(user._id)}
                        title="Permanently delete user"
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="retire"
                        onClick={() => handleRetireUser(user._id)}
                        title="Retire user"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              }
            >
              <Box display="flex" alignItems="center" width="100%">
                <ColorPreview sx={{ bgcolor: user.color }} />
                <ListItemText
                  primary={user.name}
                  secondary={
                    isRetiredSection
                      ? `Retired on ${new Date(user.deletedAt).toLocaleDateString()}`
                      : `Created on ${new Date(user.createdAt).toLocaleDateString()}`
                  }
                />
              </Box>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: isSubTab ? 0 : 4, mb: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Active Users Section */}
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
              renderUserList(activeUsers, false)
            )}
          </Paper>
        </Grid>
        
        {/* Retired Users Section */}
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
              renderUserList(retiredUsers, true)
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog for adding/editing users */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit User' : 'Add New User'}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Create'}
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
