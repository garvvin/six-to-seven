from supabase import create_client, Client
from dotenv import load_dotenv
import os
import hashlib
import secrets

load_dotenv()

class SupabaseService:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
        
        # Create Supabase client with proper initialization
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.sha256((password + salt).encode())
        return f"{salt}${hash_obj.hexdigest()}"
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hashed password"""
        try:
            salt, hash_value = hashed_password.split('$', 1)
            hash_obj = hashlib.sha256((password + salt).encode())
            return hash_obj.hexdigest() == hash_value
        except:
            return False
    
    def create_user(self, email: str, password: str, username: str):
        """Create a new user in the database"""
        try:
            # Check if user already exists
            existing_user = self.supabase.table('users').select('*').eq('email', email).execute()
            if existing_user.data:
                return {'error': 'User with this email already exists'}, 400
            
            # Hash password
            hashed_password = self.hash_password(password)
            
            # Insert user
            user_data = {
                'email': email,
                'password_hash': hashed_password,
                'username': username
            }
            
            result = self.supabase.table('users').insert(user_data).execute()
            
            if result.data:
                user = result.data[0]
                # Remove password from response
                user.pop('password_hash', None)
                return user, 201
            else:
                return {'error': 'Failed to create user'}, 500
                
        except Exception as e:
            return {'error': str(e)}, 500
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate user with email and password"""
        try:
            # Get user by email
            result = self.supabase.table('users').select('*').eq('email', email).execute()
            
            if not result.data:
                return {'error': 'Invalid credentials'}, 401
            
            user = result.data[0]
            
            # Verify password
            if not self.verify_password(password, user['password_hash']):
                return {'error': 'Invalid credentials'}, 401
            
            # Remove password from response
            user.pop('password_hash', None)
            return user, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    def get_user_by_id(self, user_id: str):
        """Get user by ID"""
        try:
            result = self.supabase.table('users').select('*').eq('id', user_id).execute()
            
            if not result.data:
                return {'error': 'User not found'}, 404
            
            user = result.data[0]
            user.pop('password_hash', None)
            return user, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    def update_user(self, user_id: str, update_data: dict):
        """Update user information"""
        try:
            # Remove sensitive fields that shouldn't be updated
            update_data.pop('id', None)
            update_data.pop('email', None)  # Email shouldn't be changed via this endpoint
            
            result = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
            
            if result.data:
                user = result.data[0]
                user.pop('password_hash', None)
                return user, 200
            else:
                return {'error': 'User not found'}, 404
                
        except Exception as e:
            return {'error': str(e)}, 500
