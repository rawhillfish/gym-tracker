import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Timer from './Timer';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gym Tracker
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" component={RouterLink} to="/active">
            Track Workout
          </Button>
          <Button color="inherit" component={RouterLink} to="/history">
            History
          </Button>
          <Button color="inherit" component={RouterLink} to="/management">
            Management
          </Button>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
          <Timer />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
