#!/usr/bin/env python3
"""
Test script for the new calendar routes
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:5005"
API_BASE = f"{BASE_URL}/api"

def test_calendar_routes():
    """Test all calendar routes"""
    
    print("🧪 Testing Calendar Routes")
    print("=" * 50)
    
    # Test 1: Get upcoming medical dates
    print("\n1. Testing /upcoming-medical-dates")
    try:
        response = requests.get(f"{API_BASE}/calendar/upcoming-medical-dates")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {data.get('total_events', 0)} upcoming events")
            print(f"Filters: {data.get('filters', {})}")
            
            # Show first few events
            events = data.get('upcoming_dates', [])
            for i, event in enumerate(events[:3]):
                print(f"  Event {i+1}: {event.get('title')} on {event.get('date')} at {event.get('time')}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 2: Get medical events
    print("\n2. Testing /medical-events")
    try:
        response = requests.get(f"{API_BASE}/calendar/medical-events")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {data.get('total_events', 0)} medical events")
            print(f"Date range: {data.get('date_range', {})}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 3: Get next medical event
    print("\n3. Testing /next-medical-event")
    try:
        response = requests.get(f"{API_BASE}/calendar/next-medical-event")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('next_event'):
                event = data['next_event']
                print(f"✅ Success: Next event is '{event.get('title')}' on {event.get('date')}")
            else:
                print("✅ Success: No upcoming medical events found")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 4: Get calendar summary
    print("\n4. Testing /calendar-summary")
    try:
        response = requests.get(f"{API_BASE}/calendar/calendar-summary")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            summary = data.get('summary', {})
            print(f"✅ Success: Calendar Summary")
            print(f"  Total events: {summary.get('total_events', 0)}")
            print(f"  Appointments: {summary.get('appointments', 0)}")
            print(f"  Medications: {summary.get('medications', 0)}")
            print(f"  Reminders: {summary.get('reminders', 0)}")
            print(f"  Upcoming week: {summary.get('upcoming_week', 0)}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 5: Test with query parameters
    print("\n5. Testing with query parameters")
    try:
        params = {
            'days_ahead': 7,
            'include_medications': 'true',
            'include_appointments': 'true',
            'include_reminders': 'false'
        }
        response = requests.get(f"{API_BASE}/calendar/upcoming-medical-dates", params=params)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {data.get('total_events', 0)} events for next 7 days")
            print(f"Applied filters: {data.get('filters', {})}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_health_check():
    """Test if the server is running"""
    print("\n🏥 Testing Server Health")
    print("=" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is healthy: {data.get('message', 'Unknown')}")
            return True
        else:
            print(f"❌ Server health check failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Calendar Routes Test")
    print(f"Target server: {BASE_URL}")
    
    # First check if server is running
    if test_health_check():
        # Test calendar routes
        test_calendar_routes()
    else:
        print("\n❌ Server is not running. Please start the Flask server first.")
        print("Run: python run.py")
    
    print("\n�� Test completed!")
