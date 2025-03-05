import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('exerciseLibrary');
    return saved ? JSON.parse(saved) : [];
  });
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    category: ''
  });

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExercise.name) return;
    
    const exercise = {
      id: Date.now(),
      ...newExercise
    };
    
    const updatedExercises = [...exercises, exercise];
    setExercises(updatedExercises);
    localStorage.setItem('exerciseLibrary', JSON.stringify(updatedExercises));
    setNewExercise({ name: '', description: '', category: '' });
  };

  const handleDeleteExercise = (id) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setExercises(updatedExercises);
    localStorage.setItem('exerciseLibrary', JSON.stringify(updatedExercises));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ my: 4 }}>
        Exercise Library
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Exercise
        </Typography>
        <form onSubmit={handleAddExercise}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Exercise Name"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              required
            />
            <TextField
              label="Category"
              value={newExercise.category}
              onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
              placeholder="e.g., Chest, Legs, Back"
            />
            <TextField
              label="Description"
              value={newExercise.description}
              onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
              multiline
              rows={2}
            />
            <Button type="submit" variant="contained" color="primary">
              Add Exercise
            </Button>
          </Box>
        </form>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Exercises
        </Typography>
        <List>
          {exercises.map((exercise) => (
            <ListItem key={exercise.id} divider>
              <ListItemText
                primary={exercise.name}
                secondary={`${exercise.category}${exercise.description ? ` - ${exercise.description}` : ''}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteExercise(exercise.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default ExerciseLibrary;
