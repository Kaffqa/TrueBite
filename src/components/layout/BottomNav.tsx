import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Clock, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-[#e8efe9] flex justify-around items-center px-4 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <NavLink 
        to="/app" 
        end
        className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#407656]' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-mono">Home</span>
      </NavLink>

      <NavLink 
        to="/app/history" 
        className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#407656]' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}
      >
        <Clock className="w-6 h-6" />
        <span className="text-[10px] font-mono">History</span>
      </NavLink>

      <div className="relative -top-6">
        <NavLink 
          to="/app/scan"
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b from-[#5c8b71] to-[#3a684f] text-white shadow-[0_4px_15px_rgba(92,139,113,0.4)] border-4 border-white hover:scale-105 transition-transform"
        >
          <ScanLine className="w-7 h-7" />
        </NavLink>
      </div>

      <NavLink 
        to="/app/settings" 
        className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#407656]' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-mono">Settings</span>
      </NavLink>
    </nav>
  );
}