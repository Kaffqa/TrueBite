import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultView = 'signup' }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup'>(defaultView);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema)
  });

  // Reset form and error when view changes or modal closes/opens
  React.useEffect(() => {
    reset();
    setError(null);
  }, [view, isOpen, reset]);

  // Sync default view if it changes from outside
  React.useEffect(() => {
    setView(defaultView);
  }, [defaultView, isOpen]);

  const onSubmit = async (data: AuthFormValues) => {
    try {
      setError(null);
      if (view === 'login') {
        await signInWithEmail(data.email, data.password);
      } else {
        await signUpWithEmail(data.email, data.password);
      }
      onClose();
      navigate('/app');
    } catch (err: any) {
      setError(err.message || `Failed to ${view === 'login' ? 'sign in' : 'sign up'}`);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      onClose();
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#163323]/40 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
          className="relative w-full max-w-[440px] bg-[#F6F4EB] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/40"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#163323]/5 hover:bg-[#163323]/10 text-[#163323]/60 transition-colors z-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Header */}
          <div className="pt-8 pb-4 px-8 text-center flex flex-col items-center border-b border-[#163323]/5">
            <img src="/logo.png?v=2" alt="TrueBite" className="w-10 h-10 object-contain mb-5" />
            
            {/* Segmented Control */}
            <div className="flex items-center bg-[#163323]/5 p-1 rounded-full mb-6 relative">
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-400 ease-out ${view === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
              />
              <button 
                type="button"
                onClick={() => setView('login')}
                className={`relative z-10 w-28 py-[7px] text-[12px] uppercase tracking-wider font-mono font-bold transition-colors duration-300 ${view === 'login' ? 'text-[#163323]' : 'text-[#163323]/40 hover:text-[#163323]/70'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setView('signup')}
                className={`relative z-10 w-28 py-[7px] text-[12px] uppercase tracking-wider font-mono font-bold transition-colors duration-300 ${view === 'signup' ? 'text-[#163323]' : 'text-[#163323]/40 hover:text-[#163323]/70'}`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(4px)', y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <h2 className="text-[34px] font-serif text-[#163323] tracking-tight leading-none">
                  {view === 'login' ? 'Welcome Back' : 'Join Truebite'}
                </h2>
                <p className="text-[#163323]/60 font-mono text-[13px] mt-3">
                  {view === 'login' 
                    ? 'Sign in to access your food journal.' 
                    : 'Start tracking your meals with absolute confidence.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col">
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-mono text-center border border-red-100">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col">
              <div>
                <input 
                  {...register('email')} 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#163323]/10 text-[#163323] placeholder-[#163323]/40 font-mono text-[14px] focus:outline-none focus:ring-2 focus:ring-[#5c8263]/30 focus:border-[#5c8263] transition-all"
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-[11px] mt-1.5 font-mono px-1">
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <input 
                  {...register('password')} 
                  type="password" 
                  placeholder="Password" 
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#163323]/10 text-[#163323] placeholder-[#163323]/40 font-mono text-[14px] focus:outline-none focus:ring-2 focus:ring-[#5c8263]/30 focus:border-[#5c8263] transition-all"
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-[11px] mt-1.5 font-mono px-1">
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[13px] rounded-full text-[13.5px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.25)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-bold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={view}
                      initial={{ opacity: 0, filter: 'blur(2px)', x: -5 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                      exit={{ opacity: 0, filter: 'blur(2px)', x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {view === 'login' ? 'Sign In' : 'Create Free Account'}
                    </motion.span>
                  </AnimatePresence>
                )}
              </button>
            </form>

            <div className="mt-8 mb-6 flex items-center w-full">
              <div className="flex-1 h-px bg-[#163323]/10"></div>
              <span className="px-4 text-[11px] uppercase tracking-wider font-mono text-[#163323]/30">or</span>
              <div className="flex-1 h-px bg-[#163323]/10"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3.5 rounded-xl border border-[#163323]/10 bg-white hover:bg-gray-50 text-[#163323] font-mono text-[13px] font-bold transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
