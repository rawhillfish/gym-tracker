import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiService from '../services/api';
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
  ToggleButtonGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../styles/calendar.css";
import "../styles/datepicker.css";
import { parseISO, isWithinInterval, format, isSameDay } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { saveAs } from 'file-saver';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';

const WorkoutHistory = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [chartMetric, setChartMetric] = useState('volume'); // 'volume' or 'maxWeight'
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // For chart tooltip
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipDialogOpen, setTooltipDialogOpen] = useState(false);
  
  // For compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [comparePoints, setComparePoints] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

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
    
    const colors = {};
    users.forEach((user, index) => {
      colors[user._id] = defaultColors[index % defaultColors.length];
    });
    // User colors are now stored in the colors variable
    console.log('Users:', users);
    console.log('User colors:', colors);
  }, [users]);

  const fetchWorkouts = async () => {
    try {
      const response = await apiService.getCompletedWorkouts();
      console.log('Fetched workouts:', response.data);
      setWorkoutHistory(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      const fetchedUsers = response.data;
      setUsers(fetchedUsers);
      
      // Initialize selectedUsers with all user IDs
      if (fetchedUsers.length > 0 && selectedUsers.length === 0) {
        setSelectedUsers(fetchedUsers.map(user => user._id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
    setEditWorkout(JSON.parse(JSON.stringify(workout))); // Deep copy
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditWorkout(null);
    setEditDialogOpen(false);
  };

  const handleEditSave = async () => {
    try {
      const response = await apiService.updateCompletedWorkout(editWorkout._id, editWorkout);
      const updatedWorkout = response.data;
      const updatedHistory = workoutHistory.map(workout =>
        workout._id === editWorkout._id ? updatedWorkout : workout
      );
      
      setWorkoutHistory(updatedHistory);
      handleEditClose();
      
      setSnackbar({
        open: true,
        message: 'Workout updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      
      setSnackbar({
        open: true,
        message: `Error updating workout: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updatedWorkout = { ...editWorkout };
    updatedWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
    setEditWorkout(updatedWorkout);
  };

  const handleAddSet = (exerciseIndex) => {
    const updatedWorkout = { ...editWorkout };
    const newSet = {
      weight: 0,
      reps: 0,
      completed: true,
      id: Date.now() // Add a unique ID for the new set
    };
    updatedWorkout.exercises[exerciseIndex].sets.push(newSet);
    setEditWorkout(updatedWorkout);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updatedWorkout = { ...editWorkout };
    updatedWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
    setEditWorkout(updatedWorkout);
  };

  const handleToggleSetCompletion = (exerciseIndex, setIndex) => {
    const updatedWorkout = { ...editWorkout };
    updatedWorkout.exercises[exerciseIndex].sets[setIndex].completed = 
      !updatedWorkout.exercises[exerciseIndex].sets[setIndex].completed;
    setEditWorkout(updatedWorkout);
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

  // Get unique exercises from all workouts
  const uniqueExercises = useMemo(() => {
    const exercises = new Set();
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercises.add(exercise.name);
      });
    });
    return ['all', ...Array.from(exercises)];
  }, [workoutHistory]);

  // Filter workouts based on search, date range, and selected exercise
  const filteredWorkouts = useMemo(() => {
    return workoutHistory.filter(workout => {
      const matchesSearch = workout.templateName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = (!startDate || !endDate) ? true :
        isWithinInterval(parseISO(workout.startTime), {
          start: startDate,
          end: new Date(endDate.getTime() + 86400000) // Include end date by adding one day
        });
      const matchesExercise = selectedExercise === 'all' ? true :
        workout.exercises.some(ex => ex.name === selectedExercise);
      
      return matchesSearch && matchesDate && matchesExercise;
    });
  }, [workoutHistory, searchTerm, startDate, endDate, selectedExercise]);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Group workouts by date
    const dataByDate = new Map();
    
    filteredWorkouts.forEach(workout => {
      const date = format(parseISO(workout.startTime), 'MMM d');
      
      if (!dataByDate.has(date)) {
        dataByDate.set(date, {
          date,
          users: {}
        });
      }
      
      const dataPoint = dataByDate.get(date);
      const userId = workout.user?._id || 'unknown';
      
      if (!dataPoint.users[userId]) {
        dataPoint.users[userId] = {
          userId,
          name: workout.user?.name || 'Unknown User',
          color: workout.user?.color || '#888888',
          value: 0,
          detailedBreakdown: []
        };
      }
      
      let value = 0;
      const detailedBreakdown = [];
      
      if (selectedExercise !== 'all') {
        const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
        if (exercise) {
          if (chartMetric === 'volume') {
            value = exercise.sets.reduce((total, set) => 
              total + (set.completed ? set.weight * set.reps : 0), 0
            );
            
            // Add detailed breakdown
            exercise.sets.filter(set => set.completed).forEach((set, setIndex) => {
              detailedBreakdown.push({
                workoutName: workout.templateName,
                exerciseName: exercise.name,
                setNumber: setIndex + 1,
                weight: set.weight,
                reps: set.reps,
                volume: set.weight * set.reps
              });
            });
          } else { // maxWeight
            value = Math.max(...exercise.sets
              .filter(set => set.completed)
              .map(set => set.weight), 0
            );
          }
        }
      } else {
        if (chartMetric === 'volume') {
          value = calculateTotalVolume(workout.exercises);
          
          // Add detailed breakdown for all exercises
          workout.exercises.forEach(exercise => {
            exercise.sets.filter(set => set.completed).forEach((set, setIndex) => {
              detailedBreakdown.push({
                workoutName: workout.templateName,
                exerciseName: exercise.name,
                setNumber: setIndex + 1,
                weight: set.weight,
                reps: set.reps,
                volume: set.weight * set.reps
              });
            });
          });
        } else { // maxWeight
          const weights = workout.exercises.flatMap(ex =>
            ex.sets.filter(set => set.completed).map(set => set.weight)
          );
          value = weights.length > 0 ? Math.max(...weights) : 0;
        }
      }
      
      dataPoint.users[userId].value += value;
      dataPoint.users[userId].detailedBreakdown.push(...detailedBreakdown);
    });
    
    // Sort by date
    return Array.from(dataByDate.values()).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  }, [filteredWorkouts, selectedExercise, chartMetric]);

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
          const userData = entry?.payload?.users?.[entry.dataKey?.split('.')[1]];
          if (!userData) return null;
          
          return (
            <div key={index} style={{ 
              marginBottom: '16px',
              padding: '10px',
              backgroundColor: `${userData.color}10`,
              border: `1px solid ${userData.color}33`,
              borderRadius: '6px'
            }}>
              <p style={{ 
                margin: '0 0 8px', 
                fontWeight: 'bold',
                fontSize: '15px',
                color: userData.color || entry.color,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{userData.name}</span>
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

      {/* Calendar View - Moved to top and made larger */}
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
              
              const workoutsOnDate = workoutHistory.filter(workout =>
                isSameDay(parseISO(workout.startTime), date)
              );
              
              return workoutsOnDate.length > 0 ? 'has-workout' : null;
            }}
            onClickDay={(value) => {
              setSelectedDate(value);
              setStartDate(value);
              setEndDate(value);
            }}
            tileContent={({ date, view }) => {
              if (view !== 'month') return null;
              
              const workoutsOnDate = workoutHistory.filter(workout =>
                isSameDay(parseISO(workout.startTime), date)
              );
              
              if (workoutsOnDate.length > 0) {
                // Get unique users who worked out on this date
                const uniqueWorkoutsByUser = workoutsOnDate.reduce((acc, workout) => {
                  if (!acc[workout.user._id]) {
                    acc[workout.user._id] = workout;
                  }
                  return acc;
                }, {});
                
                const uniqueUsers = Object.values(uniqueWorkoutsByUser);
                console.log('Date:', date.toISOString(), 'Unique users:', uniqueUsers.length);
                
                let backgroundStyle = '';
                const userNames = [];
                
                if (uniqueUsers.length === 1) {
                  backgroundStyle = uniqueUsers[0].user.color;
                  userNames.push(uniqueUsers[0].user.name);
                } else if (uniqueUsers.length === 2) {
                  console.log('Two users found:', {
                    user1: uniqueUsers[0].user,
                    user2: uniqueUsers[1].user
                  });
                  
                  const color1 = uniqueUsers[0].user.color;
                  const color2 = uniqueUsers[1].user.color;
                  backgroundStyle = `linear-gradient(135deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`;
                  uniqueUsers.forEach(workout => {
                    userNames.push(workout.user.name);
                  });
                } else if (uniqueUsers.length > 2) {
                  const colors = uniqueUsers.slice(0, 3).map(workout => workout.user.color);
                  backgroundStyle = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 33.33%, ${colors[1]} 33.33%, ${colors[1]} 66.66%, ${colors[2]} 66.66%, ${colors[2]} 100%)`;
                  uniqueUsers.slice(0, 3).forEach(workout => {
                    userNames.push(workout.user.name);
                  });
                }
                
                console.log('Background style:', backgroundStyle);
                
                return (
                  <>
                    <div 
                      className="workout-tile"
                      style={{ background: backgroundStyle }}
                      title={userNames.join(', ')}
                    >
                      {/* Small user indicator */}
                      <div className="user-indicator" style={{ 
                        position: 'absolute', 
                        bottom: '4px', 
                        right: '4px',
                        fontSize: '10px',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        fontWeight: 'bold'
                      }}>
                        {uniqueUsers.length}
                      </div>
                    </div>
                  </>
                );
              }
              return null;
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search Workouts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start Date"
            className="MuiInputBase-input MuiOutlinedInput-input"
            wrapperClassName="datePicker"
            dateFormat="MMMM d, yyyy"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End Date"
            className="MuiInputBase-input MuiOutlinedInput-input"
            wrapperClassName="datePicker"
            dateFormat="MMMM d, yyyy"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Exercise</InputLabel>
            <Select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              label="Exercise"
            >
              {uniqueExercises.map(exercise => (
                <MenuItem key={exercise} value={exercise}>
                  {exercise === 'all' ? 'All Exercises' : exercise}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredWorkouts.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Progress Chart
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Compare mode toggle */}
              <ToggleButton
                value="compare"
                selected={compareMode}
                onChange={handleToggleCompareMode}
                size="small"
                color="primary"
                sx={{ 
                  borderRadius: '4px', 
                  height: '40px',
                  border: compareMode ? '1px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.23)',
                  backgroundColor: compareMode ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                }}
              >
                <CompareArrowsIcon fontSize="small" sx={{ mr: 0.5 }} />
                Compare
              </ToggleButton>
              
              {/* User selection */}
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="user-select-label" size="small">Users</InputLabel>
                <Select
                  labelId="user-select-label"
                  id="user-select"
                  multiple
                  size="small"
                  value={selectedUsers}
                  onChange={handleUserSelectionChange}
                  input={<OutlinedInput label="Users" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((userId) => {
                        const user = users.find(u => u._id === userId);
                        return user ? (
                          <Chip 
                            key={userId} 
                            label={user.name} 
                            size="small" 
                            style={{ 
                              backgroundColor: `${user.color}33`,
                              borderColor: user.color,
                              borderWidth: '1px',
                              borderStyle: 'solid'
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Checkbox checked={selectedUsers.indexOf(user._id) > -1} />
                      <ListItemText 
                        primary={user.name} 
                        primaryTypographyProps={{
                          style: { color: user.color }
                        }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Metric selection */}
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="metric-select-label" size="small">Metric</InputLabel>
                <Select
                  labelId="metric-select-label"
                  id="metric-select"
                  size="small"
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value)}
                  label="Metric"
                >
                  <MenuItem value="volume">Total Volume</MenuItem>
                  <MenuItem value="maxWeight">Max Weight</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Compare mode indicator */}
          {compareMode && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2, 
              p: 1, 
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              borderRadius: '4px',
              border: '1px solid rgba(25, 118, 210, 0.23)'
            }}>
              <Typography variant="body2" sx={{ flex: 1, color: 'primary.main' }}>
                Compare Mode: {comparePoints.length === 0 
                  ? 'Select first data point' 
                  : comparePoints.length === 1 
                    ? `First point selected (${comparePoints[0].date}). Select second point.` 
                    : `Comparing ${comparePoints[0].date} with ${comparePoints[1].date}`}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                color="primary" 
                onClick={handleResetCompare}
                startIcon={<CloseIcon />}
              >
                Reset
              </Button>
            </Box>
          )}
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={chartData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<SimpleTooltip />} />
              <Legend />
              
              {/* Render a line for each selected user */}
              {users
                .filter(user => selectedUsers.includes(user._id))
                .map((user, index) => (
                  <Line
                    key={user._id}
                    type="monotone"
                    dataKey={`users.${user._id}.value`}
                    name={user.name}
                    stroke={user.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                    strokeWidth={2}
                    dot={{ r: 5, style: { cursor: 'pointer' } }}
                    activeDot={{ r: 8, style: { cursor: 'pointer' } }}
                    connectNulls={true}
                  />
                ))}
                
              {/* Highlight selected compare points */}
              {comparePoints.map((point, index) => (
                <ReferenceDot
                  key={`ref-dot-${index}`}
                  x={point.date}
                  y={Object.values(point.users).find(u => selectedUsers.includes(u.userId))?.value || 0}
                  r={10}
                  fill="rgba(255, 0, 0, 0.3)"
                  stroke="red"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          {/* Dialog for detailed tooltip */}
          <Dialog
            open={tooltipDialogOpen}
            onClose={() => {
              console.log('Closing dialog');
              setTooltipDialogOpen(false);
            }}
            maxWidth="md"
            PaperProps={{
              style: { 
                minWidth: '500px',
                maxWidth: '90vw'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {tooltipData?.label || 'Workout Details'}
                </Typography>
                <Button 
                  onClick={() => setTooltipDialogOpen(false)}
                  size="small"
                >
                  Close
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {tooltipData && tooltipData.payload && (
                <DetailedTooltipContent 
                  payload={Object.entries(tooltipData.payload.users || {})
                    .filter(([userId]) => selectedUsers.includes(userId))
                    .map(([userId, userData]) => ({
                      dataKey: `users.${userId}.value`,
                      payload: tooltipData.payload
                    }))}
                  label={tooltipData.label}
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Compare Dialog */}
          <Dialog
            open={compareDialogOpen}
            onClose={() => setCompareDialogOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              style: { 
                maxWidth: '95vw',
                maxHeight: '90vh'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Comparing Workouts
                </Typography>
                <Button 
                  onClick={() => setCompareDialogOpen(false)}
                  size="small"
                >
                  Close
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {comparePoints.length === 2 ? (
                <Grid container spacing={2}>
                  {/* First point */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                        {comparePoints[0].date}
                      </Typography>
                      <DetailedTooltipContent 
                        payload={Object.entries(comparePoints[0].users || {})
                          .filter(([userId]) => selectedUsers.includes(userId))
                          .map(([userId, userData]) => ({
                            dataKey: `users.${userId}.value`,
                            payload: comparePoints[0]
                          }))}
                        label={comparePoints[0].date}
                      />
                    </Paper>
                  </Grid>
                  
                  {/* Second point */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                        {comparePoints[1].date}
                      </Typography>
                      <DetailedTooltipContent 
                        payload={Object.entries(comparePoints[1].users || {})
                          .filter(([userId]) => selectedUsers.includes(userId))
                          .map(([userId, userData]) => ({
                            dataKey: `users.${userId}.value`,
                            payload: comparePoints[1]
                          }))}
                        label={comparePoints[1].date}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  Please select two data points to compare.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleResetCompare} color="primary">
                Reset Selection
              </Button>
              <Button onClick={() => setCompareDialogOpen(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
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
        <DialogTitle>
          Edit Workout: {editWorkout?.templateName}
        </DialogTitle>
        <DialogContent>
          {editWorkout && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Workout Name"
                value={editWorkout.templateName}
                onChange={(e) => setEditWorkout({ ...editWorkout, templateName: e.target.value })}
                sx={{ mb: 3 }}
              />
              {editWorkout.exercises.map((exercise, exerciseIndex) => (
                <Box key={exercise.id} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {exercise.name}
                  </Typography>
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
                            key={setIndex}
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
                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', Number(e.target.value))}
                                size="small"
                                inputProps={{ style: { textAlign: 'right' } }}
                                disabled={!set.completed}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={set.reps}
                                onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', Number(e.target.value))}
                                size="small"
                                inputProps={{ style: { textAlign: 'right' } }}
                                disabled={!set.completed}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Checkbox
                                checked={set.completed}
                                onChange={() => handleToggleSetCompletion(exerciseIndex, setIndex)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
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
