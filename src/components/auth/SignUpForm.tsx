import React from 'react';
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
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setError(null);
      await signUpWithEmail(data.email, data.password);
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
}