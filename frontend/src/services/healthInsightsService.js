const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

export const healthInsightsService = {
  /**
   * Generate health insights from document data
   * @param {Object} documentData - The parsed document data from OCR
   * @returns {Promise<Object>} - The generated health insights
   */
  async generateHealthInsights(documentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health-insights/get-health-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate health insights';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Health insights service error:', error);
      throw error;
    }
  },

  /**
   * Generate health recommendations from document data
   * @param {Object} documentData - The parsed document data from OCR
   * @returns {Promise<Object>} - The generated health recommendations
   */
  async generateHealthRecommendations(documentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health-insights/get-health-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate health recommendations';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Health recommendations service error:', error);
      throw error;
    }
  },

  /**
   * Check health insights service status
   * @returns {Promise<Object>} - Service health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health-insights/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
};
