import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ManualEntryForm } from './components/ManualEntryForm';
import { Dashboard } from './components/Dashboard';
import { PredictionResult, CustomerData } from './types';
import { parseExcelFile, mockCatBoostPredict } from './services/predictionService';

const App: React.FC = () => {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

  const handlePredict = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);
    setShowDashboard(false);

    try {
      const jsonData = await parseExcelFile(file);
      
      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dataWithPredictions: CustomerData[] = mockCatBoostPredict(jsonData as CustomerData[]);
      
      const churnCount = dataWithPredictions.filter(c => c.Prediction === 1).length;
      const totalCustomers = dataWithPredictions.length;
      const retentionCount = totalCustomers - churnCount;

      setPredictionResult({
        totalCustomers,
        churnCount,
        retentionCount,
        dataWithPredictions,
      });
      setShowDashboard(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualPredict = useCallback(async (customerData: Omit<CustomerData, 'Exited' | 'Prediction' | 'ChurnProbability' | 'ConfidenceScore'>) => {
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);
    setShowDashboard(false);

    try {
        const dataToPredict = [customerData as CustomerData];

        await new Promise(resolve => setTimeout(resolve, 500));

        const dataWithPredictions: CustomerData[] = mockCatBoostPredict(dataToPredict);
      
        const churnCount = dataWithPredictions.filter(c => c.Prediction === 1).length;
        const totalCustomers = dataWithPredictions.length;
        const retentionCount = totalCustomers - churnCount;

        setPredictionResult({
            totalCustomers,
            churnCount,
            retentionCount,
            dataWithPredictions,
        });
        setShowDashboard(true);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const resetApp = () => {
    setPredictionResult(null);
    setShowDashboard(false);
    setError(null);
    setActiveTab('upload');
  }
  
  const tabButtonClasses = (isActive: boolean) => 
    `w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-all duration-200 ${
      isActive
        ? 'bg-white dark:bg-gray-800 shadow text-indigo-700 dark:text-indigo-400'
        : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'
    }`;


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Customer Churn Predictor</h1>
            {showDashboard && (
                 <button onClick={resetApp} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Start New Prediction
                </button>
            )}
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!showDashboard ? (
          <div className="mt-10 flex flex-col items-center">
             <div className="w-full max-w-sm mx-auto mb-6 p-1 flex space-x-1 bg-gray-200 dark:bg-gray-700/50 rounded-xl">
              <button onClick={() => setActiveTab('upload')} className={tabButtonClasses(activeTab === 'upload')}>
                Upload File
              </button>
              <button onClick={() => setActiveTab('manual')} className={tabButtonClasses(activeTab === 'manual')}>
                Manual Entry
              </button>
            </div>
            
            {activeTab === 'upload' ? (
                <FileUpload onPredict={handlePredict} isLoading={isLoading} />
            ) : (
                <ManualEntryForm onPredict={handleManualPredict} isLoading={isLoading} />
            )}

          </div>
        ) : predictionResult && (
          <Dashboard result={predictionResult} />
        )}
      </main>
    </div>
  );
};

export default App;