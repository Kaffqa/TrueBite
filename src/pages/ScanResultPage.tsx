import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ScanResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-300 font-mono hover:text-green-100 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Scanner
      </button>

      <div className="bg-green-900/30 rounded-3xl p-6 border border-green-800/50">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-serif text-green-50">Grilled Salmon Salad</h1>
          <div className="bg-green-500/20 text-green-300 p-2 rounded-full">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        
        <p className="font-mono text-sm text-green-200 mb-6">Scan ID: {id}</p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-green-950/50 border border-green-800">
            <h3 className="font-serif text-lg text-white mb-2">Nutrition Facts</h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div className="text-green-300">Calories: <span className="text-white">450</span></div>
              <div className="text-green-300">Protein: <span className="text-white">35g</span></div>
              <div className="text-green-300">Carbs: <span className="text-white">12g</span></div>
              <div className="text-green-300">Fat: <span className="text-white">28g</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-green-950/50 border border-green-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-lg text-white mb-1">Dietary Notes</h3>
              <p className="font-mono text-sm text-green-300">Contains fish. Safe for your profile.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}