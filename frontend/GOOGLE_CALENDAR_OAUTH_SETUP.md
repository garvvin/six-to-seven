# Google Calendar OAuth2 Setup Guide

This guide will help you set up OAuth2 authentication for Google Calendar to access your personal calendar data.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API usage)

## Step 2: Enable the Google Calendar API

1. In your Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click the blue "Enable" button

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required information (App name, User support email, Developer contact information)
   - Add scopes: `https://www.googleapis.com/auth/calendar.readonly` and `https://www.googleapis.com/auth/calendar.events`
   - Add test users (your email address)
   - Complete the consent screen setup

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "HealthSync Calendar"
   - Authorized JavaScript origins: `http://localhost:5175`
   - Authorized redirect URIs: `http://localhost:5175/oauth-callback`
   - Click "Create"

5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

1. In your `frontend` folder, update your `.env` file with:

```env
# Google Calendar OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_oauth_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5175/oauth-callback
```

2. Replace the placeholder values with your actual OAuth credentials

## Step 5: Restart Your Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

1. **Authentication Flow**: When you click "Connect Google Calendar", a popup window opens with Google's OAuth consent screen
2. **User Consent**: You'll be asked to grant permission to access your Google Calendar
3. **Token Exchange**: After consent, the app exchanges the authorization code for access and refresh tokens
4. **Calendar Access**: The app can now fetch your personal calendar events using the access token
5. **Token Refresh**: Access tokens expire after 1 hour, but the app automatically refreshes them using the refresh token

## Features

- ✅ **Personal Calendar Access**: View your actual Google Calendar events
- ✅ **Secure Authentication**: OAuth2 flow with proper token management
- ✅ **Automatic Token Refresh**: Tokens are automatically refreshed when they expire
- ✅ **Persistent Login**: Tokens are stored locally and persist between sessions
- ✅ **Logout Functionality**: Clear tokens and disconnect from Google Calendar

## Security Notes

- **Client Secret**: The client secret is exposed in the frontend code. For production, you should use a backend service to handle OAuth
- **Token Storage**: Tokens are stored in localStorage. For better security, consider using httpOnly cookies
- **HTTPS**: In production, ensure your site uses HTTPS for secure token transmission
- **Domain Restrictions**: Configure authorized domains in your OAuth credentials for production

## Troubleshooting

### "Invalid Client" Error
- Check that your Client ID and Client Secret are correct
- Verify the redirect URI matches exactly

### "Redirect URI Mismatch" Error
- Ensure the redirect URI in your OAuth credentials matches `http://localhost:5175/oauth-callback`
- Check for extra spaces or typos

### "Access Denied" Error
- Make sure you've added your email as a test user in the OAuth consent screen
- Check that the Google Calendar API is enabled

### Popup Blocked
- Allow popups for localhost:5175
- Try refreshing the page and clicking the connect button again

## Production Considerations

For production deployment:

1. **Backend OAuth**: Implement OAuth flow on your backend for better security
2. **HTTPS**: Use HTTPS for all OAuth communications
3. **Domain Configuration**: Update authorized origins and redirect URIs for your production domain
4. **Token Security**: Implement secure token storage and refresh mechanisms
5. **Rate Limiting**: Implement rate limiting for API calls
6. **Error Handling**: Add comprehensive error handling for OAuth failures
