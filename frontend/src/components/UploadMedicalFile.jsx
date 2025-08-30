import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Plus, X, Eye, CheckCircle, Send } from 'lucide-react';

const UploadMedicalFile = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' // pending = not uploaded yet
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (ocrResults) setOcrResults(null);
    if (error) setError(null);
  };

  const uploadFile = async (fileObj) => {
    console.log('Starting upload for file:', fileObj.name);
    console.log('File type:', fileObj.type);
    
    // Check if it's a PDF by MIME type or file extension
    const isPDF = fileObj.type === 'application/pdf' || 
                  fileObj.name.toLowerCase().endsWith('.pdf') ||
                  fileObj.type === 'application/octet-stream' && fileObj.name.toLowerCase().endsWith('.pdf');
    
    if (!isPDF) {
      console.log('File type mismatch. Expected: PDF, Got:', fileObj.type);
      setError('Only PDF files are supported for OCR processing');
      return;
    }

    setUploading(true);
    setError(null);
    setOcrResults(null);

    // Update file status to uploading
    setFiles(prev => 
      prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, status: 'uploading' }
          : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      
      console.log('Sending request to backend...');
      console.log('FormData entries:', Array.from(formData.entries()));

      const response = await fetch('http://localhost:5000/api/upload/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Upload failed';
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Backend result:', result);
      
      // Update file status to uploaded
      setFiles(prev => 
        prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'uploaded' }
            : f
        )
      );

      // Set OCR results
      setOcrResults(result.data);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setFiles(prev => 
        prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, status: 'error' }
            : f
        )
      );
    } finally {
      setUploading(false);
    }
  };

  const uploadAllFiles = async () => {
    console.log('Uploading all pending files...');
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      setError('No files to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setOcrResults(null);

    try {
      // Upload files one by one
      for (const file of pendingFiles) {
        await uploadFile(file);
      }
    } catch (err) {
      console.error('Batch upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const checkThroughDocuments = async () => {
    console.log('Checking through all uploaded documents...');
    
    // Find the first uploaded PDF file
    const uploadedFile = files.find(f => f.status === 'uploaded' && f.type === 'application/pdf');
    
    if (!uploadedFile) {
      setError('No uploaded PDF documents found to check through');
      return;
    }

    console.log('Processing document:', uploadedFile.name);
    await uploadFile(uploadedFile);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text') || fileType.includes('doc')) return '📝';
    return '📁';
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const textFile = {
        id: Date.now() + Math.random(),
        name: 'Pasted Text',
        size: textInput.length,
        type: 'text/plain',
        status: 'uploaded',
        content: textInput
      };
      setFiles(prev => [...prev, textFile]);
      setTextInput('');
      setShowTextInput(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Upload Medical Documents
        </CardTitle>
        <CardDescription>
          Drag & drop your prescriptions, lab results, or doctor notes for instant AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your medical documents here
          </p>
          <p className="text-gray-500 mb-4">
            or{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={() => fileInputRef.current?.click()}
            >
              click to browse files
            </button>
            {' '}(PDF only for OCR)
          </p>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
          
          <p className="text-sm text-gray-500">
            PDF files only for OCR processing (Max 10MB each)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload All Files Button */}
        {files.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Upload selected files</p>
              <Button
                onClick={uploadAllFiles}
                disabled={uploading || !files.some(f => f.status === 'pending')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload All Files'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Click to upload all selected PDF files to the backend for OCR processing
            </p>
          </div>
        )}

e         {/* Check Through Documents Button */}
        {files.some(f => f.status === 'uploaded') && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Process uploaded documents</p>
              <Button
                onClick={checkThroughDocuments}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Through Documents
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              This will process the uploaded PDF and convert it to structured JSON format
            </p>
          </div>
        )}

        {/* Text Input Option */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Or paste document text directly</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTextInput(!showTextInput)}
            >
              {showTextInput ? 'Cancel' : 'Add Text'}
            </Button>
          </div>
          
          {showTextInput && (
            <div className="space-y-2">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your medical document text here..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleTextSubmit} disabled={!textInput.trim()}>
                  Submit Text
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTextInput('');
                    setShowTextInput(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Selected Files</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'pending' && (
                      <Button
                        onClick={() => uploadFile(file)}
                        disabled={uploading}
                        size="sm"
                        variant="outline"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    )}
                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                    {file.status === 'uploaded' && (
                      <span className="text-sm text-green-600">✓ Uploaded</span>
                    )}
                    {file.status === 'processed' && (
                      <span className="text-sm text-blue-600">✓ Processed</span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-sm text-red-600">✗ Error</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="border-t pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* OCR Results Display */}
        {ocrResults && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">OCR Results</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOcrResults(null)}
              >
                Hide Results
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(ocrResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadMedicalFile;
