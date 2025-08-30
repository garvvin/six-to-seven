from flask import Blueprint, request, jsonify
import openai
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

health_insights_bp = Blueprint('health_insights', __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@health_insights_bp.route('/get-health-insights', methods=['POST'])
def get_health_insights():
    """
    Generate health insights from parsed document data using OpenAI
    """
    try:
        print("Health insights endpoint called")
        print(f"Request headers: {dict(request.headers)}")
        
        # Get the request data
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate that we have the required document data
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid data format. Expected JSON object'}), 400
        
        # Create a prompt for OpenAI to generate health insights
        prompt = f"""
        Based on the following medical document data, generate 5-7 health insights that are specifically designed for the PATIENT to understand their health information.
        
        Document Data:
        {data}
        
        Please provide insights in the following JSON format:
        {{
            "insights": [
                {{
                    "title": "Brief Phrase Title",
                    "description": "1-2 sentences explaining what this means for YOU as a patient"
                }}
            ]
        }}
        
        IMPORTANT GUIDELINES:
        
        TITLES:
        - Use simple, brief phrases (2-4 words max)
        - NO words like "recommendations", "suggestions", "advice"
        - Use plain language, not medical jargon
        - Examples: "Blood Pressure Elevated", "New Medication Added", "Allergy Alert"
        
        DESCRIPTIONS:
        - Keep to 1-2 sentences maximum
        - Use simple, clear language
        - Write directly TO the patient using "you" and "your"
        - Explain what this information means for THEIR health
        - Avoid overly technical medical terms
        - Focus on what the patient needs to know about their own health
        
        PATIENT-FOCUSED APPROACH:
        - Write as if explaining to a friend or family member
        - Use "you" and "your" language
        - Explain why this information matters to the patient personally
        - Focus on what the patient should understand about their health
        - Avoid clinical/medical perspective - think patient perspective
        
        Focus on:
        - What your vital signs tell you about your health
        - How medication changes affect you personally
        - What allergies or safety concerns mean for you
        - What your symptoms or findings indicate about your health
        - What you should know or do next
        """
        
        # Call OpenAI API
        print("Calling OpenAI API...")
        print(f"OpenAI API Key set: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
        
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical AI assistant that creates simple, clear health insights specifically for PATIENTS. Write directly TO the patient using 'you' and 'your' language. Always use plain language, avoid medical jargon, and keep titles brief (2-4 words) and descriptions concise (1-2 sentences). Never use words like 'recommendations' or 'suggestions' in titles. Think like you're explaining health information to a friend or family member."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.2
        )
        
        print("OpenAI API call successful")
        # Extract the response content
        ai_response = response.choices[0].message.content
        
        # Try to parse the JSON response from AI
        try:
            import json
            insights_data = json.loads(ai_response)
            
            # Validate the structure
            if 'insights' not in insights_data or not isinstance(insights_data['insights'], list):
                # If AI didn't return proper JSON, create a fallback response
                insights_data = {
                    "insights": [
                        {
                            "title": "Document Analysis Complete",
                            "description": "AI analysis completed. Please review the generated insights below."
                        }
                    ]
                }
        except json.JSONDecodeError:
            # If JSON parsing fails, create a fallback response
            insights_data = {
                "insights": [
                    {
                        "title": "Document Analysis Complete",
                        "description": "AI analysis completed. Please review the generated insights below."
                    }
                ]
            }
        
        # Return the insights
        response_data = {
            'success': True,
            'message': 'Health insights generated successfully',
            'data': insights_data
        }
        
        return jsonify(response_data), 200
        
    except openai.AuthenticationError:
        return jsonify({'error': 'OpenAI API authentication failed. Please check your API key.'}), 500
    except openai.RateLimitError:
        return jsonify({'error': 'OpenAI API rate limit exceeded. Please try again later.'}), 429
    except openai.APIError as e:
        return jsonify({'error': f'OpenAI API error: {str(e)}'}), 500
    except Exception as e:
        logging.error(f"Error generating health insights: {str(e)}")
        return jsonify({'error': f'Failed to generate health insights: {str(e)}'}), 500

@health_insights_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for health insights service
    """
    return jsonify({'status': 'healthy', 'service': 'Health Insights'}), 200
