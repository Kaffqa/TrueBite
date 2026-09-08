import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { User, Ruler, Weight as WeightIcon, Calendar, Activity, Target, Utensils, ShieldAlert, Heart, LogOut, Flame, Zap } from 'lucide-react';
import { differenceInYears, parseISO } from 'date-fns';

const snakeToTitle = (str: string | null) => {
  if (!str) return 'Not set';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e4832]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-[#8ba797] font-mono">
        Profile not found
      </div>
    );
  }

  const age = profile.birth_date ? differenceInYears(new Date(), parseISO(profile.birth_date)) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6 bg-[#f7f9f8] min-h-screen"
    >
      <h1 className="font-serif text-3xl text-[#1e4832] mb-8">Settings</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-[24px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#f0f5f2] border border-[#e8efe9] flex items-center justify-center overflow-hidden shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-[#8ba797]" />
          )}
        </div>
        <div>
          <h2 className="font-serif text-xl text-[#1e4832]">{profile.full_name || 'Anonymous User'}</h2>
          <p className="font-mono text-[12px] text-[#8ba797]">{profile.email}</p>
        </div>
      </div>

      {/* Body Metrics Card */}
      <div className="bg-white rounded-[24px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm space-y-6">
        <h3 className="font-serif text-[#1e4832] text-xl border-b border-[#e8efe9] pb-4">Body Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <MetricItem icon={<Ruler size={16} />} label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : 'Not set'} />
          <MetricItem icon={<WeightIcon size={16} />} label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : 'Not set'} />
          <MetricItem icon={<Calendar size={16} />} label="Age" value={age !== null ? `${age} yrs` : 'Not set'} />
          <MetricItem icon={<User size={16} />} label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'} />
          <MetricItem icon={<Activity size={16} />} label="Activity" value={snakeToTitle(profile.activity_level)} />
          <MetricItem icon={<Target size={16} />} label="Goal" value={snakeToTitle(profile.goal)} />
        </div>
      </div>

      {/* Nutrition Targets Card */}
      <div className="bg-white rounded-[24px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm space-y-6">
        <h3 className="font-serif text-[#1e4832] text-xl border-b border-[#e8efe9] pb-4">Daily Targets</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#f7f9f8] p-4 rounded-[16px] border border-[#e8efe9] flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mb-1 flex items-center gap-1"><Zap size={12} /> BMR</span>
            <span className="font-serif text-2xl text-[#1e4832]">{profile.calculated_bmr || '-'} <span className="text-sm">kcal</span></span>
          </div>
          <div className="bg-[#f7f9f8] p-4 rounded-[16px] border border-[#e8efe9] flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mb-1 flex items-center gap-1"><Flame size={12} /> TDEE</span>
            <span className="font-serif text-2xl text-[#1e4832]">{profile.calculated_tdee || '-'} <span className="text-sm">kcal</span></span>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-[12px] text-[#8ba797] uppercase tracking-wider">Target Calories</span>
            <span className="font-serif text-2xl text-[#1e4832]">{profile.target_calories || '-'} <span className="text-sm">kcal</span></span>
          </div>
          <div className="h-2 w-full bg-[#e8efe9] rounded-full overflow-hidden">
            <div className="h-full bg-[#1a3825] w-full"></div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#e8efe9]">
          <h4 className="font-mono text-[11px] text-[#8ba797] uppercase tracking-wider mb-3">Macronutrients</h4>
          <MacroBar label="Protein" value={profile.target_protein_g} />
          <MacroBar label="Carbs" value={profile.target_carbs_g} />
          <MacroBar label="Fat" value={profile.target_fat_g} />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#e8efe9]">
          <div className="text-center">
            <span className="block font-mono text-[10px] text-[#8ba797] uppercase">Fiber</span>
            <span className="font-serif text-[#1e4832]">{profile.target_fiber_g || '-'}g</span>
          </div>
          <div className="text-center border-l border-r border-[#e8efe9]">
            <span className="block font-mono text-[10px] text-[#8ba797] uppercase">Sugar</span>
            <span className="font-serif text-[#1e4832]">{profile.target_sugar_g || '-'}g</span>
          </div>
          <div className="text-center">
            <span className="block font-mono text-[10px] text-[#8ba797] uppercase">Sodium</span>
            <span className="font-serif text-[#1e4832]">{profile.target_sodium_mg || '-'}mg</span>
          </div>
        </div>
      </div>

      {/* Dietary Profile Card */}
      <div className="bg-white rounded-[24px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm space-y-6">
        <h3 className="font-serif text-[#1e4832] text-xl border-b border-[#e8efe9] pb-4">Dietary Profile</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-mono text-[11px] text-[#8ba797] uppercase tracking-wider flex items-center gap-2 mb-3">
              <ShieldAlert size={14} /> Allergies & Intolerances
            </h4>
            <TagList tags={[...(profile.allergies || []), ...(profile.intolerances || [])]} />
          </div>

          <div>
            <h4 className="font-mono text-[11px] text-[#8ba797] uppercase tracking-wider flex items-center gap-2 mb-3">
              <Heart size={14} /> Medical Conditions
            </h4>
            <TagList tags={profile.medical_conditions} />
          </div>

          <div>
            <h4 className="font-mono text-[11px] text-[#8ba797] uppercase tracking-wider flex items-center gap-2 mb-3">
              <Utensils size={14} /> Dietary Preferences
            </h4>
            <TagList tags={profile.dietary_preferences} />
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[24px] p-6 flex flex-col items-center gap-4">
        <p className="font-mono text-[12px] text-[#991b1b] text-center">
          You are currently signed in as<br/>
          <strong>{profile.email}</strong>
        </p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#fecaca] text-[#991b1b] font-mono text-[13px] hover:bg-[#fee2e2] transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

    </motion.div>
  );
}

// Subcomponents
function MetricItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#8ba797] uppercase tracking-wider">
        <span className="text-[#a4b5aa]">{icon}</span>
        {label}
      </span>
      <span className="font-serif text-[17px] text-[#1e4832]">{value}</span>
    </div>
  );
}

function MacroBar({ label, value }: { label: string, value: number | null }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-[12px] text-[#1e4832]">{label}</span>
        <span className="font-mono text-[12px] text-[#6b8274]">{value || 0}g</span>
      </div>
      <div className="h-1.5 w-full bg-[#e8efe9] rounded-full overflow-hidden">
        <div className="h-full bg-[#1a3825]" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] | null | undefined }) {
  if (!tags || tags.length === 0) {
    return <p className="font-mono text-[12px] text-[#a4b5aa] italic">None specified</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span key={i} className="px-3 py-1.5 rounded-full bg-[#f0f5f2] text-[#1e4832] font-mono text-[11px] border border-[#e8efe9]">
          {tag}
        </span>
      ))}
    </div>
  );
}