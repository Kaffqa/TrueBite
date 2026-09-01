import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Clock, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-green-950/80 backdrop-blur-xl border-t border-green-900/50 flex justify-around items-center px-4 z-40 pb-safe">
      <NavLink 
        to="/app" 
        end
        className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-green-400' : 'text-green-700 hover:text-green-500'}`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-mono">Home</span>
      </NavLink>

      <NavLink 
        to="/app/history" 
        className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-green-400' : 'text-green-700 hover:text-green-500'}`}
      >
        <Clock className="w-6 h-6" />
        <span className="text-[10px] font-mono">History</span>
      </NavLink>

      <div className="relative -top-6">
        <NavLink 
          to="/app/scan"
          className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-green-50 shadow-[0_0_20px_rgba(34,197,94,0.3)] border-4 border-background hover:scale-105 transition-transform"
        >
          <ScanLine className="w-7 h-7" />
        </NavLink>
      </div>

      <NavLink 
        to="/app/settings" 
        className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-green-400' : 'text-green-700 hover:text-green-500'}`}
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-mono">Settings</span>
      </NavLink>
    </nav>
  );
}