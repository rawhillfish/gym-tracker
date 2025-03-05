import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';

const WorkoutTimer = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    // Calculate initial elapsed time
    const start = startTime ? new Date(startTime) : new Date();
    const initialElapsed = Math.floor((new Date() - start) / 1000);
    setElapsedTime(initialElapsed > 0 ? initialElapsed : 0);
    
    // Set up interval to update elapsed time every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date() - start) / 1000);
      setElapsedTime(elapsed > 0 ? elapsed : 0);
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [startTime]);
  
  // Format time as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:`;
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };
  
  return (
    <Chip
      icon={<TimerIcon />}
      label={formatTime(elapsedTime)}
      color="primary"
      variant="outlined"
      sx={{ fontWeight: 'medium' }}
    />
  );
};

export default WorkoutTimer;
