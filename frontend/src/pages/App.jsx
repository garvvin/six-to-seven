import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Activity, Heart, Thermometer, Scale } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your health metrics and track your progress
          </p>
        </header>

        {/* Welcome Section */}
        <section className="mb-8" aria-labelledby="welcome-heading">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary-100 rounded-full">
                  <Heart
                    className="h-12 w-12 text-primary-600"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <CardTitle id="welcome-heading" className="text-2xl">
                Welcome to HealthSync
              </CardTitle>
              <CardDescription className="text-lg">
                Your personal health tracking dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This is where you'll be able to view and manage your health data
                once connected to your devices or manual entry is implemented.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Activity
                    className="h-8 w-8 text-primary-600 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-gray-700">Activity</p>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Heart
                    className="h-8 w-8 text-primary-600 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    Heart Rate
                  </p>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Thermometer
                    className="h-8 w-8 text-primary-600 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    Temperature
                  </p>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Scale
                    className="h-8 w-8 text-primary-600 mx-auto mb-2"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-gray-700">Weight</p>
                  <p className="text-xs text-gray-500">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Development Roadmap */}
        <section aria-labelledby="roadmap-heading">
          <Card>
            <CardHeader>
              <CardTitle id="roadmap-heading">Development Roadmap</CardTitle>
              <CardDescription>
                Here's what we're planning to implement next
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Manual Data Entry
                    </p>
                    <p className="text-sm text-gray-600">
                      Allow users to manually input health metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Data Visualization
                    </p>
                    <p className="text-sm text-gray-600">
                      Charts and graphs to track progress over time
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Goal Setting</p>
                    <p className="text-sm text-gray-600">
                      Set and track health goals and milestones
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Reminders & Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Stay on track with health monitoring
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
