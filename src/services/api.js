// src/services/api.js
import axios from 'axios';

// Determine the API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://gym-tracker-api.onrender.com' // Replace with your actual Render URL when deployed
    : 'http://localhost:5000');

// Log the API URL and environment for debugging
console.log('API URL:', API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

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
  getExercises: () => api.get('/api/exercises'),
  createExercise: (data) => api.post('/api/exercises', data),
  updateExercise: (id, data) => api.put(`/api/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/api/exercises/${id}`),
  createExercisesBulk: (exercises) => api.post('/api/exercises/bulk', { exercises }),

  // Workout Templates
  getWorkoutTemplates: () => api.get('/api/workout-templates'),
  createWorkoutTemplate: (data) => api.post('/api/workout-templates', data),
  updateWorkoutTemplate: (id, data) => api.put(`/api/workout-templates/${id}`, data),
  deleteWorkoutTemplate: (id) => api.delete(`/api/workout-templates/${id}`),
  importWorkoutTemplates: (templates) => api.post('/api/workout-templates/import', { templates }),

  // Completed Workouts
  getCompletedWorkouts: () => api.get('/api/completed-workouts'),
  createCompletedWorkout: (data) => api.post('/api/completed-workouts', data),
  getCompletedWorkoutById: (id) => api.get(`/api/completed-workouts/${id}`),
  updateCompletedWorkout: (id, data) => api.put(`/api/completed-workouts/${id}`, data),
  deleteCompletedWorkout: (id) => api.delete(`/api/completed-workouts/${id}`),

  // Users
  getUsers: () => api.get('/api/users'),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
};

export default apiService;
