import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-green-50">
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        <Outlet />
      </main>
      
      <BottomNav />
    </div>
  );
}