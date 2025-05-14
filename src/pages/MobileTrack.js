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
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Slide,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WorkoutTimer from '../components/WorkoutTimer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../contexts/AuthContext';

const motivationalMessages = [
  "Amazing work! You're getting stronger every day!",
  "Another workout crushed! Keep pushing your limits!",
  "You showed up and put in the work - that's what counts!",
  "Great job staying committed to your fitness goals!",
  "Every rep brings you closer to your best self!",
  "You're building a stronger, healthier you!",
  "Champion mindset - showing up and giving it your all!",
  "Your dedication is inspiring - keep it up!",
];

// Calculate duration between two timestamps
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return '0s';
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end - start;
  
  if (durationMs < 0) {
    return '0s';
  }
  
  const seconds = Math.floor(durationMs / 1000) % 60;
  const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const MobileTrack = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [activeWorkouts, setActiveWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('activeWorkouts');
      if (!saved) return [];
      
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing activeWorkouts from localStorage:', error);
      localStorage.removeItem('activeWorkouts');
      return [];
    }
  });
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completedWorkoutIndex, setCompletedWorkoutIndex] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [addExerciseDialog, setAddExerciseDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [previousWorkouts, setPreviousWorkouts] = useState([]);

  // Ensure the current user is properly loaded
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser._id || currentUser.id;
      if (userId) {
        console.log('Current user loaded:', userId);
        
        // Fetch previous workouts for this user
        const fetchUserWorkouts = async () => {
          try {
            const userWorkouts = await fetchPreviousWorkoutData(userId);
            setPreviousWorkouts(userWorkouts);
            console.log(`Loaded ${userWorkouts.length} previous workouts for user ${userId}`);
          } catch (error) {
            console.error('Error fetching user workouts:', error);
          }
        };
        
        fetchUserWorkouts();
      } else {
        console.warn('Current user has no ID:', currentUser);
      }
    } else {
      console.warn('No current user available in MobileTrack component');
    }
  }, [currentUser]);

  useEffect(() => {
    // Save active workouts to localStorage whenever they change
    localStorage.setItem('activeWorkouts', JSON.stringify(activeWorkouts));
  }, [activeWorkouts]);

  // Make the component fullscreen by hiding the navbar
  useEffect(() => {
    // Hide navbar when component mounts
    const navbar = document.querySelector('header');
    if (navbar) {
      navbar.style.display = 'none';
    }
    
    // Add fullscreen styles to body
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore navbar when component unmounts
    return () => {
      if (navbar) {
        navbar.style.display = '';
      }
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Fetch workout templates
    apiService.getWorkoutTemplates({
      includeGlobal: true,
      includeUserTemplates: true
    })
      .then(response => {
        if (response && response.data) {
          console.log('Fetched workout templates:', response.data);
          setWorkoutTemplates(response.data);
        } else if (response && Array.isArray(response)) {
          console.log('Fetched workout templates (array):', response);
          setWorkoutTemplates(response);
        } else {
          console.error('Invalid response format from getWorkoutTemplates:', response);
          setWorkoutTemplates([]);
        }
      })
      .catch(error => {
        console.error('Error fetching workout templates:', error);
      });
    
    // Fetch exercises
    apiService.getExercises()
      .then(response => {
        if (response && response.data) {
          console.log('Fetched exercises:', response.data);
          setExerciseList(response.data);
        } else if (response && Array.isArray(response)) {
          console.log('Fetched exercises (array):', response);
          setExerciseList(response);
        } else {
          console.error('Invalid response format from getExercises:', response);
          setExerciseList([]);
        }
      })
      .catch(error => {
        console.error('Error fetching exercises:', error);
      });
  }, []);

  // Function to fetch previous workout data for a user
  const fetchPreviousWorkoutData = async (userId) => {
    try {
      console.log('Fetching previous workout data for user:', userId);
      const response = await apiService.getCompletedWorkouts();
      
      if (response && response.data) {
        console.log('Fetched completed workouts:', response.data.length);
        // Filter workouts by user ID
        const userWorkouts = response.data.filter(workout => {
          // Try to match user ID in different formats
          const workoutUserId = workout.userId || (workout.user && (workout.user._id || workout.user.id));
          return workoutUserId === userId;
        });
        console.log('Filtered to user workouts:', userWorkouts.length);
        return userWorkouts;
      } else if (response && Array.isArray(response)) {
        console.log('Fetched completed workouts (array):', response.length);
        // Filter workouts by user ID
        const userWorkouts = response.filter(workout => {
          // Try to match user ID in different formats
          const workoutUserId = workout.userId || (workout.user && (workout.user._id || workout.user.id));
          return workoutUserId === userId;
        });
        console.log('Filtered to user workouts:', userWorkouts.length);
        return userWorkouts;
      }
      
      console.log('No completed workouts found');
      return [];
    } catch (error) {
      console.error('Error fetching previous workout data:', error);
      return [];
    }
  };

  // Function to send a keep-alive request
  const sendKeepAlive = () => {
    apiService.keepAlive()
      .then(response => console.log('Keep-alive successful:', response))
      .catch(error => console.error('Keep-alive error:', error));
  };

  useEffect(() => {
    let intervalId;
    
    // Only start the keep-alive mechanism if there are active workouts
    if (activeWorkouts && activeWorkouts.length > 0) {
      console.log('Starting keep-alive mechanism for active workout');
      // Set up the interval to send a keep-alive request every 5 minutes
      intervalId = setInterval(sendKeepAlive, 5 * 60 * 1000);
      
      // Send an initial keep-alive request immediately
      sendKeepAlive();
    }

    // Clean up the interval when workouts are completed or on component unmount
    return () => {
      if (intervalId) {
        console.log('Stopping keep-alive mechanism');
        clearInterval(intervalId);
      }
    };
  }, [activeWorkouts]);

  // Add exercise to workout
  const addExerciseToWorkout = () => {
    if (!selectedExercise || addExerciseDialog === false) return;
    
    console.log('Adding exercise with ID:', selectedExercise);
    console.log('Available exercises:', exerciseList);
    
    const exercise = exerciseList.find(ex => ex._id === selectedExercise);
    if (!exercise) {
      console.error('Could not find exercise with ID:', selectedExercise);
      setSnackbarMessage('Error: Could not find selected exercise');
      setSnackbarOpen(true);
      return;
    }
    
    console.log('Found exercise to add:', exercise);
    
    const newExercise = {
      name: exercise.name,
      category: exercise.category || '',
      exerciseId: exercise._id,
      sets: Array(3).fill().map(() => ({
        weight: '',
        reps: exercise.defaultReps || 8,
        completed: false
      }))
    };
    
    console.log('Created new exercise object:', newExercise);
    
    const updatedWorkouts = [...activeWorkouts];
    updatedWorkouts[0].exercises.push(newExercise);
    setActiveWorkouts(updatedWorkouts);
    
    // Reset and close dialog
    setSelectedExercise('');
    setAddExerciseDialog(false);
    
    // Show success message
    setSnackbarMessage(`Added ${exercise.name} to workout`);
    setSnackbarOpen(true);
  };

  // Remove exercise from workout
  const removeExercise = (exerciseIndex) => {
    if (activeWorkouts.length === 0) return;
    
    const updatedWorkouts = [...activeWorkouts];
    updatedWorkouts[0].exercises.splice(exerciseIndex, 1);
    setActiveWorkouts(updatedWorkouts);
  };

  // Add set to an exercise
  const addSet = (exerciseIndex) => {
    if (activeWorkouts.length === 0) return;
    
    const updatedWorkouts = [...activeWorkouts];
    const exercise = updatedWorkouts[0].exercises[exerciseIndex];
    
    // Get values from the last set
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      weight: lastSet.weight,
      reps: lastSet.reps,
      completed: false
    };
    
    exercise.sets.push(newSet);
    setActiveWorkouts(updatedWorkouts);
  };

  // Remove set from an exercise
  const removeSet = (exerciseIndex, setIndex) => {
    if (activeWorkouts.length === 0) return;
    
    const updatedWorkouts = [...activeWorkouts];
    const exercise = updatedWorkouts[0].exercises[exerciseIndex];
    
    // Don't remove if it's the only set
    if (exercise.sets.length <= 1) return;
    
    exercise.sets.splice(setIndex, 1);
    setActiveWorkouts(updatedWorkouts);
  };

  // Start a new workout with the selected template
  const startWorkout = async (template) => {
    if (!template) return;
    
    // Close the template dialog
    setOpenTemplateDialog(false);
    
    // Ensure we have the current user
    const userId = currentUser && (currentUser._id || currentUser.id);
    if (!userId) {
      console.error('Current user is not available when starting workout:', currentUser);
      setSnackbarMessage('Error: User not authenticated. Please log in again.');
      setSnackbarOpen(true);
      return;
    }
    
    console.log('Starting workout with template:', template.name);
    console.log('Current user:', currentUser);
    console.log('User ID:', userId);
    
    setSaving(true);
    
    try {
      // Fetch previous workouts if not already loaded
      if (!previousWorkouts || previousWorkouts.length === 0) {
        console.log('Fetching previous workouts for weight pre-filling');
        const userWorkouts = await fetchPreviousWorkoutData(userId);
        setPreviousWorkouts(userWorkouts);
      }
      
      // Create a new workout based on the template
      const workout = {
        id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: template._id,
        templateName: template.name,
        startTime: new Date().toISOString(),
        userId: userId,
        user: userId,
        exercises: template.exercises.map(exercise => {
          // Get the last used weights for this exercise by this user
          const targetSetsCount = exercise.sets || 1;
          const lastUsedWeights = getLastUsedWeights(previousWorkouts, exercise, targetSetsCount, template);
          const hasPreFilledWeights = wereWeightsPrefilled(lastUsedWeights);
          
          return {
            name: exercise.name,
            category: exercise.category || '',
            exerciseId: exercise.exerciseId,
            weightPreFilled: hasPreFilledWeights,
            sets: Array(targetSetsCount).fill().map((_, index) => ({ 
              weight: lastUsedWeights[index] || '', 
              reps: exercise.reps, 
              completed: false 
            }))
          };
        })
      };
      
      setActiveWorkouts(prev => [...prev, workout]);
      setSaving(false);
      
      // Only show a notification if weights were pre-filled
      const hasPreFilledWeights = workout.exercises.some(exercise => exercise.weightPreFilled);
      if (hasPreFilledWeights) {
        setSnackbarMessage('Weights have been pre-filled based on your previous workouts');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      setSaving(false);
      
      // Show error message
      setSnackbarMessage('Error starting workout');
      setSnackbarOpen(true);
    }
  };

  // Get the last used weights for an exercise from previous workouts
  const getLastUsedWeights = (previousWorkouts, exercise, targetSetsCount, template) => {
    console.log('Getting last used weights for exercise:', exercise.name);
    console.log('Exercise details:', {
      id: exercise._id,
      exerciseId: exercise.exerciseId,
      name: exercise.name
    });
    console.log('Previous workouts count:', previousWorkouts?.length || 0);
    
    if (!previousWorkouts || !Array.isArray(previousWorkouts) || previousWorkouts.length === 0) {
      console.log('No previous workouts found, returning empty weights');
      return Array(targetSetsCount).fill('');
    }
    
    // Debug the first workout to see its structure
    if (previousWorkouts.length > 0) {
      const firstWorkout = previousWorkouts[0];
      console.log('First workout structure:', {
        id: firstWorkout._id,
        templateId: firstWorkout.templateId,
        template: firstWorkout.template ? firstWorkout.template._id : 'none',
        exercises: firstWorkout.exercises ? firstWorkout.exercises.length : 0
      });
      
      if (firstWorkout.exercises && firstWorkout.exercises.length > 0) {
        console.log('First exercise in workout:', {
          name: firstWorkout.exercises[0].name,
          id: firstWorkout.exercises[0]._id,
          exerciseId: firstWorkout.exercises[0].exerciseId
        });
      }
    }
    
    // First try to find weights from the same template
    const sameTemplateWorkouts = previousWorkouts.filter(workout => {
      // Try multiple ways to match the template
      const workoutTemplateId = workout.templateId || (workout.template && workout.template._id);
      const currentTemplateId = template._id;
      
      console.log(`Comparing template IDs - workout: ${workoutTemplateId}, current: ${currentTemplateId}`);
      
      return workoutTemplateId === currentTemplateId;
    });
    
    console.log('Same template workouts found:', sameTemplateWorkouts.length);
    
    // Find the most recent workout that has this exercise
    const workoutsWithExercise = sameTemplateWorkouts.filter(workout => {
      if (!workout.exercises || !Array.isArray(workout.exercises)) {
        return false;
      }
      
      return workout.exercises.some(ex => {
        // Try multiple ways to match the exercise
        const exId = ex.exerciseId || ex._id;
        const targetId = exercise.exerciseId || exercise._id;
        const nameMatch = ex.name === exercise.name;
        
        console.log(`Comparing exercise - workout: ${ex.name}(${exId}), target: ${exercise.name}(${targetId})`);
        
        return exId === targetId || nameMatch;
      });
    });
    
    console.log('Workouts with this exercise found:', workoutsWithExercise.length);
    
    if (workoutsWithExercise.length === 0) {
      // If no workouts found with the same template and exercise, try matching just by exercise name
      const workoutsWithExerciseByName = previousWorkouts.filter(workout => {
        if (!workout.exercises || !Array.isArray(workout.exercises)) {
          return false;
        }
        
        return workout.exercises.some(ex => ex.name === exercise.name);
      });
      
      console.log('Workouts with this exercise by name:', workoutsWithExerciseByName.length);
      
      if (workoutsWithExerciseByName.length === 0) {
        console.log('No workouts found with this exercise, returning empty weights');
        return Array(targetSetsCount).fill('');
      }
      
      // Sort by date (most recent first)
      workoutsWithExerciseByName.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
      
      // Get the most recent workout
      const mostRecentWorkout = workoutsWithExerciseByName[0];
      console.log('Most recent workout by name match:', mostRecentWorkout.templateName, 'from', mostRecentWorkout.endTime);
      
      // Find the exercise in that workout
      const matchingExercise = mostRecentWorkout.exercises.find(ex => ex.name === exercise.name);
      
      if (!matchingExercise || !matchingExercise.sets || !Array.isArray(matchingExercise.sets)) {
        console.log('No matching exercise found in the workout, returning empty weights');
        return Array(targetSetsCount).fill('');
      }
      
      // Get the weights from each set - include all sets regardless of completion status
      const weights = matchingExercise.sets.map(set => {
        console.log('Set:', set);
        return set.weight || '';
      });
      
      console.log('Found weights by name match:', weights);
      
      // If we need more sets than we have weights for, pad with empty strings
      if (weights.length < targetSetsCount) {
        return [...weights, ...Array(targetSetsCount - weights.length).fill('')];
      }
      
      // If we have more weights than sets, truncate
      return weights.slice(0, targetSetsCount);
    }
    
    // Sort by date (most recent first)
    workoutsWithExercise.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    
    // Get the most recent workout
    const mostRecentWorkout = workoutsWithExercise[0];
    console.log('Most recent workout:', mostRecentWorkout.templateName, 'from', mostRecentWorkout.endTime);
    
    // Find the exercise in that workout - try multiple ways to match
    const matchingExercise = mostRecentWorkout.exercises.find(ex => {
      const exId = ex.exerciseId || ex._id;
      const targetId = exercise.exerciseId || exercise._id;
      const nameMatch = ex.name === exercise.name;
      
      return exId === targetId || nameMatch;
    });
    
    if (!matchingExercise || !matchingExercise.sets || !Array.isArray(matchingExercise.sets)) {
      console.log('No matching exercise found in the workout, returning empty weights');
      return Array(targetSetsCount).fill('');
    }
    
    console.log('Matching exercise found:', matchingExercise.name);
    console.log('Sets count:', matchingExercise.sets.length);
    
    // Get the weights from each set - include all sets regardless of completion status
    const weights = matchingExercise.sets.map(set => {
      console.log('Set:', set);
      return set.weight || '';
    });
    
    console.log('Found weights:', weights);
    
    // If we need more sets than we have weights for, pad with empty strings
    if (weights.length < targetSetsCount) {
      return [...weights, ...Array(targetSetsCount - weights.length).fill('')];
    }
    
    // If we have more weights than sets, truncate
    return weights.slice(0, targetSetsCount);
  };

  // Check if weights were prefilled
  const wereWeightsPrefilled = (weights) => {
    const result = weights.some(weight => {
      // Convert to number if it's a string
      const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
      // Check if it's a valid number and greater than zero
      return !isNaN(numWeight) && numWeight > 0;
    });
    console.log('Were weights prefilled:', result, 'Weights:', weights);
    return result;
  };

  // Render the component
  return (
    <Container 
      maxWidth={false} 
      disableGutters 
      sx={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        m: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        width: '100%'
      }}>
        <Typography variant="h6">Mobile Workout Tracker</Typography>
        <Button 
          color="inherit" 
          onClick={() => navigate(-1)}
          sx={{ minWidth: 40 }}
        >
          Exit
        </Button>
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2,
        width: '100%',
        maxWidth: 'sm',
        mx: 'auto'
      }}>
        {/* Show loading indicator while fetching data */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={48} />
          </Box>
        )}
        
        {/* Show active workouts */}
        {activeWorkouts.length > 0 ? (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ 
              fontSize: { xs: '1.4rem', sm: '1.5rem' },
              mb: 2
            }}>
              Active Workouts
            </Typography>
            {activeWorkouts.map((workout, index) => (
              <Paper 
                key={workout.id} 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  mb: 3,
                  borderLeft: 4,
                  borderColor: workout.userColor || 'primary.main',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                    {workout.templateName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Started: {new Date(workout.startTime).toLocaleTimeString()}
                  </Typography>
                </Box>
                
                <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                  <WorkoutTimer startTime={workout.startTime} />
                </Typography>
                
                {/* Add Exercise Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setAddExerciseDialog(true)}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ mr: 1 }}
                  >
                    Add Exercise
                  </Button>
                </Box>
                
                <List dense sx={{ mt: 1 }}>
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <ListItem key={`${workout.id}-exercise-${exerciseIndex}`} disablePadding sx={{ 
                      mb: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                        <Tooltip title="Remove Exercise">
                          <IconButton 
                            color="error" 
                            onClick={() => removeExercise(exerciseIndex)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 'medium',
                            fontSize: '1.1rem',
                            flexGrow: 1
                          }}
                        >
                          {exercise.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ width: '100%' }}>
                        {exercise.sets.map((set, setIndex) => (
                          <Box 
                            key={`${workout.id}-exercise-${exerciseIndex}-set-${setIndex}`}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              mb: 1.5,
                              width: '100%'
                            }}
                          >
                            {exercise.sets.length > 1 && (
                              <Tooltip title="Remove Set">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                  sx={{ mr: 0.5 }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Typography variant="body2" sx={{ minWidth: 50, mr: 1 }}>
                              Set {setIndex + 1}:
                            </Typography>
                            
                            <TextField
                              size="small"
                              label="Wt"
                              placeholder="0"
                              variant="outlined"
                              value={set.weight}
                              onChange={(e) => {
                                const newActiveWorkouts = [...activeWorkouts];
                                newActiveWorkouts[index].exercises[exerciseIndex].sets[setIndex].weight = e.target.value;
                                setActiveWorkouts(newActiveWorkouts);
                              }}
                              sx={{ 
                                mr: 1, 
                                width: 85,
                                '& .MuiOutlinedInput-root': {
                                  height: 45,
                                  '& fieldset': {
                                    borderColor: exercise.weightPreFilled ? 'primary.main' : 'inherit',
                                  }
                                },
                                '& .MuiInputLabel-root': {
                                  transform: 'translate(14px, 13px) scale(1)'
                                },
                                '& .MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)'
                                }
                              }}
                              InputProps={{
                                endAdornment: <Typography variant="caption">kg</Typography>,
                                type: "number",
                                inputProps: { min: 0, step: 2.5 }
                              }}
                            />
                            
                            <TextField
                              size="small"
                              label="Reps"
                              variant="outlined"
                              value={set.reps}
                              onChange={(e) => {
                                const newActiveWorkouts = [...activeWorkouts];
                                newActiveWorkouts[index].exercises[exerciseIndex].sets[setIndex].reps = e.target.value;
                                setActiveWorkouts(newActiveWorkouts);
                              }}
                              sx={{ 
                                mr: 1, 
                                width: 75,
                                '& .MuiOutlinedInput-root': {
                                  height: 45
                                },
                                '& .MuiInputLabel-root': {
                                  transform: 'translate(14px, 13px) scale(1)'
                                },
                                '& .MuiInputLabel-shrink': {
                                  transform: 'translate(14px, -6px) scale(0.75)'
                                }
                              }}
                              InputProps={{
                                type: "number",
                                inputProps: { min: 0, step: 1 }
                              }}
                            />
                            
                            <IconButton 
                              size="medium"
                              onClick={() => {
                                const newActiveWorkouts = [...activeWorkouts];
                                newActiveWorkouts[index].exercises[exerciseIndex].sets[setIndex].completed = 
                                  !newActiveWorkouts[index].exercises[exerciseIndex].sets[setIndex].completed;
                                setActiveWorkouts(newActiveWorkouts);
                              }}
                              color={set.completed ? "primary" : "default"}
                              sx={{ 
                                ml: 'auto',
                                width: 40,
                                height: 40
                              }}
                            >
                              {set.completed ? <CheckCircleIcon fontSize="large" /> : <CheckCircleOutlineIcon fontSize="large" />}
                            </IconButton>
                          </Box>
                        ))}
                        
                        {/* Add Set Button */}
                        <Box sx={{ display: 'flex', mt: 1, mb: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => addSet(exerciseIndex)}
                            startIcon={<AddCircleOutlineIcon />}
                          >
                            Add Set
                          </Button>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => {
                      const newActiveWorkouts = [...activeWorkouts];
                      newActiveWorkouts.splice(index, 1);
                      setActiveWorkouts(newActiveWorkouts);
                    }}
                    startIcon={<DeleteOutlineIcon />}
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => {
                      setCompletedWorkoutIndex(index);
                      setCompletionDialog(true);
                    }}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      fontSize: '1rem'
                    }}
                  >
                    Finish
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', my: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              No active workouts
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenTemplateDialog(true)}
              sx={{ 
                mt: 2,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem'
              }}
            >
              Start New Workout
            </Button>
          </Box>
        )}
        
        {/* Template selection dialog */}
        <Dialog 
          open={openTemplateDialog} 
          onClose={() => !saving && setOpenTemplateDialog(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: 2,
              width: 'calc(100% - 32px)',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ pt: 3, px: 3 }}>Select Workout Template</DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            {saving ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={56} sx={{ mb: 3 }} />
                <Typography variant="body1">Loading previous workout data...</Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', py: 1 }}>
                {workoutTemplates && workoutTemplates.length > 0 ? (
                  workoutTemplates.map((template) => (
                    <ListItem 
                      key={template._id} 
                      button
                      onClick={() => startWorkout(template)}
                      sx={{
                        borderLeft: 4,
                        borderColor: template.isGlobal ? 'secondary.main' : 'primary.main',
                        py: 2,
                        px: 2,
                        mb: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'medium', fontSize: '1.1rem' }}>
                            {template.name}
                          </Typography>
                        } 
                        secondary={
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {`${template.exercises?.length || 0} exercises`}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No workout templates found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Templates count: {workoutTemplates ? workoutTemplates.length : 'undefined'}
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 3 }}>
            <Button 
              onClick={() => setOpenTemplateDialog(false)} 
              disabled={saving}
              variant="outlined"
              size="large"
              sx={{ 
                py: 1.5,
                px: 3,
                fontSize: '1rem'
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Workout completion dialog */}
        <Dialog 
          open={completionDialog} 
          onClose={() => setCompletionDialog(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: 2,
              width: 'calc(100% - 32px)',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ pt: 3, px: 3 }}>Complete Workout</DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to complete this workout?
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
              This will save your workout and remove it from active workouts.
            </Typography>
            
            {completedWorkoutIndex !== null && activeWorkouts[completedWorkoutIndex] && (
              <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {activeWorkouts[completedWorkoutIndex].templateName}
                </Typography>
                <Typography variant="body2">
                  Started: {new Date(activeWorkouts[completedWorkoutIndex].startTime).toLocaleTimeString()}
                </Typography>
                <Typography variant="body2">
                  Duration: <WorkoutTimer startTime={activeWorkouts[completedWorkoutIndex].startTime} />
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              onClick={() => setCompletionDialog(false)}
              variant="outlined"
              size="large"
              sx={{ 
                py: 1.5,
                px: 3,
                fontSize: '1rem'
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              sx={{ 
                py: 1.5,
                px: 3,
                fontSize: '1rem'
              }}
              onClick={() => {
                if (completedWorkoutIndex !== null) {
                  const workout = activeWorkouts[completedWorkoutIndex];
                  const endTime = new Date().toISOString();
                  
                  // Ensure we have the current user
                  const userId = currentUser._id || currentUser.id;
                  if (!userId) {
                    console.error('Current user is not available:', currentUser);
                    setSnackbarMessage('Error: User not authenticated. Please log in again.');
                    setSnackbarOpen(true);
                    setCompletionDialog(false);
                    return;
                  }
                  
                  console.log('Current user:', currentUser);
                  console.log('User ID:', userId);
                  
                  const completedWorkout = {
                    ...workout,
                    endTime,
                    duration: calculateDuration(workout.startTime, endTime),
                    userId: userId,
                    user: userId
                  };
                  
                  console.log('Saving workout with user ID:', userId);
                  console.log('Completed workout data:', completedWorkout);
                  
                  // Save to API
                  apiService.createCompletedWorkout(completedWorkout)
                    .then(response => {
                      console.log('Workout saved successfully:', response);
                      
                      // Remove from active workouts
                      const newActiveWorkouts = [...activeWorkouts];
                      newActiveWorkouts.splice(completedWorkoutIndex, 1);
                      setActiveWorkouts(newActiveWorkouts);
                      
                      // Close dialog
                      setCompletionDialog(false);
                      setCompletedWorkoutIndex(null);
                      
                      // Show success message
                      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
                      setSnackbarMessage(motivationalMessages[randomIndex]);
                      setSnackbarOpen(true);
                    })
                    .catch(error => {
                      console.error('Error saving workout:', error);
                      
                      // Close dialog
                      setCompletionDialog(false);
                      setCompletedWorkoutIndex(null);
                      
                      // Show error message
                      setSnackbarMessage('Error saving workout');
                      setSnackbarOpen(true);
                    });
                }
              }}
            >
              Complete Workout
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Add Exercise dialog */}
        <Dialog 
          open={addExerciseDialog !== false} 
          onClose={() => setAddExerciseDialog(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: 2,
              width: 'calc(100% - 32px)',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ pt: 3, px: 3 }}>Add Exercise</DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="exercise-select-label">Exercise</InputLabel>
              <Select
                labelId="exercise-select-label"
                id="exercise-select"
                value={selectedExercise}
                label="Exercise"
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {exerciseList && (() => {
                  // Group exercises by category
                  const exercisesByCategory = {};
                  
                  // Add exercises to their categories
                  exerciseList.forEach(exercise => {
                    const category = exercise.category || 'Uncategorized';
                    if (!exercisesByCategory[category]) {
                      exercisesByCategory[category] = [];
                    }
                    exercisesByCategory[category].push(exercise);
                  });
                  
                  // Sort categories alphabetically
                  const sortedCategories = Object.keys(exercisesByCategory).sort();
                  
                  // Create menu items grouped by category
                  return sortedCategories.map(category => [
                    <ListSubheader key={`category-${category}`}>
                      {category}
                    </ListSubheader>,
                    ...exercisesByCategory[category].map(exercise => (
                      <MenuItem key={exercise._id} value={exercise._id}>
                        {exercise.name}
                      </MenuItem>
                    ))
                  ]);
                })()}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 3 }}>
            <Button 
              onClick={() => setAddExerciseDialog(false)} 
              variant="outlined"
              sx={{ 
                py: 1,
                px: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => addExerciseToWorkout()} 
              variant="contained" 
              color="primary"
              disabled={!selectedExercise}
              sx={{ 
                py: 1,
                px: 2
              }}
            >
              Add Exercise
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            bottom: { xs: 16, sm: 24 }
          }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="success" 
            variant="filled"
            sx={{ 
              width: '100%',
              boxShadow: 3,
              fontSize: '1rem',
              py: 1.5,
              alignItems: 'center'
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default MobileTrack;
