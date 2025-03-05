import React, { useState, useEffect } from 'react';
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
  ListItemIcon
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const WorkoutBuilder = ({ isSubTab = false }) => {
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  
  const [exercises, setExercises] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    exercises: []
  });
  const [openExerciseDialog, setOpenExerciseDialog] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    // Fetch exercises from MongoDB
    fetch('http://localhost:5000/api/exercises')
      .then(res => res.json())
      .then(data => {
        setExercises(data);
      })
      .catch(err => console.error('Error fetching exercises:', err));
      
    // Fetch workout templates from MongoDB
    fetch('http://localhost:5000/api/workout-templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkoutTemplates(data);
        } else {
          // Fallback to localStorage if no templates in MongoDB
          const saved = localStorage.getItem('workoutTemplates');
          if (saved) {
            try {
              const templates = JSON.parse(saved);
              if (Array.isArray(templates)) {
                setWorkoutTemplates(templates);
                
                // Optionally migrate localStorage templates to MongoDB
                fetch('http://localhost:5000/api/workout-templates/import', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ templates })
                })
                  .then(res => res.json())
                  .then(data => {
                    console.log('Templates migrated to MongoDB:', data);
                    if (Array.isArray(data)) {
                      setWorkoutTemplates(data);
                    }
                  })
                  .catch(err => console.error('Error migrating templates:', err));
              } else {
                console.error('Invalid workout templates format in localStorage');
                setWorkoutTemplates([]);
              }
            } catch (error) {
              console.error('Error parsing localStorage templates:', error);
              setWorkoutTemplates([]);
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching workout templates:', err);
        // Fallback to localStorage
        const saved = localStorage.getItem('workoutTemplates');
        if (saved) {
          try {
            const templates = JSON.parse(saved);
            if (Array.isArray(templates)) {
              setWorkoutTemplates(templates);
            } else {
              setWorkoutTemplates([]);
            }
          } catch (error) {
            console.error('Error parsing localStorage templates:', error);
            setWorkoutTemplates([]);
          }
        }
      });
  }, []);

  const handleSaveTemplate = async () => {
    if (!newTemplate.name) return;
    
    try {
      if (editingTemplate) {
        // Update existing template in MongoDB
        const templateId = editingTemplate._id || editingTemplate.id;
        const templateData = {
          name: newTemplate.name,
          description: newTemplate.description,
          exercises: selectedExercises
        };
        
        if (editingTemplate._id) {
          // Update in MongoDB
          const response = await fetch(`http://localhost:5000/api/workout-templates/${templateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(templateData)
          });
          
          const updatedTemplate = await response.json();
          const updatedTemplates = workoutTemplates.map(template => 
            template._id === templateId ? updatedTemplate : template
          );
          setWorkoutTemplates(updatedTemplates);
        } else {
          // Update in localStorage (legacy support)
          const updatedTemplates = workoutTemplates.map(template => 
            template.id === templateId ? {
              ...template,
              name: newTemplate.name,
              description: newTemplate.description,
              exercises: selectedExercises
            } : template
          );
          setWorkoutTemplates(updatedTemplates);
          localStorage.setItem('workoutTemplates', JSON.stringify(updatedTemplates));
        }
      } else {
        // Create new template in MongoDB
        const templateData = {
          name: newTemplate.name,
          description: newTemplate.description,
          exercises: selectedExercises
        };
        
        const response = await fetch('http://localhost:5000/api/workout-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData)
        });
        
        const newSavedTemplate = await response.json();
        const updatedTemplates = [...workoutTemplates, newSavedTemplate];
        setWorkoutTemplates(updatedTemplates);
      }
    } catch (error) {
      console.error('Error saving workout template:', error);
      // Fallback to localStorage if MongoDB save fails
      let updatedTemplates;
      if (editingTemplate) {
        updatedTemplates = workoutTemplates.map(template => 
          template.id === editingTemplate.id ? {
            ...template,
            name: newTemplate.name,
            description: newTemplate.description,
            exercises: selectedExercises
          } : template
        );
      } else {
        const template = {
          id: Date.now(),
          ...newTemplate,
          exercises: selectedExercises
        };
        updatedTemplates = [...workoutTemplates, template];
      }
      
      setWorkoutTemplates(updatedTemplates);
      localStorage.setItem('workoutTemplates', JSON.stringify(updatedTemplates));
    }
    
    // Reset form
    setNewTemplate({ name: '', description: '', exercises: [] });
    setSelectedExercises([]);
    setEditingTemplate(null);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
    });
    setSelectedExercises(template.exercises);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      // Check if the template has an _id (MongoDB) or just an id (localStorage)
      const template = workoutTemplates.find(t => t._id === templateId || t.id === templateId);
      
      if (template && template._id) {
        // Delete from MongoDB
        await fetch(`http://localhost:5000/api/workout-templates/${template._id}`, {
          method: 'DELETE'
        });
        const updatedTemplates = workoutTemplates.filter(t => t._id !== template._id);
        setWorkoutTemplates(updatedTemplates);
      } else {
        // Delete from localStorage (legacy support)
        const updatedTemplates = workoutTemplates.filter(t => t.id !== templateId);
        setWorkoutTemplates(updatedTemplates);
        localStorage.setItem('workoutTemplates', JSON.stringify(updatedTemplates));
      }
    } catch (error) {
      console.error('Error deleting workout template:', error);
      // Fallback to localStorage if MongoDB delete fails
      const updatedTemplates = workoutTemplates.filter(template => 
        template._id !== templateId && template.id !== templateId
      );
      setWorkoutTemplates(updatedTemplates);
      localStorage.setItem('workoutTemplates', JSON.stringify(updatedTemplates));
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

  return (
    <Container maxWidth="md" disableGutters={isSubTab}>
      {!isSubTab && (
        <Typography variant="h4" sx={{ my: 4 }}>
          Workout Builder
        </Typography>
      )}

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
              <ListItem key={exercise._id}>
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
            {editingTemplate && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', description: '', exercises: [] });
                  setSelectedExercises([]);
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Saved Workout Templates
        </Typography>
        <List>
          {Array.isArray(workoutTemplates) && workoutTemplates.length > 0 ? 
            workoutTemplates.map((template) => (
              <ListItem key={template._id || template.id} divider>
                <ListItemText
                  primary={template.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {template.description}
                      </Typography>
                      <br />
                      {`${template.exercises ? template.exercises.length : 0} exercises`}
                    </>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton color="primary" onClick={() => handleEditTemplate(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteTemplate(template._id || template.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))
          : (
            <ListItem>
              <ListItemText primary="No workout templates found" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openExerciseDialog} onClose={() => setOpenExerciseDialog(false)}>
        <DialogTitle>Select Exercises</DialogTitle>
        <DialogContent>
          <List sx={{ width: '100%', minWidth: 360 }}>
            {exercises.map((exercise) => {
              const isSelected = selectedExercises.some(e => e._id === exercise._id);
              return (
                <ListItem
                  key={exercise._id}
                  button
                  onClick={() => handleExerciseToggle(exercise)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={exercise.name}
                    secondary={exercise.category}
                  />
                </ListItem>
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
