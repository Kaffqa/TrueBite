import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { FoodScan, SafetyStatus } from '@/types/database.types';

interface ScanFilters {
  safetyStatus?: SafetyStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook for fetching scan history with pagination and filtering.
 */
export function useScanHistory(pageSize: number = 20) {
  const { user } = useAuth();
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ScanFilters>({});
  
  // Track current page offset
  const [offset, setOffset] = useState(0);

  const fetchScans = useCallback(async (reset: boolean = false) => {
    if (!user) return;

    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      let query = supabase
        .from('food_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + pageSize - 1);

      if (filters.safetyStatus) {
        query = query.eq('safety_status', filters.safetyStatus);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', `${filters.startDate}T00:00:00.000Z`);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', `${filters.endDate}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const results = data || [];
      
      setScans(prev => reset ? results : [...prev, ...results]);
      setHasMore(results.length === pageSize);
      setOffset(currentOffset + results.length);
      
    } catch (err) {
      console.error('Error fetching scan history:', err);
    } finally {
      setLoading(false);
    }
  }, [user, offset, pageSize, filters]);

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchScans(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchScans(false);
    }
  }, [loading, hasMore, fetchScans]);

  const setFilter = useCallback((newFilters: ScanFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    scans,
    loading,
    hasMore,
    loadMore,
    setFilter,
    filters,
  };
}
