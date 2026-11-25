import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Zap,
  Split,
  GitMerge,
  Layers,
  Database,
  ShieldCheck,
  Server,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Building2,
  Cpu,
  Clock,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
  BarChart3,
  Flame,
  FileCheck2,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Info,
  X,
  Play,
  RotateCcw,
  Sliders,
  CheckCheck,
  ArrowUpRight,
  Terminal,
  Activity,
  Compass,
  FileText
} from 'lucide-react';

interface ComparisonItem {
  id: string;
  category: 'architecture' | 'identity' | 'ingestion' | 'segmentation' | 'governance' | 'infrastructure';
  categoryLabel: string;
  capability: string;
  subtitle: string;
  adobeRTCDP: {
    title: string;
    details: string;
    badge: string;
    limitation?: string;
  };
  xlr8CDP: {
    title: string;
    details: string;
    badge: string;
    advantageKey: string;
    actionTab?: string;
    actionLabel?: string;
  };
  metricBenchmark: {
    label: string;
    adobeVal: string;
    xlr8Val: string;
    deltaNote: string;
  };
  verdict: string;
  verdictDetail: string;
}

const COMPARISON_DATA: ComparisonItem[] = [
  {
    id: 'xdm_schema',
    category: 'architecture',
    categoryLabel: 'Architecture & XDM',
    capability: 'Experience Data Model (XDM)',
    subtitle: 'Standardized schema representation for unified customer context',
    adobeRTCDP: {
      title: 'Canonical XDM Registry',
      details: 'Strict schema registry with Profile and ExperienceEvent classes. Rigid UI wizard requiring multi-step mixin binding and schema locks.',
      badge: 'Enterprise Standard',
      limitation: 'Complex mixin navigation and slow schema propagation across sandboxes.'
    },
    xlr8CDP: {
      title: 'Canonical XDM + Guided Studio',
      details: '100% spec parity with Adobe XDM schemas with visual field-group editor, zero-friction blueprint generator, and instant validation.',
      badge: '100% Spec Parity',
      advantageKey: 'Zero-friction schema composition with instant live validation',
      actionTab: 'schemas',
      actionLabel: 'Inspect Schemas'
    },
    metricBenchmark: {
      label: 'Spec Compatibility',
      adobeVal: '100%',
      xlr8Val: '100%',
      deltaNote: 'Full parity with Adobe XDM Profile & Event schemas'
    },
    verdict: 'Full Architectural Parity',
    verdictDetail: 'Compatible with existing Adobe XDM schemas with zero migration friction or schema rework.'
  },
  {
    id: 'identity_collisions',
    category: 'identity',
    categoryLabel: 'Identity & Graph',
    capability: 'Identity Resolution & Collision Simulation',
    subtitle: 'Deterministic and probabilistic identity link governance across shared devices',
    adobeRTCDP: {
      title: 'Backend-Only Graph DB',
      details: 'Resolves identities in Cosmos/Foundation DB. When shared devices collide, links are partitioned or dropped based on arbitrary node limits.',
      badge: 'Opaque Backend Logic',
      limitation: 'No visual inspection of collision boundaries; splits must be debugged after anomalies occur.'
    },
    xlr8CDP: {
      title: 'Interactive Node-Link + Collision Simulator',
      details: 'Visual graph with confidence scores (1.0 deterministic vs <1.0 probabilistic) plus real-time Collision Simulator testing 4 split/merge policies.',
      badge: 'Visual & Auditable',
      advantageKey: 'Pre-flight collision simulation with 4 automated resolution policies',
      actionTab: 'identities',
      actionLabel: 'Test Collision Simulator'
    },
    metricBenchmark: {
      label: 'Collision Observability',
      adobeVal: 'Black Box',
      xlr8Val: 'Visual Interactive',
      deltaNote: 'Simulate household device splits before pushing to production'
    },
    verdict: 'XLR8 Explainability Advantage',
    verdictDetail: 'Data teams can simulate and audit shared-device graph splits before deploying to production.'
  },
  {
    id: 'live_ingestion',
    category: 'ingestion',
    categoryLabel: 'Ingestion & Edge',
    capability: 'Event Ingestion QA & Sub-5ms Edge Tracing',
    subtitle: 'Validating streaming payload schemas and profile trait updates',
    adobeRTCDP: {
      title: 'External Debugging Tools Required',
      details: 'Engineers must configure Adobe Assurance (Project Griffon) or Charles Proxy to inspect payload arrival, header transforms, and edge propagation.',
      badge: 'External Tooling Required',
      limitation: 'Requires installing browser extensions, certificates, and proxy routing.'
    },
    xlr8CDP: {
      title: 'Built-in Live XDM Tester & Edge Simulator',
      details: 'Self-contained playground with pre-built event JSON, persona auto-injector, sub-5ms step trace, and real-time segment qualification pulses.',
      badge: 'In-App Developer Sandbox',
      advantageKey: 'Sub-5ms edge latency with microsecond step-by-step trace inspection',
      actionTab: 'xdm_tester',
      actionLabel: 'Launch Ingestion Tester'
    },
    metricBenchmark: {
      label: 'Payload Verification Time',
      adobeVal: '~5 - 15 mins',
      xlr8Val: '< 5 ms',
      deltaNote: 'Immediate in-app validation without external proxies'
    },
    verdict: '10x Faster Ingestion QA',
    verdictDetail: 'Test any event payload and observe instant profile updates in <5ms without leaving the browser.'
  },
  {
    id: 'audience_overlap',
    category: 'segmentation',
    categoryLabel: 'Audiences & Venn',
    capability: 'Audience Overlap & Anti-Fatigue Venn Engine',
    subtitle: 'Deduplicating cross-channel reach and preventing campaign ad fatigue',
    adobeRTCDP: {
      title: 'Static 2-Way Overlap Metrics',
      details: 'Displays high-level 2-way percentage overlap in Segment Insights. Deduplicating audiences requires manually drafting complex exclusionary PQL rules.',
      badge: 'Static Percentages',
      limitation: 'No visual interactive Venn diagram; exclusions must be coded manually.'
    },
    xlr8CDP: {
      title: 'Interactive 2/3-Way Venn + 1-Click Exclusion',
      details: 'Interactive SVG Venn visualizer with clickable intersection regions, campaign fatigue risk scoring, and 1-click anti-fatigue exclusionary segment creation.',
      badge: 'Interactive & Actionable',
      advantageKey: 'Click any overlapping segment slice to generate a clean, mutually exclusive cohort',
      actionTab: 'audience_overlap',
      actionLabel: 'Open Venn Explorer'
    },
    metricBenchmark: {
      label: 'Overlap Exploration',
      adobeVal: '2-Way Static',
      xlr8Val: '2 & 3-Way Venn',
      deltaNote: 'Interactive SVG with instant 1-click exclusionary audience creation'
    },
    verdict: 'Zero Campaign Fatigue',
    verdictDetail: 'Click any overlapping slice and generate a clean, mutually exclusive cohort with one click.'
  },
  {
    id: 'dule_governance',
    category: 'governance',
    categoryLabel: 'DULE Governance',
    capability: 'Data Usage Labeling & Enforcement (DULE)',
    subtitle: 'Policy-based data classification and destination enforcement',
    adobeRTCDP: {
      title: 'Adobe DULE Framework',
      details: 'Industry standard for data governance: Contractual (C), Identity (I), Sensitive (S), and Regulatory (R) labels blocking prohibited destinations.',
      badge: 'Industry Standard',
      limitation: 'Policy violation errors are surfaced as cryptic job failure codes in destination syncs.'
    },
    xlr8CDP: {
      title: 'Complete DULE Parity + Visual Enforcement',
      details: 'Faithfully implements the complete C1-C12, I1-I2, S1-S3, R1-R3 taxonomy with automated destination masking (SHA-256) and live visual policy gates.',
      badge: '100% DULE Compliant',
      advantageKey: 'Full C/I/S/R taxonomy with automated SHA-256 masking and live policy gates',
      actionTab: 'governance',
      actionLabel: 'View DULE Engine'
    },
    metricBenchmark: {
      label: 'Taxonomy Adherence',
      adobeVal: '100%',
      xlr8Val: '100%',
      deltaNote: 'Exact mapping of C1-C12, I1-I2, S1-S3, and R1-R3 labels'
    },
    verdict: 'Enterprise Governance Parity',
    verdictDetail: 'Ensures strict GDPR Art. 15/17 compliance, CCPA/CPRA consent gating, and HIPAA isolation.'
  },
  {
    id: 'zero_copy_mesh',
    category: 'infrastructure',
    categoryLabel: 'Zero-Copy Mesh',
    capability: 'Federated Zero-Copy Data Mesh',
    subtitle: 'Direct pushdown SQL activation across cloud data warehouses',
    adobeRTCDP: {
      title: 'Federated Audience Composition (Add-on)',
      details: 'Enterprise add-on enabling pushdown queries to cloud data warehouses. Requires complex integration and additional licensing tiers.',
      badge: 'Tiered Add-on',
      limitation: 'High incremental licensing tier cost and separate setup workflow.'
    },
    xlr8CDP: {
      title: 'Native Zero-Copy Mesh across 3 Warehouses',
      details: 'Native pushdown query execution directly into Snowflake, Google BigQuery, and Databricks without duplicating or copying warehouse storage.',
      badge: '99.8% Cost Savings',
      advantageKey: 'Native warehouse pushdown across Snowflake, BigQuery, and Databricks',
      actionTab: 'federated_composition',
      actionLabel: 'Explore Data Mesh'
    },
    metricBenchmark: {
      label: 'Data Duplication',
      adobeVal: 'Full Replication',
      xlr8Val: '0% Copy (Pushdown)',
      deltaNote: 'Eliminates redundant egress and secondary warehouse storage costs'
    },
    verdict: 'Radical Cost Efficiency',
    verdictDetail: 'Query massive enterprise warehouse tables without paying double ingestion or storage costs.'
  },
  {
    id: 'time_to_value',
    category: 'architecture',
    categoryLabel: 'Architecture & XDM',
    capability: 'Time-to-Value & Operational Velocity',
    subtitle: 'Speed of deployment, sandbox provisioning, and team enablement',
    adobeRTCDP: {
      title: 'Multi-Month Implementation Cycles',
      details: 'Typically requires specialized certified system integrators, heavy professional services, and lengthy onboarding across distributed teams.',
      badge: '3 - 9 Months Onboarding',
      limitation: 'Requires specialized certification and prolonged consulting engagements.'
    },
    xlr8CDP: {
      title: 'Hours-to-Days Deployment & Live Sandboxes',
      details: 'Immediate sandbox environments with realistic enterprise personas, pre-built connectors, and interactive simulators for rapid stakeholder signoff.',
      badge: 'Rapid Time-to-Value',
      advantageKey: 'Immediate sandbox deployment with interactive simulators for rapid signoff',
      actionTab: 'home',
      actionLabel: 'Platform Home'
    },
    metricBenchmark: {
      label: 'Initial Deployment',
      adobeVal: '90 - 270 Days',
      xlr8Val: '< 14 Days',
      deltaNote: 'Immediate stakeholder demos with built-in realistic demo sandboxes'
    },
    verdict: 'Rapid Stakeholder Alignment',
    verdictDetail: 'Demonstrate real-time segmentation and edge activation to executive teams on day one.'
  }
];

const RFP_TEMPLATES = [
  {
    id: 'exec',
    label: 'Board & C-Suite Summary',
    content: 'Executive Recommendation: XLR8 Realtime CDP provides 100% architectural parity with Adobe Real-Time CDP standards (canonical XDM schemas and full DULE C/I/S/R governance), while eliminating vendor lock-in. Crucially, XLR8 delivers a federated zero-copy data mesh that reduces warehouse egress and duplicated storage by 99.8%, with sub-5ms edge pipeline latency for real-time customer activation.'
  },
  {
    id: 'arch',
    label: 'Enterprise Architecture & Security',
    content: 'Technical Architecture Assessment: XLR8 Realtime CDP matches Adobe Experience Platform across core XDM schema classes (Profile, ExperienceEvent, and Tenant Mixins). For privacy governance, XLR8 enforces the complete Adobe DULE taxonomy with automated destination masking (SHA-256) and consent gating. Additionally, XLR8 provides an interactive Identity Collision Simulator that allows engineering to audit shared-device graph splits prior to production deployment.'
  },
  {
    id: 'growth',
    label: 'Marketing & Campaign ROI',
    content: 'Marketing Operations ROI: XLR8 Realtime CDP provides an Anti-Fatigue Venn Engine with 2-way and 3-way interactive overlap visualization. Unlike traditional static overlap percentage reports, marketing managers can click any intersection slice and generate mutually exclusive exclusionary audiences in one click, preventing ad fatigue and reducing wasted paid media spend.'
  },
  {
    id: 'data_eng',
    label: 'Data Engineering & FinOps',
    content: 'Data Engineering & FinOps Evaluation: XLR8 Realtime CDP includes a self-contained Live XDM Tester that validates streaming payloads in <5ms without requiring external Charles Proxy or Assurance setups. Furthermore, native federated pushdown execution into Snowflake, BigQuery, and Databricks avoids moving multi-terabyte datasets, delivering immediate FinOps savings.'
  }
];

export const WhyChooseExcelR8View: React.FC = () => {
  const { setActiveTab } = useCDP();

  // Active showcase simulator state
  const [activeShowcase, setActiveShowcase] = useState<'collision' | 'ingestion' | 'venn' | 'mesh'>('collision');
  const [collisionPolicy, setCollisionPolicy] = useState<'split' | 'latest' | 'deterministic'>('split');
  const [simulatedIngestStep, setSimulatedIngestStep] = useState<number>(0);
  const [isSimulatingIngest, setIsSimulatingIngest] = useState(false);
  const [vennHoverRegion, setVennHoverRegion] = useState<'A' | 'B' | 'AB'>('AB');

  // Page layout & filtering state
  const [viewMode, setViewMode] = useState<'visual' | 'matrix'>('visual');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('exec');
  const [executiveNotes, setExecutiveNotes] = useState<string>(RFP_TEMPLATES[0].content);

  const filteredItems = useMemo(() => {
    return COMPARISON_DATA.filter(item => {
      const matchesCategory = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.capability.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.adobeRTCDP.title.toLowerCase().includes(q) ||
        item.xlr8CDP.title.toLowerCase().includes(q) ||
        item.verdict.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategoryFilter, searchQuery]);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(executiveNotes);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    const found = RFP_TEMPLATES.find(p => p.id === presetId);
    if (found) {
      setExecutiveNotes(found.content);
    }
  };

  const handleTriggerSimulatedIngest = () => {
    if (isSimulatingIngest) return;
    setIsSimulatingIngest(true);
    setSimulatedIngestStep(1);

    setTimeout(() => setSimulatedIngestStep(2), 250);
    setTimeout(() => setSimulatedIngestStep(3), 500);
    setTimeout(() => setSimulatedIngestStep(4), 750);
    setTimeout(() => {
      setIsSimulatingIngest(false);
    }, 1200);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8F9FB] text-[#1E2229] select-none" id="why-choose-xlr8-root">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

        {/* 1. HERO BANNER: Sleek Flagship Dark Canvas with Mesh & Subtle Ambient Radiance */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#090D16] via-[#0E1526] to-[#181E38] border border-slate-800 shadow-2xl p-7 sm:p-10 text-white overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute -right-20 -top-20 w-[420px] h-[420px] bg-[#1473E6]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute left-1/4 -bottom-28 w-96 h-96 bg-[#0EA5E9]/20 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute right-1/3 top-1/2 w-64 h-64 bg-[#38BDF8]/15 rounded-full blur-[90px] pointer-events-none" />

          {/* Technical Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"
          />

          <div className="relative z-10 space-y-8">
            {/* Top Bar Navigation Zone */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="flex items-center space-x-3">
                <PageBackButton fallbackTab="home" fallbackLabel="Home" className="text-white bg-white/10 hover:bg-white/20 border-white/20 shadow-xs" />
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="font-semibold text-white">XLR8 Realtime CDP</span>
                  <span aria-hidden="true" className="text-slate-600">/</span>
                  <span className="text-slate-400">Competitive Architecture Dossier</span>
                  <span aria-hidden="true" className="text-slate-600">/</span>
                  <span className="text-sky-300 font-medium inline-flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
                    <span>100% Adobe Parity</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('xdm_tester')}
                  className="px-4 py-2 bg-gradient-to-r from-[#1473E6] to-[#0D66D0] hover:from-[#1982fc] hover:to-[#1070e3] text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center space-x-2 active:scale-98 cursor-pointer border border-blue-400/30"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-300 fill-sky-300" />
                  <span>Launch Live XDM Tester</span>
                </button>
              </div>
            </div>

            {/* Main Headline & Context */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 tracking-wide">
                  <Award className="w-4 h-4 text-sky-300" />
                  <span>Adobe Real-Time CDP (AEP) vs. XLR8 Realtime CDP</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  Enterprise Parity.<br />
                  <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Without The Black Boxes.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed pt-1">
                  XLR8 matches Adobe Real-Time CDP across canonical XDM schemas, DULE data governance, and PQL segmentation — while removing proxy friction with sub-5ms edge sandboxes, visual identity collision simulation, and zero-copy warehouse pushdown.
                </p>
              </div>

              {/* Hero Radar / Metrics Card */}
              <div className="lg:col-span-4 bg-slate-900/80 border border-slate-700/70 rounded-2xl p-5 backdrop-blur-md shadow-inner space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <span className="text-slate-400 font-medium">Evaluation Index</span>
                  <span className="text-emerald-400 font-mono font-bold">100% Certified</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Adobe XDM Spec Parity</span>
                      <span className="text-white font-mono font-semibold">100%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">DULE Governance Taxonomy</span>
                      <span className="text-white font-mono font-semibold">100%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Edge Pipeline Latency</span>
                      <span className="text-blue-400 font-mono font-semibold">&lt; 5 ms</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full w-[96%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Federated Warehouse Mesh</span>
                      <span className="text-purple-400 font-mono font-semibold">0% Duplicated</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full rounded-full w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Tab Selector Strip */}
            <div className="pt-2 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-800/80">
              <div 
                onClick={() => setActiveTab('schemas')}
                className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Standardization</span>
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-sm font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">
                  100% Canonical XDM
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Profile & Event spec parity</div>
              </div>

              <div 
                onClick={() => setActiveTab('identities')}
                className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Graph Governance</span>
                  <GitMerge className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-sm font-bold text-white mt-1 group-hover:text-sky-400 transition-colors">
                  Collision Simulator
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Auditable shared device splits</div>
              </div>

              <div 
                onClick={() => setActiveTab('xdm_tester')}
                className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Developer Velocity</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-sm font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors">
                  Sub-5ms Ingestion QA
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Zero external proxy setup</div>
              </div>

              <div 
                onClick={() => setActiveTab('audience_overlap')}
                className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Campaign Precision</span>
                  <Split className="w-3.5 h-3.5 text-blue-300" />
                </div>
                <div className="text-sm font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                  Anti-Fatigue Venn
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">1-click exclusionary segments</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE SIMULATOR STAGE: High-Impact Visual Demonstration */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 font-mono">
                  Interactive Architectural Stage
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Simulate XLR8 vs. Legacy CDP Mechanics Live
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Toggle through key capabilities below to experience XLR8's real-time visual observability.
              </p>
            </div>

            {/* Showcase Selector Tabs */}
            <div className="flex items-center bg-white/15 border border-white/25 p-1 rounded-xl gap-1 flex-wrap">
              <button
                onClick={() => setActiveShowcase('collision')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeShowcase === 'collision'
                    ? 'bg-white text-[#0D66D0] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <GitMerge className="w-3.5 h-3.5 shrink-0" />
                <span>Identity Collisions</span>
              </button>
              <button
                onClick={() => setActiveShowcase('ingestion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeShowcase === 'ingestion'
                    ? 'bg-white text-[#0D66D0] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>Live Ingestion Trace</span>
              </button>
              <button
                onClick={() => setActiveShowcase('venn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeShowcase === 'venn'
                    ? 'bg-white text-[#0D66D0] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Split className="w-3.5 h-3.5 shrink-0" />
                <span>Anti-Fatigue Venn</span>
              </button>
              <button
                onClick={() => setActiveShowcase('mesh')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeShowcase === 'mesh'
                    ? 'bg-white text-[#0D66D0] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Server className="w-3.5 h-3.5 shrink-0" />
                <span>Zero-Copy Mesh</span>
              </button>
            </div>
          </div>

          {/* SIMULATOR CANVAS CONTAINER */}
          <div className="p-6 md:p-8">
            {/* 1. COLLISION SIMULATOR */}
            {activeShowcase === 'collision' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 relative overflow-hidden space-y-5">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                    <span className="text-slate-400 font-mono">SCENARIO: Shared Living Room iPad Collision</span>
                    <span className="text-sky-400 font-mono font-semibold">Active Policy: {collisionPolicy.toUpperCase()}</span>
                  </div>

                  {/* Visual Node Diagram */}
                  <div className="relative h-48 flex items-center justify-between px-6">
                    {/* Node 1: Alice */}
                    <div className="text-center space-y-1 z-10">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-xs">Alice</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">alice@acme.com</span>
                      <span className="text-[10px] text-blue-400 font-semibold">Profile A</span>
                    </div>

                    {/* Shared Device Node (Center) */}
                    <div className="text-center space-y-1 z-10">
                      <div className="w-16 h-16 rounded-2xl bg-sky-600/30 border-2 border-sky-400 flex flex-col items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30 animate-pulse">
                        <Layers className="w-5 h-5 text-sky-300" />
                        <span className="text-[9px] font-bold mt-0.5">Family iPad</span>
                      </div>
                      <span className="text-[11px] text-sky-300 font-mono block">ECID: 99420-iPad</span>
                      <span className="text-[10px] text-blue-300 font-semibold">Shared Touchpoint</span>
                    </div>

                    {/* Node 2: Bob */}
                    <div className="text-center space-y-1 z-10">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
                        <span className="font-bold text-xs">Bob</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">bob@family.org</span>
                      <span className="text-[10px] text-cyan-400 font-semibold">Profile B</span>
                    </div>

                    {/* Dynamic Connecting Lines depending on Policy */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      {collisionPolicy === 'split' && (
                        <>
                          <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" />
                          <line x1="80%" y1="50%" x2="50%" y2="50%" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" />
                        </>
                      )}
                      {collisionPolicy === 'latest' && (
                        <>
                          <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" />
                          <line x1="80%" y1="50%" x2="50%" y2="50%" stroke="#10B981" strokeWidth="3" />
                        </>
                      )}
                      {collisionPolicy === 'deterministic' && (
                        <>
                          <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#3B82F6" strokeWidth="3" />
                          <line x1="80%" y1="50%" x2="50%" y2="50%" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" />
                        </>
                      )}
                    </svg>
                  </div>

                  {/* Policy Outcome Result Badge */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Governance Execution:</span>
                      <span className="text-white font-medium ml-1.5">
                        {collisionPolicy === 'split' && 'Quarantine Shared Device — Prevent cross-contamination of Alice & Bob profiles.'}
                        {collisionPolicy === 'latest' && 'Bind to Bob (Most Recent Ingestion Active) — Alice link safely retired.'}
                        {collisionPolicy === 'deterministic' && 'Strict Priority to Alice (CRM Verified ID) — Bob treated as unauthenticated.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#1D4ED8]">The XLR8 Advantage</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Visual Identity Governance vs. Silent DB Partitioning
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      In Adobe RT-CDP, graph collisions on shared household devices are handled implicitly inside Cosmos DB. In XLR8, you can test policies interactively and preview how identity links behave.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">Switch Policy Simulation:</span>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => setCollisionPolicy('split')}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          collisionPolicy === 'split'
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>1. Split Graph on Shared Collision (Recommended)</span>
                        {collisionPolicy === 'split' && <Check className="w-4 h-4 text-[#1473E6]" />}
                      </button>

                      <button
                        onClick={() => setCollisionPolicy('latest')}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          collisionPolicy === 'latest'
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>2. Most Recent Activity Wins</span>
                        {collisionPolicy === 'latest' && <Check className="w-4 h-4 text-[#1473E6]" />}
                      </button>

                      <button
                        onClick={() => setCollisionPolicy('deterministic')}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          collisionPolicy === 'deterministic'
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>3. Deterministic Identity Precedence (CRM Over Cookie)</span>
                        {collisionPolicy === 'deterministic' && <Check className="w-4 h-4 text-[#1473E6]" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('identities')}
                    className="w-full py-2.5 bg-gradient-to-r from-[#1473E6] to-[#0A3D82] hover:from-[#0D66D0] hover:to-[#082E63] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Launch Full Identity Collision Simulator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. LIVE INGESTION QA SIMULATOR */}
            {activeShowcase === 'ingestion' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                    <span className="text-slate-400 font-mono">LIVE PAYLOAD TRACE: &lt; 5ms REAL-TIME EDGE</span>
                    <span className="text-emerald-400 font-mono font-semibold">Total Duration: 3.8 ms</span>
                  </div>

                  {/* 4 Ingestion Pipeline Stages */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      simulatedIngestStep >= 1 ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-mono block">STEP 1</span>
                      <strong className="text-xs block mt-1">Edge Ingest</strong>
                      <span className="text-[10px] font-mono text-emerald-400">1.2 ms</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      simulatedIngestStep >= 2 ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-mono block">STEP 2</span>
                      <strong className="text-xs block mt-1">XDM Validate</strong>
                      <span className="text-[10px] font-mono text-emerald-400">0.8 ms</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      simulatedIngestStep >= 3 ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-mono block">STEP 3</span>
                      <strong className="text-xs block mt-1">Trait Update</strong>
                      <span className="text-[10px] font-mono text-emerald-400">1.1 ms</span>
                    </div>

                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      simulatedIngestStep >= 4 ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-mono block">STEP 4</span>
                      <strong className="text-xs block mt-1">Audience Qual</strong>
                      <span className="text-[10px] font-mono text-emerald-400">0.7 ms</span>
                    </div>
                  </div>

                  {/* Terminal Code Snippet */}
                  <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                    <div className="text-slate-500">// Simulated Event Payload arriving via streaming Webhook:</div>
                    <div className="text-emerald-400">
                      {`POST /api/v1/events/experience-event -> HTTP 200 OK`}
                    </div>
                    <div className="text-slate-400">
                      {`Profile `}<span className="text-blue-300">#usr-2894</span>{` qualified for `}<span className="text-purple-300">"Cart Abandoners - High Value"</span>{` in 3.8ms`}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-600">No Charles Proxy Needed</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Built-in Ingestion Sandbox vs. External Assurance Tools
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Adobe RT-CDP requires installing Charles Proxy, SSL root certificates, and Adobe Assurance (Project Griffon) to trace events. XLR8 includes a zero-config live tester directly in the platform.
                    </p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={handleTriggerSimulatedIngest}
                      disabled={isSimulatingIngest}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isSimulatingIngest ? 'Executing Trace Pipeline...' : 'Fire Live Sample Payload (Simulate)'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('xdm_tester')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>Open Live XDM Tester Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ANTI-FATIGUE VENN ENGINE */}
            {activeShowcase === 'venn' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 flex flex-col items-center justify-center relative space-y-4">
                  <div className="w-full flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-mono">INTERACTIVE 2-WAY AUDIENCE OVERLAP</span>
                    <span className="text-amber-400 font-mono font-semibold">Active Region: {vennHoverRegion}</span>
                  </div>

                  {/* SVG Venn Diagram */}
                  <div className="relative w-80 h-52 flex items-center justify-center">
                    <svg viewBox="0 0 320 200" className="w-full h-full">
                      {/* Circle A */}
                      <circle
                        cx="120"
                        cy="100"
                        r="75"
                        fill="#3B82F6"
                        fillOpacity={vennHoverRegion === 'A' ? "0.6" : "0.3"}
                        stroke="#60A5FA"
                        strokeWidth="2"
                        className="cursor-pointer transition-all"
                        onClick={() => setVennHoverRegion('A')}
                      />
                      {/* Circle B */}
                      <circle
                        cx="200"
                        cy="100"
                        r="75"
                        fill="#10B981"
                        fillOpacity={vennHoverRegion === 'B' ? "0.6" : "0.3"}
                        stroke="#34D399"
                        strokeWidth="2"
                        className="cursor-pointer transition-all"
                        onClick={() => setVennHoverRegion('B')}
                      />
                      {/* Center Intersection Trigger */}
                      <ellipse
                        cx="160"
                        cy="100"
                        rx="35"
                        ry="55"
                        fill="#F59E0B"
                        fillOpacity={vennHoverRegion === 'AB' ? "0.8" : "0.4"}
                        stroke="#FBBF24"
                        strokeWidth="2"
                        className="cursor-pointer transition-all"
                        onClick={() => setVennHoverRegion('AB')}
                      />

                      <text x="80" y="105" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">High Value</text>
                      <text x="80" y="120" fill="#93C5FD" fontSize="9" textAnchor="middle">14,200</text>

                      <text x="240" y="105" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">Recent App</text>
                      <text x="240" y="120" fill="#6EE7B7" fontSize="9" textAnchor="middle">18,500</text>

                      <text x="160" y="100" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Overlap</text>
                      <text x="160" y="115" fill="#FEF08A" fontSize="10" fontWeight="bold" textAnchor="middle">4,820</text>
                    </svg>
                  </div>

                  <div className="w-full p-2.5 bg-slate-800/80 rounded-xl text-xs text-center text-slate-300">
                    {vennHoverRegion === 'AB' && (
                      <span className="text-amber-300 font-semibold">
                        4,820 Shared Profiles (26.7% Overlap) — High Ad Fatigue Risk if both campaigns activate simultaneously.
                      </span>
                    )}
                    {vennHoverRegion === 'A' && 'Region A: 9,380 Unique High Value Customers (Excluding Recent App Users).'}
                    {vennHoverRegion === 'B' && 'Region B: 13,680 Unique Recent App Users (Excluding High Value Cohort).'}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-amber-600">Campaign Ad Fatigue Defense</span>
                    <h3 className="text-base font-bold text-slate-900">
                      1-Click Exclusion vs. Manual PQL Rule Coding
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Adobe RT-CDP provides static 2-way overlap percentages in Segment Insights, but building exclusions requires tedious manual PQL editing. XLR8 lets you click any Venn slice to generate clean exclusion segments.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setActiveTab('audience_overlap')}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Split className="w-4 h-4" />
                      <span>Open Interactive Venn Overlap Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ZERO-COPY MESH */}
            {activeShowcase === 'mesh' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                    <span className="text-slate-400 font-mono">PUSHDOWN QUERY FEDERATION</span>
                    <span className="text-blue-400 font-mono font-semibold">0 TB Ingestion Copy</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1">
                      <span className="text-[10px] text-blue-300 font-mono">SNOWFLAKE</span>
                      <strong className="text-xs block text-white">Direct Pushdown</strong>
                      <span className="text-[10px] text-emerald-400 font-mono">0 Egress Fee</span>
                    </div>

                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-1">
                      <span className="text-[10px] text-indigo-300 font-mono">BIGQUERY</span>
                      <strong className="text-xs block text-white">SQL Federated</strong>
                      <span className="text-[10px] text-emerald-400 font-mono">0 Duplicate</span>
                    </div>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-300 font-mono">DATABRICKS</span>
                      <strong className="text-xs block text-white">Unity Catalog</strong>
                      <span className="text-[10px] text-emerald-400 font-mono">Real-Time Sync</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 border border-slate-800">
                    <span className="text-blue-400">SELECT</span> customer_id, ltv_score, churn_risk<br />
                    <span className="text-blue-400">FROM</span> snowflake_prod.analytics.customer_features<br />
                    <span className="text-blue-400">WHERE</span> ltv_score &gt; 850; <span className="text-slate-500">-- Executed in-warehouse</span>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-blue-600">FinOps Architecture</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Native Zero-Copy Mesh vs. Tiered Add-on Licensing
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Adobe RT-CDP charges high add-on tiers for Federated Audience Composition. XLR8 provides native zero-copy warehouse pushdown out-of-the-box, saving up to 99.8% in data duplication costs.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('federated_composition')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Server className="w-4 h-4" />
                    <span>Explore Federated Data Mesh</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. HEAD-TO-HEAD FEATURE SHOWDOWN CARDS (Elegantly Designed Split Cards) */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-2xl border border-[#0E4DA4] px-6 py-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Architectural Breakdown: Adobe RT-CDP vs. XLR8 Realtime CDP
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Side-by-side technical evaluation across all 7 enterprise customer data platform domains.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/15 p-1 rounded-xl border border-white/25 shrink-0">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'visual'
                    ? 'bg-white text-[#0D66D0] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Showdown Cards</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white text-[#0D66D0] shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Parity Table</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Domains' },
                { id: 'architecture', label: 'Architecture & XDM' },
                { id: 'identity', label: 'Identity & Graph' },
                { id: 'ingestion', label: 'Ingestion & Edge' },
                { id: 'segmentation', label: 'Audiences & Venn' },
                { id: 'governance', label: 'DULE Governance' },
                { id: 'infrastructure', label: 'Zero-Copy Mesh' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    activeCategoryFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none w-56"
              />
            </div>
          </div>

          {/* VIEW MODE 1: VISUAL SHOWDOWN CARDS (Elevated, High-Contrast Split Cards) */}
          {viewMode === 'visual' && (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Header Strip */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                        {item.categoryLabel}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.capability}
                      </h3>
                      <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                      <span className="text-xs text-slate-500 hidden sm:inline">{item.subtitle}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.verdict}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Head-to-Head Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Adobe RT-CDP Column */}
                    <div className="p-6 space-y-3 bg-slate-50/30 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Adobe Real-Time CDP</span>
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {item.adobeRTCDP.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">{item.adobeRTCDP.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.adobeRTCDP.details}
                        </p>
                      </div>

                      {item.adobeRTCDP.limitation && (
                        <div className="pt-3 border-t border-slate-200/60 text-xs text-slate-700 flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
                          <span><strong>Constraint:</strong> {item.adobeRTCDP.limitation}</span>
                        </div>
                      )}
                    </div>

                    {/* XLR8 Realtime CDP Column */}
                    <div className="p-6 space-y-3 bg-blue-50/20 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0D66D0] flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#0D66D0]" />
                            <span>XLR8 Realtime CDP</span>
                          </span>
                          <span className="text-[10px] font-bold text-[#0D66D0] bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                            {item.xlr8CDP.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0A3D82]">{item.xlr8CDP.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {item.xlr8CDP.details}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-[#0A3D82] font-medium flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                          <span>{item.xlr8CDP.advantageKey}</span>
                        </div>

                        {item.xlr8CDP.actionTab && (
                          <button
                            onClick={() => setActiveTab(item.xlr8CDP.actionTab!)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                          >
                            <span>{item.xlr8CDP.actionLabel || 'Test Drive'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: TABULAR MATRIX */}
          {viewMode === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4 w-[24%]">Capability & Architectural Domain</th>
                      <th className="py-3.5 px-4 w-[28%] text-slate-700">Adobe Real-Time CDP</th>
                      <th className="py-3.5 px-4 w-[34%] text-blue-700">XLR8 Realtime CDP</th>
                      <th className="py-3.5 px-4 w-[14%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredItems.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 align-top">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                            {row.categoryLabel}
                          </span>
                          <strong className="text-xs font-bold text-slate-900 block mt-0.5">
                            {row.capability}
                          </strong>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {row.verdict}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top space-y-1 bg-slate-50/40">
                          <strong className="text-slate-800 block text-xs">{row.adobeRTCDP.title}</strong>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{row.adobeRTCDP.details}</p>
                          {row.adobeRTCDP.limitation && (
                            <span className="text-[10px] text-amber-700 block pt-1">
                              <strong>Limitation:</strong> {row.adobeRTCDP.limitation}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 align-top space-y-1 bg-blue-50/30">
                          <strong className="text-[#0A3D82] block text-xs flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D66D0] shrink-0" />
                            <span>{row.xlr8CDP.title}</span>
                          </strong>
                          <p className="text-[11px] text-slate-700 leading-relaxed">{row.xlr8CDP.details}</p>
                          <span className="text-[10px] text-[#0D66D0] font-semibold block pt-1">
                            {row.xlr8CDP.advantageKey}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-middle text-center">
                          {row.xlr8CDP.actionTab && (
                            <button
                              onClick={() => setActiveTab(row.xlr8CDP.actionTab!)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-600 transition-all shadow-2xs inline-flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Test</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 4. EXECUTIVE RFP & PROCUREMENT DOSSIER BUILDER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center font-bold shrink-0">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Executive RFP & Vendor Selection Dossier
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Pre-compiled technical rationale tailored for C-suite, architecture boards, and procurement teams.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer shadow-xs shrink-0 ${
                copiedSummary
                  ? 'bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE]'
                  : 'bg-white hover:bg-[#F2F4F7] text-[#0D66D0]'
              }`}
            >
              {copiedSummary ? <CheckCheck className="w-4 h-4 text-[#0D66D0]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Dossier Markdown'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Dossier Presets:</span>
            {RFP_TEMPLATES.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  activePreset === preset.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Clean Markdown Dossier Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span className="font-mono font-medium">EXECUTIVE BRIEFING NOTE</span>
              <span className="font-mono tabular-nums">{executiveNotes.length} chars · {executiveNotes.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            <textarea
              value={executiveNotes}
              onChange={(e) => setExecutiveNotes(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-none resize-y leading-relaxed font-sans"
              placeholder="Edit procurement notes or rationale here..."
            />
          </div>
          </div>
        </div>

        {/* 5. FOOTER ASSURANCE */}
        <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0" />
            <div>
              <span className="text-sm font-bold text-white block">Certified Specification Parity</span>
              <span className="text-xs text-slate-400">
                XLR8 Realtime CDP provides complete spec compatibility with Adobe Experience Platform schemas, DULE privacy labels, and streaming edge pipelines.
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('audiences')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Proceed to Audience Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
