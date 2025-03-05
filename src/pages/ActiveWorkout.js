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
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TimerIcon from '@mui/icons-material/Timer';

const motivationalMessages = [
  "💪 Amazing work! You're getting stronger every day!",
  "🔥 Another workout crushed! Keep pushing your limits!",
  "⭐ You showed up and put in the work - that's what counts!",
  "🎯 Great job staying committed to your fitness goals!",
  "🌟 Every rep brings you closer to your best self!",
  "💫 You're building a stronger, healthier you!",
  "🏆 Champion mindset - showing up and giving it your all!",
  "⚡ Your dedication is inspiring - keep it up!",
];

// Format duration for the workout timer
const formatDuration = (startTime) => {
  if (!startTime) return '00:00';
  
  try {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    
    if (isNaN(diffMs)) {
      console.error('Invalid date format for workout duration');
      return '00:00';
    }
    
    const diffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;
    
    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:`;
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  } catch (error) {
    console.error('Error calculating workout duration:', error);
    return '00:00';
  }
};

const calculateDuration = (startTime, endTime) => {
  // Defensive check for missing startTime or endTime
  if (!startTime || !endTime) {
    return '0s';
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Validate that both dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid date format:', { startTime, endTime });
    return '0s';
  }
  
  const durationMs = end - start;
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

const ActiveWorkout = () => {
  const navigate = useNavigate();
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [activeWorkouts, setActiveWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('activeWorkouts');
      if (!saved) return [];
      
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing activeWorkouts from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('activeWorkouts');
      return [];
    }
  });
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [completedWorkoutIndex, setCompletedWorkoutIndex] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('workoutHistory');
      if (!saved) return [];
      
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing workoutHistory from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('workoutHistory');
      return [];
    }
  });
  const [exerciseList, setExerciseList] = useState([]);
  const [addExerciseDialog, setAddExerciseDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [timerTick, setTimerTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previousWorkouts, setPreviousWorkouts] = useState([]);

  useEffect(() => {
    // Fetch workout templates
    fetch('http://localhost:5000/api/workout-templates')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setWorkoutTemplates(data);
        } else {
          // Fallback to localStorage if no templates in MongoDB
          const savedTemplates = localStorage.getItem('workoutTemplates');
          if (savedTemplates) {
            setWorkoutTemplates(JSON.parse(savedTemplates));
          }
        }
      })
      .catch(err => {
        console.error('Error fetching workout templates:', err);
        // Fallback to localStorage
        const savedTemplates = localStorage.getItem('workoutTemplates');
        if (savedTemplates) {
          setWorkoutTemplates(JSON.parse(savedTemplates));
        }
      });

    // Fetch users
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
      
    // Fetch exercises
    fetch('http://localhost:5000/api/exercises')
      .then(res => res.json())
      .then(data => {
        setExerciseList(data);
        // If no exercises exist in the database, create default ones
        if (data.length === 0) {
          const defaultExercises = [
            { name: 'Bench Press', defaultReps: 8, category: 'Chest' },
            { name: 'Squat', defaultReps: 8, category: 'Legs' },
            { name: 'Deadlift', defaultReps: 8, category: 'Back' },
            { name: 'Shoulder Press', defaultReps: 8, category: 'Shoulders' },
            { name: 'Barbell Row', defaultReps: 8, category: 'Back' },
            { name: 'Pull Ups', defaultReps: 8, category: 'Back' },
            { name: 'Dips', defaultReps: 8, category: 'Chest' },
            { name: 'Bicep Curls', defaultReps: 12, category: 'Arms' },
            { name: 'Tricep Extensions', defaultReps: 12, category: 'Arms' },
            { name: 'Leg Press', defaultReps: 12, category: 'Legs' },
            { name: 'Calf Raises', defaultReps: 15, category: 'Legs' },
            { name: 'Lateral Raises', defaultReps: 15, category: 'Shoulders' },
            { name: 'Face Pulls', defaultReps: 15, category: 'Shoulders' },
          ];
          
          fetch('http://localhost:5000/api/exercises/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exercises: defaultExercises })
          })
            .then(res => res.json())
            .then(data => {
              setExerciseList(data);
              console.log('Default exercises created:', data);
            })
            .catch(err => console.error('Error creating default exercises:', err));
        }
      })
      .catch(err => console.error('Error fetching exercises:', err));
  }, []);

  // Update timer every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimerTick(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, []);

  // Save active workouts to localStorage whenever they change
  useEffect(() => {
    try {
      if (activeWorkouts.length > 0) {
        localStorage.setItem('activeWorkouts', JSON.stringify(activeWorkouts));
      } else {
        localStorage.removeItem('activeWorkouts');
      }
    } catch (error) {
      console.error('Error saving activeWorkouts to localStorage:', error);
    }
  }, [activeWorkouts]);

  // Function to remove an exercise from a workout
  const removeExercise = (workoutIndex, exerciseIndex) => {
    const updatedWorkouts = [...activeWorkouts];
    updatedWorkouts[workoutIndex].exercises.splice(exerciseIndex, 1);
    setActiveWorkouts(updatedWorkouts);
    
    // We don't need to save to localStorage here as the useEffect will handle it
    // This is different from the set-level functions where we need immediate saving
  };

  // Function to add a new exercise to a workout
  const addExercise = (workoutIndex) => {
    if (!selectedExercise) return;
    
    const exercise = exerciseList.find(e => e._id === selectedExercise);
    if (!exercise) return;

    const updatedWorkouts = [...activeWorkouts];
    const newExercise = {
      _id: exercise._id,
      name: exercise.name,
      category: exercise.category,
      sets: [{
        weight: '',
        reps: exercise.defaultReps,
        completed: false
      }]
    };

    updatedWorkouts[workoutIndex].exercises.push(newExercise);
    setActiveWorkouts(updatedWorkouts);
    setSelectedExercise('');
    setAddExerciseDialog(false);
  };

  // Component to render exercise sets
  const ExerciseSet = ({ exerciseIndex, exercise, workoutIndex }) => {
    // Local state for input values to prevent re-renders on every keystroke
    const [localInputValues, setLocalInputValues] = useState(() => {
      return exercise.sets.map(set => ({
        weight: set.weight,
        reps: set.reps
      }));
    });
    
    // Keep local state in sync with exercise sets when they change externally
    useEffect(() => {
      setLocalInputValues(exercise.sets.map(set => ({
        weight: set.weight,
        reps: set.reps
      })));
    }, [exercise.sets]);
    
    // Update local state without triggering global state update
    const handleInputChange = (setIndex, field, value) => {
      const newValues = [...localInputValues];
      newValues[setIndex][field] = value;
      setLocalInputValues(newValues);
    };
    
    // Only update global state on blur (when user finishes typing)
    const handleInputBlur = (setIndex, field) => {
      const value = localInputValues[setIndex][field];
      const updatedWorkouts = [...activeWorkouts];
      // Store the value as is without converting to Number to prevent empty strings
      // when value is 0 or when the field is cleared
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets[setIndex][field] = 
        value === '' ? '' : Number(value);
      setActiveWorkouts(updatedWorkouts);
      
      // Save to localStorage immediately to prevent data loss
      localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
    };
    
    // For completed status, update immediately
    const updateCompletedStatus = (setIndex, value) => {
      const updatedWorkouts = [...activeWorkouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets[setIndex].completed = value;
      setActiveWorkouts(updatedWorkouts);
      
      // Save to localStorage immediately
      localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
    };

    const addSet = () => {
      // Get values from the last set
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet = {
        weight: lastSet.weight, // Preserve the weight exactly as it is
        reps: lastSet.reps,
        completed: false
      };
      
      // Update global state
      const updatedWorkouts = [...activeWorkouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets.push(newSet);
      setActiveWorkouts(updatedWorkouts);
      
      // Save to localStorage immediately
      localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
      
      // Update local state - ensure we're using the exact same values
      setLocalInputValues([...localInputValues, {
        weight: newSet.weight,
        reps: newSet.reps
      }]);
    };

    const removeSet = (setIndex) => {
      if (exercise.sets.length <= 1) return;
      
      // Update global state
      const updatedWorkouts = [...activeWorkouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets.splice(setIndex, 1);
      setActiveWorkouts(updatedWorkouts);
      
      // Save to localStorage immediately
      localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
      
      // Update local state
      const newLocalValues = [...localInputValues];
      newLocalValues.splice(setIndex, 1);
      setLocalInputValues(newLocalValues);
    };

    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">{exercise.name}</Typography>
            {exercise.weightPreFilled && (
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 1, 
                  bgcolor: 'success.light', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                Pre-filled from history
              </Typography>
            )}
          </Box>
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => addSet()}
              sx={{ mr: 1 }}
            >
              Add Set
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => removeExercise(workoutIndex, exerciseIndex)}
            >
              Remove Exercise
            </Button>
          </Box>
        </Box>

        {exercise.sets.map((set, setIndex) => (
          <Box key={setIndex} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
            <Typography sx={{ minWidth: 60 }}>Set {setIndex + 1}</Typography>
            <TextField
              label="Weight"
              type="number"
              size="small"
              value={localInputValues[setIndex].weight}
              onChange={(e) => handleInputChange(setIndex, 'weight', e.target.value)}
              onBlur={() => handleInputBlur(setIndex, 'weight')}
              sx={{ width: 100 }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <TextField
              label="Reps"
              type="number"
              size="small"
              value={localInputValues[setIndex].reps}
              onChange={(e) => handleInputChange(setIndex, 'reps', e.target.value)}
              onBlur={() => handleInputBlur(setIndex, 'reps')}
              sx={{ width: 100 }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <Button
              variant={set.completed ? "contained" : "outlined"}
              color={set.completed ? "success" : "primary"}
              size="small"
              onClick={() => updateCompletedStatus(setIndex, !set.completed)}
            >
              {set.completed ? "Completed" : "Mark Complete"}
            </Button>
            {exercise.sets.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => removeSet(setIndex)}
              >
                Remove
              </Button>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Function to fetch previous workout data for a user
  const fetchPreviousWorkoutData = async (userId) => {
    console.log(`Fetching previous workout data for user: ${userId}`);
    try {
      setLoading(true);
      // Try to get from localStorage first for faster loading
      const cachedData = localStorage.getItem('completedWorkouts');
      console.log('Checking localStorage for cached workout data');
      
      if (cachedData) {
        console.log('Found cached workout data in localStorage');
        try {
          const parsedData = JSON.parse(cachedData);
          console.log(`Parsed ${parsedData.length} workouts from localStorage`);
          
          // Debug the structure of the first workout if available
          if (parsedData.length > 0) {
            console.log('First workout structure:', {
              id: parsedData[0]._id,
              templateName: parsedData[0].templateName,
              endTime: parsedData[0].endTime,
              exerciseCount: parsedData[0].exercises?.length || 0
            });
          }
          
          setPreviousWorkouts(parsedData);
          setLoading(false);
          
          // Show snackbar if we have workout data
          if (parsedData.length > 0) {
            // Check if any of the workouts have exercises with completed sets that have weights
            const hasRealWeights = parsedData.some(workout => 
              workout.exercises && workout.exercises.some(ex => 
                ex.sets && ex.sets.some(set => 
                  set.completed && set.weight !== null && set.weight !== ''
                )
              )
            );
            
            if (hasRealWeights) {
              console.log('Found real workout data with weights in localStorage!');
              setSnackbarMessage('Weights pre-filled from your previous workouts');
            } else {
              console.log('No real weights found in localStorage data');
              setSnackbarMessage('No previous weights found, using default values');
            }
            setSnackbarOpen(true);
          }
          
          return parsedData;
        } catch (parseError) {
          console.error('Error parsing cached workout data:', parseError);
          // If parsing fails, continue to fetch from API
        }
      } else {
        console.log('No cached workout data found in localStorage');
      }
      
      // If not in localStorage or parsing failed, fetch from API
      console.log(`Fetching workout data from API for user: ${userId}`);
      // The API doesn't use userId as a query param, it returns all workouts
      const response = await apiService.getCompletedWorkouts();
      
      let data = response.data;
      console.log(`Received ${data.length} total workouts from API`);
      
      // Filter workouts by user ID if provided
      if (userId) {
        data = data.filter(workout => {
          // Check if workout has user property with _id that matches userId
          return workout.user && workout.user._id === userId;
        });
        console.log(`Filtered to ${data.length} workouts for user ID: ${userId}`);
      }
      
      // Debug the structure of the first workout if available
      if (data.length > 0) {
        console.log('First workout structure from API:', {
          id: data[0]._id,
          templateName: data[0].templateName,
          endTime: data[0].endTime,
          exerciseCount: data[0].exercises?.length || 0,
          userId: data[0].user?._id || 'unknown',
          userName: data[0].user?.name || 'unknown'
        });
        
        // Log the first exercise and its sets if available
        if (data[0].exercises && data[0].exercises.length > 0) {
          const firstEx = data[0].exercises[0];
          console.log('First exercise details:', {
            name: firstEx.name,
            setsCount: firstEx.sets?.length || 0,
            firstSetWeight: firstEx.sets && firstEx.sets.length > 0 ? firstEx.sets[0].weight : 'none',
            hasCompletedSets: firstEx.sets ? firstEx.sets.some(set => set.completed) : false
          });
        }
      } else {
        console.log('No workout data found from API');
        // Return empty array instead of automatically loading sample data
        return [];
      }
      
      // Cache in localStorage for future use
      try {
        console.log('Caching workout data in localStorage');
        localStorage.setItem('completedWorkouts', JSON.stringify(data));
      } catch (storageError) {
        console.error('Error caching workout data in localStorage:', storageError);
        // Continue even if caching fails
      }
      
      setPreviousWorkouts(data);
      setLoading(false);
      
      // Show snackbar if we have workout data
      if (data.length > 0) {
        // Check if any of the workouts have exercises with completed sets that have weights
        const hasRealWeights = data.some(workout => 
          workout.exercises && workout.exercises.some(ex => 
            ex.sets && ex.sets.some(set => 
              set.completed && set.weight !== null && set.weight !== ''
            )
          )
        );
        
        if (hasRealWeights) {
          console.log('Found real workout data with weights!');
          setSnackbarMessage('Weights pre-filled from your previous workouts');
        } else {
          console.log('No real weights found in workout data');
          setSnackbarMessage('No previous weights found, using default values');
        }
        setSnackbarOpen(true);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching previous workout data:', error);
      setLoading(false);
      // Return empty array as fallback
      return [];
    }
  };

  // Function to get the most recent weights used for a specific exercise by a user
  const getLastUsedWeights = (previousWorkouts, exerciseName, targetSetsCount) => {
    console.log(`Getting weights for exercise: ${exerciseName}, target sets: ${targetSetsCount}`);
    console.log(`Previous workouts available: ${previousWorkouts.length}`);
    
    // Safety check for empty or invalid previousWorkouts
    if (!previousWorkouts || !Array.isArray(previousWorkouts) || previousWorkouts.length === 0) {
      console.log('No previous workouts available, returning empty weights');
      return Array(targetSetsCount).fill('');
    }
    
    // Sort workouts by date (newest first) if not already sorted
    const sortedWorkouts = [...previousWorkouts].sort((a, b) => {
      // Defensive check for missing endTime
      if (!a.endTime || !b.endTime) {
        console.log('Warning: Missing endTime in workout data');
        return 0;
      }
      return new Date(b.endTime) - new Date(a.endTime);
    });

    console.log(`Sorted ${sortedWorkouts.length} workouts by date`);
    
    // Find the most recent workout that contains this exercise
    for (const workout of sortedWorkouts) {
      console.log(`Checking workout: ${workout.templateName} from ${workout.endTime}`);
      
      // Defensive check for missing exercises array
      if (!workout.exercises || !Array.isArray(workout.exercises)) {
        console.log('Warning: Workout missing exercises array');
        continue;
      }
      
      const matchingExercise = workout.exercises.find(ex => {
        // Defensive check for missing exercise name
        if (!ex || !ex.name) {
          console.log('Warning: Exercise missing name');
          return false;
        }
        
        // Normalize both names for comparison (remove extra spaces, case insensitive)
        const normalizedExName = ex.name.toLowerCase().trim();
        const normalizedTargetName = exerciseName.toLowerCase().trim();
        
        console.log(`Comparing: '${normalizedExName}' with '${normalizedTargetName}'`);
        
        // Check for exact match or if the name contains the target name
        return normalizedExName === normalizedTargetName || 
               normalizedExName.includes(normalizedTargetName) || 
               normalizedTargetName.includes(normalizedExName);
      });

      if (matchingExercise) {
        console.log(`Found matching exercise: ${matchingExercise.name}`);
        console.log(`Workout source: ${workout._id === 'sample-workout-1' ? 'SAMPLE DATA' : 'Real data'}`);
      } else {
        console.log(`No matching exercise found in this workout`);
        continue;
      }

      if (matchingExercise && matchingExercise.sets && matchingExercise.sets.length > 0) {
        console.log(`Exercise has ${matchingExercise.sets.length} sets`);
        
        // Get weights from completed sets
        const completedSets = matchingExercise.sets.filter(set => set.completed);
        console.log(`Found ${completedSets.length} completed sets`);
        
        if (completedSets.length > 0) {
          // Map the completed sets to their weights, converting null to empty string
          const weights = completedSets.map(set => set.weight !== null ? set.weight : '');
          console.log(`Extracted weights from completed sets: ${JSON.stringify(weights)}`);
          
          // If we have fewer completed sets than target sets, repeat the last weight
          while (weights.length < targetSetsCount) {
            const lastWeight = weights[weights.length - 1] || '';
            weights.push(lastWeight);
          }
          
          // If we have more completed sets than target sets, trim the array
          const result = weights.slice(0, targetSetsCount);
          console.log(`Final weights to use: ${JSON.stringify(result)}`);
          return result;
        } else {
          // If no completed sets, use all sets
          const weights = matchingExercise.sets.map(set => set.weight !== null ? set.weight : '');
          console.log(`No completed sets, using all set weights: ${JSON.stringify(weights)}`);
          
          // Adjust array length to match target sets count
          while (weights.length < targetSetsCount) {
            const lastWeight = weights[weights.length - 1] || '';
            weights.push(lastWeight);
          }
          
          const result = weights.slice(0, targetSetsCount);
          console.log(`Final weights to use: ${JSON.stringify(result)}`);
          return result;
        }
      }
    }
    
    console.log('No suitable previous workout found, returning empty weights');
    // If no previous weights found, return array of empty strings
    return Array(targetSetsCount).fill('');
  };
  
  // Function to determine if weights were pre-filled
  const wereWeightsPrefilled = (weights) => {
    return weights.some(weight => weight !== '');
  };
  
  // Function to load sample completed workout data for testing
  const loadSampleCompletedWorkouts = () => {
    console.log('Loading sample completed workout data for testing');
    
    // Create sample completed workout with realistic data
    const sampleCompletedWorkouts = [
      {
        _id: 'sample-workout-1',
        templateId: 'template-1',
        templateName: 'Full Body Workout',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), // 1 hour after start
        userId: 'user-1',
        userName: 'Test User',
        exercises: [
          {
            _id: 'ex-1',
            name: 'Bench Press',
            category: 'Chest',
            sets: [
              { weight: '135', reps: 10, completed: true },
              { weight: '155', reps: 8, completed: true },
              { weight: '175', reps: 6, completed: true }
            ]
          },
          {
            _id: 'ex-2',
            name: 'Squat',
            category: 'Legs',
            sets: [
              { weight: '185', reps: 10, completed: true },
              { weight: '205', reps: 8, completed: true },
              { weight: '225', reps: 6, completed: true }
            ]
          },
          {
            _id: 'ex-3',
            name: 'Deadlift',
            category: 'Back',
            sets: [
              { weight: '225', reps: 10, completed: true },
              { weight: '275', reps: 8, completed: true },
              { weight: '315', reps: 5, completed: true }
            ]
          }
        ]
      }
    ];
    
    // Save to localStorage
    try {
      localStorage.setItem('completedWorkouts', JSON.stringify(sampleCompletedWorkouts));
      console.log('Sample completed workouts saved to localStorage');
      
      // Display the sample data in console
      console.log('SAMPLE DATA LOADED:', JSON.stringify(sampleCompletedWorkouts, null, 2));
      
      // Update state
      setPreviousWorkouts(sampleCompletedWorkouts);
      
      // Show confirmation
      setSnackbarMessage('Sample workout data loaded for testing');
      setSnackbarOpen(true);
      
      return sampleCompletedWorkouts;
    } catch (error) {
      console.error('Error saving sample workouts to localStorage:', error);
      return [];
    }
  };

  const startWorkout = async (template) => {
    // Make sure we have a valid template
    if (!template) {
      console.error('Invalid template provided to startWorkout');
      return;
    }
    
    // Set loading state
    setOpenTemplateDialog(false);
    setSaving(true);
    
    try {
      console.log('Starting workout with template:', template.name);
      console.log('Selected users:', selectedUsers.map(u => u.name || u._id));
      
      // Fetch previous workout data for each selected user
      const usersWithPreviousWorkouts = await Promise.all(
        selectedUsers.map(async (user) => {
          console.log(`Processing user: ${user.name || user._id}`);
          
          // Use the existing previousWorkouts state if available
          let userPreviousWorkouts = previousWorkouts;
          
          console.log(`Current previousWorkouts state has ${previousWorkouts.length} workouts`);
          
          // Always fetch real data first to ensure we're using the latest data
          console.log('Fetching real workout data for user:', user._id);
          const realWorkoutData = await fetchPreviousWorkoutData(user._id);
          
          // Check if the real data has any exercises with weights
          const hasRealWeights = realWorkoutData.some(workout => 
            workout.exercises && workout.exercises.some(ex => 
              ex.sets && ex.sets.some(set => 
                set.completed && set.weight !== null && set.weight !== ''
              )
            )
          );
          
          if (hasRealWeights) {
            console.log('Using real workout data with weights');
            userPreviousWorkouts = realWorkoutData;
          } else {
            console.log('No weights found in real data, checking if sample data is needed');
            
            // If we're using sample data already, keep using it
            if (previousWorkouts.length > 0 && previousWorkouts[0]?.userId === 'user-1') {
              console.log('Using existing sample data');
              userPreviousWorkouts = previousWorkouts;
            } else {
              console.log('Loading sample data as fallback');
              userPreviousWorkouts = loadSampleCompletedWorkouts();
            }
          }
          
          console.log(`Final workout data for user has ${userPreviousWorkouts.length} workouts`);
          return { user, previousWorkouts: userPreviousWorkouts };
        })
      );
      
      console.log(`Processed ${usersWithPreviousWorkouts.length} users with their workout data`);
      
      const currentTime = new Date().toISOString();
      const newWorkouts = usersWithPreviousWorkouts.map(({ user, previousWorkouts }) => ({
        templateId: template.id || template._id || 'unknown',
        templateName: template.name || 'Unnamed Workout',
        startTime: currentTime,
        userId: user?._id || 'unknown',
        userName: user?.name || 'Unknown User',
        userColor: user?.color || '#cccccc',
        exercises: template.exercises.map(exercise => {
          console.log(`Processing exercise: ${exercise.name}, sets: ${exercise.sets}, reps: ${exercise.reps}`);
          
          // Get the last used weights for this exercise by this user, for each set
          const targetSetsCount = exercise.sets || 1;
          console.log(`Target sets count: ${targetSetsCount}`);
          
          console.log(`Getting weights for ${exercise.name} from ${previousWorkouts.length} workouts`);
          console.log(`First workout source: ${previousWorkouts.length > 0 ? (previousWorkouts[0]._id === 'sample-workout-1' ? 'SAMPLE DATA' : 'Real data') : 'None'}`);
          
          // Log the first few workouts to help diagnose issues
          if (previousWorkouts.length > 0) {
            previousWorkouts.slice(0, 2).forEach((workout, idx) => {
              console.log(`Workout ${idx+1} info:`, {
                id: workout._id,
                name: workout.templateName,
                exercises: workout.exercises?.length || 0,
                source: workout._id === 'sample-workout-1' ? 'SAMPLE DATA' : 'Real data'
              });
            });
          }
          
          const lastUsedWeights = getLastUsedWeights(previousWorkouts, exercise.name, targetSetsCount);
          console.log(`Retrieved weights for ${exercise.name}: ${JSON.stringify(lastUsedWeights)}`);
          
          // Check if any weights were pre-filled
          const hasPreFilledWeights = wereWeightsPrefilled(lastUsedWeights);
          console.log(`Has pre-filled weights: ${hasPreFilledWeights}`);
          
          const exerciseObj = {
            _id: exercise._id || exercise.id,
            name: exercise.name,
            category: exercise.category || '',
            // Track if weights were pre-filled for UI indication
            weightPreFilled: hasPreFilledWeights,
            sets: Array(targetSetsCount).fill().map((_, index) => ({ 
              weight: lastUsedWeights[index] || '', 
              reps: exercise.reps, 
              completed: false 
            }))
          };
          
          console.log(`Created exercise object with ${exerciseObj.sets.length} sets`);
          console.log(`First set weight: ${exerciseObj.sets[0]?.weight || 'none'}`);
          
          return exerciseObj;
        })
      }));
      
      // Check if any exercises had pre-filled weights
      const hasPreFilledWeights = newWorkouts.some(workout => 
        workout.exercises.some(exercise => exercise.weightPreFilled)
      );
      
      if (hasPreFilledWeights) {
        setSnackbarMessage('Weights have been pre-filled based on your previous workouts');
        setSnackbarOpen(true);
      }
      
      console.log('Saving new workouts to localStorage (success path):', newWorkouts);
      
      // Save to localStorage
      try {
        localStorage.setItem('activeWorkouts', JSON.stringify(newWorkouts));
        console.log('Successfully saved workouts to localStorage');
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      setActiveWorkouts(newWorkouts);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error starting workout with pre-filled weights:', error);
      alert('There was an error loading previous workout data. Starting with empty weights.');
      
      // Fallback to starting without pre-filled weights
      const currentTime = new Date().toISOString();
      const newWorkouts = selectedUsers.map(user => ({
        templateId: template.id || template._id || 'unknown',
        templateName: template.name || 'Unnamed Workout',
        startTime: currentTime,
        userId: user?._id || 'unknown',
        userName: user?.name || 'Unknown User',
        userColor: user?.color || '#cccccc',
        exercises: template.exercises.map(exercise => ({
          _id: exercise._id || exercise.id,
          name: exercise.name,
          category: exercise.category || '',
          weightPreFilled: false,
          sets: Array(exercise.sets).fill().map(() => ({ weight: '', reps: exercise.reps, completed: false }))
        }))
      }));
      
      console.log('Saving new workouts to localStorage (error path):', newWorkouts);
      
      // Save to localStorage
      try {
        localStorage.setItem('activeWorkouts', JSON.stringify(newWorkouts));
        console.log('Successfully saved workouts to localStorage (error path)');
      } catch (error) {
        console.error('Error saving to localStorage (error path):', error);
      }
      
      setActiveWorkouts(newWorkouts);
      setSelectedUsers([]);
    } finally {
      setSaving(false);
    }
  };

  const [cancelConfirmDialog, setCancelConfirmDialog] = useState(false);
  const [workoutToCancel, setWorkoutToCancel] = useState(null);

  const confirmCancelWorkout = (workoutIndex) => {
    setWorkoutToCancel(workoutIndex);
    setCancelConfirmDialog(true);
  };

  const cancelWorkout = (workoutIndex) => {
    try {
      // Defensive check to ensure the workout exists
      if (workoutIndex === null || workoutIndex < 0 || workoutIndex >= activeWorkouts.length) {
        console.error('Cannot cancel workout: Invalid workout index', workoutIndex);
        return;
      }

      const remainingWorkouts = activeWorkouts.filter((_, i) => i !== workoutIndex);
      
      // Update state first
      setActiveWorkouts(remainingWorkouts);
      
      // Then update localStorage
      try {
        if (remainingWorkouts.length > 0) {
          localStorage.setItem('activeWorkouts', JSON.stringify(remainingWorkouts));
        } else {
          localStorage.removeItem('activeWorkouts');
        }
      } catch (error) {
        console.error('Error updating localStorage after canceling workout:', error);
      }
      
      // Show confirmation
      setSnackbarMessage('Workout canceled successfully');
      setSnackbarOpen(true);
      
      // Navigate away if no workouts left
      if (remainingWorkouts.length === 0) {
        navigate('/');
      }
    } finally {
      // Close dialog if open
      setCancelConfirmDialog(false);
      setWorkoutToCancel(null);
    }
  };

  const finishWorkout = async (workoutIndex) => {
    setSaving(true);
    
    // Defensive check to ensure the workout exists
    if (workoutIndex === null || workoutIndex < 0 || workoutIndex >= activeWorkouts.length || !activeWorkouts[workoutIndex]) {
      console.error('Workout not found at index:', workoutIndex);
      setSaving(false);
      return;
    }
    
    const completedWorkout = {
      ...activeWorkouts[workoutIndex],
      endTime: new Date().toISOString(),
      // Ensure startTime exists, or set it to now if missing
      startTime: activeWorkouts[workoutIndex].startTime || new Date().toISOString(),
      userId: activeWorkouts[workoutIndex].userId || 'unknown'
    };
    
    try {
      await apiService.createCompletedWorkout(completedWorkout);
      
      // Update workout history in localStorage
      try {
        const updatedHistory = [...workoutHistory, completedWorkout];
        localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));
        setWorkoutHistory(updatedHistory);
      } catch (error) {
        console.error('Error updating workout history in localStorage:', error);
        // Still update the state even if localStorage fails
        setWorkoutHistory(prev => [...prev, completedWorkout]);
      }
      
      // Store the index before showing the dialog
      setCompletedWorkoutIndex(workoutIndex);
      setCompletionDialog(true);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (activeWorkouts.length === 0) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ my: 4 }}>
          Active Workout
        </Typography>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          {users.length > 0 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setUserDialogOpen(true)}
              size="large"
            >
              Start New Workout
            </Button>
          ) : (
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              No users found. Please add users first.
            </Typography>
          )}
        </Paper>

        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
          <DialogTitle>Select Users (Max 2)</DialogTitle>
          <DialogContent>
            <List sx={{ minWidth: 360 }}>
              {users.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  onClick={() => setSelectedUsers(prev => {
                    const isSelected = prev.find(u => u._id === user._id);
                    if (isSelected) {
                      return prev.filter(u => u._id !== user._id);
                    } else if (prev.length < 2) {
                      return [...prev, user];
                    }
                    return prev;
                  })}
                  sx={{
                    borderLeft: 4,
                    borderColor: user.color,
                    bgcolor: selectedUsers.find(u => u._id === user._id) ? 'action.selected' : 'transparent',
                  }}
                >
                  <ListItemText primary={user.name} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (selectedUsers.length > 0) {
                  setUserDialogOpen(false);
                  setOpenTemplateDialog(true);
                }
              }}
              variant="contained"
              disabled={selectedUsers.length === 0}
            >
              Continue ({selectedUsers.length} selected)
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openTemplateDialog} onClose={() => !saving && setOpenTemplateDialog(false)}>
          <DialogTitle>Select Workout Template</DialogTitle>
          <DialogContent>
            {saving ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body1">Loading previous workout data...</Typography>
              </Box>
            ) : (
              <List sx={{ minWidth: 360 }}>
                {workoutTemplates.map((template) => (
                  <ListItem
                    key={template._id || template.id}
                    button
                    onClick={() => startWorkout(template)}
                  >
                    <ListItemText
                      primary={template.name}
                      secondary={`${template.exercises.length} exercises`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTemplateDialog(false)} disabled={saving}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Active Workout
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={loadSampleCompletedWorkouts}
            size="small"
            sx={{ mr: 1 }}
          >
            Load Sample Data
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => {
              localStorage.removeItem('completedWorkouts');
              setPreviousWorkouts([]);
              setSnackbarMessage('Cleared workout cache');
              setSnackbarOpen(true);
              console.log('Cleared localStorage workout cache');
            }}
            size="small"
          >
            Clear Cache
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Loading previous workout data...
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: 'row', flexWrap: 'wrap' }}>
        {activeWorkouts.map((workout, workoutIndex) => (
          <Paper 
            key={workoutIndex} 
            sx={{ 
              p: 3, 
              mb: 3, 
              flexBasis: activeWorkouts.length > 1 ? 'calc(50% - 24px)' : '100%',
              flexGrow: 1,
              borderLeft: '6px solid',
              borderColor: workout.userColor || '#cccccc',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: workout.userColor || '#cccccc',
                opacity: 0.05,
                pointerEvents: 'none',
                zIndex: 0
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: workout.userColor || '#cccccc',
                      flexShrink: 0
                    }} 
                  />
                  <Typography variant="h5" sx={{ wordBreak: 'break-word' }}>
                    {workout.templateName} - {workout.userName}
                  </Typography>
                </Box>
                {/* Display workout duration */}
                <Chip
                  icon={<TimerIcon />}
                  label={formatDuration(workout.startTime)}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'medium', alignSelf: 'flex-start' }}
                  key={`timer-${workoutIndex}-${timerTick}`}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setAddExerciseDialog(workoutIndex)}
                  size="small"
                >
                  Add Exercise
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => confirmCancelWorkout(workoutIndex)}
                  size="small"
                >
                  Cancel Workout
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => finishWorkout(workoutIndex)}
                  disabled={saving}
                  size="small"
                >
                  {saving && completedWorkoutIndex === workoutIndex ? 
                    <CircularProgress size={20} /> : 
                    'Finish Workout'
                  }
                </Button>
              </Box>
            </Box>

            {workout.exercises.map((exercise, exerciseIndex) => (
              <ExerciseSet
                key={exerciseIndex}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                workoutIndex={workoutIndex}
              />
            ))}
          </Paper>
        ))}
      </Box>

      {/* Cancel Workout Confirmation Dialog */}
      <Dialog
        open={cancelConfirmDialog}
        onClose={() => setCancelConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cancel Workout?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to cancel this workout? All progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmDialog(false)}>No, Keep Workout</Button>
          <Button 
            onClick={() => cancelWorkout(workoutToCancel)} 
            color="error" 
            variant="contained"
          >
            Yes, Cancel Workout
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addExerciseDialog !== false} onClose={() => setAddExerciseDialog(false)}>
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogContent>
          <List>
            {exerciseList.map((exercise) => (
              <ListItem key={exercise._id}>
                <ListItemText 
                  primary={exercise.name}
                  secondary={`Default: ${exercise.defaultReps} reps | ${exercise.category}`}
                />
                <Button
                  variant={selectedExercise === exercise._id ? "contained" : "outlined"}
                  onClick={() => setSelectedExercise(exercise._id)}
                >
                  {selectedExercise === exercise._id ? "Selected" : "Select"}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExerciseDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => addExercise(addExerciseDialog)} 
            variant="contained" 
            color="primary"
            disabled={!selectedExercise}
          >
            Add Exercise
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={completionDialog}
        onClose={() => {
          setCompletionDialog(false);
          
          // Only filter if completedWorkoutIndex is valid
          if (completedWorkoutIndex !== null && completedWorkoutIndex >= 0 && completedWorkoutIndex < activeWorkouts.length) {
            const remainingWorkouts = activeWorkouts.filter((_, i) => i !== completedWorkoutIndex);
            setActiveWorkouts(remainingWorkouts);
            
            if (remainingWorkouts.length === 0) {
              navigate('/');
            }
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Workout Complete! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
          </Typography>
          {completedWorkoutIndex !== null && activeWorkouts[completedWorkoutIndex] && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Duration: {calculateDuration(
                activeWorkouts[completedWorkoutIndex]?.startTime || new Date().toISOString(),
                new Date().toISOString()
              )}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCompletionDialog(false);
              
              // Only filter if completedWorkoutIndex is valid
              if (completedWorkoutIndex !== null && completedWorkoutIndex >= 0 && completedWorkoutIndex < activeWorkouts.length) {
                const remainingWorkouts = activeWorkouts.filter((_, i) => i !== completedWorkoutIndex);
                setActiveWorkouts(remainingWorkouts);
                
                // Explicitly clear localStorage if no workouts remain
                if (remainingWorkouts.length === 0) {
                  localStorage.removeItem('activeWorkouts');
                  navigate('/');
                } else {
                  // Update localStorage with remaining workouts
                  localStorage.setItem('activeWorkouts', JSON.stringify(remainingWorkouts));
                }
              }
            }}
            variant="contained"
            color="primary"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};







export default ActiveWorkout;
