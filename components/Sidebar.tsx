



import React, { useState } from 'react';
import { ChartBarIcon, LogoutIcon, UserCircleIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, InformationCircleIcon, BriefcaseIcon, WrenchScrewdriverIcon, SkillScopeLogo } from './Icon';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  t: (key: string) => string;
}

// FIX: Explicitly define a type for NavItem props. This can resolve subtle type
// inference issues and makes the component's contract clearer.
type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  page: string;
  isExpanded: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ user, activeSection, onSectionChange, onLogout, t }) => {
  const [isOpen, setIsOpen] = useState(true);

  const mainNavItems = [
    { id: 'insights', labelKey: 'sidebar.insights', icon: <ChartBarIcon className="w-6 h-6" /> },
    { id: 'builder', labelKey: 'sidebar.builder', icon: <WrenchScrewdriverIcon className="w-6 h-6" /> },
    { id: 'opportunities', labelKey: 'sidebar.opportunities', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { id: 'info', labelKey: 'sidebar.info', icon: <InformationCircleIcon className="w-6 h-6" /> },
  ];

  // FIX: Explicitly typed the `NavItem` component as `React.FC<NavItemProps>` to correctly handle React's special `key` prop. This resolves the TypeScript error where `key` was being checked against the component's props, which it shouldn't be.
  const NavItem: React.FC<NavItemProps> = ({ icon, label, page, isExpanded }) => (
    <button
      onClick={() => onSectionChange(page)}
      className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors ${activeSection === page ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
    >
      {icon}
      {isExpanded && <span className="ml-3 font-semibold">{label}</span>}
    </button>
  );

  return (
    <div className={`bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300 ease-in-out border-r border-zinc-200 dark:border-zinc-800 ${isOpen ? 'w-64' : 'w-20'} h-screen sticky top-0`}>
      <div className={`flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 h-[69px] ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
            <div className="flex items-center gap-2">
                <SkillScopeLogo className="h-7 w-7" />
                <span className="font-bold text-xl text-zinc-900 dark:text-zinc-100">{t('app.title')}</span>
            </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700">
          {isOpen ? <ChevronDoubleLeftIcon className="w-6 h-6" /> : <ChevronDoubleRightIcon className="w-6 h-6" />}
        </button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {mainNavItems.map(item => (
            <NavItem key={item.id} icon={item.icon} label={t(item.labelKey)} page={item.id} isExpanded={isOpen} />
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => onSectionChange('profile')}
          className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors text-left group ${
            activeSection === 'profile' 
            ? 'bg-primary text-white' 
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
            {user?.profilePicture ? (
                <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className={`w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 ${activeSection === 'profile' ? 'border-white' : 'border-zinc-300 dark:border-zinc-600'}`}
                />
            ) : (
                <UserCircleIcon className={`w-8 h-8 flex-shrink-0 transition-colors ${
                    activeSection === 'profile' ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                }`}/>
            )}
            
            {isOpen && (
                <div className="ml-3 overflow-hidden">
                    <p className={`text-sm font-semibold truncate ${
                      activeSection === 'profile' ? 'text-white' : 'text-zinc-800 dark:text-zinc-100'
                    }`}>{user?.fullName || t('sidebar.guest')}</p>
                    <p className={`text-xs truncate transition-colors ${
                      activeSection === 'profile' ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'
                    }`}>{user?.username ? `@${user.username}` : t('sidebar.welcome')}</p>
                </div>
            )}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 mt-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          <LogoutIcon className="w-6 h-6" />
          {isOpen && <span className="ml-3 font-semibold">{t('sidebar.logout')}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
