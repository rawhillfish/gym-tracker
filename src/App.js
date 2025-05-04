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
import UserManager from './pages/UserManager';
import Management from './pages/Management';
import DebugWeightPrefill from './pages/DebugWeightPrefill';

function App() {
  return (
    <Router>
      <CssBaseline />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/management" element={<Management />} />
          <Route path="/exercises" element={<ExerciseManager />} />
          <Route path="/users" element={<UserManager />} />
          <Route path="/workouts" element={<WorkoutBuilder />} />
          <Route path="/active" element={<ActiveWorkout />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/debug-weight-prefill" element={<DebugWeightPrefill />} />
          <Route path="/" element={<Navigate to="/active" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
