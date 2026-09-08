import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { User, Bell, Search } from 'lucide-react';

export default function Header() {
  const { profile } = useProfile();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white sticky top-0 z-40 border-b border-[#e8efe9]">
      <div className="md:hidden text-[22px] font-black text-[#1e4832] tracking-tight flex items-center gap-2">
        <img src="/logo.png?v=2" alt="Truebite Logo" className="w-11 h-11 object-contain" />
        Truebite
      </div>
      
      {/* Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-lg relative items-center ml-2">
        <Search className="absolute left-3 w-4 h-4 text-[#8ba797] stroke-[2]" />
        <input 
          type="text"
          placeholder="Search food, ingredient or additive code"
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#e0e8e3] rounded-[2px] text-xs text-[#1e4832] placeholder:text-[#a4b5aa] focus:outline-none focus:border-[#5c8b71] font-mono shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="w-8 h-8 flex items-center justify-center rounded-[2px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] text-white shadow-sm border border-[#c0d4c8] hover:shadow-md transition-all">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-[2px] bg-[#e8efe9] flex items-center justify-center overflow-hidden border border-[#c5d1c9] shadow-sm">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-[#6b8274]" />
          )}
        </div>
      </div>
    </header>
  );
}