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
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResults, setAnalysisResults] = React.useState([]);
  const [analysisError, setAnalysisError] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setMessage(''); // Clear message when closing chat
  };

  const handleKeyPress = event => {
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

  const handleAnalyzeWithAI = async () => {
    if (isAnalyzing) return; // Prevent multiple clicks during cooldown

    setIsAnalyzing(true);
    console.log('Analyzing with AI...');

    try {
      // Check if there are selected files
      if (selectedFiles.length === 0) {
        console.log('No files selected for analysis');
        setIsAnalyzing(false);
        return;
      }

      // Get the API base URL from environment or use fallback
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

      // Process each selected file
      for (const fileData of selectedFiles) {
        // Only process PDF files as per backend requirements
        if (fileData.type.includes('pdf')) {
          console.log(`Processing PDF file: ${fileData.name}`);

          // Create FormData to send the file
          const formData = new FormData();
          formData.append('file', fileData.file);

          // Send POST request to backend
          const response = await fetch(
            `${API_BASE_URL}/api/upload/upload-pdf`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log('Backend OCR result:', result);

          // Here you can handle the OCR results
          // For example, display them in the UI or store them in state
          if (result.success) {
            console.log('PDF processed successfully:', result.data);
            // Store the OCR results in state
            setAnalysisResults(prev => [
              ...prev,
              {
                fileName: fileData.name,
                data: result.data,
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            console.error('PDF processing failed:', result.error);
            setAnalysisError(
              `Failed to process ${fileData.name}: ${result.error}`
            );
          }
        } else {
          console.log(
            `Skipping non-PDF file: ${fileData.name} (type: ${fileData.type})`
          );
        }
      }

      console.log('AI analysis completed successfully');
    } catch (error) {
      console.error('Error during AI analysis:', error);
      setAnalysisError(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = event => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Clear previous analysis results when new files are selected
    if (files.length > 0) {
      setAnalysisResults([]);
      setAnalysisError(null);
    }
  };

  const removeFile = fileId => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setAnalysisResults([]);
    setAnalysisError(null);
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = fileType => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text') || fileType.includes('doc')) return '📝';
    return '📁';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
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
                className="border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync to Calendar
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
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>AI Analysis:</strong> PDF files only (Max 10MB each)
                  </p>
                  <p className="text-sm text-gray-600">
                    Other formats: JPG, PNG, DOC, DOCX, TXT (Max 10MB each)
                  </p>
                  <p className="text-sm text-gray-600">
                    Or paste document text directly
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                    <Upload className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Drop your medical documents here
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      or click to browse files
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-800 hover:bg-gray-100"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Selected Files:
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={clearAllFiles}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedFiles.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {getFileIcon(file.type)}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <textarea
                    placeholder="Paste your prescription, lab results, or doctor notes here..."
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-600 focus:border-transparent shadow-sm"
                    rows={6}
                  />
                </div>

                <Button
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAnalyzeWithAI}
                  disabled={
                    isAnalyzing ||
                    selectedFiles.filter(f => f.type.includes('pdf')).length ===
                      0
                  }
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing PDFs...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze with AI (PDF files only)
                    </>
                  )}
                </Button>

                {selectedFiles.length > 0 &&
                  selectedFiles.filter(f => f.type.includes('pdf')).length ===
                    0 && (
                    <p className="text-sm text-amber-600 mt-2 text-center">
                      No PDF files selected. AI analysis requires PDF documents.
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* AI Health Recommendations Section */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gray-800" />
                  AI Health Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Blood Test Results */}
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Blood Test Results - March 2024
                    </h4>
                    <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full mt-1">
                      Lab Results
                    </span>
                    <ul className="mt-2 space-y-1">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-gray-800" />
                        Cholesterol levels improved by 15mg/dL
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-gray-800" />
                        Vitamin D levels within normal range
                        <TrendingUp className="h-3 w-3 text-gray-600" />
                      </li>
                    </ul>
                  </div>
                  <CheckCircle className="h-6 w-6 text-gray-800" />
                </div>

                {/* Prescription */}
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Prescription - Dr. Smith
                    </h4>
                  </div>
                  <CheckCircle className="h-6 w-6 text-gray-800" />
                </div>
              </CardContent>
            </Card>

            {/* PDF Analysis Results Section */}
            {analysisResults.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gray-800" />
                    PDF Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {result.fileName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Analysis Error Display */}
            {analysisError && (
              <Card className="bg-red-50 border-red-200 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <X className="h-5 w-5" />
                    <span className="font-medium">Analysis Error</span>
                  </div>
                  <p className="text-red-700 mt-2">{analysisError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => setAnalysisError(null)}
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Health Insights Section */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-800" />
                  Health Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                        <Heart className="h-4 w-4 text-gray-800" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Heart Health
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your heart rate variability has improved by 12% this month
                    </p>
                  </div>

                  <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
                        <TrendingUp className="h-4 w-4 text-gray-800" />
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
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-800" />
                    Upcoming Appointments
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-800 hover:bg-gray-100 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>2 scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-md">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="h-5 w-5 text-gray-800 mt-0.5" />
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

                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 shadow-md">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-gray-800 mt-0.5" />
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
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-black" />
                  Smart Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Sync your medications, appointments, and health reminders
                  directly to Google Calendar
                </p>
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Smart Calendar Integration
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gray-800" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
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
          className="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-900 shadow-xl flex items-center justify-center transition-colors"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200">
          {/* Chat Header */}
          <div className="bg-gray-800 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">HealthSync AI Assistant</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-64 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {/* Welcome Message */}
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-sm">
                    Hello! I'm your AI health assistant. How can I help you
                    today?
                  </p>
                </div>
              </div>

              {/* Example User Message */}
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-sm">
                    Can you explain my blood test results?
                  </p>
                </div>
              </div>

              {/* Example AI Response */}
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-sm">
                    I'd be happy to help! Please share your blood test results
                    and I'll provide insights.
                  </p>
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
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
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
