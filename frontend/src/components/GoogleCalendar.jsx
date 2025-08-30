import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import googleCalendarOAuthService from '../services/googleCalendarOAuthService';

const GoogleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  // Get calendar days for the current month
  const getCalendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return isSameDay(eventDate, day);
    });
  };

  // Authenticate with Google Calendar
  const authenticate = async () => {
    try {
      setAuthenticating(true);
      setError(null);
      
      const result = await googleCalendarOAuthService.authenticate();
      
      if (result.success) {
        setAuthenticated(true);
        await loadEvents();
      } else {
        setError(`Authentication failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(`Authentication error: ${err.message}`);
    } finally {
      setAuthenticating(false);
    }
  };

  // Logout
  const logout = () => {
    googleCalendarOAuthService.clearToken();
    setAuthenticated(false);
    setEvents([]);
    setError(null);
  };

  // Load events for the current month
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startOfMonthDate = startOfMonth(currentDate);
      const endOfMonthDate = endOfMonth(currentDate);
      
      console.log('Fetching events for:', startOfMonthDate, 'to', endOfMonthDate);
      
      const monthEvents = await googleCalendarOAuthService.getEvents(startOfMonthDate, endOfMonthDate);
      console.log('Events loaded:', monthEvents.length);
      setEvents(monthEvents);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(`Failed to load calendar events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check authentication status on mount
  useEffect(() => {
    const isAuth = googleCalendarOAuthService.isAuthenticated();
    setAuthenticated(isAuth);
    if (isAuth) {
      loadEvents();
    } else {
      setLoading(false);
    }
  }, []);

  // Load events when current date changes (only if authenticated)
  useEffect(() => {
    if (authenticated) {
      loadEvents();
    }
  }, [currentDate, authenticated]);

  const calendarDays = getCalendarDays();

  if (error) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-red-600">Calendar Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {error.includes('Popup was blocked') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">How to fix popup blocking:</h4>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Click the popup blocker icon in your browser's address bar</li>
                <li>Select "Allow popups for localhost:5175"</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
          )}
          
          {!authenticated && (
            <Button onClick={authenticate} disabled={authenticating} className="w-full">
              {authenticating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!authenticated) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Connect Your Google Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            To view your personal Google Calendar events, you need to authenticate with Google.
          </p>
          <Button 
            onClick={authenticate} 
            disabled={authenticating} 
            className="w-auto bg-primary-600 hover:bg-primary-700 text-black font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {authenticating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google Calendar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="ml-4"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border border-gray-200 ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'text-white bg-primary-500 rounded-full w-6 h-6 flex items-center justify-center'
                          : isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-primary-600 font-medium">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate"
                        title={event.summary}
                      >
                        {event.summary}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Event Button */}
        <div className="mt-4 flex justify-center">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendar;
