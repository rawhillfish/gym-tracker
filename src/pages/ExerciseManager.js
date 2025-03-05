import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const categories = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Other'
];

const ExerciseManager = ({ isSubTab = false }) => {
  const [exercises, setExercises] = useState([]);
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

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await apiService.getExercises();
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load exercises',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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
      } else {
        response = await apiService.createExercise(currentExercise);
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

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }
    
    try {
      await apiService.deleteExercise(id);
      
      fetchExercises();
      setSnackbar({
        open: true,
        message: 'Exercise deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mb: 3 }}
          >
            Add New Exercise
          </Button>
          
          <Paper elevation={2}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading exercises...</Typography>
              </Box>
            ) : exercises.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No exercises found. Add your first exercise!</Typography>
              </Box>
            ) : (
              <List>
                {exercises.map((exercise, index) => (
                  <React.Fragment key={exercise._id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleOpenDialog(exercise)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteExercise(exercise._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={exercise.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {exercise.category}
                            </Typography>
                            {` — Default: ${exercise.defaultReps} reps`}
                            {exercise.description && ` — ${exercise.description}`}
                          </>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Container>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Exercise' : 'Add New Exercise'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Exercise Name"
              name="name"
              value={currentExercise.name}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Default Reps"
              name="defaultReps"
              type="number"
              value={currentExercise.defaultReps}
              onChange={handleInputChange}
              inputProps={{ min: 1 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
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
              fullWidth
              label="Description (optional)"
              name="description"
              value={currentExercise.description || ''}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveExercise}
            variant="contained"
            disabled={!currentExercise.name || !currentExercise.defaultReps}
          >
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
