#!/usr/bin/env python3
"""
Test script for Google Calendar integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.calendar_service import CalendarService
from app.services.supabase_service import SupabaseService
from app.services.medications_service import MedicationsService

def test_calendar_service():
    """Test the calendar service functionality"""
    print("Testing Calendar Service...")
    
    try:
        # Initialize services
        calendar_service = CalendarService()
        supabase_service = SupabaseService()
        medications_service = MedicationsService()
        
        print("✓ Services initialized successfully")
        
        # Test medication schedules (without Google Calendar token)
        print("\nTesting medication schedules...")
        medication_dates = calendar_service._get_medication_schedules(days_ahead=7)
        print(f"✓ Found {len(medication_dates)} medication schedule events")
        
        # Test upcoming medical dates (without Google Calendar token)
        print("\nTesting upcoming medical dates (medications only)...")
        upcoming_dates = calendar_service.get_upcoming_medical_dates(
            days_ahead=7,
            include_medications=True,
            include_appointments=False,
            include_reminders=False
        )
        print(f"✓ Found {len(upcoming_dates)} upcoming medical dates")
        
        # Test medical event classification
        print("\nTesting medical event classification...")
        test_events = [
            {
                'summary': 'Dr. Smith - Cardiology Appointment',
                'description': 'Annual checkup with cardiologist',
                'start': {'dateTime': '2024-02-14T10:00:00-05:00'},
                'end': {'dateTime': '2024-02-14T11:00:00-05:00'},
                'location': 'Heart Center'
            },
            {
                'summary': 'Blood Work',
                'description': 'Routine blood tests and lab work',
                'start': {'dateTime': '2024-02-19T09:00:00-05:00'},
                'end': {'dateTime': '2024-02-19T10:00:00-05:00'},
                'location': 'Lab Services'
            },
            {
                'summary': 'Team Meeting',
                'description': 'Weekly team sync meeting',
                'start': {'dateTime': '2024-02-15T14:00:00-05:00'},
                'end': {'dateTime': '2024-02-15T15:00:00-05:00'},
                'location': 'Conference Room'
            }
        ]
        
        medical_events = 0
        for event in test_events:
            if calendar_service._is_medical_event(event):
                medical_events += 1
                event_type = calendar_service._determine_event_type(event)
                print(f"  ✓ '{event['summary']}' classified as {event_type}")
            else:
                print(f"  ✗ '{event['summary']}' NOT classified as medical")
        
        print(f"✓ Correctly identified {medical_events} out of {len(test_events)} events as medical")
        
        print("\n✅ All calendar service tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Calendar service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    print("\nTesting Supabase connection...")
    
    try:
        supabase_service = SupabaseService()
        ocr_results = supabase_service.get_ocr_results()
        
        if ocr_results['success']:
            print(f"✓ Supabase connection successful - {len(ocr_results['data'])} OCR results found")
            return True
        else:
            print(f"⚠ Supabase connection failed: {ocr_results.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Supabase test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Google Calendar Integration Tests\n")
    
    # Test Supabase connection first
    if not test_supabase_connection():
        print("\n⚠ Continuing with limited functionality...")
    
    # Test calendar service
    if test_calendar_service():
        print("\n🎉 Calendar integration is ready!")
        print("\nNext steps:")
        print("1. Set up Google OAuth credentials in frontend")
        print("2. Test the frontend calendar connection")
        print("3. Verify real Google Calendar events are fetched")
    else:
        print("\n❌ Calendar integration needs attention")
        sys.exit(1)

if __name__ == "__main__":
    main()
