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
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import MobileTrack from './pages/MobileTrack';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Import AuthProvider
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard - shown after login */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/management" element={
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            } />
            <Route path="/exercises" element={
              <ProtectedRoute>
                <ExerciseManager />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UserManager />
              </ProtectedRoute>
            } />
            <Route path="/workouts" element={
              <ProtectedRoute>
                <WorkoutBuilder />
              </ProtectedRoute>
            } />
            <Route path="/active" element={
              <ProtectedRoute>
                <ActiveWorkout />
              </ProtectedRoute>
            } />
            <Route path="/mobile" element={
              <ProtectedRoute>
                <MobileTrack />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <WorkoutHistory />
              </ProtectedRoute>
            } />
            <Route path="/debug-weight-prefill" element={
              <ProtectedRoute>
                <DebugWeightPrefill />
              </ProtectedRoute>
            } />
            
            {/* Redirect root to landing page */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
