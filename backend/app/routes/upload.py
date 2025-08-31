from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import logging
# from ..services.ocr_service import OCRService  # Comment out complex OCR
from ..services.simple_ocr import SimpleOCRService  # Use simple OCR for testing
from ..services.supabase_service import SupabaseService

upload_bp = Blueprint('upload', __name__)

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    """
    Handle PDF file upload and OCR processing
    """
    print("="*50)
    print("PDF UPLOAD REQUEST RECEIVED")
    print("="*50)
    print(f"Request method: {request.method}")
    print(f"Request content type: {request.content_type}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request files: {list(request.files.keys()) if request.files else 'No files'}")
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            print("ERROR: No file in request.files")
            print("Available keys:", list(request.files.keys()) if request.files else 'None')
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        print(f"File received: {file.filename}")
        print(f"File content type: {file.content_type}")
        print(f"File stream: {file.stream}")
        
        # Check if file is selected
        if file.filename == '':
            print("ERROR: Empty filename")
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        if not allowed_file(file.filename):
            print(f"ERROR: Invalid file type: {file.filename}")
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        print("File validation passed, processing with OCR...")
        
        # Read file bytes
        file_bytes = file.read()
        print(f"File bytes read: {len(file_bytes)} bytes")
        
        if len(file_bytes) == 0:
            print("ERROR: File is empty")
            return jsonify({'error': 'File is empty'}), 400
        
        # Initialize OCR service
        print("Initializing Simple OCR service...")
        ocr_service = SimpleOCRService()
        print("Simple OCR service initialized successfully")
        
        # Process PDF to JSON
        print("Processing PDF with Simple OCR...")
        result = ocr_service.process_pdf_to_json(file_bytes)
        print("Simple OCR processing completed successfully")
        
        # Store result in Supabase
        print("Storing OCR result in Supabase...")
        supabase_service = SupabaseService()
        supabase_result = supabase_service.store_ocr_result(result)
        
        if supabase_result['success']:
            print("OCR result stored in Supabase successfully")
            print(f"Stored with ID: {supabase_result['data'].get('id')}")
        else:
            print(f"Warning: Failed to store in Supabase: {supabase_result['error']}")
        
        # Return the JSON result
        response_data = {
            'success': True,
            'message': 'PDF processed successfully',
            'data': result,
            'supabase_stored': supabase_result['success'],
            'supabase_id': supabase_result['data'].get('id') if supabase_result['success'] else None,
            'supabase_error': supabase_result.get('error') if not supabase_result['success'] else None
        }
        print("Returning success response")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to process PDF: {str(e)}'}), 500

@upload_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({'status': 'healthy', 'service': 'PDF Upload & OCR'}), 200

@upload_bp.route('/ocr-results', methods=['GET'])
def get_ocr_results():
    """
    Retrieve stored OCR results from Supabase
    """
    try:
        # Get query parameters
        email = request.args.get('email')
        limit = request.args.get('limit', 100, type=int)
        
        print(f"Fetching OCR results - Email: {email}, Limit: {limit}")
        
        # Initialize Supabase service
        supabase_service = SupabaseService()
        result = supabase_service.get_ocr_results(email=email, limit=limit)
        
        if result['success']:
            print(f"Successfully retrieved {result['count']} OCR results")
            return jsonify({
                'success': True,
                'data': result['data'],
                'count': result['count']
            }), 200
        else:
            print(f"Failed to retrieve OCR results: {result['error']}")
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        print(f"EXCEPTION in get_ocr_results: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to retrieve OCR results: {str(e)}'}), 500

@upload_bp.route('/ocr-results/<int:result_id>', methods=['DELETE'])
def delete_ocr_result(result_id):
    """
    Delete a specific OCR result by ID
    """
    try:
        print(f"Deleting OCR result with ID: {result_id}")
        
        # Initialize Supabase service
        supabase_service = SupabaseService()
        result = supabase_service.delete_ocr_result(result_id)
        
        if result['success']:
            print(f"Successfully deleted OCR result {result_id}")
            return jsonify({
                'success': True,
                'message': result['message']
            }), 200
        else:
            print(f"Failed to delete OCR result {result_id}: {result['error']}")
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        print(f"EXCEPTION in delete_ocr_result: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to delete OCR result: {str(e)}'}), 500
