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
      // Explicitly map incoming data (which may have mixed camelCase/snake_case) to DB columns
      const anyData = onboardingData as any;
      const mappedData: any = {
        is_onboarding_completed: true,
        full_name: anyData.fullName || anyData.full_name,
        birth_date: anyData.birthDate || anyData.birth_date,
        gender: anyData.gender,
        height_cm: anyData.heightCm || anyData.height_cm,
        weight_kg: anyData.weightKg || anyData.weight_kg,
        target_weight_kg: anyData.targetWeightKg || anyData.target_weight_kg,
        activity_level: anyData.activityLevel || anyData.activity_level,
        goal: anyData.goal || anyData.health_goal,
        allergies: anyData.allergies || [],
        intolerances: anyData.intolerances || [],
        medical_conditions: anyData.medicalConditions || anyData.medical_conditions || [],
        dietary_preferences: anyData.dietaryPreferences || anyData.dietary_preferences || [],
      };

      // Remove undefined keys so Supabase doesn't complain
      Object.keys(mappedData).forEach(key => {
        if (mappedData[key] === undefined) delete mappedData[key];
      });

      const { error } = await supabase
        .from('profiles')
        .update(mappedData as never)
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
