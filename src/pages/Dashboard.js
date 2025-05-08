import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  PhoneAndroidOutlined as MobileIcon,
  ComputerOutlined as WebIcon,
  HistoryOutlined as HistoryIcon
} from '@mui/icons-material';
import apiService from '../services/api';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [recentWorkout, setRecentWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  // Common button style to ensure consistency
  const buttonStyle = {
    py: 3,
    fontSize: '1.2rem',
    borderRadius: 2,
    height: '72px', // Taller buttons
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Fetch the most recent workout
  useEffect(() => {
    const fetchRecentWorkout = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const workouts = await apiService.getCompletedWorkouts({
          limit: 1,
          userId: currentUser.id
        });
        
        if (Array.isArray(workouts) && workouts.length > 0) {
          setRecentWorkout(workouts[0]);
        }
      } catch (error) {
        console.error('Error fetching recent workout:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentWorkout();
  }, [currentUser]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        mt: 3, 
        mb: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '80vh',
        justifyContent: 'center'
      }}
    >
      {/* Main Action Buttons */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          mb: 3
        }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          Track Your Workout
        </Typography>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/mobile"
          fullWidth
          size="large"
          sx={buttonStyle}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MobileIcon sx={{ fontSize: 36, mr: 2 }} />
            <span>Track Mobile Workout</span>
          </Box>
        </Button>
        
        <Button
          variant="contained"
          component={RouterLink}
          to="/active"
          fullWidth
          size="large"
          sx={buttonStyle}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WebIcon sx={{ fontSize: 36, mr: 2 }} />
            <span>Track Web Workout</span>
          </Box>
        </Button>
      </Paper>

      {/* Recent Workout Section */}
      <Paper 
        elevation={2}
        sx={{ p: 3 }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          Most Recent Workout
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : recentWorkout ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {recentWorkout.templateName}
              </Typography>
              <Chip 
                label={formatDate(recentWorkout.startTime)} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {recentWorkout.exercises.length} exercises • {recentWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component={RouterLink}
                to={`/history?workout=${recentWorkout._id}`}
                fullWidth
                startIcon={<HistoryIcon />}
                sx={{ borderRadius: 2 }}
              >
                View Details
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No recent workouts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start tracking to see your progress
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
