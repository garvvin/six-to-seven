# Google Calendar API Setup Guide

To use the Google Calendar integration in HealthSync, you need to set up Google Calendar API credentials.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API usage)

## Step 2: Enable the Google Calendar API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Configure Environment Variables

1. Create a `.env` file in the `frontend` directory
2. Add your API key:

```env
VITE_GOOGLE_CALENDAR_API_KEY=your_actual_api_key_here
```

## Step 5: Restrict API Key (Recommended)

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain (e.g., `localhost:5175` for development)
5. Under "API restrictions", select "Restrict key"
6. Select "Google Calendar API" from the dropdown

## Step 6: Restart Your Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## Features

The Google Calendar integration includes:

- ✅ View calendar events for the current month
- ✅ Navigate between months
- ✅ Display events on calendar days
- ✅ Today highlighting
- ✅ Event count indicators
- ✅ Add event button (functionality to be implemented)

## Troubleshooting

If you see an error message about API key configuration:

1. Make sure your `.env` file is in the correct location (`frontend/.env`)
2. Verify the environment variable name is exactly `VITE_GOOGLE_CALENDAR_API_KEY`
3. Restart your development server after adding the environment variable
4. Check that your API key is valid and has the correct permissions
5. Ensure the Google Calendar API is enabled in your Google Cloud project

## Security Notes

- Never commit your actual API key to version control
- Use environment variables for all sensitive configuration
- Restrict your API key to specific domains and APIs
- Monitor your API usage in the Google Cloud Console
