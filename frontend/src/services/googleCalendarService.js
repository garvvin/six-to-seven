// Google Calendar API Service
// Note: You'll need to set up Google Calendar API credentials in your Google Cloud Console
// and add the API key to your environment variables

const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
// Using a public calendar ID that works with API keys
const CALENDAR_ID = 'en.usa#holiday@group.v.calendar.google.com'; // US Holidays calendar

class GoogleCalendarService {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/calendar/v3';
    this.apiKey = GOOGLE_CALENDAR_API_KEY;
  }

  // Get calendar events for a specific time range
  async getEvents(timeMin, timeMax, maxResults = 50) {
    try {
      console.log('GoogleCalendarService: API Key available:', !!this.apiKey);
      console.log('GoogleCalendarService: Calendar ID:', CALENDAR_ID);
      
      const params = new URLSearchParams({
        key: this.apiKey,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const url = `${this.baseUrl}/calendars/${CALENDAR_ID}/events?${params}`;
      console.log('GoogleCalendarService: Making request to:', url);

      const response = await fetch(url);

      console.log('GoogleCalendarService: Response status:', response.status);
      console.log('GoogleCalendarService: Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GoogleCalendarService: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('GoogleCalendarService: Response data:', data);
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Get events for the current month
  async getCurrentMonthEvents() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return this.getEvents(startOfMonth, endOfMonth);
  }

  // Create a new event
  async createEvent(eventData) {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendars/${CALENDAR_ID}/events?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update an existing event
  async updateEvent(eventId, eventData) {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendars/${CALENDAR_ID}/events/${eventId}?key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(eventId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/calendars/${CALENDAR_ID}/events/${eventId}?key=${this.apiKey}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Get calendar list
  async getCalendarList() {
    try {
      console.log('GoogleCalendarService: Getting calendar list...');
      const response = await fetch(
        `${this.baseUrl}/users/me/calendarList?key=${this.apiKey}`
      );

      console.log('GoogleCalendarService: Calendar list response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GoogleCalendarService: Calendar list error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('GoogleCalendarService: Calendar list data:', data);
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw error;
    }
  }

  // Test API key with public calendar
  async testApiKey() {
    try {
      console.log('GoogleCalendarService: Testing API key with public calendar...');
      const response = await fetch(
        `${this.baseUrl}/calendars/${CALENDAR_ID}/events?key=${this.apiKey}&maxResults=1`
      );

      console.log('GoogleCalendarService: Test response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GoogleCalendarService: Test error response:', errorText);
        return { success: false, error: errorText };
      }

      const data = await response.json();
      console.log('GoogleCalendarService: Test successful, found events:', data.items?.length || 0);
      return { success: true, events: data.items || [] };
    } catch (error) {
      console.error('Error testing API key:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleCalendarService();
