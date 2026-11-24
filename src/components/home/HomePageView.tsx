import React from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Database,
  Plug,
  Users,
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Radio,
  Layers,
  GitMerge,
  Code,
  Calculator,
  Zap,
  Server,
  Building2,
  FileCheck,
  FileText,
  Bot,
  GitFork,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Activity,
  Play,
  Split,
  Award
} from 'lucide-react';

export const HomePageView: React.FC = () => {
  const {
    setActiveTab,
    systemMetrics,
    schemas,
    audiences,
    destinations,
    ingestionSources,
    auditLogs,
    profiles,
    isDemoMode,
    toggleDemoMode
  } = useCDP();

  const primaryModules = [
    {
      id: 'hub_data_management',
      title: 'Data Management',
      icon: <Database className="w-6 h-6 text-white" />,
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'hover:border-blue-500',
      badge: `${schemas.length} Schemas`,
      description: 'Standardized XDM schemas, real-time streaming ingestion pipelines, and federated zero-copy warehouse queries.',
      apps: ['Schemas (XDM)', 'Data Ingestion & Streams', 'Federated Zero-Copy', 'Datasets & Batches']
    },
    {
      id: 'hub_connections',
      title: 'Connections',
      icon: <Plug className="w-6 h-6 text-white" />,
      color: 'from-teal-600 to-emerald-600',
      borderColor: 'hover:border-teal-500',
      badge: `${(ingestionSources?.length || 0) + (destinations?.length || 0)} Connectors`,
      description: 'Catalog of 20+ inbound data sources and outbound ad, marketing, and cloud storage destinations.',
      apps: ['Inbound Sources', 'Outbound Destinations', 'Edge Simulator', 'Active Dataflows']
    },
    {
      id: 'hub_customers',
      title: 'Customers',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'from-indigo-600 to-purple-600',
      borderColor: 'hover:border-indigo-500',
      badge: `${systemMetrics.totalProfiles.toLocaleString()} Profiles`,
      description: 'Unified 360 customer profiles, visual audience segmentation, cross-device identity graphs, and B2B accounts.',
      apps: ['Customer 360 Profiles', 'Audiences & Segments', 'Identity Graph', 'B2B Accounts & Buying Groups']
    },
    {
      id: 'hub_data_science',
      title: 'Data Science & Query',
      icon: <Cpu className="w-6 h-6 text-white" />,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'hover:border-amber-500',
      badge: 'SQL & ML Studio',
      description: 'Interactive SQL analytics with Data Distiller, computed rolling event attributes, Sensei AI ML models, and sub-50ms edge offers.',
      apps: ['Data Distiller (SQL)', 'Calculated Attributes', 'Sensei AI & Clean Room', 'Edge Personalization']
    },
    {
      id: 'hub_governance',
      title: 'Privacy & Governance',
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      color: 'from-emerald-600 to-green-700',
      borderColor: 'hover:border-emerald-500',
      badge: 'DULE Active',
      description: 'Data Usage Labeling & Enforcement (DULE), automated consumer GDPR/CCPA DSAR rights, and immutable audit logs.',
      apps: ['DULE Governance Policies', 'Privacy Rights & DSAR', 'Audit Trail & Compliance Logs']
    },
    {
      id: 'hub_intelligence',
      title: 'Intelligence Services',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      color: 'from-purple-600 to-pink-600',
      borderColor: 'hover:border-purple-500',
      badge: 'GenAI & Journeys',
      description: 'Autonomous AI Copilot for natural language CDP workflows, multi-channel journey canvases, and predictive propensity ML.',
      apps: ['Autonomous AI Copilot', 'Journey Canvas', 'Predictive Propensity & Churn']
    }
  ];

  const quickActions = [
    { label: 'Bring in New Dataset', tab: 'create_dataset', icon: <Database className="w-4 h-4 text-emerald-200" /> },
    { label: 'XLR8 AI Support', tab: 'ai_support', icon: <Bot className="w-4 h-4 text-sky-200" /> },
    { label: 'Create XDM Schema', tab: 'schemas', icon: <Database className="w-4 h-4 text-cyan-200" /> },
    { label: 'Ingest Live Events', tab: 'ingestion', icon: <Radio className="w-4 h-4 text-emerald-200" /> },
    { label: 'Build Audience Segment', tab: 'audiences', icon: <Layers className="w-4 h-4 text-indigo-200" /> },
    { label: 'Configure Destination', tab: 'destinations', icon: <ArrowUpFromLine className="w-4 h-4 text-teal-200" /> },
    { label: 'Run Distiller SQL', tab: 'data_distiller', icon: <Code className="w-4 h-4 text-amber-200" /> },
    { label: 'Inspect Identity Graph', tab: 'identities', icon: <GitMerge className="w-4 h-4 text-fuchsia-200" /> },
    { label: 'Venn Overlap Explorer', tab: 'audience_overlap', icon: <Split className="w-4 h-4 text-purple-200" /> },
    { label: 'Live XDM Tester', tab: 'xdm_tester', icon: <Zap className="w-4 h-4 text-amber-200" /> },
    { label: 'Why Choose XLR8?', tab: 'why_excelr8', icon: <Award className="w-4 h-4 text-amber-300" /> }
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F8F9FA] text-[#2C2C2C] select-none" id="home-view-root">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Welcome Executive Header */}
        <div className="bg-gradient-to-br from-[#0B2E58] via-[#0E4988] to-[#1473E6] rounded-2xl border border-[#2B73C4]/40 p-8 shadow-md relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 pointer-events-none rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#3889EB]/20 pointer-events-none rounded-full blur-3xl" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white border border-white/25 backdrop-blur-xs">
                  XLR8 Realtime CDP
                </span>
                <span className="flex items-center space-x-1.5 text-xs text-emerald-200 font-semibold bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Real-Time Edge Active</span>
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Welcome to XLR8 Realtime CDP
              </h1>
              <p className="text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
                Enterprise Real-Time Customer Data & Touchpoint Platform unifying multi-channel customer data into real-time 360 profiles with DULE governance and instant edge activation.
              </p>
            </div>

            {/* Live Metrics Pill Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 shadow-xs">
              <div className="px-3 py-1 text-left">
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider block">Ingestion Rate</span>
                <span className="text-sm font-bold text-cyan-200 font-mono">
                  {systemMetrics.ratePerSec.toLocaleString()} evt/s
                </span>
              </div>
              <div className="px-3 py-1 text-left border-l border-white/15">
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider block">Unified Profiles</span>
                <span className="text-sm font-bold text-white font-mono">
                  {systemMetrics.totalProfiles.toLocaleString()}
                </span>
              </div>
              <div className="px-3 py-1 text-left border-l border-white/15">
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider block">Active Audiences</span>
                <span className="text-sm font-bold text-white font-mono">
                  {audiences.length}
                </span>
              </div>
              <div className="px-3 py-1 text-left border-l border-white/15">
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider block">Governance</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  {profiles.length > 0 ? '100% Validated' : 'DULE Ready'}
                </span>
              </div>
            </div>
          </div>

          {profiles.length === 0 && !isDemoMode && (
            <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs relative z-10">
              <span className="text-blue-100">
                <strong className="text-white">Clean Account Workspace:</strong> No demo data loaded. Start by uploading customer data, building a schema, or creating an audience segment.
              </span>
              <button
                onClick={toggleDemoMode}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
              >
                Enable Demo Data
              </button>
            </div>
          )}

          {/* 1-Click Quick Actions */}
          <div className="mt-6 pt-6 border-t border-white/15 relative z-10">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block mb-3">
              Quick Actions
            </span>
            <div className="flex flex-wrap gap-2.5">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab(action.tab)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/12 hover:bg-white/22 border border-white/20 hover:border-white/40 text-xs font-semibold text-white shadow-xs backdrop-blur-xs transition-all cursor-pointer"
                >
                  {action.icon}
                  <span className="text-white">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* XLR8 AI Support Troubleshooting Spotlight Card */}
        <div 
          onClick={() => setActiveTab('ai_support')}
          className="bg-gradient-to-r from-[#1473E6]/10 via-[#0D66D0]/5 to-transparent border border-[#1473E6]/30 hover:border-[#1473E6] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1473E6] to-[#084A9E] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="font-bold text-sm text-[#1E1E1E]">XLR8 AI Support</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#DEFBE6] text-[#0E7A36] px-2 py-0.5 rounded-full border border-[#B4F0C3]">
                  Screenshot & Multimodal Ready
                </span>
              </div>
              <p className="text-xs text-[#1E2229] max-w-2xl leading-relaxed">
                Troubleshoot any platform issue or error in seconds: take a screenshot, press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#D5D5D5] rounded shadow-2xs">Ctrl+V</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#D5D5D5] rounded shadow-2xs">⌘+V</kbd> in the chatbot, and ask your query just like on ChatGPT.
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('ai_support');
            }}
            className="px-4 py-2 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold shadow-xs flex items-center space-x-2 shrink-0 group-hover:translate-x-0.5 transition-all cursor-pointer"
          >
            <span>Open XLR8 AI Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Why Choose XLR8 Spotlight Card */}
        <div 
          onClick={() => setActiveTab('why_excelr8')}
          className="bg-gradient-to-r from-[#7B2CBF]/10 via-[#1473E6]/5 to-transparent border border-[#7B2CBF]/30 hover:border-[#7B2CBF] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B2CBF] to-[#1473E6] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="font-bold text-sm text-[#1E1E1E]">Why Choose XLR8 Realtime CDP?</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F2EBF9] text-[#7B2CBF] px-2 py-0.5 rounded-full border border-[#E1D0F5]">
                  Adobe RT-CDP Comparison Matrix
                </span>
              </div>
              <p className="text-xs text-[#1E2229] max-w-2xl leading-relaxed">
                Explore our side-by-side evaluation matrix proving 100% architectural parity with Adobe's XDM and DULE standards, paired with interactive collision simulation, live edge QA, and 1-click anti-fatigue Venn deduplication.
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('why_excelr8');
            }}
            className="px-4 py-2 rounded-xl bg-[#7B2CBF] hover:bg-[#6A1EB0] text-white text-xs font-semibold shadow-xs flex items-center space-x-2 shrink-0 group-hover:translate-x-0.5 transition-all cursor-pointer"
          >
            <span>Explore Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Platform Modules App Launcher Section */}
        <div>
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-5 py-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Platform Modules</h2>
              <p className="text-xs text-blue-100">
                Select a main domain to view all its dedicated tools in an app drawer format.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>View System Overview & Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Core Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {primaryModules.map(module => (
              <div
                key={module.id}
                onClick={() => setActiveTab(module.id)}
                className={`bg-white rounded-2xl border border-[#E1E5EA] ${module.borderColor} p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      {module.icon}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F2F4F7] text-[#1A1D23] border border-[#E1E5EA]">
                      {module.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1E1E1E] group-hover:text-[#1473E6] transition-colors mb-1.5 flex items-center space-x-1.5">
                    <span>{module.title}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#1473E6]" />
                  </h3>

                  <p className="text-xs text-[#1E2229] leading-relaxed mb-4 line-clamp-2">
                    {module.description}
                  </p>
                </div>

                {/* Sub-item Chips */}
                <div className="pt-4 border-t border-[#F2F4F7]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#262A33] block mb-2">
                    Included Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {module.apps.map(app => (
                      <span
                        key={app}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#F8F9FA] text-[#1A1D23] border border-[#E8ECEF] font-medium"
                      >
                        {app}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#1473E6]">
                    <span>Open App Drawer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity & System Health Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#E1E5EA] p-6 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2C2C2C]">
              <Activity className="w-4 h-4 text-[#1473E6]" />
              <span>Real-Time Ingestion Engine</span>
            </div>
            <p className="text-xs text-[#1E2229]">
              Kafka-compatible streaming gateway accepting Edge Network Web SDK, POS terminals, and REST API events.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#0E7A36] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Event Loss (At-least-once)</span>
              </span>
              <button
                onClick={() => setActiveTab('ingestion')}
                className="text-[#1473E6] font-semibold hover:underline"
              >
                Inspect Stream →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E1E5EA] p-6 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2C2C2C]">
              <ShieldCheck className="w-4 h-4 text-[#0E7A36]" />
              <span>DULE Privacy Gateways</span>
            </div>
            <p className="text-xs text-[#1E2229]">
              Continuous policy enforcement ensures non-consented profiles and sensitive attributes are blocked from advertising egress.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#0E7A36] font-semibold">
                {destinations.length > 0
                  ? `${destinations.filter(d => d.privacyPolicyCompliant).length}/${destinations.length} Destinations Compliant`
                  : 'C/I/S/R Gateways Ready'}
              </span>
              <button
                onClick={() => setActiveTab('governance')}
                className="text-[#1473E6] font-semibold hover:underline"
              >
                View Rules →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E1E5EA] p-6 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2C2C2C]">
              <Sparkles className="w-4 h-4 text-[#7B2CBF]" />
              <span>Sensei Autonomous AI</span>
            </div>
            <p className="text-xs text-[#1E2229]">
              Continuous identity stitching, churn risk score calculation, and natural language query generation.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#7B2CBF] font-semibold">Models Ready</span>
              <button
                onClick={() => setActiveTab('agentic_studio')}
                className="text-[#1473E6] font-semibold hover:underline"
              >
                Launch Copilot →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
