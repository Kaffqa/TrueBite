const fs = require('fs');
const path = require('path');

const files = {
  "src/main.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import App from '@/App';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);`,

  "src/App.tsx": `import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import AuthCallback from '@/components/auth/AuthCallback';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import ScannerPage from '@/pages/ScannerPage';
import ScanResultPage from '@/pages/ScanResultPage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import AppShell from '@/components/layout/AppShell';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/onboarding" element={
          <ProtectedRoute requireOnboarded={false}>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="scan" element={<ScannerPage />} />
          <Route path="scan/:id" element={<ScanResultPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}`,

  "src/components/auth/LoginForm.tsx": `import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-2xl bg-green-900/40 backdrop-blur-md border border-green-800/50 shadow-xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-5xl font-serif text-green-50 mb-2">TrueBite</h1>
        <p className="text-green-200 font-mono text-sm">Scan. Know. Eat Safe.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/50 text-red-200 text-sm font-mono text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input 
            {...register('email')} 
            type="email" 
            placeholder="Email Address" 
            className="w-full px-4 py-3 rounded-xl bg-green-800/50 border border-green-700/50 text-green-50 placeholder-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          {errors.email && <p className="text-red-300 text-xs mt-1 font-mono">{errors.email.message}</p>}
        </div>

        <div>
          <input 
            {...register('password')} 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-xl bg-green-800/50 border border-green-700/50 text-green-50 placeholder-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          {errors.password && <p className="text-red-300 text-xs mt-1 font-mono">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-green-500 text-green-50 font-bold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 flex items-center">
        <div className="flex-1 h-px bg-green-800"></div>
        <span className="px-4 text-xs font-mono text-green-400">or continue with</span>
        <div className="flex-1 h-px bg-green-800"></div>
      </div>

      <button 
        onClick={() => signInWithGoogle()}
        className="mt-6 w-full py-3 rounded-xl border border-green-700 text-green-50 font-bold hover:bg-green-800/50 transition-colors flex items-center justify-center gap-2 font-mono"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </button>

      <div className="mt-8 text-center font-mono text-sm text-green-300">
        Don't have an account? <Link to="/signup" className="text-green-400 hover:text-green-300 underline underline-offset-4">Sign Up</Link>
      </div>
    </motion.div>
  );
}`,

  "src/components/auth/SignUpForm.tsx": `import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setError(null);
      await signUp(data.email, data.password);
      // Wait a moment and navigate to onboarding
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-2xl bg-green-900/40 backdrop-blur-md border border-green-800/50 shadow-xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-5xl font-serif text-green-50 mb-2">TrueBite</h1>
        <p className="text-green-200 font-mono text-sm">Join the safe eating community.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/50 text-red-200 text-sm font-mono text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input 
            {...register('email')} 
            type="email" 
            placeholder="Email Address" 
            className="w-full px-4 py-3 rounded-xl bg-green-800/50 border border-green-700/50 text-green-50 placeholder-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          {errors.email && <p className="text-red-300 text-xs mt-1 font-mono">{errors.email.message}</p>}
        </div>

        <div>
          <input 
            {...register('password')} 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-xl bg-green-800/50 border border-green-700/50 text-green-50 placeholder-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          {errors.password && <p className="text-red-300 text-xs mt-1 font-mono">{errors.password.message}</p>}
        </div>

        <div>
          <input 
            {...register('confirmPassword')} 
            type="password" 
            placeholder="Confirm Password" 
            className="w-full px-4 py-3 rounded-xl bg-green-800/50 border border-green-700/50 text-green-50 placeholder-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          {errors.confirmPassword && <p className="text-red-300 text-xs mt-1 font-mono">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-green-500 text-green-50 font-bold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 flex items-center">
        <div className="flex-1 h-px bg-green-800"></div>
        <span className="px-4 text-xs font-mono text-green-400">or continue with</span>
        <div className="flex-1 h-px bg-green-800"></div>
      </div>

      <button 
        onClick={() => signInWithGoogle()}
        className="mt-6 w-full py-3 rounded-xl border border-green-700 text-green-50 font-bold hover:bg-green-800/50 transition-colors flex items-center justify-center gap-2 font-mono"
      >
        Google
      </button>

      <div className="mt-8 text-center font-mono text-sm text-green-300">
        Already have an account? <Link to="/login" className="text-green-400 hover:text-green-300 underline underline-offset-4">Sign In</Link>
      </div>
    </motion.div>
  );
}`,

  "src/components/auth/AuthCallback.tsx": `import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      } else {
        navigate('/login');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-green-50">
      <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
      <h2 className="font-serif text-2xl">Completing sign in...</h2>
      <p className="font-mono text-green-400 mt-2">Please wait a moment.</p>
    </div>
  );
}`,

  "src/pages/LoginPage.tsx": `import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}`,

  "src/pages/SignUpPage.tsx": `import React from 'react';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SignUpForm />
    </div>
  );
}`,

  "src/pages/OnboardingPage.tsx": `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { OnboardingData } from '@/types/common.types';
import { calculateTDEE } from '@/lib/tdee-calculator';

// Placeholder components for the steps
const StepBasicInfo = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Basic Information</h2>
    <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.full_name || ''} onChange={e => updateData({ full_name: e.target.value })} />
    <input type="date" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.birth_date || ''} onChange={e => updateData({ birth_date: e.target.value })} />
    <select className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.gender || ''} onChange={e => updateData({ gender: e.target.value })}>
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
);

const StepBodyMetrics = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Body Metrics</h2>
    <input type="number" placeholder="Height (cm)" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.height_cm || ''} onChange={e => updateData({ height_cm: Number(e.target.value) })} />
    <input type="number" placeholder="Weight (kg)" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.weight_kg || ''} onChange={e => updateData({ weight_kg: Number(e.target.value) })} />
    <input type="number" placeholder="Target Weight (kg) - Optional" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.target_weight_kg || ''} onChange={e => updateData({ target_weight_kg: Number(e.target.value) })} />
  </div>
);

const StepActivityLevel = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Activity & Goals</h2>
    <select className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.activity_level || ''} onChange={e => updateData({ activity_level: e.target.value })}>
      <option value="">Select Activity Level</option>
      <option value="sedentary">Sedentary</option>
      <option value="lightly_active">Lightly Active</option>
      <option value="moderately_active">Moderately Active</option>
      <option value="very_active">Very Active</option>
      <option value="extra_active">Extra Active</option>
    </select>
    <select className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.health_goal || ''} onChange={e => updateData({ health_goal: e.target.value })}>
      <option value="">Select Goal</option>
      <option value="lose_weight">Lose Weight</option>
      <option value="maintain_weight">Maintain Weight</option>
      <option value="gain_weight">Gain Weight</option>
      <option value="build_muscle">Build Muscle</option>
    </select>
  </div>
);

const StepAllergies = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Allergies & Intolerances</h2>
    <p className="text-green-300 text-sm">Select applicable options.</p>
    {['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Lactose', 'Gluten'].map(item => (
      <label key={item} className="flex items-center space-x-2 text-green-50">
        <input 
          type="checkbox" 
          checked={(data.allergies || []).includes(item)}
          onChange={(e) => {
            const newAllergies = e.target.checked 
              ? [...(data.allergies || []), item]
              : (data.allergies || []).filter((a: string) => a !== item);
            updateData({ allergies: newAllergies });
          }}
          className="rounded bg-green-900 border-green-700 text-green-500 focus:ring-green-500"
        />
        <span>{item}</span>
      </label>
    ))}
  </div>
);

const StepMedicalConditions = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Medical Conditions</h2>
    <p className="text-green-300 text-sm">Select applicable options.</p>
    {['Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Celiac Disease', 'IBS', 'GERD'].map(item => (
      <label key={item} className="flex items-center space-x-2 text-green-50">
        <input 
          type="checkbox" 
          checked={(data.medical_conditions || []).includes(item)}
          onChange={(e) => {
            const newCond = e.target.checked 
              ? [...(data.medical_conditions || []), item]
              : (data.medical_conditions || []).filter((a: string) => a !== item);
            updateData({ medical_conditions: newCond });
          }}
          className="rounded bg-green-900 border-green-700 text-green-500 focus:ring-green-500"
        />
        <span>{item}</span>
      </label>
    ))}
  </div>
);

const StepDietaryPreferences = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Dietary Preferences</h2>
    <p className="text-green-300 text-sm">Select applicable options.</p>
    {['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher'].map(item => (
      <label key={item} className="flex items-center space-x-2 text-green-50">
        <input 
          type="checkbox" 
          checked={(data.dietary_preferences || []).includes(item)}
          onChange={(e) => {
            const newPrefs = e.target.checked 
              ? [...(data.dietary_preferences || []), item]
              : (data.dietary_preferences || []).filter((a: string) => a !== item);
            updateData({ dietary_preferences: newPrefs });
          }}
          className="rounded bg-green-900 border-green-700 text-green-500 focus:ring-green-500"
        />
        <span>{item}</span>
      </label>
    ))}
  </div>
);

const StepReview = ({ data }: any) => {
  const preview = calculateTDEE({
    weight_kg: data.weight_kg,
    height_cm: data.height_cm,
    age: data.birth_date ? new Date().getFullYear() - new Date(data.birth_date).getFullYear() : 30,
    gender: data.gender,
    activity_level: data.activity_level,
    health_goal: data.health_goal
  });

  return (
    <div className="space-y-4 font-mono text-green-50">
      <h2 className="text-2xl font-serif">Review & Results</h2>
      <div className="bg-green-800/40 p-4 rounded-xl border border-green-700/50">
        <h3 className="font-bold text-green-300 mb-2">Estimated Needs</h3>
        <p>BMR: {preview.bmr} kcal</p>
        <p>TDEE: {preview.tdee} kcal</p>
        <p className="text-xl font-bold mt-2 text-white">Target Calories: {preview.targetCalories} kcal/day</p>
      </div>
    </div>
  );
};

const steps = [
  { id: 'basic', component: StepBasicInfo },
  { id: 'body', component: StepBodyMetrics },
  { id: 'activity', component: StepActivityLevel },
  { id: 'allergies', component: StepAllergies },
  { id: 'medical', component: StepMedicalConditions },
  { id: 'dietary', component: StepDietaryPreferences },
  { id: 'review', component: StepReview },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const { completeOnboarding } = useProfile();
  const navigate = useNavigate();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleComplete = async () => {
    await completeOnboarding(data as OnboardingData);
    navigate('/');
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-background text-green-50 flex flex-col p-6">
      <div className="w-full max-w-md mx-auto pt-8 flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="w-full bg-green-900 rounded-full h-2 mb-8">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: \`\${((currentStep + 1) / steps.length) * 100}%\` }}
          />
        </div>

        <div className="flex-1 bg-green-900/20 p-6 rounded-3xl border border-green-800/50 shadow-xl backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentComponent data={data} updateData={updateData} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 mb-4 font-mono">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-xl bg-green-900 text-green-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-800 transition-colors"
          >
            Back
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button 
              onClick={handleComplete}
              className="px-6 py-3 rounded-xl bg-green-500 text-green-50 font-bold hover:bg-green-400 transition-colors"
            >
              Complete
            </button>
          ) : (
            <button 
              onClick={nextStep}
              className="px-6 py-3 rounded-xl bg-green-500 text-green-50 font-bold hover:bg-green-400 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}`,

  "src/pages/DashboardPage.tsx": `import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { profile } = useProfile();
  
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header>
        <p className="text-green-300 font-mono text-sm">{today}</p>
        <h1 className="text-4xl font-serif text-green-50 mt-1">
          {greeting}, {profile?.full_name?.split(' ')[0] || 'Guest'}!
        </h1>
      </header>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-900/30 p-5 rounded-2xl border border-green-800/50 backdrop-blur-sm">
          <h3 className="font-serif text-xl text-green-100 mb-2">Daily Overview</h3>
          <p className="text-green-400 font-mono text-sm">Calories: 1200 / 2000 kcal</p>
          <div className="w-full bg-green-900 mt-2 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="bg-green-900/30 p-5 rounded-2xl border border-green-800/50 backdrop-blur-sm">
          <h3 className="font-serif text-xl text-green-100 mb-2">Recent Scans</h3>
          <p className="text-green-400 font-mono text-sm italic">No scans today yet.</p>
        </div>
      </div>
    </motion.div>
  );
}`,

  "src/pages/ScannerPage.tsx": `import React from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScannerPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-6 text-white z-10 absolute top-0 w-full bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/40 backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
        <span className="font-serif text-xl">Scan Meal</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {/* Camera Viewport Placeholder */}
        <p className="text-green-400/50 font-mono italic">Camera active...</p>
      </div>

      <div className="absolute bottom-0 w-full p-8 pb-12 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent gap-8">
        <button className="p-4 rounded-full bg-green-900/80 text-green-50 backdrop-blur-md">
          <ImageIcon className="w-6 h-6" />
        </button>
        <button className="w-20 h-20 rounded-full bg-green-500 border-4 border-green-200/30 flex items-center justify-center shadow-xl hover:bg-green-400 transition-colors">
          <Camera className="w-8 h-8 text-white" />
        </button>
        <div className="w-[52px]"></div>
      </div>
    </div>
  );
}`,

  "src/pages/ScanResultPage.tsx": `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ScanResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-300 font-mono hover:text-green-100 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Scanner
      </button>

      <div className="bg-green-900/30 rounded-3xl p-6 border border-green-800/50">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-serif text-green-50">Grilled Salmon Salad</h1>
          <div className="bg-green-500/20 text-green-300 p-2 rounded-full">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        
        <p className="font-mono text-sm text-green-200 mb-6">Scan ID: {id}</p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-green-950/50 border border-green-800">
            <h3 className="font-serif text-lg text-white mb-2">Nutrition Facts</h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div className="text-green-300">Calories: <span className="text-white">450</span></div>
              <div className="text-green-300">Protein: <span className="text-white">35g</span></div>
              <div className="text-green-300">Carbs: <span className="text-white">12g</span></div>
              <div className="text-green-300">Fat: <span className="text-white">28g</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-green-950/50 border border-green-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-lg text-white mb-1">Dietary Notes</h3>
              <p className="font-mono text-sm text-green-300">Contains fish. Safe for your profile.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,

  "src/pages/HistoryPage.tsx": `import React from 'react';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-green-50">Scan History</h1>
      
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-green-900/20 rounded-3xl border border-green-800/50">
        <p className="font-mono text-green-400">No scans yet.</p>
        <p className="font-mono text-sm text-green-500">Your scan history will appear here.</p>
      </div>
    </div>
  );
}`,

  "src/pages/SettingsPage.tsx": `import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { LogOut, User, Target, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-green-50">Settings</h1>

      <div className="space-y-4 font-mono">
        <div className="bg-green-900/30 rounded-2xl p-4 border border-green-800/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center text-green-300">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold">{profile?.full_name || 'User'}</h3>
            <p className="text-green-400 text-sm">{profile?.email || 'email@example.com'}</p>
          </div>
        </div>

        <div className="bg-green-900/30 rounded-2xl overflow-hidden border border-green-800/50">
          <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-green-800/30 transition-colors border-b border-green-800/50 text-green-100">
            <Target className="w-5 h-5 text-green-400" />
            <span>Nutrition Targets</span>
          </button>
          <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-green-800/30 transition-colors text-green-100">
            <Shield className="w-5 h-5 text-green-400" />
            <span>Account Security</span>
          </button>
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full p-4 rounded-2xl bg-red-900/20 border border-red-900/50 flex items-center justify-center gap-2 text-red-400 hover:bg-red-900/40 transition-colors mt-8"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}`,

  "src/components/layout/AppShell.tsx": `import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-green-50">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <Outlet />
      </main>
      
      <BottomNav />
    </div>
  );
}`,

  "src/components/layout/Header.tsx": `import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { User } from 'lucide-react';

export default function Header() {
  const { profile } = useProfile();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-green-900/50">
      <div className="text-2xl font-serif text-green-50 tracking-wide">TrueBite</div>
      <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center overflow-hidden border border-green-600">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-green-300" />
        )}
      </div>
    </header>
  );
}`,

  "src/components/layout/BottomNav.tsx": `import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Clock, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-green-950/80 backdrop-blur-xl border-t border-green-900/50 flex justify-around items-center px-4 z-40 pb-safe">
      <NavLink 
        to="/" 
        end
        className={({ isActive }) => \`flex flex-col items-center gap-1 p-2 transition-colors \${isActive ? 'text-green-400' : 'text-green-700 hover:text-green-500'}\`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-mono">Home</span>
      </NavLink>

      <NavLink 
        to="/history" 
        className={({ isActive }) => \`flex flex-col items-center gap-1 p-2 transition-colors \${isActive ? 'text-green-400' : 'text-green-700 hover:text-green-500'}\`}
      >
        <Clock className="w-6 h-6" />
        <span className="text-[10px] font-mono">History</span>
      </NavLink>

      <div className="relative -top-6">
        <NavLink 
          to="/scan"
          className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-green-50 shadow-[0_0_20px_rgba(34,197,94,0.3)] border-4 border-background hover:scale-105 transition-transform"
        >
          <ScanLine className="w-7 h-7" />
        </NavLink>
      </div>

      <NavLink 
        to="/settings" 
        className={({ isActive }) => \`flex flex-col items-center gap-1 p-2 transition-colors \${isActive ? 'text-green-400' : 'text-green-700 hover:text-green-500'}\`}
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-mono">Settings</span>
      </NavLink>
    </nav>
  );
}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join('d:/AMIKOM/lomba/TrueBite', filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Successfully generated all components.');
