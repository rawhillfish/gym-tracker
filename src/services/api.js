// src/services/api.js
// Using native fetch API instead of axios

// Use full URLs for API calls
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://gym-tracker-api.onrender.com' 
    : 'http://localhost:5000');

// Log the API URL and environment for debugging
console.log('API URL:', API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
};

// Timeout function for fetch
const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    )
  ]);
};

// Create a request function with retry capability
const MAX_RETRIES = 3;
const request = async (url, options, retryCount = 0) => {
  try {
    // Log outgoing requests
    console.log(`API Request [${options.method}]:`, url);
    console.log('Request options:', {
      method: options.method,
      headers: options.headers,
      bodyLength: options.body ? options.body.length : 0
    });
    
    // Make the request
    const fullUrl = `${API_URL}${url}`;
    console.log('Full URL:', fullUrl);
    
    const response = await fetchWithTimeout(fullUrl, options);
    
    console.log('Response status:', response.status);
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Response error data:', errorData);
      
      const error = new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      error.url = url;
      error.method = options.method.toLowerCase();
      throw error;
    }
    
    // Parse response
    if (response.status === 204) {
      return null; // No content
    }
    
    return await response.json();
  } catch (error) {
    // Log client errors
    console.error('API Client Error:', {
      status: error.status,
      data: error.data,
      url,
      method: options.method.toLowerCase()
    });
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying request to ${url} (Attempt ${retryCount + 1} of ${MAX_RETRIES})`);
      const delay = (retryCount + 1) * 1000; // 1s, 2s, 3s
      await new Promise(resolve => setTimeout(resolve, delay));
      return request(url, options, retryCount + 1);
    }
    
    throw error;
  }
};

// Auth token storage
let authToken = null;

// API service object
const apiService = {
  // Set auth token for future requests
  setAuthToken(token) {
    authToken = token;
    localStorage.setItem('token', token);
  },
  
  // Remove auth token
  removeAuthToken() {
    authToken = null;
    localStorage.removeItem('token');
  },
  
  // Helper to get headers with auth token if available
  getHeaders() {
    const headers = { ...defaultHeaders };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  },
  
  // Authentication
  async register(data) {
    console.log('Register attempt with data:', {
      email: data.email,
      passwordLength: data.password ? data.password.length : 0,
      name: data.name
    });
    
    try {
      // Make sure we're not sending any auth token with the register request
      const registerHeaders = { ...defaultHeaders };
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: registerHeaders,
        body: JSON.stringify(data)
      });
      
      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Register error data:', errorData);
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const responseData = await response.json();
      console.log('Registration successful, response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Registration failed with error:', error);
      throw error;
    }
  },
  
  async login(data) {
    console.log('Login attempt with data:', {
      email: data.email,
      passwordLength: data.password ? data.password.length : 0
    });
    
    try {
      // Make sure we're not sending any auth token with the login request
      const loginHeaders = { ...defaultHeaders };
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: loginHeaders,
        body: JSON.stringify(data)
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error data:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }
      
      const responseData = await response.json();
      console.log('Login successful, response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Login failed with error:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    try {
      console.log('Getting current user with token');
      
      const response = await request('/api/auth/me', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      console.log('Current user response:', response);
      return response;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },
  
  async updatePassword(data) {
    return request('/api/auth/update-password', {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },
  
  // Health check
  async checkHealth() {
    return request('/api/health', {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  // Exercises
  async getExercises(params) {
    const queryParams = params ? `?${new URLSearchParams(params)}` : '';
    return request(`/api/exercises${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  async createExercise(data) {
    return request('/api/exercises', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },
  
  async updateExercise(id, data) {
    return request(`/api/exercises/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },
  
  async retireExercise(id) {
    return request(`/api/exercises/${id}/retire`, {
      method: "PATCH",
      headers: this.getHeaders()
    });
  },
  
  async hardDeleteExercise(id) {
    return request(`/api/exercises/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  },
  
  async restoreExercise(id) {
    return request(`/api/exercises/${id}/restore`, {
      method: "PATCH",
      headers: this.getHeaders()
    });
  },
  
  async createExercisesBulk(exercises) {
    return request('/api/exercises/bulk', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ exercises })
    });
  },
  
  // Workout Templates
  async getWorkoutTemplates(options = {}) {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (options.includeDeleted) {
        params.append('includeDeleted', 'true');
      }
      if (options.includeGlobal) {
        params.append('includeGlobal', 'true');
      }
      if (options.includeUserTemplates) {
        params.append('includeUserTemplates', 'true');
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/workout-templates${queryString}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      throw error;
    }
  },
  
  async getUserWorkoutTemplates() {
    return request('/api/workout-templates?includeUserTemplates=true', {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  async getGlobalWorkoutTemplates() {
    return request('/api/workout-templates?includeGlobal=true', {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  async getWorkoutTemplate(id) {
    try {
      return await request(`/api/workout-templates/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Error fetching workout template:', error);
      throw error;
    }
  },
  
  async createWorkoutTemplate(templateData) {
    try {
      return await request('/api/workout-templates', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(templateData)
      });
    } catch (error) {
      console.error('Error creating workout template:', error);
      throw error;
    }
  },
  
  async updateWorkoutTemplate(id, templateData) {
    try {
      // Debug info
      console.log('Updating workout template with ID:', id);
      console.log('Auth token in headers:', `Bearer ${authToken}`);
      console.log('Template data being sent:', templateData);
      
      return await request(`/api/workout-templates/${id}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(templateData)
      });
    } catch (error) {
      console.error('Error updating workout template', id, ':', error);
      throw error;
    }
  },
  
  async deleteWorkoutTemplate(id) {
    try {
      return await request(`/api/workout-templates/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Error deleting workout template:', error);
      throw error;
    }
  },
  
  async permanentlyDeleteWorkoutTemplate(id) {
    try {
      return await request(`/api/workout-templates/${id}/permanent`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Error permanently deleting workout template:', error);
      throw error;
    }
  },
  
  async restoreWorkoutTemplate(id) {
    try {
      return await request(`/api/workout-templates/${id}/restore`, {
        method: "PATCH",
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Error restoring workout template:', error);
      throw error;
    }
  },
  
  async importWorkoutTemplates(templates) {
    try {
      return await request('/api/workout-templates/import', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ templates })
      });
    } catch (error) {
      console.error('Error importing workout templates:', error);
      throw error;
    }
  },
  
  // Keep-alive
  keepAlive() {
    return request('/api/completed-workouts/keep-alive', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  },
  
  // Completed Workouts
  async getCompletedWorkouts() {
    try {
      return await request('/api/completed-workouts', {
        method: 'GET',
        headers: this.getHeaders()
      });
    } catch (error) {
      console.error('Error fetching completed workouts:', error);
      throw error;
    }
  },
  
  async createCompletedWorkout(data) {
    try {
      console.log('Creating completed workout with data:', data);
      
      // Create a deep copy to avoid modifying the original data
      const workoutData = JSON.parse(JSON.stringify(data));
      
      // Ensure exercises have proper structure
      if (workoutData.exercises) {
        workoutData.exercises = workoutData.exercises.map(exercise => {
          // Make sure sets is an array
          if (!Array.isArray(exercise.sets)) {
            exercise.sets = [];
          }
          return exercise;
        });
      }
      
      return await request('/api/completed-workouts', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(workoutData)
      });
    } catch (error) {
      console.error('Error creating completed workout:', error);
      throw error;
    }
  },
  
  async getCompletedWorkoutById(id) {
    return request(`/api/completed-workouts/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  async updateCompletedWorkout(id, data) {
    return request(`/api/completed-workouts/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },
  
  async deleteCompletedWorkout(id) {
    return request(`/api/completed-workouts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  },
  
  // Users
  async getUsers(params) {
    const queryParams = params ? `?${new URLSearchParams(params)}` : '';
    return request(`/api/users${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  async getUserById(id) {
    return request(`/api/users/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
  },
  
  async createUser(data) {
    return request('/api/users', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },
  
  async updateUser(id, data) {
    return request(`/api/users/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },
  
  async retireUser(id) {
    // Use the existing soft delete endpoint instead of a separate retire endpoint
    return request(`/api/users/${id}`, {
      method: "DELETE",
      headers: this.getHeaders()
    });
  },
  
  async hardDeleteUser(id) {
    // Use the permanent delete endpoint for hard deletion
    return request(`/api/users/${id}/permanent`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  },
  
  async getUserEmail(id) {
    return request(`/api/users/${id}/email`, {
      method: 'GET',
      headers: this.getHeaders()
    });
  },

  async resetUserPassword(id) {
    return request(`/api/users/${id}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  },

  async changePassword(data) {
    return request('/api/auth/changepassword', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
  },

  async restoreUser(id) {
    return request(`/api/users/${id}/restore`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
  }
};

// Initialize auth token from localStorage if available
const storedToken = localStorage.getItem('token');
if (storedToken) {
  apiService.setAuthToken(storedToken);
}

export default apiService;
