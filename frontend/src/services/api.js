import axios from 'axios';
import { authUtils } from '../utils/auth';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://brainforge-tjls.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token
      authUtils.removeToken();
      
      // Redirect to home page (landing page) for re-login
      const publicPages = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;
      
      if (!publicPages.includes(currentPath)) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // API expects 'username' field
    formData.append('password', credentials.password);

    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Save token
    authUtils.setToken(response.data.access_token);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (fullName) => {
    const response = await api.put(`/profile?full_name=${encodeURIComponent(fullName)}`);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/profile');
    return response.data;
  },

  // Get all users (for testing)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Logout
  logout: () => {
    authUtils.removeToken();
  },

  // Get user stats
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Submit game score
  submitGameScore: async (scoreData) => {
    const response = await api.post('/games/score', scoreData);
    return response.data;
  },

  // Get game history
  getGameHistory: async (gameType = null, limit = 20) => {
    const params = new URLSearchParams();
    if (gameType) params.append('game_type', gameType);
    params.append('limit', limit);
    
    const response = await api.get(`/games/history?${params.toString()}`);
    return response.data;
  },

  // Get best score for a game
  getBestScore: async (gameType) => {
    const response = await api.get(`/games/best/${gameType}`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/leaderboard?limit=${limit}`);
    return response.data;
  },

  // Get platform stats (public, no auth required)
  getPlatformStats: async () => {
    const response = await api.get('/platform/stats');
    return response.data;
  },
};

export default api;
