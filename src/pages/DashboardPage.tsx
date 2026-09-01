import React from 'react';
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
}