import React, { useState, useEffect, useMemo } from 'react';
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
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
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
  ResponsiveContainer
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
      // Use environment variable for API URL or fallback to development URL
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/completed-workouts`);
      const data = await response.json();
      console.log('Fetched workouts:', data);
      setWorkoutHistory(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Use environment variable for API URL or fallback to development URL
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const [editWorkout, setEditWorkout] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
      const response = await fetch(`http://localhost:5000/api/completed-workouts/${workoutId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete workout: ${response.status} ${response.statusText}`);
      }
      
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
      const response = await fetch(`http://localhost:5000/api/completed-workouts/${editWorkout._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editWorkout)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update workout: ${response.status} ${response.statusText}`);
      }
      
      const updatedWorkout = await response.json();
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
    const data = [];
    const sortedWorkouts = [...filteredWorkouts].sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    );

    sortedWorkouts.forEach(workout => {
      const date = format(parseISO(workout.startTime), 'MMM d');
      const dataPoint = { date };

      if (selectedExercise !== 'all') {
        const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
        if (exercise) {
          if (chartMetric === 'volume') {
            dataPoint.value = exercise.sets.reduce((total, set) => 
              total + (set.completed ? set.weight * set.reps : 0), 0
            );
          } else { // maxWeight
            dataPoint.value = Math.max(...exercise.sets
              .filter(set => set.completed)
              .map(set => set.weight)
            );
          }
        }
      } else {
        if (chartMetric === 'volume') {
          dataPoint.value = calculateTotalVolume(workout.exercises);
        } else {
          dataPoint.value = Math.max(...workout.exercises.flatMap(ex =>
            ex.sets.filter(set => set.completed).map(set => set.weight)
          ));
        }
      }
      
      if (dataPoint.value) {
        data.push(dataPoint);
      }
    });

    return data;
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Calendar View</Typography>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              tileClassName="calendar-tile"
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
                    backgroundStyle = `linear-gradient(90deg, ${color1} 0%, ${color1} 50%, ${color2} 50%, ${color2} 100%)`;
                    uniqueUsers.forEach(workout => {
                      userNames.push(workout.user.name);
                    });
                  } else if (uniqueUsers.length > 2) {
                    const colors = uniqueUsers.slice(0, 3).map(workout => workout.user.color);
                    backgroundStyle = `linear-gradient(45deg, ${colors[0]} 0%, ${colors[0]} 33.33%, ${colors[1]} 33.33%, ${colors[1]} 66.66%, ${colors[2]} 66.66%, ${colors[2]} 100%)`;
                    uniqueUsers.slice(0, 3).forEach(workout => {
                      userNames.push(workout.user.name);
                    });
                  }
                  
                  console.log('Background style:', backgroundStyle);
                  
                  return (
                    <div 
                      className="workout-tile"
                      style={{ background: backgroundStyle }}
                      title={userNames.join(', ')}
                    />
                  );
                }
                return null;
              }}
              onClickDay={(value) => {
                setSelectedDate(value);
                setStartDate(value);
                setEndDate(value);
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Grid container spacing={2} alignItems="center">
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
          </Paper>
        </Grid>
      </Grid>

      {filteredWorkouts.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Progress Chart
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                size="small"
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value)}
              >
                <MenuItem value="volume">Total Volume</MenuItem>
                <MenuItem value="maxWeight">Max Weight</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={chartMetric === 'volume' ? 'Volume (kg)' : 'Max Weight (kg)'}
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
