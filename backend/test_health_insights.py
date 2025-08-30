#!/usr/bin/env python3
"""
Test script for the health insights route
"""

import json
import requests

# Sample document data (same as provided in the user query)
sample_document_data = {
    "allergies": {
        "new_allergies": "N/A",
        "unchanged_from_summary": True
    },
    "chief_complaint": "Difficulty breathing",
    "clinical_staff": {
        "printed_name": None,
        "signature_present": True
    },
    "date_of_service": {
        "raw": "[redacted]",
        "value": None
    },
    "doc_type": "EMR Downtime Office Visit Form",
    "hpi": {
        "free_text": None,
        "symptoms_checked": [
            "Wheezing",
            "Cough",
            "Chest tightness"
        ]
    },
    "impression_or_diagnosis": "Upper respiratory infection",
    "location_of_care": "Kaiser ABQ",
    "medications": {
        "added_or_changed": [
            "Albuterol"
        ],
        "deleted": [
            "Lisinopril"
        ],
        "unchanged_from_summary": True
    },
    "patient_name": {
        "raw": "Shortness of breath",
        "value": None
    },
    "review_of_systems": {
        "chest": "unremarkable",
        "ent": "unremarkable",
        "eyes": "unremarkable",
        "general": "unremarkable",
        "head": "unremarkable",
        "neck": "unremarkable"
    },
    "source_quality_notes": "Parsed using simple OCR. Raw text length: 769 characters.",
    "visit_type": "Consuitation",
    "vitals": {
        "blood_pressure": "135/85",
        "pulse_rate": 96,
        "resp_rate": 18,
        "temperature": {
            "method": None,
            "raw": "Temp/ Method 98.6  OI",
            "unit": None,
            "value": 98.6
        }
    }
}

def test_health_insights_route():
    """Test the health insights route"""
    
    # Base URL for the backend
    base_url = "http://localhost:5000"
    
    # Test the health check endpoint first
    try:
        health_response = requests.get(f"{base_url}/api/health-insights/health")
        print(f"Health check status: {health_response.status_code}")
        print(f"Health check response: {health_response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running. Please start the backend first.")
        print("   Run: python run.py")
        return
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test the main health insights endpoint
    try:
        print("\n" + "="*50)
        print("Testing Health Insights Route")
        print("="*50)
        
        response = requests.post(
            f"{base_url}/api/health-insights/get-health-insights",
            json=sample_document_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Success! Health insights generated:")
            print(json.dumps(result, indent=2))
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_health_insights_route()
