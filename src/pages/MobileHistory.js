import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Collapse,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  FitnessCenter as FitnessCenterIcon,
  AccessTime as AccessTimeIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const MobileHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCompletedWorkouts();
      
      let fetchedWorkouts = [];
      if (response && Array.isArray(response)) {
        fetchedWorkouts = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        fetchedWorkouts = response.data;
      }
      
      console.log("Fetched workouts:", fetchedWorkouts);
      
      // Filter workouts for the current user
      const userWorkouts = fetchedWorkouts.filter(workout => {
        // Check if workout and user data exist
        if (!workout) return false;
        
        // Check for valid user reference
        if (!workout.user) return false;
        
        // Handle different user reference formats
        const workoutUserId = typeof workout.user === 'object' ? workout.user._id : workout.user;
        return workoutUserId === currentUser?.id;
      });
      
      // Sort by date (newest first)
      userWorkouts.sort((a, b) => {
        // Handle missing dates
        if (!a.date) return 1;
        if (!b.date) return -1;
        
        // Try to parse dates safely
        try {
          return new Date(b.date) - new Date(a.date);
        } catch (err) {
          console.error("Error sorting dates:", err);
          return 0;
        }
      });
      
      setWorkouts(userWorkouts);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load your workout history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (workoutId) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  const handleEditWorkout = (workout) => {
    navigate(`/history`, { state: { editWorkout: workout } });
  };

  const handleDeleteClick = (workout) => {
    setWorkoutToDelete(workout);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiService.deleteCompletedWorkout(workoutToDelete._id);
      setWorkouts(workouts.filter(w => w._id !== workoutToDelete._id));
      setSnackbar({
        open: true,
        message: 'Workout deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting workout:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete workout',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredWorkouts = workouts.filter(workout => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = workout.name?.toLowerCase().includes(searchLower);
    const templateMatch = workout.template?.name?.toLowerCase().includes(searchLower);
    const exerciseMatch = workout.exercises?.some(ex => 
      ex.name?.toLowerCase().includes(searchLower)
    );
    
    return nameMatch || templateMatch || exerciseMatch;
  });

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total volume for a workout
  const calculateTotalVolume = (exercises) => {
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) return 0;
    
    return exercises.reduce((total, exercise) => {
      if (!exercise || !exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
        return total;
      }
      
      const exerciseVolume = exercise.sets.reduce((exTotal, set) => {
        if (!set) return exTotal;
        const reps = Number(set.reps) || 0;
        const weight = Number(set.weight) || 0;
        return exTotal + (reps * weight);
      }, 0);
      
      return total + exerciseVolume;
    }, 0);
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Workout History
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 2, 
          p: 1, 
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : filteredWorkouts.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <FitnessCenterIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No workouts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm ? 'Try a different search term' : 'Start tracking your workouts to see them here'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/mobile')}
          >
            Track a Workout
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          {filteredWorkouts.map((workout) => (
            <Card 
              key={workout._id} 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'visible'
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {workout.name || (workout.template ? workout.template.name : 'Unnamed Workout')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<CalendarIcon fontSize="small" />}
                        label={formatDate(workout.date)}
                        size="small"
                        sx={{ mr: 1, mb: 1, bgcolor: 'rgba(142, 45, 226, 0.1)' }}
                      />
                      <Chip 
                        icon={<AccessTimeIcon fontSize="small" />}
                        label={formatDuration(workout.duration)}
                        size="small"
                        sx={{ mr: 1, mb: 1, bgcolor: 'rgba(142, 45, 226, 0.1)' }}
                      />
                      <Chip 
                        icon={<FitnessCenterIcon fontSize="small" />}
                        label={`${workout.exercises?.length || 0} exercises`}
                        size="small"
                        sx={{ mb: 1, bgcolor: 'rgba(142, 45, 226, 0.1)' }}
                      />
                    </Box>
                  </Box>
                  <IconButton 
                    onClick={() => handleToggleExpand(workout._id)}
                    sx={{ 
                      p: 1,
                      bgcolor: 'rgba(142, 45, 226, 0.1)',
                      '&:hover': { bgcolor: 'rgba(142, 45, 226, 0.2)' }
                    }}
                  >
                    {expandedWorkout === workout._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                <Collapse in={expandedWorkout === workout._id} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Exercises:
                    </Typography>
                    <List disablePadding>
                      {workout.exercises?.map((exercise, index) => (
                        <React.Fragment key={`${workout._id}-ex-${index}`}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem 
                            disablePadding 
                            sx={{ 
                              py: 1.5,
                              px: 1,
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body1" component="div" sx={{ fontWeight: 500 }}>
                                  {exercise.name}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  {exercise.sets?.map((set, setIndex) => (
                                    <Chip
                                      key={`${workout._id}-ex-${index}-set-${setIndex}`}
                                      label={`${set.weight || 0} kg × ${set.reps || 0}`}
                                      size="small"
                                      sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Volume: <strong>{calculateTotalVolume(workout.exercises).toLocaleString()} kg</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
              
              <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => handleEditWorkout(workout)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(workout)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Workout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this workout? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MobileHistory;
