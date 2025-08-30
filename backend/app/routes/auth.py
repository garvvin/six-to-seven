from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from app.services.supabase_service import SupabaseService
from werkzeug.security import generate_password_hash, check_password_hash

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
        
        # Create user
        user, status_code = supabase_service.create_user(
            email=data['email'],
            password=data['password'],
            username=data['username']
        )
        
        if status_code == 201:
            # Create JWT token
            access_token = create_access_token(identity=user['id'])
            return jsonify({
                'message': 'User registered successfully',
                'user': user,
                'access_token': access_token
            }), 201
        else:
            return jsonify(user), status_code
            
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
        
        # Authenticate user
        user, status_code = supabase_service.authenticate_user(
            email=data['email'],
            password=data['password']
        )
        
        if status_code == 200:
            # Create JWT token
            access_token = create_access_token(identity=user['id'])
            return jsonify({
                'message': 'Login successful',
                'user': user,
                'access_token': access_token
            }), 200
        else:
            return jsonify(user), status_code
            
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
        user, status_code = supabase_service.get_user_by_id(current_user_id)
        
        if status_code == 200:
            return jsonify({
                'message': 'Session valid',
                'user': user
            }), 200
        else:
            return jsonify(user), status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user, status_code = supabase_service.get_user_by_id(current_user_id)
        
        if status_code == 200:
            return jsonify(user), 200
        else:
            return jsonify(user), status_code
            
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
        
        user, status_code = supabase_service.update_user(current_user_id, update_data)
        
        if status_code == 200:
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user
            }), 200
        else:
            return jsonify(user), status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
