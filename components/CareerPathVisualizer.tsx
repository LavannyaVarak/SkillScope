import React from 'react';
import { CareerPathData } from '../types';
import { BriefcaseIcon, SparklesIcon, CheckCircleIcon } from './Icon';

interface CareerPathVisualizerProps {
  data: CareerPathData;
  t: (key: string) => string;
}

const CareerPathVisualizer: React.FC<CareerPathVisualizerProps> = ({ data, t }) => {
  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            {/* Current Role */}
            <div className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-lg w-full md:w-1/3">
                <BriefcaseIcon className="w-8 h-8 mx-auto text-zinc-500 dark:text-zinc-400 mb-2" />
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{t('resume.careerPath.current')}</h4>
                <p className="text-primary font-semibold">{data.currentRole.role}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{data.currentRole.description}</p>
            </div>
            
            {/* Arrow */}
            <div className="text-primary text-2xl font-bold transform rotate-90 md:rotate-0">→</div>

            {/* Target Role */}
            <div className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-lg w-full md:w-1/3">
                <SparklesIcon className="w-8 h-8 mx-auto text-secondary mb-2" />
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{t('resume.careerPath.target')}</h4>
                <p className="text-secondary font-semibold">{data.targetRole.role}</p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{data.targetRole.description}</p>
            </div>
        </div>

        {/* Skills to Bridge */}
        <div className="bg-neutral-100 dark:bg-zinc-950/50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg text-center mb-3">{t('resume.careerPath.bridgeSkills')}</h4>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {data.skillsToBridge.map(skill => (
                    <li key={skill} className="flex items-center text-sm bg-zinc-200 dark:bg-zinc-800 p-2 rounded-md">
                       <CheckCircleIcon className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                       <span className="text-zinc-700 dark:text-zinc-300">{skill}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default CareerPathVisualizer;
