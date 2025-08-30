import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log(
          'AuthContext - Starting auth check, setting loading to true'
        );
        setLoading(true);

        // Temporarily disable connection test to prevent refresh loop
        // const isConnected = await AuthService.testConnection();
        // if (!isConnected) {
        //   console.error('Backend is not accessible. Please check if it\'s running.');
        //   setError('Cannot connect to backend. Please check if the server is running.');
        //   setLoading(false);
        //   return;
        // }

        console.log('AuthContext - Calling AuthService.checkAuth()');
        const isAuthenticated = await AuthService.checkAuth();
        console.log('AuthContext - checkAuth result:', isAuthenticated);

        if (isAuthenticated) {
          const user = AuthService.getCurrentUser();
          console.log('AuthContext - Setting user:', user);
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        console.log('AuthContext - Setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async credentials => {
    try {
      console.log('AuthContext - Login started, setting loading to true');
      setError(null);
      setLoading(true);
      const response = await AuthService.login(credentials);
      console.log(
        'AuthContext - Login successful, setting user:',
        response.user
      );
      setUser(response.user);
      return response;
    } catch (error) {
      console.log('AuthContext - Login failed:', error);
      setError(error.error || 'Login failed');
      throw error;
    } finally {
      console.log('AuthContext - Login finished, setting loading to false');
      setLoading(false);
    }
  };

  // Register function
  const register = async userData => {
    try {
      console.log('AuthContext - Register started, setting loading to true');
      setError(null);
      setLoading(true);
      const response = await AuthService.register(userData);
      console.log(
        'AuthContext - Register successful, setting user:',
        response.user
      );
      setUser(response.user);
      return response;
    } catch (error) {
      console.log('AuthContext - Register failed:', error);
      setError(error.error || 'Registration failed');
      throw error;
    } finally {
      console.log('AuthContext - Register finished, setting loading to false');
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Update user profile
  const updateProfile = async updateData => {
    try {
      setError(null);
      const response = await AuthService.updateProfile(updateData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.error || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
