import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use(config => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      Cookies.remove('auth_token');
      // Don't redirect automatically to prevent loops
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AuthService {
  // Store user data in memory
  static user = null;

  // Get stored token
  static getToken() {
    return Cookies.get('auth_token');
  }

  // Set token in cookies
  static setToken(token) {
    Cookies.set('auth_token', token, { expires: 7 }); // Expires in 7 days
  }

  // Remove token
  static removeToken() {
    Cookies.remove('auth_token');
  }

  // Get current user
  static getCurrentUser() {
    return this.user;
  }

  // Set current user
  static setCurrentUser(user) {
    this.user = user;
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!this.getToken() && !!this.user;
  }

  // Register new user
  static async register(userData) {
    try {
      console.log('Attempting to register user:', {
        ...userData,
        password: '[HIDDEN]',
      });
      console.log('API URL:', `${API_BASE_URL}/api/auth/register`);

      const response = await api.post('/api/auth/register', userData);
      console.log('Registration response:', response.data);

      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        this.setCurrentUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      if (error.code === 'ERR_NETWORK') {
        throw {
          error:
            'Cannot connect to server. Please check if the backend is running.',
        };
      }

      // Handle specific HTTP status codes
      if (error.response?.status === 400) {
        throw {
          error:
            error.response.data?.detail ||
            'Invalid registration data. Please check your information.',
        };
      } else if (error.response?.status === 409) {
        throw {
          error: 'An account with this email or username already exists.',
        };
      } else if (error.response?.status === 422) {
        throw {
          error:
            error.response.data?.detail ||
            'Validation error. Please check your input.',
        };
      } else if (error.response?.status === 429) {
        throw {
          error: 'Too many signup attempts. Please wait before trying again.',
        };
      } else if (error.response?.status >= 500) {
        throw { error: 'Server error. Please try again later.' };
      }

      throw (
        error.response?.data || {
          error: 'Registration failed. Please try again.',
        }
      );
    }
  }

  // Login user
  static async login(credentials) {
    try {
      console.log('Attempting to login user:', {
        email: credentials.email,
        password: '[HIDDEN]',
      });
      console.log('API URL:', `${API_BASE_URL}/api/auth/login`);

      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);

      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        this.setCurrentUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      if (error.code === 'ERR_NETWORK') {
        throw {
          error:
            'Cannot connect to server. Please check if the backend is running.',
        };
      }

      // Handle specific HTTP status codes
      if (error.response?.status === 400) {
        throw { error: 'Invalid email or password. Please try again.' };
      } else if (error.response?.status === 401) {
        throw {
          error: 'Invalid email or password. Please check your credentials.',
        };
      } else if (error.response?.status === 403) {
        throw {
          error: 'Account is locked or suspended. Please contact support.',
        };
      } else if (error.response?.status === 404) {
        throw { error: 'No account found with this email address.' };
      } else if (error.response?.status === 429) {
        throw {
          error: 'Too many login attempts. Please wait before trying again.',
        };
      } else if (error.response?.status >= 500) {
        throw { error: 'Server error. Please try again later.' };
      }

      throw (
        error.response?.data || { error: 'Login failed. Please try again.' }
      );
    }
  }

  // Logout user
  static async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
      this.setCurrentUser(null);
    }
  }

  // Get user profile
  static async getProfile() {
    try {
      const response = await api.get('/api/auth/profile');
      this.setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get profile' };
    }
  }

  // Update user profile
  static async updateProfile(updateData) {
    try {
      const response = await api.put('/api/auth/profile', updateData);
      this.setCurrentUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  }

  // Check if token is valid and get user data
  static async checkAuth() {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await api.get('/api/auth/session');
      this.setCurrentUser(response.data.user);
      return true;
    } catch (error) {
      this.removeToken();
      this.setCurrentUser(null);
      return false;
    }
  }

  // Test backend connection
  static async testConnection() {
    try {
      console.log('Testing backend connection...');
      // Use a simple health check endpoint instead of auth endpoint
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      console.log('Backend connection successful');
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  }
}

export default AuthService;
