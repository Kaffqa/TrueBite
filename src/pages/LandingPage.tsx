import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Leaf, ShieldCheck, Activity, ScanLine, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import AuthModal from '@/components/auth/AuthModal';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'problem', 'how-it-works', 'features', 'who-its-for'];
      const scrollPos = window.scrollY + 200; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Loading state with Landing Page Skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F4EB] md:bg-white p-2 md:p-4">
        <header className="w-full px-5 md:px-6 lg:px-12 py-3 md:py-4 flex justify-between items-center bg-white rounded-[32px] md:rounded-t-[32px] shadow-sm border border-[#e8efe9] md:border-transparent">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-[#d5e0d8]" />
            <Skeleton className="w-24 h-6 md:h-8 bg-[#d5e0d8]" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="w-20 h-4 bg-[#d5e0d8]" />)}
            </div>
            <Skeleton className="w-32 h-10 rounded-full bg-[#d5e0d8]" />
          </div>
        </header>

        <main className="flex-1 bg-[#F6F4EB] w-full flex flex-col pt-12 pb-16 px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 w-full">
            <div className="lg:w-[50%]">
              <Skeleton className="w-24 h-4 mb-6 bg-[#d5e0d8]" />
              <Skeleton className="w-full h-16 md:h-24 bg-[#d5e0d8] mb-4" />
              <Skeleton className="w-3/4 h-16 md:h-24 bg-[#d5e0d8]" />
            </div>
            
            <div className="lg:w-[50%] flex flex-col items-start lg:items-end pt-2 lg:pt-[72px] w-full">
              <Skeleton className="w-full md:w-64 h-20 mb-10 bg-[#d5e0d8]" />
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Skeleton className="w-full md:w-48 h-12 rounded-full bg-[#d5e0d8]" />
                <Skeleton className="w-full md:w-40 h-12 rounded-full bg-[#d5e0d8]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If already logged in, redirect to the app dashboard
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div id="home" className="min-h-screen flex flex-col font-sans selection:bg-[#163323] selection:text-white bg-[#F6F4EB] md:bg-white p-2 md:p-4">
      {/* Navbar */}
      <header className={`w-full px-5 md:px-6 lg:px-12 py-3 md:py-4 flex justify-between items-center sticky top-2 md:top-4 z-[60] transition-all duration-300 ${
        isMobileMenuOpen 
          ? 'bg-white rounded-[8px] border border-[#e8efe9]' 
          : scrolled 
            ? 'bg-white/95 backdrop-blur rounded-[8px] shadow-md border border-[#e8efe9]' 
            : 'bg-white rounded-t-[32px] shadow-sm border border-[#e8efe9] md:border-transparent'
      }`}>
          <div className="flex items-center gap-3 relative z-[60]">
            {/* Logo Icon */}
            <img src="/logo.png?v=2" alt="Truebite Logo" className="w-8 h-8 md:w-11 md:h-11 object-contain" />
            <span className="font-sans text-[20px] md:text-[22px] font-black tracking-tight text-[#163323]">Truebite</span>
          </div>
          
          <button 
            className="flex md:hidden items-center justify-center p-2 -mr-2 relative z-[60] text-[#163323] transition-transform active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {[
                { id: 'home', label: 'Home' },
                { id: 'problem', label: 'The Problem' },
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'features', label: 'Features' },
                { id: 'who-its-for', label: "Who It's For" }
              ].map(link => (
                <a 
                  key={link.id}
                  href={`#${link.id}`} 
                  className={`text-[13px] font-mono transition-colors ${activeSection === link.id ? 'font-bold text-[#163323]' : 'font-medium text-gray-500 hover:text-[#163323]'}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <button onClick={() => setIsAuthModalOpen(true)} className="bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-7 py-[11px] rounded-full text-[12px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide">
              Get Started
            </button>
          </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] bg-white/95 backdrop-blur-md pt-[100px] px-6 flex flex-col md:hidden overflow-y-auto pb-10"
          >
            <nav className="flex flex-col mt-4">
              {[
                { id: 'home', label: 'Home' },
                { id: 'problem', label: 'The Problem' },
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'features', label: 'Features' },
                { id: 'who-its-for', label: "Who It's For" }
              ].map((link, idx) => (
                <motion.a 
                  key={link.id}
                  href={`#${link.id}`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  className={`text-[28px] font-serif py-4 border-b border-[#163323]/10 transition-colors ${activeSection === link.id ? 'font-bold text-[#163323]' : 'text-[#163323]/60 hover:text-[#163323]'}`}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 w-full"
            >
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }} 
                className="w-full bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white py-[15px] rounded-full text-[14px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide"
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section (Desktop) */}
      <main className="hidden md:flex flex-1 bg-[#F6F4EB] w-full relative z-10 flex-col pt-12 pb-16">
        
        {/* Top part of Hero (Padded) */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-10 px-6 lg:px-12 w-full">
          <div className="lg:w-[50%]">
            <div className="text-gray-400 font-mono text-sm mb-6">
              01 - Truebite
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[85px] font-serif text-[#163323] leading-[1.05] tracking-tight">
              The Honest Truth in <br />
              Every <span className="italic font-light">Single</span> Bite
            </h1>
          </div>
          
          <div className="lg:w-[50%] flex flex-col items-start lg:items-end text-left lg:text-right pt-2 lg:pt-[72px]">
            <p className="text-[14px] md:text-[15px] font-mono text-gray-700 max-w-[420px] mb-10 leading-relaxed text-right">
              Point your camera at any food. Uncover<br className="hidden lg:block"/>
              hidden ingredients, detect allergens,<br className="hidden lg:block"/>
              and track macros automatically.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-4 w-full">
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[13px] rounded-full text-[13px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide">
                Start Scanning for Free
              </button>
              <a href="#how-it-works" className="border-[1.5px] border-[#9fb3a5] text-[#163323] bg-transparent hover:bg-white/40 px-8 py-[13px] rounded-full text-[13px] font-mono font-medium transition-colors">
                See How It Works
              </a>
            </div>
          </div>
        </div>

        {/* Bottom part of Hero (Image bleeds left, Stats padded right) */}
        <div className="flex flex-col lg:flex-row justify-between items-end w-full">
          {/* Image Bleeding to the Left */}
          <div className="lg:w-[53%] w-full h-[320px] md:h-[380px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="People preparing healthy food" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Stats on the Right */}
          <div className="lg:w-[47%] w-full flex justify-between items-end pb-4 px-6 lg:px-12 mt-12 lg:mt-0">
             <div className="flex flex-col">
                <h3 className="text-4xl md:text-[52px] font-serif text-[#163323] mb-4 leading-none">10K<span className="text-3xl md:text-4xl">+</span></h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323] leading-snug whitespace-nowrap">Meals scanned daily</p>
             </div>
             <div className="flex flex-col">
                <h3 className="text-4xl md:text-[52px] font-serif text-[#163323] mb-4 leading-none">98%</h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323] leading-snug whitespace-nowrap">Allergen detection accuracy</p>
             </div>
             <div className="flex flex-col">
                <h3 className="text-4xl md:text-[52px] font-serif text-[#163323] mb-4 leading-none">3s</h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323] leading-snug whitespace-nowrap">Average scan time</p>
             </div>
          </div>
        </div>
      </main>

      {/* Hero Section (Mobile) */}
      <main className="flex md:hidden flex-1 bg-[#F6F4EB] w-full relative z-10 flex-col pt-8 pb-10">
        <div className="px-6 flex flex-col gap-5">
           {/* Heading */}
           <div>
             <div className="text-[#a4b5aa] font-mono text-[11px] mb-4">
               01 - Truebite
             </div>
             <h1 className="text-[44px] font-serif text-[#163323] leading-[1.02] tracking-tight">
               The Honest Truth in <br />
               Every <span className="italic font-light">Single Bite</span>
             </h1>
           </div>
           
           {/* Subheading */}
           <p className="text-[12px] font-mono text-[#163323]/80 leading-relaxed">
             Point your camera at any food. Uncover hidden ingredients, detect allergens, and track macros automatically.
           </p>
        </div>

        {/* Image (full width bleeding) */}
        <div className="w-full h-[240px] overflow-hidden my-8">
          <img 
            src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="People preparing healthy food" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Stats */}
        <div className="px-6 flex items-start justify-between gap-2 mb-10 w-full">
           <div className="flex flex-col">
              <h3 className="text-[28px] font-serif text-[#163323] mb-2 leading-none">10K<span className="text-xl">+</span></h3>
              <p className="text-[9px] font-mono text-[#163323]/80 leading-relaxed">Meals scanned<br/>daily</p>
           </div>
           <div className="flex flex-col">
              <h3 className="text-[28px] font-serif text-[#163323] mb-2 leading-none">3s</h3>
              <p className="text-[9px] font-mono text-[#163323]/80 leading-relaxed">Average scan<br/>time</p>
           </div>
           <div className="flex flex-col">
              <h3 className="text-[28px] font-serif text-[#163323] mb-2 leading-none">98%</h3>
              <p className="text-[9px] font-mono text-[#163323]/80 leading-relaxed">Allergen detection<br/>accuracy</p>
           </div>
        </div>

        {/* Buttons */}
        <div className="px-6 flex items-center justify-between gap-2.5 w-full">
           <button onClick={() => setIsAuthModalOpen(true)} className="w-[55%] bg-gradient-to-b from-[#5c8263] to-[#2a4e35] text-white py-[13px] px-2 rounded-full text-[10px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide whitespace-nowrap">
             Start Scanning for Free
           </button>
           <a href="#how-it-works" className="w-[45%] border-[1.5px] border-[#9fb3a5] text-[#163323] bg-transparent py-[13px] px-2 rounded-full text-[10px] font-mono font-medium flex items-center justify-center transition-colors whitespace-nowrap">
             See How It Works
           </a>
        </div>
      </main>

      {/* Problem Section (Desktop) */}
      <section id="problem" className="hidden md:flex w-full bg-white relative z-10 flex-col pt-20 pb-20">
        
        {/* Top text part */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16 px-6 lg:px-12 w-full">
          <div className="lg:w-[50%]">
            <div className="text-gray-400 font-mono text-sm mb-6">
              02 - The Problem
            </div>
            <h2 className="text-5xl md:text-[68px] font-serif text-[#163323] leading-[1.05] tracking-tight">
              Tired Of Decoding <br />
              Complex Food Labels?
            </h2>
          </div>
          
          <div className="lg:w-[50%] flex flex-col items-start lg:items-end text-left lg:text-right pt-2 lg:pt-[72px]">
            <p className="text-[14px] md:text-[15px] font-mono text-[#163323] max-w-[500px] leading-relaxed text-right">
              Decoding complex chemical names shouldn't stand<br className="hidden lg:block"/>
              between you and safe food. Stop guessing and<br className="hidden lg:block"/>
              start eating with total confidence.
            </p>
          </div>
        </div>

        {/* Bottom part (List & Image) */}
        <div className="flex flex-col lg:flex-row justify-between items-end w-full">
          {/* List on the Left */}
          <div className="lg:w-[47%] w-full px-6 lg:px-12 mb-12 lg:mb-0">
             <ul className="flex flex-col gap-4 md:gap-6">
               {[
                 'Unreadable E-number codes', 
                 'Guesswork on portion calories', 
                 'Allergens buried in fine print', 
                 'Diet rules that change per product'
               ].map((item, idx) => (
                 <li key={idx} className="flex items-center gap-5">
                   <div className="w-[14px] h-[14px] rounded-full bg-[#f3cf98] shrink-0"></div>
                   <span className="text-[26px] md:text-[34px] font-serif text-[#163323] tracking-tight">{item}</span>
                 </li>
               ))}
             </ul>
          </div>
          
          {/* Image Bleeding to the Right */}
          <div className="lg:w-[53%] w-full h-[320px] md:h-[380px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Person looking at supermarket shelves" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Problem Section (Mobile) */}
      <section id="problem-mobile" className="flex md:hidden w-full bg-white relative z-10 flex-col pt-12 pb-16">
        
        {/* Texts */}
        <div className="px-6 flex flex-col gap-4">
           <div>
             <div className="text-[#a4b5aa] font-mono text-[11px] mb-4 uppercase tracking-widest">
               02 - The Problem
             </div>
             <h2 className="text-[44px] font-serif text-[#163323] leading-[1.02] tracking-tight pr-4">
               Tired of decoding<br/>complex food labels?
             </h2>
           </div>
           
           <p className="text-[12px] font-mono text-[#163323]/90 leading-relaxed mt-2 text-left pr-4">
             Decoding complex chemical names shouldn't stand between you and safe food. Stop guessing and start eating with total confidence.
           </p>
        </div>

        {/* Image */}
        <div className="px-6 w-full h-[220px] my-10">
          <img 
            src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Person checking food labels" 
            className="w-full h-full object-cover rounded-[4px]"
          />
        </div>

        {/* List */}
        <div className="px-6 w-full">
           <ul className="flex flex-col gap-6">
             {[
               'Unreadable E-number codes', 
               'Guesswork on portion calories', 
               'Allergens buried in fine print', 
               'Diet rules that change per product'
             ].map((item, idx) => (
               <li key={idx} className="flex items-center gap-4">
                 <div className="w-[8px] h-[8px] rounded-full bg-[#f3cf98] shrink-0 mt-1"></div>
                 <span className="text-[20px] font-serif text-[#163323] leading-tight tracking-tight">{item}</span>
               </li>
             ))}
           </ul>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full bg-[#163323] relative z-10 flex flex-col pt-16 pb-20">
        
        {/* Top text part */}
        <div className="flex flex-col mb-16 px-6 lg:px-12 w-full">
          <div className="text-[#F6F4EB]/60 font-mono text-[11px] mb-4 uppercase tracking-widest">
            03 - How It Works
          </div>
          <h2 className="text-[44px] md:text-[68px] font-serif text-[#F6F4EB] leading-[1.02] tracking-tight max-w-[900px]">
            3 Steps To Total Food<br className="md:hidden"/> Transparency
          </h2>
        </div>

        {/* Steps List */}
        <div className="flex flex-col px-6 lg:px-12 w-full gap-12 md:gap-14">
          {[
            {
              num: '01',
              title: 'Snap or Upload.',
              desc: 'Take a quick photo of an ingredient list or your entire plate.'
            },
            {
              num: '02',
              title: 'AI Analysis.',
              desc: 'Truebite instantly cross-references ingredients against your unique dietary profile.'
            },
            {
              num: '03',
              title: 'Track & Eat Safely.',
              desc: 'Get a green light to eat, log your nutritional intake, and track your daily goals automatically.'
            }
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 md:gap-8 w-full overflow-hidden">
              {/* Big Italic Number */}
              <div className="text-[96px] md:text-[100px] font-serif italic text-[#F6F4EB] leading-[0.7] shrink-0 w-[110px] md:w-[110px] pt-1">
                {step.num}
              </div>
              
              {/* Title & Desc with underline */}
              <div className="flex flex-col w-full max-w-full">
                <div className="w-full border-b border-[#F6F4EB]/40 pb-3 mb-3">
                  <h3 className="text-[24px] md:text-[36px] font-serif text-[#F6F4EB] leading-none tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[11px] md:text-[13.5px] font-mono text-[#F6F4EB]/70 leading-relaxed pr-2">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-white relative z-10 flex flex-col pt-16 md:pt-20 pb-16 md:pb-20">
        
        {/* Top text part & Button */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6 md:gap-12 mb-10 md:mb-16 px-6 lg:px-12 w-full text-center lg:text-left">
          <div className="lg:w-[50%] flex flex-col items-center lg:items-start">
            <div className="text-gray-400 font-mono text-[11px] md:text-sm mb-4 md:mb-6 uppercase tracking-widest md:normal-case md:tracking-normal">
              04 - Features
            </div>
            <h2 className="text-[44px] md:text-[68px] font-serif text-[#163323] leading-[1.02] md:leading-[1.05] tracking-tight">
              Total Clarity, <br />
              Zero Guesswork
            </h2>
          </div>
          
          <div className="lg:w-[50%] w-full flex justify-center lg:justify-end pb-0 md:pb-3 mt-2 md:mt-0">
            {/* Desktop Button */}
            <button onClick={() => setIsAuthModalOpen(true)} className="hidden md:flex bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[13px] rounded-full text-[13px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all items-center justify-center font-medium tracking-wide">
              See All Features
            </button>
            {/* Mobile Button */}
            <button onClick={() => setIsAuthModalOpen(true)} className="flex md:hidden w-[95%] bg-gradient-to-b from-[#5c8263] to-[#2a4e35] text-white py-[15px] rounded-full text-[14px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all items-center justify-center font-medium tracking-wide">
              Start Scanning for Free
            </button>
          </div>
        </div>

        {/* Features Grid (Desktop) / Horizontal Scroll (Mobile) */}
        <div className="px-0 md:px-6 lg:px-12 w-full overflow-hidden">
          <div className="flex md:grid overflow-x-auto md:overflow-visible md:grid-cols-2 gap-4 md:gap-6 w-full snap-x snap-mandatory px-6 md:px-0 pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              {
                title: 'AI Vision Scanner',
                desc: 'Your pocket food detective. Instantly identify hidden hazards and nutritional values through your camera.'
              },
              {
                title: 'Smart Ingredient Dictionary',
                desc: 'Confused by chemical names? Search our AI-powered database to understand exactly what those additives do to your body.'
              },
              {
                title: 'Personalized Dietary Profile',
                desc: 'Set your allergies, lifestyle choices (Vegan, Keto, Halal), and daily calorie targets. Truebite adapts to you.'
              },
              {
                title: 'Seamless Daily Tracking',
                desc: 'Every scanned meal is automatically logged into your food journal, complete with visual progress charts.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#F6F4EB] shrink-0 w-[85vw] md:w-auto snap-center px-8 py-10 md:px-10 md:py-10 flex flex-col gap-10 md:gap-16">
                <h3 className="text-[32px] md:text-[34px] font-serif text-[#163323] leading-[1.1] tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[12px] md:text-[13.5px] font-mono text-[#163323]/80 leading-relaxed tracking-wide mt-auto">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section id="who-its-for" className="w-full bg-[#F6F4EB] relative z-10 flex flex-col pt-20 pb-20 items-center">
        
        {/* Top text part (Centered) */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-16 px-6 lg:px-12 w-full">
          <div className="text-gray-400 font-mono text-[11px] md:text-sm mb-4 md:mb-6 uppercase tracking-widest md:normal-case md:tracking-normal">
            05 - Who It's For
          </div>
          <h2 className="text-[28px] min-[400px]:text-[32px] md:text-[68px] font-serif text-[#163323] leading-[1.05] tracking-tight whitespace-nowrap md:whitespace-normal">
            Built For Every Dietary Need
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="px-6 lg:px-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Card 1: Text Top, Image Bottom */}
            <div className="bg-white p-6 md:p-8 flex flex-col gap-6 aspect-auto min-h-[450px] md:aspect-square">
              <div className="flex flex-col">
                <h3 className="text-[28px] md:text-[34px] font-serif text-[#163323] mb-4">Strict Vegans</h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323]/80 leading-relaxed tracking-wide">
                  Filter out animal-derived additives, E-numbers, and hidden dairy traces in seconds.
                </p>
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Vegan food bowl" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Card 2: Image Top, Text Bottom */}
            <div className="bg-white p-6 md:p-8 flex flex-col gap-6 aspect-auto min-h-[450px] md:aspect-square">
              <div className="flex-1 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Smartphone scanning" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[28px] md:text-[34px] font-serif text-[#163323] mb-4">Severe Allergies</h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323]/80 leading-relaxed tracking-wide">
                  Instant warning system for hidden cross-contaminants and obscure chemical codes.
                </p>
              </div>
            </div>

            {/* Card 3: Text Top, Image Bottom */}
            <div className="bg-white p-6 md:p-8 flex flex-col gap-6 aspect-auto min-h-[450px] md:aspect-square">
              <div className="flex flex-col">
                <h3 className="text-[28px] md:text-[34px] font-serif text-[#163323] mb-4">Halal Diets</h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323]/80 leading-relaxed tracking-wide">
                  Quickly identify non-Halal ingredients, questionable emulsifiers, and alcohol content.
                </p>
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Healthy lunchbox" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Card 4: Image Top, Text Bottom */}
            <div className="bg-white p-6 md:p-8 flex flex-col gap-6 aspect-auto min-h-[450px] md:aspect-square">
              <div className="flex-1 w-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Healthy food" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[28px] md:text-[34px] font-serif text-[#163323] mb-4">Calorie Trackers</h3>
                <p className="text-[12px] md:text-[13px] font-mono text-[#163323]/80 leading-relaxed tracking-wide">
                  Automatic macro breakdown and calorie calculation directly from your food photo.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-[#F6F4EB] relative z-10 flex flex-col items-center pt-8 pb-10 px-4 md:px-4 lg:px-8">
        <div className="w-full max-w-[1400px] bg-[#163323] py-14 px-6 md:px-8 flex flex-col items-center text-center">
          <div className="text-[#F6F4EB]/60 font-mono text-[11px] md:text-sm mb-4 uppercase tracking-widest md:normal-case md:tracking-normal">
            06 - Get Started
          </div>
          <h2 className="text-[36px] md:text-[56px] lg:text-[68px] font-serif text-[#F6F4EB] leading-[1.05] tracking-tight mb-6 w-full">
            Ready To Take <br className="md:hidden"/> Control Of Your Diet?
          </h2>
          <p className="text-[11px] md:text-[14px] font-mono text-[#F6F4EB]/80 leading-relaxed tracking-wide max-w-[500px] mb-10 px-2">
            Join thousands of users who are eating safer, smarter, and healthier every day with Truebite.
          </p>
          <button onClick={() => setIsAuthModalOpen(true)} className="w-[95%] md:w-auto bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[15px] md:py-[13px] rounded-full text-[13px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide">
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white rounded-[8px] md:rounded-b-[32px] md:rounded-t-none border-t border-[#163323]/10 px-6 lg:px-12 py-10 flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 md:gap-6 mt-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png?v=2" alt="TrueBite Logo" className="w-9 h-9 md:w-9 md:h-9" />
          <span className="text-[22px] font-bold text-[#163323] tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Truebite</span>
        </div>
        <div className="text-[11px] md:text-[13px] font-mono text-[#163323]/70 tracking-wide text-center">
          © 2026 Truebite. Eat with absolute confidence.
        </div>
      </footer>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultView="signup"
      />
    </div>
  );
}
