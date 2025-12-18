import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, error }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-lg font-medium text-gray-700">Processing your file...</p>
              <p className="text-sm text-gray-500">This may take a few seconds</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-lg font-medium text-red-700">{error}</p>
              <p className="text-sm text-gray-500">Click or drag to try again</p>
            </>
          ) : isDragActive ? (
            <>
              <FileSpreadsheet className="w-12 h-12 text-blue-500" />
              <p className="text-lg font-medium text-blue-700">Drop your CSV file here</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drag & drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supported formats info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-2">Supported CSV Formats:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
            <div>
              <span className="font-medium">Cryptocurrency</span>
              <p className="text-gray-500">CoinSpot transaction export</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
            <div>
              <span className="font-medium">ASX Shares</span>
              <p className="text-gray-500">CommSec transaction export</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          🔒 Your data is processed entirely in your browser. No data is uploaded to any server.
        </p>
      </div>
    </div>
  );
};
