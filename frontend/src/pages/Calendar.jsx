import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import GoogleCalendar from '../components/GoogleCalendar';

const Calendar = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="text-center mb-16" aria-labelledby="calendar-header">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 rounded-full">
              <CalendarIcon className="h-12 w-12 text-primary-600" aria-hidden="true" />
            </div>
          </div>
          <h1 id="calendar-header" className="text-3xl font-bold text-gray-900 mb-4">Calendar</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your Google Calendar to view and manage your health appointments, medication schedules, and wellness activities.
          </p>
        </section>

        {/* Main Content */}
        <section className="mb-16" aria-labelledby="calendar-content">
          <h2 id="calendar-content" className="sr-only">Calendar Content</h2>
          <div className="grid md:grid-cols-1 gap-6">
            <GoogleCalendar />
          </div>
        </section>

        {/* Call to Action */}
        <section aria-labelledby="cta-heading">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
            <CardHeader className="text-center">
              <CardTitle id="cta-heading" className="text-3xl text-white">Stay Organized</CardTitle>
              <CardDescription className="text-primary-100 text-lg">
                Keep track of your health journey with our comprehensive calendar system
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-primary-100 mb-4">
                Calendar features will be implemented to help you manage your health schedule effectively.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Calendar;
