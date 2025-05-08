import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set token in axios headers and localStorage
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      apiService.setAuthToken(token);
    } else {
      localStorage.removeItem('token');
      apiService.removeAuthToken();
    }
    setToken(token);
  };

  // Register user
  const register = async (email, password, name, color) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.register({ email, password, name, color });
      setCurrentUser(response.user);
      setAuthToken(response.token);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.login({ email, password });
      setCurrentUser(response.user);
      setAuthToken(response.token);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.updatePassword({ currentPassword, newPassword });
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      const errorMessage = error.data?.error || error.message || 'Failed to update password';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          apiService.setAuthToken(token);
          const userData = await apiService.getCurrentUser();
          
          if (userData && userData.data) {
            setCurrentUser({
              id: userData.data.id,
              name: userData.data.name,
              color: userData.data.color,
              isAdmin: userData.data.isAdmin
            });
          } else {
            setCurrentUser(null);
            setAuthToken(null);
          }
        } catch (error) {
          console.error('Error checking login status:', error);
          setCurrentUser(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token]);

  // Check if user is admin
  const isAdmin = () => {
    console.log('isAdmin check, currentUser:', currentUser);
    return currentUser?.isAdmin === true;
  };

  // Context value
  const value = {
    currentUser,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updatePassword,
    isAdmin,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
