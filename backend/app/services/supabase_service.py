import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class SupabaseService:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            logging.error("Missing Supabase environment variables")
            self.client = None
        else:
            try:
                self.client: Client = create_client(self.supabase_url, self.supabase_key)
                logging.info("Supabase client initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Supabase client: {e}")
                self.client = None
    
    def store_ocr_result(self, ocr_data, email=None):
        """
        Store OCR result in the information table
        
        Args:
            ocr_data (dict): The OCR result data
            email (str, optional): User's email
            
        Returns:
            dict: Result of the operation
        """
        if not self.client:
            return {
                'success': False,
                'error': 'Supabase client not initialized'
            }
        
        try:
            # Prepare data for insertion
            insert_data = {
                'info': ocr_data,
                'email': email
            }
            
            # Insert data into the information table
            result = self.client.table('information').insert(insert_data).execute()
            
            if result.data:
                logging.info(f"OCR result stored successfully with ID: {result.data[0].get('id')}")
                return {
                    'success': True,
                    'data': result.data[0],
                    'message': 'OCR result stored successfully'
                }
            else:
                logging.error("No data returned from Supabase insert")
                return {
                    'success': False,
                    'error': 'No data returned from insert operation'
                }
                
        except Exception as e:
            error_msg = str(e)
            logging.error(f"Error storing OCR result in Supabase: {error_msg}")
            
            # Handle common RLS errors
            if "row-level security policy" in error_msg:
                return {
                    'success': False,
                    'error': 'Row Level Security (RLS) is enabled on the table. Please check Supabase RLS policies or disable RLS for the information table.',
                    'details': error_msg
                }
            
            return {
                'success': False,
                'error': error_msg
            }
    
    def get_ocr_results(self, email=None, limit=100):
        """
        Retrieve OCR results from the information table
        
        Args:
            email (str, optional): Filter by email
            limit (int): Maximum number of results to return
            
        Returns:
            dict: Result of the operation
        """
        if not self.client:
            return {
                'success': False,
                'error': 'Supabase client not initialized'
            }
        
        try:
            query = self.client.table('information').select('*').order('id', desc=True).limit(limit)
            
            if email:
                query = query.eq('email', email)
            
            result = query.execute()
            
            if result.data is not None:
                logging.info(f"Retrieved {len(result.data)} OCR results")
                return {
                    'success': True,
                    'data': result.data,
                    'count': len(result.data)
                }
            else:
                logging.error("No data returned from Supabase query")
                return {
                    'success': False,
                    'error': 'No data returned from query'
                }
                
        except Exception as e:
            logging.error(f"Error retrieving OCR results from Supabase: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_ocr_result(self, result_id):
        """
        Delete an OCR result by ID
        
        Args:
            result_id (int): ID of the result to delete
            
        Returns:
            dict: Result of the operation
        """
        if not self.client:
            return {
                'success': False,
                'error': 'Supabase client not initialized'
            }
        
        try:
            result = self.client.table('information').delete().eq('id', result_id).execute()
            
            if result.data:
                logging.info(f"OCR result {result_id} deleted successfully")
                return {
                    'success': True,
                    'message': f'OCR result {result_id} deleted successfully'
                }
            else:
                logging.error(f"No result found with ID {result_id}")
                return {
                    'success': False,
                    'error': f'No result found with ID {result_id}'
                }
                
        except Exception as e:
            logging.error(f"Error deleting OCR result {result_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    # User Authentication Methods
    def authenticate_user(self, email, password):
        """
        Authenticate user with email and password
        
        Args:
            email (str): User's email
            password (str): User's password
            
        Returns:
            dict: Result of the operation
        """
        if not self.client:
            return {
                'success': False,
                'error': 'Supabase client not initialized'
            }
        
        try:
            # Get user by email
            result = self.client.table('users').select('*').eq('email', email).execute()
            
            if not result.data:
                return {
                    'success': False,
                    'error': 'Invalid credentials'
                }
            
            user = result.data[0]
            
            # Verify password hash
            if not self.verify_password(password, user['password_hash']):
                return {
                    'success': False,
                    'error': 'Invalid credentials'
                }
            
            # Return user without password
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'username': user['username'],
                'created_at': user.get('created_at')
            }
            
            return {
                'success': True,
                'data': user_data
            }
                
        except Exception as e:
            logging.error(f"Error authenticating user: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_user_by_id(self, user_id):
        """
        Get user by ID
        
        Args:
            user_id (str): User's ID
            
        Returns:
            dict: Result of the operation
        """
        if not self.client:
            return {
                'success': False,
                'error': 'Supabase client not initialized'
            }
        
        try:
            result = self.client.table('users').select('*').eq('id', user_id).execute()
            
            if not result.data:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            user = result.data[0]
            
            # Return user without password
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'username': user['username'],
                'created_at': user.get('created_at')
            }
            
            return {
                'success': True,
                'data': user_data
            }
                
        except Exception as e:
            logging.error(f"Error getting user by ID: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_password(self, password, hashed_password):
        """
        Verify password against hashed password
        
        Args:
            password (str): Plain text password
            hashed_password (str): Hashed password from database
            
        Returns:
            bool: True if password matches
        """
        try:
            # Split the hash to get salt and hash
            if '$' in hashed_password:
                salt, hash_value = hashed_password.split('$', 1)
                # Recreate hash with salt
                import hashlib
                hash_obj = hashlib.sha256((password + salt).encode())
                return hash_obj.hexdigest() == hash_value
            else:
                # Fallback for different hash format
                return False
        except:
            return False
