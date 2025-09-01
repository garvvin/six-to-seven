// Calendar Clear Service
// This service handles clearing medical events from Google Calendar

class CalendarClearService {
  constructor() {
    this.API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
  }

  /**
   * Clear all medical events for the next week from Google Calendar
   * @param {string} accessToken - Google OAuth access token
   * @returns {Promise<Object>} Result with success status and message
   */
  async clearNextWeekMedicalDates(accessToken) {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/api/calendar/clear-next-week-medical-dates`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error clearing next week medical dates:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export as singleton instance
const calendarClearService = new CalendarClearService();
export default calendarClearService;
