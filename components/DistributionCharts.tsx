import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CustomerData } from '../types';

interface DistributionChartsProps {
  data: CustomerData[];
}

interface ChartData {
  name: string;
  Churned: number;
  Retained: number;
}

const processBinnedData = (
  data: CustomerData[],
  key: keyof CustomerData,
  bins: { label: string; min: number; max: number }[]
): ChartData[] => {
  const chartData: ChartData[] = bins.map(bin => ({ name: bin.label, Churned: 0, Retained: 0 }));
  
  data.forEach(customer => {
    const value = customer[key] as number;
    const bin = bins.find(b => value >= b.min && value < b.max);
    if (bin) {
      const target = chartData.find(c => c.name === bin.label)!;
      if (customer.Prediction === 1) {
        target.Churned += 1;
      } else {
        target.Retained += 1;
      }
    }
  });

  return chartData;
};

const processCategoricalData = (data: CustomerData[], key: keyof CustomerData): ChartData[] => {
    const categories: { [key: string]: { Churned: number; Retained: number } } = {};
    
    data.forEach(customer => {
      const value = customer[key] as number;
      if (!categories[value]) {
        categories[value] = { Churned: 0, Retained: 0 };
      }
      if (customer.Prediction === 1) {
        categories[value].Churned += 1;
      } else {
        categories[value].Retained += 1;
      }
    });
  
    return Object.keys(categories)
      .sort((a,b) => Number(a) - Number(b))
      .map(cat => ({
        name: `Products: ${cat}`,
        Churned: categories[cat].Churned,
        Retained: categories[cat].Retained,
      }));
  };

const DistributionBarChart: React.FC<{ data: ChartData[]; title: string; }> = ({ data, title }) => (
    <div>
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">{title}</h4>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                        border: '1px solid #4B5563',
                        borderRadius: '0.5rem',
                        color: '#F9FAFB'
                    }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: "14px"}} />
                <Bar dataKey="Retained" fill="#10B981" name="Retained" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Churned" fill="#EF4444" name="Churned" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export const DistributionCharts: React.FC<DistributionChartsProps> = ({ data }) => {

    const balanceData = useMemo(() => {
        const bins = [
            { label: '0', min: 0, max: 1 },
            { label: '1-50k', min: 1, max: 50000 },
            { label: '50k-100k', min: 50000, max: 100000 },
            { label: '100k-150k', min: 100000, max: 150000 },
            { label: '150k-200k', min: 150000, max: 200000 },
            { label: '>200k', min: 200000, max: Infinity },
        ];
        return processBinnedData(data, 'Balance', bins);
    }, [data]);

    const creditScoreData = useMemo(() => {
        const bins = [
            { label: '<500', min: 0, max: 500 },
            { label: '500-600', min: 500, max: 600 },
            { label: '600-700', min: 600, max: 700 },
            { label: '700-800', min: 700, max: 800 },
            { label: '>800', min: 800, max: Infinity },
        ];
        return processBinnedData(data, 'CreditScore', bins);
    }, [data]);

    const externalTransfersData = useMemo(() => {
        const bins = [
            { label: '0-10', min: 0, max: 11 },
            { label: '11-20', min: 11, max: 21 },
            { label: '21-30', min: 21, max: 31 },
            { label: '31-40', min: 31, max: 41 },
            { label: '>40', min: 41, max: Infinity },
        ];
        return processBinnedData(data, 'ExternalTransfers', bins);
    }, [data]);

    const numOfProductsData = useMemo(() => processCategoricalData(data, 'NumOfProducts'), [data]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                Feature Distribution Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                <DistributionBarChart data={balanceData} title="Balance Distribution" />
                <DistributionBarChart data={creditScoreData} title="Credit Score Distribution" />
                <DistributionBarChart data={externalTransfersData} title="External Transfers Distribution" />
                <DistributionBarChart data={numOfProductsData} title="Number of Products Distribution" />
            </div>
        </div>
    );
};