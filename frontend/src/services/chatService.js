import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

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

class ChatService {
  /**
   * Send a health chat message and get AI response
   * @param {string} message - User's message
   * @param {boolean} includeHealthContext - Whether to include health context
   * @returns {Promise<Object>} Response from the AI
   */
  static async sendHealthMessage(message, includeHealthContext = true) {
    try {
      const response = await api.post('/api/chat/health-chat', {
        message,
        include_health_context: includeHealthContext
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending health message:', error);
      throw error;
    }
  }

  /**
   * Get chat history for the current user
   * @param {number} limit - Number of messages to return
   * @param {number} offset - Number of messages to skip
   * @returns {Promise<Object>} Chat history
   */
  static async getChatHistory(limit = 50, offset = 0) {
    try {
      const response = await api.get('/api/chat/chat-history', {
        params: { limit, offset }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Clear chat history for the current user
   * @returns {Promise<Object>} Result of the operation
   */
  static async clearChatHistory() {
    try {
      const response = await api.delete('/api/chat/clear-chat-history');
      
      return response.data;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }

  /**
   * Check if the user is authenticated
   * @returns {boolean} Authentication status
   */
  static isAuthenticated() {
    return !!Cookies.get('auth_token');
  }
}

export default ChatService;
