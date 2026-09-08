import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/app', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/app', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f7f9f8] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#1a3825] mb-4" />
      <h2 className="font-serif text-2xl text-[#1e4832]">Completing sign in...</h2>
      <p className="font-mono text-[12px] text-[#8ba797] mt-2">Please wait a moment.</p>
    </div>
  );
}