import React from 'react';

interface SubNavBarProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabClick: (tabKey: string) => void;
}

const SubNavBar: React.FC<SubNavBarProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabClick(tab.key)}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors
              ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SubNavBar;