import React, { useState } from 'react';
import { X, Save, ShieldAlert, Heart, Utensils, Ruler, Weight as WeightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Options from Onboarding
const ALLERGIES = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Lactose', 'Gluten'];
const MEDICAL = ['Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Celiac Disease', 'IBS', 'GERD', 'PCOS'];
const DIET = ['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Low Carb'];
const ACTIVITY_LEVELS = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'];
const GOALS = ['lose_weight_fast', 'lose_weight_gradual', 'maintain_weight', 'gain_muscle'];

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
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3825] font-sans"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#1e4832] mb-1">Goal</label>
                <select 
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3825] font-sans"
                >
                  {GOALS.map(g => <option key={g} value={g}>{snakeToTitle(g)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#1e4832] mb-1">Activity Level</label>
              <select 
                value={formData.activity_level}
                onChange={(e) => setFormData({...formData, activity_level: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-[#c5d1c9] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3825] font-sans"
              >
                {ACTIVITY_LEVELS.map(a => <option key={a} value={a}>{snakeToTitle(a)}</option>)}
              </select>
            </div>
          </section>

          {/* Dietary Info */}
          <section className="space-y-6 pt-4 border-t border-[#e8efe9]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#8ba797]">Dietary Profile</h3>
            
            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#1e4832] mb-2"><ShieldAlert size={14}/> Allergies</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map(item => (
                  <MultiSelectPill key={item} label={item} selected={formData.allergies.includes(item)} onClick={() => toggleArrayItem('allergies', item)} />
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#1e4832] mb-2"><Heart size={14}/> Medical Conditions</label>
              <div className="flex flex-wrap gap-2">
                {MEDICAL.map(item => (
                  <MultiSelectPill key={item} label={item} selected={formData.medical_conditions.includes(item)} onClick={() => toggleArrayItem('medical_conditions', item)} />
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-[#1e4832] mb-2"><Utensils size={14}/> Dietary Preferences</label>
              <div className="flex flex-wrap gap-2">
                {DIET.map(item => (
                  <MultiSelectPill key={item} label={item} selected={formData.dietary_preferences.includes(item)} onClick={() => toggleArrayItem('dietary_preferences', item)} />
                ))}
              </div>
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
