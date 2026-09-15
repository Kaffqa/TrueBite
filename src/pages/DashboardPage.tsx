import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useNutrition } from '@/contexts/NutritionContext';
import { useScanHistory } from '@/hooks/useScanHistory';
import { motion } from 'framer-motion';
import { ScanLine, Loader2 } from 'lucide-react';
import { Scan as PhosphorScan, ShieldCheck, ShieldWarning, Warning, Lightning } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getEmojiForIcon } from '@/lib/emoji-map';

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

  const strokeW = 18;
  const radius = 36;
  const circumference = 2 * Math.PI * radius; 
  const gap = 8; // Flat gap between segments
  
  let greenArcLen = 0;
  let grayArcLen = 0;
  let greenOffset = 0;
  let grayOffset = 0;

  if (consumedPct <= 0) {
    grayArcLen = circumference;
  } else if (consumedPct >= 1) {
    greenArcLen = circumference;
  } else {
    greenArcLen = Math.max(0.1, (circumference * consumedPct) - gap);
    grayArcLen = Math.max(0.1, (circumference * (1 - consumedPct)) - gap);
    
    // Centering the gap at the top
    greenOffset = -(gap / 2);
    grayOffset = -(gap / 2 + greenArcLen + gap);
  }

  const flagCount = todaySummary?.scan_count ? Math.max(0, (todaySummary?.scan_count || 0) - (todaySummary?.meal_count || 0)) : 0;
  const tip = getSmartTip(consumed, targetCalories, flagCount);

  return (
    <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col">
      <div className="flex flex-col md:flex-row md:justify-between items-start mb-10 md:mb-8 gap-4 md:gap-0">
        <div className="flex flex-col">
          <div className="md:hidden font-mono text-[11px] font-bold text-[#6b8274] tracking-widest uppercase mb-4">
            {dateStr}
          </div>
          <h2 className="text-[32px] md:text-3xl font-serif text-[#1e4832] leading-tight">{getGreeting()}, {firstName}</h2>
          <p className="font-mono text-[12px] md:text-[13px] text-[#6b8274] mt-4 md:mt-3 max-w-sm leading-relaxed">
            {tip}
          </p>
        </div>
        <div className="hidden md:block font-mono text-[11px] font-bold text-[#6b8274] tracking-widest uppercase mt-2">
          {dateStr}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-8 mb-8">
        {/* Donut Chart */}
        <div className="relative w-[240px] h-[240px] md:w-[200px] md:h-[200px] flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
               <defs>
                 <filter id="soft-rounded" x="-30%" y="-30%" width="160%" height="160%">
                   <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                   <feColorMatrix in="blur" mode="matrix" values="
                     1 0 0 0 0
                     0 1 0 0 0
                     0 0 1 0 0
                     0 0 0 15 -6
                   " />
                 </filter>
               </defs>
               <g filter="url(#soft-rounded)">
                 {/* Gray (Remaining) */}
                 {grayArcLen > 0 && (
                   <circle 
                     cx="50" cy="50" r={radius} 
                     fill="none" 
                     stroke="#e8efe9" 
                     strokeWidth={strokeW} 
                     strokeLinecap="butt"
                     strokeDasharray={`${grayArcLen} ${circumference}`}
                     strokeDashoffset={grayOffset} 
                   />
                 )}
                 {/* Dark Green (Consumed) */}
                 {greenArcLen > 0 && (
                   <circle 
                     cx="50" cy="50" r={radius} 
                     fill="none" 
                     stroke="#1a3825" 
                     strokeWidth={strokeW} 
                     strokeLinecap="butt"
                     strokeDasharray={`${greenArcLen} ${circumference}`}
                     strokeDashoffset={greenOffset} 
                   />
                 )}
               </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[52px] md:text-[42px] font-serif text-[#1e4832] leading-none">{remaining}</span>
            <span className="text-[10px] font-mono text-[#8ba797] uppercase tracking-wider mt-2">Remaining</span>
          </div>
        </div>

        {/* Macros */}
        <div className="flex-1 flex flex-col justify-center w-full relative">
          <svg width="0" height="0" className="absolute">
            <linearGradient id="lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#e55941" offset="0%" />
              <stop stopColor="#e68846" offset="50%" />
              <stop stopColor="#e7ac4b" offset="100%" />
            </linearGradient>
          </svg>
          <div className="flex items-center gap-2 mb-6 text-[#1e4832] font-normal">
            <Lightning size={22} weight="fill" style={{ fill: 'url(#lightning-grad)' }} className="mr-1 -mt-0.5" />
            <span className="font-serif text-[18px] md:text-[17px]">{consumed}</span> 
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
        className="w-full py-3.5 mt-auto rounded-[4px] border border-[#c5d1c9] text-[#1e4832] font-mono text-[13px] hover:bg-[#f0f5f2] transition-colors"
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
        <Link to="/app/history" className="px-5 py-2 rounded-[4px] border border-[#c5d1c9] text-[#1e4832] font-mono text-[11px] hover:bg-[#f0f5f2] transition-colors">
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
                className={`py-5 flex justify-between items-center cursor-pointer hover:bg-[#f0f5f2] -mx-3 px-3 rounded-[4px] transition-colors ${idx < Math.min(scans.length, 4) - 1 ? 'border-b border-[#e8efe9]' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 overflow-hidden bg-[#f7f9f8]">
                    {scan.image_url ? (
                      <img src={scan.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <AppleEmoji emoji={emoji} className="w-7 h-7" />
                    )}
                  </div>
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

const ScannerActionCard = ({ scanCount, flagCount, streakDays }: { scanCount: number, flagCount: number, streakDays: number }) => {
  return (
    <div className="bg-[#1a3825] rounded-[4px] p-6 lg:p-8 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="text-3xl font-serif text-white mb-4">Scan Before You Eat</h2>
        <p className="font-mono text-[13px] text-[#a4b5aa] leading-relaxed mb-8">
          Point your camera at a label or plate. Truebite checks it against your allergy and diet profile.
        </p>
      </div>

      <Link to="/app/scan" className="hidden md:flex w-full py-4 mb-8 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] text-white font-mono text-[13px] items-center justify-center gap-2 hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 shadow-md">
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
          <span className="text-3xl font-serif text-white mb-1">{streakDays}D</span>
          <span className="text-[10px] font-mono text-[#6b8274] uppercase tracking-widest">Streak</span>
        </div>
      </div>
    </div>
  );
};

const IngredientOfDayWidget = ({ user, profile }: { user: any, profile: any }) => {
  const navigate = useNavigate();
  const [ingredient, setIngredient] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRandomIngredient() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_ingredients')
          .select('*')
          .eq('user_id', user.id)
          .limit(50);
          
        if (data && data.length > 0) {
          const interesting = data.filter((d: any) => d.status !== 'Safe');
          const pool = interesting.length > 0 ? interesting : data;
          
          const todayInt = new Date().getDate();
          const randomIndex = todayInt % pool.length;
          setIngredient(pool[randomIndex]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRandomIngredient();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col flex-1 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#8ba797]" />
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col flex-1 items-center justify-center text-center">
        <h2 className="text-[20px] font-serif text-[#1e4832] mb-2">Build Your Dictionary</h2>
        <p className="font-mono text-[12px] text-[#6b8274] mb-6 leading-relaxed">
          Start scanning foods or generate your dictionary to see your daily ingredients here.
        </p>
        <button 
          onClick={() => navigate('/app/ingredients')}
          className="px-8 py-3 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] text-white font-mono text-[13px] flex items-center justify-center hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200 shadow-md"
        >
          Go to Dictionary
        </button>
      </div>
    );
  }

  const badgeIcon = ingredient.status === 'Allergen' ? '🛡️' : ingredient.status === 'Flagged' ? '⚠️' : '✅';

  // Build dynamic dietary and medical tags based on the user's profile
  const dietaryTags: { icon: string; label: string }[] = [];
  if (profile?.dietary_preferences) {
    profile.dietary_preferences.forEach((pref: string) => {
      let icon = '🍽️';
      if (pref.toLowerCase().includes('vegan')) icon = '🌿';
      else if (pref.toLowerCase().includes('vegetarian')) icon = '🥗';
      else if (pref.toLowerCase().includes('halal')) icon = '🕌';
      else if (pref.toLowerCase().includes('keto')) icon = '🥑';
      dietaryTags.push({ icon, label: pref });
    });
  }

  // Highlight conflicting medical conditions if it's flagged
  if (ingredient.status !== 'Safe' && profile?.medical_conditions) {
    profile.medical_conditions.forEach((cond: string) => {
      dietaryTags.push({ icon: '⚠️', label: cond });
    });
  }

  return (
    <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex flex-col flex-1">
      <div className="flex gap-4 items-start mb-6">
        <div className="text-4xl mt-1 leading-none">{badgeIcon}</div>
        <div>
          <h2 className="text-[26px] font-serif text-[#1e4832] leading-tight">{ingredient.ingredient_name}</h2>
          <p className="font-mono text-[12px] text-[#a0b0a6] mt-1">Ingredient of the day</p>
        </div>
      </div>

      <p className="font-mono text-[13px] text-[#4a6b58] leading-relaxed mb-6">
        {ingredient.description || ingredient.reason || 'No specific description available for this ingredient.'}
      </p>

      {ingredient.commonly_found_in && ingredient.commonly_found_in.length > 0 && (
        <div className="mb-2">
          <h3 className="font-mono text-[12px] text-[#4a6b58] mb-3">Commonly Found In:</h3>
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[12px] text-[#5a7a68] font-medium">
            {ingredient.commonly_found_in.slice(0, 3).map((item: any, i: number, arr: any[]) => (
              <React.Fragment key={i}>
                <span className="flex items-center gap-1.5">
                   <span>{getEmojiForIcon(item.icon)}</span>
                   {item.label}
                </span>
                {i < arr.length - 1 && <span className="text-[#cfdfd5]">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <hr className="border-[#e8efe9] my-6" />

      <div className="mb-8">
        <h3 className="font-mono text-[12px] text-[#4a6b58] mb-3">Dietary Status:</h3>
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[12px] font-medium">
          {dietaryTags.length > 0 ? (
            dietaryTags.map((item, i, arr) => (
              <React.Fragment key={i}>
                <span className={`flex items-center gap-1.5 ${item.icon === '⚠️' ? 'text-[#92400e]' : 'text-[#5a7a68]'}`}>
                   <span>{item.icon}</span>
                   {item.label}
                </span>
                {i < arr.length - 1 && <span className="text-[#cfdfd5]">|</span>}
              </React.Fragment>
            ))
          ) : (
            <span className="text-[#a0b0a6]">No specific dietary preferences set.</span>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => navigate('/app/ingredients')}
          className="w-full py-3.5 rounded-[4px] border border-[#cfdfd5] text-[#5a7a68] font-mono text-[13px] hover:bg-[#f0f5f2] transition-colors"
        >
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
  const [streakDays, setStreakDays] = React.useState(0);

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

      // Calculate streak
      const { data: history } = await supabase
        .from('food_scans')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (history && history.length > 0) {
        let currentStreak = 0;
        let checkDate = startOfDay(new Date());
        
        // Extract unique days (midnight timestamps) where scans occurred
        const scanDays = new Set(
          history.map((s: any) => startOfDay(new Date(s.created_at)).getTime())
        );

        // Check if there's a scan today or yesterday to start the streak
        const today = checkDate.getTime();
        const yesterday = today - 86400000;

        if (scanDays.has(today) || scanDays.has(yesterday)) {
          let checkTime = scanDays.has(today) ? today : yesterday;
          while (scanDays.has(checkTime)) {
            currentStreak++;
            checkTime -= 86400000; // go back 1 day
          }
        }
        setStreakDays(currentStreak);
      }
    }
    fetchStats();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full pb-8"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Mobile Layout (hidden on lg) */}
        <div className="lg:hidden flex flex-col gap-6">
          <DailySummaryCard profile={profile} todaySummary={todaySummary} />
          <ScannerActionCard scanCount={totalScans} flagCount={totalFlags} streakDays={streakDays} />
          <RecentScansCard scans={scans} loading={scansLoading} />
          <IngredientOfDayWidget user={user} profile={profile} />
        </div>

        {/* Desktop Layout (hidden on mobile) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <DailySummaryCard profile={profile} todaySummary={todaySummary} />
            <RecentScansCard scans={scans} loading={scansLoading} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <ScannerActionCard scanCount={totalScans} flagCount={totalFlags} streakDays={streakDays} />
            <IngredientOfDayWidget user={user} profile={profile} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}