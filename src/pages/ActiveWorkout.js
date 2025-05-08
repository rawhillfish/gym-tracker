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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WorkoutTimer from '../components/WorkoutTimer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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
  const [loading, setLoading] = useState(false);
  const [previousWorkouts, setPreviousWorkouts] = useState([]);

  useEffect(() => {
    // Clear localStorage to ensure we're using database data
    try {
      localStorage.removeItem('completedWorkouts');
      console.log('Cleared completedWorkouts from localStorage to ensure fresh data');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Fetch workout templates
    apiService.getWorkoutTemplates()
      .then(response => {
        if (response && Array.isArray(response)) {
          console.log('Workout templates response:', response);
          
          // Filter out templates that don't have exercises
          const validTemplates = response.filter(template => 
            template.exercises && Array.isArray(template.exercises) && template.exercises.length > 0
          );
          
          console.log(`Found ${validTemplates.length} valid workout templates`);
          
          // Sort templates by name
          const sortedTemplates = [...validTemplates].sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          
          setWorkoutTemplates(sortedTemplates);
          
          // Save to localStorage as backup
          localStorage.setItem('workoutTemplates', JSON.stringify(sortedTemplates));
        } else {
          console.error('Invalid response format from getWorkoutTemplates:', response);
          setWorkoutTemplates([]);
          
          // Try to load from localStorage as fallback
          const savedTemplates = localStorage.getItem('workoutTemplates');
          if (savedTemplates) {
            try {
              const parsedTemplates = JSON.parse(savedTemplates);
              setWorkoutTemplates(parsedTemplates);
            } catch (err) {
              console.error('Error parsing templates from localStorage:', err);
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching workout templates:', err);
        setWorkoutTemplates([]);
        
        // Try to load from localStorage as fallback
        const savedTemplates = localStorage.getItem('workoutTemplates');
        if (savedTemplates) {
          try {
            const parsedTemplates = JSON.parse(savedTemplates);
            setWorkoutTemplates(parsedTemplates);
          } catch (err) {
            console.error('Error parsing templates from localStorage:', err);
          }
        }
      });

    // Fetch users
    apiService.getUsers()
      .then(response => {
        // Handle different response formats
        let usersData = [];
        if (Array.isArray(response)) {
          usersData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          usersData = response.data;
        }
        
        // Filter out retired or deleted users
        const activeUsers = usersData.filter(user => !user.retired && !user.isDeleted);
        console.log(`Found ${activeUsers.length} active users out of ${usersData.length} total users`);
        setUsers(activeUsers);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setUsers([]);
      });
      
    // Fetch exercises
    apiService.getExercises()
      .then(response => {
        if (response && response.data) {
          setExerciseList(response.data);
          // If no exercises exist in the database, create default ones
          if (response.data.length === 0) {
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
            
            apiService.createExercisesBulk(defaultExercises)
              .then(response => {
                if (response && response.data) {
                  setExerciseList(response.data);
                  console.log('Default exercises created:', response.data);
                } else {
                  console.error('Invalid response format from createExercisesBulk:', response);
                }
              })
              .catch(err => console.error('Error creating default exercises:', err));
          }
        } else {
          console.error('Invalid response format from getExercises:', response);
          setExerciseList([]);
        }
      })
      .catch(err => {
        console.error('Error fetching exercises:', err);
        setExerciseList([]);
      });
  }, []);

  useEffect(() => {
    // Save active workouts to localStorage whenever they change
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

  // Helper function to find template ID by name
  const findTemplateIdByName = (templateName) => {
    if (!workoutTemplates || !Array.isArray(workoutTemplates)) {
      console.log('No workout templates available for lookup');
      return null;
    }
    
    const template = workoutTemplates.find(t => t.name === templateName);
    if (template && template._id) {
      console.log(`Found template ID for ${templateName}: ${template._id}`);
      return template._id;
    }
    
    console.log(`No template found with name: ${templateName}`);
    return null;
  };
  
  // Helper function to find exercise ID by name within a template
  const findExerciseIdByName = (templateName, exerciseName) => {
    if (!workoutTemplates || !Array.isArray(workoutTemplates)) {
      console.log('No workout templates available for lookup');
      return null;
    }
    
    const template = workoutTemplates.find(t => t.name === templateName);
    if (!template || !template.exercises || !Array.isArray(template.exercises)) {
      console.log(`No exercises found for template: ${templateName}`);
      return null;
    }
    
    const exercise = template.exercises.find(e => e.name === exerciseName);
    if (exercise && exercise._id) {
      console.log(`Found exercise ID for ${exerciseName} in template ${templateName}: ${exercise._id}`);
      return exercise._id;
    }
    
    console.log(`No exercise found with name: ${exerciseName} in template ${templateName}`);
    return null;
  };

  // Function to get the most recent weights used for a specific exercise by a user
  const getLastUsedWeights = (previousWorkouts, exercise, targetSetsCount, template) => {
    // Find the template ID and exercise ID
    const templateId = findTemplateIdByName(template.name);
    const exerciseId = findExerciseIdByName(template.name, exercise.name);
    
    console.log(`Looking for previous weights for exercise: ${exercise.name} (ID: ${exerciseId}) in template: ${template.name} (ID: ${templateId})`);
    
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
    
    // Only find workouts with the matching template ID
    const matchingWorkouts = sortedWorkouts.filter(workout => {
      const workoutTemplateId = workout.templateId ? workout.templateId.toString() : '';
      const currentTemplateId = templateId ? templateId.toString() : '';
      
      console.log(`Comparing workout templateId: '${workoutTemplateId}' with current templateId: '${currentTemplateId}'`);
      console.log(`Types: workout templateId (${typeof workoutTemplateId}), current templateId (${typeof currentTemplateId})`);
      
      // Compare as strings
      let hasMatchingId = workoutTemplateId && currentTemplateId && workoutTemplateId === currentTemplateId;
      
      return hasMatchingId;
    });
    
    if (matchingWorkouts.length === 0) {
      console.log(`No template ID match found for ID: ${templateId}, not pre-filling weights`);
      return Array(targetSetsCount).fill('');
    }
    
    console.log(`Found ${matchingWorkouts.length} workouts with matching template ID`);
    return findWeightsInWorkouts(matchingWorkouts, exerciseId, exercise.name, targetSetsCount);
  };
  
  // Helper function to find weights in workouts
  const findWeightsInWorkouts = (workouts, exerciseId, exerciseName, targetSetsCount) => {
    // Find the most recent workout that contains this exercise
    for (const workout of workouts) {
      console.log(`\nChecking workout: ${workout.templateName} (ID: ${workout.templateId}) from ${workout.endTime}`);
      console.log(`Workout exercises: ${workout.exercises ? workout.exercises.length : 0}`);
      
      // Defensive check for missing exercises array
      if (!workout.exercises || !Array.isArray(workout.exercises)) {
        console.log('Warning: Workout missing exercises array');
        continue;
      }
      
      // Log all exercises in this workout for debugging
      workout.exercises.forEach((ex, index) => {
        const exId = ex.exerciseId || ex._id || ex.id;
        console.log(`Workout exercise ${index + 1}: Name: ${ex.name}, ID: ${exId || 'unknown'}`);
      });
      
      // First try to match by exercise ID
      console.log(`\nTrying to match exercise by ID: ${exerciseId}`);
      let matchingExercise = workout.exercises.find(ex => {
        if (!ex) return false;
        
        // Check all possible ID fields - prioritize exerciseId
        const exId = ex.exerciseId || ex._id || ex.id;
        console.log(`Comparing exercise IDs: '${exId}' with '${exerciseId}'`);
        console.log(`Types: exercise ID (${typeof exId}), target ID (${typeof exerciseId})`);
        
        // Try different comparison methods
        let exactMatch = exId === exerciseId;
        let stringMatch = exId && exerciseId && exId.toString() === exerciseId.toString();
        
        return exactMatch || stringMatch;
      });
      
      // If no ID match, fall back to name matching
      if (!matchingExercise) {
        console.log(`\nNo exercise ID match found, trying name matching`);
        
        matchingExercise = workout.exercises.find(ex => {
          // Defensive check for missing exercise name
          if (!ex || !ex.name) {
            console.log('Warning: Exercise missing name');
            return false;
          }
          
          // Normalize both names for comparison (remove extra spaces, case insensitive)
          const normalizedExName = ex.name.toLowerCase().trim();
          const normalizedTargetName = exerciseName.toLowerCase().trim();
          
          console.log(`Comparing names: '${normalizedExName}' with '${normalizedTargetName}'`);
          
          // Check for exact match or if the name contains the target name
          const exactNameMatch = normalizedExName === normalizedTargetName;
          const exIncludesTarget = normalizedExName.includes(normalizedTargetName);
          const targetIncludesEx = normalizedTargetName.includes(normalizedExName);
          const isMatch = exactNameMatch || exIncludesTarget || targetIncludesEx;
                 
          return isMatch;
        });
      }

      if (matchingExercise) {
        console.log(`\nFound matching exercise: ${matchingExercise.name}`);
        console.log(`Workout source: ${workout._id === 'sample-workout-1' ? 'SAMPLE DATA' : 'Real data'}`);
      } else {
        console.log(`\nNo matching exercise found in this workout`);
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
          console.log(`=== END WEIGHT PRE-FILLING DEBUG ===`);
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
          console.log(`=== END WEIGHT PRE-FILLING DEBUG ===`);
          return result;
        }
      }
    }
    
    console.log('No suitable previous workout found, returning empty weights');
    console.log(`=== END WEIGHT PRE-FILLING DEBUG ===`);
    // If no previous weights found, return array of empty strings
    return Array(targetSetsCount).fill('');
  };
  
  // Function to determine if weights were pre-filled
  const wereWeightsPrefilled = (weights) => {
    // Check if any weight is not empty and not zero
    return weights.some(weight => weight !== '' && weight !== '0' && weight !== 0);
  };

  // Function to start a workout with pre-filled weights
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
      
      // Log the exact template object to see what's available
      console.log('Raw template object:', JSON.stringify(template, null, 2));
      
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
            console.log('No weights found in real data, no sample data will be used');
            
            userPreviousWorkouts = [];
          }
          
          console.log(`Final workout data for user has ${userPreviousWorkouts.length} workouts`);
          return { user, previousWorkouts: userPreviousWorkouts };
        })
      );
      
      console.log(`Processed ${usersWithPreviousWorkouts.length} users with their workout data`);
      
      console.log('Template info:', {
        name: template.name,
        id: template.id,
        _id: template._id,
        exercises: template.exercises?.length || 0
      });
      
      const currentTime = new Date().toISOString();
      const newWorkouts = usersWithPreviousWorkouts.map(({ user, previousWorkouts }) => {
        const workout = {
          id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: template._id,
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
            
            // Get weights from the same template
            const lastUsedWeights = getLastUsedWeights(previousWorkouts, exercise, targetSetsCount, template);
            console.log(`Retrieved weights for ${exercise.name}: ${JSON.stringify(lastUsedWeights)}`);
            
            // Check if any weights were pre-filled
            const hasPreFilledWeights = wereWeightsPrefilled(lastUsedWeights);
            console.log(`Has pre-filled weights: ${hasPreFilledWeights}`);
            
            const exerciseObj = {
              name: exercise.name,
              category: exercise.category || '',
              exerciseId: exercise.exerciseId,
              // Track if weights were pre-filled for UI indication
              weightPreFilled: hasPreFilledWeights,
              sets: Array(targetSetsCount).fill().map((_, index) => ({ 
                weight: lastUsedWeights[index] || '', 
                reps: exercise.reps, 
                completed: false 
              }))
            };
            
            console.log(`Created exercise object with ${exerciseObj.sets.length} sets`);
            console.log(`Exercise ID: ${exerciseObj.exerciseId}, First set weight: ${exerciseObj.sets[0]?.weight || 'none'}`);
            
            return exerciseObj;
          })
        };
        
        return workout;
      });
      
      // Check if any exercises had pre-filled weights
      const anyWorkoutHasPreFilledWeights = newWorkouts.some(workout => 
        workout.exercises.some(exercise => exercise.weightPreFilled)
      );
      
      if (anyWorkoutHasPreFilledWeights) {
        setSnackbarMessage('Weights have been pre-filled based on your previous workouts of the same template');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('No previous weights found for this template, using empty values');
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
      const newWorkouts = selectedUsers.map(user => {
        return {
          id: `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: template._id,
          templateName: template.name || 'Unnamed Workout',
          startTime: currentTime,
          userId: user?._id || 'unknown',
          userName: user?.name || 'Unknown User',
          userColor: user?.color || '#cccccc',
          exercises: template.exercises.map(exercise => {
            return {
              name: exercise.name,
              category: exercise.category || '',
              exerciseId: exercise.exerciseId,
              weightPreFilled: false,
              sets: Array(exercise.sets).fill().map(() => ({ weight: '', reps: exercise.reps, completed: false }))
            };
          })
        };
      });
      
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
        navigate('/dashboard');
      }
    } finally {
      // Close dialog if open
      setCancelConfirmDialog(false);
      setWorkoutToCancel(null);
    }
  };

  const finishWorkout = async (workoutId) => {
    console.log(`Finishing workout: ${workoutId}`);
    
    // Find the workout to complete
    const workoutToComplete = activeWorkouts.find(w => w.id === workoutId);
    
    if (!workoutToComplete) {
      console.error(`Workout with ID ${workoutId} not found`);
      setSnackbarMessage('Error: Workout not found');
      setSnackbarOpen(true);
      return;
    }
    
    // Set the end time to now
    workoutToComplete.endTime = new Date().toISOString();
    
    console.log('Workout to complete:', {
      templateName: workoutToComplete.templateName,
      templateId: workoutToComplete.templateId,
      userId: workoutToComplete.userId,
      userName: workoutToComplete.userName,
      userColor: workoutToComplete.userColor,
      exercises: workoutToComplete.exercises?.map(ex => ({
        name: ex.name, 
        id: ex.id || ex._id, 
        exerciseId: ex.exerciseId
      }))
    });
    
    // Ensure templateId is set
    if (!workoutToComplete.templateId) {
      const templateId = findTemplateIdByName(workoutToComplete.templateName);
      if (templateId) {
        workoutToComplete.templateId = templateId;
        console.log(`Setting templateId for ${workoutToComplete.templateName}: ${templateId}`);
      }
    }
    
    // Ensure exerciseId is set for each exercise
    if (workoutToComplete.exercises && Array.isArray(workoutToComplete.exercises)) {
      workoutToComplete.exercises.forEach(exercise => {
        if (!exercise.exerciseId && exercise.id) {
          exercise.exerciseId = exercise.id;
          console.log(`Setting exerciseId from id for ${exercise.name}: ${exercise.exerciseId}`);
        }
        
        // Special case for Leg Day exercises
        if (!exercise.exerciseId && workoutToComplete.templateName === 'Leg Day') {
          const exerciseId = findExerciseIdByName(workoutToComplete.templateName, exercise.name);
          if (exerciseId) {
            exercise.exerciseId = exerciseId;
            console.log(`Setting exerciseId for ${exercise.name}: ${exerciseId}`);
          }
        }
      });
    }
    
    try {
      // Create a deep copy of the workout to avoid modifying the original
      const workoutCopy = JSON.parse(JSON.stringify(workoutToComplete));
      
      // Save to database
      console.log('Saving completed workout to database');
      const response = await apiService.createCompletedWorkout(workoutCopy);
      console.log('Workout saved successfully:', response.data);
      
      // Update local state - only remove the completed workout
      const updatedWorkouts = activeWorkouts.filter(w => w.id !== workoutId);
      setActiveWorkouts(updatedWorkouts);
      
      // Update localStorage - only remove the completed workout
      try {
        localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
        console.log('Updated active workouts in localStorage');
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
      
      // Clear completedWorkouts from localStorage to force refresh from database
      try {
        localStorage.removeItem('completedWorkouts');
        console.log('Cleared completedWorkouts from localStorage to ensure fresh data on next load');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Show success message with user name
      setSnackbarMessage(`Workout for ${workoutToComplete.userName || 'user'} completed and saved!`);
      setSnackbarOpen(true);
      
      // Only navigate away if no workouts left
      if (updatedWorkouts.length === 0) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      setSnackbarMessage('Error saving workout. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Function to fetch previous workout data for a user
  const fetchPreviousWorkoutData = async (userId) => {
    console.log(`Fetching previous workout data for user: ${userId}`);
    try {
      setLoading(true);
      
      // Fetch from API first to get the most up-to-date data
      console.log(`Fetching workout data from API for user: ${userId}`);
      const response = await apiService.getCompletedWorkouts();
      
      let data = response.data;
      console.log(`Received ${data.length} total workouts from API`);
      
      // Filter workouts by user ID if provided
      if (userId) {
        data = data.filter(workout => {
          // Check if workout has user property with _id that matches userId
          return workout.user && 
                 ((typeof workout.user === 'object' && workout.user._id === userId) || 
                  (typeof workout.user === 'string' && workout.user === userId));
        });
        console.log(`Filtered to ${data.length} workouts for user ${userId}`);
      }
      
      if (data.length === 0) {
        console.log('No workout data found in database');
        
        // Try to get from localStorage as fallback
        const cachedData = localStorage.getItem('completedWorkouts');
        
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
              setSnackbarMessage('Using cached workout data (no database data found)');
              setSnackbarOpen(true);
            }
            
            return parsedData;
          } catch (parseError) {
            console.error('Error parsing cached workout data:', parseError);
            // If parsing fails, return empty array
            setPreviousWorkouts([]);
            setLoading(false);
            return [];
          }
        } else {
          console.log('No cached workout data found in localStorage');
          setPreviousWorkouts([]);
          setLoading(false);
          return [];
        }
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
        setSnackbarMessage('Previous workout data loaded from database');
        setSnackbarOpen(true);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching workout data:', error);
      setLoading(false);
      
      // Try to get from localStorage as fallback on API error
      const cachedData = localStorage.getItem('completedWorkouts');
      
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          console.log(`Using ${parsedData.length} cached workouts due to API error`);
          setPreviousWorkouts(parsedData);
          setSnackbarMessage('Using cached workout data (API error)');
          setSnackbarOpen(true);
          return parsedData;
        } catch (parseError) {
          console.error('Error parsing cached workout data:', parseError);
        }
      }
      
      // If all else fails, return empty array
      setPreviousWorkouts([]);
      return [];
    }
  };

  // Function to add a new exercise to a workout
  const addExerciseToWorkout = () => {
    if (!selectedExercise || addExerciseDialog === false) {
      setAddExerciseDialog(false);
      return;
    }
    
    const workoutIndex = addExerciseDialog;
    const exercise = exerciseList && exerciseList.find(ex => ex._id === selectedExercise);
    
    if (!exercise) {
      console.error('Selected exercise not found:', selectedExercise);
      setAddExerciseDialog(false);
      return;
    }
    
    const newWorkouts = [...activeWorkouts];
    const workout = newWorkouts[workoutIndex];
    
    if (!workout) {
      console.error('Workout not found at index:', workoutIndex);
      setAddExerciseDialog(false);
      return;
    }
    
    // Add the exercise to the workout
    workout.exercises.push({
      exerciseId: exercise._id,
      name: exercise.name,
      category: exercise.category,
      sets: [{
        reps: exercise.defaultReps || 8,
        weight: 0,
        completed: false
      }]
    });
    
    setActiveWorkouts(newWorkouts);
    setAddExerciseDialog(false);
    setSelectedExercise('');
  };

  // Function to remove an exercise from a workout
  const removeExercise = (workoutIndex, exerciseIndex) => {
    const updatedWorkouts = [...activeWorkouts];
    updatedWorkouts[workoutIndex].exercises.splice(exerciseIndex, 1);
    setActiveWorkouts(updatedWorkouts);
    
    // We don't need to save to localStorage here as the useEffect will handle it
    // This is different from the set-level functions where we need immediate saving
  };

  // Function to move an exercise up in the order
  const moveExerciseUp = (workoutIndex, exerciseIndex) => {
    if (exerciseIndex === 0) return; // Already at the top
    
    const updatedWorkouts = [...activeWorkouts];
    const exercises = updatedWorkouts[workoutIndex].exercises;
    
    // Swap the exercise with the one above it
    [exercises[exerciseIndex], exercises[exerciseIndex - 1]] = 
    [exercises[exerciseIndex - 1], exercises[exerciseIndex]];
    
    setActiveWorkouts(updatedWorkouts);
    
    // Save to localStorage
    localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
  };
  
  // Function to move an exercise down in the order
  const moveExerciseDown = (workoutIndex, exerciseIndex) => {
    const updatedWorkouts = [...activeWorkouts];
    const exercises = updatedWorkouts[workoutIndex].exercises;
    
    if (exerciseIndex === exercises.length - 1) return; // Already at the bottom
    
    // Swap the exercise with the one below it
    [exercises[exerciseIndex], exercises[exerciseIndex + 1]] = 
    [exercises[exerciseIndex + 1], exercises[exerciseIndex]];
    
    setActiveWorkouts(updatedWorkouts);
    
    // Save to localStorage
    localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
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
      console.log(`Updating completed status for set ${setIndex} to ${value}`);
      
      const updatedWorkouts = [...activeWorkouts];
      updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets[setIndex].completed = value;
      
      // Log the updated set
      const updatedSet = updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets[setIndex];
      console.log(`Updated set: weight=${updatedSet.weight}, reps=${updatedSet.reps}, completed=${updatedSet.completed}`);
      
      setActiveWorkouts(updatedWorkouts);
      
      // Save to localStorage immediately
      localStorage.setItem('activeWorkouts', JSON.stringify(updatedWorkouts));
      
      // Count completed sets
      const completedSets = updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets.filter(s => s.completed).length;
      console.log(`Exercise now has ${completedSets} completed sets out of ${updatedWorkouts[workoutIndex].exercises[exerciseIndex].sets.length} total sets`);
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
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Tooltip title="Remove Exercise">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                  startIcon={<RemoveCircleOutlineIcon />}
                  sx={{ mr: 2, flexShrink: 0 }}
                >
                  {/* Empty button text, using icon only */}
                </Button>
              </Tooltip>
              <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {exercise.name}
                {exercise.weightPreFilled && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'inline-block',
                      bgcolor: 'success.light', 
                      color: 'white', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      ml: 1,
                      flexShrink: 0
                    }}
                  >
                    Pre-filled from history
                  </Typography>
                )}
              </Typography>
              <Box sx={{ display: 'flex', ml: 2, flexShrink: 0 }}>
                <Tooltip title="Move Up">
                  <span> {/* Wrapper to handle disabled state with tooltip */}
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => moveExerciseUp(workoutIndex, exerciseIndex)}
                      disabled={exerciseIndex === 0}
                      sx={{ mr: 1 }}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move Down">
                  <span> {/* Wrapper to handle disabled state with tooltip */}
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => moveExerciseDown(workoutIndex, exerciseIndex)}
                      disabled={exerciseIndex === activeWorkouts[workoutIndex].exercises.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        {exercise.sets.map((set, setIndex) => (
          <Box key={setIndex} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
            {exercise.sets.length > 1 && (
              <Tooltip title="Remove Set">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => removeSet(setIndex)}
                  startIcon={<DeleteOutlineIcon />}
                >
                  {/* Empty button text, using icon only */}
                </Button>
              </Tooltip>
            )}
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
            <Tooltip title={set.completed ? "Mark Incomplete" : "Mark Complete"}>
              <Button
                variant={set.completed ? "contained" : "outlined"}
                color={set.completed ? "success" : "primary"}
                size="small"
                onClick={() => updateCompletedStatus(setIndex, !set.completed)}
                startIcon={set.completed ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              >
                {/* Empty button text, using icon only */}
              </Button>
            </Tooltip>
          </Box>
        ))}
        
        {/* Add Set button below the last set */}
        <Box sx={{ display: 'flex', mt: 2, mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => addSet()}
            sx={{ mr: 1 }}
          >
            Add Set
          </Button>
        </Box>
      </Box>
    );
  };

  if (activeWorkouts.length === 0) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ my: 4 }}>
          Active Workout
        </Typography>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          {users && users.length > 0 ? (
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
              {users && users.map((user) => (
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
            ) : workoutTemplates.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No workout templates found. Please create a template first.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setOpenTemplateDialog(false);
                    navigate('/workout-builder');
                  }}
                >
                  Create Template
                </Button>
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
                      secondary={`${template.exercises?.length || 0} exercises`}
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

  const openAddExerciseDialog = (workoutIndex) => {
    setSelectedExercise('');
    setAddExerciseDialog(workoutIndex);
  };

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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: workout.userColor, mb: 2, textAlign: 'center' }}>
                Workout: {workout.templateName} - {workout.userName}
              </Typography>
              <Box sx={{ my: 4 }}>
                <WorkoutTimer 
                  startTime={workout.startTime} 
                  sx={{ transform: 'scale(2)', transformOrigin: 'center' }}
                />
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="medium"
                onClick={() => confirmCancelWorkout(workoutIndex)}
              >
                Cancel Workout
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => openAddExerciseDialog(workoutIndex)}
              >
                Add Exercise
              </Button>
            </Box>

            {workout.exercises.map((exercise, exerciseIndex) => (
              <ExerciseSet
                key={exerciseIndex}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                workoutIndex={workoutIndex}
              />
            ))}
            
            {/* Add Exercise button above Finish Workout */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                size="medium"
                onClick={() => openAddExerciseDialog(workoutIndex)}
                sx={{ minWidth: '200px', mb: 2 }}
              >
                Add Exercise
              </Button>
            </Box>
            
            {/* Finish Workout button at the bottom */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => finishWorkout(workout.id)}
                disabled={saving}
                sx={{ minWidth: '200px' }}
              >
                Finish Workout
              </Button>
            </Box>
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
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="exercise-select-label">Exercise</InputLabel>
            <Select
              labelId="exercise-select-label"
              id="exercise-select"
              value={selectedExercise}
              label="Exercise"
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              {exerciseList && exerciseList.map((exercise) => (
                <MenuItem key={exercise._id} value={exercise._id}>
                  {exercise.name} ({exercise.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExerciseDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => addExerciseToWorkout()} 
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
            Workout Complete! 
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
