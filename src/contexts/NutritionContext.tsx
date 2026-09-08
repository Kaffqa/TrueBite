import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { MealLog, DailyNutritionSummary } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface NutritionContextType {
  todaySummary: DailyNutritionSummary | null;
  todayMealLogs: MealLog[];
  loading: boolean;
  addMealLog: (log: Omit<MealLog, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  removeMealLog: (logId: string) => Promise<void>;
  refreshToday: () => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

/**
 * Context provider for daily nutrition tracking.
 */
export function NutritionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [todaySummary, setTodaySummary] = useState<DailyNutritionSummary | null>(null);
  const [todayMealLogs, setTodayMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshToday = useCallback(async () => {
    if (!user) {
      setTodaySummary(null);
      setTodayMealLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: summaryData } = await supabase
        .from('daily_nutrition_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('summary_date', today)
        .maybeSingle();
        
      setTodaySummary(summaryData);

      // Assuming consumed_at has timestamp, we get logs from today
      const todayStart = `${today}T00:00:00.000Z`;
      const todayEnd = `${today}T23:59:59.999Z`;

      const { data: logsData } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('consumed_at', todayStart)
        .lte('consumed_at', todayEnd)
        .order('consumed_at', { ascending: true });
        
      if (logsData) {
        setTodayMealLogs(logsData);
      }
    } catch (error) {
      console.error('Error fetching today nutrition:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshToday();

    if (!user) return;

    const subscription = supabase
      .channel('public:meal_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meal_logs', filter: `user_id=eq.${user.id}` },
        () => {
          refreshToday();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, refreshToday]);

  const addMealLog = async (log: Omit<MealLog, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    // @ts-ignore
    const { error } = await supabase.from('meal_logs').insert([log as any]);
    if (error) throw error;
  };

  const removeMealLog = async (logId: string) => {
    if (!user) return;
    const { error } = await supabase.from('meal_logs').delete().eq('id', logId);
    if (error) throw error;
  };

  return (
    <NutritionContext.Provider
      value={{
        todaySummary,
        todayMealLogs,
        loading,
        addMealLog,
        removeMealLog,
        refreshToday,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

/**
 * Hook to access nutrition context.
 */
export function useNutrition() {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}
