
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { HistoricalIndustryTrend } from '../types';
import { INDUSTRIES } from '../constants';

interface HistoricalTrendChartProps {
  historicalData: HistoricalIndustryTrend[];
  t: (key: string) => string;
}

const COLORS = ['#00CFFF', '#F500F5', '#f59e0b', '#ec4899', '#3b82f6', '#84cc16', '#d946ef', '#f43f5e'];

const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({ historicalData, t }) => {
  // Transform data for Recharts
  const transformData = (apiData: HistoricalIndustryTrend[]) => {
    const yearMap = new Map<number, { year: number, [key: string]: number }>();
    
    apiData.forEach(industryData => {
      // Ensure the industry is one we want to plot
      if (INDUSTRIES.includes(industryData.industry)) {
        industryData.data.forEach(point => {
          if (!yearMap.has(point.year)) {
            yearMap.set(point.year, { year: point.year });
          }
          const yearEntry = yearMap.get(point.year);
          if(yearEntry) {
            yearEntry[industryData.industry] = point.value;
          }
        });
      }
    });
    
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  };

  const chartData = transformData(historicalData);
  
  const translatedFormatter = (value: string) => {
    return t(`industry.${value.toLowerCase()}`);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--recharts-grid)" />
        <XAxis 
            dataKey="year" 
            tick={{ fill: 'var(--recharts-text)', fontSize: 12 }}
            padding={{ left: 20, right: 20 }}
        />
        <YAxis 
            tick={{ fill: 'var(--recharts-text)', fontSize: 12 }} 
            label={{ value: t('trends.growthIndex'), angle: -90, position: 'insideLeft', fill: 'var(--recharts-text)' }} 
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--recharts-tooltip-bg)',
            borderColor: 'var(--recharts-tooltip-border)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--recharts-tooltip-text)', fontWeight: 'bold' }}
          formatter={(value: number, name: string) => [value, translatedFormatter(name)]}
        />
        <Legend 
            wrapperStyle={{ color: 'var(--recharts-text)', fontSize: '12px' }}
            formatter={translatedFormatter}
        />
        {INDUSTRIES.map((industry, index) => (
          <Line
            key={industry}
            type="monotone"
            dataKey={industry}
            name={industry}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoricalTrendChart;
