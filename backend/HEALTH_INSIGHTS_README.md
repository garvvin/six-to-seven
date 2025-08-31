# Health Insights Route

This route provides AI-powered health insights by analyzing parsed medical document data using OpenAI's GPT-3.5-turbo model.

## Endpoint

**POST** `/api/health-insights/get-health-insights`

## Description

The route takes parsed medical document data and generates clinical insights that would be valuable for healthcare providers or patients. Each insight includes a title and description explaining the clinical significance or actionable information.

## Request Body

The request body should contain the parsed document data in JSON format. Example structure:

```json
{
  "allergies": {
    "new_allergies": "N/A",
    "unchanged_from_summary": true
  },
  "chief_complaint": "Difficulty breathing",
  "clinical_staff": {
    "printed_name": null,
    "signature_present": true
  },
  "date_of_service": {
    "raw": "[redacted]",
    "value": null
  },
  "doc_type": "EMR Downtime Office Visit Form",
  "hpi": {
    "free_text": null,
    "symptoms_checked": ["Wheezing", "Cough", "Chest tightness"]
  },
  "impression_or_diagnosis": "Upper respiratory infection",
  "location_of_care": "Kaiser ABQ",
  "medications": {
    "added_or_changed": ["Albuterol"],
    "deleted": ["Lisinopril"],
    "unchanged_from_summary": true
  },
  "patient_name": {
    "raw": "Shortness of breath",
    "value": null
  },
  "review_of_systems": {
    "chest": "unremarkable",
    "ent": "unremarkable",
    "eyes": "unremarkable",
    "general": "unremarkable",
    "head": "unremarkable",
    "neck": "unremarkable"
  },
  "source_quality_notes": "Parsed using simple OCR. Raw text length: 769 characters.",
  "visit_type": "Consuitation",
  "vitals": {
    "blood_pressure": "135/85",
    "pulse_rate": 96,
    "resp_rate": 18,
    "temperature": {
      "method": null,
      "raw": "Temp/ Method 98.6  OI",
      "unit": null,
      "value": 98.6
    }
  }
}
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Health insights generated successfully",
  "data": {
    "insights": [
      {
        "title": "Respiratory Symptoms Cluster",
        "description": "Patient presents with wheezing, cough, and chest tightness, indicating potential bronchospasm or airway inflammation requiring immediate attention."
      },
      {
        "title": "Medication Change Alert",
        "description": "Albuterol added for respiratory symptoms, while Lisinopril was discontinued. Monitor for blood pressure changes and respiratory improvement."
      },
      {
        "title": "Vital Signs Assessment",
        "description": "Blood pressure 135/85 is elevated, pulse rate 96 is slightly elevated, and respiratory rate 18 is normal. Consider monitoring for cardiovascular stress."
      }
    ]
  }
}
```

### Error Responses

#### 400 - Bad Request

```json
{
  "error": "No data provided"
}
```

#### 500 - Internal Server Error

```json
{
  "error": "OpenAI API authentication failed. Please check your API key."
}
```

## Environment Variables Required

Add the following to your `.env` file:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

## Features

- **AI-Powered Analysis**: Uses OpenAI's GPT-3.5-turbo for intelligent medical document analysis
- **Clinical Focus**: Generates insights focused on clinical findings, medication changes, vital signs, and follow-up recommendations
- **Structured Output**: Returns insights in a consistent format with titles and descriptions
- **Error Handling**: Comprehensive error handling for API failures, rate limits, and authentication issues
- **Health Check**: Includes a health check endpoint at `/api/health-insights/health`

## Testing

Use the provided test script to verify the route works correctly:

```bash
python test_health_insights.py
```

Make sure the backend server is running first with:

```bash
python run.py
```

## Dependencies

- `openai==1.3.0` - OpenAI API client
- `flask` - Web framework
- `python-dotenv` - Environment variable management

## Security Notes

- The OpenAI API key should be kept secure and never exposed in client-side code
- All requests should be made through the backend to maintain security
- Consider implementing rate limiting and authentication for production use
