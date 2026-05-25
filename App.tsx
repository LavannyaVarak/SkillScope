







import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import TrendsDashboard from './components/TrendsDashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import SalaryPredictor from './components/SalaryPredictor';
import SkillsForecasting from './components/SkillsForecasting';
import LiveJobs from './components/LiveJobs';
import { getIndustryTrends, getDetailedIndustryComparison, getHistoricalTrends } from './services/geminiService';
import { IndustryTrendData, User, DetailedComparisonData, HistoricalIndustryTrend, JobOpening } from './types';
import { INDUSTRIES, LANGUAGES } from './constants';
import Loader from './components/Loader';
import Card from './components/Card';
import { SwitchHorizontalIcon, DownloadIcon, ChatBubbleLeftRightIcon, LanguageIcon, SkillScopeLogo } from './components/Icon';
import IndustrySelector from './components/IndustrySelector';
import IndustryGrowthChart from './components/IndustryGrowthChart';
import Chatbot from './components/Chatbot';
import GrammarChecker from './components/GrammarChecker';
import AboutUs from './components/AboutUs';
import CourseRecommender from './components/CourseRecommender';
import { translations } from './translations';
import ThemeToggle from './components/ThemeToggle';
import SubNavBar from './components/SubNavBar';
import FeedbackPage from './components/FeedbackPage';
import ProfilePage from './components/ProfilePage';
import ResumeBuilder from './components/ResumeBuilder';

// FIX: Define a type for the navigation configuration to resolve type errors.
// This helps TypeScript understand the object's structure, allowing safe access
// to nested properties without needing unsafe type assertions.
type NavigationConfig = {
    [key: string]: {
        default: string;
        subPages: {
            [key: string]: { labelKey: string; component: string };
        };
    };
};

const DetailedIndustryComparison = ({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) => {
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([INDUSTRIES[0], INDUSTRIES[1]]);
    const [comparisonData, setComparisonData] = useState<DetailedComparisonData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleIndustryToggle = (industry: string) => {
        setSelectedIndustries(prev =>
            prev.includes(industry)
                ? prev.filter(i => i !== industry)
                : [...prev, industry]
        );
    };

    const handleCompare = async () => {
        if (selectedIndustries.length < 2) {
            setError(t('compare.error.min'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setComparisonData(null);
        try {
            const result = await getDetailedIndustryComparison(selectedIndustries);
            setComparisonData(result);
        } catch (err) {
            setError(t('compare.error.fetch'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Fetch comparison for default selected industries on initial render
        handleCompare();
    }, []);


    const growthChartData = comparisonData ? comparisonData.industries.map(ind => ({ name: ind.name, growthRate: ind.growthRate })) : [];

    const handleExportComparison = () => {
        if (!comparisonData) return;

        const dataToExport = [];
        for (const factor of comparisonData.comparison) {
            for (const detail of factor.comparisonDetails) {
                dataToExport.push({
                    factor: factor.factor,
                    industry: detail.industry,
                    details: detail.details,
                    factor_analysis: factor.analysis
                });
            }
        }

        if (dataToExport.length === 0) {
            console.warn("No comparison data to export.");
            return;
        }

        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(',')];

        for (const row of dataToExport) {
            const values = headers.map(header => {
                const val = row[header as keyof typeof row];
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `Industry_Comparison_${selectedIndustries.join('_vs_').replace(/\s+/g, '_')}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('compare.title')}</h2>
            <div className="mb-4">
                 <p className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">{t('compare.select.label')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 bg-zinc-200 dark:bg-zinc-950 rounded-lg">
                    {INDUSTRIES.map(industry => (
                        <label key={industry} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer text-sm transition-colors ${selectedIndustries.includes(industry) ? 'bg-primary text-white font-semibold' : 'bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}>
                            <input
                                type="checkbox"
                                checked={selectedIndustries.includes(industry)}
                                onChange={() => handleIndustryToggle(industry)}
                                className="form-checkbox h-4 w-4 text-primary bg-zinc-300 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 rounded focus:ring-primary-focus focus:ring-offset-background"
                                style={{ accentColor: 'var(--color-primary)'}}
                            />
                            <span>{t(`industry.${industry.toLowerCase()}`)}</span>
                        </label>
                    ))}
                </div>
            </div>
             <button
                onClick={handleCompare}
                disabled={isLoading}
                className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-focus transition-all duration-300 hover:shadow-glow-secondary disabled:bg-zinc-500 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
            >
                {isLoading ? <Loader /> : t('compare.button', { count: selectedIndustries.length })}
            </button>
            {error && <div className="mt-4 text-center text-red-500 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
            
            {isLoading && !comparisonData && <div className="flex justify-center items-center h-64"><Loader /></div>}

            {comparisonData && (
                <div className="mt-8 animate-fade-in space-y-8">
                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('compare.results.title')}</h3>
                        <button onClick={handleExportComparison} className="flex items-center gap-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                            <DownloadIcon className="w-5 h-5"/>
                            {t('compare.export')}
                        </button>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-center mb-4">{t('compare.growth.title')}</h3>
                         {growthChartData.length > 0 && <IndustryGrowthChart data={growthChartData} t={t} />}
                    </div>
                    {comparisonData.comparison.map((item, index) => (
                        <div key={index} className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                            <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{item.factor}</h3>
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedIndustries.length > 2 ? 'lg:grid-cols-3' : ''} gap-6`}>
                                {item.comparisonDetails.map((detail, detailIndex) => (
                                     <div key={detail.industry} className="bg-neutral-100 dark:bg-zinc-950 p-4 rounded-lg">
                                        <h4 className={`font-semibold mb-2 text-primary`}>{detail.industry}</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{detail.details}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center bg-zinc-200/50 dark:bg-zinc-700/50 p-3 rounded-lg">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{t('compare.analysis')} </span>
                                    {item.analysis}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState({ section: 'insights', subPage: 'trends' });
    
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('skillscope_language');
        return savedLanguage && LANGUAGES.includes(savedLanguage) ? savedLanguage : LANGUAGES[0];
    });
    const [courseSkills, setCourseSkills] = useState<string[] | null>(null);

    const [trendsView, setTrendsView] = useState('single'); // State specific to trends page
    const [selectedIndustry, setSelectedIndustry] = useState<string>(INDUSTRIES[0]);
    const [trendsData, setTrendsData] = useState<IndustryTrendData | null>(null);
    const [isTrendsLoading, setIsTrendsLoading] = useState<boolean>(true);
    const [trendsError, setTrendsError] = useState<string | null>(null);

    const [historicalData, setHistoricalData] = useState<HistoricalIndustryTrend[] | null>(null);
    const [isHistoricalLoading, setIsHistoricalLoading] = useState<boolean>(true);

    const [savedJobs, setSavedJobs] = useState<JobOpening[]>([]);
    const [alertMessage, setAlertMessage] = useState<string>('');
    

    const handleSetLanguage = (lang: string) => {
        if (LANGUAGES.includes(lang)) {
            localStorage.setItem('skillscope_language', lang);
            setLanguage(lang);
        }
    };

    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        const langKey = language as keyof typeof translations;
        const englishKey = 'English' as keyof typeof translations;
        
        let template = translations[langKey]?.[key] || translations[englishKey]?.[key] || key;
        
        if (params) {
            Object.keys(params).forEach(pKey => {
                template = template.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(params[pKey]));
            });
        }

        return template;
    }, [language]);

    useEffect(() => {
        try {
            const localSavedJobs = localStorage.getItem('skillscope_savedJobs');
            if (localSavedJobs) {
                setSavedJobs(JSON.parse(localSavedJobs));
            }
        } catch(e) { console.error("Failed to parse saved jobs from localStorage", e); }
    }, []);

    const showAndHideAlert = (message: string) => {
        setAlertMessage(message);
        setTimeout(() => setAlertMessage(''), 3000);
    };

    const handleToggleSaveJob = (jobToSave: JobOpening) => {
        setSavedJobs(prevSavedJobs => {
            const isSaved = prevSavedJobs.some(job => job.id === jobToSave.id);
            let updatedSavedJobs;

            if (isSaved) {
                updatedSavedJobs = prevSavedJobs.filter(job => job.id !== jobToSave.id);
                showAndHideAlert(t('jobs.job.unsaved'));
            } else {
                updatedSavedJobs = [...prevSavedJobs, jobToSave];
                showAndHideAlert(t('jobs.job.saved'));
            }
            localStorage.setItem('skillscope_savedJobs', JSON.stringify(updatedSavedJobs));
            return updatedSavedJobs;
        });
    };

    const handleNavigate = (section: string, subPage: string) => {
        setActiveView({ section, subPage });
    };

    const navigationConfig: NavigationConfig = {
        insights: {
            default: 'trends',
            subPages: {
                trends: { labelKey: 'subnav.trends', component: 'Trends' },
                forecast: { labelKey: 'subnav.forecast', component: 'Forecast' }
            }
        },
        builder: {
            default: 'resume',
            subPages: {
                resume: { labelKey: 'subnav.resume', component: 'Resume' },
                create: { labelKey: 'subnav.create', component: 'CreateResume' },
                grammar: { labelKey: 'subnav.grammar', component: 'Grammar' },
                courses: { labelKey: 'subnav.courses', component: 'Courses' }
            }
        },
        opportunities: {
            default: 'jobs',
            subPages: {
                jobs: { labelKey: 'subnav.jobs', component: 'Jobs' },
                salary: { labelKey: 'subnav.salary', component: 'Salary' }
            }
        },
        info: {
            default: 'about',
            subPages: {
                about: { labelKey: 'subnav.about', component: 'About' },
                feedback: { labelKey: 'subnav.feedback', component: 'Feedback' }
            }
        },
        profile: {
            default: 'view',
            subPages: {
                view: { labelKey: 'subnav.profile', component: 'Profile' }
            }
        }
    };

    const handleSectionChange = (section: string) => {
        const sectionConfig = navigationConfig[section as keyof typeof navigationConfig];
        if (sectionConfig) {
            handleNavigate(section, sectionConfig.default);
        }
    };


    useEffect(() => {
        const userJson = localStorage.getItem('pathshala_currentUser');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                setCurrentUser(user);
                // After login, set the language from localStorage if it exists
                const savedLanguage = localStorage.getItem('skillscope_language');
                if (savedLanguage && LANGUAGES.includes(savedLanguage)) {
                    setLanguage(savedLanguage);
                }
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                localStorage.removeItem('pathshala_currentUser');
            }
        }
    }, []);

    const handleLogin = (user: User) => {
        localStorage.setItem('pathshala_currentUser', JSON.stringify(user));
        setCurrentUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('pathshala_currentUser');
        setCurrentUser(null);
    };

    const handleUpdateUser = (updatedUser: User) => {
        // 1. Update state
        setCurrentUser(updatedUser);
        
        // 2. Update current session storage
        localStorage.setItem('pathshala_currentUser', JSON.stringify(updatedUser));
        
        // 3. Update the main users array storage (to persist across logins)
        try {
            const usersJson = localStorage.getItem('pathshala_users');
            if (usersJson) {
                const users: User[] = JSON.parse(usersJson);
                // Find the user by original email/username (assuming email is unique key, or username)
                // Since we allow editing email, this might be tricky if we don't have a stable ID.
                // For simplicity, we'll try to match by the OLD email if possible, but here we only receive the NEW user object.
                // A better approach would be to have a stable ID. 
                // However, since we are doing client-side logic, we can search by the field that *wasn't* changed or assume the user is updating their own record.
                // Let's assume for this simple app we match by old email if not changed, or just find the index of the currently logged in user before update?
                // Actually, let's just find the user index in the array that matches the PREVIOUS currentUser state.
                
                if (currentUser) {
                    const index = users.findIndex(u => u.email === currentUser.email);
                    if (index !== -1) {
                        users[index] = updatedUser;
                        localStorage.setItem('pathshala_users', JSON.stringify(users));
                    }
                }
            }
        } catch (e) {
            console.error("Failed to update user database", e);
        }
    };

    const fetchTrends = useCallback(async (industry: string) => {
        setIsTrendsLoading(true);
        setTrendsError(null);
        setTrendsData(null);
        try {
            const data = await getIndustryTrends(industry);
            setTrendsData(data);
        } catch (err) {
            setTrendsError(t('trends.error.fetch'));
            console.error(err);
        } finally {
            setIsTrendsLoading(false);
        }
    }, [t]);

    const fetchHistoricalData = useCallback(async () => {
        setIsHistoricalLoading(true);
        try {
            const data = await getHistoricalTrends();
            setHistoricalData(data);
        } catch (err) {
             setTrendsError(t('trends.error.history'));
            console.error(err);
        } finally {
            setIsHistoricalLoading(false);
        }
    }, [t]);


    useEffect(() => {
        if (currentUser && activeView.section === 'insights' && activeView.subPage === 'trends' && trendsView === 'single') {
            fetchTrends(selectedIndustry);
             if (!historicalData) {
                fetchHistoricalData();
            }
        }
    }, [selectedIndustry, fetchTrends, activeView, trendsView, currentUser, historicalData, fetchHistoricalData]);
  
    const renderTrendsContent = () => {
        const showLoader = isTrendsLoading || (trendsView === 'single' && isHistoricalLoading);
        return (
            <>
                <div className="mb-8 p-4 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center gap-4">
                    <button 
                        onClick={() => setTrendsView('single')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${trendsView === 'single' ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                    >
                        {t('trends.view.single')}
                    </button>
                    <SwitchHorizontalIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400"/>
                    <button 
                        onClick={() => setTrendsView('compare')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${trendsView === 'compare' ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                    >
                        {t('trends.view.compare')}
                    </button>
                </div>
                {trendsView === 'single' ? (
                    <>
                        <div className="mb-8">
                            <IndustrySelector
                                t={t}
                                selectedIndustry={selectedIndustry}
                                onIndustryChange={setSelectedIndustry}
                                industries={INDUSTRIES}
                            />
                        </div>
                        {showLoader && <div className="flex justify-center items-center h-64"><Loader /></div>}
                        {trendsError && <div className="text-center text-red-500 p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">{trendsError}</div>}
                        {trendsData && historicalData && !showLoader && <TrendsDashboard t={t} data={trendsData} historicalData={historicalData} industry={selectedIndustry} />}
                    </>
                ) : (
                    <DetailedIndustryComparison t={t} />
                )}
            </>
        );
    };

    const handleNavigateToCourses = (skills: string[]) => {
        setCourseSkills(skills);
        handleNavigate('builder', 'courses');
    };

    const renderPage = () => {
        const { section, subPage } = activeView;

        if (section === 'insights') {
            switch(subPage) {
                case 'trends': return renderTrendsContent();
                case 'forecast': return <SkillsForecasting t={t} />;
                default: return renderTrendsContent();
            }
        }
        if (section === 'builder') {
             switch(subPage) {
                case 'resume': return <ResumeAnalyzer t={t} language={language} onNavigateToCourses={handleNavigateToCourses} savedJobs={savedJobs} handleToggleSaveJob={handleToggleSaveJob} />;
                case 'create': return <ResumeBuilder t={t} />;
                case 'grammar': return <GrammarChecker t={t} />;
                case 'courses': return <CourseRecommender t={t} initialSkills={courseSkills} clearInitialSkills={() => setCourseSkills(null)} language={language} />;
                default: return <ResumeAnalyzer t={t} language={language} onNavigateToCourses={handleNavigateToCourses} savedJobs={savedJobs} handleToggleSaveJob={handleToggleSaveJob} />;
            }
        }
        if (section === 'opportunities') {
            switch(subPage) {
                case 'jobs': return <LiveJobs t={t} savedJobs={savedJobs} handleToggleSaveJob={handleToggleSaveJob} alertMessage={alertMessage} user={currentUser} />;
                case 'salary': return <SalaryPredictor t={t} />;
                default: return <LiveJobs t={t} savedJobs={savedJobs} handleToggleSaveJob={handleToggleSaveJob} alertMessage={alertMessage} user={currentUser} />;
            }
        }
         if (section === 'info') {
            switch(subPage) {
                case 'about': return <AboutUs t={t} />;
                case 'feedback': return <FeedbackPage t={t} user={currentUser} />;
                default: return <AboutUs t={t} />;
            }
        }
        if (section === 'profile') {
            return <ProfilePage t={t} user={currentUser} onUpdateUser={handleUpdateUser} />;
        }
        return renderTrendsContent();
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} language={language} onLanguageChange={handleSetLanguage} t={t} />;
    }
    
    const currentSectionConfig = navigationConfig[activeView.section];
    // FIX: Removed casting by providing a type for `navigationConfig`, ensuring type-safe access.
    const pageTitle = t(currentSectionConfig.subPages[activeView.subPage].labelKey);

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-zinc-950 font-sans flex">
            <Sidebar user={currentUser} activeSection={activeView.section} onSectionChange={handleSectionChange} onLogout={handleLogout} t={t} />
            <div className="flex-1 flex flex-col transition-all duration-300">
                <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <SkillScopeLogo className="h-8 w-8" />
                        <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{pageTitle}</h1>
                    </div>
                     <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="relative">
                            <LanguageIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none" />
                            <select
                                value={language}
                                onChange={(e) => handleSetLanguage(e.target.value)}
                                aria-label={t('language.select.label')}
                                className="bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg focus:ring-primary focus:border-primary pl-10 pr-4 py-2 text-sm appearance-none"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {currentSectionConfig.subPages && Object.keys(currentSectionConfig.subPages).length > 1 && (
                        <SubNavBar
                            tabs={Object.entries(currentSectionConfig.subPages).map(([key, value]) => ({
                                key,
                                label: t(value.labelKey)
                            }))}
                            activeTab={activeView.subPage}
                            onTabClick={(subPage) => handleNavigate(activeView.section, subPage)}
                        />
                    )}
                    <div className="mt-8">
                        {renderPage()}
                    </div>
                </main>
                <footer className="text-center p-4 text-zinc-500 dark:text-zinc-400 text-sm">
                </footer>
            </div>
             {/* Chatbot and FAB */}
            <div className="fixed bottom-6 right-6 z-40">
                <button 
                    onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-110 hover:shadow-glow-primary"
                    aria-label="Toggle AI Assistant"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8"/>
                </button>
            </div>
            {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} language={language} t={t} />}
        </div>
    );
};

export default App;
