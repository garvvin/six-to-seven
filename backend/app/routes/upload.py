from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import logging
# from ..services.ocr_service import OCRService  # Comment out complex OCR
from ..services.simple_ocr import SimpleOCRService  # Use simple OCR for testing

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
        
        # Return the JSON result
        response_data = {
            'success': True,
            'message': 'PDF processed successfully',
            'data': result
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
