import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Leaf, ShieldCheck, Activity, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, loading } = useAuth();

  // If already logged in, redirect to the app dashboard
  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-green-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 bg-white w-full border-b border-gray-100 z-50">
        <div className="flex justify-between items-center px-6 lg:px-12 py-3 w-full">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <img src="/logo.png" alt="Truebite Logo" className="w-11 h-11 object-contain" />
            <span className="font-sans text-[22px] font-black tracking-tight text-[#163323]">Truebite</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-[13px] font-mono font-bold text-[#163323]">Home</a>
            <a href="#how-it-works" className="text-[13px] font-mono font-medium text-gray-500 hover:text-[#163323] transition-colors">How It Works</a>
            <a href="#features" className="text-[13px] font-mono font-medium text-gray-500 hover:text-[#163323] transition-colors">Features</a>
            <a href="#who-its-for" className="text-[13px] font-mono font-medium text-gray-500 hover:text-[#163323] transition-colors">Who It's For</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 bg-[#F6F4EB] w-full relative z-10 flex flex-col pt-12 pb-16">
        
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
              <Link to="/signup" className="bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[13px] rounded-full text-[13px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide">
                Start Scanning for Free
              </Link>
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

      {/* Problem Section */}
      <section className="w-full bg-white relative z-10 flex flex-col pt-20 pb-20">
        
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

      {/* How It Works Section */}
      <section className="w-full bg-[#163323] relative z-10 flex flex-col pt-20 pb-20">
        
        {/* Top text part */}
        <div className="flex flex-col mb-16 px-6 lg:px-12 w-full">
          <div className="text-[#F6F4EB]/60 font-mono text-sm mb-6">
            03 - How It Works
          </div>
          <h2 className="text-5xl md:text-[68px] font-serif text-[#F6F4EB] leading-[1.05] tracking-tight max-w-[900px]">
            3 Steps To Total Food Transparency
          </h2>
        </div>

        {/* Steps List */}
        <div className="flex flex-col px-6 lg:px-12 w-full gap-10 md:gap-14">
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
            <div key={idx} className="flex items-start gap-6 md:gap-8 w-full overflow-hidden">
              {/* Big Italic Number */}
              <div className="text-7xl md:text-[100px] font-serif italic text-[#F6F4EB] leading-[0.75] shrink-0 w-[75px] md:w-[110px] pt-2">
                {step.num}
              </div>
              
              {/* Title & Desc with underline */}
              <div className="flex flex-col w-max max-w-full">
                <div className="w-full border-b border-[#F6F4EB]/40 pb-4 mb-4">
                  <h3 className="text-3xl md:text-[36px] font-serif text-[#F6F4EB] leading-none">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[12px] md:text-[13.5px] font-mono text-[#F6F4EB]/70 leading-relaxed tracking-wide">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white relative z-10 flex flex-col pt-20 pb-20">
        
        {/* Top text part & Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16 px-6 lg:px-12 w-full">
          <div className="lg:w-[50%]">
            <div className="text-gray-400 font-mono text-sm mb-6">
              04 - Features
            </div>
            <h2 className="text-5xl md:text-[68px] font-serif text-[#163323] leading-[1.05] tracking-tight">
              Total Clarity, <br />
              Zero Guesswork
            </h2>
          </div>
          
          <div className="lg:w-[50%] flex justify-start lg:justify-end pb-3">
            <Link to="/features" className="bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[13px] rounded-full text-[13px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide">
              See All Features
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-6 lg:px-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
              <div key={idx} className="bg-[#F6F4EB] px-8 py-10 md:px-10 md:py-10 flex flex-col gap-12 md:gap-16">
                <h3 className="text-2xl md:text-[34px] font-serif text-[#163323] leading-tight">
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
        <div className="flex flex-col items-center text-center mb-16 px-6 lg:px-12 w-full">
          <div className="text-gray-400 font-mono text-sm mb-6">
            05 - Who It's For
          </div>
          <h2 className="text-5xl md:text-[68px] font-serif text-[#163323] leading-[1.05] tracking-tight">
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
      <section className="w-full bg-white relative z-10 flex flex-col items-center pt-12 pb-8 px-4 lg:px-8">
        <div className="w-full max-w-[1400px] bg-[#163323] py-6 px-4 md:px-8 flex flex-col items-center text-center">
          <div className="text-[#F6F4EB]/60 font-mono text-sm mb-3">
            06 - Get Started
          </div>
          <h2 className="text-4xl md:text-[56px] lg:text-[68px] font-serif text-[#F6F4EB] leading-[1.05] tracking-normal mb-4 w-full whitespace-normal lg:whitespace-nowrap">
            Ready To Take Control Of Your Diet?
          </h2>
          <p className="text-[12px] md:text-[14px] font-mono text-[#F6F4EB]/80 leading-relaxed tracking-wide max-w-[500px] mb-6">
            Join thousands of users who are eating safer, smarter,<br className="hidden md:block"/> and healthier every day with Truebite.
          </p>
          <Link to="/register" className="bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white px-8 py-[13px] rounded-full text-[13px] font-mono shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.3)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center font-medium tracking-wide">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#163323]/10 px-6 lg:px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="TrueBite Logo" className="w-7 h-7 md:w-9 md:h-9" />
          <span className="text-xl md:text-[22px] font-bold text-[#163323] tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Truebite</span>
        </div>
        <div className="text-[12px] md:text-[13px] font-mono text-[#163323]/60 tracking-wide">
          © 2026 Truebite. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
