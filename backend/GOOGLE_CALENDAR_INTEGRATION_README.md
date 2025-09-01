# Google Calendar Integration

This document explains how to set up and use the Google Calendar integration for the HealthSync Assistant app.

## Overview

The Google Calendar integration allows the app to:

- Fetch real calendar events from the user's Google Calendar
- Automatically classify events as medical or non-medical
- Display upcoming medical appointments, medication schedules, and health reminders
- Sync medication schedules from OCR results with calendar events

## Architecture

### Backend Components

1. **CalendarService** (`app/services/calendar_service.py`)

   - Handles Google Calendar API calls
   - Classifies events as medical/non-medical
   - Manages medication schedules from OCR data
   - Formats events for frontend display

2. **Calendar Routes** (`app/routes/calendar.py`)
   - REST API endpoints for calendar operations
   - Handles OAuth token validation
   - Returns medical events and schedules

### Frontend Components

1. **UpcomingDates Component** (`frontend/src/components/UpcomingDates.jsx`)

   - Displays scheduled medical dates
   - Manages Google Calendar connection status
   - Shows connection/disconnection buttons

2. **Google Calendar OAuth Service** (`frontend/src/services/googleCalendarOAuthService.js`)
   - Handles OAuth2 authentication flow
   - Manages access tokens and refresh tokens
   - Provides calendar API access

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5175/oauth-callback` (development)
     - Your production domain (if applicable)

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5175/oauth-callback

# Backend (.env)
GOOGLE_CALENDAR_API_KEY=your_api_key_here  # Optional, for additional API access
```

### 3. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## Usage

### 1. Connect Google Calendar

1. Open the app and navigate to the main dashboard
2. In the "Scheduled Dates" section, click the "Connect Google Calendar" button
3. Complete the OAuth flow in the popup window
4. Grant calendar access permissions

### 2. View Medical Events

Once connected, the app will:

- Fetch real calendar events from Google Calendar
- Automatically classify medical events using keyword detection
- Display upcoming appointments, medication schedules, and health reminders
- Show connection status and sync information

### 3. Disconnect

- Click the "Disconnect" button to remove Google Calendar access
- The app will continue to show medication schedules from OCR data

## API Endpoints

### GET `/api/calendar/upcoming-medical-dates`

Fetches upcoming medical dates including medications and calendar events.

**Query Parameters:**

- `days_ahead` (int): Number of days to look ahead (default: 30)
- `include_medications` (bool): Include medication schedules (default: true)
- `include_appointments` (bool): Include appointments (default: true)
- `include_reminders` (bool): Include health reminders (default: true)

**Headers:**

- `Authorization: Bearer <access_token>` (required for Google Calendar events)

**Response:**

```json
{
  "success": true,
  "upcoming_dates": [...],
  "total_events": 5,
  "google_calendar_connected": true
}
```

### GET `/api/calendar/medical-events`

Fetches medical events from Google Calendar within a date range.

**Query Parameters:**

- `start_date` (str): Start date in YYYY-MM-DD format
- `end_date` (str): End date in YYYY-MM-DD format
- `event_type` (str): Filter by event type

**Headers:**

- `Authorization: Bearer <access_token>` (required)

### GET `/api/calendar/sync-status`

Checks the current sync status with Google Calendar.

**Headers:**

- `Authorization: Bearer <access_token>` (optional)

## Medical Event Classification

The system automatically classifies calendar events as medical using keyword detection:

### Medical Keywords

- **Appointments**: dr., doctor, physician, appointment, checkup, consultation
- **Procedures**: blood work, lab, test, scan, x-ray, mri, ct
- **Specialties**: cardiology, dermatology, orthopedics, neurology
- **General**: clinic, hospital, surgery, procedure, physical

### Event Types

1. **Appointments**: Doctor visits, consultations, checkups
2. **Medications**: Prescription reminders, daily schedules
3. **Reminders**: Health check reminders, monitoring alerts

## Testing

### Backend Tests

```bash
cd backend
python test_calendar_integration.py
```

### Frontend Testing

1. Start the backend server: `python run.py`
2. Start the frontend: `npm run dev`
3. Test the OAuth flow and calendar integration
4. Verify real calendar events are displayed

## Troubleshooting

### Common Issues

1. **OAuth Popup Blocked**

   - Ensure popups are allowed for your domain
   - Check browser security settings

2. **Token Expired**

   - The system automatically refreshes tokens
   - If issues persist, disconnect and reconnect

3. **No Calendar Events**

   - Verify OAuth permissions include calendar access
   - Check if events contain medical keywords
   - Ensure events are within the specified date range

4. **Backend Errors**
   - Check logs for detailed error messages
   - Verify Google Calendar API is enabled
   - Ensure environment variables are set correctly

### Debug Mode

Enable debug logging in the backend:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Security Considerations

1. **Token Storage**: Access tokens are stored in localStorage (consider more secure alternatives for production)
2. **Scope Limitation**: Only requests calendar read access, not write access
3. **Token Validation**: Backend validates tokens before making API calls
4. **Error Handling**: Sensitive information is not exposed in error messages

## Future Enhancements

1. **Real-time Sync**: Webhook-based calendar updates
2. **Event Creation**: Allow creating medical events in Google Calendar
3. **Advanced Filtering**: More sophisticated medical event detection
4. **Multiple Calendars**: Support for multiple Google Calendar accounts
5. **Calendar Sharing**: Share medical schedules with healthcare providers

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend logs for error details
3. Verify Google Cloud Console settings
4. Test with the provided test scripts
