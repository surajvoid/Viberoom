import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  Lock,
  Mail,
  User as UserIcon,
  AtSign,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { ThemeToggle } from '../../components/ui/ThemeToggle.js';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerHandle, setRegisterHandle] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await login({
        emailOrHandle: loginIdentifier,
        password: loginPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your details.');
      }
    } catch {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await register({
        name: registerName,
        handle: registerHandle,
        email: registerEmail,
        password: registerPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please check the form.');
      } else {
        setSuccessMessage('Account created successfully! Preparing your room...');
      }
    } catch {
      setErrorMessage('Registration failed. Please verify your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-app-bg text-app-text flex flex-col justify-between items-center relative overflow-hidden select-none p-4 sm:p-6 transition-colors duration-200">
      {/* Ambient Lighting Mesh */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-25 bg-[#FF3D81] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-25 bg-[#8B5CF6] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[140px] opacity-15 bg-[#22D3EE] pointer-events-none" />

      {/* Top Bar with Brand & Theme Toggle */}
      <header className="w-full max-w-md flex items-center justify-between z-10 pt-2 sm:pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-chip bg-app-accent flex items-center justify-center shadow-accent-glow text-white">
            <Volume2 size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-extrabold text-[19px] tracking-tight text-app-text block leading-none">
              Vibe<span className="text-app-accent">Room</span>
            </span>
            <span className="text-[10px] font-semibold text-app-muted tracking-wider uppercase">
              Listen Together
            </span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Central Auth Container */}
      <main className="w-full max-w-md z-10 py-6 sm:py-8 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-panel border border-app-border rounded-hero p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Header Message */}
          <div className="text-center space-y-1.5">
            <h2 className="text-section-heading sm:text-page-title font-extrabold text-app-text tracking-tight">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-meta text-app-muted">
              {activeTab === 'login'
                ? 'Sign in to access your private rooms and synced music.'
                : 'Join VibeRoom to listen together in synchronized sessions.'}
            </p>
          </div>

          {/* Segmented Tab Controls: [ Login ] | [ Register / Create Account ] */}
          <div className="flex items-center p-1 rounded-card bg-app-elevated border border-app-border relative">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 px-3 rounded-chip text-body font-bold transition-all relative z-10 ${
                activeTab === 'login' ? 'text-app-text shadow-sm' : 'text-app-muted hover:text-app-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 py-2 px-3 rounded-chip text-body font-bold transition-all relative z-10 ${
                activeTab === 'register' ? 'text-app-text shadow-sm' : 'text-app-muted hover:text-app-text'
              }`}
            >
              Create Account
            </button>

            {/* Sliding Pill Indicator */}
            <motion.div
              layoutId="authTabSlider"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-chip bg-app-surface border border-app-border shadow-sm pointer-events-none ${
                activeTab === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />
          </div>

          {/* Error & Success Feedback Banners */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-card bg-rose-500/10 border border-rose-500/25 text-rose-400 text-meta-sm font-medium"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                <span className="flex-1">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="succ"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-card bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-meta-sm font-medium"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                <span className="flex-1">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form: LOGIN VIEW */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-meta font-bold text-app-text block">
                  Email or Username
                </label>
                <div className="relative flex items-center">
                  <Mail size={17} className="absolute left-3.5 text-app-muted pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@example.com or @handle"
                    className="w-full bg-app-surface text-app-text placeholder-app-muted pl-10 pr-4 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-meta font-bold text-app-text block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={17} className="absolute left-3.5 text-app-muted pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-app-surface text-app-text placeholder-app-muted pl-10 pr-11 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-app-muted hover:text-app-text transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-card bg-app-accent hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-body shadow-accent-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-app-border/40">
                <p className="text-meta-sm text-app-muted">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('register')}
                    className="text-app-accent font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Form: REGISTER / CREATE ACCOUNT VIEW */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-meta font-bold text-app-text block">Your Name</label>
                <div className="relative flex items-center">
                  <UserIcon size={17} className="absolute left-3.5 text-app-muted pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Sophia Chen"
                    className="w-full bg-app-surface text-app-text placeholder-app-muted pl-10 pr-4 py-2.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-meta font-bold text-app-text block">Handle</label>
                  <div className="relative flex items-center">
                    <AtSign size={16} className="absolute left-3 text-app-muted pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={registerHandle}
                      onChange={(e) => setRegisterHandle(e.target.value)}
                      placeholder="sophiac"
                      className="w-full bg-app-surface text-app-text placeholder-app-muted pl-9 pr-3 py-2.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-meta font-bold text-app-text block">Email</label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3 text-app-muted pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="sophia@mail.com"
                      className="w-full bg-app-surface text-app-text placeholder-app-muted pl-9 pr-3 py-2.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-meta font-bold text-app-text block">Password</label>
                <div className="relative flex items-center">
                  <Lock size={17} className="absolute left-3.5 text-app-muted pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-app-surface text-app-text placeholder-app-muted pl-10 pr-11 py-2.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-app-muted hover:text-app-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-card bg-app-accent hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-body shadow-accent-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Start Listening</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-app-border/40">
                <p className="text-meta-sm text-app-muted">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="text-app-accent font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
};
