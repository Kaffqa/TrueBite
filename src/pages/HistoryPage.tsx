import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfDay, endOfDay, isToday as isTodayFn } from 'date-fns';
import { Scan as PhosphorScan, CalendarDots, CheckCircle, Warning, WarningCircle, CaretDown, Plus, X, MagicWand, ShieldCheck, ShieldWarning, Lightning, Fire, FireSimple } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useNutrition } from '@/contexts/NutritionContext';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeText } from '@/lib/ai-provider';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { CustomTimePicker } from '@/components/ui/CustomTimePicker';

const AppleEmoji = ({ emoji, className = "w-4 h-4" }: { emoji: string, className?: string }) => {
  const codePoints = Array.from(emoji).map(c => c.codePointAt(0)?.toString(16));
  const unifiedWithFe0f = codePoints.join('-');
  const unifiedWithoutFe0f = codePoints.filter(c => c !== 'fe0f').join('-');
  const src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${unifiedWithoutFe0f}.png`;
  return <img src={src} alt={emoji} className={className} onError={(e) => {
    (e.target as HTMLImageElement).src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${unifiedWithFe0f}.png`;
  }} />;
};

const getSafetyBadgeStyle = (status: string) => {
  switch (status) {
    case 'safe': return 'bg-[#bbf7d0] text-[#166534] border-[#86efac]';
    case 'caution': return 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]';
    case 'danger': return 'bg-[#fecaca] text-[#991b1b] border-[#fca5a5]';
    default: return 'bg-[#e8efe9] text-[#6b8274] border-[#c5d1c9]';
  }
};

const getSafetyIcon = (status: string) => {
  switch (status) {
    case 'safe': return <ShieldCheck size={14} weight="fill" />;
    case 'caution': return <Warning size={14} weight="fill" />;
    case 'danger': return <ShieldWarning size={14} weight="fill" />;
    default: return null;
  }
};

const getSafetyLabel = (status: string) => {
  switch (status) {
    case 'safe': return 'Safe';
    case 'caution': return 'Flagged';
    case 'danger': return 'Danger';
    default: return 'Unknown';
  }
};

const guessEmoji = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('coffee') || t.includes('latte') || t.includes('espresso')) return '☕';
  if (t.includes('bread') || t.includes('toast') || t.includes('sourdough')) return '🍞';
  if (t.includes('salad') || t.includes('greens')) return '🥗';
  if (t.includes('egg') || t.includes('breakfast')) return '🍳';
  if (t.includes('chicken') || t.includes('ayam') || t.includes('meat')) return '🍗';
  if (t.includes('rice') || t.includes('nasi')) return '🍚';
  if (t.includes('milk') || t.includes('susu')) return '🥛';
  if (t.includes('tea') || t.includes('teh')) return '🍵';
  if (t.includes('juice') || t.includes('jus')) return '🧃';
  if (t.includes('soup') || t.includes('soto') || t.includes('bakso')) return '🍲';
  if (t.includes('noodle') || t.includes('mie') || t.includes('ramen')) return '🍜';
  if (t.includes('burger') || t.includes('sandwich')) return '🍔';
  if (t.includes('pizza')) return '🍕';
  if (t.includes('popcorn')) return '🍿';
  if (t.includes('cake') || t.includes('kue')) return '🍰';
  if (t.includes('ice cream') || t.includes('es krim')) return '🍦';
  return '🍽️';
};

export function HistoryPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { refreshToday } = useNutrition();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyCals, setDailyCals] = useState<number>(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealTypeForAdd, setMealTypeForAdd] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [description, setDescription] = useState('');
  const [consumedTime, setConsumedTime] = useState(format(new Date(), 'HH:mm'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [streakData, setStreakData] = useState<any[]>([]);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [scanDays, setScanDays] = useState<Set<number>>(new Set());
  
  const { scans, loading, setFilter } = useScanHistory(100, {
    startDate: startOfDay(new Date()).toISOString(),
    endDate: endOfDay(new Date()).toISOString()
  });

  useEffect(() => {
    async function fetchStreak() {
      if (!user) return;
      
      const { data: history } = await supabase
        .from('food_scans')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      let currentStreak = 0;
      let days = new Set<number>();
      
      if (history && history.length > 0) {
        days = new Set(history.map((s: any) => startOfDay(new Date(s.created_at)).getTime()));
        const today = startOfDay(new Date()).getTime();
        const yesterday = today - 86400000;

        if (days.has(today) || days.has(yesterday)) {
          let checkTime = days.has(today) ? today : yesterday;
          while (days.has(checkTime)) {
            currentStreak++;
            checkTime -= 86400000;
          }
        }
      }
      setStreakCount(currentStreak);
      setScanDays(days);
    }
    fetchStreak();
  }, [user]);

  // Generate the current week for the UI based on selectedDate
  useEffect(() => {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const streakArr = [];
    const today = startOfDay(new Date()).getTime();
    
    // Find the Monday of the selected week
    const weekStart = startOfDay(selectedDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dTime = d.getTime();
      
      streakArr.push({
        day: dayNames[d.getDay()],
        date: d.getDate().toString(),
        active: scanDays.has(dTime),
        today: dTime === today,
        fullDate: d
      });
    }
    setStreakData(streakArr);
  }, [selectedDate, scanDays]);

  useEffect(() => {
    setFilter({ 
      startDate: startOfDay(selectedDate).toISOString(), 
      endDate: endOfDay(selectedDate).toISOString() 
    });

    async function fetchDailySummary() {
      if (!user) return;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await supabase
        .from('daily_nutrition_summaries')
        .select('total_calories')
        .eq('user_id', user.id)
        .eq('summary_date', dateStr)
        .maybeSingle();
        
      setDailyCals((data as any)?.total_calories || 0);
    }
    fetchDailySummary();
  }, [selectedDate, setFilter, user]);

  const handleAnalyzeAndAdd = async () => {
    if (!description.trim() || !user || !profile) return;
    try {
      setIsAnalyzing(true);
      const result = await analyzeText(description, profile as any);
      
      const [hours, minutes] = consumedTime.split(':');
      const consumedDate = new Date(selectedDate);
      consumedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      const consumedAtIso = consumedDate.toISOString();

      const { data: scanData, error: scanError } = await supabase.from('food_scans').insert({
        user_id: user.id,
        scan_type: 'ingredients_list',
        meal_title: result.mealTitle,
        safety_status: result.safetyStatus,
        health_warnings: result.healthWarnings,
        total_calories: result.totalNutrition.calories,
        total_protein_g: result.totalNutrition.proteinG,
        total_carbs_g: result.totalNutrition.carbsG,
        total_fat_g: result.totalNutrition.fatG,
        total_fiber_g: result.totalNutrition.fiberG,
        total_sugar_g: result.totalNutrition.sugarG,
        total_sodium_mg: result.totalNutrition.sodiumMg,
        created_at: consumedAtIso,
      } as any).select().single();

      if (scanError) throw scanError;

      if (result.items && result.items.length > 0) {
        const itemsToInsert = result.items.map((item: any) => ({
          scan_id: (scanData as any).id,
          user_id: user.id,
          item_name: item.name,
          estimated_weight_g: item.estimatedWeightG,
          portion_description: item.portionDescription,
          calories: item.calories,
          protein_g: item.proteinG,
          carbs_g: item.carbsG,
          fat_g: item.fatG,
          fiber_g: item.fiberG,
          sugar_g: item.sugarG,
          sodium_mg: item.sodiumMg,
          item_safety_status: item.safetyStatus,
          detected_allergens: item.detectedAllergens,
          created_at: consumedAtIso,
        }));
        
        const { error: itemsError } = await supabase.from('scan_items').insert(itemsToInsert as any);
        if (itemsError) {
          console.error('Error inserting items:', itemsError);
          throw itemsError;
        }
      }

      if (result.safetyStatus === 'safe') {
        await supabase.from('meal_logs').insert({
          user_id: user.id,
          scan_id: (scanData as any).id,
          meal_type: mealTypeForAdd,
          food_name: result.mealTitle,
          calories: result.totalNutrition.calories,
          protein_g: result.totalNutrition.proteinG,
          carbs_g: result.totalNutrition.carbsG,
          fat_g: result.totalNutrition.fatG,
          fiber_g: result.totalNutrition.fiberG,
          sugar_g: result.totalNutrition.sugarG,
          sodium_mg: result.totalNutrition.sodiumMg,
          log_date: format(selectedDate, 'yyyy-MM-dd'),
          portion_multiplier: 1,
          consumed_at: consumedAtIso
        } as any);

        await refreshToday();
        setIsModalOpen(false);
        setDescription('');
        window.location.reload();
      } else {
        setIsModalOpen(false);
        setDescription('');
        navigate(`/app/scan/${(scanData as any).id}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to analyze and add food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const groups = useMemo(() => {
    const breakfast: any[] = [];
    const lunch: any[] = [];
    const dinner: any[] = [];
    const snack: any[] = [];

    scans.forEach(scan => {
      const date = new Date(scan.created_at);
      const isScanDate = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      
      if (isScanDate) {
        const hour = date.getHours();
        let mealType = '';
        const scanWithLogs = scan as any;
        if (scanWithLogs.meal_logs && scanWithLogs.meal_logs.length > 0) {
          mealType = scanWithLogs.meal_logs[0].meal_type;
        }

        if (mealType === 'breakfast' || (!mealType && hour >= 5 && hour < 11)) {
          breakfast.push(scan);
        } else if (mealType === 'lunch' || (!mealType && hour >= 11 && hour < 15)) {
          lunch.push(scan);
        } else if (mealType === 'dinner' || (!mealType && hour >= 17 && hour < 22)) {
          dinner.push(scan);
        } else {
          snack.push(scan);
        }
      }
    });

    return { breakfast, lunch, dinner, snack };
  }, [scans, selectedDate]);



  const openAddModal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setMealTypeForAdd(mealType);
    setConsumedTime(format(new Date(), 'HH:mm'));
    setDescription('');
    setIsModalOpen(true);
  };

  // Meal section card component
  const renderMealSection = (title: string, emoji: string, items: any[], mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const totalCals = items.reduce((sum, item) => {
      const isLogged = item.meal_logs && item.meal_logs.length > 0;
      return sum + (isLogged ? (item.total_calories || 0) : 0);
    }, 0);
    
    return (
      <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm overflow-hidden mb-5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dashed border-[#e8efe9]">
          <div className="flex items-center gap-3">
            <AppleEmoji emoji={emoji} className="w-6 h-6" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
              <h2 className="font-serif text-[20px] text-[#1e4832] leading-none mb-1 md:mb-0">{title}</h2>
              {/* Mobile Calories (hidden on md) */}
              <div className="flex md:hidden items-center gap-1">
                <Lightning size={14} weight="fill" style={{ fill: 'url(#lightning-grad-history)' }} />
                <span className="font-mono text-[11px] text-[#5a7a68] font-bold">
                  {Math.round(totalCals)} kcal
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Desktop Calories (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-1">
              <Lightning size={14} weight="fill" style={{ fill: 'url(#lightning-grad-history)' }} />
              <span className="font-mono text-[11px] text-[#5a7a68] font-bold">
                {Math.round(totalCals)} kcal
              </span>
            </div>
            
            <button 
              onClick={() => openAddModal(mealType)}
              className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] text-white rounded-[4px] flex items-center justify-center shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0"
              aria-label={`Add food to ${title}`}
            >
              <Plus size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 pb-5 pt-2">
          {items.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center gap-5">
              <p className="font-serif text-[16px] text-[#6b8274]">
                No meals logged for {title.toLowerCase()} yet.
              </p>
              <Link
                to="/app/scan"
                className="w-[90%] max-w-[320px] md:w-auto md:max-w-none mx-auto bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] text-white px-8 md:px-10 py-3.5 md:py-3 rounded-[4px] font-mono text-[13px] md:text-[12px] font-medium flex items-center justify-center gap-2 shadow-md hover:brightness-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition-all duration-200"
              >
                <PhosphorScan size={18} weight="fill" /> Scan Your Meals
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#f0f5f2]">
              {items.map((scan) => {
                const isLogged = scan.meal_logs && scan.meal_logs.length > 0;
                // Use a muted style for items that aren't logged yet
                const opacityClass = isLogged ? 'opacity-100' : 'opacity-60';
                
                return (
                <div 
                  key={scan.id} 
                  onClick={() => navigate(`/app/scan/${scan.id}`)}
                  className={`flex items-center gap-4 py-4 hover:bg-[#fafcfb] -mx-2 px-2 rounded-[4px] transition-colors cursor-pointer group ${opacityClass}`}
                >
                  {/* Food Thumbnail */}
                  <div className="w-8 h-8 md:w-11 md:h-11 rounded-[4px] flex items-center justify-center shrink-0 bg-[#f7f9f8] overflow-hidden border border-[#e8efe9]/50">
                    {scan.image_url ? (
                      <img src={scan.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <AppleEmoji emoji={guessEmoji(scan.meal_title || '')} className="w-5 h-5 md:w-7 md:h-7" />
                    )}
                  </div>

                  {/* Food Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-[14px] md:text-[16px] text-[#1e4832] truncate group-hover:text-[#2d6b45] transition-colors mb-1">
                      {scan.meal_title || 'Unknown Meal'}
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center font-mono text-[9px] md:text-[10px] text-[#a4b5aa] tracking-wide">
                      <div className="truncate mb-0.5 md:mb-0">
                        {format(new Date(scan.created_at), 'hh:mm a')} 
                        <span className="mx-1.5 md:mx-2 text-[#d1dfd6]">|</span> 
                        {Math.round(scan.total_calories || 0)} kcal 
                        <span className="mx-1.5 md:mx-2 text-[#d1dfd6]">|</span>
                        {Math.round(scan.total_carbs_g || 0)}g Carbs
                        <span className="hidden md:inline mx-1.5 md:mx-2 text-[#d1dfd6]">|</span>
                      </div>
                      <div className="truncate">
                        {Math.round(scan.total_protein_g || 0)}g Protein
                        <span className="mx-1.5 md:mx-2 text-[#d1dfd6]">|</span>
                        {Math.round(scan.total_fat_g || 0)}g Fat
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Logged Status Badge */}
                    <div 
                      className={`h-7 px-2 min-w-[28px] sm:w-[100px] rounded-[4px] flex items-center justify-center gap-1.5 shadow-sm font-mono text-[10px] font-bold ${
                        isLogged 
                          ? 'bg-[#e8efe9] text-[#1e4832]' 
                          : 'bg-white border border-[#e8efe9] text-[#a4b5aa] transition-colors'
                      }`}
                      title={isLogged ? "Logged" : "Not Logged"}
                    >
                      {isLogged ? (
                        <>
                          <CheckCircle size={14} weight="fill" className="shrink-0" />
                          <span className="hidden sm:block">Logged</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} weight="bold" className="shrink-0" />
                          <span className="hidden sm:block">Not Logged</span>
                        </>
                      )}
                    </div>

                    {/* Safety Badge */}
                    <div className={`h-7 px-2 min-w-[32px] sm:w-[85px] rounded-[4px] flex items-center justify-center gap-1.5 shadow-sm font-mono text-[10px] font-bold ${getSafetyBadgeStyle(scan.safety_status)}`}>
                      {getSafetyIcon(scan.safety_status)}
                      <span className="hidden sm:block">{getSafetyLabel(scan.safety_status)}</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    );
  };

  const targetCals = (profile as any)?.target_calories || 2000;
  const currentCals = Math.round(dailyCals);
  const progressPercent = Math.min(100, Math.max(0, (currentCals / targetCals) * 100));
  const isToday = isTodayFn(selectedDate);
  const dateLabel = isToday ? 'Today, ' : '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24"
    >
      {/* Header Card - blocky with background */}
      <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm p-6 lg:p-8 mb-5 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8 text-center md:text-left">
        
        {/* Left Side: Title and Calories (Desktop) / Top Section (Mobile) */}
        <div className="flex flex-col flex-1 w-full justify-between pr-0 md:pr-12 items-center md:items-start">
          <h1 className="text-[32px] font-serif text-[#1e4832] leading-none mb-6 md:mb-8">Daily Journal</h1>
          
          {/* Mobile Date Picker (shows after title on mobile) */}
          <div className="md:hidden mb-6 w-full max-w-[280px]">
            <CustomDatePicker 
              selectedDate={selectedDate} 
              onChange={setSelectedDate} 
              dateLabel={dateLabel} 
            />
          </div>
          
          {/* Calorie Summary */}
          <div className="relative w-full max-w-[320px] md:max-w-none flex flex-col items-center md:items-start">
            <svg width="0" height="0" className="absolute">
              <linearGradient id="lightning-grad-history" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#e55941" offset="0%" />
                <stop stopColor="#e68846" offset="50%" />
                <stop stopColor="#e7ac4b" offset="100%" />
              </linearGradient>
              <linearGradient id="fire-grad-history" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop stopColor="#fde047" offset="0%" />
                <stop stopColor="#f97316" offset="50%" />
                <stop stopColor="#ea580c" offset="100%" />
              </linearGradient>
            </svg>
            <div className="flex items-center gap-2 mb-3">
              <Lightning size={20} weight="fill" style={{ fill: 'url(#lightning-grad-history)' }} className="mr-0.5 -mt-0.5" />
              <span className="font-mono text-[14px] text-[#1e4832] font-bold">
                {currentCals} of {targetCals} kcal consumed
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#e8efe9] rounded-[4px] overflow-hidden mb-4">
              <div 
                className="h-full bg-[#1a3825] rounded-[4px] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="font-mono text-[10px] text-[#a4b5aa] leading-relaxed max-w-[280px] md:max-w-none">
              Every scan lands here automatically. Adjust a portion and the calories update with it.
            </p>
          </div>
        </div>

        {/* Right Side: Date Picker and Streak (Desktop) / Bottom Section (Mobile) */}
        <div className="flex flex-col items-center md:items-end justify-between gap-8 shrink-0 mt-2 md:mt-0 w-full md:w-auto">
          {/* Desktop Date Picker (hidden on mobile) */}
          <div className="hidden md:block">
            <CustomDatePicker 
              selectedDate={selectedDate} 
              onChange={setSelectedDate} 
              dateLabel={dateLabel} 
            />
          </div>

          <div className="flex flex-col items-center w-full max-w-[260px]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FireSimple size={22} weight="fill" style={{ fill: 'url(#fire-grad-history)' }} className="-mt-1" />
              <span className="font-serif text-[20px] text-[#5a7a68]">{streakCount} Days Streak</span>
            </div>
            
            <div className="flex justify-center gap-2 w-full">
              {streakData.map((d, i) => {
                const isSelected = d.fullDate && startOfDay(d.fullDate).getTime() === startOfDay(selectedDate).getTime();
                return (
                  <div 
                    key={i} 
                    onClick={() => d.fullDate && setSelectedDate(d.fullDate)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group w-[30px] shrink-0 relative"
                  >
                    <span className={`relative z-10 text-[11px] font-sans transition-colors duration-300 ${isSelected ? 'font-bold text-[#1e4832]' : 'text-[#8ba797] group-hover:text-[#6b8274]'}`}>{d.day.charAt(0)}</span>
                    <span className={`relative z-10 text-[11px] font-sans transition-colors duration-300 ${isSelected ? 'font-bold text-[#1e4832]' : 'text-[#a4b5aa] group-hover:text-[#8ba797]'}`}>{d.date}</span>
                    <div className={`relative z-10 w-[24px] h-[24px] shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${d.active ? 'bg-[#2a2d2a]' : 'bg-[#3b473f]'}`}>
                      {d.active ? (
                        <FireSimple size={12} weight="fill" style={{ fill: 'url(#fire-grad-history)' }} />
                      ) : (
                        <FireSimple size={12} weight="fill" className="text-[#64746b]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Meal Section Cards - blocky with animation */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-20 opacity-50"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[#8ba797] mb-4" />
            <p className="font-mono text-sm text-[#8ba797]">Fetching journal...</p>
          </motion.div>
        ) : (
          <motion.div 
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-5"
          >
            {renderMealSection("Breakfast", "🍳", groups.breakfast, 'breakfast')}
            {renderMealSection("Lunch", "🥗", groups.lunch, 'lunch')}
            {renderMealSection("Dinner", "🍲", groups.dinner, 'dinner')}
            {renderMealSection("Snacks", "🥨", groups.snack, 'snack')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Add Modal - blocky */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#e8efe9] shadow-xl w-full max-w-[480px] flex flex-col overflow-hidden rounded-[4px]"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#e8efe9] bg-[#f7f9f8]">
              <div className="flex items-center gap-2">
                <MagicWand size={20} className="text-[#1e4832]" weight="fill" />
                <h3 className="font-serif text-[20px] text-[#1e4832] leading-none">Describe Your Meal</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-[#e8efe9] rounded-[4px] text-[#6b8274] transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#6b8274] mb-2">
                    Meal Type
                  </label>
                  <div className="w-full p-3 bg-[#e8efe9] text-[#1e4832] font-serif text-[16px] rounded-[4px] capitalize cursor-not-allowed opacity-80">
                    {mealTypeForAdd}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#6b8274] mb-2">
                    Time Consumed
                  </label>
                  <CustomTimePicker 
                    value={consumedTime}
                    onChange={setConsumedTime}
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#6b8274] mb-2">
                  What did you eat?
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. A bowl of chicken soup with a slice of bread"
                  className="w-full h-28 p-4 border border-[#c5d1c9] bg-[#f4f7f5] text-[#1e4832] font-serif text-[16px] placeholder-[#a0b0a6] rounded-[4px] focus:outline-none focus:border-[#1e4832] resize-none"
                />
              </div>
              
              <div className="bg-[#fef3c7]/40 border border-[#fcd34d]/40 p-4 rounded-[4px] flex gap-3 items-start">
                <MagicWand className="w-4 h-4 text-[#92400e] mt-0.5 shrink-0" weight="fill" />
                <p className="text-[12px] font-mono leading-relaxed text-[#92400e]">
                  Our AI will analyze your description to estimate calories, macros, and check for allergens based on your health profile.
                </p>
              </div>

              <button
                onClick={handleAnalyzeAndAdd}
                disabled={isAnalyzing || !description.trim()}
                className="w-full py-4 mt-2 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#1a3825] text-white font-mono font-medium text-[13px] flex justify-center items-center gap-2 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.3),_0_4px_12px_rgba(22,51,35,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing & Saving...</>
                ) : (
                  <>Analyze & Add to Journal</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default HistoryPage;