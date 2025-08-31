#!/usr/bin/env python3
"""
Simple test for health insights functionality
"""

import requests
import json

def test_health_insights():
    """Test the health insights endpoint"""
    
    # Test data - simulate OCR results from a medical document
    test_document_data = {
        "patient_name": "John Doe",
        "date": "2024-01-15",
        "document_type": "blood_test_results",
        "results": {
            "cholesterol": "180 mg/dL",
            "blood_pressure": "120/80 mmHg",
            "glucose": "95 mg/dL",
            "hemoglobin": "14.2 g/dL"
        },
        "notes": "Patient shows normal ranges for most values. Cholesterol slightly elevated but within acceptable limits."
    }
    
    try:
        # Test health insights endpoint
        print("Testing health insights endpoint...")
        response = requests.post(
            'http://localhost:5005/api/health-insights/get-health-insights',
            json=test_document_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Health insights generated successfully!")
            print(f"Response: {json.dumps(result, indent=2)}")
            
            # Validate response structure
            if 'success' in result and result['success']:
                if 'data' in result and 'insights' in result['data']:
                    insights = result['data']['insights']
                    print(f"✅ Generated {len(insights)} insights")
                    for i, insight in enumerate(insights):
                        print(f"  Insight {i+1}: {insight.get('title', 'No title')}")
                        print(f"    Description: {insight.get('description', 'No description')}")
                else:
                    print("❌ Response missing 'data.insights'")
            else:
                print("❌ Response indicates failure")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the backend server is running on port 5005")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

def test_health_recommendations():
    """Test the health recommendations endpoint"""
    
    # Test data - simulate OCR results from a medical document
    test_document_data = {
        "patient_name": "John Doe",
        "date": "2024-01-15",
        "document_type": "blood_test_results",
        "results": {
            "cholesterol": "180 mg/dL",
            "blood_pressure": "120/80 mmHg",
            "glucose": "95 mg/dL",
            "hemoglobin": "14.2 g/dL"
        },
        "notes": "Patient shows normal ranges for most values. Cholesterol slightly elevated but within acceptable limits."
    }
    
    try:
        # Test health recommendations endpoint
        print("\nTesting health recommendations endpoint...")
        response = requests.post(
            'http://localhost:5005/api/health-insights/get-health-recommendations',
            json=test_document_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Health recommendations generated successfully!")
            print(f"Response: {json.dumps(result, indent=2)}")
            
            # Validate response structure
            if 'success' in result and result['success']:
                if 'data' in result and 'recommendations' in result['data']:
                    recommendations = result['data']['recommendations']
                    print(f"✅ Generated {len(recommendations)} recommendations")
                    for i, rec in enumerate(recommendations):
                        print(f"  Recommendation {i+1}: {rec.get('title', 'No title')}")
                        print(f"    Description: {rec.get('description', 'No description')}")
                        print(f"    Priority: {rec.get('priority', 'No priority')}")
                else:
                    print("❌ Response missing 'data.recommendations'")
            else:
                print("❌ Response indicates failure")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the backend server is running on port 5005")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

def test_health_check():
    """Test the health check endpoint"""
    try:
        print("\nTesting health check endpoint...")
        response = requests.get('http://localhost:5005/api/health-insights/health')
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Health check successful!")
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the backend server is running on port 5005")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    print("🧪 Testing Health Insights Backend API")
    print("=" * 50)
    
    # Test health check first
    test_health_check()
    
    # Test health insights
    test_health_insights()
    
    # Test health recommendations
    test_health_recommendations()
    
    print("\n" + "=" * 50)
    print("🏁 Testing completed!")
