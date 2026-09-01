import React from 'react';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-green-50">Scan History</h1>
      
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-green-900/20 rounded-3xl border border-green-800/50">
        <p className="font-mono text-green-400">No scans yet.</p>
        <p className="font-mono text-sm text-green-500">Your scan history will appear here.</p>
      </div>
    </div>
  );
}