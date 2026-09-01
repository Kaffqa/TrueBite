import React from 'react';
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
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      await signInWithEmail(data.email, data.password);
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
}