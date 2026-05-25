

import React, { useState } from 'react';
import Loader from './Loader';
import { User } from '../types';
import { LANGUAGES, SECURITY_QUESTIONS, DEGREES } from '../constants';
import { LanguageIcon, SkillScopeLogo } from './Icon';
import ThemeToggle from './ThemeToggle';

interface LoginPageProps {
  onLogin: (user: User) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, language, onLanguageChange, t }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot_user' | 'forgot_secret' | 'forgot_reset'>('login');
  
  // Common state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields state
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    degree: '',
    location: '',
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });
  
  // Forgot password state
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const getUsers = (): User[] => {
    try {
      const usersJSON = localStorage.getItem('pathshala_users');
      return usersJSON ? JSON.parse(usersJSON) : [];
    } catch (e) {
      return [];
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    const { fullName, email, phone, degree, location, username, password, confirmPassword, securityAnswer } = formState;
    if (!fullName || !email || !phone || !degree || !location || !username || !password || !confirmPassword || !securityAnswer) {
      setError(t('login.error.allFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('login.error.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('login.error.passwordLength'));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        setError(t('login.error.emailTaken'));
      } else if (users.some(u => u.username === username)) {
        setError(t('login.error.userTaken'));
      } else if (users.some(u => u.phone === phone)) {
        setError(t('login.error.phoneTaken'));
      } else {
        const newUser: User = {
            fullName, email, phone, degree, location, username, password, securityQuestion: formState.securityQuestion, securityAnswer
        };
        users.push(newUser);
        localStorage.setItem('pathshala_users', JSON.stringify(users));
        setSuccess(t('login.success.signup'));
        setView('login');
        setFormState(prev => ({ ...prev, password: '', confirmPassword: ''}));
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Use 'email' state field for the login input (which can be email OR username)
    const { email: loginInput, password } = formState;
    
    if (!loginInput || !password) {
      setError(t('login.error.credentials'));
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const users = getUsers();
      // Changed matching logic to use email OR username
      const user = users.find(u => 
        u.email.toLowerCase() === loginInput.toLowerCase() || 
        u.username.toLowerCase() === loginInput.toLowerCase()
      );

      if (user && user.password === password) {
        onLogin(user);
      } else {
        setError(t('login.error.credentials'));
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { email } = formState;
    const users = getUsers();
    // Lookup by email now
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        setUserToReset(user);
        setView('forgot_secret');
    } else {
        setError(t('login.forgot.noAccount'));
    }
  };

  const handleForgotSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (userToReset && formState.securityAnswer.toLowerCase() === userToReset.securityAnswer.toLowerCase()) {
        setView('forgot_reset');
    } else {
        setError(t('login.forgot.incorrectAnswer'));
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { password, confirmPassword } = formState;
    if (password !== confirmPassword) {
        setError(t('login.error.passwordMismatch'));
        return;
    }
    if (password.length < 6) {
        setError(t('login.error.passwordLength'));
        return;
    }
    const users = getUsers();
    // Find user by email to update password
    const userIndex = users.findIndex(u => u.email === userToReset!.email);
    if (userIndex > -1) {
        users[userIndex].password = password;
        localStorage.setItem('pathshala_users', JSON.stringify(users));
        setSuccess(t('login.success.reset'));
        setView('login');
        setUserToReset(null);
        setFormState(prev => ({ ...prev, password: '', confirmPassword: '', securityAnswer: '' }));
    } else {
        setError(t('login.error.unexpected'));
    }
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Changed type to 'text' to accept username or email, and updated placeholder */}
      <input name="email" type="text" onChange={handleInputChange} placeholder={t('login.emailPlaceholder')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <input name="password" type="password" onChange={handleInputChange} placeholder={t('login.passwordPlaceholder')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary disabled:bg-zinc-600 disabled:shadow-none flex justify-center">
        {isLoading ? <Loader/> : t('login.button')}
      </button>
      <p className="text-center text-sm"><button type="button" onClick={() => { setView('forgot_user'); setError(''); setSuccess(''); }} className="font-semibold text-primary hover:underline">{t('login.forgotLink')}</button></p>
      <p className="text-center text-sm">{t('login.noAccount')} <button type="button" onClick={() => { setView('signup'); setError(''); setSuccess(''); }} className="font-semibold text-primary hover:underline">{t('login.signupLink')}</button></p>
    </form>
  );

  const renderSignUp = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="fullName" onChange={handleInputChange} placeholder={t('login.placeholder.fullName')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
        <input name="email" type="email" onChange={handleInputChange} placeholder={t('login.placeholder.email')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
        <input name="phone" type="tel" onChange={handleInputChange} placeholder={t('login.placeholder.phone')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
        <select 
          name="degree" 
          id="degree-select"
          value={formState.degree}
          onChange={handleInputChange} 
          required 
          className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"
        >
          <option value="" disabled>{t('login.placeholder.degree')}</option>
          {DEGREES.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">{t('login.uniqueFieldsInfo')}</p>
      <input name="location" onChange={handleInputChange} placeholder={t('login.placeholder.location')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <input name="username" onChange={handleInputChange} placeholder={t('login.placeholder.usernameCreate')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="password" type="password" onChange={handleInputChange} placeholder={t('login.placeholder.passwordCreate')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
        <input name="confirmPassword" type="password" onChange={handleInputChange} placeholder={t('login.placeholder.passwordConfirm')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      </div>
      <select name="securityQuestion" value={formState.securityQuestion} onChange={handleInputChange} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg">
        {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
      </select>
      <input name="securityAnswer" onChange={handleInputChange} placeholder={t('login.placeholder.securityAnswer')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary disabled:bg-zinc-600 disabled:shadow-none flex justify-center">
        {isLoading ? <Loader/> : t('login.signupButton')}
      </button>
      <p className="text-center text-sm">{t('login.alreadyAccount')} <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="font-semibold text-primary hover:underline">{t('login.signinLink')}</button></p>
    </form>
  );
  
  const renderForgotUser = () => (
    <form onSubmit={handleForgotUserSubmit} className="space-y-4">
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t('login.forgot.enterEmail')}</p>
      <input name="email" type="email" onChange={handleInputChange} placeholder={t('login.emailPlaceholder')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary disabled:bg-zinc-600 disabled:shadow-none flex justify-center">
        {isLoading ? <Loader/> : t('login.button.continue')}
      </button>
      <p className="text-center text-sm"><button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="font-semibold text-primary hover:underline">{t('login.forgot.back')}</button></p>
    </form>
  );

  const renderForgotSecret = () => (
    <form onSubmit={handleForgotSecretSubmit} className="space-y-4">
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t('login.forgot.securityQuestion')}</p>
      <p className="text-center font-semibold">{userToReset?.securityQuestion}</p>
      <input name="securityAnswer" type="text" onChange={handleInputChange} placeholder={t('login.placeholder.yourAnswer')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
      <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary disabled:bg-zinc-600 disabled:shadow-none flex justify-center">
        {isLoading ? <Loader/> : t('login.button.verify')}
      </button>
       <p className="text-center text-sm"><button type="button" onClick={() => { setView('forgot_user'); setError(''); setSuccess(''); }} className="font-semibold text-primary hover:underline">{t('login.forgot.differentUser')}</button></p>
    </form>
  );

  const renderResetPassword = () => (
     <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400" dangerouslySetInnerHTML={{ __html: t('login.forgot.resetPasswordFor', { email: userToReset?.email || '' }) }} />
        <input name="password" type="password" onChange={handleInputChange} placeholder={t('login.placeholder.passwordNew')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
        <input name="confirmPassword" type="password" onChange={handleInputChange} placeholder={t('login.placeholder.passwordConfirmNew')} required className="w-full p-3 bg-neutral-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg"/>
        <button type="submit" disabled={isLoading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-all duration-300 hover:shadow-glow-primary disabled:bg-zinc-600 disabled:shadow-none flex justify-center">
            {isLoading ? <Loader/> : t('login.button.reset')}
        </button>
     </form>
  );
  
  const renderView = () => {
    switch(view) {
        case 'login': return renderLogin();
        case 'signup': return renderSignUp();
        case 'forgot_user': return renderForgotUser();
        case 'forgot_secret': return renderForgotSecret();
        case 'forgot_reset': return renderResetPassword();
        default: return renderLogin();
    }
  };

  const titles: { [key: string]: string } = {
    login: t('login.welcome'),
    signup: t('login.signupTitle'),
    forgot_user: t('login.forgotTitle'),
    forgot_secret: t('login.securityTitle'),
    forgot_reset: t('login.resetTitle')
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 relative border border-zinc-200 dark:border-zinc-800">
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
                <LanguageIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none" />
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    aria-label={t('language.select.label')}
                    className="bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg focus:ring-primary focus:border-primary pl-10 pr-4 py-2 text-sm appearance-none"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="text-center mb-6">
          <SkillScopeLogo className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{t('app.title')}</h1>
          <p className="text-md text-zinc-500 dark:text-zinc-400 mt-1 mb-6">{t('app.tagline')}</p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{titles[view]}</h2>
        </div>
        
        {error && <p className="text-sm text-center text-red-500 dark:text-red-400 mb-4 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</p>}
        {success && <p className="text-sm text-center text-green-500 dark:text-green-400 mb-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">{success}</p>}

        {renderView()}

      </div>
    </div>
  );
};

export default LoginPage;