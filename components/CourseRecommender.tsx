
import React, { useState, useEffect } from 'react';
import Card from './Card';
import Loader from './Loader';
import IndustrySelector from './IndustrySelector';
import { getCourseRecommendations } from '../services/geminiService';
import { CourseRecommendationData } from '../types';
import { INDUSTRIES } from '../constants';
import { ArrowTopRightOnSquareIcon, BookmarkSquareIcon, LightBulbIcon, XIcon } from './Icon';

interface CourseRecommenderProps {
    initialSkills: string[] | null;
    clearInitialSkills: () => void;
    t: (key: string) => string;
    recommendations?: CourseRecommendationData | null; // Optional prop to pass in data
    language: string;
}

const CourseRecommender: React.FC<CourseRecommenderProps> = ({ initialSkills, clearInitialSkills, t, recommendations: passedRecommendations, language }) => {
    const [selectedIndustry, setSelectedIndustry] = useState<string>(INDUSTRIES[0]);
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [recommendations, setRecommendations] = useState<CourseRecommendationData | null>(passedRecommendations || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const isEmbedded = passedRecommendations !== undefined;

    useEffect(() => {
        if (initialSkills && initialSkills.length > 0) {
            setSkills(initialSkills);
            clearInitialSkills();
        }
    }, [initialSkills, clearInitialSkills]);

    useEffect(() => {
        if(passedRecommendations) {
            setRecommendations(passedRecommendations);
        }
    }, [passedRecommendations]);

    const handleGetRecommendations = async () => {
        if (skills.length === 0) {
            setError(t('courses.error.noSkills'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            const data = await getCourseRecommendations(skills, selectedIndustry, language);
            setRecommendations(data);
        } catch (err) {
            setError(t('courses.error.fail'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSkillInput(e.target.value);
    };

    const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newSkill = skillInput.trim();
            if (newSkill && !skills.includes(newSkill)) {
                setSkills([...skills, newSkill]);
                setSkillInput('');
            }
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const renderLevelBadge = (level?: string) => {
        if (!level) return null;
        const levelLower = level.toLowerCase();
        let colorClasses = 'bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300';
        if (levelLower === 'beginner') colorClasses = 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        if (levelLower === 'intermediate') colorClasses = 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200';
        if (levelLower === 'advanced') colorClasses = 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClasses}`}>{level}</span>;
    }

    const renderContent = () => (
        <>
            {isLoading && !recommendations && (
                <div className="flex justify-center items-center h-40"><Loader /></div>
            )}
            
            {recommendations && (
                <div className="space-y-8 animate-fade-in">
                    <Card>
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <BookmarkSquareIcon className="w-6 h-6 mr-3 text-primary"/>
                            {t('courses.results.courses.title')}
                        </h3>
                        {recommendations.recommendedCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recommendations.recommendedCourses.map((course, index) => (
                                    <div key={index} className="bg-neutral-100 dark:bg-zinc-950 p-4 rounded-lg flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-xs font-semibold text-primary uppercase">{course.platform}</p>
                                                <div className="flex items-center gap-2">
                                                    {course.duration && <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-full">{course.duration}</span>}
                                                    {renderLevelBadge(course.level)}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">{course.title}</h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{course.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <a href={course.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                                                {t('courses.results.courses.enroll')}
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-600 dark:text-zinc-400 text-center">{t('courses.results.courses.none')}</p>
                        )}
                    </Card>
                     <Card>
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <LightBulbIcon className="w-6 h-6 mr-3 text-secondary"/>
                            {t('courses.results.certs.title')}
                        </h3>
                        {recommendations.recommendedCertifications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recommendations.recommendedCertifications.map((cert, index) => (
                                    <div key={index} className="bg-neutral-100 dark:bg-zinc-950 p-4 rounded-lg flex flex-col justify-between">
                                         <div>
                                            <p className="text-xs font-semibold text-secondary uppercase">{cert.provider}</p>
                                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">{cert.title}</h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{cert.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                                                {t('courses.results.certs.view')}
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <p className="text-zinc-600 dark:text-zinc-400 text-center">{t('courses.results.certs.none')}</p>
                        )}
                    </Card>
                </div>
            )}
        </>
    );

    if (isEmbedded) {
        return renderContent();
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('courses.title')}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    {t('courses.description')}
                </p>
                <div className="space-y-4">
                    <IndustrySelector
                        t={t}
                        selectedIndustry={selectedIndustry}
                        onIndustryChange={setSelectedIndustry}
                        industries={INDUSTRIES}
                    />
                    <div>
                        <label htmlFor="skills-input" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                            {t('courses.skills.label')}
                        </label>
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-shadow">
                            {skills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-1 bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full animate-fade-in">
                                    <span>{skill}</span>
                                    <button onClick={() => handleRemoveSkill(skill)} className="text-primary hover:text-primary-focus">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <input
                                id="skills-input"
                                type="text"
                                value={skillInput}
                                onChange={handleSkillInputChange}
                                onKeyDown={handleSkillInputKeyDown}
                                placeholder={skills.length === 0 ? t('courses.skills.placeholder.empty') : t('courses.skills.placeholder.filled')}
                                className="flex-grow bg-transparent p-1 focus:outline-none text-zinc-900 dark:text-zinc-200"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleGetRecommendations}
                        disabled={isLoading}
                        className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-focus transition-all duration-300 hover:shadow-glow-secondary disabled:bg-zinc-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <Loader /> : t('courses.button.recommend')}
                    </button>
                </div>
                 {error && <div className="mt-4 text-center text-red-500 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
            </Card>
            {renderContent()}
        </div>
    );
};

export default CourseRecommender;
