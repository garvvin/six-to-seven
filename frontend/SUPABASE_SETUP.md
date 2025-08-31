# Backend Supabase Integration Setup Guide

This guide will help you set up Supabase integration for storing OCR results from PDF analysis. The application now uses the **backend** to handle all Supabase operations, providing better security and centralized data management.

## Prerequisites

1. A Supabase account and project
2. The `information` table created in your Supabase database with the following structure:
   - `id` (int8, primary key)
   - `info` (jsonb)
   - `email` (text, nullable)

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Configure Backend Environment Variables

1. In your `backend` directory, create a `.env` file
2. Add the following variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=development
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

## Step 3: Configure Frontend Environment Variables

1. In your `frontend` directory, create a `.env` file
2. Add only the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5005
```

**Note:** The frontend no longer needs direct Supabase credentials since all operations go through the backend.

## Step 4: Create the Database Table

If you haven't already created the `information` table, you can create it using the Supabase SQL Editor:

```sql
CREATE TABLE information (
  id BIGSERIAL PRIMARY KEY,
  info JSONB NOT NULL,
  email TEXT
);

-- Optional: Add RLS (Row Level Security) policies if needed
-- ALTER TABLE information ENABLE ROW LEVEL SECURITY;
```

## Step 5: Test the Integration

1. Start your backend server: `python run.py` (from the backend directory)
2. Start your frontend application: `npm run dev` (from the frontend directory)
3. Upload a PDF file for analysis
4. The OCR results will automatically be stored in your Supabase `information` table via the backend
5. You can view stored results by clicking the "Refresh" button in the "Stored OCR Results (Backend)" section

## How It Works

1. **File Upload**: When a PDF is uploaded and analyzed:
   - The frontend sends the file to the backend
   - The backend processes the PDF with OCR
   - The backend automatically stores the OCR results in Supabase
   - The backend returns the results to the frontend

2. **Data Storage**: The `result.data` from the OCR analysis is stored in the `info` column as JSONB
3. **Data Retrieval**: Stored results are fetched through the backend API endpoints

## Backend API Endpoints

The backend now provides these endpoints for OCR data management:

- `POST /api/upload/upload-pdf` - Upload and process PDF, automatically stores in Supabase
- `GET /api/upload/ocr-results` - Retrieve stored OCR results
- `DELETE /api/upload/ocr-results/<id>` - Delete a specific OCR result

## Frontend Integration

The frontend now:
- Sends files to the backend for processing
- Receives processed results from the backend
- Fetches stored results through backend API calls
- No longer has direct Supabase access (improved security)

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error in backend**
   - Ensure your backend `.env` file exists and contains the correct variables
   - Restart your backend server after creating the `.env` file

2. **"Error storing OCR result in Supabase" error**
   - Check that your backend Supabase credentials are correct
   - Verify the `information` table exists and has the correct structure
   - Check your backend server logs for detailed error messages

3. **Frontend can't fetch stored results**
   - Ensure your backend server is running
   - Check that the `VITE_API_BASE_URL` is correctly set
   - Verify the backend API endpoints are working

4. **CORS errors**
   - The backend is configured with CORS support for common frontend ports
   - Check that your frontend is running on a supported port (5175 or 3000)

### Debug Mode

To enable debug logging:
- Check your backend server console for detailed information about:
  - Supabase connection status
  - Data storage operations
  - Error messages
- Check your frontend browser console for API call information

## Security Considerations

- **Improved Security**: Frontend no longer has direct access to Supabase credentials
- **Centralized Control**: All database operations go through the backend
- **Environment Variables**: Sensitive credentials are stored securely in the backend
- **API Endpoints**: Backend provides controlled access to data operations

## API Reference

The backend Supabase service provides these functions:

- `store_ocr_result(data, email?)` - Store OCR results in the database
- `get_ocr_results(email?, limit?)` - Retrieve results with optional filtering
- `delete_ocr_result(id)` - Delete a specific result

## Support

If you encounter issues:
1. Check the backend server console for error messages
2. Verify your backend environment variables are correctly set
3. Ensure your Supabase table structure matches the requirements
4. Check that both frontend and backend are running and communicating
