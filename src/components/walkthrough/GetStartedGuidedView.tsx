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
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Award,
  Check
} from 'lucide-react';

interface GuidedStepDefinition {
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6;
  shortLabel: string;
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

  const [expandedReviewedSteps, setExpandedReviewedSteps] = useState<number[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(completedSteps));
    } catch (e) {
      console.error(e);
    }
  }, [completedSteps]);

  const totalSteps = 6;
  const currentActiveStep: number = [1, 2, 3, 4, 5, 6].find(n => !completedSteps.includes(n)) ?? 7;
  const allCompleted = completedSteps.length >= totalSteps;

  const handleCompleteStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepNumber)) return prev;
      return [...prev, stepNumber].sort((a, b) => a - b);
    });
    setExpandedReviewedSteps(prev => prev.filter(n => n !== stepNumber));
  };

  const handleResetTrack = () => {
    setCompletedSteps([]);
    setExpandedReviewedSteps([]);
    try {
      localStorage.removeItem(STORAGE_COMPLETED_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleReviewStep = (stepNumber: number) => {
    setExpandedReviewedSteps(prev =>
      prev.includes(stepNumber) ? prev.filter(n => n !== stepNumber) : [...prev, stepNumber]
    );
  };

  const connectedDestinationsCount = (destinations || []).filter(
    d => d.status === 'Connected' || (d.activeAudienceIds && d.activeAudienceIds.length > 0)
  ).length;
  const labeledDatasetsCount = (datasets || []).filter(d => d.duleLabels && d.duleLabels.length > 0).length;
  const totalDuleLabelCount = (datasets || []).reduce((acc, d) => acc + (d.duleLabels?.length || 0), 0);

  const steps: GuidedStepDefinition[] = [
    {
      stepNumber: 1,
      shortLabel: 'XDM Schemas',
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
      workspaceCountLabel: 'Datasets & Labels',
      workspaceCount: datasets.length + ingestionSources.length,
      workspaceReadyText:
        `${datasets.length} dataset(s) (${labeledDatasetsCount} labeled · ${totalDuleLabelCount} DULE labels) · ${ingestionSources.length} source(s).`
    },
    {
      stepNumber: 3,
      shortLabel: 'Identity Graph',
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
      title: 'Activate Audiences to Outbound Destinations',
      domain: 'Step 6 · Final Activation',
      icon: <Send className="w-5 h-5" />,
      beginnerExplanation:
        'Activation is the final step where your CDP delivers real business value. Connect an outbound Destination—such as Braze, Meta Custom Audiences, Google Ads, Snowflake, Amazon S3, or a Webhook—and stream your DULE-cleared segment directly to it.',
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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto h-full text-[#1E2229]">
      {/* Top Blue Gradient Header */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <PageBackButton fallbackTab="home" fallbackLabel="Home" className="mt-0.5 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
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

      {/* Beginner End-to-End Architecture Overview */}
      <div className="bg-white rounded-xl border border-[#E1E5EA] p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#1E2229]">
              How a Real-Time CDP Works (Big Picture)
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Each step builds on the previous stage. Complete Step 1 first to unlock Step 2, ending with Destination Activation in Step {totalSteps}.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#0D66D0] tabular-nums shrink-0">
            Active: {allCompleted ? `All ${totalSteps} Complete` : `Step ${currentActiveStep} of ${totalSteps}`}
          </span>
        </div>

        {/* 6-Stage Visual Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {steps.map((s) => {
            const isDone = completedSteps.includes(s.stepNumber);
            const isCurrent = s.stepNumber === currentActiveStep;
            return (
              <div
                key={s.stepNumber}
                className={`px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                  isDone
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#0E7A36]'
                    : isCurrent
                    ? 'bg-[#EBF3FC] border-[#1473E6] text-[#0D66D0]'
                    : 'bg-[#F3F4F6] border-[#E1E5EA] text-[#64748B] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                  <span>Step 0{s.stepNumber}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7A36]" />
                  ) : !isCurrent ? (
                    <Lock className="w-3 h-3 text-[#64748B]" />
                  ) : null}
                </div>
                <p className="font-semibold mt-1 truncate" title={s.shortLabel}>
                  {s.shortLabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sequential Vertical Track (One Step Per Section) */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.stepNumber);
          const isCurrent = step.stepNumber === currentActiveStep;
          const isLocked = step.stepNumber > currentActiveStep;
          const isReviewExpanded = expandedReviewedSteps.includes(step.stepNumber);

          /* LOCKED / GREYED OUT STEP */
          if (isLocked) {
            return (
              <section
                key={step.stepNumber}
                aria-disabled="true"
                className="bg-[#F1F3F6] rounded-xl border border-[#D8DEE6] p-5 opacity-60 select-none transition-opacity"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#E2E8F0] border border-[#CBD5E1] text-[#64748B] flex items-center justify-center font-mono text-sm font-bold shrink-0">
                      {step.stepNumber}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#64748B]">
                        {step.domain} · Locked
                      </div>
                      <h3 className="text-sm font-bold text-[#475569] mt-0.5">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Complete Step {step.stepNumber - 1} first to unlock this section.
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#E2E8F0] text-[#475569] text-xs font-semibold shrink-0 self-start sm:self-center">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </div>
                </div>
              </section>
            );
          }

          /* COMPLETED STEP (Compact Header + Optional Review Toggle) */
          if (isCompleted && !isReviewExpanded) {
            return (
              <section
                key={step.stepNumber}
                className="bg-[#F8FAFC] rounded-xl border border-[#BBF7D0] p-5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#DEFBE6] border border-[#86EFAC] text-[#0E7A36] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#0E7A36]">
                        Step {step.stepNumber} Completed · {step.workspaceCountLabel}: <span className="font-mono tabular-nums">{step.workspaceCount}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#1E2229] truncate mt-0.5">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(step.actions[0].tab)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#1E2229] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      Open Module
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleReviewStep(step.stepNumber)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#475569] text-xs font-medium inline-flex items-center space-x-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      <span>Review</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            );
          }

          /* CURRENT ACTIVE STEP (or Completed Step Expanded for Review) */
          return (
            <section
              key={step.stepNumber}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                isCurrent ? 'border-[#1473E6]' : 'border-[#86EFAC]'
              }`}
            >
              {/* Blue Gradient Step Header */}
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white text-[#0D66D0] flex items-center justify-center font-mono text-sm font-bold shrink-0">
                    {isCompleted ? <Check className="w-5 h-5 text-[#0E7A36]" /> : step.stepNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-blue-100 font-medium">
                      {step.domain} · {isCompleted ? 'Completed' : 'Active Step'}
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-mono font-semibold text-white bg-white/15 border border-white/25 px-3 py-1 rounded-lg tabular-nums">
                    {step.workspaceCountLabel}: {step.workspaceCount}
                  </span>
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => toggleReviewStep(step.stepNumber)}
                      className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-medium inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Collapse</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Step Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Beginner Concept Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wide">
                      What This Means (For Beginners)
                    </h4>
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                      {step.beginnerExplanation}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wide">
                      Why Real-Time CDP Needs This
                    </h4>
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                      {step.howCdpUsesIt}
                    </p>
                    <p className="text-xs font-medium text-[#0D66D0] pt-1">
                      {step.workspaceReadyText}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E1E5EA]" />

                {/* Concrete Action Checklist: What to Select & Do */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wide">
                    What You Should Do &amp; Select in This Step
                  </h4>

                  <div className="space-y-2.5">
                    {step.whatToSelect.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA]"
                      >
                        <span className="w-5 h-5 rounded-md bg-[#EBF3FC] text-[#0D66D0] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1E2229]">
                            {item.label}
                          </p>
                          <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {step.extraGuidanceNote && (
                    <div className="p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#78350F] leading-relaxed">
                      <strong className="font-bold">Privacy Selection Tip: </strong>
                      {step.extraGuidanceNote}
                    </div>
                  )}
                </div>

                {/* Action Footer: Try in Module + Complete Step */}
                <div className="pt-4 border-t border-[#E1E5EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {step.actions.map((act) => (
                      <button
                        key={act.tab}
                        type="button"
                        onClick={() => setActiveTab(act.tab)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          act.primary
                            ? 'bg-[#EBF3FC] hover:bg-[#DCEAF9] text-[#0D66D0] border border-[#BFDBFE]'
                            : 'bg-white hover:bg-[#F2F4F7] text-[#1E2229] border border-[#D5D5D5]'
                        }`}
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleCompleteStep(step.stepNumber)}
                      className="px-4 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold inline-flex items-center justify-center space-x-1.5 whitespace-nowrap shrink-0 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {step.stepNumber < totalSteps
                          ? `Complete Step ${step.stepNumber} & Unlock Step ${step.stepNumber + 1}`
                          : `Complete Step ${totalSteps} & Finish Guide`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* All Steps Completed Summary */}
      {allCompleted && (
        <div className="bg-white rounded-xl border border-[#86EFAC] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#DEFBE6] border border-[#86EFAC] text-[#0E7A36] flex items-center justify-center shrink-0">
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
    </div>
  );
};
