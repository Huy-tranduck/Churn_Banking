
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PredictionPieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#10B981', '#EF4444']; // Green for Retained, Red for Churned

const RADIAN = Math.PI / 180;
// FIX: The original generic type for props was too strict and incompatible with Recharts' PieLabelProps.
// Replaced with a more flexible inline type where properties that can be optional are marked as such.
// Added checks to handle cases where optional props might be undefined.
const renderCustomizedLabel = (props: {
  cx: number;
  cy: number;
  midAngle?: number;
  innerRadius: number;
  outerRadius: number;
  percent?: number;
}): React.ReactElement | null => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  if (midAngle === undefined || percent === undefined) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={0.6}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 600 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const PredictionPieChart: React.FC<PredictionPieChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-96 flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Churn vs. Retention Prediction</h3>
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={0}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                border: '1px solid #4B5563',
                borderRadius: '0.5rem',
                color: '#F9FAFB'
              }}
              formatter={(value, name) => [`${value} customers`, name]}
            />
            <Legend iconType="circle" align="center" verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
