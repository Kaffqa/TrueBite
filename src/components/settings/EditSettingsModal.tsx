import React, { useState, useRef, useEffect } from 'react';
import { X, Save, ShieldAlert, Heart, Utensils, Ruler, Weight as WeightIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Options from Onboarding
const ALLERGIES = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Lactose', 'Gluten'];
const MEDICAL = ['Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Celiac Disease', 'IBS', 'GERD', 'PCOS'];
const DIET = ['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Low Carb'];
const ACTIVITY_LEVELS = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'];
const GOALS = ['lose_weight_fast', 'lose_weight_gradual', 'maintain_weight', 'gain_muscle'];

function CustomSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: {label: string, value: string}[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#1a3825] font-sans"
      >
        <span className="truncate text-[#1e4832]">{selectedLabel}</span>
        <ChevronDown size={14} className={`text-[#8ba797] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-[#c5d1c9] rounded-[4px] shadow-lg max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f5f2] hover:text-[#1a3825] transition-colors ${value === option.value ? 'bg-[#e8efe9] text-[#1a3825] font-medium' : 'text-[#333]'}`}
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MultiSelectPill({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-[4px] font-mono text-[11px] border transition-all ${
        selected ? 'bg-[#1a3825] border-[#1a3825] text-white' : 'bg-white border-[#e0e8e3] text-[#6b8274] hover:border-[#1a3825]'
      }`}
    >
      {label}
    </button>
  );
}

function snakeToTitle(str: string) {
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function EditSettingsModal({ isOpen, onClose, profile, onSave }: any) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    height_cm: profile.height_cm || '',
    weight_kg: profile.weight_kg || '',
    gender: profile.gender || 'female',
    activity_level: profile.activity_level || 'sedentary',
    goal: profile.goal || 'maintain_weight',
    allergies: profile.allergies || [],
    medical_conditions: profile.medical_conditions || [],
    dietary_preferences: profile.dietary_preferences || []
  });

  const [isSaving, setIsSaving] = useState(false);

  const [customAllergy, setCustomAllergy] = useState('');
  const [customMedical, setCustomMedical] = useState('');
  const [customDiet, setCustomDiet] = useState('');

  const toggleArrayItem = (key: string, item: string) => {
    setFormData((prev: any) => {
      const current = prev[key] || [];
      const updated = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Remove empty strings and format numbers
    const payload = {
      ...formData,
      height_cm: formData.height_cm ? Number(formData.height_cm) : null,
      weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
    };
    
    await onSave(payload);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e8efe9]">
          <h2 className="font-serif text-2xl text-[#1e4832]">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f0f5f2] rounded-[4px] text-[#8ba797] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#8ba797]">Personal Info</h3>
            <div>
              <label className="block text-xs font-mono text-[#1e4832] mb-1">Full Name</label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3825] font-sans"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#1e4832] mb-1">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-2.5 w-4 h-4 text-[#8ba797]" />
                  <input 
                    type="number" 
                    value={formData.height_cm}
                    onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3825] font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#1e4832] mb-1">Weight (kg)</label>
                <div className="relative">
                  <WeightIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#8ba797]" />
                  <input 
                    type="number" 
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3825] font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#1e4832] mb-1">Gender</label>
                <CustomSelect 
                  value={formData.gender || 'male'}
                  onChange={(val) => setFormData({...formData, gender: val})}
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#1e4832] mb-1">Goal</label>
                <CustomSelect 
                  value={formData.goal || 'maintain_weight'}
                  onChange={(val) => setFormData({...formData, goal: val})}
                  options={GOALS.map(g => ({ label: snakeToTitle(g), value: g }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#1e4832] mb-1">Activity Level</label>
                <CustomSelect 
                  value={formData.activity_level || 'sedentary'}
                  onChange={(val) => setFormData({...formData, activity_level: val})}
                  options={ACTIVITY_LEVELS.map(a => ({ label: snakeToTitle(a), value: a }))}
                />
            </div>
          </section>

          {/* Dietary Info */}
          <section className="space-y-6 pt-4 border-t border-[#e8efe9]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#8ba797]">Dietary Profile</h3>
            
            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#1e4832] mb-2"><ShieldAlert size={14}/> Allergies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from(new Set([...ALLERGIES, ...formData.allergies])).map(item => (
                  <MultiSelectPill key={item as string} label={item as string} selected={formData.allergies.includes(item)} onClick={() => toggleArrayItem('allergies', item as string)} />
                ))}
              </div>
              <input 
                type="text" 
                placeholder="+ Add custom allergy (Enter)"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customAllergy.trim()) {
                    e.preventDefault();
                    if (!formData.allergies.includes(customAllergy.trim())) {
                      toggleArrayItem('allergies', customAllergy.trim());
                    }
                    setCustomAllergy('');
                  }
                }}
                className="w-full bg-transparent border-b border-[#c0d4c8] focus:border-[#1e4832] py-2 font-mono text-[11px] text-[#1e4832] placeholder:text-[#a4b5aa] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#1e4832] mb-2"><Heart size={14}/> Medical Conditions</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from(new Set([...MEDICAL, ...formData.medical_conditions])).map(item => (
                  <MultiSelectPill key={item as string} label={item as string} selected={formData.medical_conditions.includes(item)} onClick={() => toggleArrayItem('medical_conditions', item as string)} />
                ))}
              </div>
              <input 
                type="text" 
                placeholder="+ Add custom medical condition (Enter)"
                value={customMedical}
                onChange={(e) => setCustomMedical(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customMedical.trim()) {
                    e.preventDefault();
                    if (!formData.medical_conditions.includes(customMedical.trim())) {
                      toggleArrayItem('medical_conditions', customMedical.trim());
                    }
                    setCustomMedical('');
                  }
                }}
                className="w-full bg-transparent border-b border-[#c0d4c8] focus:border-[#1e4832] py-2 font-mono text-[11px] text-[#1e4832] placeholder:text-[#a4b5aa] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#1e4832] mb-2"><Utensils size={14}/> Dietary Preferences</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from(new Set([...DIET, ...formData.dietary_preferences])).map(item => (
                  <MultiSelectPill key={item as string} label={item as string} selected={formData.dietary_preferences.includes(item)} onClick={() => toggleArrayItem('dietary_preferences', item as string)} />
                ))}
              </div>
              <input 
                type="text" 
                placeholder="+ Add custom diet (Enter)"
                value={customDiet}
                onChange={(e) => setCustomDiet(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customDiet.trim()) {
                    e.preventDefault();
                    if (!formData.dietary_preferences.includes(customDiet.trim())) {
                      toggleArrayItem('dietary_preferences', customDiet.trim());
                    }
                    setCustomDiet('');
                  }
                }}
                className="w-full bg-transparent border-b border-[#c0d4c8] focus:border-[#1e4832] py-2 font-mono text-[11px] text-[#1e4832] placeholder:text-[#a4b5aa] focus:outline-none transition-colors"
              />
            </div>

          </section>
        </div>

        <div className="p-6 border-t border-[#e8efe9] bg-[#f7f9f8]">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] rounded-[4px] text-white font-mono text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
