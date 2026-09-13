import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Search, Loader2, Utensils, Beaker, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<{ type: 'meal' | 'ingredient', id: string, title: string, subtitle?: string, status?: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Query food_scans
        const { data: meals } = await supabase
          .from('food_scans')
          .select('id, meal_title, total_calories, created_at')
          .eq('user_id', user?.id || '')
          .ilike('meal_title', `%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(3);

        // Query user_ingredients (safely)
        let ingredients: any[] = [];
        try {
          const { data: ingData } = await supabase
            .from('user_ingredients')
            .select('id, ingredient_name, category, status')
            .eq('user_id', user?.id || '')
            .ilike('ingredient_name', `%${searchQuery}%`)
            .limit(3);
          if (ingData) ingredients = ingData;
        } catch(e) {}

        const combined = [
          ...(meals || []).map((m: any) => ({ type: 'meal' as const, id: m.id, title: m.meal_title, subtitle: `${m.total_calories || 0} kcal` })),
          ...ingredients.map((i: any) => ({ type: 'ingredient' as const, id: i.id, title: i.ingredient_name, subtitle: i.category, status: i.status }))
        ];
        
        setResults(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, user]);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white sticky top-0 z-40 border-b border-[#e8efe9]">
      <div className="md:hidden text-[22px] font-black text-[#1e4832] tracking-tight flex items-center gap-2">
        <img src="/logo.png?v=2" alt="Truebite Logo" className="w-11 h-11 object-contain" />
        Truebite
      </div>
      
      {/* Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-lg relative items-center ml-2" ref={searchRef}>
        <Search className="absolute left-3 w-4 h-4 text-[#8ba797] stroke-[2]" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search food, ingredient or additive code"
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#e0e8e3] rounded-[2px] text-xs text-[#1e4832] placeholder:text-[#a4b5aa] focus:outline-none focus:border-[#5c8b71] font-mono shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors"
        />
        
        <AnimatePresence>
          {showDropdown && searchQuery.trim().length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[110%] left-0 right-0 bg-white border border-[#e0e8e3] shadow-lg rounded-[8px] overflow-hidden z-50 flex flex-col"
            >
              {isSearching ? (
                <div className="p-6 flex flex-col items-center justify-center text-[#8ba797]">
                  <Loader2 className="w-5 h-5 animate-spin mb-2" />
                  <span className="font-mono text-xs">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col py-2 max-h-[300px] overflow-y-auto">
                  {results.map((r, i) => (
                    <div 
                      key={`${r.type}-${r.id}-${i}`}
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery('');
                        if (r.type === 'meal') navigate(`/app/scan/${r.id}`);
                        else navigate(`/app/ingredients`);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f0f5f2] cursor-pointer transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${r.type === 'meal' ? 'bg-[#e8efe9] text-[#1e4832]' : 'bg-[#fef2f2] text-[#991b1b]'}`}>
                        {r.type === 'meal' ? <Utensils size={14} /> : <Beaker size={14} />}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-serif text-[14px] text-[#1e4832] truncate leading-tight">{r.title}</span>
                        <span className="font-mono text-[10px] text-[#8ba797] uppercase tracking-wide truncate">
                          {r.type === 'meal' ? `Meal • ${r.subtitle}` : `Ingredient • ${r.subtitle || 'Unknown'}`}
                        </span>
                      </div>
                      {r.status && r.type === 'ingredient' && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${r.status === 'Safe' ? 'bg-[#bbf7d0] text-[#166534]' : 'bg-[#fecaca] text-[#991b1b]'}`}>
                          {r.status}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="h-px bg-[#e0e8e3] my-1 mx-4" />
                  <div 
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                      navigate('/app/history', { state: { openAddModal: true }});
                    }}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-[#f0f5f2] cursor-pointer transition-colors text-[#1e4832] group"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle size={14} className="text-[#8ba797] group-hover:text-[#1e4832] transition-colors" />
                      <span className="font-mono text-[11px] font-medium">Log "{searchQuery}" manually</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <span className="font-serif text-[#1e4832] mb-1">No results found</span>
                  <span className="font-mono text-[11px] text-[#8ba797]">Try a different keyword</span>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                      navigate('/app/history', { state: { openAddModal: true }});
                    }}
                    className="mt-4 px-4 py-1.5 flex items-center gap-1.5 bg-[#f0f5f2] border border-[#e0e8e3] rounded-full text-[#1e4832] font-mono text-[10px] hover:bg-[#e8efe9] transition-colors"
                  >
                    <PlusCircle size={12} />
                    Log Manually
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="w-8 h-8 flex items-center justify-center rounded-[2px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] text-white shadow-sm border border-[#c0d4c8] hover:shadow-md transition-all">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-[2px] bg-[#e8efe9] flex items-center justify-center overflow-hidden border border-[#c5d1c9] shadow-sm">
          {avatarUrl && !imgError ? (
            <img 
              src={avatarUrl} 
              alt="User" 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <User className="w-4 h-4 text-[#6b8274]" />
          )}
        </div>
      </div>
    </header>
  );
}