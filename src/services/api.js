// src/services/api.js
import axios from 'axios';

// Determine the API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://gym-tracker-api.onrender.com' // Replace with your actual Render URL when deployed
    : 'http://localhost:5000');

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if implementing authentication
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Exercises
  getExercises: () => api.get('/exercises'),
  createExercise: (data) => api.post('/exercises', data),
  updateExercise: (id, data) => api.put(`/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/exercises/${id}`),

  // Workout Templates
  getWorkoutTemplates: () => api.get('/workout-templates'),
  createWorkoutTemplate: (data) => api.post('/workout-templates', data),
  updateWorkoutTemplate: (id, data) => api.put(`/workout-templates/${id}`, data),
  deleteWorkoutTemplate: (id) => api.delete(`/workout-templates/${id}`),

  // Completed Workouts
  getCompletedWorkouts: () => api.get('/completed-workouts'),
  createCompletedWorkout: (data) => api.post('/completed-workouts', data),
  getCompletedWorkoutById: (id) => api.get(`/completed-workouts/${id}`),

  // Users
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

export default apiService;
