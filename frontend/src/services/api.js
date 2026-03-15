import axios from 'axios';
import { authUtils } from '../utils/auth';

// Base API URL - use environment variable or default to API Gateway
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('🔗 API URL:', API_URL, '| Production:', import.meta.env.PROD);

// Simple request cache to prevent 429 errors
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

function getCachedData(url) {
  const cached = requestCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(url, data) {
  requestCache.set(url, { data, timestamp: Date.now() });
}

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

// Handle 401 errors (unauthorized) and 429 rate-limit errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token
      authUtils.removeToken();
      
      // Only redirect if NOT already on a public page
      // On login/register, we don't want to redirect (let the error display)
      const currentPath = window.location.pathname;
      const baseUrl = import.meta.env.BASE_URL || '/';
      const publicPaths = [baseUrl, `${baseUrl}login`, `${baseUrl}register`];
      
      if (!publicPaths.some(path => currentPath === path || currentPath === path.replace(/\/$/, ''))) {
        // Redirect to home with proper base URL
        window.location.href = baseUrl;
      }
    } else if (error.response?.status === 429) {
      // Rate-limited - retry after 2 seconds
      console.warn('⚠️ Rate limited (429). Retrying...');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api.request(error.config));
        }, 2000);
      });
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
    const cached = getCachedData('/stats');
    if (cached) return cached;
    
    const response = await api.get('/stats');
    setCachedData('/stats', response.data);
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
    const cached = getCachedData(`/leaderboard?limit=${limit}`);
    if (cached) return cached;
    
    const response = await api.get(`/leaderboard?limit=${limit}`);
    setCachedData(`/leaderboard?limit=${limit}`, response.data);
    return response.data;
  },

  // Get platform stats (public, no auth required)
  getPlatformStats: async () => {
    const cached = getCachedData('/platform/stats');
    if (cached) return cached;
    
    const response = await api.get('/platform/stats');
    setCachedData('/platform/stats', response.data);
    return response.data;
  },
};

export default api;
