import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresFour, BookOpenText, Scan, Note, User } from '@phosphor-icons/react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e8efe9] flex justify-around items-center px-2 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <NavLink to="/app" end className="w-16">
        {({ isActive }) => (
          <div className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#1e4832] font-semibold' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}>
            <SquaresFour size={24} weight={isActive ? "fill" : "regular"} />
            <span className="text-[10px] font-mono whitespace-nowrap">Dashboard</span>
          </div>
        )}
      </NavLink>

      <NavLink to="/app/history" className="w-16">
        {({ isActive }) => (
          <div className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#1e4832] font-semibold' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}>
            <BookOpenText size={24} weight={isActive ? "fill" : "regular"} />
            <span className="text-[10px] font-mono whitespace-nowrap">Daily Log</span>
          </div>
        )}
      </NavLink>

      <div className="relative -top-5 flex justify-center w-16">
        <NavLink 
          to="/app/scan"
          className="flex items-center justify-center w-[52px] h-[52px] rounded-[8px] bg-gradient-to-b from-[#6b9279] to-[#1a3825] text-white shadow-[0_4px_10px_rgba(26,56,37,0.25)] border-[3px] border-white hover:scale-105 transition-transform"
        >
          <Scan size={26} weight="fill" />
        </NavLink>
      </div>

      <NavLink to="/app/ingredients" className="w-16">
        {({ isActive }) => (
          <div className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#1e4832] font-semibold' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}>
            <Note size={24} weight={isActive ? "fill" : "regular"} />
            <span className="text-[10px] font-mono whitespace-nowrap">Ingredients</span>
          </div>
        )}
      </NavLink>

      <NavLink to="/app/settings" className="w-16">
        {({ isActive }) => (
          <div className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-[#1e4832] font-semibold' : 'text-[#a4b5aa] hover:text-[#6b8274]'}`}>
            <User size={24} weight={isActive ? "fill" : "regular"} />
            <span className="text-[10px] font-mono whitespace-nowrap">Profile</span>
          </div>
        )}
      </NavLink>
    </nav>
  );
}