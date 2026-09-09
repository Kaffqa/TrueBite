import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import AuthCallback from '@/components/auth/AuthCallback';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import ScannerPage from '@/pages/ScannerPage';
import ScanResultPage from '@/pages/ScanResultPage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import IngredientsPage from '@/pages/IngredientsPage';
import AppShell from '@/components/layout/AppShell';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected App Routes */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="scan" element={<ScannerPage />} />
            <Route path="scan/:id" element={<ScanResultPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}