import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.PROD 
  ? 'stylewasail-webtechmvp-production.up.railway.app'  // Production URL
  : 'http://localhost:5000/api/v1';  // Development URL

const isDev = false; // Set to false to use real API calls

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Changed to false since we're using token-based auth
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making API request:', config);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response);
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    console.log('Making registration request with:', userData);
    const response = await api.post('/users/register', userData);
    console.log('Registration response:', response);
    return response;
  },
  login: async (credentials) => {
    console.log('Making login request with:', credentials);
    const response = await api.post('/users/login', credentials);
    console.log('Login response:', response);
    return response;
  },
  getMe: () => api.get('/users/me'),
  updateDetails: (userData) => api.put('/users/updatedetails', userData),
  updatePassword: (passwords) => api.put('/users/updatepassword', passwords)
};

// Outfit API
export const outfitAPI = {
  getAll: () => api.get('/outfits'),
  getOne: (id) => api.get(`/outfits/${id}`),
  create: (outfitData) => api.post('/outfits', outfitData),
  update: (id, outfitData) => api.put(`/outfits/${id}`, outfitData),
  delete: (id) => api.delete(`/outfits/${id}`),
  like: (id) => api.post(`/outfits/${id}/like`),
  unlike: (id) => api.delete(`/outfits/${id}/like`),
  comment: (id, comment) => api.post(`/outfits/${id}/comments`, { comment }),
  deleteComment: (outfitId, commentId) => api.delete(`/outfits/${outfitId}/comments/${commentId}`)
};

// User API
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, userData) => api.put(`/users/${id}`, userData),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`)
};

// Search API
export const searchAPI = {
  search: (query) => api.get(`/search?q=${query}`),
  searchOutfits: (query) => api.get(`/search/outfits?q=${query}`),
  searchUsers: (query) => api.get(`/search/users?q=${query}`)
};

// Rental API
export const rentalAPI = {
  getMyRentals: () => api.get('/rentals/my-rentals'),
  getRentalHistory: () => api.get('/rentals/history'),
  createRental: (rentalData) => api.post('/rentals/request', rentalData),
  updateRental: (id, rentalData) => api.put(`/rentals/${id}`, rentalData),
  deleteRental: (id) => api.delete(`/rentals/${id}`),
  acceptRental: (id) => api.put(`/rentals/${id}/accept`),
  declineRental: (id) => api.put(`/rentals/${id}/decline`),
  requestExtension: (id, extensionData) => api.post(`/rentals/${id}/extension`, extensionData),
  uploadReceipt: (id, formData) => api.post(`/rentals/${id}/receipt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadExtensionReceipt: (id, formData) => api.post(`/rentals/${id}/extension-receipt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  acceptExtension: (id) => api.put(`/rentals/${id}/accept-extension`),
  declineExtension: (id) => api.put(`/rentals/${id}/decline-extension`),
};

export default api; 