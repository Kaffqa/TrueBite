import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaretLeft, ShieldCheck, Warning, ShieldWarning, Info, PlusCircle, CheckCircle, X, MagnifyingGlassPlus } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useScanner } from '@/hooks/useScanner';
import { useNutrition } from '@/contexts/NutritionContext';

export default function ScanResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirmMealLog } = useScanner();
  const { addMealLog, refreshToday } = useNutrition();

  const [loading, setLoading] = useState(true);
  const [scanRecord, setScanRecord] = useState<any>(null);
  const [scanItems, setScanItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logStatus, setLogStatus] = useState<'idle' | 'logging' | 'success'>('idle');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchScanData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data: scanData, error: scanError } = await supabase
          .from('food_scans')
          .select('*, meal_logs(*)')
          .eq('id', id)
          .single();

        if (scanError) throw scanError;
        setScanRecord(scanData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('scan_items')
          .select('*')
          .eq('scan_id', id);

        if (itemsError) throw itemsError;
        setScanItems(itemsData || []);
      } catch (err: any) {
        console.error('Error fetching scan results:', err);
        setError(err.message || 'Failed to load scan results');
      } finally {
        setLoading(false);
      }
    };

    fetchScanData();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleManualLog = async () => {
    try {
      setLogStatus('logging');
      const logData = {
        user_id: scanRecord.user_id,
        scan_id: scanRecord.id,
        meal_type: 'snack',
        food_name: scanRecord.meal_title,
        calories: scanRecord.total_calories,
        protein_g: scanRecord.total_protein_g,
        carbs_g: scanRecord.total_carbs_g,
        fat_g: scanRecord.total_fat_g,
        fiber_g: scanRecord.total_fiber_g,
        sugar_g: scanRecord.total_sugar_g,
        sodium_mg: scanRecord.total_sodium_mg,
        consumed_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        log_date: format(new Date(), 'yyyy-MM-dd'),
        portion_multiplier: 1,
      };

      await addMealLog(logData as any);
      await refreshToday();
      
      setLogStatus('success');
      setTimeout(() => navigate('/app'), 1500);
    } catch (err: any) {
      console.error('Logging failed:', err);
      setLogStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen bg-[#f4f7f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b8274]" />
      </div>
    );
  }

  if (error || !scanRecord) {
    return (
      <div className="w-full h-full min-h-screen bg-[#f4f7f5] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-[4px] bg-[#f0f5f2] flex items-center justify-center">
          <Warning className="w-8 h-8 text-[#6b8274]" weight="fill" />
        </div>
        <p className="text-[#1e4832] font-serif text-[24px]">{error || 'Scan not found'}</p>
        <button 
          onClick={() => navigate('/app/history')} 
          className="px-6 py-2.5 rounded-[4px] border border-[#c5d1c9] text-[#1e4832] font-mono text-[12px] font-semibold hover:bg-[#f0f5f2] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isSafe = scanRecord.safety_status === 'safe';
  const isAlreadyLogged = scanRecord.meal_logs && scanRecord.meal_logs.length > 0;
  const shouldShowLoggedState = isAlreadyLogged || logStatus === 'success' || (isSafe && logStatus !== 'idle');

  const safetyConfig: Record<string, { bg: string; text: string; label: string; icon: any; border: string }> = {
    safe: { bg: 'bg-[#bbf7d0]', text: 'text-[#166534]', border: 'border-[#4ade80]/30', label: 'Safe', icon: ShieldCheck },
    caution: { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', border: 'border-[#fcd34d]/40', label: 'Flagged', icon: Warning },
    danger: { bg: 'bg-[#fecaca]', text: 'text-[#991b1b]', border: 'border-[#f87171]/30', label: 'Allergen Alert', icon: ShieldWarning },
    unknown: { bg: 'bg-[#e8efe9]', text: 'text-[#6b8274]', border: 'border-[#c5d1c9]', label: 'Unknown', icon: ShieldCheck },
  };

  const status = safetyConfig[scanRecord.safety_status] || safetyConfig.unknown;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      <div>
        {/* Header */}
        <div className="mb-6 pt-2">
          <button 
            onClick={() => navigate('/app/history')} 
            className="inline-flex px-4 py-2 bg-white border border-[#cfdfd5] rounded-[4px] text-sm font-mono text-[#5a7a68] hover:bg-[#f0f5f2] hover:text-[#1e4832] transition-colors items-center gap-2"
          >
            <CaretLeft size={16} /> Back to Daily Log
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Main Image & Overview */}
            <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm overflow-hidden flex flex-col">
              {scanRecord.image_url && (
                <div 
                  className="w-full h-64 lg:h-80 relative border-b border-[#e8efe9] cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img 
                    src={scanRecord.image_url} 
                    alt="Scanned Food" 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100 duration-300">
                      <MagnifyingGlassPlus size={24} className="text-white" weight="bold" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
                  <h2 className="text-[28px] font-serif text-[#1e4832] leading-tight">{scanRecord.meal_title || 'Unknown Meal'}</h2>
                  <div className={"self-start inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-[4px] text-[10px] capitalize tracking-wider font-mono font-bold " + status.bg + " " + status.text + " border " + status.border + " flex-shrink-0"}>
                    {React.createElement(status.icon, { size: 14, weight: "fill" })}
                    {status.label}
                  </div>
                </div>
                <p className="font-mono text-[10px] capitalize tracking-wider text-[#8ba797] mt-1">
                  Scanned {formatDistanceToNow(new Date(scanRecord.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Detected Ingredients */}
            {scanItems.length > 0 && (
              <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm p-6 lg:p-8 flex-1">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-serif text-[24px] text-[#1e4832]">Detected Ingredients</h3>
                  <span className="font-mono text-[11px] capitalize tracking-wider text-[#8ba797]">{scanItems.length} items</span>
                </div>
                <div className="flex flex-col">
                  {scanItems.map((item, idx) => {
                    const itemStatus = safetyConfig[item.item_safety_status] || safetyConfig.unknown;
                    return (
                      <div 
                        key={item.id} 
                        className={"py-4 flex justify-between items-center " + (idx < scanItems.length - 1 ? 'border-b border-[#e8efe9]' : '')}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-serif text-[16px] text-[#1e4832] mb-0.5">{item.item_name}</p>
                          <p className="font-mono text-[10px] text-[#8ba797]">
                            {item.portion_description || item.estimated_weight_g + "g"}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3 sm:gap-4 shrink-0">
                          <div className="font-mono text-[10px] text-[#8ba797] capitalize tracking-wider">
                            <span>{item.calories} kcal</span>
                          </div>
                          <div className={"shrink-0 whitespace-nowrap w-[115px] sm:w-[125px] flex items-center justify-center gap-1.5 py-1.5 " + itemStatus.bg + " " + itemStatus.text + " text-[10px] font-mono font-bold capitalize tracking-wider rounded-[4px]"}>
                            {React.createElement(itemStatus.icon, { size: 12, weight: "fill" })}
                            {itemStatus.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Action Area (Moved up for Bento emphasis) */}
            <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm p-6 lg:p-8">
              {shouldShowLoggedState ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="font-mono text-[12px] text-[#166534] text-center max-w-sm">
                    {isSafe && !isAlreadyLogged && logStatus !== 'success' 
                      ? "This meal was deemed safe and has been automatically logged." 
                      : "This meal has already been logged to your journal."}
                  </p>
                  <div className="w-full py-4 rounded-[4px] bg-[#f0f5f2] border border-[#c5d1c9] text-[#166534] font-mono font-bold text-[13px] flex justify-center items-center gap-2">
                    <CheckCircle className="w-5 h-5" weight="fill" />
                    {isSafe && !isAlreadyLogged && logStatus !== 'success' ? 'Automatically Logged' : 'Already Logged'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="font-mono text-[12px] text-[#6b8274] text-center max-w-sm">
                    {!isToday(new Date(scanRecord.created_at)) 
                      ? "This meal was scanned on a different day and cannot be logged to today's journal." 
                      : "This meal has flagged items. You can still log it manually if you choose to."}
                  </p>
                  <button 
                    onClick={handleManualLog}
                    disabled={logStatus !== 'idle' || !isToday(new Date(scanRecord.created_at))}
                    className="w-full py-4 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#1a3825] text-white font-mono font-medium text-[13px] flex justify-center items-center gap-2 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.3),_0_4px_12px_rgba(22,51,35,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logStatus === 'logging' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Logging...</>
                    ) : (
                      <><PlusCircle className="w-4 h-4" weight="bold" /> Log Anyway</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Health Warnings */}
            {!isSafe && scanRecord.health_warnings?.length > 0 && (
              <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Warning className="w-5 h-5 text-[#92400e]" weight="fill" />
                  <h3 className="font-serif text-[24px] text-[#1e4832]">Health Warnings</h3>
                </div>
                <div className="space-y-3">
                  {scanRecord.health_warnings.map((warning: any, idx: number) => (
                    <div key={idx} className="bg-[#fef3c7]/50 border border-[#fcd34d]/40 p-4 rounded-[4px]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Info className="w-4 h-4 text-[#92400e]" weight="fill" />
                        <h4 className="font-serif text-[14px] text-[#92400e] font-medium">{warning.title || warning.type || 'Warning'}</h4>
                      </div>
                      <p className="text-[#6b8274] text-[12px] font-mono leading-relaxed pl-6">{warning.detail || warning.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Macro Summary */}
            <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm p-6 lg:p-8 flex-1">
              <h3 className="font-serif text-[24px] text-[#1e4832] mb-5">Nutritional Breakdown</h3>
              
              <div className="flex flex-col gap-6">
                {/* Calories */}
                <div className="flex flex-col items-center justify-center bg-[#1a3825] rounded-[4px] py-8 px-10 text-center">
                  <span className="text-5xl font-serif text-white leading-none">{scanRecord.total_calories || 0}</span>
                  <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-widest mt-3">kcal</span>
                </div>

                {/* Macros */}
                <div className="flex flex-col justify-center space-y-5">
                  {[
                    { label: 'Protein', value: scanRecord.total_protein_g || 0 },
                    { label: 'Carbs', value: scanRecord.total_carbs_g || 0 },
                    { label: 'Fat', value: scanRecord.total_fat_g || 0 },
                  ].map(macro => {
                    const total = (scanRecord.total_protein_g || 0) + (scanRecord.total_carbs_g || 0) + (scanRecord.total_fat_g || 0);
                    const pct = total > 0 ? Math.round((macro.value / total) * 100) : 0;
                    return (
                      <div key={macro.label} className="flex flex-col gap-1.5">
                        <div className="flex justify-between font-mono text-[10px] text-[#6b8274] capitalize tracking-wider">
                          <span>{macro.label}</span>
                          <span className="text-[#a4b5aa]">{macro.value}G</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#e8efe9] overflow-hidden rounded-[4px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: pct + '%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-[#1a3825] rounded-[4px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && scanRecord.image_url && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-3xl max-h-[75vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors bg-black/40 rounded-full"
            >
              <X size={24} weight="bold" />
            </button>
            <img 
              src={scanRecord.image_url} 
              alt="Full screen scan" 
              className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-[4px] shadow-2xl"
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
