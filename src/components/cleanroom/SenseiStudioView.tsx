import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { LookalikeModelConfig, CleanRoomQuery } from '../../types/cdp';
import {
  Sparkles,
  Layers,
  Lock,
  Sliders,
  Play,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Plus,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  X
} from 'lucide-react';

export const SenseiStudioView: React.FC = () => {
  const {
    lookalikes,
    cleanRoomQueries,
    audiences,
    createLookalikeModel,
    runCleanRoomQuery,
    addTerminalLog
  } = useCDP();

  const [activeTab, setActiveTab] = useState<'lookalikes' | 'cleanroom'>('lookalikes');
  const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);

  // New Lookalike Model state
  const [modelName, setModelName] = useState('');
  const [seedAudienceId, setSeedAudienceId] = useState(audiences[0]?.id || 'aud_champions');
  const [expansionRatio, setExpansionRatio] = useState<number>(3);
  const [targetReach, setTargetReach] = useState<number>(2500000);

  const handleCreateModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName) return;

    createLookalikeModel({
      name: modelName,
      seedAudienceId,
      expansionRatio: Number(expansionRatio),
      targetReachProfiles: Number(targetReach)
    });

    setIsCreateModelOpen(false);
    setModelName('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <PageBackButton fallbackTab="hub_data_science" fallbackLabel="Data Science & Query" className="mt-0.5 shrink-0" />
            <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight">Sensei AI Modeling &amp; Data Clean Rooms</h2>
                <span className="text-xs font-medium text-blue-100 whitespace-nowrap shrink-0">
                  &middot; XLR8 Intelligence &amp; Clean Room
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1.5 max-w-3xl leading-relaxed">
                Train high-precision machine learning lookalike models from high-value seed audiences and execute multi-party clean room queries with mathematical differential privacy.
              </p>
            </div>
          </div>

          {activeTab === 'lookalikes' && (
            <button
              onClick={() => setIsCreateModelOpen(true)}
              className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-bold px-4 py-2 rounded-lg shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Train Lookalike Model</span>
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-white/15 flex items-center">
          {/* View Switcher Tabs */}
          <div className="bg-white/10 p-1 rounded-xl inline-flex flex-wrap items-center gap-1 border border-white/20">
            <button
              onClick={() => setActiveTab('lookalikes')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'lookalikes' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Lookalike Models ({lookalikes.length})
            </button>
            <button
              onClick={() => setActiveTab('cleanroom')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'cleanroom' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Data Clean Rooms ({cleanRoomQueries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'lookalikes' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lookalikes.map((model) => (
                <div
                  key={model.id}
                  className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1473E6] hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[#2C2C2C]">{model.name}</h3>
                          <span className="text-[10px] bg-[#DEFBE6] text-[#0E7A36] font-bold px-2 py-0.5 rounded border border-[#A1ECC4]">
                            {model.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#1E2229] mt-0.5">
                          Seed: <strong className="text-[#1473E6]">{model.seedAudienceId}</strong> • Expansion Ratio: {model.expansionRatio}x
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#5C2B97] font-mono">{model.similarityScore}%</span>
                        <p className="text-[9px] uppercase font-bold text-[#1E2229]">Similarity</p>
                      </div>
                    </div>

                    {/* Reach and Audience Specs */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#E1E5EA] text-xs">
                      <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                        <span className="text-[10px] text-[#1E2229] font-medium">Projected Addressable Reach</span>
                        <p className="text-sm font-bold text-[#2C2C2C] font-mono mt-0.5">
                          {model.projectedAudienceSize.toLocaleString()} Profiles
                        </p>
                      </div>

                      <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                        <span className="text-[10px] text-[#1E2229] font-medium">Last Retrained</span>
                        <p className="text-xs font-semibold text-[#2C2C2C] mt-0.5">
                          {new Date(model.lastTrained).toLocaleDateString()} (Sensei V4)
                        </p>
                      </div>
                    </div>

                    {/* Top ML Influencing Features */}
                    <div className="mt-4 pt-3 border-t border-[#E1E5EA]">
                      <span className="text-[10px] uppercase font-bold text-[#1E2229] tracking-wider block mb-2">
                        Top Influencing Features (Shapley Values)
                      </span>
                      <div className="space-y-2">
                        {model.topInfluencingFeatures.map((feat, idx) => (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex justify-between text-[#1A1D23] text-[11px]">
                              <span>{feat.feature}</span>
                              <span className="font-mono font-semibold">{(feat.importance * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-[#E1E5EA] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#5C2B97] h-1.5 rounded-full"
                                style={{ width: `${feat.importance * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 pt-3 border-t border-[#E1E5EA] flex items-center justify-between">
                    <span className="text-xs text-[#1E2229]">Auto-Refreshed Daily at Midnight</span>
                    <button
                      onClick={() => addTerminalLog('ai', 'SENSEI', `Exported Lookalike Segment "${model.name}" to Meta & Google Ad Connectors`)}
                      className="text-xs font-semibold bg-[#F1E8FF] hover:bg-[#E3D3FF] text-[#5C2B97] border border-[#D0B3FF] px-3 py-1.5 rounded transition-all"
                    >
                      Export Segment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Clean Room Collaboration Tab */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cleanRoomQueries.map((cr) => (
                <div
                  key={cr.id}
                  className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1473E6] hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[#2C2C2C]">{cr.partnerName}</h3>
                          <span className="text-[10px] bg-[#F1E8FF] text-[#5C2B97] font-bold px-2 py-0.5 rounded border border-[#D0B3FF]">
                            {cr.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#1E2229] mt-0.5">
                          Clean Room ID: <strong className="font-mono text-[#2C2C2C]">{cr.cleanRoomId}</strong>
                        </p>
                      </div>

                      <div className="p-2 bg-[#DEFBE6] text-[#0E7A36] rounded border border-[#A1ECC4]">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Partner Collaboration Specs */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#E1E5EA] text-xs">
                      <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                        <span className="text-[10px] text-[#1E2229] font-medium">Privacy Mechanism</span>
                        <p className="text-xs font-bold text-[#2C2C2C] mt-0.5">{cr.privacyMethod}</p>
                      </div>

                      <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                        <span className="text-[10px] text-[#1E2229] font-medium">Epsilon (ε) Privacy Budget</span>
                        <p className="text-xs font-bold text-[#5C2B97] font-mono mt-0.5">ε = {cr.epsilonPrivacyBudget}</p>
                      </div>
                    </div>

                    {/* Matched Overlap Count */}
                    <div className="mt-4 p-3 bg-[#F1E8FF] rounded border border-[#D0B3FF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5C2B97]">Co-Targetable Identity Overlap</span>
                        <p className="text-lg font-bold text-[#2C2C2C] font-mono mt-0.5">
                          {cr.resultOverlapCount.toLocaleString()} Matches
                        </p>
                      </div>

                      <button
                        onClick={() => runCleanRoomQuery(cr.id)}
                        className="flex items-center space-x-1 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold px-3 py-1.5 rounded transition-all shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-Run Analysis</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer Security Pill */}
                  <div className="mt-4 pt-3 border-t border-[#E1E5EA] flex items-center justify-between text-xs text-[#1E2229]">
                    <span className="flex items-center space-x-1 text-[#0E7A36] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Raw PII Shared • Encrypted Hashing</span>
                    </span>
                    <span>Last run: {new Date(cr.executedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Train Lookalike Modal */}
      {isCreateModelOpen && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
              <h3 className="text-sm font-bold text-[#2C2C2C]">Train Sensei ML Lookalike Model</h3>
              <button onClick={() => setIsCreateModelOpen(false)} className="text-[#1E2229] hover:text-[#2C2C2C]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateModel} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Spenders Extended Prospecting Model"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Seed Audience Cohort</label>
                <select
                  value={seedAudienceId}
                  onChange={(e) => setSeedAudienceId(e.target.value)}
                  className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1473E6]"
                >
                  {audiences.map((aud) => (
                    <option key={aud.id} value={aud.id}>
                      {aud.name} ({aud.memberCount.toLocaleString()} profiles)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-[#1A1D23]">Lookalike Expansion Scale: {expansionRatio}%</label>
                  <span className="text-[#1473E6] font-bold">~{(expansionRatio * 850000).toLocaleString()} Profiles</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={expansionRatio}
                  onChange={(e) => setExpansionRatio(Number(e.target.value))}
                  className="w-full accent-[#1473E6]"
                />
                <div className="flex justify-between text-[10px] text-[#1E2229] mt-1">
                  <span>1% (Highest Precision)</span>
                  <span>5% (Balanced)</span>
                  <span>10% (Maximum Reach)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E5EA] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModelOpen(false)}
                  className="px-3.5 py-1.5 bg-[#F2F4F7] hover:bg-[#E1E5EA] text-[#2C2C2C] font-semibold rounded text-xs border border-[#D5D5D5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded text-xs shadow-2xs"
                >
                  Start Model Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
