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

  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };

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
      <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <AppleEmoji emoji={emoji} className="w-7 h-7" />
            <h2 className="font-serif text-[22px] text-[#1e4832]">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Lightning size={18} weight="fill" style={{ fill: 'url(#lightning-grad-history)' }} className="-mt-0.5" />
              <span className="font-mono text-[13px] text-[#1e4832]">
                {Math.round(totalCals)} kcal
              </span>
            </div>
            <button 
              onClick={() => openAddModal(mealType)}
              className="bg-gradient-to-b from-[#5a8069] to-[#1a3825] text-white px-4 py-2 rounded-[4px] font-mono text-[11px] font-normal flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={12} weight="bold" /> Add Food
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 pb-5">
          {items.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <p className="font-serif text-[18px] italic text-[#6b8274]">
                No meals logged for {title.toLowerCase()} yet.
              </p>
              <Link
                to="/app/scan"
                className="bg-gradient-to-b from-[#5a8069] to-[#1a3825] text-white px-8 py-3 rounded-[4px] font-mono text-[12px] font-normal flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <PhosphorScan size={16} weight="bold" /> Scan Your Meals
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#f0f5f2]">
              {items.map((scan) => {
                const isLogged = scan.meal_logs && scan.meal_logs.length > 0;
                return (
                <div 
                  key={scan.id} 
                  onClick={() => navigate(`/app/scan/${scan.id}`)}
                  className="flex items-center gap-4 py-3.5 hover:bg-[#fafcfb] -mx-2 px-2 rounded-[4px] transition-colors cursor-pointer group"
                >
                  {/* Food Thumbnail */}
                  <div className="w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 overflow-hidden">
                    {scan.image_url ? (
                      <img src={scan.image_url} alt="" className="w-full h-full object-cover rounded-[4px]" />
                    ) : (
                      <AppleEmoji emoji={guessEmoji(scan.meal_title || '')} className="w-6 h-6" />
                    )}
                  </div>

                  {/* Food Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-[15px] text-[#1e4832] truncate group-hover:text-[#2d6b45] transition-colors">
                      {scan.meal_title || 'Unknown Meal'}
                    </h3>
                    <p className="font-mono text-[10px] text-[#8ba797] tracking-wide mt-0.5 truncate">
                      {format(new Date(scan.created_at), 'hh:mm a')}
                      {' | '}
                      <span className="text-[#1e4832] font-bold">{Math.round(scan.total_calories || 0)} kcal</span>
                      {' | '}
                      {Math.round(scan.total_carbs_g || 0)}g Carbs
                      {' | '}
                      {Math.round(scan.total_protein_g || 0)}g Protein
                      {' | '}
                      {Math.round(scan.total_fat_g || 0)}g Fat
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Logged Badge */}
                    <div className={`px-4 py-1.5 rounded-[4px] border flex items-center justify-center font-mono text-[11px] font-bold ${isLogged ? 'bg-[#f0f5f2] text-[#166534] border-[#c5d1c9]' : 'bg-white text-[#8ba797] border-[#e8efe9]'}`} style={{ minWidth: '96px' }}>
                      {isLogged ? 'Logged' : 'Not Logged'}
                    </div>

                    {/* Safety Badge - blocky */}
                    <div className={`px-4 py-1.5 rounded-[4px] border flex items-center gap-1.5 font-mono text-[11px] font-bold ${getSafetyBadgeStyle(scan.safety_status)}`} style={{ minWidth: '96px', justifyContent: 'center' }}>
                      {getSafetyIcon(scan.safety_status)}
                      {getSafetyLabel(scan.safety_status)}
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
      <div className="bg-white rounded-[4px] border border-[#e8efe9] shadow-sm p-6 lg:p-8 mb-5 flex flex-col md:flex-row justify-between gap-8 md:gap-8">
        
        {/* Left Side: Title and Calories */}
        <div className="flex flex-col flex-1 w-full justify-between pr-0 md:pr-12">
          <h1 className="text-[32px] font-serif text-[#1e4832] leading-none mb-8">Daily Journal</h1>
          
          {/* Calorie Summary */}
          <div className="relative w-full">
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
              <span className="font-mono text-[14px] text-[#1e4832]">
                {currentCals} of {targetCals} kcal consumed
              </span>
            </div>
            <div className="w-full h-2 bg-[#e8efe9] rounded-[4px] overflow-hidden mb-3">
              <div 
                className="h-full bg-[#1a3825] rounded-[4px] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="font-mono text-[11px] text-[#8ba797] italic">
              Every scan lands here automatically. Adjust a portion and the calories update with it.
            </p>
          </div>
        </div>

        {/* Right Side: Date Picker and Streak */}
        <div className="flex flex-col items-center md:items-end justify-between gap-8 shrink-0">
          <button 
            className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-white border border-[#c5d1c9] rounded-[4px] shadow-sm hover:shadow-md transition-shadow w-full md:w-auto justify-center"
            onClick={() => dateInputRef.current?.showPicker()}
          >
            <CalendarDots size={18} className="text-[#1a3825]" weight="bold" />
            <span className="font-mono text-[12px] text-[#1e4832] tracking-wide whitespace-nowrap">
              {dateLabel}{format(selectedDate, 'MMMM dd, yyyy')}
            </span>
            <CaretDown size={14} className="text-[#6b8274]" weight="bold" />
            <input 
              ref={dateInputRef}
              type="date" 
              className="sr-only"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
            />
          </button>

          <div className="flex flex-col items-center w-full max-w-[260px]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FireSimple size={26} weight="fill" style={{ fill: 'url(#fire-grad-history)' }} className="-mt-1" />
              <span className="font-serif text-[22px] text-[#1e4832]">{streakCount} Days Streak</span>
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
                    <span className={`relative z-10 text-[11px] font-sans transition-colors duration-300 ${isSelected ? 'font-bold text-[#1e4832]' : 'text-[#8ba797] group-hover:text-[#6b8274]'}`}>{d.day}</span>
                    <span className={`relative z-10 text-[11px] font-sans transition-colors duration-300 ${isSelected ? 'font-bold text-[#1e4832]' : 'text-[#a4b5aa] group-hover:text-[#8ba797]'}`}>{d.date}</span>
                    <div className={`relative z-10 w-[30px] h-[30px] shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${d.active ? 'bg-[#2a2d2a]' : 'bg-[#3b473f]'}`}>
                      {d.active ? (
                        <FireSimple size={15} weight="fill" style={{ fill: 'url(#fire-grad-history)' }} />
                      ) : (
                        <FireSimple size={15} weight="fill" className="text-[#64746b]" />
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
                  <input
                    type="time"
                    value={consumedTime}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => e.stopPropagation()}
                    onChange={(e) => setConsumedTime(e.target.value)}
                    className="w-full p-3 border border-[#c5d1c9] bg-[#f4f7f5] text-[#1e4832] font-mono text-[14px] rounded-[4px] focus:outline-none focus:border-[#1e4832]"
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