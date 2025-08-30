import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, Plus, Calendar, User, MessageCircle } from 'lucide-react';
import UploadMedicalFile from '../components/UploadMedicalFile';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  HealthSync AI
                </h1>
                <p className="text-sm text-gray-600">
                  Your AI-powered health companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Sync to Calendar
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Health Dashboard
          </h2>
          <p className="text-lg text-gray-600">
            AI-powered insights and smart scheduling for your health journey
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Section */}
          <div className="lg:col-span-2">
            <UploadMedicalFile />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Current Medications */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Current Medications</CardTitle>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>2 active</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Lisinopril</p>
                    <p className="text-sm text-gray-600">10mg • 08:00</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Metformin</p>
                    <p className="text-sm text-gray-600">500mg • 08:00</p>
                  </div>
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Vitamin D3</p>
                    <p className="text-sm text-gray-600">1000 IU • 08:00</p>
                  </div>
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Upcoming Appointments
                  </CardTitle>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>2 scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    Dr. Smith - Cardiology
                  </p>
                  <p className="text-sm text-gray-600">Tomorrow • 2:00 PM</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    Lab Work - Blood Test
                  </p>
                  <p className="text-sm text-gray-600">Friday • 9:00 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Support Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
