import React from 'react';
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
}