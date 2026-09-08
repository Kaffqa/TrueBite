import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-white flex text-[#1e4832]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 px-4 pt-4 bg-[#f7f9f8]">
          <Outlet />
        </main>
        
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}