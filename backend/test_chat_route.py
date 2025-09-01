#!/usr/bin/env python3
"""
Test script for the chat route functionality
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:5005"
API_BASE = f"{BASE_URL}/api"

def test_chat_endpoints():
    """Test the chat endpoints"""
    
    print("Testing Chat Endpoints...")
    print("=" * 50)
    
    # Test 1: Health chat without authentication (should fail)
    print("\n1. Testing health chat without authentication...")
    try:
        response = requests.post(
            f"{API_BASE}/chat/health-chat",
            json={
                "message": "What can you tell me about my health?",
                "include_health_context": True
            }
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✓ Correctly rejected unauthenticated request")
        else:
            print("✗ Should have rejected unauthenticated request")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Chat history without authentication (should fail)
    print("\n2. Testing chat history without authentication...")
    try:
        response = requests.get(f"{API_BASE}/chat/chat-history")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✓ Correctly rejected unauthenticated request")
        else:
            print("✗ Should have rejected unauthenticated request")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Clear chat history without authentication (should fail)
    print("\n3. Testing clear chat history without authentication...")
    try:
        response = requests.delete(f"{API_BASE}/chat/clear-chat-history")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✓ Correctly rejected unauthenticated request")
        else:
            print("✗ Should have rejected unauthenticated request")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 4: Check if server is running
    print("\n4. Testing server health...")
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✓ Server is running and responding")
        else:
            print("✗ Server health check failed")
            
    except Exception as e:
        print(f"Error: {e}")
        print("✗ Server might not be running")
    
    print("\n" + "=" * 50)
    print("Chat endpoint tests completed!")
    print("\nNote: To test authenticated endpoints, you'll need to:")
    print("1. Start the server (python run.py)")
    print("2. Get a valid JWT token from /api/auth/login")
    print("3. Include the token in the Authorization header")

if __name__ == "__main__":
    test_chat_endpoints()
