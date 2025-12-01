
import React from 'react';
import { IndustryTrendData, HistoricalIndustryTrend } from '../types';
import Card from './Card';
import { BriefcaseIcon, DownloadIcon, TrendingUpIcon } from './Icon';
import HistoricalTrendChart from './HistoricalTrendChart';

interface TrendsDashboardProps {
  data: IndustryTrendData;
  historicalData: HistoricalIndustryTrend[];
  industry: string;
  t: (key: string) => string;
}

const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ data, historicalData, industry, t }) => {
  const sortedSkills = [...data.topSkills].sort((a, b) => b.demand - a.demand);

  const handleExport = () => {
    const skillsToExport = data.topSkills.map(({ skill, demand, trend }) => ({
        skill,
        demand,
        trend,
    }));

    if (skillsToExport.length === 0) {
      console.warn("No data to export.");
      return;
    }

    const headers = Object.keys(skillsToExport[0]);
    const csvRows = [headers.join(',')];

    for (const row of skillsToExport) {
        const values = headers.map(header => {
            const val = row[header as keyof typeof row];
            const escaped = ('' + val).replace(/"/g, '""'); // escape double quotes
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `${industry.replace(/\s+/g, '_')}_top_skills.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
    <Card className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{t('trends.historicalTitle')}</h2>
        <div className="h-96">
            <HistoricalTrendChart historicalData={historicalData} t={t} />
        </div>
    </Card>

    <Card className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('trends.currentTitle')}</h2>
        <button onClick={handleExport} className="flex items-center gap-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 font-semibold py-2 px-4 rounded-lg transition-colors">
            <DownloadIcon className="w-5 h-5" />
            {t('trends.exportSkills')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <TrendingUpIcon className="w-5 h-5 mr-2 text-primary" />
              {t('trends.trendingSkills')}
            </h3>
            <ul className="space-y-2">
              {sortedSkills.map(({ skill, demand, trend }) => (
                <li
                  key={skill}
                  title={`Demand: ${demand}, Trend: ${trend >= 0 ? '+' : ''}${trend}`}
                  className="bg-neutral-100 dark:bg-zinc-800/50 p-2 rounded-md text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {skill}
                </li>
              ))}
            </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <BriefcaseIcon className="w-5 h-5 mr-2 text-primary" />
            {t('trends.jobTitles')}
          </h3>
          <ul className="space-y-2">
            {data.jobTitles.map((title) => (
              <li key={title} className="bg-neutral-100 dark:bg-zinc-800/50 p-2 rounded-md text-sm text-zinc-700 dark:text-zinc-300">
                {title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default TrendsDashboard;
