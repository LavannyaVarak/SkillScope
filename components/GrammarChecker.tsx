
import React, { useState } from 'react';
import Card from './Card';
import Loader from './Loader';
import { correctGrammar } from '../services/geminiService';
import { GrammarCorrection } from '../types';
import { PencilSquareIcon, CheckCircleIcon, LightBulbIcon } from './Icon';

interface GrammarCheckerProps {
    t: (key: string) => string;
}

const GrammarChecker: React.FC<GrammarCheckerProps> = ({ t }) => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<GrammarCorrection | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckGrammar = async () => {
        if (!inputText.trim()) {
            setError(t('grammar.error.empty'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await correctGrammar(inputText);
            setResult(data);
        } catch (err) {
            setError(t('grammar.error.fail'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{t('grammar.title')}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    {t('grammar.description')}
                </p>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('grammar.placeholder')}
                    className="w-full h-48 bg-neutral-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 focus:ring-primary focus:border-primary transition resize-y"
                />
                <button
                    onClick={handleCheckGrammar}
                    disabled={isLoading}
                    className="mt-4 w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-focus transition-all duration-300 hover:shadow-glow-secondary disabled:bg-zinc-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <Loader /> : <><PencilSquareIcon className="w-5 h-5 mr-2"/> {t('grammar.button')}</>}
                </button>
                 {error && <div className="mt-4 text-center text-red-500 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
            </Card>

            {isLoading && !result && (
                <div className="flex justify-center items-center h-40">
                    <Loader />
                </div>
            )}

            {result && (
                <div className="space-y-8 animate-fade-in">
                    <Card>
                         <h3 className="text-xl font-bold mb-4 flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2 text-primary"/> {t('grammar.results.corrected')}</h3>
                         <div className="bg-neutral-100 dark:bg-zinc-950/50 p-4 rounded-lg text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{result.correctedText}</div>
                    </Card>
                     <Card>
                         <h3 className="text-xl font-bold mb-4 flex items-center"><LightBulbIcon className="w-6 h-6 mr-2 text-secondary"/> {t('grammar.results.suggestions')}</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-200 dark:bg-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-l-lg">{t('grammar.table.original')}</th>
                                        <th scope="col" className="px-6 py-3">{t('grammar.table.correction')}</th>
                                        <th scope="col" className="px-6 py-3 rounded-r-lg">{t('grammar.table.reason')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.suggestions.map((item, index) => (
                                         <tr key={index} className="border-b border-zinc-200 dark:border-zinc-800">
                                            <td className="px-6 py-4 text-red-500 dark:text-red-400/80 line-through">{item.original}</td>
                                            <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">{item.corrected}</td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{item.explanation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default GrammarChecker;
