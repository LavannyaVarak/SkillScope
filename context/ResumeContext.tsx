import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ResumeAnalysis } from '../types';

// Define the shape of the context data
interface ResumeContextType {
  resumeText: string;
  setResumeText: React.Dispatch<React.SetStateAction<string>>;
  jobDescription: string;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  analysis: ResumeAnalysis | null;
  setAnalysis: React.Dispatch<React.SetStateAction<ResumeAnalysis | null>>;
  activeAction: string | null;
  setActiveAction: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the context with an undefined default value
export const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Helper function to get initial state from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};


// Create the provider component
export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeText, setResumeText] = useState<string>(() => getInitialState<string>('skillscope_resumeText', ''));
  const [jobDescription, setJobDescription] = useState<string>(() => getInitialState<string>('skillscope_jobDescription', ''));
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(() => getInitialState<ResumeAnalysis | null>('skillscope_analysis', null));
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Effect to save resumeText to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('skillscope_resumeText', JSON.stringify(resumeText));
    } catch (error) {
      console.warn('Error setting resumeText in localStorage:', error);
    }
  }, [resumeText]);
  
  // Effect to save jobDescription to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('skillscope_jobDescription', JSON.stringify(jobDescription));
    } catch (error) {
      console.warn('Error setting jobDescription in localStorage:', error);
    }
  }, [jobDescription]);

  // Effect to save analysis to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('skillscope_analysis', JSON.stringify(analysis));
    } catch (error) {
      console.warn('Error setting analysis in localStorage:', error);
    }
  }, [analysis]);


  const value = {
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    analysis,
    setAnalysis,
    activeAction,
    setActiveAction
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
