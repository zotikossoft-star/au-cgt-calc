import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, error }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: true,
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
              <p className="text-lg font-medium text-blue-700">Drop your CSV files here</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drag & drop your CSV files here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (you can select multiple files)
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  💡 Tip: Upload all your financial year CSV files together for accurate cross-year CGT calculation
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supported formats info */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-4">Supported CSV Formats</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-gray-800">Cryptocurrency</span>
              <p className="text-sm text-gray-600 mt-1">CoinSpot transaction export CSV files</p>
              <p className="text-xs text-gray-500 mt-1">
                Download from CoinSpot: Settings → Transaction History → Export to CSV
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-gray-800">ASX Shares</span>
              <p className="text-sm text-gray-600 mt-1">CommSec transaction export CSV files</p>
              <p className="text-xs text-gray-500 mt-1">
                Download from CommSec: Portfolio → Transaction History → Download CSV
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">Upload Options:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Upload only crypto files</li>
            <li>✓ Upload only ASX files</li>
            <li>✓ Upload both crypto and ASX files together</li>
            <li>✓ Upload multiple years at once for accurate CGT calculation</li>
          </ul>
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
