import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Activity, Heart, Thermometer, Scale } from 'lucide-react';

const Dashboard = () => {
  const healthMetrics = [
    {
      icon: Heart,
      title: 'Heart Rate',
      value: '72',
      unit: 'BPM',
      status: 'normal',
      color: 'text-success-600'
    },
    {
      icon: Activity,
      title: 'Steps',
      value: '8,432',
      unit: 'steps',
      status: 'good',
      color: 'text-primary-600'
    },
    {
      icon: Thermometer,
      title: 'Temperature',
      value: '98.6',
      unit: '°F',
      status: 'normal',
      color: 'text-warning-600'
    },
    {
      icon: Scale,
      title: 'Weight',
      value: '165',
      unit: 'lbs',
      status: 'stable',
      color: 'text-gray-600'
    }
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-success-100 text-success-700';
      case 'good':
        return 'bg-primary-100 text-primary-700';
      case 'stable':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-warning-100 text-warning-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Dashboard</h1>
          <p className="text-gray-600">Monitor your health metrics and track your progress</p>
        </header>

        {/* Health Metrics Grid */}
        <section className="mb-8" aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">Health Metrics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-medium transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <metric.icon className={`h-8 w-8 ${metric.color}`} aria-hidden="true" />
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyles(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{metric.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {metric.value}
                    <span className="text-lg font-normal text-gray-500 ml-1">{metric.unit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Placeholder for future app content */}
        <section aria-labelledby="coming-soon-heading">
          <Card>
            <CardHeader>
              <CardTitle id="coming-soon-heading">Coming Soon</CardTitle>
              <CardDescription>
                This is where the main health tracking application will be implemented. 
                You'll be able to add more detailed features here later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The app page will contain the core functionality for health tracking, 
                data visualization, and user interactions. This is just a placeholder 
                for now as requested.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
