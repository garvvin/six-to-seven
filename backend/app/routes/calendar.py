from flask import Blueprint, request, jsonify
from app.services.calendar_service import CalendarService
import logging
from datetime import datetime, timedelta

calendar_bp = Blueprint('calendar', __name__)
calendar_service = CalendarService()

@calendar_bp.route('/upcoming-medical-dates', methods=['GET'])
def get_upcoming_medical_dates():
    """
    Get upcoming medical dates including appointments, medication schedules, and health reminders
    """
    try:
        # Get query parameters
        days_ahead = request.args.get('days_ahead', 30, type=int)  # Default 30 days
        include_medications = request.args.get('include_medications', 'true').lower() == 'true'
        include_appointments = request.args.get('include_appointments', 'true').lower() == 'true'
        include_reminders = request.args.get('include_reminders', 'true').lower() == 'true'
        
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Get upcoming medical dates
        upcoming_dates = calendar_service.get_upcoming_medical_dates(
            days_ahead=days_ahead,
            include_medications=include_medications,
            include_appointments=include_appointments,
            include_reminders=include_reminders,
            access_token=access_token
        )
        
        return jsonify({
            'success': True,
            'upcoming_dates': upcoming_dates,
            'total_events': len(upcoming_dates),
            'days_ahead': days_ahead,
            'filters': {
                'medications': include_medications,
                'appointments': include_appointments,
                'reminders': include_reminders
            },
            'google_calendar_connected': access_token is not None
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching upcoming medical dates: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/medical-events', methods=['GET'])
def get_medical_events():
    """
    Get all medical events from Google Calendar
    """
    try:
        # Get query parameters
        start_date = request.args.get('start_date')  # Optional: YYYY-MM-DD
        end_date = request.args.get('end_date')     # Optional: YYYY-MM-DD
        event_type = request.args.get('event_type')  # Optional: 'appointment', 'medication', 'reminder', 'all'
        
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Google Calendar access token required. Please authenticate first.'
            }), 401
        
        # Get medical events
        events = calendar_service.get_medical_events(
            start_date=start_date,
            end_date=end_date,
            event_type=event_type,
            access_token=access_token
        )
        
        return jsonify({
            'success': True,
            'events': events,
            'total_events': len(events),
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            },
            'event_type': event_type or 'all'
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching medical events: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/next-medical-event', methods=['GET'])
def get_next_medical_event():
    """
    Get the next upcoming medical event
    """
    try:
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Get the next medical event
        next_event = calendar_service.get_next_medical_event(access_token=access_token)
        
        if not next_event:
            return jsonify({
                'success': True,
                'message': 'No upcoming medical events found',
                'next_event': None,
                'google_calendar_connected': access_token is not None
            }), 200
        
        return jsonify({
            'success': True,
            'next_event': next_event,
            'google_calendar_connected': access_token is not None
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching next medical event: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/calendar-summary', methods=['GET'])
def get_calendar_summary():
    """
    Get a summary of medical calendar events
    """
    try:
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Get events for next 30 days
        upcoming_dates = calendar_service.get_upcoming_medical_dates(
            days_ahead=30,
            access_token=access_token
        )
        
        # Categorize events
        appointments = [e for e in upcoming_dates if e['type'] == 'appointment']
        medications = [e for e in upcoming_dates if e['type'] == 'medication']
        reminders = [e for e in upcoming_dates if e['type'] == 'reminder']
        
        # Get next event
        next_event = calendar_service.get_next_medical_event(access_token=access_token)
        
        summary = {
            'total_events': len(upcoming_dates),
            'appointments': len(appointments),
            'medications': len(medications),
            'reminders': len(reminders),
            'next_event': next_event,
            'upcoming_week': len([e for e in upcoming_dates if e['days_until'] <= 7]),
            'upcoming_month': len(upcoming_dates),
            'google_calendar_connected': access_token is not None
        }
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting calendar summary: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/sync-status', methods=['GET'])
def get_sync_status():
    """
    Get the current sync status with Google Calendar
    """
    try:
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not access_token:
            return jsonify({
                'success': True,
                'google_calendar_connected': False,
                'message': 'No Google Calendar access token provided'
            }), 200
        
        # Try to fetch a small sample of events to verify token validity
        try:
            test_events = calendar_service.get_medical_events(
                start_date=datetime.now().strftime('%Y-%m-%d'),
                end_date=(datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
                access_token=access_token
            )
            
            return jsonify({
                'success': True,
                'google_calendar_connected': True,
                'message': 'Successfully connected to Google Calendar',
                'test_events_count': len(test_events)
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': True,
                'google_calendar_connected': False,
                'message': f'Token validation failed: {str(e)}'
            }), 200
        
    except Exception as e:
        logging.error(f"Error getting sync status: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/clear-next-week-medical-dates', methods=['DELETE'])
def clear_next_week_medical_dates():
    """
    Clear all medical events for the next week from Google Calendar
    """
    try:
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Google Calendar access token required. Please authenticate first.'
            }), 401
        
        # Clear next week's medical dates
        result = calendar_service.clear_next_week_medical_dates(access_token)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'events_cleared': result['events_cleared']
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
        
    except Exception as e:
        logging.error(f"Error clearing next week medical dates: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/debug-next-week-events', methods=['GET'])
def debug_next_week_events():
    """
    Debug endpoint to see all events for next week (for troubleshooting)
    """
    try:
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not access_token:
            return jsonify({
                'success': False,
                'error': 'Google Calendar access token required. Please authenticate first.'
            }), 401
        
        # Get all events for next week
        from datetime import datetime, timedelta
        now = datetime.now()
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=8)
        
        events = calendar_service._get_google_calendar_events(start_date, end_date, access_token)
        
        # Categorize events
        medical_events = []
        non_medical_events = []
        
        for event in events:
            if calendar_service._is_medical_event(event):
                medical_events.append({
                    'id': event.get('id'),
                    'summary': event.get('summary'),
                    'start': event.get('start'),
                    'description': event.get('description', '')[:100] + '...' if len(event.get('description', '')) > 100 else event.get('description', '')
                })
            else:
                non_medical_events.append({
                    'id': event.get('id'),
                    'summary': event.get('summary'),
                    'start': event.get('start'),
                    'description': event.get('description', '')[:100] + '...' if len(event.get('description', '')) > 100 else event.get('description', '')
                })
        
        return jsonify({
            'success': True,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'total_events': len(events),
            'medical_events': medical_events,
            'non_medical_events': non_medical_events,
            'medical_count': len(medical_events),
            'non_medical_count': len(non_medical_events)
        }), 200
        
    except Exception as e:
        logging.error(f"Error debugging next week events: {e}")
        return jsonify({'error': str(e)}), 500
