import React, { useRef, useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import { Scan as PhosphorScan, ShieldCheck, Warning, ShieldWarning } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCamera } from '@/hooks/useCamera';
import { useScanner } from '@/hooks/useScanner';

export default function ScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { stream, isActive, startCamera, stopCamera, capturePhoto, toggleFacingMode } = useCamera();
  const { scanState, result, error, processScan, reset, confirmMealLog } = useScanner();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Video play failed:", e);
          }
        });
      }
    }
  }, [stream, isActive, previewUrl]);

  const handleCapture = async () => {
    try {
      if (selectedFile) {
        await processScan(selectedFile);
      } else {
        const blob = await capturePhoto(videoRef as React.RefObject<HTMLVideoElement>);
        setPreviewUrl(URL.createObjectURL(blob));
        await processScan(blob);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Gambar terlalu besar! Maksimal ukuran file adalah 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    reset();
  };

  const isLoading = scanState === 'uploading' || scanState === 'analyzing';

  return (
    <div className="h-full flex flex-col font-sans max-w-7xl mx-auto w-full">
      
      {/* Header for Mobile (Hidden on Desktop) */}
      <div className="md:hidden flex items-center mb-2 px-4 pt-4">
        <button onClick={() => navigate('/app')} className="p-2 -ml-2 rounded-full hover:bg-black/5 text-[#1e4832] transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-serif text-[22px] text-[#1e4832] ml-2">Scanner</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-full min-h-[600px] p-4 lg:p-0 lg:py-6">
        
        {/* Left Column: AI Vision Scanner Card */}
        <div className="bg-white rounded-[4px] border border-[#e8efe9] p-8 flex flex-col shadow-sm h-full">
          <div>
            <h3 className="font-serif text-[28px] text-[#1e4832] mb-3">AI Vision Scanner</h3>
            <p className="font-mono text-[13px] text-[#8ba797] leading-relaxed mb-8 max-w-md">
              Snap or upload a food label to instantly detect<br />
              allergens, hidden additives, and nutritional value.
            </p>
          </div>

          <div className="relative flex-1 min-h-[320px] bg-white rounded-[4px] border-2 border-dashed border-[#d1dfd6] flex flex-col shadow-sm overflow-hidden group mb-6">
            <div className="absolute inset-0 bg-[#f7f9f8] overflow-hidden" 
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   e.preventDefault();
                   const file = e.dataTransfer.files[0];
                   if (file) {
                     if (file.size > 5 * 1024 * 1024) {
                       alert("Gambar terlalu besar! Maksimal ukuran file adalah 5MB.");
                       return;
                     }
                     setPreviewUrl(URL.createObjectURL(file));
                     processScan(file);
                   }
                 }}
            >
              
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[4px] z-10" />
              )}
              
              {/* If camera active, show video feed filling the space */}
              {isActive && !previewUrl ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover rounded-[4px]"
                />
              ) : !previewUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                  <span className="font-mono text-[11px] font-bold text-[#4a6353] mb-12 uppercase tracking-wide">
                    Drag and drop an image here, or use camera
                  </span>

                  <span className="font-mono text-[9px] font-bold text-[#8ba797] uppercase tracking-wider mt-auto">
                    Supports JPG, PNG, HEIC (Max 5MB)
                  </span>
                </div>
              )}
            </div>

            {/* Scanning Animation Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-[3px] border-[#e8efe9] border-t-[#5a8069] animate-spin mb-4" />
                <span className="font-serif text-lg text-[#1e4832]">
                  {scanState === 'uploading' ? 'Uploading...' : 'Analyzing...'}
                </span>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button 
              onClick={handleCapture}
              disabled={isLoading || (!isActive && !selectedFile)}
              className="flex-1 bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 text-white py-4 rounded-[4px] font-mono text-[13px] flex items-center justify-center gap-3 shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              <PhosphorScan size={18} weight="fill" />
              <span>{selectedFile ? "Analyse Photo" : "Capture & Analyse"}</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-[54px] h-[54px] shrink-0 rounded-[4px] border border-[#d1dfd6] flex items-center justify-center text-[#8ba797] hover:border-[#5a8069] hover:text-[#5a8069] transition-all bg-white shadow-sm"
            >
              <ImageIcon size={20} strokeWidth={1.5} />
            </button>
          </div>
          
          {/* Error Message */}
          {scanState === 'error' && (
            <div className="mt-4 p-4 rounded-[4px] bg-[#fecaca]/30 border border-[#fecaca] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#991b1b] shrink-0" />
              <span className="text-[#991b1b] text-sm font-mono flex-1">{error}</span>
              <button onClick={handleReset} className="text-[#991b1b] underline text-xs font-mono">Retry</button>
            </div>
          )}
        </div>

        {/* Right Column: Result Card */}
        {result ? (
          <>
            {/* Desktop View (Original) */}
            <div className="hidden md:flex bg-white rounded-[4px] border border-[#e8efe9] p-8 flex-col shadow-sm overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-[26px] text-[#1e4832] leading-tight pr-4">{result.mealTitle}</h3>
                <span className={`shrink-0 w-[110px] justify-center py-2 rounded-[4px] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  result.safetyStatus === 'safe' ? 'bg-[#bbf7d0] text-[#166534]' :
                  result.safetyStatus === 'caution' ? 'bg-[#fef3c7] text-[#92400e]' :
                  'bg-[#fecaca] text-[#991b1b]'
                }`}>
                  {result.safetyStatus === 'safe' && <ShieldCheck size={14} weight="fill" />}
                  {result.safetyStatus === 'caution' && <Warning size={14} weight="fill" />}
                  {result.safetyStatus === 'danger' && <ShieldWarning size={14} weight="fill" />}
                  {result.safetyStatus === 'safe' ? 'Safe' : result.safetyStatus === 'caution' ? 'Flagged' : 'Danger'}
                </span>
              </div>

              {result.healthWarnings && result.healthWarnings.length > 0 && (
                <p className="font-mono text-[12px] text-[#6b8274] mb-6 leading-relaxed">
                  {result.healthWarnings.map((w: any) => typeof w === 'string' ? w : (w.message || w.title || w.detail)).filter(Boolean).join('. ')}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-[#132c1e] p-4 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[32px] text-white">{result.totalNutrition.calories}</span>
                   <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mt-1">Kcal</span>
                 </div>
                 <div className="bg-[#132c1e] p-4 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[32px] text-white">{result.totalNutrition.proteinG}g</span>
                   <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mt-1">Protein</span>
                 </div>
                 <div className="bg-[#132c1e] p-4 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[32px] text-white">{result.totalNutrition.carbsG}g</span>
                   <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mt-1">Carbs</span>
                 </div>
                 <div className="bg-[#132c1e] p-4 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[32px] text-white">{result.totalNutrition.fatG}g</span>
                   <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mt-1">Fat</span>
                 </div>
              </div>

              <div className="space-y-0 mb-8 border-t border-[#e8efe9]">
                {result.items.map((item: any, i: number) => {
                  const isAllergen = item.detectedAllergens && item.detectedAllergens.length > 0;
                  
                  let badgeClass = '';
                  let label = '';
                  let Icon = null;

                  if (isAllergen) {
                    badgeClass = 'bg-[#fecaca] text-[#991b1b]';
                    label = 'Allergen Alert';
                    Icon = ShieldWarning;
                  } else if (item.safetyStatus === 'danger') {
                    badgeClass = 'bg-[#fecaca] text-[#991b1b]';
                    label = 'Danger';
                    Icon = ShieldWarning;
                  } else if (item.safetyStatus === 'caution') {
                    badgeClass = 'bg-[#fef3c7] text-[#92400e]';
                    label = 'Flagged';
                    Icon = Warning;
                  } else {
                    badgeClass = 'bg-[#bbf7d0] text-[#166534]';
                    label = 'Safe';
                    Icon = ShieldCheck;
                  }
                  
                  return (
                    <div key={i} className="py-4 border-b border-[#e8efe9] flex justify-between items-center gap-4">
                      <div className="flex flex-col flex-1">
                        <div className="font-serif text-[#1e4832] text-[16px] leading-snug">{item.name}</div>
                        {isAllergen && (
                          <div className="font-mono text-[11px] text-[#991b1b] mt-1.5 leading-tight">
                            Allergen: {item.detectedAllergens.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className={`shrink-0 w-[120px] justify-center text-[10px] font-mono ${badgeClass} py-2 rounded-[4px] uppercase tracking-wider font-bold flex items-center gap-1.5`}>
                        <Icon size={12} weight="fill" />
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto flex gap-3">
                 <button 
                   onClick={async () => {
                     if (result.safetyStatus !== 'safe') {
                       await confirmMealLog();
                     }
                     navigate('/app/history');
                   }} 
                   className="flex-2 w-full py-4 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] font-mono text-[13px] text-white hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 shadow-md flex justify-center items-center gap-2"
                 >
                   + Add to Daily Log
                 </button>
                 <button 
                   onClick={handleReset} 
                   className="flex-1 py-4 rounded-[4px] border border-[#d1dfd6] font-mono text-[13px] text-[#8ba797] hover:border-[#5a8069] hover:text-[#5a8069] bg-white transition-all shadow-sm flex justify-center items-center gap-2 whitespace-nowrap px-4"
                 >
                   <RefreshCw size={16} /> Rescan
                 </button>
              </div>
            </div>

            {/* Mobile View (New Design) */}
            <div className="flex md:hidden bg-white rounded-[4px] border border-[#e8efe9] p-6 flex-col shadow-sm overflow-y-auto">
              {/* Header / Overview */}
              <div className="flex flex-col items-center text-center mb-6">
                <span className={`px-4 py-1.5 rounded-[4px] text-[11px] font-mono font-bold tracking-wider flex items-center gap-2 mb-4 ${
                  result.safetyStatus === 'safe' ? 'bg-[#bbf7d0] text-[#166534]' :
                  result.safetyStatus === 'caution' ? 'bg-[#fef3c7] text-[#92400e]' :
                  'bg-[#fecaca] text-[#991b1b]'
                }`}>
                  {result.safetyStatus === 'safe' && <ShieldCheck size={14} weight="fill" />}
                  {result.safetyStatus === 'caution' && <Warning size={14} weight="fill" />}
                  {result.safetyStatus === 'danger' && <ShieldWarning size={14} weight="fill" />}
                  {result.safetyStatus === 'safe' 
                    ? 'Safe' 
                    : `${result.items.filter((i: any) => i.safetyStatus === 'caution' || i.safetyStatus === 'danger').length} Flagged`}
                </span>
                
                <h3 className="font-serif text-[32px] md:text-[26px] text-[#1e4832] leading-tight mb-4">{result.mealTitle}</h3>

                {result.healthWarnings && result.healthWarnings.length > 0 && (
                  <p className="font-mono text-[12px] text-[#6b8274] leading-relaxed max-w-sm">
                    {result.healthWarnings.map((w: any) => typeof w === 'string' ? w : (w.message || w.title || w.detail)).filter(Boolean).join('. ')}
                  </p>
                )}
              </div>

              {/* Macros */}
              <div className="grid grid-cols-2 gap-3 mb-8 px-1 md:px-0">
                 <div className="bg-[#132c1e] py-6 px-2 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[42px] leading-none text-white mb-2">{result.totalNutrition.calories}</span>
                   <span className="font-mono text-[11px] text-[#8ba797]">Kcal</span>
                 </div>
                 <div className="bg-[#132c1e] py-6 px-2 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[42px] leading-none text-white mb-2">{result.totalNutrition.proteinG}g</span>
                   <span className="font-mono text-[11px] text-[#8ba797]">Protein</span>
                 </div>
                 <div className="bg-[#132c1e] py-6 px-2 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[42px] leading-none text-white mb-2">{result.totalNutrition.carbsG}g</span>
                   <span className="font-mono text-[11px] text-[#8ba797]">Carbs</span>
                 </div>
                 <div className="bg-[#132c1e] py-6 px-2 rounded-[4px] flex flex-col items-center justify-center text-center">
                   <span className="font-serif text-[42px] leading-none text-white mb-2">{result.totalNutrition.fatG}g</span>
                   <span className="font-mono text-[11px] text-[#8ba797]">Fat</span>
                 </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-0 mb-8 border-t border-[#e8efe9]">
                {result.items.map((item: any, i: number) => {
                  const isAllergen = item.detectedAllergens && item.detectedAllergens.length > 0;
                  
                  let badgeClass = '';
                  let Icon = null;

                  if (isAllergen || item.safetyStatus === 'danger') {
                    badgeClass = 'bg-[#fecaca] text-[#991b1b]';
                    Icon = ShieldWarning;
                  } else if (item.safetyStatus === 'caution') {
                    badgeClass = 'bg-[#fef3c7] text-[#92400e]';
                    Icon = Warning;
                  } else {
                    badgeClass = 'bg-[#bbf7d0] text-[#166534]';
                    Icon = ShieldCheck;
                  }
                  
                  return (
                    <div key={i} className="py-4 border-b border-[#e8efe9] flex justify-between items-center gap-4 px-1 md:px-0">
                      <div className="flex flex-col flex-1">
                        <div className="font-serif text-[#1e4832] text-[18px] md:text-[16px] leading-snug">{item.name}</div>
                        {isAllergen && (
                          <div className="font-mono text-[11px] text-[#991b1b] mt-1.5 leading-tight">
                            Allergen: {item.detectedAllergens.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className={`shrink-0 w-8 h-8 flex justify-center items-center ${badgeClass} rounded-[4px]`}>
                        <Icon size={16} weight="fill" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto flex gap-3 pt-2">
                 <button 
                   onClick={async () => {
                     if (result.safetyStatus !== 'safe') {
                       await confirmMealLog();
                     }
                     navigate('/app/history');
                   }} 
                   className="flex-1 py-[15px] rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] font-mono text-[14px] text-white hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 shadow-md flex justify-center items-center gap-2 font-medium"
                 >
                   + Add to Daily Log
                 </button>
                 <button 
                   onClick={handleReset} 
                   className="w-[56px] h-[56px] shrink-0 rounded-[4px] border border-[#d1dfd6] flex items-center justify-center text-[#8ba797] hover:border-[#5a8069] hover:text-[#5a8069] bg-white transition-all shadow-sm"
                 >
                   <RefreshCw size={18} />
                 </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[4px] border border-[#e8efe9] p-8 flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="font-serif text-[32px] text-[#1e4832] mb-4">No Result Yet</h3>
            <p className="font-mono text-[12px] text-[#8ba797] max-w-xs leading-relaxed">
              Upload an image or use your camera to<br />
              see the AI breakdown here.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}