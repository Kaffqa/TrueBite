import React from 'react';
import { Warning, ShieldCheck, ShieldWarning, ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getEmojiForIcon } from '@/lib/emoji-map';

export type IngredientStatus = 'Safe' | 'Flagged' | 'Allergen';

export interface CommonlyFoundInItem {
  icon: string;
  label: string;
}

export interface IngredientCardProps {
  name: string;
  category: string;
  status: IngredientStatus;
  reason?: string;
  description?: string;
  commonlyFoundIn: CommonlyFoundInItem[];
  timesEncountered?: number;
  source?: 'onboarding' | 'scan' | 'manual';
  onClick?: () => void;
}

export default function IngredientCard({
  name,
  category,
  status,
  reason,
  description,
  commonlyFoundIn,
  timesEncountered,
  source,
  onClick,
}: IngredientCardProps) {
  let badgeStyle = '';
  let BadgeIcon: any = null;

  switch (status) {
    case 'Safe':
      badgeStyle = 'bg-[#bbf7d0] text-[#166534] border-[#86efac]';
      BadgeIcon = ShieldCheck;
      break;
    case 'Flagged':
      badgeStyle = 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]';
      BadgeIcon = Warning;
      break;
    case 'Allergen':
      badgeStyle = 'bg-[#fecaca] text-[#991b1b] border-[#fca5a5]';
      BadgeIcon = ShieldWarning;
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-[4px] border border-[#e8efe9] p-6 flex flex-col h-full hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300"
    >
      <div className="mb-4">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[10px] font-mono font-bold tracking-wider ${badgeStyle}`}
        >
          {BadgeIcon && <BadgeIcon size={14} weight="fill" />}
          {status === 'Allergen' ? 'Allergen Alert' : status}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-[12px] text-[#5a7a68] font-mono mb-1">{category}</p>
        <h3 className="text-2xl font-serif text-[#1e4832] leading-tight">{name}</h3>
      </div>

      <hr className="border-[#e8efe9] my-4" />

      <div className="mb-6 flex-grow">
        <p className="text-[11px] font-mono text-[#5a7a68] mb-2">Commonly Found In:</p>
        <ul className="flex flex-wrap items-center gap-y-2">
          {commonlyFoundIn.slice(0, 3).map((item, index) => (
            <React.Fragment key={index}>
              <li className="flex items-center gap-1.5 text-[11px] text-[#5a7a68] font-mono">
                <span className="text-sm">{getEmojiForIcon(item.icon)}</span>
                {item.label}
              </li>
              {index < Math.min(commonlyFoundIn.length, 3) - 1 && (
                <div className="w-[1px] h-3 bg-[#cfdfd5] mx-2"></div>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>

      <button
        onClick={onClick}
        className="w-full py-3 px-4 border border-[#cfdfd5] rounded-[4px] text-sm font-mono text-[#1e4832] font-medium flex items-center justify-center gap-2 hover:bg-[#f0f5f2] transition-colors"
      >
        View Details <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}
