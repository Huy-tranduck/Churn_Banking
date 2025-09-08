import React from 'react';
import { PredictionResult } from '../types';
import { SummaryCard } from './SummaryCard';
import { UsersIcon, TrendingDownIcon, TrendingUpIcon } from './icons';
import { PredictionPieChart } from './PredictionPieChart';
import { ResultsTable } from './ResultsTable';
import { DistributionCharts } from './DistributionCharts';

interface DashboardProps {
  result: PredictionResult;
}

export const Dashboard: React.FC<DashboardProps> = ({ result }) => {
  const pieChartData = [
    { name: 'Retained', value: result.retentionCount },
    { name: 'Churned', value: result.churnCount },
  ];

  return (
    <div className="w-full mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Customers" 
          value={result.totalCustomers.toLocaleString()} 
          icon={<UsersIcon className="w-8 h-8 text-blue-500" />} 
          color="bg-blue-100 dark:bg-blue-900/40"
        />
        <SummaryCard 
          title="Predicted Churn" 
          value={result.churnCount.toLocaleString()} 
          icon={<TrendingDownIcon className="w-8 h-8 text-red-500" />}
          color="bg-red-100 dark:bg-red-900/40"
        />
        <SummaryCard 
          title="Predicted Retention" 
          value={result.retentionCount.toLocaleString()}
          icon={<TrendingUpIcon className="w-8 h-8 text-green-500" />}
          color="bg-green-100 dark:bg-green-900/40"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <PredictionPieChart data={pieChartData} />
        </div>
        <div className="lg:col-span-2">
            <ResultsTable data={result.dataWithPredictions} />
        </div>
      </div>

      <DistributionCharts data={result.dataWithPredictions} />

    </div>
  );
};