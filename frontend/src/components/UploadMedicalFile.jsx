import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Plus, X } from 'lucide-react';

const UploadMedicalFile = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
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
      status: 'uploading'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload process
    newFiles.forEach(fileObj => {
      setTimeout(() => {
        setFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'uploaded' }
              : f
          )
        );
      }, 2000);
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
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
            {' '}(PDF, images, text)
          </p>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
          
          <p className="text-sm text-gray-500">
            PDF, JPG, PNG, DOC, DOCX, TXT (Max 10MB each)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

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
            <h4 className="font-medium text-gray-900 mb-3">Uploaded Files</h4>
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
                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                    {file.status === 'uploaded' && (
                      <span className="text-sm text-green-600">✓ Uploaded</span>
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
      </CardContent>
    </Card>
  );
};

export default UploadMedicalFile;
