import React, { useState } from 'react';
import { CustomerData } from '../types';

type ManualEntryFormData = Omit<CustomerData, 'Exited' | 'Prediction' | 'ChurnProbability' | 'ConfidenceScore'>;

interface ManualEntryFormProps {
  onPredict: (data: ManualEntryFormData) => void;
  isLoading: boolean;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onPredict, isLoading }) => {
  const [formData, setFormData] = useState<ManualEntryFormData>({
    CustomerId: 15600001,
    CreditScore: 650,
    Gender: 'Male',
    Age: 35,
    Tenure: 5,
    Balance: 50000,
    NumOfProducts: 1,
    HasCrCard: 1,
    IsActiveMember: 1,
    EstimatedSalary: 100000,
    LoginFrequency: 20,
    ExternalTransfers: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const isNumericField = [
      'CustomerId', 'CreditScore', 'Age', 'Tenure', 'Balance', 'NumOfProducts', 
      'EstimatedSalary', 'LoginFrequency', 'ExternalTransfers', 'HasCrCard', 'IsActiveMember'
    ].includes(name);

    setFormData(prev => ({
      ...prev,
      [name]: isNumericField ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict(formData);
  };

  const formFields = [
      { name: 'CustomerId', label: 'Customer ID', type: 'number', placeholder: 'e.g., 15600001' },
      { name: 'CreditScore', label: 'Credit Score', type: 'number', placeholder: 'e.g., 650' },
      { name: 'Age', label: 'Age', type: 'number', placeholder: 'e.g., 35' },
      { name: 'Tenure', label: 'Tenure (years)', type: 'number', placeholder: 'e.g., 5' },
      { name: 'Balance', label: 'Balance', type: 'number', placeholder: 'e.g., 50000' },
      { name: 'NumOfProducts', label: 'Number of Products', type: 'number', placeholder: 'e.g., 1' },
      { name: 'EstimatedSalary', label: 'Estimated Salary', type: 'number', placeholder: 'e.g., 100000' },
      { name: 'LoginFrequency', label: 'Login Frequency (monthly)', type: 'number', placeholder: 'e.g., 20' },
      { name: 'ExternalTransfers', label: 'External Transfers (monthly)', type: 'number', placeholder: 'e.g., 10' },
  ];

  const selectFields = [
      { name: 'Gender', label: 'Gender', options: [{label: 'Male', value: 'Male'}, {label: 'Female', value: 'Female'}] },
      { name: 'HasCrCard', label: 'Has Credit Card', options: [{label: 'Yes', value: 1}, {label: 'No', value: 0}] },
      { name: 'IsActiveMember', label: 'Is Active Member', options: [{label: 'Yes', value: 1}, {label: 'No', value: 0}] },
  ]

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Customer Details</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Fill in the form to get a churn prediction for a single customer.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map(field => (
                <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                    <input
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        value={formData[field.name as keyof ManualEntryFormData] as string | number}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            ))}
            {selectFields.map(field => (
                <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                    <select
                        name={field.name}
                        id={field.name}
                        value={formData[field.name as keyof ManualEntryFormData] as string | number}
                        onChange={handleChange}
                        required
                         className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {field.options.map(option => (
                             <option key={String(option.value)} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-indigo-800"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Predict Churn'}
        </button>
      </form>
    </div>
  );
};