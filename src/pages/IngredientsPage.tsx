import React, { useState } from 'react';
import { MagnifyingGlass, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import IngredientCard, { IngredientCardProps } from '@/components/ingredients/IngredientCard';

const MOCK_INGREDIENTS: IngredientCardProps[] = [
  {
    name: 'E407 — Carrageenan',
    category: 'Thickener & Stabilizer',
    status: 'Flagged',
    commonlyFoundIn: [
      { icon: '🥛', label: 'Plant milks' },
      { icon: '🍦', label: 'Ice cream' },
      { icon: '🥩', label: 'Processed Meats' },
    ],
  },
  {
    name: 'Ascorbic Acid',
    category: 'Antioxidant',
    status: 'Safe',
    commonlyFoundIn: [
      { icon: '🍊', label: 'Citrus fruits' },
      { icon: '🧃', label: 'Fortified juices' },
      { icon: '🥫', label: 'Processed foods' },
    ],
  },
  {
    name: 'Soy Lecithin',
    category: 'Emulsifier',
    status: 'Allergen',
    commonlyFoundIn: [
      { icon: '🍫', label: 'Chocolates' },
      { icon: '🍞', label: 'Baked goods' },
      { icon: '🌻', label: 'Margarine & spreads' },
    ],
  },
  {
    name: 'High Fructose Corn Syrup',
    category: 'Artificial Sweetener',
    status: 'Flagged',
    commonlyFoundIn: [
      { icon: '🥤', label: 'Sodas & soft drinks' },
      { icon: '🍬', label: 'Candies & sweets' },
      { icon: '🥫', label: 'Ketchup' },
    ],
  },
];

type FilterType = 'All' | 'Safe' | 'Flagged' | 'Allergen';

export default function IngredientsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters: FilterType[] = ['All', 'Safe', 'Flagged', 'Allergen'];

  // Filter the mock data
  const filteredIngredients = MOCK_INGREDIENTS.filter((ingredient) => {
    const matchesFilter = activeFilter === 'All' || ingredient.status === activeFilter;
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ingredient.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full h-full py-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e8efe9] p-6 md:p-8 mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-serif text-[#1e4832] mb-2 tracking-tight">
          Smart Ingredient Dictionary
        </h1>
        <p className="text-[#5a7a68] font-mono text-sm md:text-base mb-6">
          Understand what's really inside your food.
        </p>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8ba797]">
            <MagnifyingGlass size={20} />
          </div>
          <input
            type="text"
            placeholder="Search ingredients (e.g., E407, Maltodextrin...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#cfdfd5] rounded text-sm md:text-base text-[#1e4832] placeholder:text-[#8ba797] focus:outline-none focus:ring-2 focus:ring-[#6b9279]/20 focus:border-[#6b9279] transition-all font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative w-[110px] py-2 rounded text-sm font-mono font-medium transition-colors ${
                  isActive
                    ? 'text-white border border-transparent'
                    : 'bg-white text-[#5a7a68] border border-[#cfdfd5] hover:bg-[#f0f5f2] hover:text-[#1e4832]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-filter-bg"
                    className="absolute inset-0 bg-gradient-to-b from-[#6b9279] to-[#1a3825] rounded shadow-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{filter}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Grid Layout */}
      {filteredIngredients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredIngredients.map((ingredient, idx) => (
            <IngredientCard key={idx} {...ingredient} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded border border-[#e8efe9] mb-8">
          <p className="text-[#5a7a68] font-mono">No ingredients found matching your criteria.</p>
        </div>
      )}

      {/* Pagination Component */}
      <div className="bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e8efe9] p-6 flex flex-col items-center justify-center">
        <div className="flex items-center gap-6 mb-3">
          <button className="w-10 h-10 flex items-center justify-center border border-[#cfdfd5] rounded text-[#cfdfd5] hover:bg-[#f0f5f2] transition-colors" disabled>
            <CaretLeft size={20} />
          </button>
          
          <div className="flex items-baseline gap-5 font-serif text-3xl md:text-4xl">
            <span className="text-[#1e4832]">1</span>
            <span className="text-[#a3b8aa] cursor-pointer hover:text-[#1e4832] transition-colors">2</span>
            <span className="text-[#a3b8aa] cursor-pointer hover:text-[#1e4832] transition-colors">3</span>
            <span className="text-[#a3b8aa] text-2xl md:text-3xl">...</span>
            <span className="text-[#a3b8aa] cursor-pointer hover:text-[#1e4832] transition-colors">8</span>
          </div>

          <button className="w-10 h-10 flex items-center justify-center border border-[#cfdfd5] rounded text-[#1e4832] hover:bg-[#f0f5f2] transition-colors">
            <CaretRight size={20} />
          </button>
        </div>
        <p className="text-xs font-mono text-[#8ba797]">
          Showing 1-4 of 128 ingredients
        </p>
      </div>
    </div>
  );
}
