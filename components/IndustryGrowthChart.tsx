
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GrowthChartProps {
  data: {
    name: string;
    growthRate: number;
  }[];
  t: (key: string) => string;
}

const CustomTooltip = ({ active, payload, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-md border border-zinc-300 dark:border-zinc-600 text-sm shadow-lg">
        <p className="font-bold text-zinc-800 dark:text-zinc-100">{t(`industry.${payload[0].payload.name.toLowerCase()}`)}</p>
        <p className="text-primary">{`${t('compare.annualGrowth')}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#00CFFF', '#F500F5', '#f59e0b', '#39FF14', '#3b82f6'];

const IndustryGrowthChart: React.FC<GrowthChartProps> = ({ data, t }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        barSize={60}
      >
        <XAxis dataKey="name" tickFormatter={(value) => t(`industry.${value.toLowerCase()}`)} tick={{ fill: 'var(--recharts-text)', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: 'var(--recharts-text)', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
        <Bar dataKey="growthRate" radius={[4, 4, 0, 0]}>
           {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IndustryGrowthChart;
