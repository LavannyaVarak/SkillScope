

import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import { 
  DocumentDuplicateIcon, 
  DownloadIcon, 
  ArchiveIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  PencilSquareIcon
} from './Icon';
import { ResumeBuilderData, ResumeExperienceItem, ResumeEducationItem, ResumeProjectItem } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeBuilderProps {
  t: (key: string, params?: Record<string, string | number>) => string;
}

const defaultResumeData: ResumeBuilderData = {
  fullName: "John Doe",
  role: "Software Engineer",
  email: "john.doe@example.com",
  phone: "+1 234 567 890",
  location: "San Francisco, CA",
  summary: "Experienced software engineer with a passion for building scalable web applications and intuitive user interfaces.",
  skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Git"],
  experience: [
    { id: '1', role: "Senior Developer", company: "Tech Corp", date: "2020 - Present", description: "Led a team of 5 developers. Architected the main product platform." }
  ],
  education: [
    { id: '1', degree: "B.Sc. Computer Science", school: "University of Tech", date: "2016 - 2020" }
  ],
  projects: [
    { id: '1', title: "E-commerce App", description: "Built a full-stack e-commerce platform using MERN stack.", link: "github.com/johndoe/shop" }
  ]
};

// Generic input components for inline editing
const EditableText: React.FC<{ 
    value: string; 
    onChange: (val: string) => void; 
    placeholder?: string; 
    className?: string; 
    multiline?: boolean; 
}> = ({ value, onChange, placeholder, className, multiline }) => {
    return multiline ? (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden hover:outline-dashed hover:outline-1 hover:outline-zinc-400 focus:outline-dashed focus:outline-1 focus:outline-primary rounded px-1 transition-all ${className}`}
            rows={Math.max(2, value.split('\n').length)}
            onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
            }}
        />
    ) : (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-transparent border-none outline-none hover:outline-dashed hover:outline-1 hover:outline-zinc-400 focus:outline-dashed focus:outline-1 focus:outline-primary rounded px-1 transition-all ${className}`}
        />
    );
};

// Helper hooks for data manipulation
const useTemplateData = (data: ResumeBuilderData, setData: React.Dispatch<React.SetStateAction<ResumeBuilderData>>) => {
    const addExperience = () => {
        const newExp: ResumeExperienceItem = { id: Date.now().toString(), role: '', company: '', date: '', description: '' };
        setData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    };
    const removeExperience = (id: string) => {
        setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
    };

    const addEducation = () => {
        const newEdu: ResumeEducationItem = { id: Date.now().toString(), degree: '', school: '', date: '' };
        setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    };
    const removeEducation = (id: string) => {
        setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
    };

    const addSkill = () => {
        setData(prev => ({ ...prev, skills: [...prev.skills, 'Skill'] }));
    };
    const removeSkill = (index: number) => {
        setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    };
    
    return { addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill };
};

// --- Templates ---

const ModernTemplate: React.FC<{ data: ResumeBuilderData; setData: React.Dispatch<React.SetStateAction<ResumeBuilderData>>; t: any }> = ({ data, setData, t }) => {
    const { addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill } = useTemplateData(data, setData);

    return (
        <div className="w-full h-full bg-white text-zinc-800 flex flex-col md:flex-row shadow-lg min-h-[1122px]" id="resume-preview-area">
            {/* Left Column (Sidebar) */}
            <div className="md:w-1/3 bg-zinc-800 text-white p-8 space-y-8">
                <div className="text-center md:text-left">
                     <h3 className="text-xl font-bold border-b border-zinc-600 pb-2 mb-4 uppercase tracking-wider">{t('profile.title')}</h3>
                     <div className="space-y-3 text-sm">
                        <EditableText value={data.email} onChange={(val) => setData({...data, email: val})} placeholder={t('builder.ph.email')} className="text-zinc-300" />
                        <EditableText value={data.phone} onChange={(val) => setData({...data, phone: val})} placeholder={t('builder.ph.phone')} className="text-zinc-300" />
                        <EditableText value={data.location} onChange={(val) => setData({...data, location: val})} placeholder={t('builder.ph.location')} className="text-zinc-300" />
                     </div>
                </div>

                <div>
                    <div className="flex justify-between items-center border-b border-zinc-600 pb-2 mb-4">
                        <h3 className="text-xl font-bold uppercase tracking-wider">{t('builder.section.education')}</h3>
                        <button onClick={addEducation} className="text-green-400 hover:text-green-300 print:hidden"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="space-y-4">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="relative group">
                                <button onClick={() => removeEducation(edu.id)} className="absolute -right-2 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                <EditableText value={edu.date} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, date: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.date')} className="text-xs text-zinc-400 mb-1" />
                                <EditableText value={edu.degree} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, degree: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.degree')} className="font-bold text-white block w-full" />
                                <EditableText value={edu.school} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, school: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.school')} className="text-sm text-zinc-300" />
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <div className="flex justify-between items-center border-b border-zinc-600 pb-2 mb-4">
                        <h3 className="text-xl font-bold uppercase tracking-wider">{t('builder.section.skills')}</h3>
                        <button onClick={addSkill} className="text-green-400 hover:text-green-300 print:hidden"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, index) => (
                             <div key={index} className="bg-zinc-700 px-3 py-1 rounded-full text-sm flex items-center group">
                                <EditableText value={skill} onChange={(val) => {
                                    const newSkills = [...data.skills];
                                    newSkills[index] = val;
                                    setData({ ...data, skills: newSkills });
                                }} placeholder={t('builder.ph.skill')} className="w-20 text-center" />
                                <button onClick={() => removeSkill(index)} className="ml-1 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (Main Content) */}
            <div className="md:w-2/3 p-8 space-y-8">
                <div className="border-b-4 border-zinc-800 pb-4">
                    <EditableText value={data.fullName} onChange={(val) => setData({...data, fullName: val})} className="text-5xl font-bold text-zinc-900 mb-2 uppercase tracking-tight" placeholder={t('builder.ph.fullname')} />
                    <EditableText value={data.role} onChange={(val) => setData({...data, role: val})} className="text-2xl text-zinc-600 uppercase tracking-widest font-light" placeholder={t('builder.ph.role')} />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-zinc-800 border-b border-zinc-300 pb-2 mb-4 uppercase tracking-wider">Summary</h3>
                    <EditableText value={data.summary} onChange={(val) => setData({...data, summary: val})} multiline className="text-zinc-700 leading-relaxed" placeholder={t('builder.ph.summary')} />
                </div>

                <div>
                    <div className="flex justify-between items-center border-b border-zinc-300 pb-2 mb-4">
                         <h3 className="text-xl font-bold text-zinc-800 uppercase tracking-wider">{t('builder.section.experience')}</h3>
                         <button onClick={addExperience} className="text-green-600 hover:text-green-700 print:hidden"><PlusIcon className="w-6 h-6"/></button>
                    </div>
                   
                    <div className="space-y-6">
                        {data.experience.map((exp) => (
                             <div key={exp.id} className="relative group pl-4 border-l-2 border-zinc-200 hover:border-zinc-400 transition-colors">
                                <button onClick={() => removeExperience(exp.id)} className="absolute right-0 top-0 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-5 h-5"/></button>
                                <div className="flex justify-between items-baseline mb-1">
                                    <EditableText value={exp.role} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, role: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.jobTitle')} className="font-bold text-lg text-zinc-800" />
                                    <EditableText value={exp.date} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, date: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.date')} className="text-sm text-zinc-500 text-right w-32" />
                                </div>
                                <EditableText value={exp.company} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, company: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} placeholder={t('builder.ph.company')} className="text-md font-semibold text-zinc-600 mb-2" />
                                <EditableText value={exp.description} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, description: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} multiline placeholder={t('builder.ph.desc')} className="text-sm text-zinc-700 leading-relaxed" />
                             </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MinimalistTemplate: React.FC<{ data: ResumeBuilderData; setData: React.Dispatch<React.SetStateAction<ResumeBuilderData>>; t: any }> = ({ data, setData, t }) => {
    const { addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill } = useTemplateData(data, setData);

    return (
        <div className="w-full h-full bg-white text-zinc-900 p-12 shadow-lg min-h-[1122px]" id="resume-preview-area">
             <div className="text-center border-b-2 border-zinc-900 pb-8 mb-8">
                <EditableText value={data.fullName} onChange={(val) => setData({...data, fullName: val})} className="text-4xl font-serif font-bold mb-2 text-center" placeholder={t('builder.ph.fullname')} />
                <EditableText value={data.role} onChange={(val) => setData({...data, role: val})} className="text-xl text-zinc-600 uppercase tracking-widest text-center" placeholder={t('builder.ph.role')} />
                <div className="flex justify-center gap-4 mt-4 text-sm text-zinc-500 font-medium">
                    <EditableText value={data.email} onChange={(val) => setData({...data, email: val})} placeholder={t('builder.ph.email')} className="w-auto text-center" />
                    <span>|</span>
                    <EditableText value={data.phone} onChange={(val) => setData({...data, phone: val})} placeholder={t('builder.ph.phone')} className="w-auto text-center" />
                    <span>|</span>
                    <EditableText value={data.location} onChange={(val) => setData({...data, location: val})} placeholder={t('builder.ph.location')} className="w-auto text-center" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-zinc-200 mb-4 text-zinc-400">Professional Profile</h3>
                    <EditableText value={data.summary} onChange={(val) => setData({...data, summary: val})} multiline className="text-zinc-700 leading-relaxed" placeholder={t('builder.ph.summary')} />
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center border-b border-zinc-200 mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t('builder.section.experience')}</h3>
                        <button onClick={addExperience} className="text-zinc-400 hover:text-zinc-600 print:hidden"><PlusIcon className="w-4 h-4"/></button>
                    </div>
                     <div className="space-y-8">
                        {data.experience.map((exp) => (
                             <div key={exp.id} className="relative group">
                                <button onClick={() => removeExperience(exp.id)} className="absolute -left-8 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                <div className="flex justify-between mb-1">
                                    <EditableText value={exp.role} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, role: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.jobTitle')} className="font-bold text-lg" />
                                     <EditableText value={exp.date} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, date: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.date')} className="text-sm text-zinc-500 text-right w-40" />
                                </div>
                                <EditableText value={exp.company} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, company: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} placeholder={t('builder.ph.company')} className="text-md font-semibold text-zinc-600 mb-2 italic" />
                                <EditableText value={exp.description} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, description: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} multiline placeholder={t('builder.ph.desc')} className="text-sm text-zinc-700 leading-relaxed" />
                             </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                         <div className="flex justify-between items-center border-b border-zinc-200 mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t('builder.section.education')}</h3>
                            <button onClick={addEducation} className="text-zinc-400 hover:text-zinc-600 print:hidden"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                        <div className="space-y-4">
                            {data.education.map((edu) => (
                                <div key={edu.id} className="relative group">
                                    <button onClick={() => removeEducation(edu.id)} className="absolute -left-6 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                    <EditableText value={edu.school} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, school: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.school')} className="font-bold block" />
                                    <EditableText value={edu.degree} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, degree: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.degree')} className="text-sm block" />
                                    <EditableText value={edu.date} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, date: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.date')} className="text-xs text-zinc-500 block" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                         <div className="flex justify-between items-center border-b border-zinc-200 mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t('builder.section.skills')}</h3>
                            <button onClick={addSkill} className="text-zinc-400 hover:text-zinc-600 print:hidden"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             {data.skills.map((skill, index) => (
                                <div key={index} className="flex items-center group">
                                     <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full mr-2"></span>
                                    <EditableText value={skill} onChange={(val) => {
                                        const newSkills = [...data.skills];
                                        newSkills[index] = val;
                                        setData({ ...data, skills: newSkills });
                                    }} placeholder={t('builder.ph.skill')} />
                                    <button onClick={() => removeSkill(index)} className="ml-1 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ProfessionalTemplate: React.FC<{ data: ResumeBuilderData; setData: React.Dispatch<React.SetStateAction<ResumeBuilderData>>; t: any }> = ({ data, setData, t }) => {
    const { addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill } = useTemplateData(data, setData);

    return (
        <div className="w-full h-full bg-white text-zinc-900 p-12 shadow-lg min-h-[1122px] font-serif" id="resume-preview-area">
             {/* Header */}
             <div className="text-center border-b border-zinc-300 pb-6 mb-8">
                <EditableText value={data.fullName} onChange={(val) => setData({...data, fullName: val})} className="text-3xl font-bold uppercase text-center" placeholder={t('builder.ph.fullname')} />
                <div className="flex justify-center gap-2 mt-2 text-sm text-zinc-600">
                    <EditableText value={data.location} onChange={(val) => setData({...data, location: val})} placeholder={t('builder.ph.location')} className="w-auto text-center" />
                    <span>•</span>
                    <EditableText value={data.phone} onChange={(val) => setData({...data, phone: val})} placeholder={t('builder.ph.phone')} className="w-auto text-center" />
                    <span>•</span>
                    <EditableText value={data.email} onChange={(val) => setData({...data, email: val})} placeholder={t('builder.ph.email')} className="w-auto text-center" />
                </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-zinc-900 mb-3 pb-1">Professional Summary</h3>
                <EditableText value={data.summary} onChange={(val) => setData({...data, summary: val})} multiline className="text-zinc-800 leading-relaxed text-sm" placeholder={t('builder.ph.summary')} />
            </div>

            {/* Experience */}
            <div className="mb-6">
                 <div className="flex justify-between items-center border-b border-zinc-900 mb-3 pb-1">
                    <h3 className="text-sm font-bold uppercase">{t('builder.section.experience')}</h3>
                    <button onClick={addExperience} className="text-zinc-500 hover:text-zinc-700 print:hidden"><PlusIcon className="w-4 h-4"/></button>
                </div>
                <div className="space-y-4">
                    {data.experience.map((exp) => (
                            <div key={exp.id} className="relative group">
                            <button onClick={() => removeExperience(exp.id)} className="absolute -left-6 top-0 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                            <div className="flex justify-between font-bold text-md text-zinc-900">
                                <EditableText value={exp.company} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, company: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} placeholder={t('builder.ph.company')} />
                                <EditableText value={exp.date} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, date: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} placeholder={t('builder.ph.date')} className="text-right w-40" />
                            </div>
                            <EditableText value={exp.role} onChange={(val) => {
                                const newExp = data.experience.map(e => e.id === exp.id ? { ...e, role: val } : e);
                                setData({ ...data, experience: newExp });
                            }} placeholder={t('builder.ph.jobTitle')} className="italic text-sm text-zinc-700 mb-1" />
                            <EditableText value={exp.description} onChange={(val) => {
                                const newExp = data.experience.map(e => e.id === exp.id ? { ...e, description: val } : e);
                                setData({ ...data, experience: newExp });
                            }} multiline placeholder={t('builder.ph.desc')} className="text-sm text-zinc-800" />
                            </div>
                    ))}
                </div>
            </div>

            {/* Education */}
             <div className="mb-6">
                 <div className="flex justify-between items-center border-b border-zinc-900 mb-3 pb-1">
                    <h3 className="text-sm font-bold uppercase">{t('builder.section.education')}</h3>
                    <button onClick={addEducation} className="text-zinc-500 hover:text-zinc-700 print:hidden"><PlusIcon className="w-4 h-4"/></button>
                </div>
                <div className="space-y-2">
                    {data.education.map((edu) => (
                            <div key={edu.id} className="relative group">
                            <button onClick={() => removeEducation(edu.id)} className="absolute -left-6 top-0 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                             <div className="flex justify-between text-sm">
                                <div className="flex-1">
                                    <EditableText value={edu.school} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, school: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.school')} className="font-bold text-zinc-900" />
                                    <EditableText value={edu.degree} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, degree: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.degree')} className="text-zinc-700" />
                                </div>
                                <EditableText value={edu.date} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, date: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.date')} className="text-right w-40 font-semibold" />
                             </div>
                            </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
             <div>
                 <div className="flex justify-between items-center border-b border-zinc-900 mb-3 pb-1">
                    <h3 className="text-sm font-bold uppercase">{t('builder.section.skills')}</h3>
                    <button onClick={addSkill} className="text-zinc-500 hover:text-zinc-700 print:hidden"><PlusIcon className="w-4 h-4"/></button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                     {data.skills.map((skill, index) => (
                        <div key={index} className="flex items-center group">
                            <span className="mr-2 text-zinc-500">•</span>
                            <EditableText value={skill} onChange={(val) => {
                                const newSkills = [...data.skills];
                                newSkills[index] = val;
                                setData({ ...data, skills: newSkills });
                            }} placeholder={t('builder.ph.skill')} className="w-auto" />
                            <button onClick={() => removeSkill(index)} className="ml-1 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-3 h-3"/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CreativeTemplate: React.FC<{ data: ResumeBuilderData; setData: React.Dispatch<React.SetStateAction<ResumeBuilderData>>; t: any }> = ({ data, setData, t }) => {
    const { addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill } = useTemplateData(data, setData);

    return (
         <div className="w-full h-full bg-white text-zinc-800 flex flex-col shadow-lg min-h-[1122px]" id="resume-preview-area">
             {/* Top Banner */}
             <div className="bg-primary p-8 text-white">
                 <EditableText value={data.fullName} onChange={(val) => setData({...data, fullName: val})} className="text-4xl font-bold uppercase mb-2 bg-transparent text-white placeholder-white/70" placeholder={t('builder.ph.fullname')} />
                 <EditableText value={data.role} onChange={(val) => setData({...data, role: val})} className="text-xl font-light uppercase tracking-widest bg-transparent text-white placeholder-white/70" placeholder={t('builder.ph.role')} />
             </div>

             <div className="flex flex-1">
                 {/* Sidebar Left */}
                 <div className="w-1/3 bg-neutral-100 p-8 border-r border-zinc-200">
                     {/* Contact */}
                    <div className="mb-8">
                        <h3 className="text-primary font-bold uppercase tracking-wider mb-4 border-b-2 border-primary pb-1">Contact</h3>
                         <div className="space-y-3 text-sm font-medium text-zinc-600">
                             <EditableText value={data.email} onChange={(val) => setData({...data, email: val})} placeholder={t('builder.ph.email')} />
                             <EditableText value={data.phone} onChange={(val) => setData({...data, phone: val})} placeholder={t('builder.ph.phone')} />
                             <EditableText value={data.location} onChange={(val) => setData({...data, location: val})} placeholder={t('builder.ph.location')} />
                         </div>
                    </div>

                    {/* Skills */}
                     <div className="mb-8">
                         <div className="flex justify-between items-center border-b-2 border-primary mb-4 pb-1">
                            <h3 className="text-primary font-bold uppercase tracking-wider">{t('builder.section.skills')}</h3>
                            <button onClick={addSkill} className="text-primary hover:text-primary-focus print:hidden"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                         <div className="flex flex-wrap gap-2">
                             {data.skills.map((skill, index) => (
                                <div key={index} className="bg-white border border-zinc-300 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-600 flex items-center group shadow-sm">
                                    <EditableText value={skill} onChange={(val) => {
                                        const newSkills = [...data.skills];
                                        newSkills[index] = val;
                                        setData({ ...data, skills: newSkills });
                                    }} placeholder={t('builder.ph.skill')} className="w-20 text-center" />
                                    <button onClick={() => removeSkill(index)} className="ml-1 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                     <div>
                        <div className="flex justify-between items-center border-b-2 border-primary mb-4 pb-1">
                            <h3 className="text-primary font-bold uppercase tracking-wider">{t('builder.section.education')}</h3>
                            <button onClick={addEducation} className="text-primary hover:text-primary-focus print:hidden"><PlusIcon className="w-4 h-4"/></button>
                        </div>
                        <div className="space-y-6">
                            {data.education.map((edu) => (
                                <div key={edu.id} className="relative group">
                                    <button onClick={() => removeEducation(edu.id)} className="absolute -right-2 top-0 text-red-400 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                    <EditableText value={edu.degree} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, degree: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.degree')} className="font-bold text-zinc-800 text-sm" />
                                    <EditableText value={edu.school} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, school: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.school')} className="text-xs text-zinc-600" />
                                    <EditableText value={edu.date} onChange={(val) => {
                                        const newEdu = data.education.map(e => e.id === edu.id ? { ...e, date: val } : e);
                                        setData({ ...data, education: newEdu });
                                    }} placeholder={t('builder.ph.date')} className="text-xs text-primary font-semibold mt-1" />
                                </div>
                            ))}
                        </div>
                    </div>

                 </div>

                 {/* Main Content Right */}
                 <div className="w-2/3 p-8">
                     <div className="mb-8">
                         <h3 className="text-primary font-bold uppercase tracking-wider mb-4 border-b-2 border-zinc-200 pb-1">Profile</h3>
                         <EditableText value={data.summary} onChange={(val) => setData({...data, summary: val})} multiline className="text-zinc-600 leading-relaxed" placeholder={t('builder.ph.summary')} />
                     </div>

                     <div>
                        <div className="flex justify-between items-center border-b-2 border-zinc-200 mb-4 pb-1">
                            <h3 className="text-primary font-bold uppercase tracking-wider">{t('builder.section.experience')}</h3>
                            <button onClick={addExperience} className="text-primary hover:text-primary-focus print:hidden"><PlusIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-8">
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="relative group">
                                    <button onClick={() => removeExperience(exp.id)} className="absolute -left-6 top-0 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                    <div className="flex justify-between items-center mb-1">
                                        <EditableText value={exp.role} onChange={(val) => {
                                            const newExp = data.experience.map(e => e.id === exp.id ? { ...e, role: val } : e);
                                            setData({ ...data, experience: newExp });
                                        }} placeholder={t('builder.ph.jobTitle')} className="font-bold text-lg text-zinc-800" />
                                        <EditableText value={exp.date} onChange={(val) => {
                                            const newExp = data.experience.map(e => e.id === exp.id ? { ...e, date: val } : e);
                                            setData({ ...data, experience: newExp });
                                        }} placeholder={t('builder.ph.date')} className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded" />
                                    </div>
                                    <EditableText value={exp.company} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, company: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.company')} className="text-sm font-bold text-zinc-500 mb-2 uppercase" />
                                    <EditableText value={exp.description} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, description: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} multiline placeholder={t('builder.ph.desc')} className="text-sm text-zinc-600 leading-relaxed" />
                                </div>
                            ))}
                        </div>
                     </div>
                 </div>
             </div>
         </div>
    );
};

const ElegantTemplate: React.FC<{ data: ResumeBuilderData; setData: React.Dispatch<React.SetStateAction<ResumeBuilderData>>; t: any }> = ({ data, setData, t }) => {
    const { addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill } = useTemplateData(data, setData);

    return (
        <div className="w-full h-full bg-white text-zinc-800 flex shadow-lg min-h-[1122px]" id="resume-preview-area">
            {/* Left Main Content */}
            <div className="w-2/3 p-10 pr-6">
                <div className="mb-10">
                    <EditableText value={data.fullName} onChange={(val) => setData({...data, fullName: val})} className="text-4xl font-serif text-secondary font-bold mb-1" placeholder={t('builder.ph.fullname')} />
                    <EditableText value={data.role} onChange={(val) => setData({...data, role: val})} className="text-lg text-zinc-500 uppercase tracking-widest" placeholder={t('builder.ph.role')} />
                </div>

                <div className="mb-8">
                     <h3 className="text-secondary font-serif font-bold text-xl mb-4 border-b border-zinc-200 pb-2">Profile</h3>
                     <EditableText value={data.summary} onChange={(val) => setData({...data, summary: val})} multiline className="text-zinc-600 leading-7 font-serif" placeholder={t('builder.ph.summary')} />
                </div>

                <div>
                     <div className="flex justify-between items-center border-b border-zinc-200 mb-6 pb-2">
                        <h3 className="text-secondary font-serif font-bold text-xl">{t('builder.section.experience')}</h3>
                        <button onClick={addExperience} className="text-secondary hover:text-secondary-focus print:hidden"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="space-y-8 relative border-l border-zinc-300 ml-2 pl-6">
                        {data.experience.map((exp) => (
                             <div key={exp.id} className="relative group">
                                <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white"></span>
                                <button onClick={() => removeExperience(exp.id)} className="absolute -left-12 top-0 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                
                                <EditableText value={exp.role} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, role: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} placeholder={t('builder.ph.jobTitle')} className="font-bold text-lg text-zinc-800 font-serif" />
                                
                                <div className="flex justify-between items-center mb-2">
                                     <EditableText value={exp.company} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, company: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.company')} className="text-sm font-bold text-zinc-500" />
                                    <EditableText value={exp.date} onChange={(val) => {
                                        const newExp = data.experience.map(e => e.id === exp.id ? { ...e, date: val } : e);
                                        setData({ ...data, experience: newExp });
                                    }} placeholder={t('builder.ph.date')} className="text-xs text-zinc-400 italic text-right w-32" />
                                </div>
                               
                                <EditableText value={exp.description} onChange={(val) => {
                                    const newExp = data.experience.map(e => e.id === exp.id ? { ...e, description: val } : e);
                                    setData({ ...data, experience: newExp });
                                }} multiline placeholder={t('builder.ph.desc')} className="text-sm text-zinc-600 leading-relaxed" />
                             </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Sidebar */}
            <div className="w-1/3 bg-zinc-50 p-10 pl-6 border-l border-zinc-200">
                <div className="mb-10 text-right">
                    <h3 className="text-secondary font-serif font-bold text-lg mb-4 border-b border-zinc-200 pb-1">Contact</h3>
                    <div className="space-y-2 text-sm text-zinc-600">
                        <EditableText value={data.email} onChange={(val) => setData({...data, email: val})} placeholder={t('builder.ph.email')} className="text-right" />
                        <EditableText value={data.phone} onChange={(val) => setData({...data, phone: val})} placeholder={t('builder.ph.phone')} className="text-right" />
                        <EditableText value={data.location} onChange={(val) => setData({...data, location: val})} placeholder={t('builder.ph.location')} className="text-right" />
                    </div>
                </div>

                 <div className="mb-10 text-right">
                    <div className="flex justify-end items-center border-b border-zinc-200 mb-4 pb-1">
                        <button onClick={addEducation} className="text-secondary hover:text-secondary-focus print:hidden mr-2"><PlusIcon className="w-4 h-4"/></button>
                        <h3 className="text-secondary font-serif font-bold text-lg">{t('builder.section.education')}</h3>
                    </div>
                    <div className="space-y-6">
                         {data.education.map((edu) => (
                             <div key={edu.id} className="relative group">
                                <button onClick={() => removeEducation(edu.id)} className="absolute -left-6 top-0 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-4 h-4"/></button>
                                <EditableText value={edu.degree} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, degree: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.degree')} className="font-bold text-zinc-800 text-md text-right font-serif" />
                                <EditableText value={edu.school} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, school: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.school')} className="text-sm text-zinc-600 text-right" />
                                <EditableText value={edu.date} onChange={(val) => {
                                    const newEdu = data.education.map(e => e.id === edu.id ? { ...e, date: val } : e);
                                    setData({ ...data, education: newEdu });
                                }} placeholder={t('builder.ph.date')} className="text-xs text-zinc-400 mt-1 text-right" />
                             </div>
                        ))}
                    </div>
                 </div>

                 <div className="text-right">
                    <div className="flex justify-end items-center border-b border-zinc-200 mb-4 pb-1">
                        <button onClick={addSkill} className="text-secondary hover:text-secondary-focus print:hidden mr-2"><PlusIcon className="w-4 h-4"/></button>
                        <h3 className="text-secondary font-serif font-bold text-lg">{t('builder.section.skills')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                         {data.skills.map((skill, index) => (
                             <div key={index} className="group relative">
                                <button onClick={() => removeSkill(index)} className="absolute -left-4 top-0.5 text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><TrashIcon className="w-3 h-3"/></button>
                                <div className="border-b border-zinc-400 pb-1">
                                     <EditableText value={skill} onChange={(val) => {
                                        const newSkills = [...data.skills];
                                        newSkills[index] = val;
                                        setData({ ...data, skills: newSkills });
                                    }} placeholder={t('builder.ph.skill')} className="text-right text-sm text-zinc-700 w-auto" />
                                </div>
                             </div>
                        ))}
                    </div>
                 </div>

            </div>
        </div>
    );
};


// --- Main Builder Component ---

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ t }) => {
    const [activeTemplate, setActiveTemplate] = useState<'modern' | 'minimalist' | 'professional' | 'creative' | 'elegant'>('modern');
    const [view, setView] = useState<'selection' | 'editor'>('selection');
    const [resumeData, setResumeData] = useState<ResumeBuilderData>(() => {
        try {
            const saved = localStorage.getItem('skillscope_resume_builder_data');
            return saved ? JSON.parse(saved) : defaultResumeData;
        } catch {
            return defaultResumeData;
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        localStorage.setItem('skillscope_resume_builder_data', JSON.stringify(resumeData));
        setTimeout(() => {
            setIsSaving(false);
            setSaveMessage(t('builder.saved'));
            setTimeout(() => setSaveMessage(''), 3000);
        }, 800);
    };

    const handleDownloadPDF = async () => {
        const input = document.getElementById('resume-preview-area');
        if (!input) return;
        
        // Temporarily scale up for high quality
        setIsSaving(true); // Reuse loading state for spinner

        try {
             // 1. Capture the canvas
            const canvas = await html2canvas(input, {
                scale: 2, // Improve quality
                useCORS: true,
                logging: false,
            });

            // 2. Generate PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Handle multi-page (if resume is very long)
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
        } catch (err) {
            console.error("PDF Export Failed", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (view === 'selection') {
        return (
            <div className="space-y-8 animate-fade-in">
                 <Card>
                    <div className="text-center mb-8">
                         <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('builder.title')}</h2>
                         <p className="text-lg text-zinc-600 dark:text-zinc-400">{t('builder.description')}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto p-4">
                        {/* Modern Template Card */}
                        <div 
                            onClick={() => { setActiveTemplate('modern'); setView('editor'); }}
                            className="group cursor-pointer border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                        >
                            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 relative flex items-center justify-center p-4">
                                <div className="w-32 h-44 bg-white shadow-md flex text-[4px] overflow-hidden">
                                     <div className="w-1/3 bg-zinc-800 h-full"></div>
                                     <div className="w-2/3 p-2 space-y-2">
                                         <div className="h-2 w-full bg-zinc-300"></div>
                                         <div className="h-1 w-2/3 bg-zinc-200"></div>
                                         <div className="h-1 w-1/2 bg-zinc-200"></div>
                                     </div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                     <span className="bg-zinc-800 text-white px-4 py-2 rounded-full font-bold shadow-lg">{t('builder.selectTemplate')}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{t('builder.template.modern')}</h3>
                            </div>
                        </div>

                         {/* Minimalist Template Card */}
                        <div 
                            onClick={() => { setActiveTemplate('minimalist'); setView('editor'); }}
                            className="group cursor-pointer border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                        >
                            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 relative flex items-center justify-center p-4">
                                <div className="w-32 h-44 bg-white shadow-md p-2 flex flex-col items-center text-[4px] overflow-hidden">
                                      <div className="h-2 w-1/2 bg-zinc-800 mb-1"></div>
                                      <div className="h-0.5 w-full border-b border-zinc-200 mb-2"></div>
                                      <div className="w-full space-y-1 text-left">
                                          <div className="h-1 w-full bg-zinc-200"></div>
                                          <div className="h-1 w-3/4 bg-zinc-200"></div>
                                      </div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                     <span className="bg-zinc-800 text-white px-4 py-2 rounded-full font-bold shadow-lg">{t('builder.selectTemplate')}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{t('builder.template.minimalist')}</h3>
                            </div>
                        </div>

                        {/* Professional Template Card */}
                         <div 
                            onClick={() => { setActiveTemplate('professional'); setView('editor'); }}
                            className="group cursor-pointer border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                        >
                            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 relative flex items-center justify-center p-4">
                                <div className="w-32 h-44 bg-white shadow-md p-3 flex flex-col text-[4px] overflow-hidden">
                                     <div className="w-full text-center border-b border-zinc-300 pb-2 mb-2">
                                        <div className="h-2 w-2/3 bg-zinc-800 mx-auto mb-1"></div>
                                        <div className="h-1 w-1/2 bg-zinc-400 mx-auto"></div>
                                     </div>
                                      <div className="w-full space-y-2">
                                          <div className="h-1.5 w-full bg-zinc-200"></div>
                                          <div className="h-1.5 w-full bg-zinc-200"></div>
                                      </div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                     <span className="bg-zinc-800 text-white px-4 py-2 rounded-full font-bold shadow-lg">{t('builder.selectTemplate')}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Professional Serif</h3>
                            </div>
                        </div>

                         {/* Creative Template Card */}
                         <div 
                            onClick={() => { setActiveTemplate('creative'); setView('editor'); }}
                            className="group cursor-pointer border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-lg hover:shadow-glow-primary transform hover:-translate-y-1"
                        >
                            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 relative flex items-center justify-center p-4">
                                <div className="w-32 h-44 bg-white shadow-md flex flex-col text-[4px] overflow-hidden">
                                     <div className="w-full bg-primary h-8 mb-1"></div>
                                     <div className="flex flex-1 p-1">
                                        <div className="w-1/3 bg-zinc-100 h-full mr-1"></div>
                                        <div className="w-2/3 space-y-1">
                                            <div className="h-1 w-full bg-zinc-200"></div>
                                            <div className="h-1 w-3/4 bg-zinc-200"></div>
                                        </div>
                                     </div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                     <span className="bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">{t('builder.selectTemplate')}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Creative Bold</h3>
                            </div>
                        </div>

                        {/* Elegant Template Card */}
                        <div 
                            onClick={() => { setActiveTemplate('elegant'); setView('editor'); }}
                            className="group cursor-pointer border-2 border-zinc-200 dark:border-zinc-700 hover:border-secondary rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-lg hover:shadow-glow-secondary transform hover:-translate-y-1"
                        >
                            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 relative flex items-center justify-center p-4">
                                <div className="w-32 h-44 bg-white shadow-md flex text-[4px] overflow-hidden">
                                    <div className="w-2/3 p-2 space-y-2">
                                         <div className="h-2 w-full bg-secondary"></div>
                                         <div className="h-1 w-2/3 bg-zinc-200"></div>
                                    </div>
                                     <div className="w-1/3 bg-zinc-100 border-l border-zinc-200 h-full"></div>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                     <span className="bg-secondary text-white px-4 py-2 rounded-full font-bold shadow-lg">{t('builder.selectTemplate')}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Elegant Side</h3>
                            </div>
                        </div>

                    </div>
                </Card>
            </div>
        );
    }

    const renderActiveTemplate = () => {
        switch (activeTemplate) {
            case 'modern': return <ModernTemplate data={resumeData} setData={setResumeData} t={t} />;
            case 'minimalist': return <MinimalistTemplate data={resumeData} setData={setResumeData} t={t} />;
            case 'professional': return <ProfessionalTemplate data={resumeData} setData={setResumeData} t={t} />;
            case 'creative': return <CreativeTemplate data={resumeData} setData={setResumeData} t={t} />;
            case 'elegant': return <ElegantTemplate data={resumeData} setData={setResumeData} t={t} />;
            default: return <ModernTemplate data={resumeData} setData={setResumeData} t={t} />;
        }
    };

    return (
        <div className="flex flex-col h-screen md:h-[calc(100vh-140px)]">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => setView('selection')} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-primary transition-colors font-semibold">
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    {t('builder.button.changeTemplate')}
                </button>
                
                <div className="flex gap-3">
                     <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-bold disabled:opacity-50">
                        {isSaving ? (
                            <span className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full"></span>
                        ) : (
                             saveMessage ? <CheckIcon className="w-5 h-5 text-green-600"/> : <ArchiveIcon className="w-5 h-5" />
                        )}
                        {saveMessage || t('builder.button.save')}
                    </button>
                    <button onClick={handleDownloadPDF} disabled={isSaving} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors font-bold shadow-glow-primary disabled:opacity-50">
                         {isSaving ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            <DownloadIcon className="w-5 h-5" />
                        )}
                        {t('builder.button.download')}
                    </button>
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-black/20 rounded-xl p-4 md:p-8 flex justify-center">
                 <div className="w-[210mm] min-h-[297mm] shadow-2xl transition-transform origin-top transform scale-[0.5] md:scale-[0.8] lg:scale-100">
                    {renderActiveTemplate()}
                 </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
