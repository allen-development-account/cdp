import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { JourneyDefinition, JourneyStep } from '../../types/cdp';
import {
  GitFork,
  Play,
  Pause,
  Clock,
  Mail,
  Smartphone,
  CheckCircle2,
  XCircle,
  ArrowDown,
  Sparkles,
  Zap,
  Layers,
  Plus,
  Send,
  HelpCircle
} from 'lucide-react';

export const JourneyCanvasView: React.FC = () => {
  const { journeys, toggleJourneyStatus, audiences } = useCDP();
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(journeys[0]?.id || '');

  const activeJourney = journeys.find(j => j.id === selectedJourneyId) || journeys[0];

  const getStepIcon = (type: JourneyStep['type']) => {
    switch (type) {
      case 'trigger': return <Zap className="w-4 h-4 text-[#0EA5E9]" />;
      case 'delay': return <Clock className="w-4 h-4 text-[#0284C7]" />;
      case 'condition': return <GitFork className="w-4 h-4 text-[#1D4ED8]" />;
      case 'action': return <Mail className="w-4 h-4 text-[#0A3D82]" />;
      default: return <Layers className="w-4 h-4 text-[#1473E6]" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_intelligence" fallbackLabel="Intelligence Services" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Multi-Step Journey Orchestration Canvas</h2>
              <span className="text-[10px] bg-white/15 text-sky-200 border border-sky-200/40 font-bold px-2 py-0.5 rounded uppercase">
                XLR8 Journey Orchestration Engine
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Automate multi-channel 1:1 customer lifecycle campaigns with dynamic delays, conditional decision branches, and AI personalized action templates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => toggleJourneyStatus(activeJourney.id)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              activeJourney.status === 'Active'
                ? 'bg-[#FFF0D4] hover:bg-[#FFE3B0] text-[#8C4600] border border-[#FFD085]'
                : 'bg-white hover:bg-[#F2F4F7] text-[#0D66D0]'
            }`}
          >
            {activeJourney.status === 'Active' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Journey Loop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Journey Execution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Journeys Selector + Right Flow Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Journey List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-4 py-3 shadow-2xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Orchestrated Campaigns ({journeys.length})
            </h3>
            <p className="text-[11px] text-blue-100 mt-0.5">Select a journey to inspect live trigger stages</p>
          </div>

          <div className="space-y-2.5">
            {journeys.map(j => {
              const isSelected = j.id === activeJourney.id;
              return (
                <div
                  key={j.id}
                  onClick={() => setSelectedJourneyId(j.id)}
                  className={`p-4 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#1473E6] shadow-2xs ring-1 ring-[#1473E6]'
                      : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#B0B0B0] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-xs text-[#2C2C2C]">{j.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      j.status === 'Active' ? 'bg-[#DEFBE6] text-[#0E7A36] border-[#A1ECC4]' : 'bg-[#F2F4F7] text-[#1E2229] border-[#E1E5EA]'
                    }`}>
                      {j.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#1E2229] line-clamp-2 leading-relaxed mb-3">
                    {j.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#E1E5EA] text-[#1E2229]">
                    <span>{j.steps.length} Flow Steps</span>
                    <span className="text-[#1473E6] font-bold">{j.totalEntered} In Flight</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Visual Flow Tree Stack */}
        <div className="lg:col-span-8 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-6 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">{activeJourney.name}</h3>
                <span className="text-[10px] bg-white/15 text-white font-mono px-2 py-0.5 rounded border border-white/25">
                  {activeJourney.id}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">{activeJourney.description}</p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
              <span className="bg-white/15 text-white border border-white/25 px-3 py-1.5 rounded font-bold tabular-nums">
                {activeJourney.totalEntered} Total Entered
              </span>
              <span className="bg-[#DEFBE6] text-[#0E7A36] border border-[#A1ECC4] px-3 py-1.5 rounded font-bold tabular-nums">
                {activeJourney.totalConverted} Converted
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">

          {/* Visual Stacked Flow Tree */}
          <div className="space-y-4 max-w-2xl mx-auto py-2">
            {activeJourney.steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                {/* Step Card */}
                <div className="bg-[#F2F4F7] hover:bg-[#E9EDF2] rounded p-4 border border-[#E1E5EA] shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative group">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#D5D5D5] shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                      {getStepIcon(step.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229] font-mono">
                          {step.type.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-[#2C2C2C] text-xs">{step.title}</h4>
                      </div>
                      <p className="text-xs text-[#1A1D23] mt-1 leading-relaxed">{step.description}</p>

                      {step.config.actionTemplate && (
                        <div className="mt-2 text-[10px] font-mono text-[#1473E6] bg-[#EBF3FC] px-2.5 py-0.5 rounded border border-[#C5DCFA] inline-block">
                          Template: {step.config.actionTemplate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flow Stats Pills */}
                  <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
                    <div className="px-2.5 py-1 bg-[#FFFFFF] rounded border border-[#E1E5EA] text-center">
                      <span className="text-[9px] text-[#1E2229] block font-sans font-bold">ENTERED</span>
                      <strong className="text-[#2C2C2C]">{step.stats.enteredCount}</strong>
                    </div>
                    <div className="px-2.5 py-1 bg-[#DEFBE6] rounded border border-[#A1ECC4] text-center">
                      <span className="text-[9px] text-[#0E7A36] block font-sans font-bold">PASSED</span>
                      <strong className="text-[#0E7A36]">{step.stats.passedCount}</strong>
                    </div>
                    {step.stats.droppedCount > 0 && (
                      <div className="px-2.5 py-1 bg-[#FDE6E8] rounded border border-[#F88B8B] text-center">
                        <span className="text-[9px] text-[#D7373F] block font-sans font-bold">EXITED</span>
                        <strong className="text-[#D7373F]">{step.stats.droppedCount}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connecting Arrow Down */}
                {idx < activeJourney.steps.length - 1 && (
                  <div className="flex items-center justify-center -my-1">
                    <div className="p-1 rounded-full bg-[#E1E5EA] text-[#1E2229]">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Canvas Footer Notice */}
          <div className="p-3.5 bg-[#F2F4F7] rounded border border-[#E1E5EA] flex items-center justify-between text-xs text-[#1A1D23]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#0D66D0]" />
              <span>Real-time triggers evaluate incoming streams in &lt; 5ms with automatic deduplication.</span>
            </div>
            <span className="text-[#1E2229] font-mono">Status: {activeJourney.status}</span>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
