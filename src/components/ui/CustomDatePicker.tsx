import React, { useState, useRef, useEffect } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { CalendarDots, CaretDown, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomDatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  dateLabel?: string;
}

export function CustomDatePicker({ selectedDate, onChange, dateLabel = '' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePreviousMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    onChange(day);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-auto" ref={containerRef}>
      <button 
        className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-white border border-[#c5d1c9] rounded-[4px] shadow-sm hover:shadow-md transition-shadow w-full md:w-auto justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarDots size={18} className="text-[#1a3825]" weight="bold" />
        <span className="font-mono text-[12px] text-[#1e4832] tracking-wide whitespace-nowrap">
          {dateLabel}{format(selectedDate, 'MMMM dd, yyyy')}
        </span>
        <CaretDown size={14} className="text-[#6b8274]" weight="bold" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 md:right-auto md:left-0 z-50 bg-white border border-[#c5d1c9] rounded-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 w-[280px]"
          >
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePreviousMonth}
                className="p-1 hover:bg-[#f0f5f2] rounded-[4px] text-[#5a7a68] transition-colors"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <h4 className="font-serif text-[15px] text-[#1e4832]">
                {format(currentMonth, 'MMMM yyyy')}
              </h4>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-[#f0f5f2] rounded-[4px] text-[#5a7a68] transition-colors"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center font-mono text-[10px] text-[#8ba797] font-bold">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-8 flex items-center justify-center rounded-[4px] font-mono text-[11px] transition-all
                      ${isSelected ? 'bg-[#1a3825] text-white shadow-md' : 'hover:bg-[#f0f5f2]'}
                      ${!isCurrentMonth && !isSelected ? 'text-[#c5d1c9]' : ''}
                      ${isCurrentMonth && !isSelected ? 'text-[#1e4832]' : ''}
                      ${isTodayDate && !isSelected ? 'border border-[#8ba797] text-[#1e4832]' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#e8efe9] flex justify-between">
              <button 
                onClick={() => {
                  onChange(new Date());
                  setIsOpen(false);
                }}
                className="text-[11px] font-mono text-[#5a8069] hover:text-[#1a3825] transition-colors px-2 py-1 -ml-2 rounded-[4px] hover:bg-[#f0f5f2]"
              >
                Today
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-mono text-[#8ba797] hover:text-[#1a3825] transition-colors px-2 py-1 -mr-2 rounded-[4px] hover:bg-[#f0f5f2]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
