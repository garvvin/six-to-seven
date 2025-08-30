import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Upload,
  Plus,
  Calendar,
  User,
  MessageCircle,
  MessageSquare,
  Heart,
  Sparkles,
  CheckCircle,
  Stethoscope,
  TrendingUp,
  MapPin,
  Clock,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';
import UploadMedicalFile from '../components/UploadMedicalFile';

const Dashboard = () => {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setMessage(''); // Clear message when closing chat
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    // In a real application, you would send the message to an AI backend
    // For now, we'll just add it to the chat history
    // setChatHistory([...chatHistory, { sender: 'user', message: message }]);
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="h-6 w-6 text-white" />
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
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Input and AI Analysis Section */}
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX, TXT (Max 10MB
                    each)
                  </p>
                  <p className="text-sm text-gray-600">
                    Or paste document text directly
                  </p>
                </div>

                <div className="mb-4">
                  <textarea
                    placeholder="Paste your prescription, lab results, or doctor notes here..."
                    className="w-full p-4 border border-blue-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    rows={6}
                  />
                </div>

                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with AI
                </Button>
              </CardContent>
            </Card>

            {/* AI Health Recommendations Section */}
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  AI Health Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Blood Test Results */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Blood Test Results - March 2024
                    </h4>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                      Lab Results
                    </span>
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Cholesterol levels improved by 15mg/dL
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        Vitamin D levels within normal range
                        <TrendingUp className="h-3 w-3 text-blue-400" />
                      </li>
                    </ul>
                  </div>
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>

                {/* Prescription */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Prescription - Dr. Smith
                    </h4>
                  </div>
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Health Insights Section */}
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Health Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                        <Heart className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Heart Health
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your heart rate variability has improved by 12% this month
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Activity Level
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You've met your weekly exercise goal 3 weeks in a row
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Upcoming Appointments
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:bg-blue-50 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>2 scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-md">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Dr. Smith - Cardiology
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="h-3 w-3" />
                        2/14/2024 at 10:00
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        Heart Center, Room 205
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-md">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Blood Work</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="h-3 w-3" />
                        2/19/2024 at 09:00
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        Lab Services, 1st Floor
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Calendar Integration */}
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Smart Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Sync your medications, appointments, and health reminders
                  directly to Google Calendar
                </p>
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Smart Calendar Integration
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Support Button */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-xl flex items-center justify-center transition-colors"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl border border-blue-100">
          {/* Chat Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">HealthSync AI Assistant</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-64 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {/* Welcome Message */}
              <div className="flex justify-start">
                <div className="bg-blue-100 text-blue-900 rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-sm">Hello! I'm your AI health assistant. How can I help you today?</p>
                </div>
              </div>
              
              {/* Example User Message */}
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-sm">Can you explain my blood test results?</p>
                </div>
              </div>
              
              {/* Example AI Response */}
              <div className="flex justify-start">
                <div className="bg-blue-100 text-blue-900 rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-sm">I'd be happy to help! Please share your blood test results and I'll provide insights.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
