import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skill } from '../types';

interface SkillsChartProps {
  skills: Skill[];
  t: (key: string) => string;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-md border border-zinc-300 dark:border-zinc-600 text-sm shadow-lg">
        <p className="font-bold text-zinc-800 dark:text-zinc-100">{label}</p>
        <p className="text-primary">{`${t('skillsChart.demand')}: ${data.demand}`}</p>
        <p className={`${data.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {`${t('skillsChart.trend')}: ${data.trend > 0 ? '+' : ''}${data.trend}`}
        </p>
      </div>
    );
  }
  return null;
};

const SkillsChart: React.FC<SkillsChartProps> = ({ skills, t }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={skills}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 80, bottom: 5 }} // Increased left margin for labels
        barCategoryGap="30%" // Added vertical spacing to prevent overlap
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey="skill"
          type="category"
          width={150} // Increased width to allow more space for text
          tick={{ fill: 'var(--recharts-text)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval={0} // Ensure all labels are rendered
        />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
        <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
          {skills.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.trend > 0 ? '#00CFFF' : '#F500F5'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SkillsChart;