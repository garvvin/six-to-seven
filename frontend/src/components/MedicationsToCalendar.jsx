import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, Pill, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import googleCalendarOAuthService from '../services/googleCalendarOAuthService';

const MedicationsToCalendar = () => {
  const [medications, setMedications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [calendarResult, setCalendarResult] = useState(null);
  const [error, setError] = useState(null);
  const [medicationsAdded, setMedicationsAdded] = useState(false);

  // Check if medications were previously added (stored in localStorage)
  useEffect(() => {
    const added = localStorage.getItem('medicationsAddedToCalendar');
    if (added === 'true') {
      setMedicationsAdded(true);
    }
  }, []);

  // Fetch medications from backend
  const fetchMedications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
      const response = await fetch(`${API_BASE_URL}/api/medications/extract`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMedications(result.medications);
        setSummary(result.summary);
        console.log('Medications extracted:', result.medications);
      } else {
        throw new Error(result.error || 'Failed to extract medications');
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add medications to Google Calendar
  const addToCalendar = async () => {
    if (!medications.length) {
      setError('No medications to add to calendar');
      return;
    }

    // Prevent adding if already added
    if (medicationsAdded) {
      return;
    }

    setIsAddingToCalendar(true);
    setError(null);
    setCalendarResult(null);

    try {
      // First, authenticate with Google Calendar
      console.log('Starting Google Calendar authentication...');
      const authResult = await googleCalendarOAuthService.authenticate();
      
      if (!authResult.success) {
        console.error('Authentication failed:', authResult.error);
        if (authResult.error.includes('cancelled')) {
          throw new Error('Authentication was cancelled. Please complete the Google sign-in process in the popup window.');
        }
        throw new Error(authResult.error || 'Failed to authenticate with Google Calendar');
      }
      
      console.log('Google Calendar authentication successful');

      // Get calendar events data from backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
      const response = await fetch(`${API_BASE_URL}/api/medications/calendar-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: new Date().toISOString().split('T')[0], // Today
          duration_days: 7 // 7 days of events
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create calendar events');
      }

      // Add events to Google Calendar
      const calendarResult = await googleCalendarOAuthService.createMultipleEvents(result.events);
      
      setCalendarResult(calendarResult);
      console.log('Calendar events created:', calendarResult);
      
      // Mark medications as added and store in localStorage
      setMedicationsAdded(true);
      localStorage.setItem('medicationsAddedToCalendar', 'true');
      
    } catch (error) {
      console.error('Error adding to calendar:', error);
      setError(error.message);
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  // Reset medications added status (for testing or if user wants to re-add)
  const resetMedicationsStatus = () => {
    setMedicationsAdded(false);
    setCalendarResult(null);
    localStorage.removeItem('medicationsAddedToCalendar');
  };

  // Load medications on component mount
  useEffect(() => {
    fetchMedications();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <span className="ml-3 text-gray-600">Loading medications...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-gray-800" />
          Medications to Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {calendarResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Successfully added {calendarResult.successfulEvents} out of {calendarResult.totalEvents} events to Google Calendar!
              </span>
            </div>
            {calendarResult.failedEvents > 0 && (
              <p className="text-sm text-green-700 mt-1">
                {calendarResult.failedEvents} events failed to add. Check console for details.
              </p>
            )}
          </div>
        )}

        {summary && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Medications Summary</h4>
            <p className="text-sm text-blue-800">{summary.summary}</p>
            <div className="mt-2 text-sm text-blue-700">
              <p>Active: {summary.total_active}</p>
              <p>Discontinued: {summary.total_discontinued}</p>
            </div>
          </div>
        )}

        {medications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Extracted Medications</h4>
            {medications.map((med, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{med.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      med.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {med.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{med.frequency}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Times: {med.times.join(', ')}</p>
                  <p>Notes: {med.notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={fetchMedications}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Pill className="h-4 w-4" />
            Refresh Medications
          </Button>
          
          {medicationsAdded ? (
            <Button
              onClick={resetMedicationsStatus}
              variant="outline"
              className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4" />
              Reset Status
            </Button>
          ) : (
            <Button
              onClick={addToCalendar}
              disabled={isAddingToCalendar || medications.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="h-4 w-4" />
              {isAddingToCalendar ? 'Adding to Calendar...' : 'Add to Google Calendar'}
            </Button>
          )}
        </div>

        {medicationsAdded && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">All medications have been added to your Google Calendar!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your medication schedule is now synced. You can reset this status if you need to re-add medications.
            </p>
          </div>
        )}

        {medications.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No medications found in OCR data.</p>
            <p className="text-sm">Upload a medical document to extract medications.</p>
          </div>
        )}

        {/* OAuth Instructions */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Google Calendar Setup</h4>
          <p className="text-sm text-yellow-800 mb-2">
            To add medications to your Google Calendar, you'll need to:
          </p>
          <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
            <li>Click "Add to Google Calendar" button</li>
            <li>Complete the Google sign-in process in the popup window</li>
            <li>Allow HealthSync to access your Google Calendar</li>
            <li>Your medications will be automatically added to your calendar</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationsToCalendar;
