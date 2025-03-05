import React, { useState, useEffect, useCallback } from 'react';
import { Button, Box } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const playBeep = useCallback(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (isActive) { // Only play sound if timer was actually running
        playBeep();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, playBeep]);

  const startTimer = () => {
    setTimeLeft(60);
    setIsActive(true);
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant={isActive ? "contained" : "outlined"}
        color="inherit"
        onClick={startTimer}
        startIcon={<TimerIcon />}
        disabled={isActive}
        size="small"
      >
        {timeLeft > 0 ? formatTime(timeLeft) : "60s"}
      </Button>
    </Box>
  );
};

export default Timer;
