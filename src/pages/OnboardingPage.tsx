import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { generatePersonalIngredients } from '@/lib/ai-provider';
import { OnboardingData } from '@/types/common.types';
import { Ruler, Utensils, ShieldAlert, Target as TargetIcon } from 'lucide-react';

// GenderToggle container
const GenderToggle = ({ value, onChange }: any) => (
  <div className="flex bg-[#122b1e] p-1.5 w-full max-w-sm mx-auto shadow-inner rounded-[2px] gap-1 relative">
    {['Male', 'Female', 'Other'].map(gender => {
      const isActive = value === gender.toLowerCase();
      return (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender.toLowerCase())}
          className={`relative flex-1 py-2 text-sm font-medium rounded-[1px] transition-all flex items-center justify-center ${
            isActive ? 'text-white' : 'text-[#8ba797] hover:text-white hover:bg-white/5'
          }`}
        >
          {isActive && (
            <motion.div
              layoutId="genderHighlight"
              className="absolute inset-0 bg-gradient-to-b from-[#88ba9d] to-[#173d26] shadow-sm border border-[#c0d4c8] rounded-[1px]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{gender}</span>
        </button>
      );
    })}
  </div>
);

// InputWithUnit
const InputWithUnit = ({ label, value, onChange, unit, onUnitToggle, unitOptions }: any) => {
  const layoutIdPrefix = unitOptions ? unitOptions.join('') : '';
  
  return (
    <div className="flex flex-col gap-1 text-left w-full">
      <label className="text-[#a4b5aa] text-sm font-mono">{label}</label>
      <div className="relative w-full">
        <input
          type="number"
          className="w-full p-3 rounded-[2px] border border-[#c5d1c9] bg-white text-[#1e4832] focus:outline-none focus:ring-1 focus:ring-[#1e4832] text-lg font-mono pr-20"
          value={value}
          onChange={onChange}
        />
        {unitOptions && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex bg-[#122b1e] rounded-[2px] text-[10px] p-1 text-white font-mono gap-0.5 shadow-inner">
            {unitOptions.map((opt: string) => {
              const isActive = unit === opt;
              return (
                <button 
                  key={opt}
                  type="button"
                  className={`relative px-3 py-1.5 min-w-[32px] flex items-center justify-center rounded-[1px] transition-colors ${
                    isActive ? 'text-white' : 'text-[#8ba797] hover:text-white'
                  }`}
                  onClick={() => onUnitToggle(opt)}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`unitHighlight-${layoutIdPrefix}`}
                      className="absolute inset-0 bg-gradient-to-b from-[#88ba9d] to-[#173d26] shadow-sm border border-[#c0d4c8] rounded-[1px]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{opt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// SimpleInput
const SimpleInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="flex flex-col gap-1 text-left w-full">
    <label className="text-[#a4b5aa] text-sm font-mono">{label}</label>
    <input
      type={type}
      className="w-full p-3 rounded border border-[#c5d1c9] bg-white text-[#1e4832] focus:outline-none focus:ring-1 focus:ring-[#1e4832] text-lg font-mono"
      value={value}
      onChange={onChange}
    />
  </div>
);

// Stepper
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 0, label: 'Body Metrics', Icon: Ruler },
    { id: 1, label: 'Diet Styles', Icon: Utensils },
    { id: 2, label: 'Allergies', Icon: ShieldAlert },
    { id: 3, label: 'Your goal', Icon: TargetIcon },
  ];

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-16 px-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2 relative">
            <div className={`w-14 h-14 rounded-[2px] flex items-center justify-center relative z-10 transition-colors shadow-sm ${
              currentStep >= index 
                ? 'bg-gradient-to-b from-[#88ba9d] to-[#173d26] text-white shadow-md border-2 border-[#c0d4c8]' 
                : 'bg-[#98b0a0] text-white'
            }`}>
              <step.Icon size={24} />
            </div>
            <span className={`absolute -bottom-8 text-sm whitespace-nowrap font-mono ${
              currentStep === index ? 'text-[#1e4832] font-bold' : 'text-[#a0b0a6]'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${
              currentStep > index ? 'bg-[#1e4832]' : 'bg-[#c8d4ce]'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const StepBodyMetrics = ({ data, updateData }: any) => (
  <div className="flex flex-col items-center w-full max-w-sm mx-auto space-y-6">
    <div className="text-center mb-4">
      <p className="text-xs text-[#a0b0a6] uppercase tracking-widest font-mono mb-2">Step 1 Of 4</p>
      <h3 className="text-2xl font-mono font-semibold text-[#1e4832]">Body Metrics</h3>
      <p className="text-sm text-[#a0b0a6] font-mono mt-1">Help us personalize your daily targets</p>
    </div>
    <GenderToggle value={data.gender || 'male'} onChange={(v: string) => updateData({ gender: v })} />
    <InputWithUnit 
      label="Height" 
      value={data.height_cm || ''} 
      onChange={(e: any) => updateData({ height_cm: e.target.value })} 
      unit={data.height_unit || 'CM'}
      onUnitToggle={(u: string) => updateData({ height_unit: u })}
      unitOptions={['CM', 'FT']}
    />
    <InputWithUnit 
      label="Weight" 
      value={data.weight_kg || ''} 
      onChange={(e: any) => updateData({ weight_kg: e.target.value })} 
      unit={data.weight_unit || 'KG'}
      onUnitToggle={(u: string) => updateData({ weight_unit: u })}
      unitOptions={['KG', 'LBS']}
    />
    <SimpleInput 
      label="Age" 
      type="number"
      value={data.age || ''} 
      onChange={(e: any) => updateData({ age: e.target.value })} 
    />
  </div>
);

const MultiSelectPill = ({ label, selected, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-[2px] font-mono text-sm transition-all border ${
      selected
        ? 'bg-gradient-to-b from-[#88ba9d] to-[#173d26] text-white border-[#c0d4c8] shadow-sm'
        : 'bg-white text-[#5c8b71] border-[#c5d1c9] hover:border-[#5c8b71]'
    }`}
  >
    {label}
  </button>
);

const StepDietStyles = ({ data, updateData }: any) => {
  const toggleDiet = (item: string) => {
    const current = data.dietary_preferences || [];
    const newItems = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
    updateData({ dietary_preferences: newItems });
  };
  const toggleMedical = (item: string) => {
    const current = data.medical_conditions || [];
    const newItems = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
    updateData({ medical_conditions: newItems });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8">
      <div className="text-center">
        <p className="text-xs text-[#a0b0a6] uppercase tracking-widest font-mono mb-2">Step 2 Of 4</p>
        <h3 className="text-2xl font-mono font-semibold text-[#1e4832]">Diet Styles</h3>
        <p className="text-sm text-[#a0b0a6] font-mono mt-1">Select your dietary preferences and conditions</p>
      </div>

      <div className="w-full">
        <h4 className="text-sm text-[#a4b5aa] font-mono mb-3 text-left">Dietary Preferences</h4>
        <div className="flex flex-wrap gap-2">
          {['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Low Carb'].map(item => (
            <MultiSelectPill key={item} label={item} selected={(data.dietary_preferences || []).includes(item)} onClick={() => toggleDiet(item)} />
          ))}
        </div>
      </div>

      <div className="w-full">
        <h4 className="text-sm text-[#a4b5aa] font-mono mb-3 text-left">Medical Conditions</h4>
        <div className="flex flex-wrap gap-2">
          {['Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Celiac Disease', 'IBS', 'GERD', 'PCOS'].map(item => (
            <MultiSelectPill key={item} label={item} selected={(data.medical_conditions || []).includes(item)} onClick={() => toggleMedical(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StepAllergies = ({ data, updateData }: any) => {
  const toggleItem = (item: string) => {
    const current = data.allergies || [];
    const newItems = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
    updateData({ allergies: newItems });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-6">
      <div className="text-center mb-6">
        <p className="text-xs text-[#a0b0a6] uppercase tracking-widest font-mono mb-2">Step 3 Of 4</p>
        <h3 className="text-2xl font-mono font-semibold text-[#1e4832]">Allergies</h3>
        <p className="text-sm text-[#a0b0a6] font-mono mt-1">Select any ingredients you need to avoid</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Lactose', 'Gluten'].map(item => (
          <MultiSelectPill key={item} label={item} selected={(data.allergies || []).includes(item)} onClick={() => toggleItem(item)} />
        ))}
      </div>
    </div>
  );
};

const SelectableCard = ({ title, description, selected, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left p-4 rounded-[2px] border transition-all duration-200 flex flex-col gap-1 ${
      selected 
        ? 'bg-gradient-to-b from-[#88ba9d] to-[#173d26] border-[#c0d4c8] shadow-sm' 
        : 'bg-white border-[#e0e8e3] hover:border-[#a4b5aa]'
    }`}
  >
    <div className={`font-serif ${selected ? 'text-white' : 'text-[#1e4832]'}`}>{title}</div>
    {description && <div className={`font-mono text-xs ${selected ? 'text-white/80' : 'text-[#6b8274]'}`}>{description}</div>}
  </button>
);

const StepGoal = ({ data, updateData }: any) => {
  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-8 max-h-[50vh] overflow-y-auto px-2">
      <div className="text-center shrink-0">
        <p className="text-xs text-[#a0b0a6] uppercase tracking-widest font-mono mb-2">Step 4 Of 4</p>
        <h3 className="text-2xl font-mono font-semibold text-[#1e4832]">Your Goal</h3>
        <p className="text-sm text-[#a0b0a6] font-mono mt-1">Tell us your activity level and target</p>
      </div>

      <div className="w-full space-y-3">
        <h4 className="text-sm text-[#a4b5aa] font-mono mb-1 text-left">Activity Level</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'sedentary', title: 'Sedentary', desc: 'Little or no exercise' },
            { id: 'lightly_active', title: 'Lightly Active', desc: '1-3 days/week' },
            { id: 'moderately_active', title: 'Moderately Active', desc: '3-5 days/week' },
            { id: 'very_active', title: 'Very Active', desc: '6-7 days/week' },
          ].map(level => (
            <SelectableCard key={level.id} title={level.title} description={level.desc} selected={data.activity_level === level.id} onClick={() => updateData({ activity_level: level.id })} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-3">
        <h4 className="text-sm text-[#a4b5aa] font-mono mb-1 text-left">Primary Goal</h4>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'lose_weight_fast', title: 'Lose Weight Fast' },
            { id: 'lose_weight_gradual', title: 'Lose Weight Gradual' },
            { id: 'maintain_weight', title: 'Maintain Weight' },
            { id: 'gain_muscle', title: 'Gain Muscle' },
            { id: 'manage_condition', title: 'Manage Condition' },
          ].map(goal => (
            <SelectableCard key={goal.id} title={goal.title} selected={data.health_goal === goal.id} onClick={() => updateData({ health_goal: goal.id })} />
          ))}
        </div>
      </div>

      <div className="w-full pt-4 pb-8">
        <SimpleInput 
          label="Target Weight (Optional)" 
          type="number"
          value={data.target_weight_kg || ''} 
          onChange={(e: any) => updateData({ target_weight_kg: e.target.value })} 
        />
        <p className="text-[10px] text-[#a4b5aa] mt-1 font-mono">Uses preferred unit ({data.weight_unit || 'KG'}) from Step 1</p>
      </div>
    </div>
  );
};

const steps = [
  { id: 'body', component: StepBodyMetrics },
  { id: 'diet', component: StepDietStyles },
  { id: 'allergies', component: StepAllergies },
  { id: 'goal', component: StepGoal },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<any>({
    gender: 'male',
    height_unit: 'CM',
    weight_unit: 'KG'
  });
  const { completeOnboarding } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const updateData = (newData: any) => {
    setData((prev: any) => ({ ...prev, ...newData }));
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      return !!data.height_cm && !!data.weight_kg && !!data.age;
    }
    if (currentStep === 3) {
      return !!data.activity_level && !!data.health_goal;
    }
    return true; // Step 1 and 2 (Diet and Allergies) are optional multi-selects
  };

  const handleNext = async () => {
    if (!isStepValid()) return;
    setDirection(1);

    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      let birthDate = new Date().toISOString();
      if (data.age) {
        const currentYear = new Date().getFullYear();
        birthDate = new Date(`${currentYear - parseInt(data.age)}-01-01`).toISOString();
      }

      let finalWeightKg = data.weight_kg;
      if (data.weight_unit === 'LBS' && data.weight_kg) {
        finalWeightKg = (parseFloat(data.weight_kg) * 0.453592).toFixed(2);
      }
      
      let finalTargetKg = data.target_weight_kg;
      if (data.weight_unit === 'LBS' && data.target_weight_kg) {
        finalTargetKg = (parseFloat(data.target_weight_kg) * 0.453592).toFixed(2);
      }

      let finalHeightCm = data.height_cm;
      if (data.height_unit === 'FT' && data.height_cm) {
        finalHeightCm = (parseFloat(data.height_cm) * 30.48).toFixed(2);
      }

      const payload: OnboardingData = {
        ...data,
        birth_date: birthDate,
        weight_kg: finalWeightKg ? Number(finalWeightKg) : undefined,
        height_cm: finalHeightCm ? Number(finalHeightCm) : undefined,
        target_weight_kg: finalTargetKg ? Number(finalTargetKg) : undefined,
      };

      await completeOnboarding(payload);

      // Fire-and-forget: generate personalized ingredients in the background
      if (user) {
        const userProfile = {
          allergies: data.allergies || [],
          intolerances: data.intolerances || [],
          medicalConditions: data.medical_conditions || [],
          dietaryPreferences: data.dietary_preferences || [],
          targetCalories: null,
          targetSodiumMg: null,
          targetSugarG: null,
        };
        generatePersonalIngredients(userProfile)
          .then(async (aiIngredients) => {
            if (aiIngredients && aiIngredients.length > 0) {
              const { supabase } = await import('@/lib/supabase');
              const rows = aiIngredients.map((ing: any) => ({
                user_id: user.id,
                ingredient_name: ing.ingredientName,
                category: ing.category,
                status: ing.status,
                reason: ing.reason,
                description: ing.description,
                commonly_found_in: ing.commonlyFoundIn || [],
                source: 'onboarding',
                times_encountered: 1,
              }));
              await supabase.from('user_ingredients').upsert(rows as any, { onConflict: 'user_id,ingredient_name', ignoreDuplicates: true });
              console.log(`✅ Generated ${aiIngredients.length} personalized ingredients.`);
            }
          })
          .catch((err) => console.error('Background ingredient generation failed:', err));
      }

      navigate('/app');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(c => c - 1);
    }
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-full flex flex-col items-center py-6 w-full">
      <div className="w-full max-w-4xl min-h-[80vh] flex flex-col items-center py-10 px-4 sm:px-10 relative">
        
        <div className="text-center mb-10 mt-4">
          <p className="text-sm text-[#8ba797] font-mono tracking-widest mb-2">Smart Onboarding</p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1e4832]">Let's Personalise Your Scans</h1>
        </div>

        <Stepper currentStep={currentStep} />

        <div className="w-full max-w-2xl bg-white rounded p-8 sm:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mx-auto flex-1 flex flex-col relative z-10 min-h-[600px]">
          {currentStep > 0 && (
             <button 
                onClick={handleBack} 
                className="absolute top-4 left-6 text-xs font-mono text-[#8ba797] hover:text-[#1e4832] transition-colors"
             >
                ← Back
             </button>
          )}

          <div className="flex-1 mt-4 min-h-[420px] w-full relative overflow-hidden flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                <CurrentComponent data={data} updateData={updateData} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center">
             <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`w-full max-w-sm py-3.5 rounded-[2px] font-mono font-medium text-sm md:text-base transition-all ${
                  isStepValid()
                    ? 'bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] text-white hover:shadow-lg shadow-md'
                    : 'bg-[#e0e8e3] text-[#a4b5aa] border border-transparent cursor-not-allowed opacity-70'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue To Your Goals'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}