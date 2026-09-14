import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresFour, Scan, BookOpenText, Note, Question, Gear } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

function NavItem({ to, exact, icon: Icon, label }: { to: string, exact?: boolean, icon: any, label: string }) {
  return (
    <NavLink to={to} end={exact} className="relative flex items-center px-4 py-2.5 mx-4 group outline-none">
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-gradient-to-b from-[#6b9279] to-[#1a3825] rounded-[4px] shadow-md z-0"
              initial={false}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          {!isActive && (
            <div className="absolute inset-0 rounded-[4px] group-hover:bg-[#f0f5f2] transition-colors z-0" />
          )}
          <div className={`relative z-10 flex items-center gap-3 w-full transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#8ba797] group-hover:text-[#1e4832]'}`}>
            <Icon size={22} weight={isActive ? "fill" : "regular"} />
            <span className="tracking-wide">{label}</span>
          </div>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#e8efe9] flex flex-col h-screen sticky top-0 hidden md:flex">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#e8efe9] shrink-0">
        <div className="text-[22px] font-black text-[#1e4832] tracking-tight flex items-center gap-2">
          <img src="/logo.png?v=2" alt="Truebite Logo" className="w-11 h-11 object-contain" />
          Truebite
        </div>
      </div>

      <nav className="flex-1 pt-6 space-y-2 font-mono overflow-y-auto">
        <NavItem to="/app" exact icon={SquaresFour} label="Dashboard" />
        <NavItem to="/app/scan" icon={Scan} label="Vision Scanner" />
        <NavItem to="/app/history" icon={BookOpenText} label="Daily Log" />
        <NavItem to="/app/ingredients" icon={Note} label="Ingredients" />
      </nav>

      <div className="pb-8 space-y-2 font-mono pt-4 shrink-0">
        <NavItem to="/app/help" icon={Question} label="Help" />
        <NavItem to="/app/settings" icon={Gear} label="Settings" />
      </div>
    </aside>
  );
}
