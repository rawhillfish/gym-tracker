import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import api from '../services/api';

const DebugWeightPrefill = () => {
  const [exercises, setExercises] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch exercises
        const exercisesResponse = await api.getExercises();
        setExercises(exercisesResponse.data);
        
        // Fetch completed workouts
        const workoutsResponse = await api.getCompletedWorkouts();
        setCompletedWorkouts(workoutsResponse.data);
        
        // Fetch templates
        const templatesResponse = await api.getWorkoutTemplates();
        setTemplates(templatesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please check the console for details.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const runDebugCheck = () => {
    // Create debug info object
    const info = {
      exercisesWithIds: exercises.filter(ex => ex._id && (ex.exerciseId || ex.id)).length,
      exercisesWithoutIds: exercises.filter(ex => !ex.exerciseId && !ex.id).length,
      exerciseIdSamples: exercises.slice(0, 3).map(ex => ({
        name: ex.name,
        _id: ex._id,
        id: ex.id,
        exerciseId: ex.exerciseId
      })),
      workoutsWithTemplateIds: completedWorkouts.filter(w => w.templateId).length,
      workoutsWithoutTemplateIds: completedWorkouts.filter(w => !w.templateId).length,
      workoutExercisesWithIds: 0,
      workoutExercisesWithoutIds: 0,
      workoutSamples: []
    };
    
    // Count exercises in workouts with/without IDs
    completedWorkouts.forEach(workout => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        const sample = {
          workoutId: workout._id,
          templateName: workout.templateName,
          templateId: workout.templateId,
          exercises: []
        };
        
        workout.exercises.forEach(ex => {
          if (ex.exerciseId || ex._id || ex.id) {
            info.workoutExercisesWithIds++;
            sample.exercises.push({
              name: ex.name,
              _id: ex._id,
              id: ex.id,
              exerciseId: ex.exerciseId,
              hasId: true
            });
          } else {
            info.workoutExercisesWithoutIds++;
            sample.exercises.push({
              name: ex.name,
              hasId: false
            });
          }
        });
        
        if (workout.exercises.length > 0) {
          info.workoutSamples.push(sample);
        }
      }
    });
    
    // Limit samples to avoid overwhelming the UI
    info.workoutSamples = info.workoutSamples.slice(0, 3);
    
    setDebugInfo(info);
  };

  const fixExerciseIds = async () => {
    try {
      setLoading(true);
      
      // Update exercises without exerciseId
      for (const exercise of exercises) {
        if (!exercise.exerciseId) {
          exercise.exerciseId = exercise._id;
          await api.updateExercise(exercise._id, exercise);
        }
      }
      
      // Refresh exercises
      const exercisesResponse = await api.getExercises();
      setExercises(exercisesResponse.data);
      
      setLoading(false);
      alert('Exercise IDs have been fixed!');
      runDebugCheck();
    } catch (err) {
      console.error('Error fixing exercise IDs:', err);
      setError('Failed to fix exercise IDs. Please check the console for details.');
      setLoading(false);
    }
  };

  const fixWorkoutExerciseIds = async () => {
    try {
      setLoading(true);
      
      // Create a map of exercise names to IDs
      const exerciseMap = {};
      exercises.forEach(ex => {
        exerciseMap[ex.name.toLowerCase()] = ex._id;
      });
      
      // Update completed workouts
      for (const workout of completedWorkouts) {
        let workoutUpdated = false;
        
        // Add templateId if missing
        if (!workout.templateId && workout.templateName) {
          const matchingTemplate = templates.find(t => 
            t.name.toLowerCase() === workout.templateName.toLowerCase()
          );
          
          if (matchingTemplate) {
            workout.templateId = matchingTemplate._id;
            workoutUpdated = true;
          } else {
            workout.templateId = 'legacy-template';
            workoutUpdated = true;
          }
        }
        
        // Update exercises
        if (workout.exercises && Array.isArray(workout.exercises)) {
          workout.exercises.forEach(ex => {
            if (!ex.exerciseId && ex.name) {
              const matchingId = exerciseMap[ex.name.toLowerCase()];
              if (matchingId) {
                ex.exerciseId = matchingId;
                workoutUpdated = true;
              }
            }
          });
        }
        
        // Save if updated
        if (workoutUpdated) {
          await api.updateCompletedWorkout(workout._id, workout);
        }
      }
      
      // Refresh completed workouts
      const workoutsResponse = await api.getCompletedWorkouts();
      setCompletedWorkouts(workoutsResponse.data);
      
      setLoading(false);
      alert('Workout exercise IDs have been fixed!');
      runDebugCheck();
    } catch (err) {
      console.error('Error fixing workout exercise IDs:', err);
      setError('Failed to fix workout exercise IDs. Please check the console for details.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 4 }}>
        Debug Weight Pre-filling
      </Typography>
      
      {error && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Database Status
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Exercises: {exercises.length}
          </Typography>
          <Typography variant="body1">
            Completed Workouts: {completedWorkouts.length}
          </Typography>
          <Typography variant="body1">
            Workout Templates: {templates.length}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={runDebugCheck}
            disabled={loading}
          >
            Run Debug Check
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={fixExerciseIds}
            disabled={loading}
          >
            Fix Exercise IDs
          </Button>
          
          <Button 
            variant="contained" 
            color="warning"
            onClick={fixWorkoutExerciseIds}
            disabled={loading}
          >
            Fix Workout Exercise IDs
          </Button>
        </Box>
      </Paper>
      
      {Object.keys(debugInfo).length > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Debug Results
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Exercises
            </Typography>
            <Typography variant="body1">
              Exercises with IDs: {debugInfo.exercisesWithIds}
            </Typography>
            <Typography variant="body1">
              Exercises without IDs: {debugInfo.exercisesWithoutIds}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Sample Exercises:
            </Typography>
            <List dense>
              {debugInfo.exerciseIdSamples.map((ex, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={ex.name} 
                    secondary={`_id: ${ex._id || 'N/A'}, id: ${ex.id || 'N/A'}, exerciseId: ${ex.exerciseId || 'N/A'}`} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Completed Workouts
            </Typography>
            <Typography variant="body1">
              Workouts with template IDs: {debugInfo.workoutsWithTemplateIds}
            </Typography>
            <Typography variant="body1">
              Workouts without template IDs: {debugInfo.workoutsWithoutTemplateIds}
            </Typography>
            <Typography variant="body1">
              Workout exercises with IDs: {debugInfo.workoutExercisesWithIds}
            </Typography>
            <Typography variant="body1">
              Workout exercises without IDs: {debugInfo.workoutExercisesWithoutIds}
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Sample Workouts:
            </Typography>
            {debugInfo.workoutSamples.map((workout, index) => (
              <Box key={index} sx={{ mb: 2, pl: 2, borderLeft: '2px solid #ccc' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {workout.templateName} (ID: {workout.templateId || 'N/A'})
                </Typography>
                <List dense>
                  {workout.exercises.map((ex, exIndex) => (
                    <ListItem key={exIndex}>
                      <ListItemText 
                        primary={ex.name} 
                        secondary={ex.hasId ? 
                          `_id: ${ex._id || 'N/A'}, id: ${ex.id || 'N/A'}, exerciseId: ${ex.exerciseId || 'N/A'}` : 
                          'No IDs found'
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default DebugWeightPrefill;
