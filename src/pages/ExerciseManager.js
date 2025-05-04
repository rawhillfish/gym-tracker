import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const categories = [
  'Arms',
  'Back',
  'Chest',
  'Core',
  'Legs (Calves)',
  'Legs (Glutes)',
  'Legs (Hamstring)',
  'Legs (Quads)',
  'Shoulders',
  'Other'
];

// Category color mapping for visual distinction
const categoryColors = {
  'Arms': '#f57c00',          // Orange
  'Back': '#2e7d32',          // Green
  'Chest': '#1976d2',         // Blue
  'Core': '#0097a7',          // Cyan
  'Legs (Calves)': '#ef9a9a', // Lighter Red
  'Legs (Glutes)': '#e57373', // Light Red
  'Legs (Hamstring)': '#c62828', // Dark Red
  'Legs (Quads)': '#d32f2f',  // Red
  'Shoulders': '#7b1fa2',     // Purple
  'Other': '#616161'          // Grey
};

const ExerciseManager = ({ isSubTab = false }) => {
  const [activeExercises, setActiveExercises] = useState([]);
  const [retiredExercises, setRetiredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    defaultReps: 8,
    category: 'Other',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState(
    categories.reduce((acc, category) => {
      acc[category] = true; // All categories expanded by default
      return acc;
    }, {})
  );

  // Toggle category expansion
  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching all exercises including retired ones');
      const response = await apiService.getExercises({ includeDeleted: true });
      console.log('Exercises API response:', response);
      
      // Check if response exists and is an array (direct response, not nested in data property)
      if (response && Array.isArray(response)) {
        console.log(`Received ${response.length} exercises, retired count:`, 
          response.filter(ex => ex.isDeleted).length);
        
        // Separate active and retired exercises
        const active = response.filter(ex => !ex.isDeleted);
        const retired = response.filter(ex => ex.isDeleted);
        
        setActiveExercises(active);
        setRetiredExercises(retired);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Alternative response format with data property
        console.log(`Received ${response.data.length} exercises, retired count:`, 
          response.data.filter(ex => ex.isDeleted).length);
        
        // Separate active and retired exercises
        const active = response.data.filter(ex => !ex.isDeleted);
        const retired = response.data.filter(ex => ex.isDeleted);
        
        setActiveExercises(active);
        setRetiredExercises(retired);
      } else {
        console.error('Invalid exercises data format:', response);
        setActiveExercises([]); 
        setRetiredExercises([]);
        setSnackbar({
          open: true,
          message: 'Received invalid data format from server',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setActiveExercises([]);
      setRetiredExercises([]);
      setSnackbar({
        open: true,
        message: 'Failed to load exercises',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load exercises on component mount
  useEffect(() => {
    console.log('useEffect triggered, fetching exercises');
    fetchExercises();
  }, [fetchExercises]);

  const handleOpenDialog = (exercise = null) => {
    if (exercise) {
      setCurrentExercise(exercise);
      setEditMode(true);
    } else {
      setCurrentExercise({
        name: '',
        defaultReps: 8,
        category: 'Other',
        description: ''
      });
      setEditMode(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentExercise({
      ...currentExercise,
      [name]: name === 'defaultReps' ? Number(value) : value
    });
  };

  const handleSaveExercise = async () => {
    try {
      let response;
      if (editMode) {
        response = await apiService.updateExercise(currentExercise._id, currentExercise);
        console.log('Update response:', response);
      } else {
        response = await apiService.createExercise(currentExercise);
        console.log('Create response:', response);
      }
      
      // Check if the operation was successful
      if (response) {
        console.log('Exercise saved successfully:', response);
      }
      
      fetchExercises();
      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: editMode ? 'Exercise updated successfully' : 'Exercise created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleRetireExercise = async (id) => {
    if (!window.confirm('Are you sure you want to retire this exercise?')) {
      return;
    }
    
    try {
      console.log('Retiring exercise with ID:', id);
      const response = await apiService.retireExercise(id);
      console.log('Retire response:', response);
      
      // Check if the exercise was successfully retired
      if (response && (response.exercise || (response.data && response.data.exercise))) {
        console.log('Exercise was retired successfully');
      }
      
      // Refresh exercises list
      fetchExercises();
      setSnackbar({
        open: true,
        message: 'Exercise retired successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error retiring exercise:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleRestoreExercise = async (id) => {
    try {
      const response = await apiService.restoreExercise(id);
      console.log('Restore response:', response);
      
      // Check if the exercise was successfully restored
      if (response && (response.exercise || (response.data && response.data.exercise))) {
        console.log('Exercise was restored successfully');
      }
      
      fetchExercises();
      setSnackbar({
        open: true,
        message: 'Exercise restored successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error restoring exercise:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleHardDeleteExercise = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this retired exercise? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('Hard deleting exercise with ID:', id);
      const response = await apiService.hardDeleteExercise(id);
      console.log('Hard delete response:', response);
      
      fetchExercises();
      setSnackbar({
        open: true,
        message: 'Exercise permanently deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error hard deleting exercise:', error);
      
      // More informative error message
      const errorMessage = error.response && error.response.status === 404
        ? 'Server error: The permanent delete endpoint is not available. Please restart the server.'
        : error.message || 'An unknown error occurred';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render exercise list
  const renderExerciseList = (exercises, isRetiredSection = false) => {
    if (exercises.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>
            {isRetiredSection 
              ? 'No retired exercises found.' 
              : 'No exercises found. Add your first exercise!'}
          </Typography>
        </Box>
      );
    }

    // For active exercises, group by category
    if (!isRetiredSection) {
      // Group exercises by category
      const exercisesByCategory = {};
      
      // Initialize categories with empty arrays
      categories.forEach(category => {
        exercisesByCategory[category] = [];
      });
      
      // Populate categories with exercises
      exercises.forEach(exercise => {
        if (exercisesByCategory[exercise.category]) {
          exercisesByCategory[exercise.category].push(exercise);
        } else {
          // Handle case where exercise has a category not in our predefined list
          if (!exercisesByCategory['Other']) {
            exercisesByCategory['Other'] = [];
          }
          exercisesByCategory['Other'].push(exercise);
        }
      });

      return (
        <Grid container spacing={2}>
          {categories.map(category => {
            const categoryExercises = exercisesByCategory[category] || [];
            if (categoryExercises.length === 0) return null;
            
            return (
              <Grid item xs={12} key={category}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    borderRadius: '8px',
                    border: `1px solid ${categoryColors[category]}40`
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: categoryColors[category], 
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderBottom: expandedCategories[category] ? `1px solid ${categoryColors[category]}40` : 'none'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {category}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          ml: 1, 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {categoryExercises.length}
                      </Typography>
                    </Box>
                    <IconButton 
                      onClick={() => toggleCategoryExpansion(category)} 
                      sx={{ color: 'white' }}
                      size="small"
                    >
                      {expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                    <List sx={{ pt: 0, pb: 0 }}>
                      {categoryExercises.map((exercise, index) => (
                        <React.Fragment key={exercise._id}>
                          {index > 0 && <Divider />}
                          <ListItem
                            sx={{
                              py: 1.5,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                            secondaryAction={
                              <Box>
                                <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={() => handleOpenDialog(exercise)}
                                  sx={{ 
                                    mr: 1,
                                    color: 'primary.main'
                                  }}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  aria-label="retire"
                                  onClick={() => handleRetireExercise(exercise._id)}
                                  sx={{ color: 'error.main' }}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {exercise.name}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Typography 
                                    component="span" 
                                    variant="body2" 
                                    sx={{ 
                                      bgcolor: 'rgba(0, 0, 0, 0.08)', 
                                      px: 1, 
                                      py: 0.5, 
                                      borderRadius: '4px',
                                      mr: 1,
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    {exercise.defaultReps} reps
                                  </Typography>
                                  {exercise.description && (
                                    <Typography 
                                      component="span" 
                                      variant="body2" 
                                      color="text.secondary"
                                      sx={{ fontSize: '0.75rem' }}
                                    >
                                      {exercise.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </Collapse>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      );
    }

    // For retired exercises, keep the original list view
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          bgcolor: 'rgba(211, 47, 47, 0.05)', // Light red background
          borderRadius: '8px',
          border: '1px solid rgba(211, 47, 47, 0.2)' // Light red border
        }}
      >
        <List sx={{ pt: 0, pb: 0 }}>
          {exercises.map((exercise, index) => (
            <React.Fragment key={exercise._id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 1.5,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(211, 47, 47, 0.08)' // Slightly darker on hover
                  }
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="restore"
                      onClick={() => handleRestoreExercise(exercise._id)}
                      title="Restore exercise"
                      sx={{ 
                        mr: 1,
                        color: 'success.main' // Green color for restore
                      }}
                      size="small"
                    >
                      <RestoreIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="hard delete"
                      onClick={() => handleHardDeleteExercise(exercise._id)}
                      title="Permanently delete exercise"
                      sx={{ color: 'error.dark' }} // Darker red for permanent delete
                      size="small"
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {exercise.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography 
                        component="span" 
                        variant="body2" 
                        sx={{ 
                          bgcolor: 'rgba(211, 47, 47, 0.1)', // Very light red background
                          px: 1, 
                          py: 0.5, 
                          borderRadius: '4px',
                          mr: 1,
                          fontSize: '0.75rem',
                          color: 'error.main' // Red text
                        }}
                      >
                        {exercise.category}
                      </Typography>
                      <Typography 
                        component="span" 
                        variant="body2" 
                        sx={{ 
                          bgcolor: 'rgba(0, 0, 0, 0.08)', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: '4px',
                          mr: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {exercise.defaultReps} reps
                      </Typography>
                      {exercise.deletedAt && (
                        <Typography 
                          component="span" 
                          variant="body2" 
                          sx={{ 
                            bgcolor: 'rgba(211, 47, 47, 0.1)', // Very light red background
                            px: 1, 
                            py: 0.5, 
                            borderRadius: '4px',
                            mr: 1,
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}
                        >
                          Retired: {new Date(exercise.deletedAt).toLocaleDateString()}
                        </Typography>
                      )}
                      {exercise.description && (
                        <Typography 
                          component="span" 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          {exercise.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <>
      <Container maxWidth="md" disableGutters={isSubTab}>
        {!isSubTab && (
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" gutterBottom>
              Exercise Manager
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Exercise
          </Button>
        </Box>
          
        <Grid container spacing={3}>
          {/* Active Exercises Section */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                mb: 3,
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(25, 118, 210, 0.2)' // Light blue border
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  borderBottom: '1px solid rgba(25, 118, 210, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Active Exercises
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 2, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {activeExercises.length}
                  </Typography>
                </Box>
              </Box>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading exercises...</Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  {renderExerciseList(activeExercises, false)}
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Retired Exercises Section */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                mb: 3, 
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(211, 47, 47, 0.2)' // Light red border
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'error.main', 
                  color: 'white',
                  borderBottom: '1px solid rgba(211, 47, 47, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Retired Exercises
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 2, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {retiredExercises.length}
                  </Typography>
                </Box>
              </Box>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading exercises...</Typography>
                </Box>
              ) : (
                <Box sx={{ p: 2 }}>
                  {renderExerciseList(retiredExercises, true)}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Exercise' : 'Add New Exercise'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Exercise Name"
              name="name"
              value={currentExercise.name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={currentExercise.category}
                label="Category"
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              id="defaultReps"
              label="Default Reps"
              name="defaultReps"
              type="number"
              value={currentExercise.defaultReps}
              onChange={handleInputChange}
              inputProps={{ min: 1 }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description (Optional)"
              name="description"
              value={currentExercise.description}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveExercise} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExerciseManager;
