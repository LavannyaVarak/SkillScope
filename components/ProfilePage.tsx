

import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import { User } from '../types';
import { UserCircleIcon, PencilSquareIcon, CameraIcon, CheckIcon, XIcon, TrashIcon } from './Icon';
import { DEGREES } from '../constants';

interface ProfilePageProps {
    t: (key: string) => string;
    user: User | null;
    onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ t, user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    if (!user || !formData) {
        return (
            <Card className="text-center max-w-2xl mx-auto">
                <p>Loading user profile...</p>
            </Card>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSave = () => {
        if (formData) {
            onUpdateUser(formData);
            setIsEditing(false);
            setSuccessMessage(t('profile.success'));
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("File too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => prev ? ({ ...prev, profilePicture: base64String }) : null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => prev ? ({ ...prev, profilePicture: undefined }) : null);
    };

    const DetailItem: React.FC<{ label: string; value?: string; name: keyof User; type?: string; options?: string[] }> = ({ label, value, name, type = "text", options }) => (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                    options ? (
                        <select
                            name={name}
                            value={formData?.[name] as string}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md focus:ring-primary focus:border-primary"
                        >
                             <option value="" disabled>Select {label}</option>
                             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    ) : (
                        <input
                            type={type}
                            name={name}
                            value={formData?.[name] as string}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md focus:ring-primary focus:border-primary"
                        />
                    )
                ) : (
                    value || 'Not provided'
                )}
            </dd>
        </div>
    );

    return (
        <Card className="max-w-2xl mx-auto relative animate-fade-in">
             {successMessage && (
                <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold animate-fade-in-up">
                    {successMessage}
                </div>
            )}
            
            <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                    {formData.profilePicture ? (
                        <img 
                            src={formData.profilePicture} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
                        />
                    ) : (
                        <UserCircleIcon className="w-24 h-24 text-zinc-300 dark:text-zinc-600" />
                    )}
                    
                    {isEditing && (
                        <div className="absolute bottom-0 right-0 flex gap-1">
                             <button 
                                onClick={() => fileInputRef.current?.click()} 
                                className="p-2 bg-primary text-white rounded-full hover:bg-primary-focus shadow-lg transition-transform hover:scale-105"
                                title={t('profile.upload')}
                            >
                                <CameraIcon className="w-4 h-4" />
                            </button>
                             {formData.profilePicture && (
                                <button 
                                    onClick={handleRemoveImage} 
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-transform hover:scale-105"
                                    title={t('profile.remove')}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
                {!isEditing && (
                    <div className="mt-4 text-center">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formData.fullName}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">@{formData.username}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t('profile.title')}</h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold py-2 px-4 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                        {t('profile.edit')}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold py-2 px-4 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                            {t('profile.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 text-sm bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors shadow-glow-primary"
                        >
                            <CheckIcon className="w-5 h-5" />
                            {t('profile.save')}
                        </button>
                    </div>
                )}
            </div>

            <div className="">
                <dl className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <DetailItem label={t('profile.username')} value={formData.username} name="username" />
                    <DetailItem label={t('profile.fullName')} value={formData.fullName} name="fullName" />
                    <DetailItem label={t('profile.email')} value={formData.email} name="email" type="email" />
                    <DetailItem label={t('profile.phone')} value={formData.phone} name="phone" type="tel" />
                    <DetailItem label={t('profile.degree')} value={formData.degree} name="degree" options={DEGREES} />
                    <DetailItem label={t('profile.location')} value={formData.location} name="location" />
                </dl>
            </div>
        </Card>
    );
};

export default ProfilePage;
