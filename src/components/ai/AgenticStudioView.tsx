import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { AgentPromptSession, AnomalyAlert, CampaignVariant } from '../../types/cdp';
import {
  Sparkles,
  Bot,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Copy,
  Clock,
  Send,
  Database,
  Cpu,
  RefreshCw,
  Flame,
  MessageSquare,
  Wand2,
  ChevronRight,
  Sliders,
  Check
} from 'lucide-react';

export const AgenticStudioView: React.FC = () => {
  const {
    agentPrompts,
    anomalies,
    campaignVariants,
    runAgentPrompt,
    autoHealAnomaly,
    generateCampaignVariants,
    convertAgentPromptToAudience,
    executeZeroCopyPushdown,
    setActiveTab,
    addTerminalLog
  } = useCDP();

  const [activeSubTab, setActiveSubTab] = useState<'copilot' | 'anomalies' | 'campaign_gen'>('copilot');
  const [promptInput, setPromptInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgentPromptSession['category']>('Audience Segmentation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(agentPrompts[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deployedAudienceId, setDeployedAudienceId] = useState<string | null>(null);

  // Campaign Generator state
  const [campaignTargetAudience, setCampaignTargetAudience] = useState('High-LTV VIP & At-Risk Cart Abandoners');
  const [campaignObjective, setCampaignObjective] = useState('Drive Cart Recovery & Boost Loyalty Uplift');
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);

  const activeSession = agentPrompts.find(s => s.id === selectedSessionId) || agentPrompts[0];

  const presetPrompts = [
    {
      label: 'EMEA Enterprise Churn',
      category: 'Audience Segmentation' as const,
      prompt: 'Find all Enterprise accounts in EMEA with high churn risk (>65%) that have not logged in for 14 days and visited our cancellation FAQ'
    },
    {
      label: 'Zero-Copy Cart Abandoners',
      category: 'Zero-Copy Query' as const,
      prompt: 'Target high-LTV customers who abandoned carts with values over $250 in the last 48 hours, enriched with Snowflake Lifetime Order history'
    },
    {
      label: 'DULE Privacy Opt-In Audit',
      category: 'Privacy Audit' as const,
      prompt: 'Audit all audience segments exporting sensitive PII identifiers (SSN, Phone, Health) without explicit opt-in consent'
    },
    {
      label: 'B2B Q3 Upsell Propensity',
      category: 'Audience Segmentation' as const,
      prompt: 'Extract accounts with ARR >= $75k, product utilization >= 85%, and license seats > 90% full for Q3 expansion outreach'
    }
  ];

  const handleRunPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    try {
      const session = await runAgentPrompt(promptInput.trim(), selectedCategory);
      setSelectedSessionId(session.id);
      setPromptInput('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeployToAudience = (session: AgentPromptSession) => {
    const aud = convertAgentPromptToAudience(session);
    setDeployedAudienceId(aud.id);
    setTimeout(() => {
      setDeployedAudienceId(null);
    }, 3000);
  };

  const handleGenerateCampaigns = () => {
    setIsGeneratingCampaign(true);
    setTimeout(() => {
      generateCampaignVariants(campaignTargetAudience, campaignObjective);
      setIsGeneratingCampaign(false);
    }, 600);
  };

  const activeAnomaliesCount = anomalies.filter(a => a.status === 'Active').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_intelligence" fallbackLabel="Intelligence Services" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Agentic AI Copilot & Autonomous Drift Agent</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Autonomous GenAI & Drift Engine
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Natural language prompt-to-SQL compiler, Zero-Copy warehouse optimizer, self-healing pipeline anomaly resolver, and generative multi-variant campaign synthesizer.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-white/15 p-1 rounded-lg flex items-center space-x-1 border border-white/20 shrink-0">
          <button
            onClick={() => setActiveSubTab('copilot')}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'copilot' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Copilot Studio</span>
          </button>
          <button
            onClick={() => setActiveSubTab('anomalies')}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'anomalies' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Autonomous Anomalies</span>
            {activeAnomaliesCount > 0 && (
              <span className="text-[10px] bg-[#D7373F] text-white font-bold px-1.5 py-0.2 rounded">
                {activeAnomaliesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('campaign_gen')}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'campaign_gen' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>GenAI Campaigns</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Copilot Studio */}
      {activeSubTab === 'copilot' && (
        <div className="space-y-6">
          {/* Prompt Interactive Composer Card */}
          <div className="bg-[#2C2C2C] rounded border border-[#3E3E3E] p-5 shadow-xs text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#B085F5] animate-ping" />
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Natural Language Query & Reasoning Engine</span>
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[#999999]">Context:</span>
                <span className="text-[#D0B3FF] font-mono bg-[#3E3E3E] px-2 py-0.5 rounded border border-[#505050]">
                  Real-Time Profiles + Snowflake Zero-Copy + DULE Engine
                </span>
              </div>
            </div>

            <form onSubmit={handleRunPrompt} className="space-y-3">
              <div className="relative">
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe your audience or query intent (e.g., 'Find all EMEA accounts with churn risk > 65% inactive for 14 days...')"
                  rows={3}
                  className="w-full bg-[#1E1E1E] border border-[#3E3E3E] rounded p-3 text-xs text-white placeholder-[#8E8E8E] focus:outline-none focus:border-[#1473E6] transition-all resize-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !promptInput.trim()}
                  className="absolute bottom-3 right-3 bg-[#1473E6] hover:bg-[#0D66D0] disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded shadow-2xs transition-all flex items-center space-x-1.5"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Agent Reasoning</span>
                    </>
                  )}
                </button>
              </div>

              {/* Presets Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-[#8E8E8E]">Preset Blueprints:</span>
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptInput(p.prompt);
                      setSelectedCategory(p.category);
                    }}
                    className="text-[11px] bg-[#3E3E3E] hover:bg-[#4E4E4E] text-[#E0E0E0] hover:text-white px-2.5 py-1 rounded border border-[#505050] transition-all"
                  >
                    ⚡ {p.label}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Active Session Output & Reasoning Explorer */}
          {activeSession && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Reasoning Chain & Metadata */}
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
                    <span className="text-xs font-bold text-[#2C2C2C]">Agent Reasoning Pipeline</span>
                    <span className="text-[10px] bg-[#DEFBE6] text-[#0E7A36] border border-[#A1ECC4] font-bold px-2 py-0.5 rounded">
                      {Math.round(activeSession.confidenceScore * 100)}% Confidence
                    </span>
                  </div>

                  {/* Steps */}
                  <div className="space-y-3 mt-4">
                    {activeSession.reasoningChain.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs">
                        <div className="w-5 h-5 rounded bg-[#F1E8FF] border border-[#D0B3FF] text-[#5C2B97] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-[#1A1D23] leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#E1E5EA] text-xs">
                    <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                      <span className="text-[10px] text-[#1E2229] font-medium">Estimated Audience</span>
                      <p className="text-sm font-bold text-[#2C2C2C] font-mono mt-0.5">
                        {activeSession.estimatedProfiles.toLocaleString()} Profiles
                      </p>
                    </div>
                    <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                      <span className="text-[10px] text-[#1E2229] font-medium">Execution Latency</span>
                      <p className="text-sm font-bold text-[#5C2B97] font-mono mt-0.5">
                        {activeSession.executionTimeMs} ms
                      </p>
                    </div>
                  </div>

                  {/* Governance Tag */}
                  <div className="mt-4 p-3 bg-[#DEFBE6]/60 rounded border border-[#A1ECC4] flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#0E7A36] shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-[#0E7A36]">DULE Governance Policy: {activeSession.duleComplianceStatus}</p>
                      <p className="text-[10px] text-[#2C2C2C]">All sensitive PII tags masked for reverse ETL destination pipelines.</p>
                    </div>
                  </div>
                </div>

                {/* Session History Mini-List */}
                <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs">
                  <h4 className="text-xs font-bold text-[#2C2C2C] mb-3">Prompt History & Blueprints</h4>
                  <div className="space-y-2">
                    {agentPrompts.map((sess) => (
                      <button
                        key={sess.id}
                        onClick={() => setSelectedSessionId(sess.id)}
                        className={`w-full text-left p-2.5 rounded border transition-all text-xs ${
                          sess.id === activeSession.id
                            ? 'bg-[#F1E8FF] border-[#D0B3FF] text-[#5C2B97] font-medium'
                            : 'bg-[#F2F4F7] border-[#E1E5EA] text-[#1A1D23] hover:bg-[#E1E5EA]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#2C2C2C] truncate">{sess.generatedAudienceName}</span>
                          <span className="text-[9px] text-[#1E2229]">{sess.executionTimeMs}ms</span>
                        </div>
                        <p className="text-[11px] text-[#1E2229] line-clamp-1">{sess.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (2 cols wide): Generated PQL & SQL Code Blocks + Action Bar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Code Generation Card */}
                <div className="bg-[#1E1E1E] rounded border border-[#3E3E3E] p-5 shadow-xs text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-[#3E3E3E]">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-[#B085F5]" />
                      <span className="text-xs font-bold text-[#E0E0E0]">
                        Generated XLR8 PQL (Profile Query Language)
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeSession.generatedPql, 'pql')}
                      className="text-xs text-[#B0B0B0] hover:text-white flex items-center space-x-1 bg-[#2C2C2C] px-2 py-1 rounded border border-[#3E3E3E]"
                    >
                      {copiedCode === 'pql' ? <Check className="w-3.5 h-3.5 text-[#0E7A36]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'pql' ? 'Copied' : 'Copy PQL'}</span>
                    </button>
                  </div>
                  <pre className="mt-3 p-3 bg-[#121212] rounded text-xs font-mono text-[#D0B3FF] overflow-x-auto border border-[#2C2C2C]">
                    {activeSession.generatedPql}
                  </pre>

                  {/* SQL Pushdown Tab */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#3E3E3E]">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-[#529E72]" />
                      <span className="text-xs font-bold text-[#E0E0E0]">
                        Zero-Copy ANSI SQL Pushdown (Snowflake / BigQuery)
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeSession.generatedSql, 'sql')}
                      className="text-xs text-[#B0B0B0] hover:text-white flex items-center space-x-1 bg-[#2C2C2C] px-2 py-1 rounded border border-[#3E3E3E]"
                    >
                      {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-[#0E7A36]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'sql' ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="mt-3 p-3 bg-[#121212] rounded text-xs font-mono text-[#76D69D] overflow-x-auto border border-[#2C2C2C]">
                    {activeSession.generatedSql}
                  </pre>
                </div>

                {/* 1-Click Operational Deployment Card */}
                <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs">
                  <h4 className="text-xs font-bold text-[#2C2C2C] mb-3">1-Click Operational Activation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Deploy to Audience */}
                    <button
                      onClick={() => handleDeployToAudience(activeSession)}
                      className={`p-3 rounded border text-left transition-all flex flex-col justify-between ${
                        deployedAudienceId
                          ? 'bg-[#DEFBE6] border-[#A1ECC4] text-[#0E7A36]'
                          : 'bg-[#F2F4F7] hover:bg-[#F1E8FF] border-[#E1E5EA] hover:border-[#D0B3FF] text-[#2C2C2C]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Layers className="w-4 h-4 text-[#5C2B97]" />
                          {deployedAudienceId && <CheckCircle2 className="w-4 h-4 text-[#0E7A36]" />}
                        </div>
                        <p className="text-xs font-bold">Deploy to Streaming Engine</p>
                        <p className="text-[10px] text-[#1E2229] mt-0.5">Publish segment into real-time audience catalog</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#5C2B97] mt-2 flex items-center space-x-1">
                        <span>{deployedAudienceId ? 'Deployed ✓' : 'Commit Audience'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>

                    {/* Execute Zero-Copy */}
                    <button
                      onClick={() => {
                        executeZeroCopyPushdown('comp_snowflake_1');
                        addTerminalLog('success', 'AI_STUDIO', `Executed Zero-Copy pushdown query on Enterprise Data Warehouse.`);
                      }}
                      className="p-3 rounded border bg-[#F2F4F7] hover:bg-[#EBF3FC] border-[#E1E5EA] hover:border-[#C5DCFA] text-[#2C2C2C] text-left transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Database className="w-4 h-4 text-[#1473E6]" />
                        </div>
                        <p className="text-xs font-bold">Pushdown to Snowflake DW</p>
                        <p className="text-[10px] text-[#1E2229] mt-0.5">Direct query execution with 0 ingestion cost</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#1473E6] mt-2 flex items-center space-x-1">
                        <span>Execute Pushdown</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>

                    {/* Switch to Campaign Generator */}
                    <button
                      onClick={() => {
                        setCampaignTargetAudience(activeSession.generatedAudienceName);
                        setActiveSubTab('campaign_gen');
                      }}
                      className="p-3 rounded border bg-[#F2F4F7] hover:bg-[#FFF0D4] border-[#E1E5EA] hover:border-[#FFD085] text-[#2C2C2C] text-left transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Sparkles className="w-4 h-4 text-[#C76A00]" />
                        </div>
                        <p className="text-xs font-bold">Generate AI Copy Variants</p>
                        <p className="text-[10px] text-[#1E2229] mt-0.5">Synthesize email/SMS campaign creatives</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#C76A00] mt-2 flex items-center space-x-1">
                        <span>Create Variants</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Autonomous Anomaly Agent & Self-Healing */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2C]">Continuous Drift & Integrity Sentinel</h3>
              <p className="text-xs text-[#1E2229] mt-0.5">
                Real-time autonomous agent monitoring payload schemas, identity stitching entropy, and destination match rates.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-[#1E2229]">
                <span className="w-2 h-2 rounded-full bg-[#0E7A36]" />
                <span>Engine: Active (60s SLA)</span>
              </span>
            </div>
          </div>

          {/* Anomaly Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom) => {
              const isHealed = anom.status === 'Auto-Healed';
              const isCritical = anom.severity === 'Critical';
              const isWarning = anom.severity === 'Warning';

              return (
                <div
                  key={anom.id}
                  className={`bg-[#FFFFFF] rounded border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                    isHealed
                      ? 'border-[#E1E5EA] opacity-80'
                      : isCritical
                      ? 'border-[#F88B8B] hover:shadow-xs'
                      : isWarning
                      ? 'border-[#FFD085] hover:shadow-xs'
                      : 'border-[#C5DCFA] hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isHealed
                                ? 'bg-[#DEFBE6] text-[#0E7A36] border-[#A1ECC4]'
                                : isCritical
                                ? 'bg-[#FDE6E8] text-[#D7373F] border-[#F88B8B]'
                                : isWarning
                                ? 'bg-[#FFF0D4] text-[#C76A00] border-[#FFD085]'
                                : 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]'
                            }`}
                          >
                            {isHealed ? 'Resolved / Auto-Healed' : anom.severity}
                          </span>
                          <span className="text-[10px] font-semibold text-[#1E2229]">{anom.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#2C2C2C] mt-1.5">{anom.title}</h4>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                        <span className="text-[10px] text-[#1E2229] font-semibold block">Impact & Affected Entity:</span>
                        <p className="text-[#2C2C2C] font-medium mt-0.5">{anom.affectedEntities}</p>
                        <p className="text-[#1E2229] font-mono text-[11px] mt-0.5">⚠️ {anom.impactMetric}</p>
                      </div>

                      <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                        <span className="text-[10px] text-[#1E2229] font-semibold block">Root Cause Analysis:</span>
                        <p className="text-[#1A1D23] mt-0.5">{anom.rootCause}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-[#E1E5EA] flex items-center justify-between">
                    <span className="text-[10px] text-[#1E2229]">
                      {isHealed && anom.resolutionTimestamp
                        ? `Healed at ${new Date(anom.resolutionTimestamp).toLocaleTimeString()}`
                        : `Detected: ${new Date(anom.detectedAt).toLocaleTimeString()}`}
                    </span>

                    {!isHealed ? (
                      <button
                        onClick={() => autoHealAnomaly(anom.id)}
                        className="bg-[#0E7A36] hover:bg-[#095E28] text-white text-xs font-bold px-3 py-1.5 rounded shadow-2xs transition-all flex items-center space-x-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Self-Heal & Deploy Fix</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#0E7A36] flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Remediation Live</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Generative Campaign Experiment Synthesizer */}
      {activeSubTab === 'campaign_gen' && (
        <div className="space-y-6">
          {/* Configuration Card */}
          <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#5C2B97]" />
              <h3 className="text-sm font-bold text-[#2C2C2C]">Predictive Campaign Variant Generator</h3>
            </div>
            <p className="text-xs text-[#1E2229] mb-4">
              Synthesize multi-variant personalized copy tailored to audience traits, predicting uplift metrics using propensity neural scoring.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1D23] mb-1">Target Segment</label>
                <input
                  type="text"
                  value={campaignTargetAudience}
                  onChange={(e) => setCampaignTargetAudience(e.target.value)}
                  className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D23] mb-1">Campaign Objective</label>
                <input
                  type="text"
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value)}
                  className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerateCampaigns}
                disabled={isGeneratingCampaign}
                className="bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold px-3.5 py-1.5 rounded shadow-2xs transition-all flex items-center space-x-1.5"
              >
                {isGeneratingCampaign ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Creatives...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Experiment Variants</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Variants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaignVariants.map((variant) => (
              <div
                key={variant.id}
                className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1473E6] hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#5C2B97]">{variant.label}</span>
                    <span className="text-[10px] bg-[#F2F4F7] border border-[#E1E5EA] text-[#1A1D23] font-bold px-2 py-0.5 rounded">
                      {variant.recommendedChannel}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                      <span className="text-[10px] text-[#1E2229] font-semibold block">Subject / Hook:</span>
                      <p className="text-[#2C2C2C] font-medium mt-0.5">{variant.subjectLine}</p>
                    </div>

                    <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                      <span className="text-[10px] text-[#1E2229] font-semibold block">Body Narrative:</span>
                      <p className="text-[#1A1D23] mt-0.5 leading-relaxed">{variant.messageHook}</p>
                    </div>

                    <div className="bg-[#F1E8FF] p-2.5 rounded border border-[#D0B3FF]">
                      <span className="text-[10px] text-[#5C2B97] font-semibold block">Primary CTA:</span>
                      <p className="text-[#5C2B97] font-bold mt-0.5">{variant.callToAction}</p>
                    </div>
                  </div>
                </div>

                {/* Uplift Predictions */}
                <div className="mt-4 pt-3 border-t border-[#E1E5EA]">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-[#1E2229] block font-medium">Open Rate</span>
                      <span className="font-bold text-[#2C2C2C] font-mono">{variant.predictedOpenRate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#1E2229] block font-medium">Conv. Rate</span>
                      <span className="font-bold text-[#2C2C2C] font-mono">{variant.predictedConversionRate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#0E7A36] block font-bold">Uplift</span>
                      <span className="font-bold text-[#0E7A36] font-mono">{variant.predictedUplift}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addTerminalLog('success', 'GEN_CAMPAIGN_AI', `Dispatched variant "${variant.label}" to Journey Flow Engine`);
                      setActiveTab('journeys');
                    }}
                    className="w-full mt-3 bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white text-xs font-bold py-2 rounded transition-all flex items-center justify-center space-x-1 shadow-2xs"
                  >
                    <span>Deploy to Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
