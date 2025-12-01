import React from 'react';
import Card from './Card';
import { BriefcaseIcon, AcademicCapIcon, SparklesIcon } from './Icon';

interface AboutUsProps {
    t: (key: string) => string;
}

const AboutUs: React.FC<AboutUsProps> = ({ t }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('about.title')}</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {t('about.tagline')}
            </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-2xl font-bold mb-4 flex items-center"><SparklesIcon className="w-6 h-6 mr-3 text-primary"/>{t('about.purpose.title')}</h3>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {t('about.purpose.body')}
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-2xl font-bold mb-4 flex items-center"><BriefcaseIcon className="w-6 h-6 mr-3 text-primary"/>{t('about.team.title')}</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t('about.team.body')}
          </p>
        </Card>
        <Card>
          <h3 className="text-2xl font-bold mb-4 flex items-center"><AcademicCapIcon className="w-6 h-6 mr-3 text-primary"/>{t('about.institution.title')}</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t('about.institution.body')}
          </p>
        </Card>
      </div>

       <Card>
        <h3 className="text-2xl font-bold mb-4">{t('about.data.title')}</h3>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {t('about.data.body')}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
            <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-full">{t('about.data.source1')}</span>
            <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-full">{t('about.data.source2')}</span>
            <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-full">{t('about.data.source3')}</span>
            <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold px-4 py-2 rounded-full">{t('about.data.source4')}</span>
        </div>
      </Card>
    </div>
  );
};

export default AboutUs;