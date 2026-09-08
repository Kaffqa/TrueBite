import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route guard component for authenticated routes.
 */
export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1a3825] animate-spin mb-4" />
        <h1 className="text-2xl font-serif text-[#1e4832]">TrueBite</h1>
        <p className="font-mono text-[12px] text-[#8ba797] mt-2">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (profile && !profile.is_onboarding_completed && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  return <Outlet />;
}

