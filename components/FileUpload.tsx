
import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon } from './icons';

interface FileUploadProps {
  onPredict: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onPredict, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onPredict(file);
    }
  };
  
  const openFilePicker = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Customer Data</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Upload an Excel file (.xlsx, .xls) to get churn predictions.</p>
      </div>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 
                    ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">XLSX, XLS up to 10MB</p>
      </div>

      {file && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
                <FileIcon className="w-6 h-6 text-gray-500 dark:text-gray-400"/>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-sm font-bold">X</button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-indigo-800"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : 'Predict Churn'}
      </button>
    </div>
  );
};
