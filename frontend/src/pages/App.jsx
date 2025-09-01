import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Heart,
  Sparkles,
  CheckCircle,
  RefreshCw,
  MessageCircle,
  X,
} from 'lucide-react';
import UploadMedicalFile from '../components/UploadMedicalFile';
import AIHealthInsights from '../components/AIHealthInsights';
import MedicationsToCalendar from '../components/MedicationsToCalendar';
import UpcomingDates from '../components/UpcomingDates';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResults, setAnalysisResults] = React.useState([]);
  const [analysisError, setAnalysisError] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const [storedResults, setStoredResults] = React.useState([]);
  const [isLoadingStored, setIsLoadingStored] = React.useState(false);

  // Fetch stored results when component mounts
  React.useEffect(() => {
    const fetchStoredResultsOnMount = async () => {
      setIsLoadingStored(true);
      try {
        // Get the API base URL from environment or use fallback
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

        const response = await fetch(`${API_BASE_URL}/api/upload/ocr-results`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setStoredResults(result.data);
          console.log(
            'Fetched stored results on mount from backend:',
            result.data
          );
        } else {
          console.error(
            'Failed to fetch stored results on mount:',
            result.error
          );
        }
      } catch (error) {
        console.error('Error fetching stored results on mount:', error);
      } finally {
        setIsLoadingStored(false);
      }
    };

    fetchStoredResultsOnMount();
  }, []);

  const fetchStoredResults = async () => {
    setIsLoadingStored(true);
    try {
      // Get the API base URL from environment or use fallback
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

      const response = await fetch(`${API_BASE_URL}/api/upload/ocr-results`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStoredResults(result.data);
        console.log('Fetched stored results from backend:', result.data);
      } else {
        console.error('Failed to fetch stored results:', result.error);
      }
    } catch (error) {
      console.error('Error fetching stored results:', error);
    } finally {
      setIsLoadingStored(false);
    }
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

            // OCR result is automatically stored in Supabase by the backend
            if (result.supabase_stored) {
              console.log(
                'OCR result stored in Supabase successfully by backend'
              );
              console.log('Supabase ID:', result.supabase_id);
            } else {
              console.log('OCR result processed but not stored in Supabase');
              if (result.supabase_error) {
                console.error('Supabase storage error:', result.supabase_error);
                // Show user-friendly error message
                setAnalysisError(
                  `OCR completed but storage failed: ${result.supabase_error}`
                );
              }
            }
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
                  HealthSync Assistant
                </h1>
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
                      accept=".pdf"
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

            {/* Stored Results from Backend Section */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gray-800" />
                    Stored OCR Results (Backend)
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStoredResults}
                    disabled={isLoadingStored}
                    className="border-gray-200 text-gray-800 hover:bg-gray-100"
                  >
                    {isLoadingStored ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {storedResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>
                      No stored results yet. Upload a PDF to see results here.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {storedResults.map((result, index) => (
                      <AccordionItem
                        key={result.id || index}
                        value={`item-${result.id || index}`}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium text-gray-900">
                              OCR Result #{result.id}
                            </span>
                            {result.email && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {result.email}
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="space-y-3">
                              {/* Document Type */}
                              {result.info?.doc_type && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Document Type:
                                  </span>
                                  <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                                    {result.info.doc_type}
                                  </span>
                                </div>
                              )}

                              {/* Chief Complaint */}
                              {result.info?.chief_complaint && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Chief Complaint:
                                  </span>
                                  <span className="text-sm text-gray-600 bg-red-50 px-2 py-1 rounded">
                                    {result.info.chief_complaint}
                                  </span>
                                </div>
                              )}

                              {/* Diagnosis */}
                              {result.info?.impression_or_diagnosis && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Diagnosis:
                                  </span>
                                  <span className="text-sm text-gray-600 bg-green-50 px-2 py-1 rounded">
                                    {result.info.impression_or_diagnosis}
                                  </span>
                                </div>
                              )}

                              {/* Symptoms */}
                              {result.info?.hpi?.symptoms_checked &&
                                result.info.hpi.symptoms_checked.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Symptoms:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {result.info.hpi.symptoms_checked.map(
                                        (symptom, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded"
                                          >
                                            {symptom}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Vitals */}
                              {result.info?.vitals && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Blood Pressure:
                                    </span>
                                    <span className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                                      {result.info.vitals.blood_pressure ||
                                        'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Pulse Rate:
                                    </span>
                                    <span className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                                      {result.info.vitals.pulse_rate || 'N/A'}{' '}
                                      bpm
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Temperature:
                                    </span>
                                    <span className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                                      {result.info.vitals.temperature?.value ||
                                        'N/A'}
                                      °F
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Respiratory Rate:
                                    </span>
                                    <span className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                                      {result.info.vitals.resp_rate || 'N/A'}{' '}
                                      /min
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Medications */}
                              {result.info?.medications && (
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Medications:
                                  </span>
                                  <div className="space-y-2">
                                    {result.info.medications.added_or_changed &&
                                      result.info.medications.added_or_changed
                                        .length > 0 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-green-600">
                                            Added/Changed:
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {result.info.medications.added_or_changed.map(
                                              (med, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded"
                                                >
                                                  {med}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {result.info.medications.deleted &&
                                      result.info.medications.deleted.length >
                                        0 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-red-600">
                                            Discontinued:
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {result.info.medications.deleted.map(
                                              (med, idx) => (
                                                <span
                                                  key={idx}
                                                  className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded"
                                                >
                                                  {med}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}

                              {/* Raw Data Toggle */}
                              <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                                  View Raw Data
                                </summary>
                                <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify(result.info, null, 2)}
                                  </pre>
                                </div>
                              </details>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Medications to Calendar Section */}
            <MedicationsToCalendar />

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

            {/* AI Health Insights Section */}
            {analysisResults.length > 0 && (
              <AIHealthInsights analysisResults={analysisResults} />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Dates Component */}
            <UpcomingDates />

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
                <button
                  onClick={() => navigate('/calendar')}
                  className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Calendar className="h-8 w-8 text-white" />
                </button>
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm"
                  onClick={() => navigate('/chat')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
