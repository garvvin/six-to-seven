import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.services.medications_service import MedicationsService
from app.services.supabase_service import SupabaseService

class CalendarService:
    """
    Service to interact with Google Calendar and manage medical events
    """
    
    def __init__(self):
        self.medications_service = MedicationsService()
        self.supabase_service = SupabaseService()
        self.google_calendar_api_base = "https://www.googleapis.com/calendar/v3"
        
    def get_upcoming_medical_dates(self, 
                                  days_ahead: int = 30,
                                  include_medications: bool = True,
                                  include_appointments: bool = True,
                                  include_reminders: bool = True,
                                  access_token: str = None) -> List[Dict[str, Any]]:
        """
        Get upcoming medical dates from Google Calendar and local medication data
        
        Args:
            days_ahead (int): Number of days to look ahead
            include_medications (bool): Include medication schedules
            include_appointments (bool): Include appointments
            include_reminders (bool): Include health reminders
            access_token (str): Google OAuth access token
            
        Returns:
            list: List of upcoming medical dates
        """
        try:
            upcoming_dates = []
            
            # Get current date and calculate end date
            now = datetime.now()
            end_date = now + timedelta(days=days_ahead)
            
            # Get medication schedules if requested
            if include_medications:
                medication_dates = self._get_medication_schedules(days_ahead)
                upcoming_dates.extend(medication_dates)
            
            # Get Google Calendar events if requested and access token provided
            if (include_appointments or include_reminders) and access_token:
                try:
                    calendar_events = self._get_google_calendar_events(now, end_date, access_token)
                    
                    # Filter events based on type
                    for event in calendar_events:
                        if self._is_medical_event(event):
                            if include_appointments and self._is_appointment_event(event):
                                upcoming_dates.append(self._format_calendar_event(event, 'appointment'))
                            elif include_reminders and self._is_reminder_event(event):
                                upcoming_dates.append(self._format_calendar_event(event, 'reminder'))
                except Exception as e:
                    logging.warning(f"Failed to fetch Google Calendar events: {e}")
                    # Continue with medication data only
            
            # Sort by date and time
            upcoming_dates.sort(key=lambda x: x['datetime'])
            
            # Remove duplicates and past events
            upcoming_dates = self._filter_and_deduplicate_events(upcoming_dates)
            
            logging.info(f"Found {len(upcoming_dates)} upcoming medical dates")
            return upcoming_dates
            
        except Exception as e:
            logging.error(f"Error getting upcoming medical dates: {e}")
            return []
    
    def get_medical_events(self, 
                          start_date: Optional[str] = None,
                          end_date: Optional[str] = None,
                          event_type: Optional[str] = None,
                          access_token: str = None) -> List[Dict[str, Any]]:
        """
        Get medical events from Google Calendar within a date range
        
        Args:
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            event_type (str): Filter by event type
            access_token (str): Google OAuth access token
            
        Returns:
            list: List of medical events
        """
        try:
            # Parse dates
            if not start_date:
                start_date = datetime.now().strftime('%Y-%m-%d')
            if not end_date:
                end_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
            
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            
            if not access_token:
                logging.warning("No access token provided, returning empty list")
                return []
            
            # Get calendar events
            events = self._get_google_calendar_events(start_dt, end_dt, access_token)
            
            # Filter medical events
            medical_events = []
            for event in events:
                if self._is_medical_event(event):
                    formatted_event = self._format_calendar_event(event, self._determine_event_type(event))
                    
                    # Apply event type filter if specified
                    if not event_type or event_type == 'all' or formatted_event['type'] == event_type:
                        medical_events.append(formatted_event)
            
            logging.info(f"Found {len(medical_events)} medical events")
            return medical_events
            
        except Exception as e:
            logging.error(f"Error getting medical events: {e}")
            return []
    
    def get_next_medical_event(self, access_token: str = None) -> Optional[Dict[str, Any]]:
        """
        Get the next upcoming medical event
        
        Args:
            access_token (str): Google OAuth access token
            
        Returns:
            dict: Next medical event or None
        """
        try:
            # Get upcoming dates for next 7 days
            upcoming_dates = self.get_upcoming_medical_dates(
                days_ahead=7, 
                access_token=access_token
            )
            
            if not upcoming_dates:
                return None
            
            # Return the first (earliest) event
            return upcoming_dates[0]
            
        except Exception as e:
            logging.error(f"Error getting next medical event: {e}")
            return None
    
    def clear_next_week_medical_dates(self, access_token: str) -> Dict[str, Any]:
        """
        Clear all medical events for the next week from Google Calendar
        
        Args:
            access_token (str): Google OAuth access token
            
        Returns:
            dict: Result with success status, message, and count of cleared events
        """
        try:
            # Calculate next week's date range - include today and next 7 days
            now = datetime.now()
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)  # Start from today at midnight
            end_date = start_date + timedelta(days=8)  # End after 8 days to include full week
            
            logging.info(f"Clearing medical events from {start_date} to {end_date}")
            
            # Get all events for next week
            events = self._get_google_calendar_events(start_date, end_date, access_token)
            logging.info(f"Found {len(events)} total events in date range")
            
            # Filter for medical events
            medical_events = [event for event in events if self._is_medical_event(event)]
            logging.info(f"Found {len(medical_events)} medical events to clear")
            
            # Log details of each medical event for debugging
            for event in medical_events:
                event_summary = event.get('summary', 'No title')
                event_start = event.get('start', {})
                start_time = event_start.get('dateTime') or event_start.get('date')
                logging.info(f"Medical event to clear: '{event_summary}' at {start_time}")
            
            # Get all medical events for next week
            events = self._get_google_calendar_events(start_date, end_date, access_token)
            medical_events = [event for event in events if self._is_medical_event(event)]
            
            if not medical_events:
                return {
                    'success': True,
                    'message': 'No medical events found for next week',
                    'events_cleared': 0
                }
            
            # Delete each medical event
            deleted_count = 0
            failed_deletions = []
            
            for event in medical_events:
                try:
                    event_id = event['id']
                    event_summary = event.get('summary', 'No title')
                    logging.info(f"Attempting to delete event: '{event_summary}' (ID: {event_id})")
                    
                    if self._delete_google_calendar_event(event_id, access_token):
                        deleted_count += 1
                        logging.info(f"Successfully deleted event: '{event_summary}'")
                    else:
                        failed_deletions.append(event_summary)
                        logging.warning(f"Failed to delete event: '{event_summary}'")
                except Exception as e:
                    failed_deletions.append(event.get('summary', 'Unknown'))
                    logging.warning(f"Exception deleting event {event.get('id')}: {e}")
                    continue
            
            # Prepare result message
            if failed_deletions:
                message = f"Cleared {deleted_count} medical events. Failed to clear: {', '.join(failed_deletions)}"
            else:
                message = f"Successfully cleared {deleted_count} medical events for next week"
            
            return {
                'success': True,
                'message': message,
                'events_cleared': deleted_count,
                'failed_deletions': failed_deletions
            }
            
        except Exception as e:
            logging.error(f"Error clearing next week medical dates: {e}")
            return {
                'success': False,
                'error': f'Failed to clear medical dates: {str(e)}'
            }
    
    def _delete_google_calendar_event(self, event_id: str, access_token: str) -> bool:
        """
        Delete a specific event from Google Calendar
        
        Args:
            event_id (str): Google Calendar event ID
            access_token (str): Google OAuth access token
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            url = f"{self.google_calendar_api_base}/calendars/primary/events/{event_id}"
            response = requests.delete(url, headers=headers)
            
            if response.status_code == 204:  # No content on successful deletion
                logging.info(f"Successfully deleted event {event_id}")
                return True
            else:
                logging.error(f"Failed to delete event {event_id}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logging.error(f"Error deleting Google Calendar event {event_id}: {e}")
            return False
    
    def _get_medication_schedules(self, days_ahead: int) -> List[Dict[str, Any]]:
        """
        Get medication schedules for the next N days
        """
        try:
            # Get OCR results to extract medications
            ocr_results = self.supabase_service.get_ocr_results()
            if not ocr_results['success']:
                logging.warning("Failed to fetch OCR results for medication schedules")
                return []
            
            all_medications = []
            
            # Extract medications from each OCR result
            for result in ocr_results['data']:
                if result.get('info') and isinstance(result['info'], dict):
                    medications = self.medications_service.extract_medications_from_ocr(result['info'])
                    if medications:
                        all_medications.extend(medications)
            
            if not all_medications:
                return []
            
            # Create medication schedule events for the next N days
            medication_events = []
            now = datetime.now()
            
            for medication in all_medications:
                if medication.get('status') != 'active':
                    continue
                
                for day in range(days_ahead):
                    current_date = now + timedelta(days=day)
                    
                    # Handle different time formats
                    times = medication.get('times', [])
                    if not times:
                        # Default to morning if no times specified
                        times = ['08:00']
                    
                    for time_str in times:
                        try:
                            # Parse the time
                            time_parts = time_str.split(':')
                            hour, minute = int(time_parts[0]), int(time_parts[1])
                            
                            # Create event time
                            event_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                            
                            # Skip past times
                            if event_time <= now:
                                continue
                            
                            medication_event = {
                                'id': f"med_{medication.get('name', 'unknown')}_{event_time.strftime('%Y%m%d_%H%M')}",
                                'summary': f"💊 {medication.get('name', 'Medication')}",
                                'description': f"Medication: {medication.get('name', 'Unknown')}\nFrequency: {medication.get('frequency', 'Unknown')}\nNotes: {medication.get('notes', 'None')}",
                                'start': {'dateTime': event_time.isoformat()},
                                'end': {'dateTime': (event_time + timedelta(minutes=15)).isoformat()},
                                'location': 'Home',
                                'colorId': '11'  # Blue for medications
                            }
                            
                            medication_events.append(medication_event)
                        except (ValueError, TypeError) as e:
                            logging.warning(f"Invalid time format for medication {medication.get('name')}: {time_str}")
                            continue
            
            # Format the medication events
            formatted_events = []
            for event in medication_events:
                formatted_event = self._format_calendar_event(event, 'medication')
                if formatted_event:
                    formatted_events.append(formatted_event)
            
            logging.info(f"Generated {len(formatted_events)} medication schedule events")
            return formatted_events
            
        except Exception as e:
            logging.error(f"Error getting medication schedules: {e}")
            return []
    
    def _get_google_calendar_events(self, start_date: datetime, end_date: datetime, access_token: str) -> List[Dict[str, Any]]:
        """
        Get events from Google Calendar within a date range using OAuth token
        """
        try:
            if not access_token:
                logging.warning("No access token provided for Google Calendar API")
                return []
            
            # Format dates for Google Calendar API
            time_min = start_date.isoformat() + 'Z'
            time_max = end_date.isoformat() + 'Z'
            
            # Make request to Google Calendar API
            url = f"{self.google_calendar_api_base}/calendars/primary/events"
            params = {
                'timeMin': time_min,
                'timeMax': time_max,
                'maxResults': 100,
                'singleEvents': 'true',
                'orderBy': 'startTime'
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, params=params, headers=headers)
            
            if response.status_code == 401:
                logging.warning("Google Calendar API token expired or invalid")
                return []
            elif response.status_code != 200:
                logging.error(f"Google Calendar API error: {response.status_code} - {response.text}")
                return []
            
            data = response.json()
            events = data.get('items', [])
            
            logging.info(f"Retrieved {len(events)} events from Google Calendar")
            return events
            
        except Exception as e:
            logging.error(f"Error getting Google Calendar events: {e}")
            return []
    
    def _is_medical_event(self, event: Dict[str, Any]) -> bool:
        """
        Check if an event is medical-related
        """
        try:
            summary = event.get('summary', '').lower()
            description = event.get('description', '').lower()
            
            # Medical keywords - expanded list
            medical_keywords = [
                'dr.', 'doctor', 'physician', 'appointment', 'checkup', 'consultation',
                'blood work', 'lab', 'test', 'scan', 'x-ray', 'mri', 'ct',
                'medication', 'pill', 'dose', 'prescription', '💊',
                'follow-up', 'followup', 'surgery', 'procedure',
                'physical', 'examination', 'exam', 'clinic', 'hospital',
                'cardiology', 'dermatology', 'orthopedics', 'neurology',
                'oncology', 'pediatrics', 'psychiatry', 'radiology',
                'therapy', 'therapist', 'counseling', 'psychologist',
                'dentist', 'dental', 'optometrist', 'eye doctor',
                'chiropractor', 'acupuncture', 'massage therapy',
                'vaccination', 'vaccine', 'immunization',
                'biopsy', 'colonoscopy', 'endoscopy', 'mammogram',
                'ultrasound', 'echocardiogram', 'stress test',
                'diabetes', 'hypertension', 'asthma', 'arthritis',
                'pain management', 'rehabilitation', 'rehab',
                'emergency', 'urgent care', 'walk-in clinic'
            ]
            
            # Check if any medical keywords are present
            for keyword in medical_keywords:
                if keyword in summary or keyword in description:
                    logging.debug(f"Event '{summary}' identified as medical due to keyword: {keyword}")
                    return True
            
            # Additional checks for common medical event patterns
            # Check for time-based medication reminders
            if any(word in summary for word in ['morning', 'afternoon', 'evening', 'night', 'bedtime']):
                if any(word in summary for word in ['med', 'pill', 'dose', 'take']):
                    logging.debug(f"Event '{summary}' identified as medical medication reminder")
                    return True
            
            # Check for appointment-like patterns
            if any(word in summary for word in ['visit', 'see', 'meet', 'call']):
                if any(word in summary for word in ['dr', 'doctor', 'nurse', 'specialist']):
                    logging.debug(f"Event '{summary}' identified as medical appointment")
                    return True
            
            # Check for recurring medical events
            if any(word in summary for word in ['weekly', 'monthly', 'daily', 'recurring']):
                if any(word in summary for word in ['check', 'monitor', 'test', 'med']):
                    logging.debug(f"Event '{summary}' identified as recurring medical event")
                    return True
            
            logging.debug(f"Event '{summary}' not identified as medical")
            return False
            
        except Exception as e:
            logging.error(f"Error checking if event is medical: {e}")
            return False
    
    def _is_appointment_event(self, event: Dict[str, Any]) -> bool:
        """
        Check if an event is an appointment
        """
        try:
            summary = event.get('summary', '').lower()
            description = event.get('description', '').lower()
            
            appointment_keywords = [
                'dr.', 'doctor', 'physician', 'appointment', 'checkup', 'consultation',
                'follow-up', 'followup', 'physical', 'examination', 'exam'
            ]
            
            for keyword in appointment_keywords:
                if keyword in summary or keyword in description:
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Error checking if event is appointment: {e}")
            return False
    
    def _is_reminder_event(self, event: Dict[str, Any]) -> bool:
        """
        Check if an event is a health reminder
        """
        try:
            summary = event.get('summary', '').lower()
            description = event.get('description', '').lower()
            
            reminder_keywords = [
                'reminder', 'alert', 'notification', 'check', 'monitor',
                'blood pressure', 'blood sugar', 'weight', 'exercise'
            ]
            
            for keyword in reminder_keywords:
                if keyword in summary or keyword in description:
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Error checking if event is reminder: {e}")
            return False
    
    def _determine_event_type(self, event: Dict[str, Any]) -> str:
        """
        Determine the type of medical event
        """
        if self._is_appointment_event(event):
            return 'appointment'
        elif '💊' in event.get('summary', ''):
            return 'medication'
        elif self._is_reminder_event(event):
            return 'reminder'
        else:
            return 'other'
    
    def _format_calendar_event(self, event: Dict[str, Any], event_type: str) -> Dict[str, Any]:
        """
        Format a Google Calendar event for the API response
        """
        try:
            # Handle different date formats from Google Calendar
            start_data = event.get('start', {})
            end_data = event.get('end', {})
            
            if 'dateTime' in start_data:
                start_time = datetime.fromisoformat(start_data['dateTime'].replace('Z', '+00:00'))
            elif 'date' in start_data:
                start_time = datetime.strptime(start_data['date'], '%Y-%m-%d')
            else:
                logging.warning(f"Invalid start time format for event: {event.get('id')}")
                return {}
            
            if 'dateTime' in end_data:
                end_time = datetime.fromisoformat(end_data['dateTime'].replace('Z', '+00:00'))
            elif 'date' in end_data:
                end_time = datetime.strptime(end_data['date'], '%Y-%m-%d')
            else:
                # Default end time if not specified
                end_time = start_time + timedelta(hours=1)
            
            now = datetime.now()
            
            # Calculate days until event
            days_until = (start_time - now).days
            
            formatted_event = {
                'id': event.get('id'),
                'title': event.get('summary', 'Untitled Event'),
                'description': event.get('description', ''),
                'type': event_type,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'datetime': start_time.isoformat(),
                'date': start_time.strftime('%Y-%m-%d'),
                'time': start_time.strftime('%H:%M'),
                'location': event.get('location', ''),
                'color_id': event.get('colorId'),
                'days_until': days_until,
                'is_today': days_until == 0,
                'is_tomorrow': days_until == 1,
                'is_this_week': 0 <= days_until <= 7,
                'duration_minutes': int((end_time - start_time).total_seconds() / 60)
            }
            
            return formatted_event
            
        except Exception as e:
            logging.error(f"Error formatting calendar event: {e}")
            return {}
    
    def _filter_and_deduplicate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filter out past events and remove duplicates
        """
        try:
            now = datetime.now()
            filtered_events = []
            seen_events = set()
            
            for event in events:
                # Skip past events
                if event.get('datetime'):
                    try:
                        event_time = datetime.fromisoformat(event['datetime'].replace('Z', '+00:00'))
                        if event_time < now:
                            continue
                    except ValueError:
                        logging.warning(f"Invalid datetime format: {event.get('datetime')}")
                        continue
                
                # Create a unique key for deduplication
                event_key = f"{event.get('title', '')}_{event.get('datetime', '')}_{event.get('type', '')}"
                
                if event_key not in seen_events:
                    seen_events.add(event_key)
                    filtered_events.append(event)
            
            return filtered_events
            
        except Exception as e:
            logging.error(f"Error filtering and deduplicating events: {e}")
            return events
