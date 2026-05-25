import React, { useState } from 'react';
import Card from './Card';
import { predictSalary } from '../services/geminiService';
import { SalaryPrediction } from '../types';
import Loader from './Loader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SalaryPredictorProps {
    t: (key: string, params?: Record<string, string | number>) => string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CustomTooltip = ({ active, payload, analysis }: any) => {
  if (active && payload && payload.length) {
    const low = payload[0].payload.low;
    const high = low + payload[1].payload.range;
    return (
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-md border border-zinc-300 dark:border-zinc-600 text-sm max-w-xs shadow-lg">
        <p className="font-bold text-zinc-800 dark:text-zinc-100">{`${formatCurrency(low)} - ${formatCurrency(high)}`}</p>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2 whitespace-normal">{analysis}</p>
      </div>
    );
  }
  return null;
};


const SalaryPredictor: React.FC<SalaryPredictorProps> = ({ t }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState<number>(3);
  const [prediction, setPrediction] = useState<SalaryPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      const result = await predictSalary(jobTitle, skillsArray, location, experience);
      setPrediction(result);
    } catch (err) {
      setError(t('salary.error.fail'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const chartData = prediction ? [{ 
    name: t('salary.chart.label'), 
    low: prediction.salaryRange.low, 
    range: prediction.salaryRange.high - prediction.salaryRange.low 
  }] : [];

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('salary.title')}</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">{t('salary.description')}</p>
      
      <form onSubmit={handlePredict} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t('salary.placeholder.title')}
              className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
              required
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('salary.placeholder.location')}
              className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
              required
            />
        </div>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder={t('salary.placeholder.skills')}
          className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
          required
        />
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t('salary.label.experience', { experience })}</label>
          <input
            type="range"
            min="0"
            max="20"
            value={experience}
            onChange={(e) => setExperience(Number(e.target.value))}
            className="w-full h-2 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-focus transition-all duration-300 hover:shadow-glow-secondary disabled:bg-zinc-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
        >
          {isLoading ? <Loader /> : t('salary.button.predict')}
        </button>
      </form>
      
      {error && <div className="mt-4 text-center text-red-500 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}

      {prediction && (
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-zinc-600 dark:text-zinc-400">{t('salary.results.title')}</p>
          <div className="w-full h-24 mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} stroke="var(--recharts-text)"/>
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip content={<CustomTooltip analysis={prediction.analysis} />} cursor={{fill: 'rgba(200, 200, 200, 0.1)'}} />
                    <Bar dataKey="low" stackId="a" fill="transparent" />
                    <Bar dataKey="range" stackId="a" fill="var(--color-primary, #00CFFF)" radius={[4, 4, 4, 4]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SalaryPredictor;