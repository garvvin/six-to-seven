// Google Calendar OAuth Service
// This service handles OAuth2 authentication for accessing personal Google Calendar data

class GoogleCalendarOAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    this.redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5175/oauth-callback';
    this.scope = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
    this.tokenKey = 'google_calendar_token';
    this.authWindow = null;
  }

  // Initialize OAuth flow
  async authenticate() {
    try {
      // Check if we already have a valid token
      const token = this.getStoredToken();
      if (token && !this.isTokenExpired(token)) {
        console.log('Using existing valid token');
        return { success: true, token };
      }

      // Start OAuth flow
      return await this.startOAuthFlow();
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  // Start OAuth flow
  async startOAuthFlow() {
    const authUrl = this.buildAuthUrl();
    
    return new Promise((resolve) => {
      // Open popup window for OAuth
      this.authWindow = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Check if popup was blocked
      if (!this.authWindow || this.authWindow.closed || typeof this.authWindow.closed === 'undefined') {
        resolve({ success: false, error: 'Popup was blocked. Please allow popups for this site and try again.' });
        return;
      }

      // Listen for the OAuth callback
      const checkClosed = setInterval(() => {
        if (this.authWindow.closed) {
          clearInterval(checkClosed);
          const token = this.getStoredToken();
          if (token) {
            resolve({ success: true, token });
          } else {
            resolve({ success: false, error: 'Authentication was cancelled. Please try again.' });
          }
        }
      }, 1000);

      // Listen for OAuth callback message
      const messageHandler = (event) => {
        console.log('Received message from OAuth callback:', event.data);
        
        // Check if the message is from the OAuth callback page
        if (event.origin !== 'http://localhost:5173' && event.origin !== 'http://localhost:5175') {
          console.log('Message origin mismatch:', event.origin, 'expected localhost');
          return;
        }
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          console.log('OAuth success message received');
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          this.authWindow.close();
          const token = this.getStoredToken();
          resolve({ success: true, token });
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          console.log('OAuth error message received:', event.data.error);
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          this.authWindow.close();
          resolve({ success: false, error: event.data.error });
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  // Build OAuth URL
  buildAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      console.log('Exchanging code for token with:', {
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        code_length: code.length
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      });

      console.log('Token exchange response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange error response:', errorText);
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('Token exchange successful, storing token');
      this.storeToken(tokenData);
      return tokenData;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Get calendar events using OAuth token
  async getEvents(timeMin, timeMax, maxResults = 50) {
    try {
      const token = this.getStoredToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.getEvents(timeMin, timeMax, maxResults);
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const token = this.getStoredToken();
      if (!token || !token.refresh_token) {
        return false;
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: token.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return false;
      }

      const newTokenData = await response.json();
      this.storeToken({ ...token, ...newTokenData });
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Store token in localStorage
  storeToken(tokenData) {
    localStorage.setItem(this.tokenKey, JSON.stringify({
      ...tokenData,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));
  }

  // Get stored token
  getStoredToken() {
    const tokenString = localStorage.getItem(this.tokenKey);
    return tokenString ? JSON.parse(tokenString) : null;
  }

  // Check if token is expired
  isTokenExpired(token) {
    return Date.now() >= token.expires_at;
  }

  // Clear stored token
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getStoredToken();
    return token && !this.isTokenExpired(token);
  }
}

export default new GoogleCalendarOAuthService();
