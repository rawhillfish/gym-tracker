// src/services/api.js
import axios from 'axios';

// Using relative URLs with proxy in package.json
const API_URL = '';

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
  withCredentials: false,
  timeout: 10000, // 10 second timeout
});

// Add retry functionality
const MAX_RETRIES = 3;
const retryDelay = (retryCount) => {
  return retryCount * 1000; // 1s, 2s, 3s
};

// Create a retry function
const retryRequest = async (config, error) => {
  const retryCount = config.retryCount || 0;
  
  // Check if we've maxed out the retries
  if (retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }
  
  // Increase the retry count
  config.retryCount = retryCount + 1;
  
  // Create a new promise to handle the retry
  return new Promise((resolve) => {
    console.log(`Retrying request to ${config.url} (Attempt ${config.retryCount} of ${MAX_RETRIES})`);
    setTimeout(() => resolve(api(config)), retryDelay(config.retryCount));
  });
};

// Add request interceptor for logging and authentication if needed
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests
    console.log(`API Request [${config.method.toUpperCase()}]:`, config.url);
    
    // You can add auth token here if implementing authentication
    return config;
  },
  (error) => {
    console.error('API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Success [${response.config.method.toUpperCase()} ${response.config.url}]:`, response.status);
    return response;
  },
  (error) => {
    const { config } = error;
    
    // Only retry on network errors, timeouts, or 5xx errors
    const shouldRetry = (
      !error.response || 
      error.code === 'ECONNABORTED' || 
      (error.response && error.response.status >= 500)
    );
    
    if (shouldRetry && config) {
      // Log the error before retrying
      if (error.code === 'ECONNABORTED') {
        console.error('API Timeout Error:', error.message, 'for URL:', config.url);
      } else if (error.response) {
        console.error('API Server Error:', {
          status: error.response.status,
          url: config.url,
          method: config.method
        });
      } else if (error.request) {
        console.error('API No Response Error:', {
          url: config.url,
          method: config.method
        });
      }
      
      // Attempt to retry the request
      return retryRequest(config, error);
    }
    
    // For errors we don't want to retry, log and reject
    if (error.response) {
      // Client errors (4xx)
      console.error('API Client Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method
      });
    } else if (error.code === 'ECONNABORTED' && !shouldRetry) {
      // Timeout error that we're not retrying (max retries reached)
      console.error('API Max Retries Reached for Timeout:', error.message);
    } else if (error.request && !shouldRetry) {
      // No response error that we're not retrying (max retries reached)
      console.error('API Max Retries Reached for No Response Error');
    } else {
      // Other errors
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Health check
  checkHealth: () => api.get('/health'),
  // Exercises
  getExercises: () => api.get('/exercises'),
  createExercise: (data) => api.post('/exercises', data),
  updateExercise: (id, data) => api.put(`/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/exercises/${id}`),
  createExercisesBulk: (exercises) => api.post('/exercises/bulk', { exercises }),

  // Workout Templates
  getWorkoutTemplates: () => api.get('/workout-templates'),
  createWorkoutTemplate: (data) => api.post('/workout-templates', data),
  updateWorkoutTemplate: (id, data) => api.put(`/workout-templates/${id}`, data),
  deleteWorkoutTemplate: (id) => api.delete(`/workout-templates/${id}`),
  importWorkoutTemplates: (templates) => api.post('/workout-templates/import', { templates }),

  // Completed Workouts
  getCompletedWorkouts: () => api.get('/completed-workouts'),
  createCompletedWorkout: (data) => api.post('/completed-workouts', data),
  getCompletedWorkoutById: (id) => api.get(`/completed-workouts/${id}`),
  updateCompletedWorkout: (id, data) => api.put(`/completed-workouts/${id}`, data),
  deleteCompletedWorkout: (id) => api.delete(`/completed-workouts/${id}`),

  // Users
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

export default apiService;
