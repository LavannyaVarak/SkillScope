

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getLiveJobs } from '../services/geminiService';
import { JobOpening, User } from '../types';
import Loader from './Loader';
import { BriefcaseIcon, XIcon, BellIcon, BookmarkSquareIcon, BookmarkIconFilled, TrashIcon, ClockIcon, ArrowTopRightOnSquareIcon, ClipboardIcon, CheckIcon, DevicePhoneMobileIcon, AtSymbolIcon } from './Icon';
import { INDUSTRIES } from '../constants';
import { sendJobAlertSetup } from '../services/notificationService';

interface JobAlert {
    id: string;
    location: string;
    domain: string;
    industry: string;
    jobType: string;
    experienceLevel: string;
    contactMethod?: 'email' | 'sms';
    contactDestination?: string;
}

interface LiveJobsProps {
    t: (key: string, params?: Record<string, string | number>) => string;
    savedJobs: JobOpening[];
    handleToggleSaveJob: (job: JobOpening) => void;
    alertMessage: string;
    user: User | null;
}

const JobDetailModal: React.FC<{ 
    job: JobOpening; 
    onClose: () => void; 
    t: (key: string, params?: Record<string, string | number>) => string;
    onApplyNow: (job: JobOpening) => void;
    onCopyLink: (url: string, jobId: string) => void;
    isCopied: boolean;
}> = ({ job, onClose, t, onApplyNow, onCopyLink, isCopied }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{job.jobTitle}</h3>
                        <p className="text-lg text-zinc-600 dark:text-zinc-300 font-semibold">{job.companyName} - <span className="font-normal">{job.location}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700">
                        <XIcon className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
                    </button>
                </div>
                 <div className="flex flex-wrap gap-2 text-xs mb-4">
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded-full">{job.jobType}</span>
                    <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">{job.experienceRequired}</span>
                    <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">{t('jobs.postedOn', { date: job.postedDate })}</span>
                </div>
                
                <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                    <div>
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">{t('jobs.modal.description')}</h4>
                        <p>{job.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">{t('jobs.modal.skills')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">{t('jobs.modal.qualifications')}</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {job.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                     <div className="mt-6 flex flex-col sm:flex-row gap-2">
                        <button onClick={() => onApplyNow(job)} className="w-full flex-grow flex items-center justify-center gap-2 text-center bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-focus transition-all duration-300 hover:shadow-glow-secondary">
                            {t('jobs.applyNow')} <ArrowTopRightOnSquareIcon className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => onCopyLink(job.url, job.id)}
                            disabled={isCopied}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold py-3 px-4 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-70"
                        >
                            {isCopied ? (
                                <><CheckIcon className="w-5 h-5 text-green-500"/> {t('jobs.copied')}</>
                            ) : (
                                <><ClipboardIcon className="w-5 h-5"/> {t('jobs.copyLink')}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Alert Configuration Modal
const AlertConfigModal: React.FC<{
    onClose: () => void;
    onConfirm: (method: 'email' | 'sms', contact: string) => void;
    domain: string;
    t: (key: string, params?: Record<string, string | number>) => string;
    user: User | null;
}> = ({ onClose, onConfirm, domain, t, user }) => {
    const [method, setMethod] = useState<'email' | 'sms'>('email');
    const [contact, setContact] = useState('');

    useEffect(() => {
        if (user) {
            if (method === 'email') setContact(user.email);
            else if (method === 'sms') setContact(user.phone);
        }
    }, [method, user]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{t('jobs.alert.modal.title')}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">{t('jobs.alert.modal.desc', { domain })}</p>

                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={() => setMethod('email')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            method === 'email' 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                    >
                        <AtSymbolIcon className="w-6 h-6"/>
                        <span className="font-semibold">{t('jobs.alert.modal.email')}</span>
                    </button>
                    <button 
                        onClick={() => setMethod('sms')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            method === 'sms' 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                    >
                        <DevicePhoneMobileIcon className="w-6 h-6"/>
                        <span className="font-semibold">{t('jobs.alert.modal.sms')}</span>
                    </button>
                </div>

                <div className="mb-6">
                    <input 
                        type={method === 'email' ? 'email' : 'tel'} 
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={method === 'email' ? t('jobs.alert.modal.placeholder.email') : t('jobs.alert.modal.placeholder.phone')}
                        className="w-full p-3 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-primary focus:border-primary transition"
                    />
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 px-4 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition">
                        {t('jobs.alert.modal.cancel')}
                    </button>
                    <button 
                        onClick={() => onConfirm(method, contact)}
                        disabled={!contact}
                        className="flex-1 py-3 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary-focus transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('jobs.alert.modal.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LiveJobs: React.FC<LiveJobsProps> = ({ t, savedJobs, handleToggleSaveJob, alertMessage, user }) => {
  const [location, setLocation] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState('all');
  const [jobType, setJobType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  const [jobAlert, setJobAlert] = useState<JobAlert | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [recentSearches, setRecentSearches] = useState<JobAlert[]>([]);
  
  const [locationInput, setLocationInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  
  const [appliedFilters, setAppliedFilters] = useState({ location: '', skill: '' });

  const [jobAlertConfirmation, setJobAlertConfirmation] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [showConfigModal, setShowConfigModal] = useState(false);

  // Load state from localStorage on initial render
  useEffect(() => {
     try {
        const lastSearch = localStorage.getItem('skillscope_lastJobSearch');
        if(lastSearch) {
            const { location, domain, industry, jobType, experienceLevel } = JSON.parse(lastSearch);
            setLocation(location || '');
            setDomain(domain || '');
            setIndustry(industry || 'all');
            setJobType(jobType || 'all');
            setExperienceLevel(experienceLevel || 'all');
        }
        const savedAlert = localStorage.getItem('skillscope_jobAlert');
        if (savedAlert) setJobAlert(JSON.parse(savedAlert));
        
        const localRecentSearches = localStorage.getItem('skillscope_recentSearches');
        if (localRecentSearches) setRecentSearches(JSON.parse(localRecentSearches));

      } catch(e) { console.error("Failed to parse from localStorage", e); }
  }, []);

  const runSearch = async (searchParams: { location: string, domain: string, industry: string, jobType: string, experienceLevel: string }) => {
    setIsLoading(true);
    setError(null);
    setJobs([]);
    setLocationInput('');
    setSkillInput('');
    setAppliedFilters({ location: '', skill: '' });
    try {
      const results = await getLiveJobs(searchParams.location, searchParams.domain, searchParams.jobType, searchParams.experienceLevel, searchParams.industry);
      setJobs(results);
      setActiveTab('search');
    } catch (err) {
      setError(t('jobs.error.fetch'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!location || !domain) {
      setError(t('jobs.error.missingInfo'));
      return;
    }
    
    const currentSearch = { location, domain, industry, jobType, experienceLevel };
    
    const newSearchEntry: JobAlert = {
        id: `${location.trim()}-${domain.trim()}-${industry}-${jobType}-${experienceLevel}`.toLowerCase().replace(/\s+/g, '-'),
        ...currentSearch
    };
    
    setRecentSearches(prev => {
        const others = prev.filter(s => s.id !== newSearchEntry.id);
        const updated = [newSearchEntry, ...others].slice(0, 5);
        localStorage.setItem('skillscope_recentSearches', JSON.stringify(updated));
        return updated;
    });

    localStorage.setItem('skillscope_lastJobSearch', JSON.stringify(currentSearch));
    await runSearch(currentSearch);
  };

  const handleRecentSearchClick = (search: JobAlert) => {
    setLocation(search.location);
    setDomain(search.domain);
    setIndustry(search.industry);
    setJobType(search.jobType);
    setExperienceLevel(search.experienceLevel);
    runSearch(search);
  };

  const showAndHideJobAlertConfirmation = (message: string) => {
      setJobAlertConfirmation(message);
      setTimeout(() => setJobAlertConfirmation(''), 4000);
  };
  
  const handleEnableAlertClick = () => {
      if(jobAlert) {
          // Disable
          setJobAlert(null);
          localStorage.removeItem('skillscope_jobAlert');
          showAndHideJobAlertConfirmation(t('jobs.alert.disabled'));
      } else {
          // Enable - Show Modal
          if (!location || !domain) {
              showAndHideJobAlertConfirmation(t('jobs.error.setAlert'));
              return;
          }
          setShowConfigModal(true);
      }
  };

  const handleConfirmAlert = async (method: 'email' | 'sms', contact: string) => {
      setShowConfigModal(false);
      const newAlert: JobAlert = { 
          id: Date.now().toString(), 
          location, 
          domain, 
          industry, 
          jobType, 
          experienceLevel,
          contactMethod: method,
          contactDestination: contact
      };
      
      setJobAlert(newAlert);
      localStorage.setItem('skillscope_jobAlert', JSON.stringify(newAlert));
      
      // Call service to "send" the alert setup confirmation
      await sendJobAlertSetup(newAlert, method, contact);

      showAndHideJobAlertConfirmation(t('jobs.alert.enabled', { destination: contact }));
  };
  
  const handleApplyNow = (job: JobOpening) => {
      window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (url: string, jobId: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
        setCopiedJobId(jobId);
        setTimeout(() => {
            setCopiedJobId(null);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy URL: ', err);
    });
  };
  
  const isJobSaved = (jobId: string) => savedJobs.some(job => job.id === jobId);

  const handleApplyFilters = () => {
    setAppliedFilters({ location: locationInput, skill: skillInput });
  };

  const handleClearFilters = () => {
    setLocationInput('');
    setSkillInput('');
    setAppliedFilters({ location: '', skill: '' });
  };

  const sortedAndFilteredJobs = jobs
    .filter(job => {
        const locationMatch = appliedFilters.location
        ? job.location.toLowerCase().includes(appliedFilters.location.toLowerCase().trim())
        : true;
        const skillMatch = appliedFilters.skill
        ? job.skills.some(skill => skill.toLowerCase().includes(appliedFilters.skill.toLowerCase().trim()))
        : true;
        return locationMatch && skillMatch;
    })
    .sort((a, b) => {
        const dateA = new Date(a.postedDate).getTime();
        const dateB = new Date(b.postedDate).getTime();

        if (sortOrder === 'oldest') {
            return dateA - dateB;
        }
        return dateB - dateA;
    });

  return (
    <div className="space-y-8">
      {showConfigModal && (
          <AlertConfigModal 
            onClose={() => setShowConfigModal(false)} 
            onConfirm={handleConfirmAlert} 
            domain={domain} 
            t={t}
            user={user}
          />
      )}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} t={t} onApplyNow={handleApplyNow} onCopyLink={handleCopyLink} isCopied={copiedJobId === selectedJob.id} />}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('jobs.title')}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{t('jobs.description')}</p>
        
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('jobs.placeholder.location')} className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition" required />
            <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={t('jobs.placeholder.domain')} className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition" required />
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition">
                <option value="all">{t('jobs.filter.industry.all')}</option>
                {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{t(`industry.${ind.toLowerCase()}`)}</option>
                ))}
            </select>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition">
                <option value="all">{t('jobs.filter.exp.all')}</option>
                <option value="entry-level">{t('jobs.filter.exp.entry-level')}</option>
                <option value="mid-level">{t('jobs.filter.exp.mid-level')}</option>
                <option value="senior">{t('jobs.filter.exp.senior')}</option>
            </select>
            <div className="bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-1.5 flex items-center gap-1 lg:col-span-2">
                {['all', 'Full-time', 'Internship'].map(type => (
                    <button type="button" key={type} onClick={() => setJobType(type)} className={`w-full h-full rounded-md text-sm font-semibold transition ${jobType === type ? 'bg-primary text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}>
                        {t(`jobs.filter.type.${type.toLowerCase()}`)}
                    </button>
                ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <button type="submit" disabled={isLoading} className="w-full flex-grow bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary-focus transition-all duration-300 hover:shadow-glow-secondary disabled:bg-zinc-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center">
              {isLoading ? <Loader /> : t('jobs.search')}
            </button>
            <button type="button" onClick={handleEnableAlertClick} className={`w-full md:w-auto font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${jobAlert ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary-focus text-white'}`}>
              <BellIcon className="w-5 h-5"/> {jobAlert ? t('jobs.alert.disable') : t('jobs.alert.enable')}
            </button>
          </div>
        </form>
        
        {jobAlertConfirmation && <div className="mt-4 text-center text-accent-lime p-3 bg-accent-lime/20 rounded-lg animate-fade-in font-semibold">{jobAlertConfirmation}</div>}
        {alertMessage && <div className="mt-4 text-center text-accent-lime p-3 bg-accent-lime/20 rounded-lg animate-fade-in">{alertMessage}</div>}
        {error && <div className="mt-4 text-center text-red-500 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
      </Card>

      {recentSearches.length > 0 && (
          <Card>
              <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-primary" />
                  {t('jobs.recentSearches.title')}
              </h3>
              <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                      <button
                          key={search.id}
                          onClick={() => handleRecentSearchClick(search)}
                          className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/20 hover:text-primary transition"
                      >
                          {search.domain} in {search.location}
                      </button>
                  ))}
              </div>
          </Card>
      )}
      
      {jobAlert && (
          <Card>
              <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><BellIcon className="w-6 h-6 text-primary"/> {t('jobs.alert.activeTitle')}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {t('jobs.alert.activeDesc', { 
                    domain: jobAlert.domain, 
                    location: jobAlert.location, 
                    industry: t(`industry.${jobAlert.industry.toLowerCase()}`),
                    type: t(`jobs.filter.type.${jobAlert.jobType.toLowerCase()}`), 
                    exp: t(`jobs.filter.exp.${jobAlert.experienceLevel.toLowerCase()}`) 
                })}
              </p>
          </Card>
      )}

      {/* TABS */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button onClick={() => setActiveTab('search')} className={`py-2 px-4 font-semibold ${activeTab === 'search' ? 'text-primary border-b-2 border-primary' : 'text-zinc-500 dark:text-zinc-400'}`}>{t('jobs.tab.searchResults')}</button>
        <button onClick={() => setActiveTab('saved')} className={`py-2 px-4 font-semibold flex items-center gap-2 ${activeTab === 'saved' ? 'text-primary border-b-2 border-primary' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {t('jobs.tab.savedJobs')} <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{savedJobs.length}</span>
        </button>
      </div>

      {activeTab === 'search' && jobs.length > 0 && (
        <div className="mb-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder={t('jobs.filter.byLocation')}
                    className="w-full sm:flex-1 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                />
                <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder={t('jobs.filter.bySkill')}
                    className="w-full sm:flex-1 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={handleApplyFilters} className="w-full sm:w-auto flex-grow bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">
                        {t('jobs.filter.apply')}
                    </button>
                    <button onClick={handleClearFilters} className="w-full sm:w-auto bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold py-2 px-4 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                        {t('jobs.filter.clear')}
                    </button>
                </div>
                <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full sm:w-auto bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                    aria-label={t('jobs.sort.label')}
                >
                    <option value="newest">{t('jobs.sort.newest')}</option>
                    <option value="oldest">{t('jobs.sort.oldest')}</option>
                </select>
            </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center items-center h-40"><Loader /></div>}

      <div className="space-y-6">
        {/* Search Results */}
        {activeTab === 'search' && !isLoading && (
            jobs.length > 0 ? (
                sortedAndFilteredJobs.length > 0 ? sortedAndFilteredJobs.map((job) => (
                <Card key={job.id} className="animate-fade-in-up hover:border-primary border-transparent transition-all">
                    <div className="flex justify-between items-start gap-4">
                        <div onClick={() => setSelectedJob(job)} className="cursor-pointer flex-1">
                            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 pr-10">{job.jobTitle}</h4>
                            <p className="text-md text-zinc-600 dark:text-zinc-400 font-semibold">{job.companyName} - <span className="font-normal">{job.location}</span></p>
                            <div className="flex flex-wrap gap-2 text-xs my-3">
                                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full">{job.jobType}</span>
                                <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">{job.experienceRequired}</span>
                                <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">{t('jobs.postedOn', { date: job.postedDate })}</span>
                            </div>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                             <button onClick={() => handleToggleSaveJob(job)} title={t('jobs.job.saved')} className="p-2 rounded-full bg-neutral-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition">
                                {isJobSaved(job.id) ? <BookmarkIconFilled className="w-5 h-5 text-primary"/> : <BookmarkSquareIcon className="w-5 h-5"/>}
                            </button>
                            <div className="flex flex-col gap-2 items-stretch w-full">
                                <button onClick={() => handleApplyNow(job)} className="w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 bg-secondary text-white hover:bg-secondary-focus">
                                  {t('jobs.applyNow')}
                                </button>
                                <button 
                                    onClick={() => handleCopyLink(job.url, job.id)}
                                    disabled={copiedJobId === job.id}
                                    className="w-full text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:bg-green-100 dark:disabled:bg-green-900/50 disabled:text-green-600 dark:disabled:text-green-400"
                                >
                                    {copiedJobId === job.id ? (
                                        <><CheckIcon className="w-4 h-4"/> {t('jobs.copied')}</>
                                    ) : (
                                        <><ClipboardIcon className="w-4 h-4"/> {t('jobs.copyLink')}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
                )) : <p className="text-center text-zinc-500 dark:text-zinc-400">{t('jobs.noFilterResults')}</p>
            ) : <p className="text-center text-zinc-500 dark:text-zinc-400">{t('jobs.noResults')}</p>
        )}

        {/* Saved Jobs */}
        {activeTab === 'saved' && (
            savedJobs.length > 0 ? savedJobs.map((job) => (
             <Card key={job.id} className="animate-fade-in-up hover:border-primary border-transparent transition relative">
                <div className="absolute top-4 right-4">
                    <button onClick={() => handleToggleSaveJob(job)} className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-500 dark:text-red-400 transition">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div onClick={() => setSelectedJob(job)} className="cursor-pointer pr-10">
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{job.jobTitle}</h4>
                    <p className="text-md text-zinc-600 dark:text-zinc-400 font-semibold">{job.companyName} - <span className="font-normal">{job.location}</span></p>
                </div>
                 <div className="mt-4">
                    <button onClick={() => handleApplyNow(job)} className="w-full sm:w-auto text-sm font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 bg-secondary text-white hover:bg-secondary-focus">
                        {t('jobs.applyNow')}
                    </button>
                 </div>
            </Card>
            )) : <p className="text-center text-zinc-500 dark:text-zinc-400">{t('jobs.noSavedJobs')}</p>
        )}
      </div>
    </div>
  );
};

export default LiveJobs;
