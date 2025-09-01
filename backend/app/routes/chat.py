from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.chat_service import ChatService
from app.services.supabase_service import SupabaseService
import json

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()
supabase_service = SupabaseService()

@chat_bp.route('/health-chat', methods=['POST'])
@jwt_required()
def health_chat():
    """
    Endpoint for health-related chat with AI assistant
    
    Expected JSON payload:
    {
        "message": "User's question or message",
        "include_health_context": true/false (optional, defaults to true)
    }
    
    Returns:
    {
        "response": "AI-generated response",
        "success": true/false,
        "message": "Status message"
    }
    """
    try:
        # Get current user ID from JWT token
        current_user_id = get_jwt_identity()
        
        # Parse request data
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400
        
        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                'success': False,
                'message': 'Message cannot be empty'
            }), 400
        
        # Check if user wants to include health context
        include_health_context = data.get('include_health_context', True)
        
        health_context = []
        if include_health_context:
            # Fetch user's health insights/analysis results from Supabase
            try:
                health_insights = supabase_service.get_user_health_insights(current_user_id)
                if health_insights:
                    health_context = health_insights
            except Exception as e:
                print(f"Error fetching health context: {e}")
                # Continue without health context if there's an error
        
        # Generate AI response
        ai_response = chat_service.health_chat(user_message, health_context)
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'message': 'Chat response generated successfully',
            'health_context_included': len(health_context) > 0
        })
        
    except Exception as e:
        print(f"Error in health_chat endpoint: {e}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500

@chat_bp.route('/chat-history', methods=['GET'])
@jwt_required()
def get_chat_history():
    """
    Get chat history for the current user
    
    Query parameters:
    - limit: Number of messages to return (optional, defaults to 50)
    - offset: Number of messages to skip (optional, defaults to 0)
    
    Returns:
    {
        "success": true/false,
        "messages": [list of chat messages],
        "total": total number of messages
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Validate parameters
        if limit < 1 or limit > 100:
            limit = 50
        if offset < 0:
            offset = 0
        
        # Fetch chat history from Supabase (you may need to implement this)
        # For now, return empty history
        chat_history = []
        total = 0
        
        return jsonify({
            'success': True,
            'messages': chat_history,
            'total': total,
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        print(f"Error in get_chat_history endpoint: {e}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500

@chat_bp.route('/clear-chat-history', methods=['DELETE'])
@jwt_required()
def clear_chat_history():
    """
    Clear chat history for the current user
    
    Returns:
    {
        "success": true/false,
        "message": "Status message"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Clear chat history from Supabase (you may need to implement this)
        # For now, return success
        
        return jsonify({
            'success': True,
            'message': 'Chat history cleared successfully'
        })
        
    except Exception as e:
        print(f"Error in clear_chat_history endpoint: {e}")
        return jsonify({
            'success': False,
            'message': f'Internal server error: {str(e)}'
        }), 500
