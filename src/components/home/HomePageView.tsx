import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  ArrowRight,
  Bot,
  Award,
  Compass,
  ChevronDown
} from 'lucide-react';

export const HomePageView: React.FC = () => {
  const {
    setActiveTab,
    openGuidedOverview
  } = useCDP();

  const [aiSupportOpen, setAiSupportOpen] = useState(false);
  const [whyXlr8Open, setWhyXlr8Open] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-[#F8F9FA] text-[#1E2229] select-none" id="home-view-root">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 space-y-6">
        {/* Clean Welcome Header */}
        <div className="bg-gradient-to-br from-[#0B2E58] via-[#0E4988] to-[#1473E6] rounded-2xl border border-[#2B73C4]/40 p-8 shadow-sm relative overflow-hidden text-white">
          <div className="relative z-10 space-y-2.5 max-w-2xl">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/15 text-white border border-white/25">
              XLR8 Realtime CDP
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome to XLR8 Realtime CDP
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Enterprise Real-Time Customer Data Platform unifying multi-channel customer data into real-time 360 profiles with DULE governance and instant destination activation.
            </p>
          </div>
        </div>

        {/* Pre-Collapsed Horizontal Accordion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* XLR8 AI Support Accordion Card */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden transition-colors hover:border-[#1473E6]/50">
            <button
              type="button"
              aria-expanded={aiSupportOpen}
              onClick={() => setAiSupportOpen(prev => !prev)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1473E6] to-[#084A9E] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#1E2229] truncate">
                    XLR8 AI Support
                  </h2>
                  <p className="text-xs text-[#596780] truncate">
                    Screenshot &amp; multimodal troubleshooting
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#475569] shrink-0 transition-transform duration-200 ${
                  aiSupportOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {aiSupportOpen && (
              <div className="px-5 pb-5 pt-3 border-t border-[#E1E5EA] bg-[#F8FAFC] space-y-4">
                <p className="text-xs text-[#334155] leading-relaxed">
                  Troubleshoot any platform issue or error in seconds: paste a screenshot directly into the assistant and ask your question.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai_support')}
                  className="px-4 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <span>Open XLR8 AI Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Why Choose XLR8 Realtime CDP Accordion Card */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden transition-colors hover:border-[#0284C7]/50">
            <button
              type="button"
              aria-expanded={whyXlr8Open}
              onClick={() => setWhyXlr8Open(prev => !prev)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0A3D82] text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-sky-200" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#1E2229] truncate">
                    Why Choose XLR8 Realtime CDP?
                  </h2>
                  <p className="text-xs text-[#596780] truncate">
                    Adobe RT-CDP comparison matrix
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#475569] shrink-0 transition-transform duration-200 ${
                  whyXlr8Open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {whyXlr8Open && (
              <div className="px-5 pb-5 pt-3 border-t border-[#E1E5EA] bg-[#F8FAFC] space-y-4">
                <p className="text-xs text-[#334155] leading-relaxed">
                  Explore our side-by-side evaluation matrix proving full architectural parity with XDM and DULE standards, collision simulation, and live edge QA.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('why_excelr8')}
                  className="px-4 py-2 rounded-lg bg-[#0D66D0] hover:bg-[#0A4BB5] text-white text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <span>Explore Comparison</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Simple Centered CTA: Get Started (Guided Track) */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={openGuidedOverview}
            className="px-6 py-3 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-white text-sm font-semibold inline-flex items-center space-x-2 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Get Started (Guided Track)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
