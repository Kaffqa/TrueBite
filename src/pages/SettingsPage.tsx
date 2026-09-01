import React from 'react';
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
}