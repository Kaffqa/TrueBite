import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useNutrition } from '@/contexts/NutritionContext';
import { useScanHistory } from '@/hooks/useScanHistory';
import { motion } from 'framer-motion';
import { ScanLine, Loader2 } from 'lucide-react';
import { Scan as PhosphorScan, ShieldCheck, ShieldWarning, Warning } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const AppleEmoji = ({ emoji, className = "w-4 h-4" }: { emoji: string, className?: string }) => {
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0)?.toString(16));
  const unifiedWithFe0f = codePoints.join('-');
  const unifiedWithoutFe0f = codePoints.filter(c => c !== 'fe0f').join('-');
  
  const url = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${unifiedWithoutFe0f}.png`;
  const fallbackUrl = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${unifiedWithFe0f}.png`;

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src={url} 
        alt={emoji} 
        className="w-full h-full object-contain"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src.includes(unifiedWithoutFe0f) && unifiedWithFe0f !== unifiedWithoutFe0f) {
            img.src = fallbackUrl;
          } else {
            img.style.display = 'none';
            if (img.nextElementSibling) {
               (img.nextElementSibling as HTMLElement).style.display = 'inline';
            }
          }
        }}
      />
      <span className="hidden" style={{ fontSize: 'inherit' }}>{emoji}</span>
    </span>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getSmartTip(consumed: number, target: number, flagCount: number): string {
  if (consumed === 0) return "You haven't logged any meals yet today. Start by scanning your first meal!";
  const pct = consumed / target;
  if (flagCount > 0) return `On track so far. Keep going, but remember to review ${flagCount} flagged ingredient${flagCount > 1 ? 's' : ''} in your daily log.`;
  if (pct < 0.3) return "You're just getting started today. Remember to eat balanced meals throughout the day.";
  if (pct < 0.7) return "Great progress! You're on track with your nutrition goals for the day.";
  if (pct <= 1.0) return "Almost at your daily target. Be mindful of what you eat next.";
  return "You've exceeded your daily calorie target. Consider lighter options for the rest of the day.";
}

const DailySummaryCard = ({ profile, todaySummary }: any) => {
  const navigate = useNavigate();
  const dateStr = format(new Date(), 'dd - MM - yyyy');
  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  const targetCalories = profile?.target_calories || 2000;
  const consumed = todaySummary?.total_calories || 0;
  const remaining = Math.max(0, targetCalories - consumed);
  const consumedPct = Math.min(consumed / targetCalories, 1);

  const targetProtein = profile?.target_protein_g || 130;
  const targetCarbs = profile?.target_carbs_g || 240;
  const targetFat = profile?.target_fat_g || 70;
  const protein = todaySummary?.total_protein_g || 0;
  const carbs = todaySummary?.total_carbs_g || 0;
  const fat = todaySummary?.total_fat_g || 0;
  
  const proteinPct = Math.min(protein / targetProtein, 1) * 100;
  const carbsPct = Math.min(carbs / targetCarbs, 1) * 100;
  const fatPct = Math.min(fat / targetFat, 1) * 100;

  // Donut chart calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const gap = 24;
  const greenArcLen = Math.max(0, (circumference * consumedPct) - gap);
  const grayArcLen = Math.max(0, (circumference * (1 - consumedPct)) - gap);
  const grayOffset = grayArcLen / 2;
  const greenOffset = -(circumference / 2 - greenArcLen / 2);

  const flagCount = todaySummary?.scan_count ? Math.max(0, (todaySummary?.scan_count || 0) - (todaySummary?.meal_count || 0)) : 0;
  const tip = getSmartTip(consumed, targetCalories, flagCount);

  return (
    <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#1e4832]">{getGreeting()}, {firstName}</h2>
          <p className="font-mono text-[13px] text-[#6b8274] mt-3 max-w-sm leading-relaxed">
            {tip}
          </p>
        </div>
        <div className="font-mono text-[11px] font-bold text-[#6b8274] tracking-widest uppercase">
          {dateStr}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        {/* Donut Chart */}
        <div className="relative w-[200px] h-[200px] flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
             <defs>
               <filter id="soft-corners" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                 <feComponentTransfer in="blur">
                   <feFuncA type="linear" slope="50" intercept="-24.5" />
                 </feComponentTransfer>
               </filter>
             </defs>
             <g filter="url(#soft-corners)">
               {/* Gray (Remaining) */}
               <circle 
                 cx="50" cy="50" r={radius} 
                 fill="none" 
                 stroke="#e8efe9" 
                 strokeWidth="18" 
                 strokeLinecap="butt"
                 strokeDasharray={`${grayArcLen} ${circumference - grayArcLen}`}
                 strokeDashoffset={grayOffset} 
               />
               {/* Dark Green (Consumed) */}
               {consumed > 0 && (
                 <circle 
                   cx="50" cy="50" r={radius} 
                   fill="none" 
                   stroke="#1a3825" 
                   strokeWidth="18" 
                   strokeLinecap="butt"
                   strokeDasharray={`${greenArcLen} ${circumference - greenArcLen}`}
                   strokeDashoffset={greenOffset} 
                 />
               )}
             </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[42px] font-serif text-[#1e4832] leading-none">{remaining}</span>
            <span className="text-[10px] font-mono text-[#8ba797] uppercase tracking-wider mt-2">Remaining</span>
          </div>
        </div>

        {/* Macros */}
        <div className="flex-1 flex flex-col justify-center w-full">
          <div className="flex items-center gap-2 mb-6 text-[#1e4832] font-semibold">
            <AppleEmoji emoji="🔥" className="w-5 h-5 -mt-0.5" />
            <span className="font-serif text-[17px]">{consumed}</span> 
            <span className="font-mono text-xs">of {targetCalories} kcal consumed</span>
          </div>
          
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[10px] text-[#6b8274] tracking-wider">
                <span>Protein</span>
                <span className="text-[#a4b5aa]">{Math.round(protein)}/{Math.round(targetProtein)}G</span>
              </div>
              <div className="h-1 w-full bg-[#e8efe9] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${proteinPct}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#1a3825]" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[10px] text-[#6b8274] tracking-wider">
                <span>Carbs</span>
                <span className="text-[#a4b5aa]">{Math.round(carbs)}/{Math.round(targetCarbs)}G</span>
              </div>
              <div className="h-1 w-full bg-[#e8efe9] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${carbsPct}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full bg-[#1a3825]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[10px] text-[#6b8274] tracking-wider">
                <span>Fat</span>
                <span className="text-[#a4b5aa]">{Math.round(fat)}/{Math.round(targetFat)}G</span>
              </div>
              <div className="h-1 w-full bg-[#e8efe9] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${fatPct}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-[#1a3825]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/app/history')} 
        className="w-full py-3.5 mt-auto rounded-[4px] border border-[#c5d1c9] text-[#1e4832] font-mono font-medium text-[13px] hover:bg-[#f0f5f2] transition-colors"
      >
        See Daily Journal
      </button>
    </div>
  );
};

const RecentScansCard = ({ scans, loading }: { scans: any[], loading: boolean }) => {
  const navigate = useNavigate();

  const safetyConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    safe: { bg: 'bg-[#bbf7d0]', text: 'text-[#166534]', label: 'Safe', icon: ShieldCheck },
    caution: { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', label: 'Flagged', icon: Warning },
    danger: { bg: 'bg-[#fecaca]', text: 'text-[#991b1b]', label: 'Allergen Alert', icon: ShieldWarning },
    unknown: { bg: 'bg-[#e8efe9]', text: 'text-[#6b8274]', label: 'Unknown', icon: ShieldCheck },
  };

  const mealEmoji: Record<string, string> = {
    breakfast: '☕',
    lunch: '🍱',
    dinner: '🍽️',
    snack: '🍫',
  };

  function guessEmoji(title: string): string {
    const t = (title || '').toLowerCase();
    if (t.includes('coffee') || t.includes('latte') || t.includes('tea')) return '☕';
    if (t.includes('rice') || t.includes('nasi')) return '🍚';
    if (t.includes('bread') || t.includes('roti')) return '🍞';
    if (t.includes('chicken') || t.includes('ayam')) return '🍗';
    if (t.includes('salad')) return '🥗';
    if (t.includes('soup') || t.includes('soto')) return '🍲';
    if (t.includes('noodle') || t.includes('mie')) return '🍜';
    if (t.includes('burger')) return '🍔';
    if (t.includes('pizza')) return '🍕';
    if (t.includes('fruit') || t.includes('buah')) return '🍎';
    return '🍽️';
  }

  return (
    <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col flex-1">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-[#1e4832]">Recent Scans</h2>
          <p className="font-mono text-xs text-[#6b8274] mt-1">Today's activity</p>
        </div>
        <Link to="/app/history" className="px-5 py-2 rounded-[4px] border border-[#c5d1c9] text-[#1e4832] font-mono text-[11px] font-semibold hover:bg-[#f0f5f2] transition-colors">
          View Full Log
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#8ba797]" />
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f0f5f2] flex items-center justify-center mb-4">
            <ScanLine className="w-6 h-6 text-[#8ba797]" />
          </div>
          <p className="font-serif text-[15px] text-[#1e4832] mb-1">No scans yet</p>
          <p className="font-mono text-[11px] text-[#8ba797]">Your recent scans will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {scans.slice(0, 4).map((scan: any, idx: number) => {
            const status = safetyConfig[scan.safety_status] || safetyConfig.unknown;
            const emoji = guessEmoji(scan.meal_title || '');
            const timeStr = scan.created_at 
              ? formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })
              : '';

            return (
              <div 
                key={scan.id} 
                onClick={() => navigate(`/app/scan/${scan.id}`)}
                className={`py-5 flex justify-between items-center cursor-pointer hover:bg-[#f7f9f8] -mx-2 px-2 rounded-xl transition-colors ${idx < Math.min(scans.length, 4) - 1 ? 'border-b border-[#e8efe9]' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <AppleEmoji emoji={emoji} className="w-8 h-8" />
                  <div>
                    <div className="font-serif text-[#1e4832] mb-1 text-[15px]">{scan.meal_title || 'Unknown Meal'}</div>
                    <div className="font-mono text-[10px] text-[#8ba797] flex gap-3">
                      <span>{timeStr}</span>
                      <span>{scan.total_calories || 0} kcal</span>
                      {scan.total_protein_g ? <span>{Math.round(scan.total_protein_g)}g Protein</span> : null}
                    </div>
                  </div>
                </div>
                <div className={`min-w-[100px] px-3 py-1.5 ${status.bg} ${status.text} text-[10px] font-mono font-bold rounded-[4px] flex-shrink-0 flex items-center justify-center gap-1.5 capitalize tracking-wider`}>
                  {status.icon && React.createElement(status.icon, { size: 12, weight: "fill" })}
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ScannerActionCard = ({ scanCount, flagCount }: { scanCount: number, flagCount: number }) => {
  // Count flags from scans
  return (
    <div className="bg-[#1a3825] rounded-[4px] p-6 lg:p-8 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="text-3xl font-serif text-white mb-4">Scan Before You Eat</h2>
        <p className="font-mono text-[13px] text-[#a4b5aa] leading-relaxed mb-8">
          Point your camera at a label or plate. Truebite checks it against your allergy and diet profile.
        </p>
      </div>

      <Link to="/app/scan" className="w-full py-4 mb-8 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] text-white font-mono font-medium text-[13px] flex items-center justify-center gap-2 hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 shadow-md">
        <PhosphorScan size={18} weight="fill" />
        Open Scanner
      </Link>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#122b1e] rounded-[4px] py-4 flex flex-col items-center justify-center border border-[#1a3825]">
          <span className="text-3xl font-serif text-white mb-1">{scanCount}</span>
          <span className="text-[10px] font-mono text-[#6b8274] uppercase tracking-widest">Scans</span>
        </div>
        <div className="bg-[#122b1e] rounded-[4px] py-4 flex flex-col items-center justify-center border border-[#1a3825]">
          <span className="text-3xl font-serif text-white mb-1">{flagCount}</span>
          <span className="text-[10px] font-mono text-[#6b8274] uppercase tracking-widest">Flags</span>
        </div>
        <div className="bg-[#122b1e] rounded-[4px] py-4 flex flex-col items-center justify-center border border-[#1a3825]">
          <span className="text-3xl font-serif text-white mb-1">1W</span>
          <span className="text-[10px] font-mono text-[#6b8274] uppercase tracking-widest">Streak</span>
        </div>
      </div>
    </div>
  );
};

const IngredientCard = () => {
  return (
    <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col flex-1">
      <div className="flex gap-3 items-start mb-6">
        <AppleEmoji emoji="⚠️" className="w-8 h-8" />
        <div>
          <h2 className="text-[22px] font-serif text-[#1e4832]">E407 — Carrageenan</h2>
          <p className="font-mono text-[11px] text-[#a0b0a6] mt-1 tracking-widest uppercase">Ingredient of the day</p>
        </div>
      </div>

      <p className="font-mono text-[13px] text-[#1e4832] font-semibold leading-relaxed mb-6">
        A common thickener derived from red seaweed. While natural, it may trigger digestive discomfort and inflammation for sensitive stomachs.
      </p>

      <div className="mb-8">
        <h3 className="font-mono text-[11px] text-[#6b8274] mb-3">Commonly Found In:</h3>
        <div className="flex flex-wrap gap-4 font-mono text-[11px] text-[#6b8274] font-medium">
          <span className="flex items-center gap-1.5"><AppleEmoji emoji="🥛" className="w-4 h-4" /> Plant milks</span>
          <span className="flex items-center gap-1.5"><AppleEmoji emoji="🍦" className="w-4 h-4" /> Ice cream</span>
          <span className="flex items-center gap-1.5"><AppleEmoji emoji="🥩" className="w-4 h-4" /> Processed Meats</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-[11px] text-[#6b8274] mb-3">Dietary Status:</h3>
        <div className="flex flex-wrap gap-4 font-mono text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-[#166534]"><AppleEmoji emoji="🌱" className="w-3.5 h-3.5" /> Vegan</span>
          <span className="flex items-center gap-1.5 text-[#92400e]"><AppleEmoji emoji="🕌" className="w-3.5 h-3.5" /> Halal</span>
          <span className="flex items-center gap-1.5 text-[#991b1b]"><AppleEmoji emoji="⚠️" className="w-3.5 h-3.5" /> Gut Sensitive</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button className="w-full py-3.5 rounded-[4px] border border-[#c5d1c9] text-[#1e4832] font-mono font-medium text-[13px] hover:bg-[#f0f5f2] transition-colors">
          Learn More in Dictionary
        </button>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { todaySummary, loading: nutritionLoading } = useNutrition();
  const { scans, loading: scansLoading } = useScanHistory(4, {
    startDate: startOfDay(new Date()).toISOString(),
    endDate: endOfDay(new Date()).toISOString()
  });

  const [totalScans, setTotalScans] = React.useState(0);
  const [totalFlags, setTotalFlags] = React.useState(0);

  React.useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      const { count: scansCount } = await supabase
        .from('food_scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      const { count: flagsCount } = await supabase
        .from('food_scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('safety_status', ['caution', 'danger']);
        
      if (scansCount !== null) setTotalScans(scansCount);
      if (flagsCount !== null) setTotalFlags(flagsCount);
    }
    fetchStats();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full pb-8"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <DailySummaryCard profile={profile} todaySummary={todaySummary} />
          <RecentScansCard scans={scans} loading={scansLoading} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ScannerActionCard scanCount={totalScans} flagCount={totalFlags} />
          <IngredientCard />
        </div>
      </div>
    </motion.div>
  );
}