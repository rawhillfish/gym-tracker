import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import './App.css';

// Import components with explicit paths
import Navbar from './components/Navbar';
import WorkoutBuilder from './pages/WorkoutBuilder';
import ActiveWorkout from './pages/ActiveWorkout';
import WorkoutHistory from './pages/WorkoutHistory';
import ExerciseManager from './pages/ExerciseManager';
import Management from './pages/Management';

function App() {
  return (
    <Router>
      <CssBaseline />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/management" element={<Management />} />
          <Route path="/exercises" element={<ExerciseManager />} />
          <Route path="/workouts" element={<WorkoutBuilder />} />
          <Route path="/active" element={<ActiveWorkout />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/" element={<Navigate to="/active" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
