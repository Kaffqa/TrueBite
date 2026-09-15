import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { LogOut, User, Ruler, Weight as WeightIcon, Calendar, Activity, Target as TargetIcon, Zap, Flame, ShieldAlert, Heart, Utensils, Edit3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInYears, parseISO } from 'date-fns';
import EditSettingsModal from '@/components/settings/EditSettingsModal';

function snakeToTitle(str: string) {
  if (!str) return 'Not set';
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleSaveProfile = async (data: any) => {
    await updateProfile(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 pb-24 bg-[#f7f9f8] min-h-screen"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-[#1e4832]">Settings</h1>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#c0d4c8] rounded-[4px] text-white font-mono text-[11px] hover:brightness-110 transition-all shadow-md active:scale-95"
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      {/* Bento Grid Layout - Flattened for proportional spanning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Row 1 Left: Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-[4px] border border-[#e8efe9] p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#88ba9d]/10 to-transparent pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-[#f0f5f2] border-4 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0 relative z-10 mb-4 transition-transform group-hover:scale-105">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-[#8ba797]" />
            )}
          </div>
          <h2 className="font-serif text-2xl text-[#1e4832] leading-tight mb-1 relative z-10">{profile.full_name || 'Anonymous'}</h2>
          <p className="font-mono text-[11px] text-[#8ba797] relative z-10 break-all">{profile.email}</p>
        </div>

        {/* Row 1 Right: Body Metrics */}
        <div className="lg:col-span-2 bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm">
          <h3 className="font-serif text-[#1e4832] text-xl mb-6">Body Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
            <MetricItem icon={<Ruler size={16} />} label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : 'Not set'} />
            <MetricItem icon={<WeightIcon size={16} />} label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : 'Not set'} />
            <MetricItem icon={<Calendar size={16} />} label="Age" value={age !== null ? `${age} yrs` : 'Not set'} />
            <MetricItem icon={<User size={16} />} label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'} />
            <MetricItem icon={<Activity size={16} />} label="Activity" value={snakeToTitle(profile.activity_level)} />
            <MetricItem icon={<TargetIcon size={16} />} label="Goal" value={snakeToTitle(profile.goal)} />
          </div>
        </div>

        {/* Row 2 Left: Dietary Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-[4px] border border-[#e8efe9] p-6 shadow-sm flex flex-col space-y-6">
          <h3 className="font-serif text-[#1e4832] text-xl">Dietary Profile</h3>
          
          <div className="space-y-5 flex-1">
            <div>
              <h4 className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <ShieldAlert size={12} /> Allergies & Intolerances
              </h4>
              <TagList tags={profile.allergies} />
            </div>

            <div>
              <h4 className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Heart size={12} /> Medical Conditions
              </h4>
              <TagList tags={profile.medical_conditions} />
            </div>

            <div>
              <h4 className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Utensils size={12} /> Dietary Preferences
              </h4>
              <TagList tags={profile.dietary_preferences} />
            </div>
          </div>
        </div>

        {/* Row 2 Right: Nutrition Targets */}
        <div className="lg:col-span-2 bg-white rounded-[4px] border border-[#e8efe9] p-6 lg:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side of Nutrition: Energy */}
          <div className="space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="font-serif text-[#1e4832] text-xl">Energy Targets</h3>
                <p className="font-mono text-[10px] text-[#8ba797]">Calculated automatically</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#f0f5f2] p-4 rounded-[4px] flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mb-1 flex items-center gap-1"><Zap size={10} /> BMR</span>
                  <span className="font-serif text-xl text-[#1e4832] leading-none">{profile.calculated_bmr || '-'} <span className="text-[10px] font-mono text-[#8ba797]">kcal</span></span>
                </div>
                <div className="bg-[#f0f5f2] p-4 rounded-[4px] flex flex-col justify-center">
                  <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mb-1 flex items-center gap-1"><Flame size={10} /> TDEE</span>
                  <span className="font-serif text-xl text-[#1e4832] leading-none">{profile.calculated_tdee || '-'} <span className="text-[10px] font-mono text-[#8ba797]">kcal</span></span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-end mb-2">
                <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider">Daily Calorie Target</span>
                <span className="font-serif text-2xl text-[#1e4832] leading-none">{profile.target_calories || '-'}</span>
              </div>
              <div className="h-2 w-full bg-[#1a3825] rounded-[4px] overflow-hidden shadow-inner" />
            </div>
          </div>

          {/* Right side of Nutrition: Macros */}
          <div className="space-y-4 md:border-l md:border-[#e8efe9] md:pl-8 flex flex-col justify-between">
            <div>
              <h4 className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wider mb-1">Macronutrients Split</h4>
              <MacroBar label="Protein" value={profile.target_protein_g} percentage={30} color="bg-[#5c8b71]" />
              <MacroBar label="Carbs" value={profile.target_carbs_g} percentage={40} color="bg-[#8ba797]" />
              <MacroBar label="Fat" value={profile.target_fat_g} percentage={30} color="bg-[#a4b5aa]" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-[#e8efe9]">
              <div className="text-center">
                <span className="block font-mono text-[9px] text-[#8ba797] uppercase">Fiber</span>
                <span className="font-mono text-[11px] font-bold text-[#1e4832]">{profile.target_fiber_g || '-'}g</span>
              </div>
              <div className="text-center border-l border-r border-[#e8efe9]">
                <span className="block font-mono text-[9px] text-[#8ba797] uppercase">Sugar Max</span>
                <span className="font-mono text-[11px] font-bold text-[#1e4832]">{profile.target_sugar_g || '-'}g</span>
              </div>
              <div className="text-center">
                <span className="block font-mono text-[9px] text-[#8ba797] uppercase">Sodium Max</span>
                <span className="font-mono text-[11px] font-bold text-[#1e4832]">{profile.target_sodium_mg || '-'}mg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 Full Width: Account Management */}
        <div className="lg:col-span-3 bg-[#fef2f2] rounded-[4px] border border-[#fecaca] p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 mt-2">
          <div className="flex-1">
            <h3 className="font-serif text-[#991b1b] text-xl mb-1">Account Management</h3>
            <p className="font-mono text-[10px] text-[#991b1b]/70 leading-relaxed max-w-sm">
              Signed in as <strong>{profile.email}</strong>. Deleting your account will permanently remove all data.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[4px] bg-white border border-[#fecaca] text-[#991b1b] font-mono text-[11px] hover:bg-[#fee2e2] transition-colors shadow-sm"
            >
              <LogOut size={14} />
              Sign Out
            </button>
            <button
              onClick={() => alert('Account deletion would happen here.')}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[4px] bg-[#991b1b] text-white font-mono text-[11px] hover:bg-[#7f1d1d] transition-colors shadow-sm"
            >
              <Trash2 size={14} />
              Delete Data
            </button>
          </div>
        </div>

      </div>

      <EditSettingsModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        profile={profile}
        onSave={handleSaveProfile}
      />

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

function MacroBar({ label, value, percentage, color }: { label: string, value: number | null, percentage: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-[11px] text-[#1e4832]">{label}</span>
        <div className="text-right">
          <span className="font-serif text-[13px] text-[#1e4832] leading-none">{value || 0}g </span>
          <span className="font-mono text-[9px] text-[#8ba797] ml-0.5">({percentage}%)</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-[#e8efe9] rounded-[4px] overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] | null | undefined }) {
  if (!tags || tags.length === 0) {
    return <p className="font-mono text-[10px] text-[#a4b5aa] italic bg-[#f0f5f2] px-3 py-1.5 rounded-[4px] inline-block border border-[#e8efe9]">None specified</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span key={i} className="px-2.5 py-1 rounded-[4px] bg-[#f0f5f2] text-[#1e4832] font-mono text-[10px] border border-[#e8efe9]">
          {tag}
        </span>
      ))}
    </div>
  );
}
