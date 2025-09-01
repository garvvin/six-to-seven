import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar as CalendarIcon, Trash2, AlertTriangle } from 'lucide-react';
import GoogleCalendar from '../components/GoogleCalendar';
import { useState } from 'react';
import googleCalendarOAuthService from '../services/googleCalendarOAuthService';
import calendarClearService from '../services/calendarClearService';

const Calendar = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState(null);

  const handleClearNextWeek = async () => {
    // Check if user is authenticated with Google Calendar
    if (!googleCalendarOAuthService.isAuthenticated()) {
      setClearResult({
        success: false,
        error: 'Please connect to Google Calendar first to clear events.',
      });
      return;
    }

    // Confirm action with user
    if (
      !confirm(
        'Are you sure you want to clear all medical events for next week? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsClearing(true);
      setClearResult(null);

      const token = googleCalendarOAuthService.getStoredToken();
      if (!token || !token.access_token) {
        throw new Error(
          'No valid access token found. Please reconnect to Google Calendar.'
        );
      }

      const result = await calendarClearService.clearNextWeekMedicalDates(
        token.access_token
      );

      if (result.success) {
        setClearResult({
          success: true,
          message: result.data.message,
          eventsCleared: result.data.events_cleared,
        });
      } else {
        setClearResult({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error('Error clearing next week medical dates:', error);
      setClearResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleDebugEvents = async () => {
    // Check if user is authenticated with Google Calendar
    if (!googleCalendarOAuthService.isAuthenticated()) {
      setDebugResult({
        success: false,
        error: 'Please connect to Google Calendar first to debug events.',
      });
      return;
    }

    try {
      setIsDebugging(true);
      setDebugResult(null);

      const token = googleCalendarOAuthService.getStoredToken();
      if (!token || !token.access_token) {
        throw new Error(
          'No valid access token found. Please reconnect to Google Calendar.'
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'}/api/calendar/debug-next-week-events`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setDebugResult({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error('Error debugging events:', error);
      setDebugResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section
          className="text-center mb-16"
          aria-labelledby="calendar-header"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 rounded-full">
              <CalendarIcon
                className="h-12 w-12 text-primary-600"
                aria-hidden="true"
              />
            </div>
          </div>
          <h1
            id="calendar-header"
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Calendar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your Google Calendar to view and manage your health
            appointments, medication schedules, and wellness activities.
          </p>
        </section>

        {/* Clear Next Week Button */}
        <section className="mb-8" aria-labelledby="clear-next-week">
          <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Clear Next Week's Medical Dates
              </CardTitle>
              <CardDescription>
                Remove all medical events scheduled for the next 7 days from
                your Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleClearNextWeek}
                  disabled={isClearing}
                  className="shadow-sm border-red-500 text-red-500"
                >
                  {isClearing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2 text-red-500"></div>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                      Clear Next Week's Medical Dates
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDebugEvents}
                  disabled={isDebugging}
                  className="shadow-sm border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  {isDebugging ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Debugging...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Debug Events
                    </>
                  )}
                </Button>
                <p className="text-sm text-red-500">
                  This will permanently delete all medical events for the next 7
                  days
                </p>
              </div>

              {/* Result Display */}
              {clearResult && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    clearResult.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {clearResult.success ? (
                      <>
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Success!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Error</span>
                      </>
                    )}
                  </div>
                  <p className="mt-2">
                    {clearResult.success
                      ? clearResult.message
                      : clearResult.error}
                  </p>
                  {clearResult.success && clearResult.eventsCleared > 0 && (
                    <p className="text-sm mt-1">
                      {clearResult.eventsCleared} event(s) were cleared from
                      your calendar.
                    </p>
                  )}
                </div>
              )}

              {/* Debug Result Display */}
              {debugResult && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    debugResult.success
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {debugResult.success ? (
                      <>
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Debug Results</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Debug Error</span>
                      </>
                    )}
                  </div>
                  {debugResult.success ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        <strong>Date Range:</strong>{' '}
                        {debugResult.data.date_range.start} to{' '}
                        {debugResult.data.date_range.end}
                      </p>
                      <p className="text-sm">
                        <strong>Total Events:</strong>{' '}
                        {debugResult.data.total_events}
                      </p>
                      <p className="text-sm">
                        <strong>Medical Events:</strong>{' '}
                        {debugResult.data.medical_count}
                      </p>
                      <p className="text-sm">
                        <strong>Non-Medical Events:</strong>{' '}
                        {debugResult.data.non_medical_count}
                      </p>

                      {debugResult.data.medical_events.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">
                            Medical Events Found:
                          </p>
                          <div className="space-y-1">
                            {debugResult.data.medical_events.map(
                              (event, index) => (
                                <div
                                  key={index}
                                  className="text-xs bg-blue-100 p-2 rounded"
                                >
                                  <strong>{event.summary}</strong> -{' '}
                                  {event.start?.dateTime || event.start?.date}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {debugResult.data.non_medical_events.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">
                            Non-Medical Events (for reference):
                          </p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {debugResult.data.non_medical_events.map(
                              (event, index) => (
                                <div
                                  key={index}
                                  className="text-xs bg-gray-100 p-2 rounded"
                                >
                                  <strong>{event.summary}</strong> -{' '}
                                  {event.start?.dateTime || event.start?.date}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2">{debugResult.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Main Content */}
        <section className="mb-16" aria-labelledby="calendar-content">
          <h2 id="calendar-content" className="sr-only">
            Calendar Content
          </h2>
          <div className="grid md:grid-cols-1 gap-6">
            <GoogleCalendar />
          </div>
        </section>

        {/* Call to Action */}
        <section aria-labelledby="cta-heading">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle id="cta-heading" className="text-3xl text-white">
                Stay Organized
              </CardTitle>
              <CardDescription className="text-primary-100 text-lg">
                Keep track of your health journey with our comprehensive
                calendar system
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-100 mb-4">
                Calendar features will be implemented to help you manage your
                health schedule effectively.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Calendar;
