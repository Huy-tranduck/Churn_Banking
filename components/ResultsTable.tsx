import React, { useState } from 'react';
import { CustomerData } from '../types';

interface ResultsTableProps {
  data: CustomerData[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const headers = [
    'Customer ID', 'Age', 'Gender', 'Credit Score', 'Tenure', 'Balance', 
    'Num of Products', 'Has Credit Card', 'Is Active', 'Estimated Salary', 
    'Login Frequency', 'External Transfers', 'Prediction', 'Churn Probability', 'Confidence Score'
  ];
  
  const goToPage = (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 overflow-x-auto">
       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prediction Details</h3>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr key={row.CustomerId} className={`border-b dark:border-gray-700 ${row.Prediction === 1 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}>
              <td className="px-6 py-4">{row.CustomerId}</td>
              <td className="px-6 py-4">{row.Age}</td>
              <td className="px-6 py-4">{row.Gender}</td>
              <td className="px-6 py-4">{row.CreditScore}</td>
              <td className="px-6 py-4">{row.Tenure}</td>
              <td className="px-6 py-4">${row.Balance.toFixed(2)}</td>
              <td className="px-6 py-4">{row.NumOfProducts}</td>
              <td className="px-6 py-4">{row.HasCrCard ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4">{row.IsActiveMember ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4">${row.EstimatedSalary.toFixed(2)}</td>
              <td className="px-6 py-4">{row.LoginFrequency}</td>
              <td className="px-6 py-4">{row.ExternalTransfers}</td>
              <td className={`px-6 py-4 font-bold ${row.Prediction === 1 ? 'text-red-500' : 'text-green-500'}`}>
                {row.Prediction === 1 ? 'Churn' : 'Retain'}
              </td>
               <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(row.ChurnProbability ?? 0) * 100}%` }}></div>
                  </div>
                   <span className="text-xs">{((row.ChurnProbability ?? 0) * 100).toFixed(0)}%</span>
               </td>
               <td className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(row.ConfidenceScore ?? 0) * 100}%` }}></div>
                  </div>
                   <span className="text-xs">{((row.ConfidenceScore ?? 0) * 100).toFixed(0)}%</span>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
       <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, data.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{data.length}</span> Entries
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">
              Prev
          </button>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">
              Next
          </button>
        </div>
      </div>
    </div>
  );
};