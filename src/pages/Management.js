import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container } from '@mui/material';
import ExerciseManager from './ExerciseManager';
import WorkoutBuilder from './WorkoutBuilder';

// TabPanel component to handle tab content display
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`management-tabpanel-${index}`}
      aria-labelledby={`management-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for accessibility
function a11yProps(index) {
  return {
    id: `management-tab-${index}`,
    'aria-controls': `management-tabpanel-${index}`,
  };
}

const Management = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Management
        </Typography>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="management tabs"
            variant="fullWidth"
          >
            <Tab label="Exercises" {...a11yProps(0)} />
            <Tab label="Workouts" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={activeTab} index={0}>
          <ExerciseManager isSubTab={true} />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <WorkoutBuilder isSubTab={true} />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Management;
