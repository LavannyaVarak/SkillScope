
import React from 'react';

interface IndustrySelectorProps {
  selectedIndustry: string;
  onIndustryChange: (industry: string) => void;
  industries: string[];
  t: (key: string) => string;
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({ selectedIndustry, onIndustryChange, industries, t }) => {
  return (
    <div className="max-w-md mx-auto">
      <label htmlFor="industry-select" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
        {t('industrySelector.label')}
      </label>
      <select
        id="industry-select"
        value={selectedIndustry}
        onChange={(e) => onIndustryChange(e.target.value)}
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 rounded-lg focus:ring-primary focus:border-primary p-3 transition"
      >
        {industries.map((industry) => (
          <option key={industry} value={industry}>
            {t(`industry.${industry.toLowerCase()}`)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default IndustrySelector;
