import React, { useState, useRef, useEffect } from 'react';
import { Clock } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomTimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [hour, min] = value.split(':');
  const [selectedHour, setSelectedHour] = useState(hour || '12');
  const [selectedMin, setSelectedMin] = useState(min || '00');

  useEffect(() => {
    const [h, m] = value.split(':');
    if (h && m) {
      setSelectedHour(h);
      setSelectedMin(m);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHourClick = (h: string) => {
    setSelectedHour(h);
    onChange(`${h}:${selectedMin}`);
  };

  const handleMinClick = (m: string) => {
    setSelectedMin(m);
    onChange(`${selectedHour}:${m}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  // To make scrolling easier, we can show steps of 1 for minutes, or steps of 5 if preferred, 
  // but standard time pickers allow any minute.
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Refs for scrolling to active elements
  const hourContainerRef = useRef<HTMLDivElement>(null);
  const minContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow render
      setTimeout(() => {
        if (hourContainerRef.current) {
          const activeHour = hourContainerRef.current.querySelector('.active-hour') as HTMLElement;
          if (activeHour) {
            hourContainerRef.current.scrollTop = activeHour.offsetTop - hourContainerRef.current.clientHeight / 2 + activeHour.clientHeight / 2;
          }
        }
        if (minContainerRef.current) {
          const activeMin = minContainerRef.current.querySelector('.active-min') as HTMLElement;
          if (activeMin) {
            minContainerRef.current.scrollTop = activeMin.offsetTop - minContainerRef.current.clientHeight / 2 + activeMin.clientHeight / 2;
          }
        }
      }, 50);
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button 
        type="button"
        className="flex items-center justify-between w-full p-3 border border-[#c5d1c9] bg-[#f4f7f5] text-[#1e4832] font-mono text-[14px] rounded-[4px] focus:outline-none focus:border-[#1e4832] hover:bg-[#eef2f0] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <Clock size={16} className="text-[#6b8274]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 md:left-0 z-50 bg-white border border-[#c5d1c9] rounded-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-2 flex gap-1 w-[160px] h-[240px]"
          >
            {/* Hours column */}
            <div 
              ref={hourContainerRef}
              className="flex-1 overflow-y-auto pb-4 pr-1 scrollbar-hide"
              style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <div className="font-mono text-[10px] text-[#8ba797] font-bold text-center mb-1 sticky top-0 bg-white py-1.5 z-10">HR</div>
              {hours.map(h => {
                const isActive = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourClick(h)}
                    className={`w-full py-2 mb-1 rounded-[4px] font-mono text-[13px] transition-colors ${isActive ? 'active-hour' : ''} ${
                      isActive 
                        ? 'bg-[#1a3825] text-white shadow-sm' 
                        : 'text-[#1e4832] hover:bg-[#f0f5f2]'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            <div className="w-[1px] bg-[#e8efe9] my-2" />

            {/* Minutes column */}
            <div 
              ref={minContainerRef}
              className="flex-1 overflow-y-auto pb-4 pl-1 scrollbar-hide"
              style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <div className="font-mono text-[10px] text-[#8ba797] font-bold text-center mb-1 sticky top-0 bg-white py-1.5 z-10">MIN</div>
              {minutes.map(m => {
                const isActive = selectedMin === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinClick(m)}
                    className={`w-full py-2 mb-1 rounded-[4px] font-mono text-[13px] transition-colors ${isActive ? 'active-min' : ''} ${
                      isActive 
                        ? 'bg-[#1a3825] text-white shadow-sm' 
                        : 'text-[#1e4832] hover:bg-[#f0f5f2]'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </div>
  );
}
