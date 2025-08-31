#!/usr/bin/env python3
"""
Test script for the health recommendations route
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

def test_health_recommendations():
    """Test the health recommendations endpoint"""
    
    print("Testing Health Recommendations Endpoint...")
    print("=" * 60)
    print("Expected format:")
    print("- Titles: Action-oriented phrases (2-4 words)")
    print("- Descriptions: 1-2 sentences explaining what to do and why")
    print("- Priority: high/medium/low based on urgency")
    print("- Approach: Actionable steps the patient can take")
    print("=" * 60)
    
    try:
        # Test the endpoint
        response = requests.post(
            'http://localhost:5005/api/health-insights/get-health-recommendations',
            json=test_document_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Health recommendations generated:")
            print(json.dumps(result, indent=2))
            
            # Validate the structure
            if 'data' in result and 'recommendations' in result['data']:
                recommendations = result['data']['recommendations']
                print(f"\n📊 Summary: {len(recommendations)} recommendations generated")
                
                for i, rec in enumerate(recommendations, 1):
                    print(f"\n{i}. {rec.get('title', 'N/A')} (Priority: {rec.get('priority', 'N/A')})")
                    print(f"   {rec.get('description', 'N/A')}")
            else:
                print("⚠️  Warning: Response structure doesn't match expected format")
                
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
    test_health_recommendations()
