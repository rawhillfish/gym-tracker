import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemIcon,
  Tooltip,
  Collapse,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const WorkoutBuilder = ({ isSubTab = false }) => {
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [retiredTemplates, setRetiredTemplates] = useState([]);
  
  const [exercises, setExercises] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    exercises: []
  });
  const [openExerciseDialog, setOpenExerciseDialog] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch exercises from MongoDB
    apiService.getExercises()
      .then(response => {
        setExercises(response.data);
      })
      .catch(err => console.error('Error fetching exercises:', err));
      
    // Fetch active workout templates
    apiService.getWorkoutTemplates()
      .then(response => {
        const data = response.data;
        if (Array.isArray(data)) {
          setWorkoutTemplates(data.filter(template => !template.isDeleted));
        } else {
          setWorkoutTemplates([]);
        }
      })
      .catch(err => console.error('Error fetching active templates:', err));
      
    // Fetch retired workout templates
    apiService.getWorkoutTemplates({ includeDeleted: true })
      .then(response => {
        const data = response.data;
        if (Array.isArray(data)) {
          setRetiredTemplates(data.filter(template => template.isDeleted));
        } else {
          setRetiredTemplates([]);
        }
      })
      .catch(err => console.error('Error fetching retired templates:', err));
  }, []);

  const handleSaveTemplate = async () => {
    try {
      console.log('Saving template...');
      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        exercises: selectedExercises.map(ex => ({
          exerciseId: ex._id,
          name: ex.name,
          category: ex.category,
          sets: ex.sets,
          reps: ex.reps
        }))
      };
      console.log('Template data:', templateData);

      if (editingTemplate) {
        console.log('Updating existing template:', editingTemplate._id);
        // Update existing template
        const response = await apiService.updateWorkoutTemplate(editingTemplate._id, templateData);
        console.log('Update response:', response);
        const updatedTemplate = response.data;
        
        // Update the templates array
        setWorkoutTemplates(workoutTemplates.map(template => 
          template._id === updatedTemplate._id ? updatedTemplate : template
        ));
        
        // Reset form
        setEditingTemplate(null);
      } else {
        console.log('Creating new template');
        // Create new template
        const response = await apiService.createWorkoutTemplate(templateData);
        console.log('Create response:', response);
        const newTemplateFromServer = response.data;
        
        // Add to templates array
        setWorkoutTemplates([...workoutTemplates, newTemplateFromServer]);
      }
      
      // Reset form
      setNewTemplate({ name: '', description: '', exercises: [] });
      setSelectedExercises([]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error saving workout template:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
    });
    setSelectedExercises(template.exercises);
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await apiService.retireWorkoutTemplate(templateId);
      
      // Update local state
      const template = workoutTemplates.find(t => t._id === templateId);
      if (template) {
        // Remove from active templates
        setWorkoutTemplates(workoutTemplates.filter(t => t._id !== templateId));
        
        // Add to retired templates with isDeleted flag
        const retiredTemplate = { ...template, isDeleted: true, deletedAt: new Date() };
        setRetiredTemplates([...retiredTemplates, retiredTemplate]);
      }
    } catch (error) {
      console.error('Error retiring workout template:', error);
    }
  };

  const handleRetireTemplate = async (templateId) => {
    try {
      await apiService.retireWorkoutTemplate(templateId);
      
      // Update local state
      const template = workoutTemplates.find(t => t._id === templateId);
      if (template) {
        // Remove from active templates
        setWorkoutTemplates(workoutTemplates.filter(t => t._id !== templateId));
        
        // Add to retired templates with isDeleted flag
        const retiredTemplate = { ...template, isDeleted: true, deletedAt: new Date() };
        setRetiredTemplates([...retiredTemplates, retiredTemplate]);
      }
    } catch (error) {
      console.error('Error retiring workout template:', error);
    }
  };

  const handleRestoreTemplate = async (templateId) => {
    try {
      await apiService.restoreWorkoutTemplate(templateId);
      
      // Update local state
      const template = retiredTemplates.find(t => t._id === templateId);
      if (template) {
        // Remove from retired templates
        setRetiredTemplates(retiredTemplates.filter(t => t._id !== templateId));
        
        // Add to active templates without isDeleted flag
        const restoredTemplate = { ...template, isDeleted: false, deletedAt: null };
        setWorkoutTemplates([...workoutTemplates, restoredTemplate]);
      }
    } catch (error) {
      console.error('Error restoring workout template:', error);
    }
  };

  const handleHardDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to permanently delete this template? This action cannot be undone.')) {
      try {
        await apiService.hardDeleteWorkoutTemplate(templateId);
        
        // Update local state
        setRetiredTemplates(retiredTemplates.filter(t => t._id !== templateId));
      } catch (error) {
        console.error('Error permanently deleting workout template:', error);
      }
    }
  };

  const handleExerciseToggle = (exercise) => {
    const currentIndex = selectedExercises.findIndex(e => e._id === exercise._id);
    const newSelectedExercises = [...selectedExercises];

    if (currentIndex === -1) {
      newSelectedExercises.push({
        ...exercise,
        sets: 3, // default values
        reps: exercise.defaultReps || 10
      });
    } else {
      newSelectedExercises.splice(currentIndex, 1);
    }

    setSelectedExercises(newSelectedExercises);
  };

  const updateExerciseParams = (exerciseId, field, value) => {
    const newSelectedExercises = selectedExercises.map(ex => {
      if (ex._id === exerciseId) {
        return { ...ex, [field]: parseInt(value) || 0 };
      }
      return ex;
    });
    setSelectedExercises(newSelectedExercises);
  };
  
  // Function to move an exercise up in the list
  const moveExerciseUp = (index) => {
    if (index === 0) return; // Already at the top
    
    const newExercises = [...selectedExercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index - 1];
    newExercises[index - 1] = temp;
    
    setSelectedExercises(newExercises);
  };
  
  // Function to move an exercise down in the list
  const moveExerciseDown = (index) => {
    if (index === selectedExercises.length - 1) return; // Already at the bottom
    
    const newExercises = [...selectedExercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index + 1];
    newExercises[index + 1] = temp;
    
    setSelectedExercises(newExercises);
  };
  
  // Function to remove an exercise from the list
  const removeExercise = (index) => {
    const newExercises = [...selectedExercises];
    newExercises.splice(index, 1);
    setSelectedExercises(newExercises);
  };

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

  const [expanded, setExpanded] = useState(() => {
    // Initialize all categories to be expanded by default
    const initialState = {};
    categories.forEach(category => {
      initialState[category] = true;
    });
    return initialState;
  });

  const handleToggle = (category) => {
    setExpanded((prevExpanded) => ({ ...prevExpanded, [category]: !prevExpanded[category] }));
  };

  return (
    <Container maxWidth="md" disableGutters={isSubTab}>
      {!isSubTab && (
        <Typography variant="h4" sx={{ my: 4 }}>
          Workout Builder
        </Typography>
      )}

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          Create Workout
        </Button>
      </Box>

      {showCreateForm && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {editingTemplate ? 'Edit Workout Template' : 'Create New Workout Template'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Workout Name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              multiline
              rows={2}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenExerciseDialog(true)}
            >
              Add Exercises
            </Button>
            <List>
              {selectedExercises.map((exercise) => (
                <ListItem key={exercise._id} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                    <Tooltip title="Move Up">
                      <span>
                        <IconButton 
                          size="small" 
                          onClick={() => moveExerciseUp(selectedExercises.indexOf(exercise))}
                          disabled={selectedExercises.indexOf(exercise) === 0}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move Down">
                      <span>
                        <IconButton 
                          size="small" 
                          onClick={() => moveExerciseDown(selectedExercises.indexOf(exercise))}
                          disabled={selectedExercises.indexOf(exercise) === selectedExercises.length - 1}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                  <ListItemText 
                    primary={exercise.name} 
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                          label="Sets"
                          type="number"
                          size="small"
                          value={exercise.sets}
                          onChange={(e) => updateExerciseParams(exercise._id, 'sets', e.target.value)}
                          sx={{ width: 80 }}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                        <TextField
                          label="Reps"
                          type="number"
                          size="small"
                          value={exercise.reps}
                          onChange={(e) => updateExerciseParams(exercise._id, 'reps', e.target.value)}
                          sx={{ width: 80 }}
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </Box>
                    }
                  />
                  <Tooltip title="Remove Exercise">
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => removeExercise(selectedExercises.indexOf(exercise))}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveTemplate}
                disabled={!newTemplate.name || selectedExercises.length === 0}
              >
                {editingTemplate ? 'Update Template' : 'Save Template'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', description: '', exercises: [] });
                  setSelectedExercises([]);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Saved Workout Templates
        </Typography>
        
        {/* Active Templates Section */}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Active Templates
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
                {workoutTemplates.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <List>
              {Array.isArray(workoutTemplates) && workoutTemplates.length > 0 ? 
                workoutTemplates.map((template) => (
                  <ListItem 
                    key={template._id || template.id} 
                    divider
                    sx={{
                      py: 1.5,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {template.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {template.description && (
                            <Typography variant="body2" color="text.secondary">
                              {template.description}
                            </Typography>
                          )}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            sx={{ 
                              mt: 0.5,
                              display: 'inline-block',
                              bgcolor: 'rgba(0, 0, 0, 0.08)', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {`${template.exercises ? template.exercises.length : 0} exercises`}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditTemplate(template)}
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteTemplate(template._id || template.id)}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))
              : (
                <ListItem>
                  <ListItemText primary="No active workout templates found" />
                </ListItem>
              )}
            </List>
          </Box>
        </Paper>
        
        {/* Retired Templates Section */}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Retired Templates
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
                {retiredTemplates.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2 }}>
            <List>
              {Array.isArray(retiredTemplates) && retiredTemplates.length > 0 ? 
                retiredTemplates.map((template) => (
                  <ListItem 
                    key={template._id || template.id} 
                    divider
                    sx={{
                      py: 1.5,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.08)' // Slightly darker on hover
                      },
                      bgcolor: 'rgba(211, 47, 47, 0.05)' // Light red background
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {template.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {template.description && (
                            <Typography variant="body2" color="text.secondary">
                              {template.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            <Typography 
                              component="span" 
                              variant="body2" 
                              sx={{ 
                                bgcolor: 'rgba(0, 0, 0, 0.08)', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: '4px',
                                fontSize: '0.75rem'
                              }}
                            >
                              {`${template.exercises ? template.exercises.length : 0} exercises`}
                            </Typography>
                            {template.deletedAt && (
                              <Typography 
                                component="span" 
                                variant="body2" 
                                sx={{ 
                                  bgcolor: 'rgba(211, 47, 47, 0.1)', // Very light red background
                                  px: 1, 
                                  py: 0.5, 
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontStyle: 'italic'
                                }}
                              >
                                Retired: {new Date(template.deletedAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => handleRestoreTemplate(template._id)}
                        size="small"
                        sx={{ color: 'success.main' }} // Green color for restore
                      >
                        <RestoreIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleHardDeleteTemplate(template._id)}
                        size="small"
                        sx={{ color: 'error.dark' }} // Darker red for permanent delete
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))
              : (
                <ListItem>
                  <ListItemText primary="No retired workout templates found" />
                </ListItem>
              )}
            </List>
          </Box>
        </Paper>
      </Paper>

      <Dialog open={openExerciseDialog} onClose={() => setOpenExerciseDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Select Exercises</Typography>
            <TextField
              label="Search Exercises"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 200 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <List sx={{ width: '100%', minWidth: 360 }}>
            {categories.map((category) => {
              const categoryExercises = exercises.filter(
                exercise => exercise.category === category && 
                exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              
              if (categoryExercises.length === 0) return null;
              
              return (
                <Box key={category}>
                  <ListItem 
                    button 
                    onClick={() => handleToggle(category)}
                    sx={{ py: 1 }}
                  >
                    <ListItemIcon>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: categoryColors[category] }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1">{category}</Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              ml: 1, 
                              bgcolor: 'rgba(0, 0, 0, 0.08)', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: '12px',
                              fontSize: '0.75rem'
                            }}
                          >
                            {categoryExercises.length}
                          </Typography>
                        </Box>
                      } 
                    />
                    {expanded[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                  <Collapse in={expanded[category]} timeout="auto" unmountOnExit>
                    {categoryExercises.map((exercise) => (
                      <ListItem 
                        key={exercise._id} 
                        button 
                        onClick={() => handleExerciseToggle(exercise)}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedExercises.some(e => e._id === exercise._id)}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText primary={exercise.name} />
                      </ListItem>
                    ))}
                  </Collapse>
                  <Divider />
                </Box>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExerciseDialog(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkoutBuilder;
