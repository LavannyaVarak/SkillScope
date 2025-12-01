
export interface Skill {
  skill: string;
  demand: number;
  trend: number;
}

export interface IndustryTrendData {
  topSkills: Skill[];
  jobTitles: string[];
  annualGrowthRate: number;
}

export interface ExtractedExperience {
  jobTitle: string;
  company: string;
  duration: string;
  summary: string;
}

export interface MissingSkill {
    skill: string;
    explanation: string;
}

export interface ResumeAnalysis {
  matchingSkills: string[];
  missingSkills: MissingSkill[];
  improvementSuggestions: string[];
  atsScore: number;
  extractedSkills: string[];
  extractedExperience: ExtractedExperience[];
  extractedEducation: string[];
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Expert';
  primaryDomain: string;
  location: string;
}

export interface SalaryPrediction {
  salaryRange: {
    low: number;
    high: number;
  };
  analysis: string;
}

export interface SkillsForecastData {
  predictedSkills: Skill[];
  futureProofTips: string[];
}

export interface JobOpening {
    id: string; // Added for unique identification
    companyName: string;
    jobTitle: string;
    location: string;
    skills: string[];
    description: string;
    qualifications: string[];
    experienceRequired: string;
    jobType: 'Full-time' | 'Internship' | 'Contract' | 'Part-time';
    postedDate: string; // e.g., "2024-07-21"
    url: string; // Link to the job posting
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  location: string;
  username: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  profilePicture?: string; // Base64 string for profile image
}

export interface IndustryComparisonDetail {
  industry: string;
  details: string;
}

export interface ComparisonFactor {
  factor: string;
  comparisonDetails: IndustryComparisonDetail[];
  analysis: string;
}

export interface DetailedComparisonData {
  industries: { name: string; growthRate: number }[];
  comparison: ComparisonFactor[];
}

export interface IndustryTimePoint {
  year: number;
  value: number;
}

export interface HistoricalIndustryTrend {
  industry: string;
  data: IndustryTimePoint[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface GrammarCorrection {
    correctedText: string;
    suggestions: {
        original: string;
        corrected: string;
        explanation: string;
    }[];
}

export interface Course {
  platform: 'Coursera' | 'Udemy' | 'NPTEL' | 'Other';
  title: string;
  url: string;
  description: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
}

export interface Certification {
  provider: 'AWS' | 'Azure' | 'Tableau' | 'Google' | 'Other';
  title: string;
  url: string;
  description: string;
}

export interface CourseRecommendationData {
  recommendedCourses: Course[];
  recommendedCertifications: Certification[];
}

export interface CareerPathStep {
  role: string;
  description: string;
}

export interface CareerPathData {
  currentRole: CareerPathStep;
  targetRole: CareerPathStep;
  skillsToBridge: string[];
}

export interface NearbyPlace {
    name: string;
    uri: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface GroundedJobsResult {
    jobs: JobOpening[];
    places: NearbyPlace[];
    sources: GroundingSource[];
}

// Resume Builder Types
export interface ResumeExperienceItem {
  id: string;
  role: string;
  company: string;
  date: string;
  description: string;
}

export interface ResumeEducationItem {
  id: string;
  degree: string;
  school: string;
  date: string;
}

export interface ResumeProjectItem {
  id: string;
  title: string;
  description: string;
  link: string;
}

export interface ResumeBuilderData {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[]; // Simple array of strings for builder
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
}
