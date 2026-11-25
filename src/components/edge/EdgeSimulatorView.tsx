import React, { useEffect, useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { DynamicOffer, EdgeEvaluationResult } from '../../types/cdp';
import {
  Zap,
  ArrowRight,
  Sparkles,
  Smartphone,
  Monitor,
  Sliders,
} from 'lucide-react';

const EDGE_PLACEMENTS: DynamicOffer['placement'][] = [
  'Home Hero Banner',
  'Exit Intent Modal',
  'Checkout Upsell',
  'Mobile Push Carousel',
];

export const EdgeSimulatorView: React.FC = () => {
  const { profiles, evaluateEdgePersonalization } = useCDP();

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedPlacement, setSelectedPlacement] = useState<DynamicOffer['placement']>('Home Hero Banner');
  const [edgeResult, setEdgeResult] = useState<EdgeEvaluationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  // Run initial edge evaluation in an effect (never synchronously during render)
  useEffect(() => {
    const targetProfileId =
      selectedProfileId && profiles.some(p => p.id === selectedProfileId)
        ? selectedProfileId
        : profiles[0]?.id || '';

    if (targetProfileId !== selectedProfileId) {
      setSelectedProfileId(targetProfileId);
    }

    const res = evaluateEdgePersonalization(targetProfileId, selectedPlacement);
    setEdgeResult(res);
    // Intentionally run when profiles hydrate or user hasn't picked yet; manual clicks call handleSimulate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  const handleSimulate = (profileId: string, placement: DynamicOffer['placement']) => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = evaluateEdgePersonalization(profileId, placement);
      setEdgeResult(res);
      setIsSimulating(false);
    }, 180);
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_data_science" fallbackLabel="Data Science & Query" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Zap className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Real-Time Edge Personalization & Offer Decisioning</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap">
                XLR8 Edge Network / SDK
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Simulate sub-50ms edge segmentation and dynamic offer decisioning delivered directly to web, mobile, and kiosk touchpoints.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/15 p-1 rounded-lg border border-white/20 shrink-0">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              deviceMode === 'desktop' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white'
            }`}
            title="Desktop Viewport"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              deviceMode === 'mobile' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white'
            }`}
            title="Mobile App Viewport"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Control Deck & Profile Switcher */}
        <div className="lg:col-span-5 flex flex-col space-y-4 overflow-y-auto pr-1">
          {/* Target Profile Selector */}
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-4 py-3 border-b border-[#0E4DA4]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-white shrink-0" />
                <span>Simulated Visitor Persona</span>
              </h3>
            </div>

            <div className="p-4">

            {profiles.length === 0 ? (
              <div className="p-4 rounded border border-dashed border-[#D0D7DE] bg-[#F8FAFC] text-xs text-[#596780]">
                No Customer 360 profiles loaded yet. Switch to Demo Mode or ingest an event to simulate personalized visitor offers (showing anonymous fallback visitor).
              </div>
            ) : (
              <div className="space-y-2">
                {profiles.map((p) => {
                  const isSelected = p.id === selectedProfileId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProfileId(p.id);
                        handleSimulate(p.id, selectedPlacement);
                      }}
                      className={`p-3 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF3FC] border-[#1473E6] shadow-2xs'
                          : 'bg-[#FFFFFF] border-[#E1E5EA] hover:bg-[#F2F4F7]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C2C2C]">{p.unifiedName}</span>
                        <span className="text-[10px] font-mono text-[#1E2229]">${p.attributes.totalSpend} Spend</span>
                      </div>
                      <p className="text-[11px] text-[#1E2229] mt-0.5 truncate">{p.primaryEmail}</p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.qualifyingAudienceIds.map((aid, idx) => (
                          <span key={idx} className="text-[9px] bg-[#FFFFFF] border border-[#E1E5EA] text-[#1473E6] px-1.5 py-0.5 rounded font-semibold">
                            {aid}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Placement Switcher */}
            <div className="mt-4 pt-3 border-t border-[#E1E5EA]">
              <label className="block text-xs font-bold text-[#2C2C2C] mb-2">Web / App Experience Placement</label>
              <div className="grid grid-cols-2 gap-2">
                {EDGE_PLACEMENTS.map((placement) => (
                  <button
                    key={placement}
                    onClick={() => {
                      setSelectedPlacement(placement);
                      handleSimulate(selectedProfileId, placement);
                    }}
                    className={`text-left p-2 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      selectedPlacement === placement
                        ? 'bg-[#1473E6] text-white border-[#1473E6] shadow-2xs'
                        : 'bg-[#FFFFFF] border-[#E1E5EA] text-[#2C2C2C] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    {placement}
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>

          {/* Real-Time Edge Latency Telemetry */}
          {edgeResult && (
            <div className="bg-[#FFFFFF] rounded-xl text-[#2C2C2C] border border-[#E1E5EA] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-4 py-3 border-b border-[#0E4DA4] flex items-center justify-between text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-white">
                  <Zap className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Edge Decisioning Telemetry</span>
                </span>
                <span className="text-[#0369A1] font-mono bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD] text-[11px] font-bold">
                  {isSimulating ? 'Evaluating...' : `${edgeResult.evaluationLatencyMs} ms`}
                </span>
              </div>

              <div className="p-4">

              <div className="space-y-1.5 text-xs text-[#1A1D23]">
                <div className="flex justify-between">
                  <span className="text-[#1E2229]">Edge Region Node:</span>
                  <span className="font-mono text-[#1473E6] font-semibold">{edgeResult.edgeRegion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E2229]">Selected Offer Rank:</span>
                  <span className="font-bold text-[#2C2C2C]">Priority #{edgeResult.selectedOffer.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E2229]">Affinity Score:</span>
                  <span className="font-mono text-[#0284C7] font-bold">{edgeResult.calculatedScore.toFixed(0)} / 100</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E1E5EA]">
                <span className="text-[10px] uppercase font-bold text-[#1E2229] block mb-1">Decision Logic Chain:</span>
                <div className="space-y-1">
                  {edgeResult.appliedPersonalizationRules.map((rule, idx) => (
                    <div key={idx} className="text-[11px] text-[#2C2C2C] font-mono flex items-center space-x-1">
                      <span className="text-[#0284C7] font-bold">✓</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Web App Canvas Preview */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded border border-[#E1E5EA] p-4 flex flex-col overflow-hidden shadow-2xs">
          {/* Browser Bar */}
          <div className="bg-[#F2F4F7] rounded p-2 flex items-center justify-between mb-4 border border-[#E1E5EA]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D5D5D5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D5D5D5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D5D5D5]" />
              <div className="bg-[#FFFFFF] px-2.5 py-0.5 rounded text-[#1E2229] text-xs font-mono border border-[#E1E5EA] ml-2">
                https://store.brandnexus.com/experiences?sdk=alloy_v2.18
              </div>
            </div>

            <span className="text-[10px] bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-bold px-2 py-0.5 rounded">
              LIVE ALLOY.JS
            </span>
          </div>

          {/* Interactive Simulation Frame */}
          <div className="flex-1 overflow-y-auto rounded border border-[#E1E5EA] bg-[#F2F4F7] p-6 flex flex-col items-center justify-center">
            {edgeResult ? (
              <div className={`w-full ${deviceMode === 'mobile' ? 'max-w-xs' : 'max-w-xl'} transition-all`}>
                {/* Dynamically Rendered Personalization Component */}
                <div className="bg-[#FFFFFF] rounded border border-[#C5DCFA] shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#1473E6] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl shadow-2xs">
                    Dynamic Offer: #{edgeResult.selectedOffer.id}
                  </div>

                  <div className="flex items-center space-x-1.5 text-[#1473E6] text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized for {selectedProfile?.unifiedName || 'Anonymous Visitor'}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#2C2C2C] tracking-tight">
                    {edgeResult.selectedOffer.headline || edgeResult.selectedOffer.title}
                  </h3>

                  <p className="text-xs text-[#1A1D23] mt-1.5 leading-relaxed">
                    {edgeResult.selectedOffer.subhead}
                  </p>

                  {edgeResult.selectedOffer.promoCode && (
                    <div className="mt-3 inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#EBF3FC] border border-[#C5DCFA] text-[11px] font-mono text-[#0D66D0]">
                      <span>Code:</span>
                      <strong>{edgeResult.selectedOffer.promoCode}</strong>
                      {edgeResult.selectedOffer.discountPercentage && (
                        <span>({edgeResult.selectedOffer.discountPercentage}% off)</span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E1E5EA]">
                    <div className="text-[11px] text-[#1E2229]">
                      Placement: <strong className="text-[#2C2C2C]">{edgeResult.selectedOffer.placement}</strong>
                    </div>

                    <button className="bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold text-xs px-3.5 py-1.5 rounded shadow-2xs transition-all flex items-center space-x-1 cursor-pointer">
                      <span>{edgeResult.selectedOffer.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Offer Content Payload Inspector */}
                <div className="mt-3 bg-[#FFFFFF] text-[#2C2C2C] rounded p-3 text-[11px] font-mono border border-[#E1E5EA] shadow-2xs">
                  <div className="text-[#1E2229] text-[10px] uppercase font-bold mb-1">
                    Alloy Edge Payload (JSON Response)
                  </div>
                  <pre className="overflow-x-auto text-[10px] text-[#0D66D0] bg-[#F2F4F7] p-2 rounded border border-[#E1E5EA]">
{JSON.stringify(
  {
    proposition: edgeResult.selectedOffer.id,
    title: edgeResult.selectedOffer.title,
    targetAudiences: edgeResult.selectedOffer.targetAudienceIds,
    score: edgeResult.calculatedScore,
    edgeDeliveryLatency: `${edgeResult.evaluationLatencyMs}ms`,
    timestamp: edgeResult.payloadDeliveryTimestamp
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#1E2229]">
                <p className="text-xs font-semibold">Select a persona and placement to execute edge evaluation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
