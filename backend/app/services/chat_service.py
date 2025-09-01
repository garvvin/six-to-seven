import openai
import os
from typing import Dict, Any, List

class ChatService:
    def __init__(self):
        # Initialize OpenAI client with new API
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        if not os.getenv('OPENAI_API_KEY'):
            raise ValueError("OPENAI_API_KEY environment variable is required")
    
    def health_chat(self, user_message: str, health_context: List[Dict[str, Any]]) -> str:
        """
        Generate AI response based on user message and health context from analysis results
        
        Args:
            user_message: The user's question or message
            health_context: List of analysis results from PDF processing
            
        Returns:
            AI-generated response string
        """
        try:
            # Format health context for the prompt
            context_summary = self._format_health_context(health_context)
            
            prompt = f"""
            You are a personal health assistant with access to the user's medical documents and health data.
            
            User's Health Context (from analyzed medical documents):
            {context_summary}
            
            User's Question: {user_message}
            
            Instructions:
            - Provide helpful, personalized advice based on their medical history
            - Be encouraging and suggest actionable steps
            - If the user asks about specific test results or documents, reference the data you have
            - If you don't have enough information to answer safely, suggest consulting a healthcare provider
            - Keep responses professional but warm
            - Focus on general health insights and education, not medical diagnosis
            - Keep your response to 2-3 sentences maximum
            - Use short, clear sentences that are easy to understand
            - Avoid long, complex sentences
            
            Response:
            """
            
            # Call OpenAI API with new syntax
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful health assistant that provides general health guidance based on medical documents."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error in health_chat: {e}")
            return f"I'm sorry, I encountered an error while processing your request. Please try again or contact support. Error: {str(e)}"
    
    def _format_health_context(self, health_context: List[Dict[str, Any]]) -> str:
        """
        Format the health context from analysis results into a readable string, make it very concise and to the point depending on the number of documents analyzed and the situation with the user.
        """
        if not health_context:
            return "No medical documents have been analyzed yet."
        
        context_parts = []
        for i, result in enumerate(health_context, 1):
            context_parts.append(f"Document {i}: {result.get('fileName', 'Unknown file')}")
            
            # Extract key information from the analysis data
            data = result.get('data', {})
            if isinstance(data, dict):
                # Look for common medical data fields
                if 'patient_name' in data:
                    context_parts.append(f"  Patient: {data['patient_name']}")
                if 'test_results' in data:
                    context_parts.append(f"  Test Results: {data['test_results']}")
                if 'medications' in data:
                    context_parts.append(f"  Medications: {data['medications']}")
                if 'diagnosis' in data:
                    context_parts.append(f"  Diagnosis: {data['diagnosis']}")
                if 'symptoms' in data:
                    context_parts.append(f"  Symptoms: {data['symptoms']}")
                
                # If no specific fields found, include the raw data
                if not any(key in data for key in ['patient_name', 'test_results', 'medications', 'diagnosis', 'symptoms']):
                    context_parts.append(f"  Data: {str(data)[:200]}...")
            else:
                context_parts.append(f"  Data: {str(data)[:200]}...")
            
            context_parts.append(f"  Analyzed: {result.get('timestamp', 'Unknown time')}")
            context_parts.append("")
        
        return "\n".join(context_parts)
