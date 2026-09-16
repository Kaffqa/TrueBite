import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#163323]/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-[600px] max-h-[85vh] bg-[#F6F4EB] rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-white/40"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#163323]/10 bg-white">
            <h2 className="text-xl font-serif text-[#163323] font-bold tracking-tight">Privacy Policy</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#163323]/5 hover:bg-[#163323]/10 text-[#163323]/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto font-mono text-sm text-[#163323]/80 space-y-6 bg-white/50">
            <section>
              <h3 className="font-bold text-[#163323] text-base mb-2">1. Introduction</h3>
              <p>Welcome to TrueBite. Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.</p>
            </section>
            
            <section>
              <h3 className="font-bold text-[#163323] text-base mb-2">2. Information We Collect</h3>
              <p>When you register for an account, we collect the following information:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Your email address.</li>
                <li>Your secure password (encrypted).</li>
                <li>Profile details you choose to provide (e.g., name, nutritional goals).</li>
                <li>Data about the foods you scan and track using our service.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-[#163323] text-base mb-2">3. How We Use Your Information</h3>
              <p>We use your information exclusively to provide and improve the TrueBite service. This includes:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Authenticating your account.</li>
                <li>Personalizing your nutritional insights and food journal.</li>
                <li>Improving our AI scanning accuracy based on anonymized usage data.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-[#163323] text-base mb-2">4. Data Security</h3>
              <p>We implement industry-standard security measures, including secure database storage and encryption, to protect your personal data from unauthorized access, alteration, or disclosure. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h3 className="font-bold text-[#163323] text-base mb-2">5. Cookies and Tracking</h3>
              <p>We use essential cookies to maintain your active session and authenticate your requests. By using TrueBite, you agree to our use of these essential technical cookies.</p>
            </section>

            <section>
              <h3 className="font-bold text-[#163323] text-base mb-2">6. Your Rights</h3>
              <p>You have the right to access, modify, or delete your personal information at any time. You can delete your account from the settings page, which will permanently remove your associated personal data from our systems.</p>
            </section>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-[#163323]/10 bg-white flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-[10px] bg-gradient-to-b from-[#5c8263] to-[#2a4e35] hover:from-[#4e7255] hover:to-[#21422b] text-white rounded-full font-mono text-[13.5px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45),_0_6px_12px_rgba(22,51,35,0.25)] border-[2.5px] border-[#1a3825] transition-all flex items-center justify-center tracking-wide"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
