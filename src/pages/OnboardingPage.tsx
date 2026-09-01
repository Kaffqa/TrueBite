import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { OnboardingData } from '@/types/common.types';
import { calculateTDEE } from '@/lib/tdee-calculator';

// Placeholder components for the steps
const StepBasicInfo = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Basic Information</h2>
    <input type="text" placeholder="Full Name" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.full_name || ''} onChange={e => updateData({ full_name: e.target.value })} />
    <input type="date" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.birth_date || ''} onChange={e => updateData({ birth_date: e.target.value })} />
    <select className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.gender || ''} onChange={e => updateData({ gender: e.target.value })}>
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
);

const StepBodyMetrics = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Body Metrics</h2>
    <input type="number" placeholder="Height (cm)" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.height_cm || ''} onChange={e => updateData({ height_cm: Number(e.target.value) })} />
    <input type="number" placeholder="Weight (kg)" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.weight_kg || ''} onChange={e => updateData({ weight_kg: Number(e.target.value) })} />
    <input type="number" placeholder="Target Weight (kg) - Optional" className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.target_weight_kg || ''} onChange={e => updateData({ target_weight_kg: Number(e.target.value) })} />
  </div>
);

const StepActivityLevel = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Activity & Goals</h2>
    <select className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.activity_level || ''} onChange={e => updateData({ activity_level: e.target.value })}>
      <option value="">Select Activity Level</option>
      <option value="sedentary">Sedentary</option>
      <option value="lightly_active">Lightly Active</option>
      <option value="moderately_active">Moderately Active</option>
      <option value="very_active">Very Active</option>
      <option value="extra_active">Extra Active</option>
    </select>
    <select className="w-full p-3 rounded-xl bg-green-800/50 text-white" value={data.health_goal || ''} onChange={e => updateData({ health_goal: e.target.value })}>
      <option value="">Select Goal</option>
      <option value="lose_weight">Lose Weight</option>
      <option value="maintain_weight">Maintain Weight</option>
      <option value="gain_weight">Gain Weight</option>
      <option value="build_muscle">Build Muscle</option>
    </select>
  </div>
);

const StepAllergies = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Allergies & Intolerances</h2>
    <p className="text-green-300 text-sm">Select applicable options.</p>
    {['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Lactose', 'Gluten'].map(item => (
      <label key={item} className="flex items-center space-x-2 text-green-50">
        <input 
          type="checkbox" 
          checked={(data.allergies || []).includes(item)}
          onChange={(e) => {
            const newAllergies = e.target.checked 
              ? [...(data.allergies || []), item]
              : (data.allergies || []).filter((a: string) => a !== item);
            updateData({ allergies: newAllergies });
          }}
          className="rounded bg-green-900 border-green-700 text-green-500 focus:ring-green-500"
        />
        <span>{item}</span>
      </label>
    ))}
  </div>
);

const StepMedicalConditions = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Medical Conditions</h2>
    <p className="text-green-300 text-sm">Select applicable options.</p>
    {['Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Celiac Disease', 'IBS', 'GERD'].map(item => (
      <label key={item} className="flex items-center space-x-2 text-green-50">
        <input 
          type="checkbox" 
          checked={(data.medical_conditions || []).includes(item)}
          onChange={(e) => {
            const newCond = e.target.checked 
              ? [...(data.medical_conditions || []), item]
              : (data.medical_conditions || []).filter((a: string) => a !== item);
            updateData({ medical_conditions: newCond });
          }}
          className="rounded bg-green-900 border-green-700 text-green-500 focus:ring-green-500"
        />
        <span>{item}</span>
      </label>
    ))}
  </div>
);

const StepDietaryPreferences = ({ data, updateData }: any) => (
  <div className="space-y-4 font-mono">
    <h2 className="text-2xl font-serif text-green-50">Dietary Preferences</h2>
    <p className="text-green-300 text-sm">Select applicable options.</p>
    {['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher'].map(item => (
      <label key={item} className="flex items-center space-x-2 text-green-50">
        <input 
          type="checkbox" 
          checked={(data.dietary_preferences || []).includes(item)}
          onChange={(e) => {
            const newPrefs = e.target.checked 
              ? [...(data.dietary_preferences || []), item]
              : (data.dietary_preferences || []).filter((a: string) => a !== item);
            updateData({ dietary_preferences: newPrefs });
          }}
          className="rounded bg-green-900 border-green-700 text-green-500 focus:ring-green-500"
        />
        <span>{item}</span>
      </label>
    ))}
  </div>
);

const StepReview = ({ data }: any) => {
  const preview = calculateTDEE({
    weightKg: data.weight_kg || 0,
    heightCm: data.height_cm || 0,
    birthDate: data.birth_date || new Date().toISOString(),
    gender: data.gender || 'other',
    activityLevel: data.activity_level || 'sedentary',
    goal: data.health_goal || 'maintain_weight',
    medicalConditions: data.medical_conditions || []
  });

  return (
    <div className="space-y-4 font-mono text-green-50">
      <h2 className="text-2xl font-serif">Review & Results</h2>
      <div className="bg-green-800/40 p-4 rounded-xl border border-green-700/50">
        <h3 className="font-bold text-green-300 mb-2">Estimated Needs</h3>
        <p>BMR: {preview.bmr} kcal</p>
        <p>TDEE: {preview.tdee} kcal</p>
        <p className="text-xl font-bold mt-2 text-white">Target Calories: {preview.targetCalories} kcal/day</p>
      </div>
    </div>
  );
};

const steps = [
  { id: 'basic', component: StepBasicInfo },
  { id: 'body', component: StepBodyMetrics },
  { id: 'activity', component: StepActivityLevel },
  { id: 'allergies', component: StepAllergies },
  { id: 'medical', component: StepMedicalConditions },
  { id: 'dietary', component: StepDietaryPreferences },
  { id: 'review', component: StepReview },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const { completeOnboarding } = useProfile();
  const navigate = useNavigate();

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleComplete = async () => {
    await completeOnboarding(data as OnboardingData);
    navigate('/');
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-background text-green-50 flex flex-col p-6">
      <div className="w-full max-w-md mx-auto pt-8 flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="w-full bg-green-900 rounded-full h-2 mb-8">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 bg-green-900/20 p-6 rounded-3xl border border-green-800/50 shadow-xl backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentComponent data={data} updateData={updateData} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 mb-4 font-mono">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-xl bg-green-900 text-green-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-800 transition-colors"
          >
            Back
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button 
              onClick={handleComplete}
              className="px-6 py-3 rounded-xl bg-green-500 text-green-50 font-bold hover:bg-green-400 transition-colors"
            >
              Complete
            </button>
          ) : (
            <button 
              onClick={nextStep}
              className="px-6 py-3 rounded-xl bg-green-500 text-green-50 font-bold hover:bg-green-400 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}