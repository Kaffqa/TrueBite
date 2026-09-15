import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  ShieldCheck, 
  BookHeart, 
  Target, 
  ChevronDown, 
  Bug, 
  BookOpen, 
  Mail 
} from 'lucide-react';

const FAQS = [
  {
    question: "How does the AI Scanner analyze my food?",
    answer: "TrueBite uses an advanced Vision AI model. When you snap a photo, it identifies the ingredients, estimates portion sizes, and calculates macros (Protein, Carbs, Fats) and total calories."
  },
  {
    question: "Why did my daily calorie goal change?",
    answer: "Your TDEE (Total Daily Energy Expenditure) is dynamically calculated based on your weight, height, and activity level. If you update these metrics in Settings, your daily calorie goal will automatically adjust."
  },
  {
    question: "How accurate is the allergen detection?",
    answer: "The AI acts as a smart assistant by comparing detected ingredients against your Dietary Profile. However, it's an estimation based on visual data. Always double-check packaging labels if you have severe allergies!"
  },
  {
    question: "Can I log meals manually without scanning?",
    answer: "Yes! You can go to the Daily Log (History) page and click the '+' button on any meal time to manually enter calories and macros."
  }
];

const GLOSSARY = [
  { term: "BMR", def: "Basal Metabolic Rate: The amount of energy (calories) your body needs while resting." },
  { term: "TDEE", def: "Total Daily Energy Expenditure: How many calories you burn per day including exercise." },
  { term: "Macros", def: "Macronutrients: The three main providers of energy (Protein, Carbohydrates, and Fats)." }
];

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-7xl mx-auto p-4 md:p-8 pb-32"
    >
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#1e4832] mb-2">Help Center</h1>
        <p className="font-mono text-sm text-[#5a7a68]">Everything you need to master TrueBite.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Top Left: Quick Start */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 shadow-sm h-full">
            <h2 className="font-serif text-xl text-[#1e4832] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5c8b71]" /> Quick Start Guide
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#f4f7f5] rounded-[4px] border border-[#e0e8e3]">
                <Camera className="w-6 h-6 text-[#1e4832] mb-3" />
                <h3 className="font-mono font-bold text-[#1e4832] text-sm mb-1">1. Snap a Photo</h3>
                <p className="font-mono text-xs text-[#5a7a68]">Use the Vision Scanner before eating to analyze your meal instantly.</p>
              </div>
              <div className="p-4 bg-[#f4f7f5] rounded-[4px] border border-[#e0e8e3]">
                <ShieldCheck className="w-6 h-6 text-[#1e4832] mb-3" />
                <h3 className="font-mono font-bold text-[#1e4832] text-sm mb-1">2. Check Safety</h3>
                <p className="font-mono text-xs text-[#5a7a68]">Review the red/yellow badges if the AI detects allergens you should avoid.</p>
              </div>
              <div className="p-4 bg-[#f4f7f5] rounded-[4px] border border-[#e0e8e3]">
                <BookHeart className="w-6 h-6 text-[#1e4832] mb-3" />
                <h3 className="font-mono font-bold text-[#1e4832] text-sm mb-1">3. Log to Journal</h3>
                <p className="font-mono text-xs text-[#5a7a68]">Save the scanned meal to your Daily Log to track your caloric intake.</p>
              </div>
              <div className="p-4 bg-[#f4f7f5] rounded-[4px] border border-[#e0e8e3]">
                <Target className="w-6 h-6 text-[#1e4832] mb-3" />
                <h3 className="font-mono font-bold text-[#1e4832] text-sm mb-1">4. Hit Targets</h3>
                <p className="font-mono text-xs text-[#5a7a68]">Keep your daily streak alive and stay under your TDEE limit!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right: Glossary */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 shadow-sm flex-1">
            <h2 className="font-serif text-lg text-[#1e4832] mb-4">Nutrition Glossary</h2>
            <div className="space-y-4">
              {GLOSSARY.map((item, idx) => (
                <div key={idx}>
                  <div className="font-mono font-bold text-[13px] text-[#1e4832] mb-1">{item.term}</div>
                  <div className="font-mono text-xs text-[#6b8274]">{item.def}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom Left: FAQs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-[4px] border border-[#e8efe9] p-6 shadow-sm flex-1">
            <h2 className="font-serif text-xl text-[#1e4832] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-[#e0e8e3] rounded-[4px] overflow-hidden">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#f9faf9] transition-colors text-left"
                  >
                    <span className="font-mono font-bold text-[13px] text-[#1e4832]">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8ba797] transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 text-[#5a7a68] font-mono text-xs leading-relaxed bg-[#f9faf9]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Right: Still need help & Tips */}
        <div className="flex flex-col gap-6">
          {/* Pro Tips */}
          <div className="bg-[#f0f5f2] rounded-[4px] border border-[#cfdfd5] p-6 shadow-sm">
            <h2 className="font-serif text-lg text-[#1e4832] mb-3 flex items-center gap-2">
              💡 Did you know?
            </h2>
            <p className="font-mono text-xs text-[#5a7a68] leading-relaxed">
              You can tap on any flagged ingredient in your scan results to instantly open its detailed profile in the Smart Dictionary!
            </p>
          </div>

          <div className="bg-[#1a3825] rounded-[4px] p-6 text-white shadow-md flex-1 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
            
            <div className="relative z-10 mb-5">
              <h2 className="font-serif text-xl mb-2 text-[#e8efe9]">Still need help?</h2>
              <p className="font-mono text-xs text-[#a4b5aa] leading-relaxed">
                Found a bug or have a suggestion to improve the AI scanner? We'd love to hear from you.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
              <button 
                onClick={() => alert("Thanks for your feedback! This feature will be available soon.")}
                className="flex items-center justify-center gap-2 bg-white text-[#1a3825] font-mono text-xs py-3 px-6 rounded-[4px] hover:bg-[#f0f5f2] transition-colors shadow-sm"
              >
                <Bug size={16} /> Report a Bug
              </button>
              <a 
                href="mailto:support@truebite.app"
                className="flex items-center justify-center gap-2 border border-[#5c8b71] bg-transparent text-white font-mono text-xs py-3 px-6 rounded-[4px] hover:bg-white/10 transition-colors"
              >
                <Mail size={16} /> Email Support
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center font-mono text-[10px] text-[#8ba797] pt-2">
        TrueBite App Version 1.0.0
      </div>

    </motion.div>
  );
}
