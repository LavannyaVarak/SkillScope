import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ChatMessage } from '../types';
import { PaperAirplaneIcon, XIcon } from './Icon';
import Loader from './Loader';

const API_KEY = process.env.API_KEY;

interface ChatbotProps {
    onClose: () => void;
    language: string;
    t: (key: string) => string;
}

const suggestedPrompts = ['suggestion1', 'suggestion2', 'suggestion3', 'suggestion4'];

// Helper to convert message format to the format required by the GenAI SDK
const convertMessagesToHistoryForModel = (msgs: ChatMessage[], greetingText: string): Content[] => {
    const historyToConvert = msgs.length > 0 && msgs[0].text === greetingText 
        ? msgs.slice(1) 
        : msgs;
    
    return historyToConvert.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));
};

const Chatbot: React.FC<ChatbotProps> = ({ onClose, language, t }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load history and initialize chat when language changes
    useEffect(() => {
        if (!API_KEY) {
            console.error("API_KEY not set for chatbot");
            setMessages([{ sender: 'bot', text: t('chatbot.error.config') }]);
            return;
        }

        const greetingText = t('chatbot.greeting');
        let initialMessages: ChatMessage[];
        try {
            const savedHistory = localStorage.getItem(`skillscope_chat_history_${language}`);
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                initialMessages = (Array.isArray(parsed) && parsed.length > 0) ? parsed : [{ sender: 'bot', text: greetingText }];
            } else {
                initialMessages = [{ sender: 'bot', text: greetingText }];
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
            initialMessages = [{ sender: 'bot', text: greetingText }];
        }

        setMessages(initialMessages);

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const chatHistoryForModel = convertMessagesToHistoryForModel(initialMessages, greetingText);
        
        const chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistoryForModel,
            config: {
                systemInstruction: `You are CareerBot, an expert career coach and job market analyst. Be friendly, helpful, and concise. Help users with their questions about skills, careers, and courses. Your response MUST be in ${language}.`,
            },
        });
        setChat(chatSession);
    }, [language, t]);
    
    // Save history to localStorage whenever messages change
    useEffect(() => {
        // Only save if there's an actual conversation (more than just the initial greeting)
        if (messages.length > 1) {
            try {
                localStorage.setItem(`skillscope_chat_history_${language}`, JSON.stringify(messages));
            } catch (e) {
                console.error("Failed to save chat history to localStorage", e);
            }
        }
    }, [messages, language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async (messageOverride?: string) => {
        const messageToSend = messageOverride || userInput;
        if (!messageToSend.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { sender: 'user', text: messageToSend };
        setMessages(prev => [...prev, userMessage]);
        
        if (!messageOverride) {
            setUserInput('');
        }
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: messageToSend });
            const botMessage: ChatMessage = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: t('chatbot.error.connect') };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading, chat, t]);
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-md h-[calc(100%-5rem)] max-h-[600px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
            <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-t-xl">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{t('chatbot.title')}</h3>
                <button onClick={onClose} className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>
            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-[80%] p-3 rounded-lg bg-zinc-200 dark:bg-zinc-700">
                             <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                <Loader />
                                <span>{t('chatbot.thinking')}</span>
                            </div>
                         </div>
                    </div>
                )}
                 {messages.length === 1 && !isLoading && (
                    <div className="animate-fade-in space-y-2">
                        <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">{t('chatbot.suggestionsTitle')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {suggestedPrompts.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleSendMessage(t(`chatbot.${key}`))}
                                    className="p-3 bg-neutral-100 dark:bg-zinc-800/80 rounded-lg text-sm text-zinc-700 dark:text-zinc-200 text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    {t(`chatbot.${key}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-zinc-950 rounded-lg pr-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chatbot.placeholder.ask')}
                        className="w-full bg-transparent p-3 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSendMessage()} disabled={isLoading || !userInput.trim()} className="bg-secondary p-2 rounded-full text-white hover:bg-secondary-focus disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors">
                        <PaperAirplaneIcon className="w-5 h-5"/>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chatbot;