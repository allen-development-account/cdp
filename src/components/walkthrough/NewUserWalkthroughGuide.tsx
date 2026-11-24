import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Ghost,
  Layers,
  ArrowDownToLine,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Play,
  X,
  ChevronRight,
  Database,
  Radio,
  FileCode,
  Tag,
  ExternalLink,
  Shield,
  Cpu,
  FlaskConical
} from 'lucide-react';

interface SequenceStep {
  stepNumber: number;
  title: string;
  category: string;
  icon: React.ReactNode;
  duration: string;
  summary: string;
  whyItMatters: string;
  keyConcepts: string[];
  targetTab: string;
  actionLabel: string;
  sampleCodeOrStructure?: string;
}

export const NewUserWalkthroughGuide: React.FC = () => {
  const { setActiveTab, loadDemoData, schemas, datasets, profiles, audiences, ingestionSources } = useCDP();
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState<number | null>(null);
  const [selectedFlowItem, setSelectedFlowItem] = useState<number | null>(null);

  const sequenceSteps: SequenceStep[] = [
    {
      stepNumber: 1,
      title: 'Define Experience Data Model (XDM) Schemas',
      category: 'Foundation & Schema Modeling',
      icon: <Layers className="w-5 h-5 text-[#1473E6]" />,
      duration: '5 mins',
      summary: 'Adobe XDM provides standardized classes and field groups for individual customer records and time-series experience events.',
      whyItMatters: 'Without XDM, multi-channel data cannot be ingested, mapped, stitched, or governed under a unified semantic schema.',
      keyConcepts: [
        'XDM Individual Profile Class (for demographic, CRM, and static traits)',
        'XDM ExperienceEvent Class (for time-series clickstream, purchases, web visits)',
        'Tenant Mixins & Field Groups (custom namespaces for organization-specific data)',
        'Identity Descriptors (specifying which fields act as ECID, Email, or Phone)'
      ],
      targetTab: 'schemas',
      actionLabel: 'Launch Schema Registry',
      sampleCodeOrStructure: `{\n  "_tenant": {\n    "loyaltyTier": "Platinum",\n    "lifetimeSpend": 4250.00\n  },\n  "personalEmail": {\n    "address": "user@example.com"\n  }\n}`
    },
    {
      stepNumber: 2,
      title: 'Establish Streaming Ingestion & Zero-Copy Mesh',
      category: 'Data Pipelines',
      icon: <ArrowDownToLine className="w-5 h-5 text-[#059669]" />,
      duration: '4 mins',
      summary: 'Connect real-time HTTP streaming endpoints, Web/Mobile SDKs, or federate directly into Snowflake and BigQuery with Zero-Copy.',
      whyItMatters: 'Powers sub-second data availability so behavioral signals update profiles and trigger edge actions immediately.',
      keyConcepts: [
        'Real-Time HTTP Ingestion Endpoints (synchronous validation against XDM)',
        'Zero-Copy Federated Pushdown (query cloud data warehouses in-place without replication)',
        'Kafka Streaming Architecture (sub-5ms ingestion buffer and event validation)',
        'Batch File Ingestion (Parquet, JSON, and CSV drag-and-drop)'
      ],
      targetTab: 'ingestion',
      actionLabel: 'Configure Ingestion Stream',
      sampleCodeOrStructure: `POST /api/v1/stream/events HTTP/1.1\nHost: edge.xlr8-cdp.net\nContent-Type: application/json\n\n{\n  "header": { "schemaRef": "https://ns.adobe.com/xdm/context/experienceevent" },\n  "body": { "eventType": "commerce.purchases", "timestamp": "2026-09-18T14:30:00Z" }\n}`
    },
    {
      stepNumber: 3,
      title: 'Catalog Datasets & Apply DULE Governance Labels',
      category: 'Privacy & Governance',
      icon: <ShieldCheck className="w-5 h-5 text-[#D97706]" />,
      duration: '6 mins',
      summary: 'Register datasets and tag fields with Adobe Data Usage Labeling & Enforcement (DULE) to prevent privacy & contractual violations.',
      whyItMatters: 'Guarantees that sensitive health (S2), financial (S3), or third-party (C12) data is blocked before exporting to ad networks.',
      keyConcepts: [
        'C-Series Labels: Contractual restrictions (C1 on-site, C2 3rd party ads, C11/C12)',
        'I-Series Labels: Identifiability (I1 directly identifiable PII, I2 pseudo-anonymous)',
        'S-Series Labels: Sensitive data types (S1 geolocation, S2 health/biometric, S3 financial)',
        'R-Series Labels: Regulatory regimes (R1 GDPR, R2 CCPA/CPRA, R3 HIPAA)',
        'Automated Policy Enforcement: Block, Mask with SHA-256, or Consent-Gate'
      ],
      targetTab: 'datasets',
      actionLabel: 'Manage Datasets & DULE',
      sampleCodeOrStructure: `Dataset: "Retail Web Purchases"\nSchema: XDM ExperienceEvent\nApplied DULE Labels:\n- C1: First Party Marketing Only\n- I1: Direct Identity (Email, Name)\n- S3: Financial Transaction Data\n- R1: GDPR Consent Required`
    },
    {
      stepNumber: 4,
      title: 'Stitch Real-Time Identity Graph & Customer 360',
      category: 'Identity Unification',
      icon: <Users className="w-5 h-5 text-[#7C3AED]" />,
      duration: '5 mins',
      summary: 'Deterministic and probabilistic identity stitching merges cross-device fragments (ECID, email, phone, CRM ID) into a single profile.',
      whyItMatters: 'Ensures marketers see a single, unified view of each customer rather than fractured, siloed identifiers.',
      keyConcepts: [
        'Identity Graph Topology: Nodes (identifiers) and Edges (proven relationships)',
        'Merge Policies: Timestamp Ordering or Dataset Priority for attribute conflicts',
        'Real-Time Profile Store: Low-latency distributed cache (<15ms response)',
        'Calculated Attributes: Rolling 30-day spend, purchase frequency, and AI churn propensity'
      ],
      targetTab: 'identities',
      actionLabel: 'Explore Identity Graph',
      sampleCodeOrStructure: `Identity Cluster [Sarah Jenkins]:\n  ├── ECID: 884920194810482019 (Web Browser)\n  ├── Email: s.jenkins@example.com (Deterministic Root)\n  ├── CRM_ID: CRM-99201 (Salesforce)\n  └── Phone: +1-415-555-0199 (Mobile App)`
    },
    {
      stepNumber: 5,
      title: 'Build Audiences & Activate to Multi-Destination Edge',
      category: 'Audience Activation',
      icon: <Zap className="w-5 h-5 text-[#DC2626]" />,
      duration: '4 mins',
      summary: 'Build rule-based streaming segments with Profile Query Language (PQL) and syndicate to ad networks, CRMs, and webhooks.',
      whyItMatters: 'Turns unified customer data into immediate business value: personalized ad campaigns, trigger emails, and real-time onsite offers.',
      keyConcepts: [
        'Streaming Segmentation: Profiles qualify/disqualify in real-time as events occur',
        'PQL Builder: Visual drag-and-drop conditions with time-series operators',
        'DULE Policy Gatekeeper: Pre-flight validation stops export if labels conflict',
        'Destination Connectors: Meta Custom Audiences, Google Ads, Braze, Snowflake, Amazon S3'
      ],
      targetTab: 'audiences',
      actionLabel: 'Build First Audience',
      sampleCodeOrStructure: `PQL Expression:\n  person.personalEmail.address IS NOT NULL AND\n  commerce.order.priceTotal > 500 AND\n  events.where(eventType == "web.productView").count() >= 3`
    }
  ];

  const currentStatusChecks = [
    { label: 'XDM Schemas Defined', count: schemas.length, target: 1, tab: 'schemas' },
    { label: 'Active Ingestion Streams', count: ingestionSources.length, target: 1, tab: 'ingestion' },
    { label: 'Cataloged Datasets', count: datasets.length, target: 1, tab: 'datasets' },
    { label: 'Unified Profiles Stitched', count: profiles.length, target: 1, tab: 'profiles' },
    { label: 'Audience Segments', count: audiences.length, target: 1, tab: 'audiences' },
  ];

  const completedCount = currentStatusChecks.filter(c => c.count >= c.target).length;

  return (
    <div className="space-y-6" id="new-user-walkthrough-root">
      {/* Hero Welcome & Day-0 Callout Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E2229] rounded-2xl border border-[#334155] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 pointer-events-none rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/10 pointer-events-none rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Day-0 Clean Slate</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                <Ghost className="w-3.5 h-3.5" />
                <span>Fresh Account Workspace</span>
              </span>
              <span className="text-xs text-[#94A3B8]">
                Zero demo data preloaded — ready for your real data
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              XLR8 Real-Time CDP Onboarding & Implementation Sequence
            </h2>

            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              Welcome! You are viewing a pristine, unpopulated sandbox. Follow the guided 5-step sequence below
              to construct your schemas, streaming pipelines, DULE privacy labels, and real-time customer profiles.
              Or, if you prefer to evaluate the platform with pre-populated sample data, click the{' '}
              <strong className="text-emerald-300 font-semibold">Demo Icon on the top navbar</strong>.
            </p>

            <div className="flex items-center space-x-4 pt-1 text-xs text-[#94A3B8]">
              <span>Readiness Progress: <strong className="text-white font-bold">{completedCount} of 5</strong> milestones established</span>
              <div className="w-32 bg-[#334155] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="bg-[#1E293B]/80 backdrop-blur-md border border-[#475569] p-5 rounded-xl flex flex-col space-y-3 shrink-0 w-full sm:w-auto sm:min-w-[260px]">
            <div className="text-xs text-[#94A3B8] flex items-center justify-between">
              <span>Quick Evaluation</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Optional Demo</span>
            </div>

            <button
              id="walkthrough-btn-load-demo"
              onClick={loadDemoData}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md hover:shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <FlaskConical className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
              <span>Enable Demo Data</span>
            </button>

            <button
              id="walkthrough-btn-interactive-tour"
              onClick={() => setActiveWalkthroughStep(1)}
              className="w-full px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#475569] text-white font-semibold text-xs border border-[#64748B] transition-colors flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Step-by-Step Guided Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Architectural Sequence Pipeline Diagram */}
      <div className="bg-white rounded-xl border border-[#E1E5EA] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-[#1E2229] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1473E6]" />
              <span>Real-Time CDP Architectural Data Progression Sequence</span>
            </h3>
            <p className="text-xs text-[#596780] mt-0.5">
              Click any stage in the pipeline to examine the technical role, Adobe RT-CDP standards, and execution guide.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#1473E6] bg-[#EBF3FC] px-2.5 py-1 rounded-md self-start sm:self-auto">
            Sub-50ms Edge Target
          </span>
        </div>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {[
            { step: 1, title: '1. Ingestion / Zero-Copy', subtitle: 'Kafka & Pushdown', icon: <ArrowDownToLine className="w-4 h-4 text-emerald-600" />, tab: 'ingestion' },
            { step: 2, title: '2. XDM Schema Binding', subtitle: 'Profile & Event Classes', icon: <Layers className="w-4 h-4 text-blue-600" />, tab: 'schemas' },
            { step: 3, title: '3. DULE Governance', subtitle: 'C / I / S / R Labels', icon: <ShieldCheck className="w-4 h-4 text-amber-600" />, tab: 'datasets' },
            { step: 4, title: '4. Real-Time Profile', subtitle: 'Identity Graph Stitching', icon: <Users className="w-4 h-4 text-purple-600" />, tab: 'profiles' },
            { step: 5, title: '5. Edge Activation', subtitle: 'PQL & Outbound Sync', icon: <Zap className="w-4 h-4 text-rose-600" />, tab: 'audiences' },
          ].map((item, idx) => (
            <div
              key={item.step}
              onClick={() => setSelectedFlowItem(selectedFlowItem === item.step ? null : item.step)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none text-left relative ${
                selectedFlowItem === item.step
                  ? 'bg-[#F0F7FF] border-[#1473E6] shadow-sm ring-1 ring-[#1473E6]/30'
                  : 'bg-[#FAFBFD] hover:bg-[#F1F4F9] border-[#E1E5EA]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-md bg-white border border-[#E1E5EA] shadow-2xs">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-[#8C9BAE]">STAGE 0{item.step}</span>
              </div>
              <h4 className="text-xs font-bold text-[#1E2229]">{item.title}</h4>
              <p className="text-[11px] text-[#596780] mt-0.5">{item.subtitle}</p>

              {/* Arrow Connector on desktop */}
              {idx < 4 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-[#E1E5EA] items-center justify-center text-[#8C9BAE] shadow-2xs pointer-events-none">
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected Flow Detail Drawer/Callout */}
        {selectedFlowItem !== null && (
          <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1E2229]">
                Deep Dive: Stage 0{selectedFlowItem} Details & Requirements
              </span>
              <button
                onClick={() => setSelectedFlowItem(null)}
                className="text-[#596780] hover:text-[#1E2229] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[#596780]">
              {selectedFlowItem === 1 && 'Configure streaming endpoints (REST/JSON) or connect zero-copy queries directly to Snowflake, Databricks, or Google BigQuery.'}
              {selectedFlowItem === 2 && 'Standardize schema definitions using Experience Data Model (XDM) Individual Profile and ExperienceEvent classes with custom tenant mixins.'}
              {selectedFlowItem === 3 && 'Enforce DULE governance labels (Contractual, Identity, Sensitive, Regulatory) to govern which fields can be shared downstream.'}
              {selectedFlowItem === 4 && 'The Identity Graph stitches disjoint customer interactions across cookies, CRM identifiers, and mobile advertising IDs in real time.'}
              {selectedFlowItem === 5 && 'Create streaming PQL audience definitions and syndicate qualifying profiles to Facebook, Google Ads, Amazon S3, and Braze.'}
            </p>
          </div>
        )}
      </div>

      {/* The 5 Implementation Sequence Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1E2229]">
              5-Step Implementation Sequence
            </h3>
            <p className="text-xs text-[#596780]">
              Complete these sequences in order to stand up your enterprise customer data platform.
            </p>
          </div>
          <span className="text-xs text-[#596780]">
            Estimated Setup: <strong className="text-[#1E2229]">24 mins</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {sequenceSteps.map((step) => {
            const isCompleted = (
              (step.stepNumber === 1 && schemas.length > 0) ||
              (step.stepNumber === 2 && ingestionSources.length > 0) ||
              (step.stepNumber === 3 && datasets.length > 0) ||
              (step.stepNumber === 4 && profiles.length > 0) ||
              (step.stepNumber === 5 && audiences.length > 0)
            );

            return (
              <div
                key={step.stepNumber}
                className="p-5 rounded-xl border border-[#E1E5EA] bg-white hover:border-[#CBD5E1] transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex items-start space-x-4 flex-1">
                  {/* Step Number Badge */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-[#F2F4F7] border-[#E1E5EA] text-[#596780]'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span className="text-[11px] font-bold text-[#1473E6] uppercase tracking-wider">
                        Step 0{step.stepNumber} • {step.category}
                      </span>
                      <span className="text-[11px] text-[#8C9BAE]">• Est: {step.duration}</span>
                      {isCompleted && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Milestone Complete
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#1E2229] group-hover:text-[#1473E6] transition-colors">
                      {step.title}
                    </h4>

                    <p className="text-xs text-[#596780] leading-relaxed max-w-3xl">
                      {step.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {step.keyConcepts.map((concept, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F1F4F9] text-[#475569] border border-[#E2E8F0]"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => setActiveWalkthroughStep(step.stepNumber)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#475569] transition-colors flex items-center space-x-1"
                    title="View architectural details and sample payload"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Guide</span>
                  </button>

                  <button
                    onClick={() => setActiveTab(step.targetTab)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#1473E6] hover:bg-[#0D66D0] text-white transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Walkthrough Tour Modal */}
      {activeWalkthroughStep !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E1E5EA] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {(() => {
              const currentStepObj = sequenceSteps.find(s => s.stepNumber === activeWalkthroughStep)!;
              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-[#EBF3FC] text-[#1473E6]">
                        {currentStepObj.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#1473E6] uppercase tracking-wider">
                          Walkthrough: Step {currentStepObj.stepNumber} of 5
                        </span>
                        <h3 className="font-bold text-base text-[#1E2229]">
                          {currentStepObj.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveWalkthroughStep(null)}
                      className="p-1.5 rounded-md text-[#596780] hover:text-[#1E2229] hover:bg-[#F2F4F7]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                      <strong className="text-[#1E2229] block">Why This Step Matters:</strong>
                      <p className="text-[#596780] leading-relaxed">
                        {currentStepObj.whyItMatters}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <strong className="text-[#1E2229] block text-xs uppercase tracking-wider">
                        Core Principles & Concepts:
                      </strong>
                      <ul className="space-y-1.5 pl-4 list-disc text-[#596780]">
                        {currentStepObj.keyConcepts.map((kc, i) => (
                          <li key={i} className="leading-relaxed">{kc}</li>
                        ))}
                      </ul>
                    </div>

                    {currentStepObj.sampleCodeOrStructure && (
                      <div className="space-y-1.5">
                        <strong className="text-[#1E2229] block text-xs uppercase tracking-wider">
                          Sample Specification / Payload:
                        </strong>
                        <pre className="p-3 bg-[#1E2229] text-[#E2E8F0] rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                          {currentStepObj.sampleCodeOrStructure}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E1E5EA]">
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          onClick={() => setActiveWalkthroughStep(num)}
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                            num === activeWalkthroughStep
                              ? 'bg-[#1473E6] text-white'
                              : 'bg-[#F1F4F9] text-[#596780] hover:bg-[#E2E8F0]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const next = activeWalkthroughStep < 5 ? activeWalkthroughStep + 1 : 1;
                          setActiveWalkthroughStep(next);
                        }}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#F1F4F9] hover:bg-[#E2E8F0] text-[#475569]"
                      >
                        {activeWalkthroughStep === 5 ? 'Restart Tour' : 'Next Step →'}
                      </button>

                      <button
                        onClick={() => {
                          const target = currentStepObj.targetTab;
                          setActiveWalkthroughStep(null);
                          setActiveTab(target);
                        }}
                        className="px-4 py-1.5 rounded-md text-xs font-bold bg-[#1473E6] hover:bg-[#0D66D0] text-white flex items-center space-x-1"
                      >
                        <span>Go to {currentStepObj.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
