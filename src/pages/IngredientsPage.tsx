import React from 'react';
import { MagnifyingGlass, CaretLeft, CaretRight, SpinnerGap, Sparkle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import IngredientCard from '@/components/ingredients/IngredientCard';
import { useIngredients } from '@/hooks/useIngredients';
import { getEmojiForIcon } from '@/lib/emoji-map';

type FilterType = 'All' | 'Safe' | 'Flagged' | 'Allergen';

export default function IngredientsPage() {
  const {
    ingredients,
    loading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalCount,
    totalPages,
    isGenerating,
    generateSeedIngredients,
  } = useIngredients();

  const [selectedIngredient, setSelectedIngredient] = React.useState<any | null>(null);

  const filters: FilterType[] = ['All', 'Safe', 'Flagged', 'Allergen'];

  // Detail View Render
  if (selectedIngredient) {
    let badgeStyle = '';
    let BadgeIcon: any = null;
    
    switch (selectedIngredient.status) {
      case 'Safe':
        badgeStyle = 'bg-[#bbf7d0] text-[#166534] border-[#86efac]';
        break;
      case 'Flagged':
        badgeStyle = 'bg-[#fef3c7] text-[#92400e] border-[#fcd34d]';
        break;
      case 'Allergen':
        badgeStyle = 'bg-[#fecaca] text-[#991b1b] border-[#fca5a5]';
        break;
    }

    return (
      <div className="w-full h-full py-2">
        <button 
          onClick={() => setSelectedIngredient(null)}
          className="mb-6 px-4 py-2 bg-white border border-[#cfdfd5] rounded-[4px] text-sm font-mono text-[#5a7a68] hover:bg-[#f0f5f2] hover:text-[#1e4832] transition-colors flex items-center gap-2"
        >
          <CaretLeft size={16} /> Back to Ingredients Dictionary
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[4px] border border-[#e8efe9] p-6 md:p-8 mb-8 shadow-sm"
        >
          <div className="mb-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[11px] font-mono font-bold tracking-wider ${badgeStyle}`}>
              {selectedIngredient.status === 'Allergen' ? 'Allergen Alert' : selectedIngredient.status}
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif text-[#1e4832] mb-4">
            {selectedIngredient.ingredient_name}
          </h2>
          
          <p className="text-sm md:text-base text-[#5a7a68] font-mono leading-relaxed mb-6">
            {selectedIngredient.description || 'No description available.'}
          </p>

          {selectedIngredient.reason && (
            <div className="mb-6 p-4 bg-[#fafcfb] border border-[#e8efe9] rounded-[4px]">
              <p className="text-[12px] md:text-[13px] text-[#5a7a68] font-mono leading-relaxed">
                <span className="font-bold text-[#1e4832]">Note: </span>{selectedIngredient.reason}
              </p>
            </div>
          )}

          <hr className="border-[#e8efe9] my-6" />

          <div>
            <p className="text-[11px] font-mono text-[#8ba797] mb-3 uppercase tracking-wider">Commonly Found In:</p>
            <ul className="flex flex-wrap items-center gap-3">
              {(selectedIngredient.commonly_found_in || []).map((item: any, index: number) => (
                <li key={index} className="flex items-center gap-2 text-[12px] text-[#1e4832] font-mono bg-[#f0f5f2] px-3 py-1.5 rounded-[4px]">
                  <span className="text-base">{getEmojiForIcon(item.icon)}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <h3 className="text-2xl font-serif text-[#1e4832] mb-4">Related Ingredients & Alternatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {ingredients
            .filter(i => i.status === 'Safe' && i.id !== selectedIngredient.id)
            .slice(0, 2)
            .map((alt) => (
            <IngredientCard
              key={alt.id}
              name={alt.ingredient_name}
              category={alt.category || 'Unknown'}
              status={alt.status as any}
              commonlyFoundIn={alt.commonly_found_in || []}
              onClick={() => setSelectedIngredient(alt)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full py-2">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e8efe9] p-6 md:p-8 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#1e4832] mb-2 tracking-tight">
              Smart Ingredient Dictionary
            </h1>
            <p className="text-[#5a7a68] font-mono text-sm md:text-base">
              Understand what's really inside your food.
            </p>
          </div>

          {totalCount > 0 && (
            <button
              onClick={generateSeedIngredients}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-[4px] border border-[#cfdfd5] bg-white text-[#1e4832] font-mono text-[13px] font-medium flex items-center gap-2 hover:bg-[#f0f5f2] transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin text-[#6b9279]" /> Generating...</>
              ) : (
                <><Sparkle size={16} className="text-[#1a3825]" weight="fill" /> Regenerate from Profile</>
              )}
            </button>
          )}
        </div>

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
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#cfdfd5] rounded-[4px] text-sm md:text-base text-[#1e4832] placeholder:text-[#8ba797] focus:outline-none focus:ring-2 focus:ring-[#6b9279]/20 focus:border-[#6b9279] transition-all font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative w-[110px] py-2 rounded-[4px] text-sm font-mono font-medium transition-colors ${
                  isActive
                    ? 'text-white border border-transparent'
                    : 'bg-white text-[#5a7a68] border border-[#cfdfd5] hover:bg-[#f0f5f2] hover:text-[#1e4832]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-filter-bg"
                    className="absolute inset-0 bg-gradient-to-b from-[#6b9279] to-[#1a3825] rounded-[4px] shadow-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#6b8274]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-[4px] border border-[#e8efe9] mb-8">
          <p className="text-red-600 font-mono">{error}</p>
        </div>
      ) : ingredients.length === 0 && totalCount === 0 && filter === 'All' && !searchQuery ? (
        /* Empty state — no ingredients yet */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[4px] border border-[#e8efe9] p-10 md:p-16 flex flex-col items-center justify-center text-center mb-8"
        >
          <div className="w-16 h-16 rounded-[4px] bg-[#f0f5f2] flex items-center justify-center mb-6">
            <Sparkle size={32} className="text-[#6b8274]" weight="fill" />
          </div>
          <h2 className="font-serif text-2xl text-[#1e4832] mb-3">Your dictionary is empty</h2>
          <p className="text-[#6b8274] font-mono text-sm max-w-md mb-8 leading-relaxed">
            Generate a personalized ingredient dictionary based on your health profile. Our AI will identify ingredients you should watch out for based on your allergies, conditions, and dietary preferences.
          </p>
          <button
            onClick={generateSeedIngredients}
            disabled={isGenerating}
            className="px-8 py-4 rounded-[4px] bg-gradient-to-b from-[#88ba9d] to-[#173d26] border border-[#1a3825] text-white font-mono font-medium text-[13px] flex items-center gap-3 shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.3),_0_4px_12px_rgba(22,51,35,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating with AI...</>
            ) : (
              <><Sparkle size={18} weight="fill" /> Generate My Ingredients</>
            )}
          </button>
        </motion.div>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[4px] border border-[#e8efe9] mb-8">
          <p className="text-[#5a7a68] font-mono">No ingredients found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {ingredients.map((ingredient) => (
              <IngredientCard
                key={ingredient.id}
                name={ingredient.ingredient_name}
                category={ingredient.category || 'Unknown'}
                status={ingredient.status as any}
                commonlyFoundIn={ingredient.commonly_found_in || []}
                onClick={() => setSelectedIngredient(ingredient)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e8efe9] p-6 flex flex-col items-center justify-center">
              <div className="flex items-center gap-6 mb-3">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-[#cfdfd5] rounded-[4px] text-[#1e4832] hover:bg-[#f0f5f2] transition-colors disabled:text-[#cfdfd5] disabled:cursor-not-allowed"
                >
                  <CaretLeft size={20} />
                </button>

                <div className="flex items-baseline gap-4 font-serif text-2xl">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <span
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`cursor-pointer transition-colors ${
                          pageNum === page ? 'text-[#1e4832]' : 'text-[#a3b8aa] hover:text-[#1e4832]'
                        }`}
                      >
                        {pageNum}
                      </span>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-[#cfdfd5] rounded-[4px] text-[#1e4832] hover:bg-[#f0f5f2] transition-colors disabled:text-[#cfdfd5] disabled:cursor-not-allowed"
                >
                  <CaretRight size={20} />
                </button>
              </div>
              <p className="text-xs font-mono text-[#8ba797]">
                Showing {(page - 1) * 8 + 1}-{Math.min(page * 8, totalCount)} of {totalCount} ingredients
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
