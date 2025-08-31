from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from werkzeug.security import generate_password_hash, check_password_hash
from app.services.supabase_service import SupabaseService
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

auth_bp = Blueprint('auth', __name__)
supabase_service = SupabaseService()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'username']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if '@' not in data['email']:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password length
        if len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists in Supabase
        existing_user = supabase_service.client.table('users').select('*').eq('email', data['email']).execute()
        if existing_user.data:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # For now, registration is disabled since users exist in Supabase
        return jsonify({'error': 'User registration is disabled. Users are managed in Supabase.'}), 501
        
        # Registration disabled
        pass
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Authenticate user using Supabase
        auth_result = supabase_service.authenticate_user(data['email'], data['password'])
        
        if not auth_result['success']:
            return jsonify({'error': auth_result['error']}), 401
        
        user = auth_result['data']
        
        # Create JWT token
        access_token = create_access_token(identity=user['id'])
        return jsonify({
            'message': 'Login successful',
            'user': user,
            'access_token': access_token
        }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (JWT will be invalidated on frontend)"""
    try:
        # In a real application, you might want to add the token to a blacklist
        # For now, we'll just return a success message
        # The frontend should remove the token
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/session', methods=['GET'])
@jwt_required()
def get_session():
    """Get current user session information"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user from Supabase
        user_result = supabase_service.get_user_by_id(current_user_id)
        
        if user_result['success']:
            return jsonify({
                'message': 'Session valid',
                'user': user_result['data']
            }), 200
        else:
            return jsonify({'error': user_result['error']}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user from Supabase
        user_result = supabase_service.get_user_by_id(current_user_id)
        
        if user_result['success']:
            return jsonify(user_result['data']), 200
        else:
            return jsonify({'error': user_result['error']}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Only allow updating certain fields
        allowed_fields = ['username']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # For now, profile updates are not implemented in Supabase
        # You would need to add an update_user method to the Supabase service
        return jsonify({
            'error': 'Profile updates not yet implemented'
        }), 501
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/test-user/<email>', methods=['GET'])
def test_user(email):
    """Test endpoint to check user data (for debugging)"""
    try:
        # Get user by email from Supabase
        result = supabase_service.client.table('users').select('*').eq('email', email).execute()
        
        if result.data:
            user = result.data[0]
            # Don't return the password hash in production
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'username': user['username'],
                    'created_at': user.get('created_at'),
                    'password_hash_length': len(user['password_hash']) if user['password_hash'] else 0
                }
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
