import React from 'react';
import { Warning, CheckCircle, WarningCircle, ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export type IngredientStatus = 'Safe' | 'Flagged' | 'Allergen';

export interface CommonlyFoundInItem {
  icon: string;
  label: string;
}

export interface IngredientCardProps {
  name: string;
  category: string;
  status: IngredientStatus;
  commonlyFoundIn: CommonlyFoundInItem[];
}

export default function IngredientCard({
  name,
  category,
  status,
  commonlyFoundIn,
}: IngredientCardProps) {
  // Determine styles and icons based on status
  let badgeStyle = '';
  let BadgeIcon = null;

  switch (status) {
    case 'Safe':
      badgeStyle = 'bg-[#e6f4ea] text-[#1e4832]';
      BadgeIcon = CheckCircle;
      break;
    case 'Flagged':
      badgeStyle = 'bg-[#fff4e5] text-[#b86b11]';
      BadgeIcon = Warning;
      break;
    case 'Allergen':
      badgeStyle = 'bg-[#feecec] text-[#d32f2f]';
      BadgeIcon = WarningCircle;
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e8efe9] p-6 flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide ${badgeStyle}`}
        >
          {BadgeIcon && <BadgeIcon size={14} weight="fill" />}
          {status === 'Allergen' ? 'Allergen Alert' : status}
        </div>
      </div>

      <div className="mb-4 flex-grow">
        <p className="text-sm text-[#5a7a68] font-mono mb-1">{category}</p>
        <h3 className="text-xl md:text-2xl font-serif text-[#1e4832] leading-tight">
          {name}
        </h3>
      </div>

      <hr className="border-[#e8efe9] my-4" />

      <div className="mb-6">
        <p className="text-sm font-mono text-[#5a7a68] mb-3">Commonly Found In:</p>
        <ul className="flex flex-wrap items-center gap-y-2">
          {commonlyFoundIn.map((item, index) => (
            <React.Fragment key={index}>
              <li className="flex items-center gap-2 text-sm text-[#1e4832] font-mono">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </li>
              {index < commonlyFoundIn.length - 1 && (
                <div className="w-[1px] h-4 bg-[#cfdfd5] mx-3"></div>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>

      <button className="w-full mt-auto py-3 px-4 rounded border border-[#e8efe9] text-[#1e4832] font-mono text-sm font-medium hover:bg-[#f7f9f8] hover:border-[#cfdfd5] transition-colors flex items-center justify-center gap-2">
        View Details <ArrowRight size={16} weight="bold" />
      </button>
    </motion.div>
  );
}
