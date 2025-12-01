import React, { useState } from 'react';
import Card from './Card';
import { EnvelopeIcon, PaperAirplaneIcon } from './Icon';

interface ContactPageProps {
    t: (key: string, params?: Record<string, string | number>) => string;
}

const ContactPage: React.FC<ContactPageProps> = ({ t }) => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [emailError, setEmailError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        if (name === 'email') {
            setEmailError(''); // Clear error on change
        }
    };
    
    const validateEmail = (email: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { name, email, subject, message } = formState;

        if (!validateEmail(email)) {
            setEmailError(t('contact.error.invalidEmail'));
            return;
        }
        
        try {
            const submissionDate = new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' });
            
            const finalSubject = subject.trim() || `Message from ${name} via SkillScope`;

            const body = 
`You have received a new message from your SkillScope contact form.

Date & Time: ${submissionDate}
From: ${name}
Email: ${email}
________________________________

Message:
${message}`;

            const mailtoLink = `mailto:contact.skillscope@gmail.com?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`;

            window.location.href = mailtoLink;
            
            setToast({ type: 'success', message: t('contact.success') });
            setTimeout(() => setToast(null), 5000);
            
            setFormState({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Failed to construct or open mailto link:", error);
            setToast({ type: 'error', message: t('contact.error') });
            setTimeout(() => setToast(null), 5000);
        }
    };

  return (
    <>
        {toast && (
            <div
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg shadow-lg text-white text-sm font-semibold animate-fade-in-up ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
            >
                {toast.message}
            </div>
        )}
        <div className="max-w-lg mx-auto">
            <Card>
                <h3 className="text-2xl font-bold mb-6 flex items-center"><EnvelopeIcon className="w-6 h-6 mr-3 text-primary"/> {t('contact.title')}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t('contact.label.name')}</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={formState.name}
                            onChange={handleInputChange}
                            required 
                            className="w-full p-3 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-primary focus:border-primary transition" 
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t('contact.label.email')}</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={formState.email}
                            onChange={handleInputChange}
                            required 
                            className={`w-full p-3 bg-neutral-100 dark:bg-zinc-950 border ${emailError ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} rounded-lg focus:ring-primary focus:border-primary transition`} 
                        />
                        {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t('contact.label.subject')}</label>
                        <input 
                            type="text" 
                            name="subject" 
                            id="subject" 
                            value={formState.subject}
                            onChange={handleInputChange}
                            placeholder={t('contact.placeholder.subject')}
                            className="w-full p-3 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-primary focus:border-primary transition" 
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">{t('contact.label.message')}</label>
                        <textarea 
                            name="message" 
                            id="message" 
                            rows={5} 
                            value={formState.message}
                            onChange={handleInputChange}
                            required 
                            className="w-full p-3 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-primary focus:border-primary transition resize-none">
                        </textarea>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary flex items-center justify-center gap-2">
                        <PaperAirplaneIcon className="w-5 h-5"/>
                        {t('contact.button')}
                    </button>
                </form>
            </Card>
        </div>
    </>
  );
};

export default ContactPage;
