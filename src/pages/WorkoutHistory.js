import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Snackbar,
  Alert,
  ListItemText,
  Chip,
  OutlinedInput,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  LinearProgress,
  FormControlLabel,
  Avatar,
  ListSubheader
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import { 
  format, 
  parseISO, 
  isSameDay, 
  isWithinInterval, 
  subDays, 
  addDays 
} from 'date-fns'; 
import { saveAs } from 'file-saver';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../styles/calendar.css";
import "../styles/enhanced-calendar.css";
import "../styles/datepicker.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';

const EditWorkoutForm = ({ workout, onSave, onCancel }) => {
  const [formState, setFormState] = useState({
    ...workout, // Keep all original properties
    templateName: workout.templateName,
    exercises: workout.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => ({ ...set }))
    }))
  });
  const [availableExercises, setAvailableExercises] = useState([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);

  // Fetch available exercises for adding new ones
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        console.log('Fetching exercises...');
        const exercises = await apiService.getExercises();
        console.log('Fetched exercises:', exercises);
        setAvailableExercises(exercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };
    fetchExercises();
  }, []);

  // Group exercises by category
  const exercisesByCategory = useMemo(() => {
    const grouped = {};
    
    availableExercises.forEach(exercise => {
      const category = exercise.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(exercise);
    });
    
    // Sort categories alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc, category) => {
        acc[category] = grouped[category].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        return acc;
      }, {});
  }, [availableExercises]);

  // Handle input changes efficiently
  const handleInputChange = (exerciseIndex, setIndex, field, value) => {
    setFormState(prev => {
      const newState = { ...prev };
      newState.exercises[exerciseIndex].sets[setIndex][field] = value;
      return newState;
    });
  };

  // Toggle set completion
  const handleToggleCompletion = (exerciseIndex, setIndex) => {
    setFormState(prev => {
      const newState = { ...prev };
      newState.exercises[exerciseIndex].sets[setIndex].completed = 
        !newState.exercises[exerciseIndex].sets[setIndex].completed;
      return newState;
    });
  };

  // Add a new set to an exercise
  const handleAddSet = (exerciseIndex) => {
    setFormState(prev => {
      const newState = { ...prev };
      newState.exercises[exerciseIndex].sets.push({
        weight: 0,
        reps: 0,
        completed: true,
        id: Date.now()
      });
      return newState;
    });
  };

  // Remove a set from an exercise
  const handleRemoveSet = (exerciseIndex, setIndex) => {
    setFormState(prev => {
      const newState = { ...prev };
      newState.exercises[exerciseIndex].sets.splice(setIndex, 1);
      return newState;
    });
  };

  // Update workout name
  const handleNameChange = (e) => {
    setFormState(prev => ({
      ...prev,
      templateName: e.target.value
    }));
  };

  // Remove an exercise
  const handleRemoveExercise = (exerciseIndex) => {
    setFormState(prev => {
      const newState = { ...prev };
      newState.exercises.splice(exerciseIndex, 1);
      return newState;
    });
  };

  // Move exercise up in order
  const handleMoveExerciseUp = (exerciseIndex) => {
    if (exerciseIndex === 0) return; // Already at the top
    
    setFormState(prev => {
      const newState = { ...prev };
      const temp = newState.exercises[exerciseIndex];
      newState.exercises[exerciseIndex] = newState.exercises[exerciseIndex - 1];
      newState.exercises[exerciseIndex - 1] = temp;
      return newState;
    });
  };

  // Move exercise down in order
  const handleMoveExerciseDown = (exerciseIndex) => {
    setFormState(prev => {
      if (exerciseIndex === prev.exercises.length - 1) return prev; // Already at the bottom
      
      const newState = { ...prev };
      const temp = newState.exercises[exerciseIndex];
      newState.exercises[exerciseIndex] = newState.exercises[exerciseIndex + 1];
      newState.exercises[exerciseIndex + 1] = temp;
      return newState;
    });
  };

  // Add a new exercise from the available exercises
  const handleAddExercise = () => {
    if (!newExerciseName) return;
    
    const selectedExercise = availableExercises.find(ex => ex.name === newExerciseName);
    if (!selectedExercise) return;
    
    setFormState(prev => {
      const newState = { ...prev };
      newState.exercises.push({
        name: selectedExercise.name,
        id: Date.now().toString(),
        sets: [{
          weight: 0,
          reps: 0,
          completed: true,
          id: Date.now() + 1
        }]
      });
      return newState;
    });
    
    setNewExerciseName('');
    setShowAddExerciseForm(false);
  };

  // Save changes
  const handleSave = () => {
    onSave(formState);
  };

  return (
    <>
      <DialogTitle>
        Edit Workout
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Workout Name"
            value={formState.templateName}
            onChange={handleNameChange}
            sx={{ mb: 3 }}
          />
          
          {formState.exercises.map((exercise, exerciseIndex) => (
            <Box key={exercise.id || exerciseIndex} sx={{ mb: 4, position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {exercise.name}
                </Typography>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => handleMoveExerciseUp(exerciseIndex)}
                    disabled={exerciseIndex === 0}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleMoveExerciseDown(exerciseIndex)}
                    disabled={exerciseIndex === formState.exercises.length - 1}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveExercise(exerciseIndex)}
                    disabled={formState.exercises.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Set</TableCell>
                      <TableCell align="right">Weight (kg)</TableCell>
                      <TableCell align="right">Reps</TableCell>
                      <TableCell align="right">Completed</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exercise.sets.map((set, setIndex) => (
                      <TableRow 
                        key={set.id || setIndex}
                        sx={{
                          backgroundColor: set.completed ? 'inherit' : 'action.hover',
                          opacity: set.completed ? 1 : 0.7
                        }}
                      >
                        <TableCell>{setIndex + 1}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleInputChange(
                              exerciseIndex, 
                              setIndex, 
                              'weight', 
                              Number(e.target.value)
                            )}
                            size="small"
                            inputProps={{ 
                              style: { textAlign: 'right' },
                              min: 0,
                              max: 1000,
                              step: 2.5
                            }}
                            sx={{ width: '80px' }}
                            disabled={!set.completed}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleInputChange(
                              exerciseIndex, 
                              setIndex, 
                              'reps', 
                              Number(e.target.value)
                            )}
                            size="small"
                            inputProps={{ 
                              style: { textAlign: 'right' },
                              min: 0,
                              max: 100,
                              step: 1
                            }}
                            sx={{ width: '70px' }}
                            disabled={!set.completed}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Checkbox
                            checked={set.completed}
                            onChange={() => handleToggleCompletion(exerciseIndex, setIndex)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                            disabled={exercise.sets.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleAddSet(exerciseIndex)}
                sx={{ mt: 1 }}
              >
                Add Set
              </Button>
            </Box>
          ))}
          
          {showAddExerciseForm ? (
            <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add New Exercise
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="new-exercise-label">Exercise</InputLabel>
                <Select
                  labelId="new-exercise-label"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  label="Exercise"
                >
                  {Object.entries(exercisesByCategory).map(([category, exercises]) => [
                    <ListSubheader key={category} sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>
                      {category}
                    </ListSubheader>,
                    ...exercises.map((exercise) => (
                      <MenuItem 
                        key={exercise._id} 
                        value={exercise.name}
                        sx={{ pl: 4 }} // Indent exercises under category
                      >
                        {exercise.name}
                      </MenuItem>
                    ))
                  ]).flat()}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setShowAddExerciseForm(false)} 
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddExercise} 
                  variant="contained" 
                  color="primary"
                  disabled={!newExerciseName}
                >
                  Add
                </Button>
              </Box>
            </Box>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddExerciseForm(true)}
              sx={{ mt: 2 }}
            >
              Add Exercise
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </>
  );
};

const WorkoutHistory = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // Removed selectedExercise state and replaced with filteredUsers state for multi-user filtering
  const [filteredUsers, setFilteredUsers] = useState(currentUser ? [currentUser.id] : []);
  const [chartMetric, setChartMetric] = useState('volume'); // 'volume' or 'maxWeight'

  // State for user selection in charts
  const [weeklyChartUsers, setWeeklyChartUsers] = useState(currentUser ? [currentUser.id] : []);
  const [yearlyChartUsers, setYearlyChartUsers] = useState(currentUser ? [currentUser.id] : []);
  
  // Temporary state for user selection in modals
  const [tempWeeklySelectedUsers, setTempWeeklySelectedUsers] = useState(currentUser ? [currentUser.id] : []);
  const [tempYearlySelectedUsers, setTempYearlySelectedUsers] = useState(currentUser ? [currentUser.id] : []);
  
  // Modal visibility state
  const [weeklyUserSelectionModalOpen, setWeeklyUserSelectionModalOpen] = useState(false);
  const [yearlyUserSelectionModalOpen, setYearlyUserSelectionModalOpen] = useState(false);

  const [workoutHistory, setWorkoutHistory] = useState([]);
  // Separate state for chart data that won't be affected by filters
  const [chartWorkoutData, setChartWorkoutData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showRetiredUsers, setShowRetiredUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // For chart tooltip
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipDialogOpen, setTooltipDialogOpen] = useState(false);
  
  // For compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [comparePoints, setComparePoints] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const [workoutStats, setWorkoutStats] = useState({
    total: 0,
    byTemplate: {},
    byUser: {}
  });

  // Add state to track if colors have been assigned
  const [userColorsAssigned, setUserColorsAssigned] = useState(false);

  useEffect(() => {
    fetchWorkouts();
    fetchUsers();
  }, []);

  useEffect(() => {
    const defaultColors = [
      '#FF6B6B',  // red
      '#4ECDC4',  // teal
      '#45B7D1',  // blue
      '#96CEB4',  // green
      '#FFEEAD',  // yellow
    ];
    
    if (Array.isArray(users) && users.length > 0 && !userColorsAssigned) {
      // Create a new array with colors assigned to each user
      const updatedUsers = users.map((user, index) => {
        if (user && user._id) {
          // Only update the color if it's not already set
          if (!user.color) {
            return {
              ...user,
              color: defaultColors[index % defaultColors.length]
            };
          }
        }
        return user;
      });
      
      // Update the users state with the new array that has colors
      setUsers(updatedUsers);
      setUserColorsAssigned(true);
    }
  }, [users, userColorsAssigned]); // Only run when users or userColorsAssigned changes

  useEffect(() => {
    // This effect runs when users or showRetiredUsers changes
    // Make sure the selectedUsers state is consistent with the showRetiredUsers setting
    if (users.length > 0) {
      setSelectedUsers(prevSelected => {
        if (showRetiredUsers) {
          // When showing retired users, we don't need to filter them out
          return prevSelected;
        } else {
          // When hiding retired users, remove them from selectedUsers
          return prevSelected.filter(userId => {
            const user = users.find(u => u._id === userId);
            return user && !user.retired;
          });
        }
      });
    }
  }, [showRetiredUsers, users]);
  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCompletedWorkouts();
      
      // Handle different response formats
      let fetchedWorkouts = [];
      if (response && Array.isArray(response)) {
        fetchedWorkouts = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        fetchedWorkouts = response.data;
      }
      
      console.log("Fetched workouts:", fetchedWorkouts);
      
      // Log the first workout to see its structure
      if (fetchedWorkouts.length > 0) {
        console.log("Sample workout structure:", JSON.stringify(fetchedWorkouts[0], null, 2));
      }
      
      // Extract all unique user IDs from workouts
      const workoutUserIds = new Set();
      fetchedWorkouts.forEach(workout => {
        if (workout.userId) {
          workoutUserIds.add(workout.userId);
        } else if (workout.user && workout.user._id) {
          workoutUserIds.add(workout.user._id);
        }
      });
      console.log("User IDs found in workouts:", [...workoutUserIds]);
      
      setWorkoutHistory(fetchedWorkouts);
      setChartWorkoutData(fetchedWorkouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from API...');
      const response = await apiService.getUsers();
      console.log('API response:', response);
      
      // Handle different response formats
      let fetchedUsers = [];
      if (response && Array.isArray(response)) {
        fetchedUsers = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        fetchedUsers = response.data;
      }
      
      console.log("Raw fetched users:", fetchedUsers);
      console.log("Current user before setting users:", currentUser);
      setUsers(fetchedUsers);
      console.log("Weekly chart users before update:", weeklyChartUsers);
      console.log("Yearly chart users before update:", yearlyChartUsers);
      
      // Initialize selectedUsers with all active user IDs
      if (fetchedUsers.length > 0 && selectedUsers.length === 0) {
        // Select all non-retired users initially
        const activeUserIds = fetchedUsers
          .filter(user => user && user._id)
          .map(user => user._id);
        setSelectedUsers(activeUserIds);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
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

  const deleteWorkout = async (workoutId) => {
    try {
      await apiService.deleteCompletedWorkout(workoutId);
      
      const updatedHistory = workoutHistory.filter(workout => workout._id !== workoutId);
      setWorkoutHistory(updatedHistory);
      console.log('Workout deleted successfully');
      
      setSnackbar({
        open: true,
        message: 'Workout deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      
      setSnackbar({
        open: true,
        message: `Error deleting workout: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleEditClick = (workout) => {
    setEditWorkout(workout);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditWorkout(null);
  };

  const handleSaveEdit = async (updatedWorkout) => {
    try {
      setLoading(true);
      console.log('Saving workout update:', updatedWorkout._id);
      console.log('Updated workout data:', JSON.stringify(updatedWorkout, null, 2));
      
      const response = await apiService.updateCompletedWorkout(updatedWorkout._id, updatedWorkout);
      console.log('Update response:', response);
      
      // Update the workout in the local state
      setWorkoutHistory(prevWorkouts => 
        prevWorkouts.map(w => 
          w._id === updatedWorkout._id ? updatedWorkout : w
        )
      );
      
      setEditDialogOpen(false);
      setEditWorkout(null);
      
      setSnackbar({
        open: true,
        message: 'Workout updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      console.error('Error details:', error.response || error.message || error);
      
      setSnackbar({
        open: true,
        message: `Error updating workout: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalVolume = (exercises) => {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
        if (set.completed && set.weight && set.reps) {
          return setTotal + (set.weight * set.reps);
        }
        return setTotal;
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  // Memoize the filtered workouts to avoid recalculating on every render
  const filteredWorkouts = useMemo(() => {
    if (!workoutHistory.length) return [];
    
    return workoutHistory.filter(workout => {
      // Filter by user selection (for calendar)
      if (selectedUsers.length > 0) {
        const workoutUserId = workout.userId || (workout.user && workout.user._id);
        if (!selectedUsers.includes(workoutUserId)) {
          return false;
        }
      }
      
      // Filter by the new user filter dropdown
      if (filteredUsers.length > 0) {
        const workoutUserId = workout.userId || (workout.user && workout.user._id);
        if (!filteredUsers.includes(workoutUserId)) {
          return false;
        }
      }
      
      // Filter by date range
      if (startDate && endDate) {
        const workoutDate = new Date(workout.startTime);
        if (!isWithinInterval(workoutDate, { start: startDate, end: endDate })) {
          return false;
        }
      } else if (selectedDate) {
        const workoutDate = new Date(workout.startTime);
        if (!isSameDay(workoutDate, selectedDate)) {
          return false;
        }
      }
      
      return true; // Include this workout in the filtered results
    });
  }, [workoutHistory, selectedUsers, startDate, endDate, selectedDate, filteredUsers]);
  
  // Process workout data for chart visualization
  const chartData = useMemo(() => {
    const workoutsByDate = {};
    
    filteredWorkouts.forEach(workout => {
      try {
        if (!workout.startTime) return;
        
        const workoutDate = parseISO(workout.startTime);
        const date = format(workoutDate, 'yyyy-MM-dd');
        
        if (!workoutsByDate[date]) {
          workoutsByDate[date] = {
            date,
            users: {}
          };
        }
        
        // Get the user ID from either userId or user._id
        const userId = workout.userId || (workout.user && workout.user._id);
        
        if (userId) {
          if (!workoutsByDate[date].users[userId]) {
            workoutsByDate[date].users[userId] = {
              userId,
              workouts: []
            };
          }
          
          workoutsByDate[date].users[userId].workouts.push(workout);
        }
    } catch (error) {
      console.error("Error processing workout for chart:", error, workout);
    }
  });
  
  // Convert to array and sort by date
  const chartData = Object.values(workoutsByDate).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  
  // Calculate the metric value for each user on each date
  chartData.forEach(dateEntry => {
    Object.entries(dateEntry.users).forEach(([userId, userData]) => {
      const workouts = userData.workouts;
      
      // Calculate total volume or max weight across all exercises
      if (chartMetric === 'volume') {
        const totalVolume = workouts.reduce((total, workout) => {
          return total + calculateTotalVolume(workout.exercises);
        }, 0);
        dateEntry.users[userId].value = totalVolume;
      } else if (chartMetric === 'maxWeight') {
        const maxWeights = workouts.flatMap(workout => {
          return workout.exercises.map(exercise => {
            return Math.max(...exercise.sets.map(set => Number(set.weight) || 0));
          });
        });
        dateEntry.users[userId].value = Math.max(...maxWeights, 0);
      }
    });
  });
  
  return chartData;
  }, [filteredWorkouts, chartMetric]);

  // Update chart users when current user changes
  useEffect(() => {
    if (currentUser && currentUser.id) {
      // Only update if the arrays are empty (to avoid overriding user selections)
      if (weeklyChartUsers.length === 0) {
        setWeeklyChartUsers([currentUser.id]);
      }
      if (yearlyChartUsers.length === 0) {
        setYearlyChartUsers([currentUser.id]);
      }
      
      // Log for debugging
      console.log('Current user set for charts:', currentUser.name, currentUser.id);
    }
  }, [currentUser]);

  // Ensure current user is always selected in charts
  useEffect(() => {
    console.log('Current user effect running');
    console.log('Current user:', currentUser);
    console.log('Users array:', users);
    
    if (currentUser && currentUser.id && users.length > 0) {
      // Find the current user in the users array
      const userExists = users.some(u => u._id === currentUser.id || u.id === currentUser.id);
      console.log('Current user exists in users array:', userExists);
      
      if (userExists) {
        // Force the current user to be selected in both charts
        console.log('Setting chart users to current user:', currentUser.id);
        setWeeklyChartUsers([currentUser.id]);
        setYearlyChartUsers([currentUser.id]);
        
        // Also update the temp selections for the modals
        setTempWeeklySelectedUsers([currentUser.id]);
        setTempYearlySelectedUsers([currentUser.id]);
      }
    }
  }, [currentUser, users]);
  
  // Add state for chart period navigation
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [chartPeriod, setChartPeriod] = useState(Math.floor(new Date().getMonth() / 2) + 1); // 1-6 for each 2-month period
  
  // Add state for yearly chart
  const [yearlyChartYear, setYearlyChartYear] = useState(new Date().getFullYear());

  // Utility function to get all workouts for charts, independent of filters
  const getWorkoutsForCharts = useCallback(() => {
    return workoutHistory;
  }, [workoutHistory]);

  // Generate workout data by week for 2-month periods with multiple users
  // Note: This chart uses workoutHistory in its dependency array instead of filteredWorkouts
  // to ensure it's not affected by quick filters or date selectors
  const weeklyWorkoutData = useMemo(() => {
    console.log('Calculating weekly workout data with users:', weeklyChartUsers);
    // Determine start and end months based on the selected period (2-month periods)
    const startMonth = (chartPeriod - 1) * 2; // 0, 2, 4, 6, 8, 10
    const endMonth = startMonth + 1;          // 1, 3, 5, 7, 9, 11
    
    // Calculate start and end dates for the period
    const periodStartDate = new Date(chartYear, startMonth, 1);
    const periodEndDate = new Date(chartYear, endMonth + 1, 0); // Last day of end month
    
    // Get all weeks in the period
    const weeks = [];
    let currentDate = new Date(periodStartDate);
    
    // Adjust to the start of the week (Monday)
    const dayOfWeek = currentDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to make Monday the first day
    currentDate.setDate(currentDate.getDate() - daysFromMonday);
    currentDate.setHours(0, 0, 0, 0);
    
    // Generate all weeks in the period
    while (currentDate <= periodEndDate) {
      const weekStart = new Date(currentDate);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      // Create week label based on the month and day
      const weekLabel = format(weekStart, 'MMM d');
      
      const weekData = {
        week: weekKey,
        label: weekLabel,
        startDate: new Date(weekStart),
        endDate: new Date(new Date(weekStart).setDate(weekStart.getDate() + 6))
      };
      
      // Initialize counts for each selected user
      // Always show individual users, never show a total
      if (weeklyChartUsers.length === 0 && currentUser) {
        // If no users explicitly selected, default to current user
        weekData[currentUser.id] = 0;
      } else {
        // Add count for each selected user
        weeklyChartUsers.forEach(userId => {
          const user = users.find(u => u._id === userId);
          if (user) {
            weekData[userId] = 0;
          }
        });
      }
      
      weeks.push(weekData);
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    // Process each workout
    filteredWorkouts.forEach(workout => {
      if (!workout.startTime) return;
      
      try {
        // Parse the workout date
        const workoutDate = parseISO(workout.startTime);
        const workoutYear = workoutDate.getFullYear();
        const workoutMonth = workoutDate.getMonth();
        const workoutUserId = workout.userId || (workout.user && workout.user._id);
        
        // Skip if not in the selected year or period
        if (workoutYear !== chartYear) return;
        if (workoutMonth < startMonth || workoutMonth > endMonth) return;
        
        // Find the week this workout belongs to
        const matchingWeek = weeks.find(week => {
          return isWithinInterval(workoutDate, {
            start: week.startDate,
            end: week.endDate
          });
        });
        
        if (matchingWeek) {
          if (weeklyChartUsers.length === 0 && currentUser && workoutUserId === currentUser.id) {
            // If no users explicitly selected, count only current user's workouts
            matchingWeek[currentUser.id] = (matchingWeek[currentUser.id] || 0) + 1;
          } else if (weeklyChartUsers.includes(workoutUserId)) {
            // If this workout belongs to a selected user, increment their count
            matchingWeek[workoutUserId] = (matchingWeek[workoutUserId] || 0) + 1;
          }
        }
      } catch (error) {
        console.error("Error processing workout for weekly chart:", error, workout);
      }
    });
    
    return weeks;
  }, [workoutHistory, weeklyChartUsers, users, chartYear, chartPeriod]);
  
  // Open weekly user selection modal
  const handleOpenWeeklyUserSelectionModal = () => {
    setTempWeeklySelectedUsers([...weeklyChartUsers]);
    setWeeklyUserSelectionModalOpen(true);
  };
  
  // Close weekly user selection modal
  const handleCloseWeeklyUserSelectionModal = () => {
    setWeeklyUserSelectionModalOpen(false);
  };
  
  // Apply weekly user selection changes
  const handleApplyWeeklyUserSelection = () => {
    setWeeklyChartUsers([...tempWeeklySelectedUsers]);
    setWeeklyUserSelectionModalOpen(false);
  };

  // Open yearly user selection modal
  const handleOpenYearlyUserSelectionModal = () => {
    setTempYearlySelectedUsers([...yearlyChartUsers]);
    setYearlyUserSelectionModalOpen(true);
  };
  
  // Close yearly user selection modal
  const handleCloseYearlyUserSelectionModal = () => {
    setYearlyUserSelectionModalOpen(false);
  };
  
  const handleApplyYearlyUserSelection = () => {
    setYearlyChartUsers([...tempYearlySelectedUsers]);
    setYearlyUserSelectionModalOpen(false);
  };
  
  // Toggle weekly user selection in modal
  const handleToggleWeeklyUserSelection = (userId) => {
    setTempWeeklySelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  // Clear all weekly user selections
  const handleClearWeeklyUserSelection = () => {
    setTempWeeklySelectedUsers([]);
  };

  // Toggle yearly user selection in modal
  const handleToggleYearlyUserSelection = (userId) => {
    setTempYearlySelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  // Clear all yearly user selections
  const handleClearYearlyUserSelection = () => {
    setTempYearlySelectedUsers([]);
  };
  
  // Navigate to previous period
  const handlePreviousPeriod = () => {
    if (chartPeriod > 1) {
      // Move to previous 2-month period in the same year
      setChartPeriod(chartPeriod - 1);
    } else {
      // Move to last period of previous year
      setChartPeriod(6); // Nov-Dec
      setChartYear(chartYear - 1);
    }
  };
  
  // Navigate to next period
  const handleNextPeriod = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentPeriod = Math.floor(currentMonth / 2) + 1;
    
    // Don't allow navigation beyond current period
    if (chartYear === currentYear && chartPeriod >= currentPeriod) {
      return;
    }
    
    if (chartPeriod < 6) {
      // Move to next 2-month period in the same year
      setChartPeriod(chartPeriod + 1);
    } else {
      // Move to first period of next year
      setChartPeriod(1); // Jan-Feb
      setChartYear(chartYear + 1);
    }
  };
  
  // Get period label
  const getPeriodLabel = () => {
    const monthPairs = [
      'Jan-Feb', 'Mar-Apr', 'May-Jun',
      'Jul-Aug', 'Sep-Oct', 'Nov-Dec'
    ];
    return `${monthPairs[chartPeriod - 1]} ${chartYear}`;
  };
  
  // Generate yearly workout data with multiple users
  // Note: This chart uses workoutHistory in its dependency array instead of filteredWorkouts
  // to ensure it's not affected by quick filters or date selectors
  const yearlyWorkoutData = useMemo(() => {
    console.log('Calculating yearly workout data with users:', yearlyChartUsers);
    // Initialize all months with zero counts
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(yearlyChartYear, month, 1);
      const monthKey = format(monthDate, 'yyyy-MM');
      
      const monthData = {
        month: monthKey,
        label: format(monthDate, 'MMM'),
        year: yearlyChartYear
      };
      
      // Initialize counts for each selected user
      // Always show individual users, never show a total
      if (yearlyChartUsers.length === 0 && currentUser) {
        // If no users explicitly selected, default to current user
        monthData[currentUser.id] = 0;
      } else {
        // Add count for each selected user
        yearlyChartUsers.forEach(userId => {
          const user = users.find(u => u._id === userId);
          if (user) {
            monthData[userId] = 0;
          }
        });
      }
      
      months.push(monthData);
    }
    
    // Process each workout
    filteredWorkouts.forEach(workout => {
      if (!workout.startTime) return;
      
      try {
        // Parse the workout date
        const workoutDate = parseISO(workout.startTime);
        const workoutYear = workoutDate.getFullYear();
        const workoutUserId = workout.userId || (workout.user && workout.user._id);
        
        // Skip if not in the selected year
        if (workoutYear !== yearlyChartYear) return;
        
        // Format as YYYY-MM for the month
        const monthKey = format(workoutDate, 'yyyy-MM');
        
        // Find the month data
        const monthData = months.find(m => m.month === monthKey);
        
        if (monthData) {
          if (yearlyChartUsers.length === 0 && currentUser && workoutUserId === currentUser.id) {
            // If no users explicitly selected, count only current user's workouts
            monthData[currentUser.id] = (monthData[currentUser.id] || 0) + 1;
          } else if (yearlyChartUsers.includes(workoutUserId)) {
            // If this workout belongs to a selected user, increment their count
            monthData[workoutUserId] = (monthData[workoutUserId] || 0) + 1;
          }
        }
      } catch (error) {
        console.error("Error processing workout for yearly chart:", error, workout);
      }
    });
    
    // Sort by month
    return months.sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [workoutHistory, yearlyChartUsers, users, yearlyChartYear]);
  
  // Navigate to previous year
  const handlePreviousYear = () => {
    setYearlyChartYear(yearlyChartYear - 1);
  };
  
  // Navigate to next year
  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    
    // Don't allow navigation beyond current year
    if (yearlyChartYear < currentYear) {
      setYearlyChartYear(yearlyChartYear + 1);
    }
  };
  
  // Memoize workout stats to avoid recalculating on every render
  const computedWorkoutStats = useMemo(() => {
    if (!filteredWorkouts.length) {
      return {
        total: 0,
        byTemplate: {},
        byUser: {}
      };
    }
    
    const stats = {
      total: filteredWorkouts.length,
      byTemplate: {},
      byUser: {}
    };
    
    filteredWorkouts.forEach(workout => {
      // Count by template
      const templateName = workout.templateName || 'Unknown Template';
      stats.byTemplate[templateName] = (stats.byTemplate[templateName] || 0) + 1;
      
      // Count by user
      const userId = workout.user?._id || workout.userId;
      const userName = workout.user?.name || 'Unknown User';
      const userColor = workout.user?.color || '#cccccc';
      
      if (userId) {
        if (!stats.byUser[userId]) {
          stats.byUser[userId] = {
            name: userName,
            color: userColor,
            total: 0,
            byTemplate: {}
          };
        }
        
        stats.byUser[userId].total += 1;
        
        // Count by template for this user
        stats.byUser[userId].byTemplate[templateName] = 
          (stats.byUser[userId].byTemplate[templateName] || 0) + 1;
      }
    });
    
    return stats;
  }, [filteredWorkouts]);

  useEffect(() => {
    setWorkoutStats(computedWorkoutStats);
  }, [computedWorkoutStats]);

  const exportWorkouts = () => {
    const workoutsToExport = filteredWorkouts.map(workout => ({
      templateName: workout.templateName,
      date: formatDate(workout.startTime),
      duration: calculateDuration(workout.startTime, workout.endTime),
      totalVolume: calculateTotalVolume(workout.exercises),
      exercises: workout.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets
          .filter(set => set.completed)
          .map(set => ({
            weight: set.weight,
            reps: set.reps,
            volume: set.weight * set.reps
          }))
      }))
    }));

    const blob = new Blob(
      [JSON.stringify(workoutsToExport, null, 2)],
      { type: 'application/json' }
    );
    saveAs(blob, `workout-history-${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  // Simple tooltip component that just shows the date and values
  const SimpleTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '8px 12px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => {
            // Safely access nested properties with optional chaining
            const userData = entry?.payload?.users?.[entry.dataKey?.split('.')[1]];
            if (!userData) return null;
            
            return (
              <p key={index} style={{ 
                margin: '2px 0', 
                color: userData.color || entry.color
              }}>
                {userData.name}: {userData.value} {chartMetric === 'volume' ? 'kg' : 'kg'}
              </p>
            );
          })}
          <p style={{ 
            margin: '4px 0 0', 
            fontSize: '11px', 
            fontStyle: 'italic',
            textAlign: 'center',
            color: '#666'
          }}>
            {compareMode 
              ? comparePoints.length === 0 
                ? 'Click to select first point' 
                : comparePoints.length === 1 
                  ? 'Click to select second point' 
                  : 'Two points selected'
              : 'Click on dot for details'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // Detailed tooltip content for the dialog
  const DetailedTooltipContent = ({ payload, label }) => {
    if (!payload || !payload.length) return null;
    
    return (
      <div style={{ 
        padding: '0 16px 16px', 
        maxWidth: '100%',
        fontSize: '14px',
        lineHeight: '1.5',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        {payload.map((entry, index) => {
          // Safely access nested properties with optional chaining
          const userKey = entry.dataKey?.split('.')[1];
          const userData = entry?.payload?.users?.[userKey];
          if (!userData) return null;
          
          // Find the user in the users array to get the most up-to-date information
          const user = users.find(u => u._id === userKey);
          
          // Use the most complete information available
          const displayName = (user && user.name) || userData.name || 'Unknown User';
          const displayColor = (user && user.color) || userData.color || '#cccccc';
          
          return (
            <div key={index} style={{ 
              marginBottom: '16px',
              padding: '10px',
              backgroundColor: `${displayColor}10`,
              border: `1px solid ${displayColor}33`,
              borderRadius: '6px'
            }}>
              <p style={{ 
                margin: '0 0 8px', 
                fontWeight: 'bold',
                fontSize: '15px',
                color: displayColor || entry.color,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{displayName}</span>
                <span>{userData.value} {chartMetric === 'volume' ? 'kg (total volume)' : 'kg (max weight)'}</span>
              </p>
              
              {chartMetric === 'volume' && userData.detailedBreakdown && userData.detailedBreakdown.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ 
                    margin: '5px 0 10px', 
                    fontWeight: 'bold', 
                    borderBottom: '1px solid #eee', 
                    paddingBottom: '5px'
                  }}>
                    Breakdown:
                  </p>
                  
                  {/* Group by workout name */}
                  {Object.entries(
                    userData.detailedBreakdown.reduce((acc, item) => {
                      if (!acc[item.workoutName]) {
                        acc[item.workoutName] = [];
                      }
                      acc[item.workoutName].push(item);
                      return acc;
                    }, {})
                  ).map(([workoutName, items], wIndex) => (
                    <div key={wIndex} style={{ 
                      margin: '0 0 12px',
                      padding: '8px',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderRadius: '4px'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '6px',
                        color: '#555',
                        fontSize: '14px'
                      }}>
                        {workoutName}
                      </div>
                      
                      {/* Group by exercise name */}
                      {Object.entries(
                        items.reduce((acc, item) => {
                          if (!acc[item.exerciseName]) {
                            acc[item.exerciseName] = [];
                          }
                          acc[item.exerciseName].push(item);
                          return acc;
                        }, {})
                      ).map(([exerciseName, sets], eIndex) => (
                        <div key={eIndex} style={{ marginBottom: '8px' }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '4px',
                            fontSize: '13px'
                          }}>
                            {exerciseName}
                          </div>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '40px 80px 80px 80px',
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '4px',
                            fontWeight: 'bold'
                          }}>
                            <div>Set</div>
                            <div>Weight</div>
                            <div>Reps</div>
                            <div>Volume</div>
                          </div>
                          {sets.map((set, sIndex) => (
                            <div key={sIndex} style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '40px 80px 80px 80px',
                              fontSize: '12px'
                            }}>
                              <div>{set.setNumber}</div>
                              <div>{set.weight} kg</div>
                              <div>{set.reps} reps</div>
                              <div>{set.volume} kg</div>
                            </div>
                          ))}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '40px 80px 80px 80px',
                            fontSize: '12px',
                            borderTop: '1px solid #eee',
                            paddingTop: '4px',
                            marginTop: '4px',
                            fontWeight: 'bold'
                          }}>
                            <div>Total</div>
                            <div></div>
                            <div></div>
                            <div>{sets.reduce((sum, set) => sum + set.volume, 0)} kg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Handle chart click
  const handleChartClick = useCallback((data) => {
    if (!data || !data.activePayload || !data.activePayload.length) return;
    
    console.log('Chart clicked:', data);
    
    const clickedData = data.activePayload[0].payload;
    console.log('Clicked data:', clickedData);
    
    if (compareMode) {
      // In compare mode, collect points
      if (comparePoints.length < 2) {
        // Check if this point is already selected
        const isDuplicate = comparePoints.some(point => point.date === clickedData.date);
        if (!isDuplicate) {
          setComparePoints(prev => [...prev, clickedData]);
        }
        
        // If we now have 2 points, open the compare dialog
        if (comparePoints.length === 1 && !isDuplicate) {
          setCompareDialogOpen(true);
        }
      }
    } else {
      // Normal mode - show details for single point
      setTooltipData({
        payload: clickedData,
        label: clickedData.date
      });
      setTooltipDialogOpen(true);
    }
  }, [compareMode, comparePoints]);
  
  // Toggle compare mode
  const handleToggleCompareMode = () => {
    setCompareMode(prev => !prev);
    // Reset compare points when toggling
    setComparePoints([]);
    setCompareDialogOpen(false);
  };
  
  // Reset compare selection
  const handleResetCompare = () => {
    setComparePoints([]);
    setCompareDialogOpen(false);
  };

  // Handle user selection change
  const handleUserSelectionChange = (event) => {
    setSelectedUsers(event.target.value);
  };

  return (
    <>
      <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4">
          Workout History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportWorkouts}
          disabled={filteredWorkouts.length === 0}
        >
          Export
        </Button>
      </Box>

      {/* Weekly Workout Count Bar Graph */}
      {filteredWorkouts.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Workouts by Week
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleOpenWeeklyUserSelectionModal}
              startIcon={<PersonIcon />}
            >
              {weeklyChartUsers.length === 0 ? 'All Users' : 
                weeklyChartUsers.length === 1 ? 
                  users.find(u => u._id === weeklyChartUsers[0])?.name || 'User' : 
                  `${weeklyChartUsers.length} Users`}
            </Button>
          </Box>
          
          {/* Period navigation controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handlePreviousPeriod}>
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ mx: 2, fontWeight: 'bold' }}>
              {getPeriodLabel()}
            </Typography>
            <IconButton 
              onClick={handleNextPeriod}
              disabled={chartYear === new Date().getFullYear() && 
                ((chartPeriod === 1 && new Date().getMonth() < 6) || 
                 (chartPeriod === 2))}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyWorkoutData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  // If it's a user ID, find the user name
                  const user = users.find(u => u._id === name);
                  if (user) {
                    return [value, `${user.name} Workouts`];
                  }
                  // For total count
                  if (name === 'total') {
                    return [value, 'Total Workouts'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => label}
              />
              <Legend />
              {(weeklyChartUsers.length === 0 && currentUser) ? (
                <Bar 
                  dataKey={currentUser.id} 
                  name={users.find(u => u._id === currentUser.id || u.id === currentUser.id)?.name || "Current User"}
                  fill={users.find(u => u._id === currentUser.id || u.id === currentUser.id)?.color || "#8884d8"}
                />
              ) : (
                weeklyChartUsers.map(userId => {
                  const user = users.find(u => u._id === userId);
                  return (
                    <Bar 
                      key={userId}
                      dataKey={userId} 
                      name={user?.name || 'User'}
                      fill={user?.color || "#8884d8"}
                    />
                  );
                })
              )}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
      
      {/* Yearly Workout Count Bar Graph */}
      {filteredWorkouts.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Workouts by Month
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleOpenYearlyUserSelectionModal}
              startIcon={<PersonIcon />}
            >
              {yearlyChartUsers.length === 0 ? 'All Users' : 
                yearlyChartUsers.length === 1 ? 
                  users.find(u => u._id === yearlyChartUsers[0])?.name || 'User' : 
                  `${yearlyChartUsers.length} Users`}
            </Button>
          </Box>
          
          {/* Year navigation controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handlePreviousYear}>
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ mx: 2, fontWeight: 'bold' }}>
              {yearlyChartYear}
            </Typography>
            <IconButton 
              onClick={handleNextYear}
              disabled={yearlyChartYear === new Date().getFullYear()}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={yearlyWorkoutData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  // If it's a user ID, find the user name
                  const user = users.find(u => u._id === name);
                  if (user) {
                    return [value, `${user.name} Workouts`];
                  }
                  // For total count
                  if (name === 'total') {
                    return [value, 'Total Workouts'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => label}
              />
              <Legend />
              {(yearlyChartUsers.length === 0 && currentUser) ? (
                <Bar 
                  dataKey={currentUser.id} 
                  name={users.find(u => u._id === currentUser.id || u.id === currentUser.id)?.name || "Current User"}
                  fill={users.find(u => u._id === currentUser.id || u.id === currentUser.id)?.color || "#4CAF50"}
                />
              ) : (
                yearlyChartUsers.map(userId => {
                  const user = users.find(u => u._id === userId);
                  return (
                    <Bar 
                      key={userId}
                      dataKey={userId} 
                      name={user?.name || 'User'}
                      fill={user?.color || "#4CAF50"}
                    />
                  );
                })
              )}
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Calendar View */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#1976d2' }}>Calendar View</Typography>
        </Box>
        <Box sx={{ 
          '& .react-calendar': { 
            width: '100%', 
            height: 'auto', 
            transform: 'scale(1)', 
            transformOrigin: 'top center', 
            marginBottom: '1rem',
            maxWidth: '100%',
            '& button': {
              maxWidth: '14.2%'  // 100% / 7 days
            }
          },
          '& .react-calendar__navigation': {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            '& > div': {
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
            }
          },
          overflow: 'visible'
        }}>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={({ date, view }) => {
              if (view !== 'month') return null;
              
              const workoutsOnDate = workoutHistory.filter(workout => {
                if (!workout.startTime) return false;
                try {
                  return isSameDay(parseISO(workout.startTime), date);
                } catch (error) {
                  console.error("Error parsing date:", workout.startTime, error);
                  return false;
                }
              });
              
              return workoutsOnDate.length > 0 ? 'has-workout' : null;
            }}
            onClickDay={(value) => {
              setSelectedDate(value);
              setStartDate(value);
              setEndDate(value);
            }}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;
              
              const workoutsOnDate = workoutHistory.filter(workout => {
                if (!workout.startTime) return false;
                try {
                  return isSameDay(parseISO(workout.startTime), date);
                } catch (error) {
                  console.error("Error parsing date:", workout.startTime, error);
                  return false;
                }
              });
              
              if (workoutsOnDate.length > 0) {
                // Get unique users who worked out on this date
                const uniqueWorkoutsByUser = workoutsOnDate.reduce((acc, workout) => {
                  // Use either userId or user._id, whichever is available
                  const userId = workout.userId || (workout.user && workout.user._id);
                  if (userId && !acc[userId]) {
                    acc[userId] = workout;
                  }
                  return acc;
                }, {});
                
                const uniqueUsers = Object.values(uniqueWorkoutsByUser);
                
                let backgroundColor = '';
                const userNames = [];
                
                if (uniqueUsers.length === 1) {
                  // Check if user exists and has a color property
                  const workout = uniqueUsers[0];
                  const user = workout.user || {};
                  const userId = workout.userId || (user && user._id);
                  
                  // Find the user in the users array to get the color
                  const foundUser = users.find(u => u._id === userId);
                  const userColor = (foundUser && foundUser.color) || (user && user.color) || '#cccccc';
                  
                  backgroundColor = userColor;
                  
                  // Add user name if available
                  if ((foundUser && foundUser.name) || (user && user.name)) {
                    userNames.push((foundUser && foundUser.name) || (user && user.name));
                  } else {
                    userNames.push('Unknown User');
                  }
                } else if (uniqueUsers.length === 2) {
                  // Check if both users exist and have color properties
                  const workout1 = uniqueUsers[0];
                  const workout2 = uniqueUsers[1];
                  const user1 = workout1.user || {};
                  const user2 = workout2.user || {};
                  
                  // Try to find users in the users array if not available in workout
                  const userId1 = workout1.userId || (user1 && user1._id);
                  const userId2 = workout2.userId || (user2 && user2._id);
                  const foundUser1 = users.find(u => u._id === userId1);
                  const foundUser2 = users.find(u => u._id === userId2);
                  
                  const color1 = (foundUser1 && foundUser1.color) || (user1 && user1.color) || '#cccccc';
                  const color2 = (foundUser2 && foundUser2.color) || (user2 && user2.color) || '#cccccc';
                  
                  backgroundColor = `linear-gradient(135deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`;
                  
                  // Add user names if available
                  if ((foundUser1 && foundUser1.name) || (user1 && user1.name)) {
                    userNames.push((foundUser1 && foundUser1.name) || (user1 && user1.name));
                  } else {
                    userNames.push('Unknown User');
                  }
                  
                  if ((foundUser2 && foundUser2.name) || (user2 && user2.name)) {
                    userNames.push((foundUser2 && foundUser2.name) || (user2 && user2.name));
                  } else {
                    userNames.push('Unknown User');
                  }
                } else if (uniqueUsers.length > 2) {
                  // For more than 2 users, use a special background
                  backgroundColor = 'linear-gradient(135deg, #f44336 0%, #2196f3 50%, #4caf50 100%)';
                  
                  // Add all available user names
                  uniqueUsers.forEach(workout => {
                    const user = workout.user || {};
                    const userId = workout.userId || (user && user._id);
                    const foundUser = users.find(u => u._id === userId);
                    
                    if ((foundUser && foundUser.name) || (user && user.name)) {
                      userNames.push((foundUser && foundUser.name) || (user && user.name));
                    }
                  });
                  
                  if (userNames.length === 0) {
                    userNames.push('Multiple Users');
                  }
                }
                
                return (
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: backgroundColor,
                      opacity: 0.7,
                      borderRadius: '4px',
                      zIndex: 1
                    }}
                    title={userNames.join(', ')}
                  >
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '4px', 
                      right: '4px',
                      fontSize: '10px',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      fontWeight: 'bold',
                      zIndex: 2
                    }}>
                      {uniqueUsers.length}
                    </div>
                  </div>
                );
              }
              
              return null;
            }}
          />
        </Box>
      </Paper>

      {/* Date Filter Presets */}
      <Paper elevation={2} sx={{ p: 2, mb: 4, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 500, color: '#555' }}>
            Quick Filters:
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              const now = new Date();
              // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
              const currentDay = now.getDay();
              // Calculate how many days to subtract to get to the beginning of the week (Monday)
              const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
              // Create a new date for Monday of this week
              const monday = new Date(now);
              monday.setDate(now.getDate() - daysToSubtract);
              monday.setHours(0, 0, 0, 0);
              
              setStartDate(monday);
              setEndDate(now);
            }}
          >
            This Week
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
              setStartDate(firstDay);
              setEndDate(now);
            }}
          >
            This Month
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
              setStartDate(firstDay);
              setEndDate(lastDay);
            }}
          >
            Last Month
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              const now = new Date();
              const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
              setStartDate(sixMonthsAgo);
              setEndDate(now);
            }}
          >
            Last 6 Months
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), 0, 1);
              setStartDate(firstDay);
              setEndDate(now);
            }}
          >
            This Year
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            All Time
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start Date"
            className="MuiInputBase-input MuiOutlinedInput-input"
            wrapperClassName="datePicker"
            dateFormat="MMMM d, yyyy"
            customInput={
              <input 
                style={{ 
                  color: 'white',
                  backgroundColor: 'rgba(66, 66, 66, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  borderRadius: '4px',
                  padding: '16.5px 14px',
                  width: '100%'
                }} 
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End Date"
            className="MuiInputBase-input MuiOutlinedInput-input"
            wrapperClassName="datePicker"
            dateFormat="MMMM d, yyyy"
            customInput={
              <input 
                style={{ 
                  color: 'white',
                  backgroundColor: 'rgba(66, 66, 66, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.23)',
                  borderRadius: '4px',
                  padding: '16.5px 14px',
                  width: '100%'
                }} 
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Users</InputLabel>
            <Select
              multiple
              value={filteredUsers}
              onChange={(e) => setFilteredUsers(e.target.value)}
              label="Users"
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return 'All Users';
                }
                if (selected.length === 1) {
                  const user = users.find(u => u._id === selected[0] || u.id === selected[0]);
                  return user ? user.name : 'User';
                }
                return `${selected.length} Users`;
              }}
            >
              {users.map(user => (
                <MenuItem key={user._id || user.id} value={user._id || user.id}>
                  <Checkbox checked={filteredUsers.indexOf(user._id || user.id) > -1} />
                  <ListItemText 
                    primary={user.name} 
                    secondary={user.email} 
                    primaryTypographyProps={{ style: { color: user.color } }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Weekly Workout Count Bar Graph */}

      {filteredWorkouts.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Workout Statistics
          </Typography>
          
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Chip 
              label={`Total Workouts: ${workoutStats.total}`} 
              color="primary" 
              sx={{ fontSize: '1rem', py: 2, px: 3 }}
            />
          </Box>
          
          <Grid container spacing={3}>
            {/* Template breakdown */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.primary' }}>
                  Workouts by Template
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {Object.entries(workoutStats.byTemplate)
                    .sort((a, b) => b[1] - a[1]) // Sort by count descending
                    .map(([templateName, count], index) => (
                      <ListItem key={templateName}>
                        <ListItemText 
                          primary={templateName} 
                          secondary={`${count} workout${count !== 1 ? 's' : ''}`}
                        />
                        <LinearProgress 
                          variant="determinate" 
                          value={(count / workoutStats.total) * 100} 
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                        />
                      </ListItem>
                    ))}
                </List>
              </Paper>
            </Grid>
            
            {/* User breakdown */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.primary' }}>
                  Workouts by User
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {Object.entries(workoutStats.byUser)
                  .sort((a, b) => b[1].total - a[1].total) // Sort by total workouts descending
                  .map(([userId, userData], index) => {
                    // Try to find the user in the users array
                    const user = users.find(u => u._id === userId);
                    
                    // Combine data from both sources to ensure we have the most complete information
                    const displayName = (user && user.name) || userData.name || 'Unknown User';
                    const displayColor = (user && user.color) || userData.color || '#cccccc';
                    
                    return (
                      <Box key={userId} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              mr: 1,
                              bgcolor: displayColor,
                            }} 
                          />
                          <Typography variant="subtitle2">
                            {displayName} {user && user.retired ? '(Retired)' : ''}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ pl: 3 }}>
                          {Object.entries(userData.byTemplate)
                            .sort((a, b) => b[1] - a[1]) // Sort by count descending
                            .map(([templateName, count], index) => (
                              <Box key={`${userId}-${templateName}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {templateName}:
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {count}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      </Box>
                    );
                  })}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {filteredWorkouts.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No completed workouts yet. Start a workout to see your history!
          </Typography>
        </Paper>
      ) : (
        filteredWorkouts.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          .map((workout) => (
            <Accordion key={workout.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6">{workout.templateName}</Typography>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: 'white',
                          bgcolor: workout.user?.color || 'primary.main',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        {workout.user?.name || 'Unknown User'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(workout.startTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                        ⏱️ {calculateDuration(workout.startTime, workout.endTime)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Volume: {calculateTotalVolume(workout.exercises)}kg
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {(() => {
                        // Debug information
                        const workoutUserId = workout.user?._id || workout.userId;
                        const currentUserId = currentUser?._id || currentUser?.id;
                        const isAdmin = currentUser?.isAdmin === true;
                        const isOwner = workoutUserId === currentUserId;
                        
                        console.log('Workout:', workout.templateName);
                        console.log('  Workout User ID:', workoutUserId);
                        console.log('  Current User ID:', currentUserId);
                        console.log('  Is Admin:', isAdmin);
                        console.log('  Is Owner:', isOwner);
                        console.log('  Should Show Controls:', isAdmin || isOwner);
                        
                        return (isAdmin || isOwner) && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(workout);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        );
                      })()}
                      
                      {(() => {
                        const workoutUserId = workout.user?._id || workout.userId;
                        const currentUserId = currentUser?._id || currentUser?.id;
                        const isAdmin = currentUser?.isAdmin === true;
                        const isOwner = workoutUserId === currentUserId;
                        
                        return (isAdmin || isOwner) && (
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setWorkoutToDelete(workout);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        );
                      })()}
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {workout.exercises.map((exercise, index) => (
                  <Box key={exercise.id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {exercise.name}
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Set</TableCell>
                            <TableCell align="right">Weight (kg)</TableCell>
                            <TableCell align="right">Reps</TableCell>
                            <TableCell align="right">Volume</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {exercise.sets.filter(set => set.completed).map((set, setIndex) => (
                            <TableRow key={setIndex}>
                              <TableCell>{setIndex + 1}</TableCell>
                              <TableCell align="right">{set.weight}</TableCell>
                              <TableCell align="right">{set.reps}</TableCell>
                              <TableCell align="right">{set.weight * set.reps}kg</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {index < workout.exercises.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))
      )}
    </Container>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        {editWorkout && (
          <EditWorkoutForm 
            workout={editWorkout}
            onSave={handleSaveEdit}
            onCancel={handleEditClose}
          />
        )}
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Workout</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this workout? This action cannot be undone.
          </Typography>
          {workoutToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                {workoutToDelete.templateName} - {workoutToDelete.user?.name || 'Unknown User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(workoutToDelete.startTime)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (workoutToDelete) {
                deleteWorkout(workoutToDelete._id);
                setDeleteDialogOpen(false);
              }
            }} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Weekly User Selection Modal */}
      <Dialog open={weeklyUserSelectionModalOpen} onClose={handleCloseWeeklyUserSelectionModal}>
        <DialogTitle>Select Users to Display</DialogTitle>
        <DialogContent>
          <List>
            {users
              .filter(user => showRetiredUsers || !user.retired)
              .map((user) => (
                <ListItem key={user._id} disablePadding>
                  <ListItemButton onClick={() => handleToggleWeeklyUserSelection(user._id)}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={tempWeeklySelectedUsers.includes(user._id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: user.color || '#ccc',
                          mr: 1 
                        }} 
                      />
                      <ListItemText primary={user.name} />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWeeklyUserSelectionModal}>Cancel</Button>
          <Button onClick={handleClearWeeklyUserSelection}>Clear All</Button>
          <Button onClick={handleApplyWeeklyUserSelection} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
      {/* Yearly User Selection Modal */}
      <Dialog open={yearlyUserSelectionModalOpen} onClose={handleCloseYearlyUserSelectionModal}>
        <DialogTitle>Select Users to Display</DialogTitle>
        <DialogContent>
          <List>
            {users
              .filter(user => showRetiredUsers || !user.retired)
              .map((user) => (
                <ListItem key={user._id} disablePadding>
                  <ListItemButton onClick={() => handleToggleYearlyUserSelection(user._id)}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={tempYearlySelectedUsers.includes(user._id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: user.color || '#ccc',
                          mr: 1 
                        }} 
                      />
                      <ListItemText primary={user.name} />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseYearlyUserSelectionModal}>Cancel</Button>
          <Button onClick={handleClearYearlyUserSelection}>Clear All</Button>
          <Button onClick={handleApplyYearlyUserSelection} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorkoutHistory;
