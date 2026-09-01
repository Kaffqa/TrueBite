import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNutrition } from '@/contexts/NutritionContext';
import { compressImage, uploadScanImage, fileToBase64 } from '@/lib/storage';
import { analyzeFood } from '@/lib/ai-provider';
import { supabase } from '@/lib/supabase';
import type { FoodAnalysisResult, UserHealthProfile } from '@/types/ai.types';
import type { MealType } from '@/types/database.types';

export type ScanState = 'idle' | 'capturing' | 'uploading' | 'analyzing' | 'complete' | 'error';

// Helper to determine meal type based on current time
const getMealType = (): MealType => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 22) return 'dinner';
  return 'snack';
};

/**
 * Hook for handling the food scanning pipeline.
 */
export function useScanner() {
  const { user, profile } = useAuth();
  const { addMealLog } = useNutrition();
  
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Processes the scan from image to analysis to database logging.
   */
  const processScan = async (imageFile: File | Blob) => {
    if (!user || !profile) {
      setError('User not authenticated or profile missing');
      setScanState('error');
      return;
    }

    try {
      setScanState('uploading');
      setError(null);

      const compressedImage = await compressImage(imageFile);
      const imageUrl = await uploadScanImage(user.id, compressedImage);
      const base64Data = await fileToBase64(compressedImage);

      const userHealthProfile: UserHealthProfile = {
        allergies: profile.allergies || [],
        intolerances: profile.intolerances || [],
        medicalConditions: profile.medical_conditions || [],
        dietaryPreferences: profile.dietary_preferences || [],
        targetCalories: profile.target_calories || 2000,
        targetSodiumMg: profile.target_sodium_mg || 2300,
        targetSugarG: profile.target_sugar_g || 50,
      };

      setScanState('analyzing');
      const analysisResult = await analyzeFood(base64Data, userHealthProfile);

      // Save scan record
      const scanInsertData: any = {
        user_id: user.id,
        image_url: imageUrl,
        scan_type: 'meal_photo',
        meal_title: analysisResult.mealTitle,
        safety_status: analysisResult.safetyStatus,
        health_warnings: analysisResult.healthWarnings || [],
        total_calories: analysisResult.totalNutrition.calories,
        total_protein_g: analysisResult.totalNutrition.proteinG,
        total_carbs_g: analysisResult.totalNutrition.carbsG,
        total_fat_g: analysisResult.totalNutrition.fatG,
        total_fiber_g: analysisResult.totalNutrition.fiberG,
        total_sugar_g: analysisResult.totalNutrition.sugarG,
        total_sodium_mg: analysisResult.totalNutrition.sodiumMg,
      };

      // @ts-ignore
      const { data: scanData, error: scanError } = await supabase
        .from('food_scans')
        .insert([scanInsertData] as never[])
        .select()
        .single();

      if (scanError || !scanData) throw scanError || new Error('Failed to save scan');

      // Save scan items (nutrition)
      if (analysisResult.items && analysisResult.items.length > 0) {
        const scanItemsData = analysisResult.items.map((item) => ({
          // @ts-ignore
          scan_id: scanData.id,
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
          detected_allergens: item.detectedAllergens,
          item_safety_status: item.safetyStatus,
        }));
        const { error: itemsError } = await supabase
          .from('scan_items')
          .insert(scanItemsData as any);
          
        if (itemsError) console.error('Failed to save scan items:', itemsError);
      }

      // Auto-log if safe
      if (analysisResult.safetyStatus === 'safe') {
        const logData: any = {
          user_id: user.id,
          // @ts-ignore
          scan_id: scanData.id,
          meal_type: getMealType(),
          food_name: analysisResult.mealTitle,
          calories: analysisResult.totalNutrition.calories,
          protein_g: analysisResult.totalNutrition.proteinG,
          carbs_g: analysisResult.totalNutrition.carbsG,
          fat_g: analysisResult.totalNutrition.fatG,
          fiber_g: analysisResult.totalNutrition.fiberG,
          sugar_g: analysisResult.totalNutrition.sugarG,
          sodium_mg: analysisResult.totalNutrition.sodiumMg,
          consumed_at: new Date().toISOString(),
          log_date: new Date().toISOString().split('T')[0],
          portion_multiplier: 1,
        };
        await addMealLog(logData);
      }
      
      // @ts-ignore
      setResult({ ...analysisResult, id: scanData.id } as FoodAnalysisResult & { id: string });
      setScanState('complete');
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'An error occurred during scanning');
      setScanState('error');
    }
  };

  /**
   * Resets the scanner state.
   */
  const reset = () => {
    setScanState('idle');
    setResult(null);
    setError(null);
  };

  /**
   * Manually confirm meal logging for caution items.
   */
  const confirmMealLog = async (mealType: MealType = getMealType()) => {
    if (!user || !result || !(result as any).id) return;
    
    const logData: any = {
      user_id: user.id,
      scan_id: (result as any).id,
      meal_type: mealType,
      food_name: result.mealTitle,
      calories: result.totalNutrition.calories,
      protein_g: result.totalNutrition.proteinG,
      carbs_g: result.totalNutrition.carbsG,
      fat_g: result.totalNutrition.fatG,
      fiber_g: result.totalNutrition.fiberG,
      sugar_g: result.totalNutrition.sugarG,
      sodium_mg: result.totalNutrition.sodiumMg,
      consumed_at: new Date().toISOString(),
      log_date: new Date().toISOString().split('T')[0],
      portion_multiplier: 1,
    };
    
    await addMealLog(logData);
  };

  return {
    scanState,
    result,
    error,
    processScan,
    reset,
    confirmMealLog,
  };
}
