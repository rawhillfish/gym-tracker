// src/services/api.js
import axios from 'axios';

// Use full URLs for API calls
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://gym-tracker-api.onrender.com' 
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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
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
    // Log more details for DELETE requests to help debug the soft deletion issue
    if (response.config.method.toUpperCase() === 'DELETE' && response.config.url.includes('/api/exercises/')) {
      console.log('DELETE Exercise Response Data:', response.data);
    }
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
  getExercises: (params) => api.get('/api/exercises', { params }),
  createExercise: (data) => api.post('/api/exercises', data),
  updateExercise: (id, data) => api.put(`/api/exercises/${id}`, data),
  retireExercise: (id) => api.delete(`/api/exercises/${id}`),
  hardDeleteExercise: (id) => api.delete(`/api/exercises/${id}/permanent`),
  restoreExercise: (id) => api.patch(`/api/exercises/${id}/restore`),
  createExercisesBulk: (exercises) => api.post('/api/exercises/bulk', { exercises }),

  // Workout Templates
  getWorkoutTemplates(params) {
    return api.get('/api/workout-templates', { params });
  },
  createWorkoutTemplate(data) {
    return api.post('/api/workout-templates', data);
  },
  updateWorkoutTemplate(id, data) {
    return api.put(`/api/workout-templates/${id}`, data);
  },
  retireWorkoutTemplate(id) {
    return api.delete(`/api/workout-templates/${id}`);
  },
  restoreWorkoutTemplate(id) {
    return api.patch(`/api/workout-templates/${id}/restore`);
  },
  hardDeleteWorkoutTemplate(id) {
    return api.delete(`/api/workout-templates/${id}/permanent`);
  },
  importWorkoutTemplates(templates) {
    return api.post('/api/workout-templates/import', { templates });
  },

  // Completed Workouts
  getCompletedWorkouts: () => api.get('/api/completed-workouts'),
  createCompletedWorkout: (data) => api.post('/api/completed-workouts', data),
  getCompletedWorkoutById: (id) => api.get(`/api/completed-workouts/${id}`),
  updateCompletedWorkout: (id, data) => api.put(`/api/completed-workouts/${id}`, data),
  deleteCompletedWorkout: (id) => api.delete(`/api/completed-workouts/${id}`),

  // Users
  getUsers: (params) => api.get('/api/users', { params }),
  getUserById: (id) => api.get(`/api/users/${id}`),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  retireUser: (id) => api.delete(`/api/users/${id}`),
  hardDeleteUser: (id) => api.delete(`/api/users/${id}/permanent`),
  restoreUser: (id) => api.patch(`/api/users/${id}/restore`),
};

export default apiService;
