
import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import { analyzeResume, getCourseRecommendations, getCareerPath, getGroundedJobs } from '../services/geminiService';
import { ResumeAnalysis, CourseRecommendationData, CareerPathData, GroundedJobsResult, MissingSkill, JobOpening } from '../types';
import Loader from './Loader';
import { UploadIcon, DownloadIcon, SparklesIcon, BriefcaseIcon, AcademicCapIcon, BookmarkSquareIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, ArrowTopRightOnSquareIcon, ShareIcon, BookmarkIconFilled, InformationCircleIcon } from './Icon';
import * as pdfjsLib from 'pdfjs-dist';
import CourseRecommender from './CourseRecommender';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useResume } from '../context/ResumeContext';


// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// Add mammoth to the window interface for TypeScript
declare global {
    interface Window {
        mammoth: any;
    }
}

const GroundedJobsDisplay: React.FC<{
  result: GroundedJobsResult;
  targetRole: string;
  location: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  savedJobs: JobOpening[];
  handleToggleSaveJob: (job: JobOpening) => void;
}> = ({ result, targetRole, location, t, savedJobs, handleToggleSaveJob }) => {
  return (
    <div className="space-y-8">
      <Card>
        <h3 className="text-xl font-bold mb-4 flex items-center">
            <BriefcaseIcon className="w-6 h-6 mr-2 text-primary"/>
            {t('resume.jobs.title', { targetRole })}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 -mt-3 mb-4">{t('resume.jobs.source', { location })}</p>
        <div className="space-y-4">
            {result.jobs.length > 0 ? result.jobs.map((job) => (
                <div key={job.id} className="bg-neutral-100 dark:bg-zinc-950 p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{job.jobTitle}</h4>
                            <p className="text-sm font-semibold text-primary">{job.companyName} - <span className="text-zinc-600 dark:text-zinc-400 font-normal">{job.location}</span></p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                             <button onClick={() => handleToggleSaveJob(job)} title={t('jobs.job.saved')} className="p-2 rounded-full bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition">
                                {savedJobs.some(saved => saved.id === job.id) ? <BookmarkIconFilled className="w-5 h-5 text-primary"/> : <BookmarkSquareIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                     <button onClick={() => job.url && window.open(job.url, '_blank', 'noopener,noreferrer')} className="mt-3 inline-flex items-center gap-2 text-sm bg-secondary hover:bg-secondary-focus text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:shadow-glow-secondary">
                        {t('resume.jobs.apply')} <ArrowTopRightOnSquareIcon className="w-4 h-4"/>
                    </button>
                </div>
            )) : <p className="text-center text-zinc-500 dark:text-zinc-400">{t('resume.jobs.none')}</p>}
        </div>
      </Card>

      {result.places.length > 0 && (
          <Card>
            <h3 className="text-xl font-bold mb-4">{t('resume.places.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.places.map((place, index) => (
                    <a href={place.uri} key={index} target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-100 dark:bg-zinc-950 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                       <p className="font-semibold text-primary">{place.name}</p>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('resume.places.mapsLink')}</p>
                    </a>
                ))}
            </div>
          </Card>
      )}

       {result.sources.length > 0 && (
          <Card>
            <h3 className="text-xl font-bold mb-4">{t('resume.sources.title')}</h3>
             <ul className="space-y-2">
                {result.sources.map((source, index) => (
                    <li key={index}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                            {index + 1}. {source.title}
                        </a>
                    </li>
                ))}
            </ul>
          </Card>
      )}
    </div>
  );
};

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


interface ResumeAnalyzerProps {
    language: string;
    onNavigateToCourses: (skills: string[]) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    savedJobs: JobOpening[];
    handleToggleSaveJob: (job: JobOpening) => void;
}

const AtsScoreProgress: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 70 ? 'text-accent-lime' : score > 40 ? 'text-secondary' : 'text-red-400';

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32">
                <circle className="text-zinc-200 dark:text-zinc-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="64" cy="64" />
                <circle
                    className={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="64"
                    cy="64"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    transform="rotate(-90 64 64)"
                />
            </svg>
            <span className={`absolute text-3xl font-bold ${color}`}>{score}%</span>
        </div>
    );
};

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ language, t, savedJobs, handleToggleSaveJob }) => {
  const {
    resumeText, setResumeText,
    jobDescription, setJobDescription,
    analysis, setAnalysis,
    activeAction, setActiveAction
  } = useResume();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFileParsing, setIsFileParsing] = useState(false);
  const [fileSuccessMessage, setFileSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [courseRecs, setCourseRecs] = useState<CourseRecommendationData | null>(null);
  const [careerPath, setCareerPath] = useState<CareerPathData | null>(null);
  const [groundedJobs, setGroundedJobs] = useState<GroundedJobsResult | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchJobs = async (coords: { lat: number; lon: number } | null) => {
        if (!careerPath || !analysis) return;
        setIsJobsLoading(true);
        setGroundedJobs(null);
        setShowLocationPrompt(false);
        try {
            const userLocation = coords ? { latitude: coords.lat, longitude: coords.lon } : null;
            const locationName = analysis.location;
            const result = await getGroundedJobs(careerPath.targetRole.role, locationName, userLocation, language);
            setGroundedJobs(result);
        } catch (err) {
            setError(t('resume.jobs.error.fetch'));
            console.error(err);
        } finally {
            setIsJobsLoading(false);
        }
    };

    const handleAllowLocation = () => {
        setShowLocationPrompt(false);
        if (navigator.geolocation) {
            setIsJobsLoading(true);
            setGroundedJobs(null);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchJobs({ lat: position.coords.latitude, lon: position.coords.longitude });
                },
                (error) => {
                    console.warn("Geolocation denied in browser prompt:", error.message);
                    fetchJobs(null); // Fetch without location if they deny the native prompt
                }
            );
        } else {
            fetchJobs(null); // Fallback if geolocation is not supported
        }
    };

    const handleSkipLocation = () => {
        setShowLocationPrompt(false);
        fetchJobs(null);
    };
  
  useEffect(() => {
    const initiateJobSearch = async () => {
        if (careerPath && analysis && activeAction === 'careerPath') {
            setGroundedJobs(null); // Clear previous results
            
            if (navigator.geolocation && navigator.permissions) {
                try {
                    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                    if (permissionStatus.state === 'granted') {
                        handleAllowLocation();
                    } else if (permissionStatus.state === 'prompt') {
                        setShowLocationPrompt(true);
                        setIsJobsLoading(false); // Hide generic loader for our custom prompt
                    } else { // 'denied'
                        fetchJobs(null);
                    }
                } catch (permError) {
                    console.warn("Could not query permissions, falling back to direct request.", permError);
                    setShowLocationPrompt(true); // Fallback to showing prompt if query fails
                    setIsJobsLoading(false);
                }
            } else {
                console.warn("Geolocation/Permissions API not supported.");
                fetchJobs(null);
            }
        }
    };
    initiateJobSearch();
  }, [careerPath, analysis, activeAction, language]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileSuccessMessage('');
    setIsFileParsing(true);

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(t('resume.file.error.large', { size: MAX_SIZE_MB }));
        setIsFileParsing(false);
        if (event.target) event.target.value = '';
        return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'doc' || file.type === 'application/msword') {
         setError(t('resume.file.error.doc'));
         setIsFileParsing(false);
         if (event.target) event.target.value = '';
         return;
    }

    const supportedExtensions = ['txt', 'pdf', 'docx'];
    if (!supportedExtensions.includes(fileExtension || '')) {
        setError(t('resume.file.error.type'));
        setIsFileParsing(false);
        if (event.target) event.target.value = '';
        return;
    }

    try {
        let extractedText = '';
        const arrayBuffer = await file.arrayBuffer();

        if (fileExtension === 'txt') {
            const decoder = new TextDecoder();
            extractedText = decoder.decode(arrayBuffer);
        } else if (fileExtension === 'pdf') {
            const typedArray = new Uint8Array(arrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                fullText += pageText + '\n';
            }
            extractedText = fullText;
        } else if (fileExtension === 'docx') {
            if (!window.mammoth) {
                throw new Error("Word document parser (mammoth.js) is not loaded. Please check your internet connection and refresh.");
            }
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
        }

        setResumeText(extractedText);
        setFileSuccessMessage(t('resume.file.success', { fileName: file.name }));
        setTimeout(() => setFileSuccessMessage(''), 4000);

    } catch (e: any) {
        console.error("Failed to parse file:", e);
        setError(t('resume.file.error.read'));
    } finally {
        setIsFileParsing(false);
        if (event.target) {
            event.target.value = '';
        }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      setError(t('resume.error.empty'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setActiveAction(null);
    setCourseRecs(null);
    setCareerPath(null);
    setGroundedJobs(null);
    setShowLocationPrompt(false);
    try {
      const result = await analyzeResume(resumeText, jobDescription, language);
      setAnalysis(result);
    } catch (err) {
      setError(t('resume.error.fail'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleActionClick = async (action: 'courses' | 'careerPath') => {
      if (!analysis) return;
      
      if (activeAction === action) {
          setActiveAction(null);
          return;
      }
      setActiveAction(action);
      setIsActionLoading(true);
      setError(null);

      try {
          const skillsToLearn = analysis.missingSkills.map(s => s.skill);
          if (action === 'courses') {
              if (!courseRecs) {
                 const data = await getCourseRecommendations(skillsToLearn, analysis.primaryDomain, language);
                 setCourseRecs(data);
              }
          } else if (action === 'careerPath') {
              if (!careerPath) {
                 const data = await getCareerPath(analysis.matchingSkills, skillsToLearn, analysis.primaryDomain, language);
                 setCareerPath(data);
                 // The useEffect will now trigger to check for location and fetch jobs
              }
          }
      } catch (err) {
          setError(t('resume.error.action.fail', { action }));
      } finally {
        setIsActionLoading(false);
      }
  };

  return (
      <div className="space-y-8">
        <Card>
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{t('resume.title')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{t('resume.description')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder={t('resume.placeholder.resume')}
                    className="w-full h-48 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition resize-none"
                />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.pdf,.doc,.docx" className="hidden" />
                <div className="mt-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isFileParsing} className="w-full flex items-center justify-center gap-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-zinc-500 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed">
                        {isFileParsing ? <Loader /> : <UploadIcon className="w-5 h-5"/>}
                        {isFileParsing ? t('resume.parsing') : t('resume.upload')}
                    </button>
                </div>
                {fileSuccessMessage && <div className="mt-2 text-center text-accent-lime text-sm animate-fade-in">{fileSuccessMessage}</div>}
                </div>
                <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t('resume.placeholder.job')}
                className="w-full h-full bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition resize-none"
                />
            </div>

            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary disabled:bg-zinc-500 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
            >
                {isLoading ? <Loader /> : t('resume.button.analyze')}
            </button>

            {error && <div className="mt-4 text-center text-red-500 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
        </Card>
        
        <div ref={reportRef} className="dark:bg-zinc-950 p-4 rounded-lg">
        {analysis && (
            <div className="space-y-8 animate-fade-in">
                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('resume.results.title')}</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('resume.results.tagline')}</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="text-center col-span-1">
                            <h3 className="text-lg font-semibold mb-2">{t('resume.results.atsScore')}</h3>
                            <AtsScoreProgress score={analysis.atsScore} />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{t('resume.results.atsDescription')}</p>
                        </div>
                        <div className="col-span-2 space-y-4">
                            <div>
                                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center mb-2"><CheckCircleIcon className="w-5 h-5 mr-2"/>{t('resume.results.strongSkills')}</h4>
                                <div className="flex flex-wrap gap-2">
                                {analysis.matchingSkills.map(s => <span key={s} className="px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-full">{s}</span>)}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center mb-2"><XCircleIcon className="w-5 h-5 mr-2"/>{t('resume.results.missingSkills')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.missingSkills.map((s: MissingSkill) => (
                                        <div key={s.skill} className="relative group">
                                            <span className="px-3 py-1 text-sm font-medium bg-red-500/20 text-red-500 dark:bg-red-400/20 dark:text-red-400 rounded-full cursor-help flex items-center gap-1.5">
                                                {s.skill}
                                                <InformationCircleIcon className="w-4 h-4 opacity-70" />
                                            </span>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10">
                                                <p className="font-bold text-primary mb-1">{t('resume.results.whyImportant')}</p>
                                                <p>{s.explanation}</p>
                                                {/* Arrow */}
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900 dark:border-t-zinc-800"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('resume.action.title')}</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">{t('resume.action.description')}</p>
                    <div className="flex flex-col md:flex-row justify-center items-stretch gap-4 md:gap-8">
                        <div onClick={() => handleActionClick('courses')} 
                            className={`w-full md:w-2/5 p-6 text-center cursor-pointer border-2 rounded-lg transition-all transform flex flex-col bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800 ${
                                activeAction === 'courses' 
                                ? 'border-primary scale-105 shadow-glow-primary' 
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-primary hover:scale-105'
                            }`}
                        >
                            <BookmarkSquareIcon className="w-10 h-10 mx-auto text-primary mb-3"/>
                            <h3 className="font-bold text-lg">{t('resume.action.courses.title')}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex-grow">{t('resume.action.courses.description')}</p>
                        </div>
                        <div onClick={() => handleActionClick('careerPath')} 
                            className={`w-full md:w-2/5 p-6 text-center cursor-pointer border-2 rounded-lg transition-all transform flex flex-col bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800 ${
                                activeAction === 'careerPath'
                                ? 'border-primary scale-105 shadow-glow-primary'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-primary hover:scale-105'
                            }`}
                        >
                            <SparklesIcon className="w-10 h-10 mx-auto text-primary mb-3"/>
                            <h3 className="font-bold text-lg">{t('resume.action.career.title')}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex-grow">{t('resume.action.career.description')}</p>
                        </div>
                    </div>
                </Card>
                
                <div className="space-y-8 animate-fade-in-up">
                    {isActionLoading && <div className="flex justify-center items-center h-40"><Loader /></div>}
                    
                    {(activeAction === 'courses' || activeAction === '__PRINT_ALL__') && !isActionLoading && courseRecs && (
                        <CourseRecommender t={t} initialSkills={null} clearInitialSkills={() => {}} recommendations={courseRecs} language={language}/>
                    )}
                    
                    {(activeAction === 'careerPath' || activeAction === '__PRINT_ALL__') && !isActionLoading && careerPath && (
                        <div className="space-y-8">
                            <Card>
                                <h3 className="text-xl font-bold mb-4 flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-primary"/>{t('resume.careerPath.title')}</h3>
                                <CareerPathVisualizer data={careerPath} t={t} />
                            </Card>

                             {showLocationPrompt && (
                                <Card className="text-center animate-fade-in border-primary border-2">
                                     <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">{t('resume.location.title')}</h3>
                                     <p className="text-zinc-600 dark:text-zinc-400 mb-4">{t('resume.location.description')}</p>
                                     <div className="flex justify-center gap-4">
                                         <button onClick={handleAllowLocation} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary">{t('resume.location.allow')}</button>
                                         <button onClick={handleSkipLocation} className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold py-2 px-6 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition">{t('resume.location.skip')}</button>
                                     </div>
                                </Card>
                            )}
                            
                            {isJobsLoading && <div className="flex justify-center items-center h-40"><Loader /></div>}
                            
                            {groundedJobs && (
                                <GroundedJobsDisplay result={groundedJobs} targetRole={careerPath.targetRole.role} location={analysis.location} t={t} savedJobs={savedJobs} handleToggleSaveJob={handleToggleSaveJob}/>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default ResumeAnalyzer;