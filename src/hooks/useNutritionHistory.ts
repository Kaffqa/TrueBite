import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { DailyNutritionSummary } from '@/types/database.types';
import { subDays, format } from 'date-fns';

/**
 * Hook for fetching historical daily nutrition summaries.
 */
export function useNutritionHistory(days: number = 7) {
  const { user } = useAuth();
  const [history, setHistory] = useState<DailyNutritionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const { data, error: err } = await supabase
        .from('daily_nutrition_summaries')
        .select('*')
        .eq('user_id', user.id)
        .gte('summary_date', startDate)
        .lte('summary_date', endDate)
        .order('summary_date', { ascending: false });

      if (err) throw err;
      
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching nutrition history:', err);
      setError(err.message || 'Failed to fetch nutrition history');
    } finally {
      setLoading(false);
    }
  }, [user, days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    history,
    loading,
    error,
    refresh,
  };
}
