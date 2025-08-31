from flask import Blueprint, request, jsonify
from app.services.medications_service import MedicationsService
from app.services.supabase_service import SupabaseService
import logging

medications_bp = Blueprint('medications', __name__)
medications_service = MedicationsService()
supabase_service = SupabaseService()

@medications_bp.route('/extract', methods=['GET'])
def extract_medications():
    """
    Extract medications from all OCR results in the information table
    """
    try:
        # Get all OCR results from Supabase
        ocr_results = supabase_service.get_ocr_results()
        
        if not ocr_results['success']:
            return jsonify({'error': 'Failed to fetch OCR results'}), 500
        
        all_medications = []
        
        # Extract medications from each OCR result
        for result in ocr_results['data']:
            if result.get('info') and isinstance(result['info'], dict):
                medications = medications_service.extract_medications_from_ocr(result['info'])
                if medications:
                    # Add source information
                    for med in medications:
                        med['source_ocr_id'] = result['id']
                        med['source_date'] = result.get('created_at')
                    
                    all_medications.extend(medications)
        
        # Create summary
        summary = medications_service.get_medications_summary(all_medications)
        
        return jsonify({
            'success': True,
            'medications': all_medications,
            'summary': summary,
            'total_extracted': len(all_medications)
        }), 200
        
    except Exception as e:
        logging.error(f"Error extracting medications: {e}")
        return jsonify({'error': str(e)}), 500

@medications_bp.route('/calendar-events', methods=['POST'])
def create_calendar_events():
    """
    Create calendar events for medications and add to Google Calendar
    """
    try:
        data = request.get_json()
        start_date = data.get('start_date')  # Optional: YYYY-MM-DD
        duration_days = data.get('duration_days', 7)  # Default 7 days
        
        # Get all OCR results and extract medications
        ocr_results = supabase_service.get_ocr_results()
        
        if not ocr_results['success']:
            return jsonify({'error': 'Failed to fetch OCR results'}), 500
        
        all_medications = []
        
        # Extract medications from each OCR result
        for result in ocr_results['data']:
            if result.get('info') and isinstance(result['info'], dict):
                medications = medications_service.extract_medications_from_ocr(result['info'])
                if medications:
                    all_medications.extend(medications)
        
        if not all_medications:
            return jsonify({'error': 'No medications found in OCR data'}), 404
        
        # Create calendar events
        calendar_events = medications_service.create_calendar_events(
            all_medications, 
            start_date, 
            duration_days
        )
        
        # Return the events that would be created
        # The frontend will handle adding them to Google Calendar via OAuth
        
        return jsonify({
            'success': True,
            'message': f'Created {len(calendar_events)} calendar events for {len(all_medications)} medications',
            'events': calendar_events,
            'medications': all_medications,
            'summary': medications_service.get_medications_summary(all_medications),
            'instructions': 'Use the frontend Google Calendar integration to add these events to your calendar'
        }), 200
        
    except Exception as e:
        logging.error(f"Error creating calendar events: {e}")
        return jsonify({'error': str(e)}), 500

@medications_bp.route('/summary', methods=['GET'])
def get_medications_summary():
    """
    Get a summary of all medications found in OCR data
    """
    try:
        # Get all OCR results and extract medications
        ocr_results = supabase_service.get_ocr_results()
        
        if not ocr_results['success']:
            return jsonify({'error': 'Failed to fetch OCR results'}), 500
        
        all_medications = []
        
        # Extract medications from each OCR result
        for result in ocr_results['data']:
            if result.get('info') and isinstance(result['info'], dict):
                medications = medications_service.extract_medications_from_ocr(result['info'])
                if medications:
                    all_medications.extend(medications)
        
        # Create summary
        summary = medications_service.get_medications_summary(all_medications)
        
        return jsonify({
            'success': True,
            'summary': summary,
            'total_medications': len(all_medications)
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting medications summary: {e}")
        return jsonify({'error': str(e)}), 500
