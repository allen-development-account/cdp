import React, { useState, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  Compass,
  Layers,
  Database,
  GitMerge,
  Users,
  Sliders,
  Send,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Check,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface GuidedStepDefinition {
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6;
  shortLabel: string;
  overviewSummary: string;
  title: string;
  domain: string;
  icon: React.ReactNode;
  beginnerExplanation: string;
  howCdpUsesIt: string;
  whatToSelect: {
    label: string;
    detail: string;
  }[];
  actions: {
    label: string;
    tab: string;
    primary?: boolean;
  }[];
  workspaceCountLabel: string;
  workspaceCount: number;
  workspaceReadyText: string;
  extraGuidanceNote?: string;
}

const STORAGE_COMPLETED_KEY = 'xlr8_guided_completed_steps';

export const GetStartedGuidedView: React.FC = () => {
  const {
    setActiveTab,
    guidedReturnStep,
    guidedOpenMode,
    setGuidedOpenMode,
    launchGuidedStepAction,
    schemas = [],
    datasets = [],
    ingestionSources = [],
    profiles = [],
    dsarRequests = [],
    globalPrivacyMode,
    audiences = [],
    destinations = []
  } = useCDP();

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPLETED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 6);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const totalSteps = 6;
  const currentActiveStep: number = [1, 2, 3, 4, 5, 6].find(n => !completedSteps.includes(n)) ?? 6;
  const allCompleted = completedSteps.length >= totalSteps;

  const [viewMode, setViewMode] = useState<'overview' | 'step'>(guidedOpenMode);
  const [viewedStep, setViewedStep] = useState<number>(
    guidedOpenMode === 'step' && guidedReturnStep ? guidedReturnStep : currentActiveStep
  );
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const [beginnersOpen, setBeginnersOpen] = useState(false);
  const [whyCdpOpen, setWhyCdpOpen] = useState(false);

  useEffect(() => {
    setViewMode(guidedOpenMode);
    if (guidedOpenMode === 'step' && guidedReturnStep) {
      setViewedStep(guidedReturnStep);
    }
  }, [guidedOpenMode, guidedReturnStep]);

  useEffect(() => {
    setReadMoreOpen(false);
    setBeginnersOpen(false);
    setWhyCdpOpen(false);
  }, [viewedStep]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(completedSteps));
    } catch (e) {
      console.error(e);
    }
  }, [completedSteps]);

  const handleProceedToFlow = (targetStep?: number) => {
    const nextStep = targetStep ?? (allCompleted ? 1 : currentActiveStep);
    setViewedStep(nextStep);
    setGuidedOpenMode('step');
    setViewMode('step');
  };

  const handleCompleteStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepNumber)) return prev;
      return [...prev, stepNumber].sort((a, b) => a - b);
    });
    if (stepNumber < totalSteps) {
      setViewedStep(stepNumber + 1);
    }
  };

  const handleResetTrack = () => {
    setCompletedSteps([]);
    setViewedStep(1);
    setGuidedOpenMode('overview');
    setViewMode('overview');
    try {
      localStorage.removeItem(STORAGE_COMPLETED_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const connectedDestinationsCount = (destinations || []).filter(
    d => d.status === 'Connected' || Boolean(d.configuredAudienceId) || (d.activeAudienceCount ?? 0) > 0
  ).length;
  const labeledDatasetsCount = (datasets || []).filter(d => d.labels && d.labels.length > 0).length;
  const totalDuleLabelCount = (datasets || []).reduce((acc, d) => acc + (d.labels?.length || 0), 0);

  const steps: GuidedStepDefinition[] = [
    {
      stepNumber: 1,
      shortLabel: 'XDM Schemas',
      overviewSummary: 'Define a standardized data blueprint for customer traits and behavioral events before any records enter.',
      title: 'Create Your Data Blueprint (Schemas - XDM)',
      domain: 'Step 1 · Data Blueprint',
      icon: <Layers className="w-5 h-5" />,
      beginnerExplanation:
        'A Real-Time CDP cannot combine data from your website, CRM, and mobile app unless they speak the same language. An XDM Schema is the blueprint that defines the structure of your customer records or behavioral events before any data enters.',
      howCdpUsesIt:
        'Every dataset and live event stream is validated against a schema first so incoming fields stay clean, consistent, and ready to stitch.',
      whatToSelect: [
        {
          label: 'Choose One Schema Class (Profile or ExperienceEvent)',
          detail: 'Select XDM Individual Profile for static customer traits (name, email, loyalty tier) OR XDM ExperienceEvent for timestamped actions (page views, add-to-cart, purchases).'
        },
        {
          label: 'Add Relevant Field Groups',
          detail: 'Pick field groups like Personal Contact Details, Loyalty, or Commerce Order Details depending on the data you plan to bring in.'
        },
        {
          label: 'Mark Your Primary Identity Field',
          detail: 'Designate Email, Phone, or ECID as an Identity descriptor so Step 3 (Identity Graph) can link records automatically.'
        }
      ],
      actions: [
        { label: 'Create Schema in Schemas (XDM)', tab: 'create_schema', primary: true },
        { label: 'Browse Schema Registry', tab: 'schemas' }
      ],
      workspaceCountLabel: 'Schemas Created',
      workspaceCount: schemas.length,
      workspaceReadyText:
        schemas.length > 0
          ? `${schemas.length} schema${schemas.length === 1 ? '' : 's'} defined in your workspace.`
          : 'No schemas yet — open Schemas (XDM) to define your first blueprint, or mark complete once reviewed.'
    },
    {
      stepNumber: 2,
      shortLabel: 'Datasets & DULE',
      overviewSummary: 'Bind datasets to your schema, tag DULE privacy labels (C/I/S/R), and upload or stream customer records.',
      title: 'Create Datasets, Apply DULE Labels & Ingest Data',
      domain: 'Step 2 · Ingestion & Governance Labeling',
      icon: <Database className="w-5 h-5" />,
      beginnerExplanation:
        'Next, create a Dataset linked to your XDM Schema and tag it with DULE (Data Usage Labeling & Enforcement) privacy labels before data lands. Then bring in real records via Excel/CSV upload or live streaming Sources.',
      howCdpUsesIt:
        'Tagging DULE labels right at dataset creation guarantees sensitive PII, financial, or restricted records are protected from the moment they enter the CDP.',
      whatToSelect: [
        {
          label: 'Bind Dataset to Your Schema & Enable Profile Ingestion',
          detail: 'In Create Dataset, choose the XDM schema from Step 1 and enable Real-Time Profile so uploaded records feed Customer 360.'
        },
        {
          label: 'Select Required DULE Privacy Labels (C / I / S / R)',
          detail: 'Pick C1 (1st-party marketing OK) or C12 (no 3rd-party sharing), I1 (direct PII like email/name) or I2 (pseudo ID), S1–S3 (geo/health/financial if applicable), and R1/R2 (GDPR/CCPA).'
        },
        {
          label: 'Upload Customer File or Connect a Data Source',
          detail: 'Drop an Excel/CSV file directly or connect a live REST/SDK/warehouse Source to start ingesting records.'
        }
      ],
      extraGuidanceNote:
        'For a standard retail customer dataset, select C1 + I1 + R1/R2. Never allow S2 (Health) or C12 data to sync out to third-party social ad networks.',
      actions: [
        { label: 'Create Dataset & Upload Data', tab: 'create_dataset', primary: true },
        { label: 'Configure DULE Policies', tab: 'governance' },
        { label: 'Explore Inbound Sources', tab: 'sources' }
      ],
      workspaceCountLabel: 'Datasets & Sources',
      workspaceCount: datasets.length + ingestionSources.length,
      workspaceReadyText:
        `${datasets.length} dataset(s) (${labeledDatasetsCount} labeled · ${totalDuleLabelCount} DULE labels) · ${ingestionSources.length} source(s).`
    },
    {
      stepNumber: 3,
      shortLabel: 'Identity Graph',
      overviewSummary: 'Link anonymous cookies, emails, phones, and CRM IDs together into one stitched customer identity.',
      title: 'Stitch Cross-Channel IDs (Identity Graph)',
      domain: 'Step 3 · Identity Resolution',
      icon: <GitMerge className="w-5 h-5" />,
      beginnerExplanation:
        'After data is ingested, one customer often appears under different IDs: an anonymous browser cookie (ECID), a checkout Email, a Phone number, and a Salesforce CRM ID. The Identity Graph links all of those fragments together into one person.',
      howCdpUsesIt:
        'Deterministic stitching bridges shared identifiers across namespaces in real time so the CDP builds one complete picture instead of duplicate profiles.',
      whatToSelect: [
        {
          label: 'Inspect Linked Identity Clusters',
          detail: 'Open Identity Graph to see how ECID, Email, Phone, and CRM_ID nodes connect via verified deterministic edges.'
        },
        {
          label: 'Review Merge Policy Priority',
          detail: 'Check whether Timestamp Ordering or Dataset Priority resolves conflicting values when two sources update the same trait.'
        }
      ],
      actions: [
        { label: 'Open Identity Graph', tab: 'identities', primary: true }
      ],
      workspaceCountLabel: 'Stitched Profiles',
      workspaceCount: profiles.length,
      workspaceReadyText:
        profiles.length > 0
          ? `Identity Graph is resolving across ${profiles.length} unified cluster${profiles.length === 1 ? '' : 's'}.`
          : 'Ingest data in Step 2 to generate live identity nodes and edges in the graph.'
    },
    {
      stepNumber: 4,
      shortLabel: 'Customer 360',
      overviewSummary: 'Inspect unified customer records combining attributes, lifetime spend, event timelines, and consent flags.',
      title: 'Inspect Unified Customer 360 Profiles & Consent',
      domain: 'Step 4 · Unified Customers & Consent Check',
      icon: <Users className="w-5 h-5" />,
      beginnerExplanation:
        'Once schemas, datasets, and the Identity Graph stitch your data together, Unified Customer 360 Profiles are created automatically. Each profile combines demographics, lifetime spend, real-time behavioral events, AI scores, and privacy consent status.',
      howCdpUsesIt:
        'Verify that unified customer profiles look accurate and confirm GDPR/CCPA consent flags before you target them in campaigns.',
      whatToSelect: [
        {
          label: 'Inspect Merged Customer Attributes & Timeline',
          detail: 'Open Customer 360 Profiles to review totalSpend, customerTier, loyaltyPoints, AI churn risk, and chronological ExperienceEvents.'
        },
        {
          label: 'Verify Consent & DSAR Readiness',
          detail: 'Check each customer’s GDPR opt-in and CCPA Do-Not-Sell status in Profiles or Privacy & DSAR Service.'
        }
      ],
      actions: [
        { label: 'Explore Customer 360 Profiles', tab: 'profiles', primary: true },
        { label: 'Check Privacy & DSAR Service', tab: 'privacy_service' }
      ],
      workspaceCountLabel: 'Customer Profiles',
      workspaceCount: profiles.length,
      workspaceReadyText:
        `${profiles.length} Customer 360 profile(s) · ${dsarRequests.length} DSAR request(s) · Zero-Trust Guard ${globalPrivacyMode ? 'Active' : 'Standard'}.`
    },
    {
      stepNumber: 5,
      shortLabel: 'Audience Segments',
      overviewSummary: 'Group unified profiles into real-time segments using behavioral rules, attributes, and DULE consent gates.',
      title: 'Build Dynamic Audience Segments',
      domain: 'Step 5 · Audience Segmentation',
      icon: <Sliders className="w-5 h-5" />,
      beginnerExplanation:
        'Now group your Customer 360 profiles into targetable audiences using real-time rules. Instead of exporting static spreadsheets, a Real-Time CDP updates segment membership live as new customer events arrive.',
      howCdpUsesIt:
        'Audience rules evaluate profile traits, recent behavioral events, Sensei AI predictions, and DULE consent gates simultaneously.',
      whatToSelect: [
        {
          label: 'Name Your Segment & Pick Match Logic (ALL / ANY)',
          detail: 'Click "+ Create New Segment" -> Step 1, enter a business name, and choose ALL Rules (AND) or ANY Rule (OR).'
        },
        {
          label: 'Click "+ Add Rule" to Define Criteria',
          detail: 'Pick Profile Attribute (e.g., totalSpend > 500), ExperienceEvent (e.g., AddToCart), Sensei AI Score, Calculated Attribute, or a DULE Consent Gate.'
        },
        {
          label: 'Verify Qualifying vs. DULE Targetable Counts',
          detail: 'Check the Real-Time Qualifying Profile Explorer before saving to confirm how many profiles pass consent checks.'
        }
      ],
      actions: [
        { label: 'Build Audience Segment', tab: 'audiences', primary: true }
      ],
      workspaceCountLabel: 'Saved Segments',
      workspaceCount: audiences.length,
      workspaceReadyText:
        audiences.length > 0
          ? `${audiences.length} audience segment${audiences.length === 1 ? '' : 's'} created and ready for activation.`
          : 'No audience segments yet — create your first guided segment before moving to the final step.'
    },
    {
      stepNumber: 6,
      shortLabel: 'Activate Destinations',
      overviewSummary: 'Connect ad networks, email tools, or cloud storage and push DULE-cleared audiences to live destinations.',
      title: 'Activate Audiences to Outbound Destinations',
      domain: 'Step 6 · Final Activation',
      icon: <Send className="w-5 h-5" />,
      beginnerExplanation:
        'Activation is the final step where your CDP delivers real business value. Connect an outbound Destination—such as Google Ads, Meta Custom Audiences, Braze, Snowflake, Amazon S3, or a Webhook—and stream your DULE-cleared segment directly to it.',
      howCdpUsesIt:
        'As customers qualify for your segment in real time, the CDP automatically syndicates permitted identifiers to your marketing tools while blocking any policy-restricted users.',
      whatToSelect: [
        {
          label: 'Pick a Destination Connector from Connections',
          detail: 'Select the ad platform, CRM, email engine, cloud storage bucket, or webhook endpoint where you want your audience delivered.'
        },
        {
          label: 'Select Your Audience Segment & Sync Frequency',
          detail: 'Bind the segment created in Step 5 and choose Real-Time, Hourly, or Daily synchronization.'
        },
        {
          label: 'Review DULE Enforcement & Activate Sync',
          detail: 'Confirm that non-consented or restricted profiles are suppressed automatically, then trigger live activation.'
        }
      ],
      actions: [
        { label: 'Activate in Destinations', tab: 'destinations', primary: true }
      ],
      workspaceCountLabel: 'Active Destinations',
      workspaceCount: connectedDestinationsCount,
      workspaceReadyText:
        `${connectedDestinationsCount} destination connector${connectedDestinationsCount === 1 ? '' : 's'} connected and ready to receive audiences.`
    }
  ];

  const activeStepDef = steps.find(s => s.stepNumber === viewedStep) || steps[0];
  const isViewedCompleted = completedSteps.includes(activeStepDef.stepNumber);
  const nextPendingStepDef = steps.find(s => s.stepNumber === currentActiveStep) || steps[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#1E2229]">
      {/* Top Blue Gradient Header */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <PageBackButton fallbackTab="home" fallbackLabel="Home" className="mt-0.5 shrink-0" />
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight text-balance">
              Get Started: Real-Time CDP Guided Track
            </h1>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed max-w-2xl">
              Follow these {totalSteps} sequential steps to understand how a Real-Time CDP works—from defining XDM schemas and DULE privacy labels to activating segments in live destinations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 self-start md:self-center">
          <div className="text-right">
            <span className="text-sm font-bold text-white font-mono tabular-nums block">
              {completedSteps.length} / {totalSteps} Completed
            </span>
            <span className="text-[11px] text-blue-100">Guided Progress</span>
          </div>
          {completedSteps.length > 0 && (
            <button
              type="button"
              onClick={handleResetTrack}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title="Reset guided steps back to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Track</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== PHASE 1: LANDING FIRST SECTION ONLY ==================== */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-6 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">
                  How a Real-Time CDP Works
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                  Start with Step 1 and progress one stage at a time. Each step unlocks automatically after you complete the previous one.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-white bg-white/15 border border-white/25 px-3 py-1 rounded-md tabular-nums whitespace-nowrap shrink-0 self-start sm:self-center">
                {allCompleted ? `All ${totalSteps} Steps Completed` : `Next Up: Step ${currentActiveStep} of ${totalSteps}`}
              </span>
            </div>

            <div className="p-6">

            {/* 6 Vertically Elongated Cards Stacked in a Single Horizontal Line */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-stretch">
              {steps.map((s) => {
                const isDone = completedSteps.includes(s.stepNumber);
                const isCurrent = !allCompleted && s.stepNumber === currentActiveStep;
                const isUnlocked = isDone || isCurrent;

                return (
                  <button
                    key={s.stepNumber}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && handleProceedToFlow(s.stepNumber)}
                    aria-disabled={!isUnlocked}
                    className={`text-left p-4 rounded-xl border min-h-[270px] flex flex-col justify-between transition-all ${
                      isDone
                        ? 'bg-[#F5FAFF] border-[#7DD3FC] hover:border-[#0284C7] cursor-pointer shadow-2xs'
                        : isCurrent
                        ? 'bg-[#F5F9FF] border-[#1473E6] hover:bg-[#EBF3FC] cursor-pointer shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Top Step Indicator & Status */}
                      <div className="flex items-center justify-between gap-1 text-[11px] font-mono font-semibold tabular-nums">
                        <span
                          className={
                            isDone
                              ? 'text-[#0284C7]'
                              : isCurrent
                              ? 'text-[#0D66D0]'
                              : 'text-[#64748B]'
                          }
                        >
                          Step 0{s.stepNumber}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                        ) : isCurrent ? (
                          <span className="text-[#0D66D0] font-sans text-[11px]">Ready</span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        )}
                      </div>

                      {/* Icon Container */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white shadow-2xs'
                            : isCurrent
                            ? 'bg-gradient-to-br from-[#1473E6] to-[#0A3D82] text-white shadow-2xs'
                            : 'bg-[#E2E8F0] text-[#64748B]'
                        }`}
                      >
                        {s.icon}
                      </div>

                      {/* Title + Beginner Summary */}
                      <div>
                        <h3
                          className={`text-[13px] font-bold leading-snug ${
                            isUnlocked ? 'text-[#1E2229]' : 'text-[#475569]'
                          }`}
                        >
                          {s.shortLabel}
                        </h3>
                        <p
                          className={`text-[11px] mt-1.5 leading-relaxed ${
                            isUnlocked ? 'text-[#475569]' : 'text-[#64748B]'
                          }`}
                        >
                          {s.overviewSummary}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata Footer */}
                    <div className="pt-3 mt-4 border-t border-[#E1E5EA]/80 space-y-1 text-[11px]">
                      <div className="text-[#596780] font-medium tabular-nums">
                        {s.workspaceCountLabel}: <strong className="font-mono text-[#1E2229]">{s.workspaceCount}</strong>
                      </div>
                      <div
                        className={`font-semibold inline-flex items-center space-x-1 ${
                          isDone
                            ? 'text-[#0284C7]'
                            : isCurrent
                            ? 'text-[#1473E6]'
                            : 'text-[#64748B]'
                        }`}
                      >
                        <span>{isDone ? 'Review step' : isCurrent ? 'Start here' : `After Step ${s.stepNumber - 1}`}</span>
                        {isUnlocked && <ArrowRight className="w-3 h-3" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          </section>

          {/* Center-Aligned Proceed Button Outside the Container */}
          <div className="flex flex-col items-center justify-center gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => handleProceedToFlow()}
              className="px-8 py-2.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-sm font-semibold inline-flex items-center justify-center space-x-2 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#596780] text-center">
              {allCompleted
                ? 'All 6 steps completed — click Proceed to review any stage.'
                : `Next: Step ${nextPendingStepDef.stepNumber} — ${nextPendingStepDef.shortLabel}`}
            </p>
          </div>
        </div>
      )}

      {/* ==================== PHASE 2: ONE-STEP-AT-A-TIME MULTI-STEP FLOW ==================== */}
      {viewMode === 'step' && (
        <div className="space-y-5">
          {/* Compact Stepper Bar with Return to Big Picture */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setGuidedOpenMode('overview');
                setViewMode('overview');
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0D66D0] hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start lg:self-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All 6 Steps Overview</span>
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {steps.map((s) => {
                const isDone = completedSteps.includes(s.stepNumber);
                const isViewing = s.stepNumber === viewedStep;
                const isUnlocked = isDone || s.stepNumber === currentActiveStep;

                return (
                  <button
                    key={s.stepNumber}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && setViewedStep(s.stepNumber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 border transition-colors ${
                      isViewing
                        ? 'bg-[#1473E6] text-white border-[#1473E6]'
                        : isDone
                        ? 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC] hover:bg-[#BAE6FD] cursor-pointer'
                        : isUnlocked
                        ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#BFDBFE] cursor-pointer'
                        : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                    }`}
                  >
                    {isDone && !isViewing ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3 h-3 shrink-0" />
                    ) : null}
                    <span className="font-mono">Step {s.stepNumber}:</span>
                    <span>{s.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Single Step Card */}
          <section className="bg-white rounded-xl border border-[#1473E6]/35 shadow-sm overflow-hidden">
            {/* Blue Gradient Step Header */}
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white text-[#0D66D0] flex items-center justify-center shrink-0 shadow-2xs">
                  {isViewedCompleted ? <CheckCircle2 className="w-5 h-5 text-[#0284C7]" /> : activeStepDef.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-blue-100 font-medium">
                    {activeStepDef.domain} · {isViewedCompleted ? 'Completed' : `Step ${activeStepDef.stepNumber} of ${totalSteps}`}
                  </div>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    {activeStepDef.title}
                  </h2>
                </div>
              </div>

              <span className="text-xs font-mono font-semibold text-white bg-white/15 border border-white/25 px-3 py-1 rounded-lg tabular-nums whitespace-nowrap shrink-0 self-start sm:self-center">
                {activeStepDef.workspaceCountLabel}: {activeStepDef.workspaceCount}
              </span>
            </div>

            {/* Active Step Body */}
            <div className="p-6 space-y-5">
              {/* Concrete Action Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1E2229] uppercase tracking-wide">
                  What You Should Do &amp; Select in This Step
                </h3>

                <div className="space-y-2.5">
                  {activeStepDef.whatToSelect.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA]"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-[#EBF3FC] border border-[#BFDBFE]/70 text-[#0D66D0] font-mono text-[11px] font-bold flex items-center justify-center whitespace-nowrap shrink-0 mt-0.5">
                        Step {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1E2229]">{item.label}</p>
                        <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activeStepDef.extraGuidanceNote && (
                  <div className="p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#78350F] leading-relaxed">
                    <strong className="font-bold">Privacy Selection Tip: </strong>
                    {activeStepDef.extraGuidanceNote}
                  </div>
                )}
              </div>

              {/* Center-Aligned Step Action Button(s) */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {activeStepDef.actions.map((act) => (
                  <button
                    key={act.tab}
                    type="button"
                    onClick={() => launchGuidedStepAction(activeStepDef.stepNumber, act.tab)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      act.primary
                        ? 'bg-[#EBF3FC] hover:bg-[#DCEAF9] text-[#0D66D0] border border-[#BFDBFE] shadow-2xs'
                        : 'bg-white hover:bg-[#F2F4F7] text-[#1E2229] border border-[#D5D5D5]'
                    }`}
                  >
                    <span>{act.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              {/* Footer: Sequential Step Controls */}
              <div className="pt-4 border-t border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3">
                <div>
                  {activeStepDef.stepNumber > 1 && (
                    <button
                      type="button"
                      onClick={() => setViewedStep(activeStepDef.stepNumber - 1)}
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#1E2229] text-xs font-semibold inline-flex items-center space-x-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous Step</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-auto">
                  {!isViewedCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteStep(activeStepDef.stepNumber)}
                      className="px-4 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold inline-flex items-center justify-center space-x-1.5 whitespace-nowrap shrink-0 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {activeStepDef.stepNumber < totalSteps
                          ? `Complete Step ${activeStepDef.stepNumber} & Proceed to Step ${activeStepDef.stepNumber + 1}`
                          : `Complete Step ${totalSteps} & Finish Guide`}
                      </span>
                    </button>
                  ) : activeStepDef.stepNumber < totalSteps &&
                    (completedSteps.includes(activeStepDef.stepNumber) || activeStepDef.stepNumber < currentActiveStep) ? (
                    <button
                      type="button"
                      onClick={() => setViewedStep(activeStepDef.stepNumber + 1)}
                      className="px-4 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Next: Step {activeStepDef.stepNumber + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* All Steps Completed Summary */}
          {allCompleted && activeStepDef.stepNumber === totalSteps && (
            <div className="bg-white rounded-xl border border-[#93C5FD] p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#1473E6] text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E2229]">
                    Guided Onboarding Complete
                  </h3>
                  <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
                    You have completed all {totalSteps} Real-Time CDP steps—from modeling XDM schemas and labeling datasets with DULE to stitching Identity Graphs, inspecting Customer 360 profiles, building segments, and activating to destinations.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  Go to Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('destinations')}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#1E2229] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  Destinations
                </button>
              </div>
            </div>
          )}

          {/* Main Pre-Collapsed "Read More" Accordion Positioned Outside Step Container Towards Bottom */}
          <div className="pt-4 pb-2">
            <div className="rounded-xl border border-[#E1E5EA] bg-white shadow-2xs overflow-hidden">
              <button
                type="button"
                aria-expanded={readMoreOpen}
                onClick={() => setReadMoreOpen(prev => !prev)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <BookOpen className="w-4 h-4 text-[#0D66D0] shrink-0" />
                  <span className="text-xs font-bold text-[#1E2229]">Read More</span>
                  <span className="text-[11px] text-[#64748B] truncate">
                    Beginner guide &amp; why Real-Time CDP needs Step {activeStepDef.stepNumber}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#475569] shrink-0 transition-transform duration-200 ${
                    readMoreOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {readMoreOpen && (
                <div className="p-4 bg-[#F8FAFC] border-t border-[#E1E5EA] space-y-2.5">
                  {/* Sub-accordion 1: What This Means (For Beginners) */}
                  <div className="rounded-lg border border-[#E1E5EA] bg-white overflow-hidden">
                    <button
                      type="button"
                      aria-expanded={beginnersOpen}
                      onClick={() => setBeginnersOpen(prev => !prev)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wide">
                        What This Means (For Beginners)
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#475569] shrink-0 transition-transform duration-200 ${
                          beginnersOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {beginnersOpen && (
                      <div className="px-4 pb-3.5 pt-2.5 bg-white border-t border-[#E1E5EA]">
                        <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                          {activeStepDef.beginnerExplanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sub-accordion 2: Why Real-Time CDP Needs This */}
                  <div className="rounded-lg border border-[#E1E5EA] bg-white overflow-hidden">
                    <button
                      type="button"
                      aria-expanded={whyCdpOpen}
                      onClick={() => setWhyCdpOpen(prev => !prev)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wide">
                        Why Real-Time CDP Needs This
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#475569] shrink-0 transition-transform duration-200 ${
                          whyCdpOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {whyCdpOpen && (
                      <div className="px-4 pb-3.5 pt-2.5 bg-white border-t border-[#E1E5EA] space-y-1.5">
                        <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                          {activeStepDef.howCdpUsesIt}
                        </p>
                        <p className="text-xs font-medium text-[#0D66D0]">
                          {activeStepDef.workspaceReadyText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
