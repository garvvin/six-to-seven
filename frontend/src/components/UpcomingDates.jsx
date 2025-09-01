import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import {
  Calendar,
  Plus,
  Stethoscope,
  TrendingUp,
  Clock,
  MapPin,
  Pill,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link,
  Unlink,
} from 'lucide-react';
import googleCalendarOAuthService from '../services/googleCalendarOAuthService';

const UpcomingDates = () => {
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] =
    useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'

  // Check Google Calendar connection status
  const checkGoogleCalendarStatus = async () => {
    try {
      const isAuthenticated = googleCalendarOAuthService.isAuthenticated();
      setIsGoogleCalendarConnected(isAuthenticated);

      if (isAuthenticated) {
        setSyncStatus('connected');
      } else {
        setSyncStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setSyncStatus('error');
    }
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      setIsConnecting(true);
      setSyncStatus('connecting');

      const result = await googleCalendarOAuthService.authenticate();

      if (result.success) {
        setIsGoogleCalendarConnected(true);
        setSyncStatus('connected');
        // Refresh the upcoming dates after successful connection
        await fetchUpcomingDates();
      } else {
        setSyncStatus('error');
        setError(result.error || 'Failed to connect to Google Calendar');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setSyncStatus('error');
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Google Calendar
  const disconnectGoogleCalendar = () => {
    try {
      googleCalendarOAuthService.clearToken();
      setIsGoogleCalendarConnected(false);
      setSyncStatus('disconnected');
      // Refresh to show only medication data
      fetchUpcomingDates();
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
    }
  };

  // Fetch upcoming dates from backend
  const fetchUpcomingDates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

      // Prepare headers with Google Calendar access token if available
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isGoogleCalendarConnected) {
        const token = googleCalendarOAuthService.getStoredToken();
        if (token && token.access_token) {
          headers['Authorization'] = `Bearer ${token.access_token}`;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/api/calendar/upcoming-medical-dates?days_ahead=7&include_medications=true&include_appointments=true&include_reminders=true`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUpcomingDates(data.upcoming_dates || []);
        setTotalEvents(data.total_events || 0);

        // Update sync status based on backend response
        if (data.google_calendar_connected !== undefined) {
          setIsGoogleCalendarConnected(data.google_calendar_connected);
          setSyncStatus(
            data.google_calendar_connected ? 'connected' : 'disconnected'
          );
        }
      } else {
        throw new Error(data.error || 'Failed to fetch upcoming dates');
      }
    } catch (error) {
      console.error('Error fetching upcoming dates:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when connection status changes
  useEffect(() => {
    checkGoogleCalendarStatus();
  }, []);

  useEffect(() => {
    fetchUpcomingDates();
  }, [isGoogleCalendarConnected]);

  // Get appropriate icon for event type
  const getEventIcon = eventType => {
    switch (eventType) {
      case 'appointment':
        return <Stethoscope className="h-5 w-5 text-gray-800 mt-0.5" />;
      case 'medication':
        return <Pill className="h-5 w-5 text-gray-800 mt-0.5" />;
      case 'reminder':
        return <AlertCircle className="h-5 w-5 text-gray-800 mt-0.5" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-800 mt-0.5" />;
    }
  };

  // Format date for display
  const formatDate = (dateString, timeString) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${formattedDate} at ${timeString}`;
    } catch (error) {
      return `${dateString} at ${timeString}`;
    }
  };

  // Get status badge for event
  const getStatusBadge = event => {
    if (event.is_today) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Today
        </span>
      );
    } else if (event.is_tomorrow) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Tomorrow
        </span>
      );
    } else if (event.is_this_week) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          This Week
        </span>
      );
    }
    return null;
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUpcomingDates();
  };

  // Handle toggle expand
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-800" />
              Scheduled Dates
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-800 hover:bg-gray-100 shadow-sm"
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          </div>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">
              Loading upcoming dates...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-800" />
              Scheduled Dates
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-800 hover:bg-gray-100 shadow-sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Error loading dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to load upcoming dates</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine how many events to show
  const eventsToShow = upcomingDates;
  const hasMoreEvents = upcomingDates.length > 5;

  return (
    <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-800" />
            Scheduled Dates
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Google Calendar Connection Status */}
            <div className="flex items-center gap-2">
              {syncStatus === 'connected' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:bg-green-50 shadow-sm"
                  onClick={disconnectGoogleCalendar}
                  title="Disconnect Google Calendar"
                >
                  <Link className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-100 shadow-sm"
                  onClick={connectGoogleCalendar}
                  disabled={isConnecting}
                  title="Connect Google Calendar"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-800 hover:bg-gray-100 shadow-sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {totalEvents > 0 ? `${totalEvents} scheduled` : 'No upcoming dates'}
          {isGoogleCalendarConnected && (
            <span className="ml-2 text-green-600">
              • Google Calendar Connected
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No upcoming medical dates</p>
            <p className="text-xs text-gray-400 mt-1">
              {isGoogleCalendarConnected
                ? 'No medical events found in your calendar'
                : 'Connect Google Calendar or upload medical documents to see upcoming events'}
            </p>
            {!isGoogleCalendarConnected && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={connectGoogleCalendar}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div
              className={`space-y-3 ${
                isExpanded
                  ? 'max-h-96 overflow-y-auto pr-2'
                  : 'max-h-64 overflow-hidden'
              }`}
            >
              {eventsToShow.map((event, index) => (
                <div
                  key={event.id || index}
                  className="p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {event.title}
                        </p>
                        {getStatusBadge(event)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.date, event.time)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      {event.duration_minutes && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {event.duration_minutes} minutes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreEvents && (
              <div className="text-center pt-2">
                {!isExpanded ? (
                  <>
                    <p className="text-xs text-gray-500 mb-2">
                      Showing 5 of {totalEvents} events
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
                      onClick={handleToggleExpand}
                    >
                      <ChevronDown className="h-3 w-3 mr-1" />
                      View All Events
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-2">
                      Showing all {totalEvents} events
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
                      onClick={handleToggleExpand}
                    >
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDates;
