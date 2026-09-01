import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';
import type { OnboardingData } from '@/types/common.types';

/**
 * Hook for managing user profile and onboarding.
 */
export function useProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Updates the user profile with partial data.
   */
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('profiles')
        .update(data as never)
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Completes the user onboarding process.
   */
  const completeOnboarding = async (onboardingData: OnboardingData) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Map onboarding data to profile columns
      const updateData: Partial<Profile> = {
        ...onboardingData,
        is_onboarding_completed: true,
      };

      // @ts-ignore
      const { error } = await supabase
        .from('profiles')
        .update(updateData as never)
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    completeOnboarding,
  };
}
