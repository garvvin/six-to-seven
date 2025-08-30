#!/usr/bin/env python3
"""
Simple test script for the health insights route
"""

import requests
import json

# Test data (same as provided in the user query)
test_document_data = {
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

def test_health_insights():
    """Test the health insights endpoint"""
    
    print("Testing Health Insights Endpoint...")
    print("=" * 50)
    print("Expected format:")
    print("- Titles: Brief phrases (2-4 words), no 'recommendations'")
    print("- Descriptions: 1-2 sentences, patient-focused using 'you' language")
    print("- Approach: Written TO the patient, not ABOUT the patient")
    print("=" * 50)
    
    try:
        # Test the endpoint
        response = requests.post(
            'http://localhost:5005/api/health-insights/get-health-insights',
            json=test_document_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Health insights generated:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error text: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend is running on port 5005")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_health_insights()
