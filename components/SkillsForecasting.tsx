import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import IndustrySelector from './IndustrySelector';
import SkillsChart from './SkillsChart';
import Loader from './Loader';
import { getSkillsForecast } from '../services/geminiService';
import { SkillsForecastData } from '../types';
import { INDUSTRIES } from '../constants';
import { LightBulbIcon } from './Icon';

interface SkillsForecastingProps {
    t: (key: string, params?: Record<string, string | number>) => string;
}

const SkillsForecasting: React.FC<SkillsForecastingProps> = ({ t }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(INDUSTRIES[0]);
  const [forecastData, setForecastData] = useState<SkillsForecastData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async (industry: string) => {
    setIsLoading(true);
    setError(null);
    setForecastData(null);
    try {
      const data = await getSkillsForecast(industry);
      setForecastData(data);
    } catch (err) {
      setError(t('forecast.error.fail'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchForecast(selectedIndustry);
  }, [selectedIndustry, fetchForecast]);

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('forecast.title')}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          {t('forecast.description')}
        </p>
        <IndustrySelector
          t={t}
          selectedIndustry={selectedIndustry}
          onIndustryChange={setSelectedIndustry}
          industries={INDUSTRIES}
        />
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      )}

      {error && (
        <Card>
          <div className="text-center text-red-500 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>
        </Card>
      )}

      {forecastData && !isLoading && (
        <Card className="animate-fade-in">
          <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
            {t('forecast.results.title', { industry: selectedIndustry })}
          </h3>
          <div className="h-96 mb-8">
            <SkillsChart skills={forecastData.predictedSkills} t={t} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-secondary flex items-center mb-3">
              <LightBulbIcon className="w-6 h-6 mr-2" />
              {t('forecast.tips.title')}
            </h4>
            <ul className="space-y-3 text-zinc-600 dark:text-zinc-300">
              {forecastData.futureProofTips.map((tip, index) => (
                <li key={index} className="bg-neutral-100 dark:bg-zinc-950/50 p-3 rounded-lg flex">
                  <span className="text-primary font-bold mr-3">{index + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SkillsForecasting;