import React from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScannerPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-6 text-white z-10 absolute top-0 w-full bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/40 backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
        <span className="font-serif text-xl">Scan Meal</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {/* Camera Viewport Placeholder */}
        <p className="text-green-400/50 font-mono italic">Camera active...</p>
      </div>

      <div className="absolute bottom-0 w-full p-8 pb-12 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent gap-8">
        <button className="p-4 rounded-full bg-green-900/80 text-green-50 backdrop-blur-md">
          <ImageIcon className="w-6 h-6" />
        </button>
        <button className="w-20 h-20 rounded-full bg-green-500 border-4 border-green-200/30 flex items-center justify-center shadow-xl hover:bg-green-400 transition-colors">
          <Camera className="w-8 h-8 text-white" />
        </button>
        <div className="w-[52px]"></div>
      </div>
    </div>
  );
}