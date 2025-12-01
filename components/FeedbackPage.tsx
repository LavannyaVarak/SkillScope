import React from 'react';
import Card from './Card';
import { User } from '../types';
import { InformationCircleIcon, PlusIcon } from './Icon';

interface FeedbackPageProps {
    t: (key: string) => string;
    user: User | null;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ t }) => {
    // -----------------------------------------------------------------------------------------
    // 🔧 CONFIGURATION REQUIRED:
    // 1. Create a Google Form (https://forms.google.com)
    // 2. Click 'Send' -> '< >' (Embed HTML) -> Copy the URL inside 'src="..."'
    // 3. Paste the URL inside the quotes below.
    // -----------------------------------------------------------------------------------------
    const googleFormUrl: string = "https://docs.google.com/forms/d/e/1FAIpQLScEEeW1hgeWB41lWgWSEEUvpzPztauMW9c-9m0-n1vq-Hqhog/viewform?embedded=true"; 
    // Example format: "https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?embedded=true"

    const isConfigured = googleFormUrl && !googleFormUrl.includes('PLACEHOLDER');

    return (
        <Card className="max-w-4xl mx-auto min-h-[600px]">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-primary mb-4">{t('feedback.title')}</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    {t('feedback.description')}
                </p>
            </div>
            
            <div className="w-full bg-neutral-50 dark:bg-zinc-950 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[500px] relative">
                {isConfigured ? (
                    <iframe 
                        src={googleFormUrl} 
                        width="100%" 
                        height="800" 
                        frameBorder="0" 
                        marginHeight={0} 
                        marginWidth={0}
                        title="Feedback Form"
                        className="w-full h-full min-h-[800px]"
                    >
                        Loading…
                    </iframe>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="bg-zinc-200 dark:bg-zinc-800 p-4 rounded-full mb-4">
                            <InformationCircleIcon className="w-10 h-10 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Feedback Form Not Configured</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
                            The feedback form needs to be linked to your Google Drive. 
                            Please update the <code>googleFormUrl</code> in <code>components/FeedbackPage.tsx</code>.
                        </p>
                        
                        <div className="text-left bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-300 dark:border-zinc-700 max-w-lg w-full shadow-sm">
                            <h4 className="font-semibold mb-3 text-primary uppercase text-xs tracking-wider">How to connect:</h4>
                            <ol className="list-decimal list-inside space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                                <li>Go to <a href="https://forms.google.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google Forms</a> and create a new form.</li>
                                <li>Add fields for Name, Email, and Feedback.</li>
                                <li>Click <strong>Send</strong> (top right), then the <strong>&lt; &gt;</strong> (Embed) tab.</li>
                                <li>Copy the link inside the <code>src="..."</code> attribute.</li>
                                <li>Paste it into the <code>googleFormUrl</code> variable in the code.</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default FeedbackPage;