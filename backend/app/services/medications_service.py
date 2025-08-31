import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

class MedicationsService:
    """
    Service to extract medications from OCR results and manage calendar integration
    """
    
    def __init__(self):
        self.default_medication_times = {
            'morning': '08:00',
            'afternoon': '14:00', 
            'evening': '20:00',
            'bedtime': '22:00'
        }
    
    def extract_medications_from_ocr(self, ocr_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract medication information from OCR data
        
        Args:
            ocr_data (dict): OCR result data from information table
            
        Returns:
            list: List of medications with timing information
        """
        try:
            medications = []
            
            # Check if medications exist in the OCR data
            if 'medications' not in ocr_data:
                logging.info("No medications found in OCR data")
                return medications
            
            med_data = ocr_data['medications']
            
            # Process added/changed medications
            if 'added_or_changed' in med_data and med_data['added_or_changed']:
                for med_name in med_data['added_or_changed']:
                    medication = self._create_medication_entry(med_name, 'active')
                    medications.append(medication)
            
            # Process deleted medications (for reference)
            if 'deleted' in med_data and med_data['deleted']:
                for med_name in med_data['deleted']:
                    medication = self._create_medication_entry(med_name, 'discontinued')
                    medications.append(medication)
            
            # If no specific medications found, check for common patterns
            if not medications:
                medications = self._extract_medications_from_text(ocr_data)
            
            logging.info(f"Extracted {len(medications)} medications from OCR data")
            return medications
            
        except Exception as e:
            logging.error(f"Error extracting medications from OCR: {e}")
            return []
    
    def _create_medication_entry(self, med_name: str, status: str) -> Dict[str, Any]:
        """
        Create a standardized medication entry
        
        Args:
            med_name (str): Name of the medication
            status (str): Status of the medication (active/discontinued)
            
        Returns:
            dict: Medication entry with timing information
        """
        # Common medication timing patterns
        timing_patterns = {
            'albuterol': ['morning', 'afternoon', 'evening'],  # 3x daily
            'lisinopril': ['morning'],  # 1x daily
            'metformin': ['morning', 'evening'],  # 2x daily
            'aspirin': ['morning'],  # 1x daily
            'vitamin': ['morning'],  # 1x daily
            'insulin': ['morning', 'evening'],  # 2x daily
        }
        
        # Determine timing based on medication name
        timing = ['morning']  # Default to once daily
        med_lower = med_name.lower()
        
        for pattern, times in timing_patterns.items():
            if pattern in med_lower:
                timing = times
                break
        
        return {
            'name': med_name,
            'status': status,
            'timing': timing,
            'times': [self.default_medication_times[t] for t in timing],
            'frequency': f"{len(timing)}x daily",
            'notes': f"Status: {status}"
        }
    
    def _extract_medications_from_text(self, ocr_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Fallback method to extract medications from raw text
        """
        medications = []
        
        # Look for medication mentions in various fields
        text_fields = ['chief_complaint', 'impression_or_diagnosis', 'source_quality_notes']
        
        for field in text_fields:
            if field in ocr_data and ocr_data[field]:
                text = str(ocr_data[field]).lower()
                
                # Common medication keywords
                med_keywords = [
                    'albuterol', 'lisinopril', 'metformin', 'aspirin', 'insulin',
                    'vitamin', 'antibiotic', 'medication', 'prescription'
                ]
                
                for keyword in med_keywords:
                    if keyword in text:
                        medication = self._create_medication_entry(keyword.title(), 'active')
                        if medication not in medications:
                            medications.append(medication)
        
        return medications
    
    def create_calendar_events(self, medications: List[Dict[str, Any]], 
                              start_date: str = None, duration_days: int = 7) -> List[Dict[str, Any]]:
        """
        Create calendar event data for medications
        
        Args:
            medications (list): List of medications
            start_date (str): Start date for events (YYYY-MM-DD)
            duration_days (int): Number of days to create events for
            
        Returns:
            list: List of calendar events
        """
        if not start_date:
            start_date = datetime.now().strftime('%Y-%m-%d')
        
        events = []
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        
        for medication in medications:
            if medication['status'] != 'active':
                continue
                
            for day in range(duration_days):
                current_date = start_dt + timedelta(days=day)
                
                for time_str in medication['times']:
                    event_time = datetime.strptime(f"{current_date.strftime('%Y-%m-%d')} {time_str}", 
                                                 '%Y-%m-%d %H:%M')
                    
                    event = {
                        'summary': f"💊 {medication['name']}",
                        'description': f"Medication: {medication['name']}\nFrequency: {medication['frequency']}\nNotes: {medication['notes']}",
                        'start': {
                            'dateTime': event_time.isoformat(),
                            'timeZone': 'America/New_York'
                        },
                        'end': {
                            'dateTime': (event_time + timedelta(minutes=15)).isoformat(),
                            'timeZone': 'America/New_York'
                        },
                        'reminders': {
                            'useDefault': False,
                            'overrides': [
                                {'method': 'popup', 'minutes': 15},
                                {'method': 'email', 'minutes': 30}
                            ]
                        },
                        'colorId': '11',  # Blue color for medications
                        'source': {
                            'title': 'HealthSync Medications',
                            'url': 'https://healthsync.app'
                        }
                    }
                    
                    events.append(event)
        
        return events
    
    def get_medications_summary(self, medications: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create a summary of medications for display
        
        Args:
            medications (list): List of medications
            
        Returns:
            dict: Summary information
        """
        active_meds = [med for med in medications if med['status'] == 'active']
        discontinued_meds = [med for med in medications if med['status'] == 'discontinued']
        
        return {
            'total_active': len(active_meds),
            'total_discontinued': len(discontinued_meds),
            'active_medications': active_meds,
            'discontinued_medications': discontinued_meds,
            'next_dose_times': self._get_next_dose_times(active_meds),
            'summary': f"{len(active_meds)} active medications, {len(discontinued_meds)} discontinued"
        }
    
    def _get_next_dose_times(self, active_medications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculate next dose times for active medications
        """
        next_doses = []
        now = datetime.now()
        
        for med in active_medications:
            for time_str in med['times']:
                # Parse the time
                time_parts = time_str.split(':')
                hour, minute = int(time_parts[0]), int(time_parts[1])
                
                # Create today's dose time
                today_dose = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
                
                # If today's dose time has passed, schedule for tomorrow
                if today_dose <= now:
                    today_dose += timedelta(days=1)
                
                next_doses.append({
                    'medication': med['name'],
                    'time': today_dose.strftime('%H:%M'),
                    'date': today_dose.strftime('%Y-%m-%d'),
                    'datetime': today_dose.isoformat()
                })
        
        # Sort by next dose time
        next_doses.sort(key=lambda x: x['datetime'])
        return next_doses[:5]  # Return next 5 doses
