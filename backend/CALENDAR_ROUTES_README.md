# Calendar Routes for Medical Dates

This document describes the new backend routes for managing and retrieving upcoming medical dates, including appointments, medication schedules, and health reminders.

## Overview

The calendar routes provide a comprehensive API for accessing medical-related calendar events. They integrate with the existing medications service and are designed to work with Google Calendar (though currently using sample data for demonstration).

## Routes

### 1. Get Upcoming Medical Dates

**Endpoint:** `GET /api/calendar/upcoming-medical-dates`

**Description:** Retrieves upcoming medical dates including appointments, medication schedules, and health reminders.

**Query Parameters:**

- `days_ahead` (optional): Number of days to look ahead (default: 30)
- `include_medications` (optional): Include medication schedules (default: true)
- `include_appointments` (optional): Include appointments (default: true)
- `include_reminders` (optional): Include health reminders (default: true)

**Example Request:**

```bash
GET /api/calendar/upcoming-medical-dates?days_ahead=7&include_medications=true&include_appointments=true&include_reminders=false
```

**Response:**

```json
{
  "success": true,
  "upcoming_dates": [
    {
      "id": "med_lisinopril_20240215_0800",
      "title": "💊 Lisinopril",
      "description": "Medication: Lisinopril\nFrequency: 1x daily\nNotes: Status: active",
      "type": "medication",
      "start_time": "2024-02-15T08:00:00",
      "end_time": "2024-02-15T08:15:00",
      "datetime": "2024-02-15T08:00:00",
      "date": "2024-02-15",
      "time": "08:00",
      "location": "Home",
      "color_id": "11",
      "days_until": 1,
      "is_today": false,
      "is_tomorrow": true,
      "is_this_week": true,
      "duration_minutes": 15
    }
  ],
  "total_events": 1,
  "days_ahead": 7,
  "filters": {
    "medications": true,
    "appointments": true,
    "reminders": false
  }
}
```

### 2. Get Medical Events

**Endpoint:** `GET /api/calendar/medical-events`

**Description:** Retrieves all medical events from Google Calendar within a specified date range.

**Query Parameters:**

- `start_date` (optional): Start date in YYYY-MM-DD format (default: today)
- `end_date` (optional): End date in YYYY-MM-DD format (default: 30 days from today)
- `event_type` (optional): Filter by event type: 'appointment', 'medication', 'reminder', or 'all' (default: 'all')

**Example Request:**

```bash
GET /api/calendar/medical-events?start_date=2024-02-01&end_date=2024-02-28&event_type=appointment
```

**Response:**

```json
{
  "success": true,
  "events": [
    {
      "id": "sample_appointment_1",
      "title": "Dr. Smith - Cardiology",
      "description": "Annual checkup",
      "type": "appointment",
      "start_time": "2024-02-14T10:00:00-05:00",
      "end_time": "2024-02-14T11:00:00-05:00",
      "datetime": "2024-02-14T10:00:00-05:00",
      "date": "2024-02-14",
      "time": "10:00",
      "location": "Heart Center, Room 205",
      "color_id": "1",
      "days_until": 0,
      "is_today": true,
      "is_tomorrow": false,
      "is_this_week": true,
      "duration_minutes": 60
    }
  ],
  "total_events": 1,
  "date_range": {
    "start_date": "2024-02-01",
    "end_date": "2024-02-28"
  },
  "event_type": "appointment"
}
```

### 3. Get Next Medical Event

**Endpoint:** `GET /api/calendar/next-medical-event`

**Description:** Retrieves the next upcoming medical event.

**Example Request:**

```bash
GET /api/calendar/next-medical-event
```

**Response:**

```json
{
  "success": true,
  "next_event": {
    "id": "med_lisinopril_20240215_0800",
    "title": "💊 Lisinopril",
    "description": "Medication: Lisinopril\nFrequency: 1x daily\nNotes: Status: active",
    "type": "medication",
    "start_time": "2024-02-15T08:00:00",
    "end_time": "2024-02-15T08:15:00",
    "datetime": "2024-02-15T08:00:00",
    "date": "2024-02-15",
    "time": "08:00",
    "location": "Home",
    "color_id": "11",
    "days_until": 1,
    "is_today": false,
    "is_tomorrow": true,
    "is_this_week": true,
    "duration_minutes": 15
  }
}
```

### 4. Get Calendar Summary

**Endpoint:** `GET /api/calendar/calendar-summary`

**Description:** Retrieves a summary of medical calendar events.

**Example Request:**

```bash
GET /api/calendar/calendar-summary
```

**Response:**

```json
{
  "success": true,
  "summary": {
    "total_events": 5,
    "appointments": 2,
    "medications": 3,
    "reminders": 0,
    "next_event": {
      "id": "med_lisinopril_20240215_0800",
      "title": "💊 Lisinopril",
      "type": "medication",
      "date": "2024-02-15",
      "time": "08:00"
    },
    "upcoming_week": 3,
    "upcoming_month": 5
  }
}
```

## Event Types

The system categorizes medical events into three main types:

### 1. Appointments

- Doctor visits
- Medical consultations
- Lab tests and procedures
- Follow-up appointments

### 2. Medications

- Prescription reminders
- Daily medication schedules
- Dosage times
- Medication changes

### 3. Reminders

- Health check reminders
- Blood pressure monitoring
- Exercise reminders
- General health alerts

## Integration with Existing Services

### Medications Service

The calendar routes integrate with the existing `MedicationsService` to:

- Extract medication information from OCR results
- Generate medication schedule events
- Calculate next dose times
- Handle medication status (active/discontinued)

### Supabase Service

Uses the `SupabaseService` to:

- Retrieve OCR results containing medical information
- Access stored medical document data
- Maintain data consistency

## Sample Data

Currently, the routes return sample data to demonstrate functionality. In a production environment, you would:

1. **Integrate with Google Calendar API**: Use OAuth tokens to fetch real calendar events
2. **Connect to real medication databases**: Pull from EHR systems or user-input data
3. **Implement real-time updates**: Use webhooks or polling for live calendar changes

## Testing

Use the provided test script to verify the routes:

```bash
cd backend
python test_calendar_routes.py
```

## Future Enhancements

1. **Real Google Calendar Integration**: Replace sample data with actual Google Calendar API calls
2. **Medication Database**: Connect to external medication databases for comprehensive drug information
3. **Notification System**: Add push notifications for upcoming medical events
4. **Calendar Sync**: Two-way sync between the app and Google Calendar
5. **Recurring Events**: Handle recurring appointments and medication schedules
6. **Conflict Resolution**: Detect and resolve scheduling conflicts

## Error Handling

All routes include comprehensive error handling:

- Invalid date formats
- Missing or malformed data
- Service unavailability
- Authentication failures

Errors are logged and return appropriate HTTP status codes with descriptive error messages.

## Security Considerations

- All routes should be protected with authentication
- User data isolation (users can only access their own calendar data)
- Input validation and sanitization
- Rate limiting to prevent abuse
- Secure OAuth token handling for Google Calendar integration
