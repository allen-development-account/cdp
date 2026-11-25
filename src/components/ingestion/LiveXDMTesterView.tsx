import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { CustomerProfile, CDPEvent } from '../../types/cdp';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Code,
  Layers,
  Activity,
  Send,
  RefreshCw,
  GitMerge,
  ShieldCheck,
  Check,
  FileJson,
  RotateCcw,
  Tag,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';

interface XDMTemplate {
  id: string;
  name: string;
  eventType: string;
  category: string;
  description: string;
  channel: CDPEvent['channel'];
  schemaId: string;
  defaultPayload: Record<string, any>;
}

const PRESET_XDM_TEMPLATES: XDMTemplate[] = [
  {
    id: 'commerce_purchase',
    name: 'commerce.orderPurchases',
    eventType: 'Purchase',
    category: 'Commerce',
    description: 'Customer completes an e-commerce transaction with line items, currency, and revenue attribution.',
    channel: 'Web SDK',
    schemaId: 'xdm_experience_event',
    defaultPayload: {
      _id: 'evt_order_' + Math.floor(100000 + Math.random() * 900000),
      eventType: 'commerce.purchases',
      timestamp: new Date().toISOString(),
      identityMap: {
        email: [{ id: 'sofia.tanaka@designstudios.jp', authenticatedState: 'authenticated' }],
        ecid: [{ id: 'ecid_840192847192', authenticatedState: 'ambiguous' }]
      },
      commerce: {
        order: {
          purchaseID: 'PO-2026-98102',
          priceTotal: 499.00,
          currencyCode: 'USD',
          payments: [{ paymentType: 'CreditCard', paymentAmount: 499.00 }]
        },
        purchases: {
          value: 1
        }
      },
      productListItems: [
        {
          SKU: 'SKU_PRO_STUDIO_MONITOR',
          name: '4K Ultra-Wide Studio Display',
          priceTotal: 499.00,
          quantity: 1
        }
      ]
    }
  },
  {
    id: 'web_pageview',
    name: 'web.webpagedetails.pageViews',
    eventType: 'PageView',
    category: 'Web & Mobile',
    description: 'Real-time telemetry of visitor browsing content, URL parameters, and campaign attribution tags.',
    channel: 'Web SDK',
    schemaId: 'xdm_experience_event',
    defaultPayload: {
      _id: 'evt_pv_' + Math.floor(100000 + Math.random() * 900000),
      eventType: 'web.webpagedetails.pageViews',
      timestamp: new Date().toISOString(),
      identityMap: {
        ecid: [{ id: 'cid_anon_temp_5104', authenticatedState: 'ambiguous' }],
        crmId: [{ id: 'CRM_90214', authenticatedState: 'authenticated' }]
      },
      web: {
        webPageDetails: {
          name: 'Enterprise Cloud Security Architecture - Product Overview',
          URL: 'https://enterprisecorp.io/solutions/cloud-security?utm_source=linkedin&utm_campaign=q3_brand',
          siteSection: 'Solutions'
        },
        webReferrer: {
          URL: 'https://www.linkedin.com/feed/'
        }
      },
      device: {
        screenHeight: 1080,
        screenWidth: 1920,
        type: 'Desktop'
      }
    }
  },
  {
    id: 'app_launch',
    name: 'application.appLaunches',
    eventType: 'AppLaunch',
    category: 'Mobile Native',
    description: 'Native mobile app cold launch event carrying device diagnostics, OS versions, and push tokens.',
    channel: 'Mobile SDK',
    schemaId: 'xdm_experience_event',
    defaultPayload: {
      _id: 'evt_app_' + Math.floor(100000 + Math.random() * 900000),
      eventType: 'application.appLaunches',
      timestamp: new Date().toISOString(),
      identityMap: {
        phone: [{ id: '+1-555-0192', authenticatedState: 'authenticated' }],
        ecid: [{ id: 'ecid_mobile_apple_710', authenticatedState: 'ambiguous' }]
      },
      application: {
        name: 'XLR8 Mobile Pro iOS',
        version: 'v4.8.2 (Build 384)',
        launches: { value: 1 }
      },
      environment: {
        carrier: 'Verizon Ultra LTE',
        operatingSystem: 'iOS 17.5.1',
        type: 'mobile'
      }
    }
  },
  {
    id: 'cart_add',
    name: 'commerce.cartAdditions',
    eventType: 'AddToCart',
    category: 'Commerce',
    description: 'High-intent behavioral signal when a shopper places an item into their digital checkout cart.',
    channel: 'Web SDK',
    schemaId: 'xdm_experience_event',
    defaultPayload: {
      _id: 'evt_cart_' + Math.floor(100000 + Math.random() * 900000),
      eventType: 'commerce.cartAdditions',
      timestamp: new Date().toISOString(),
      identityMap: {
        email: [{ id: 'alex.rivera@enterprisecorp.io', authenticatedState: 'authenticated' }]
      },
      commerce: {
        cart: {
          cartID: 'CART_ACTIVE_8819',
          cartTotal: 1250.00
        }
      },
      productListItems: [
        {
          SKU: 'SKU_ENTERPRISE_CORE_LIC',
          name: 'Cloud Data Platform Developer Seat',
          priceTotal: 1250.00,
          quantity: 1
        }
      ]
    }
  },
  {
    id: 'consent_pref',
    name: 'consent.preferences',
    eventType: 'ConsentUpdate',
    category: 'Privacy & DULE',
    description: 'Dynamic privacy preferences update modifying GDPR, CCPA, and marketing communication opt-ins.',
    channel: 'Kafka Ingestion',
    schemaId: 'xdm_consent',
    defaultPayload: {
      _id: 'evt_consent_' + Math.floor(100000 + Math.random() * 900000),
      eventType: 'consent.preferences',
      timestamp: new Date().toISOString(),
      identityMap: {
        email: [{ id: 'elena.rostova@fintech-security.de', authenticatedState: 'authenticated' }]
      },
      consents: {
        gdpr_opt_in: true,
        ccpa_opt_out: false,
        marketing_email_opt_in: true,
        third_party_ad_sharing: false
      }
    }
  }
];

export const LiveXDMTesterView: React.FC = () => {
  const { profiles, audiences, ingestEvent, setSelectedProfileId, setActiveTab } = useCDP();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('commerce_purchase');
  const [targetProfileId, setTargetProfileId] = useState<string>(profiles[0]?.id || '');
  const [jsonText, setJsonText] = useState<string>(() => {
    return JSON.stringify(PRESET_XDM_TEMPLATES[0].defaultPayload, null, 2);
  });
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Execution & Pipeline Trace State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    profileId: string;
    isNew: boolean;
    isMerged: boolean;
    matchedIdentifiers: string[];
    segmentsJoined: string[];
    segmentsLeft: string[];
    latencyBreakdown: { step: string; ms: number }[];
    totalLatencyMs: number;
    profileBefore?: CustomerProfile;
    profileAfter?: CustomerProfile;
    syndicatedDestinations: string[];
  } | null>(null);

  const selectedTemplate = PRESET_XDM_TEMPLATES.find(t => t.id === selectedTemplateId) || PRESET_XDM_TEMPLATES[0];

  // Handle template selection
  const handleSelectTemplate = (template: XDMTemplate) => {
    setSelectedTemplateId(template.id);
    const payloadCopy = JSON.parse(JSON.stringify(template.defaultPayload));
    payloadCopy.timestamp = new Date().toISOString();
    setJsonText(JSON.stringify(payloadCopy, null, 2));
    setJsonError(null);
    setExecutionResult(null);
  };

  // Quick-fill identity from selected profile
  const handleInjectProfileIdentity = (profileId: string) => {
    setTargetProfileId(profileId);
    const target = profiles.find(p => p.id === profileId);
    if (!target) return;

    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.identityMap) parsed.identityMap = {};

      if (target.primaryEmail) {
        parsed.identityMap.email = [{ id: target.primaryEmail, authenticatedState: 'authenticated' }];
      }
      const cookieNode = target.identities.find(i => i.type === 'cookie');
      if (cookieNode) {
        parsed.identityMap.ecid = [{ id: cookieNode.value, authenticatedState: 'ambiguous' }];
      }
      const phoneNode = target.identities.find(i => i.type === 'phone');
      if (phoneNode) {
        parsed.identityMap.phone = [{ id: phoneNode.value, authenticatedState: 'authenticated' }];
      }

      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      // ignore parse error if currently malformed
    }
  };

  // Format JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError('Invalid JSON: ' + e.message);
    }
  };

  // Fire ExperienceEvent simulation
  const handleFireEvent = async () => {
    let parsedPayload: Record<string, any>;
    try {
      parsedPayload = JSON.parse(jsonText);
      setJsonError(null);
    } catch (e: any) {
      setJsonError('Cannot execute: ' + e.message);
      return;
    }

    setIsExecuting(true);
    setCurrentStepIndex(0);
    setExecutionResult(null);

    // Capture profile state before execution
    const profileBefore = profiles.find(p =>
      p.id === targetProfileId ||
      (parsedPayload.identityMap?.email?.[0]?.id && p.primaryEmail === parsedPayload.identityMap.email[0].id) ||
      (parsedPayload.identityMap?.ecid?.[0]?.id && p.identities.some(i => i.value === parsedPayload.identityMap.ecid[0].id))
    );

    // Step 1: Ingestion Gateway
    await new Promise(r => setTimeout(r, 120));
    setCurrentStepIndex(1);

    // Step 2: XDM Normalization
    await new Promise(r => setTimeout(r, 150));
    setCurrentStepIndex(2);

    // Step 3: Identity Graph Stitching
    await new Promise(r => setTimeout(r, 180));
    setCurrentStepIndex(3);

    // Step 4: Real-time Evaluation & Ingestion
    const res = ingestEvent(parsedPayload, selectedTemplate.channel, selectedTemplate.schemaId);
    await new Promise(r => setTimeout(r, 140));
    setCurrentStepIndex(4);

    const profileAfter = profiles.find(p => p.id === res.profileId);

    const latencyBreakdown = [
      { step: 'Edge Gateway Receipt & TLS', ms: 1.2 },
      { step: 'XDM Schema Validation & DULE', ms: 0.8 },
      { step: 'Identity Graph Resolution', ms: 1.4 },
      { step: 'Streaming PQL Audience Evaluation', ms: 1.9 }
    ];
    const totalLatencyMs = Number(latencyBreakdown.reduce((s, c) => s + c.ms, 0).toFixed(1));

    const mockDestinations = ['Meta Conversions API (CAPI)', 'Braze Real-Time Webhook', 'Google Ads Enhanced Conversions'];

    setExecutionResult({
      success: res.success,
      profileId: res.profileId,
      isNew: res.isNew,
      isMerged: res.isMerged,
      matchedIdentifiers: res.matchedIdentifiers,
      segmentsJoined: res.segmentsJoined || [],
      segmentsLeft: res.segmentsLeft || [],
      latencyBreakdown,
      totalLatencyMs,
      profileBefore: profileBefore ? JSON.parse(JSON.stringify(profileBefore)) : undefined,
      profileAfter: profileAfter ? JSON.parse(JSON.stringify(profileAfter)) : undefined,
      syndicatedDestinations: mockDestinations
    });

    setIsExecuting(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="ingestion" fallbackLabel="Data Ingestion & Streams" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Zap className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Live XDM Event Ingestion Tester & Edge Simulator</h2>
              <span className="text-[10px] bg-white/15 text-sky-200 border border-sky-200/40 font-bold px-2 py-0.5 rounded uppercase">
                Sub-5ms Edge SLA
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Fire sample ExperienceEvents across commerce, web, mobile, and privacy schemas to observe real-time identity graph stitching and instant segment qualification.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-mono bg-white/15 text-blue-100 border border-white/25 px-3 py-1.5 rounded font-semibold">
            Active Datastream: <strong className="text-white">ds_edge_prod_01</strong>
          </span>
        </div>
      </div>

      {/* Preset Templates Selector Cards */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#596780] uppercase tracking-wider block">
          Select Standardized XDM Event Template
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESET_XDM_TEMPLATES.map(tmpl => {
            const isSelected = tmpl.id === selectedTemplateId;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className={`p-3 rounded border text-left transition-all ${
                  isSelected
                    ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6] shadow-2xs'
                    : 'bg-white border-[#E1E5EA] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-[#596780]">{tmpl.category}</span>
                  <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#CBD5E1] text-[#1473E6] font-semibold">
                    {tmpl.channel}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1E2229] font-mono truncate">{tmpl.name}</p>
                <p className="text-[11px] text-[#596780] line-clamp-2 mt-1 leading-snug">{tmpl.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Left Code Editor + Right Pipeline Trace & Sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: JSON Payload Editor & Quick Parameters */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-white shrink-0" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live XDM Payload Editor
                </h3>
              </div>

              {/* Quick Profile Injector */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-blue-100 font-semibold">Inject Persona:</span>
                <select
                  value={targetProfileId}
                  onChange={e => handleInjectProfileIdentity(e.target.value)}
                  className="px-2 py-1 bg-white border border-white/30 rounded text-[11px] font-semibold text-[#0F172A] focus:outline-none"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.unifiedName} ({p.primaryEmail || p.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 space-y-3">

            {/* Editor Area */}
            <div className="relative">
              <textarea
                value={jsonText}
                onChange={e => {
                  setJsonText(e.target.value);
                  setJsonError(null);
                }}
                rows={16}
                spellCheck={false}
                className="w-full p-3 font-mono text-xs bg-[#0F172A] text-[#F8FAFC] rounded-lg border border-[#334155] focus:ring-2 focus:ring-[#1473E6] focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {jsonError && (
              <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#0A3D82] rounded text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleFormatJson}
                className="px-3 py-1.5 text-xs font-semibold text-[#596780] hover:text-[#1E2229] bg-[#F2F4F7] hover:bg-[#E1E5EA] rounded border border-[#D0D7DE] transition-colors flex items-center space-x-1"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Format JSON</span>
              </button>

              <button
                type="button"
                onClick={handleFireEvent}
                disabled={isExecuting}
                className={`px-5 py-2 rounded text-xs font-bold transition-all flex items-center space-x-2 shadow-2xs ${
                  isExecuting
                    ? 'bg-[#CBD5E1] text-[#64748B] cursor-wait'
                    : 'bg-[#1473E6] hover:bg-[#0D66D0] text-white cursor-pointer'
                }`}
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing at Edge...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Fire ExperienceEvent to Edge</span>
                  </>
                )}
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Right: Pipeline Trace & Real-Time Qualification Badges */}
        <div className="lg:col-span-6 space-y-4">
          {/* Step-by-Step Edge Pipeline Trace */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-white shrink-0" />
                  <span>Real-Time Edge Pipeline Trace</span>
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Sub-second stages executed across global edge points of presence.
                </p>
              </div>

              {executionResult && (
                <span className="text-xs font-mono font-bold text-[#0369A1] bg-[#E0F2FE] border border-[#BAE6FD] px-2.5 py-0.5 rounded shrink-0">
                  {executionResult.totalLatencyMs}ms Total Latency
                </span>
              )}
            </div>

            <div className="p-5">
            {/* Pipeline Steps List */}
            <div className="space-y-2.5">
              {[
                {
                  stepNumber: 1,
                  title: 'Edge Gateway Receipt & Authentication',
                  desc: 'Receives HTTP/3 event at nearest POP, verifies HMAC credentials, validates JSON syntax.'
                },
                {
                  stepNumber: 2,
                  title: 'XDM Schema Normalization & DULE Tagging',
                  desc: 'Normalizes fields against schema registry, attaches DULE C/I/S privacy classifications.'
                },
                {
                  stepNumber: 3,
                  title: 'Identity Graph Deterministic Resolution',
                  desc: 'Resolves ECID, CRM ID, and email namespaces against customer graph cluster.'
                },
                {
                  stepNumber: 4,
                  title: 'Instant Segment Qualification (PQL Evaluation)',
                  desc: 'Evaluates streaming audience criteria, updates profile timeline, dispatches webhooks.'
                }
              ].map((step, idx) => {
                const isCurrent = isExecuting && currentStepIndex === idx;
                const isCompleted = currentStepIndex > idx || (executionResult !== null && !isExecuting);

                return (
                  <div
                    key={step.stepNumber}
                    className={`p-3 rounded border transition-all flex items-start space-x-3 ${
                      isCurrent
                        ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                        : isCompleted
                        ? 'bg-[#F8FAFC] border-[#CBD5E1]'
                        : 'bg-white border-[#E1E5EA] opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${
                        isCompleted
                          ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]'
                          : isCurrent
                          ? 'bg-[#1473E6] text-white animate-pulse'
                          : 'bg-[#F2F4F7] text-[#596780] border border-[#D0D7DE]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.stepNumber}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1E2229]">{step.title}</p>
                        {executionResult?.latencyBreakdown[idx] && (
                          <span className="text-[10px] font-mono text-[#596780]">
                            {executionResult.latencyBreakdown[idx].ms}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#596780] mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Dynamic Segment Qualification Badge Flashes & Profile Delta */}
          {executionResult && (
            <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-white shrink-0" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Profile State & Qualification Delta
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileId(executionResult.profileId);
                    setActiveTab('profiles');
                  }}
                  className="text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/25 text-white px-2.5 py-1 rounded-md flex items-center space-x-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  <span>Inspect 360 Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-5 space-y-4">
              {/* Segment Flashes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#596780] tracking-wider block">
                  Dynamic Segment Qualification Changes
                </span>

                {executionResult.segmentsJoined.length === 0 && executionResult.segmentsLeft.length === 0 ? (
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E5EA] rounded text-xs text-[#596780] flex items-center justify-between">
                    <span>Active audience memberships retained without new transitions.</span>
                    <span className="font-mono text-[10px] font-semibold text-[#1E2229]">
                      {executionResult.profileAfter?.qualifyingAudienceIds?.length || 0} active segments
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {/* Joined */}
                    {executionResult.segmentsJoined.map(segId => {
                      const seg = audiences.find(a => a.id === segId);
                      return (
                        <div
                          key={segId}
                          className="px-3 py-1.5 rounded bg-[#E0F2FE] border border-[#0284C7] text-[#0369A1] font-bold text-xs flex items-center space-x-1.5 shadow-2xs animate-bounce"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>+ JOINED: {seg?.name || segId}</span>
                        </div>
                      );
                    })}

                    {/* Left */}
                    {executionResult.segmentsLeft.map(segId => {
                      const seg = audiences.find(a => a.id === segId);
                      return (
                        <div
                          key={segId}
                          className="px-3 py-1.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#0A3D82] font-bold text-xs flex items-center space-x-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>- LEFT: {seg?.name || segId}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Attributes Before vs After Delta */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA]">
                  <span className="text-[10px] font-bold uppercase text-[#596780]">Resolved Customer</span>
                  <p className="text-xs font-bold text-[#1E2229] truncate mt-0.5">
                    {executionResult.profileAfter?.unifiedName || executionResult.profileId}
                  </p>
                  <p className="text-[10px] font-mono text-[#596780] truncate">{executionResult.profileId}</p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA]">
                  <span className="text-[10px] font-bold uppercase text-[#596780]">Total Lifetime Spend</span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="text-xs font-mono line-through text-[#8C95A6]">
                      ${(executionResult.profileBefore?.attributes?.totalSpend || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0284C7]">
                      &rarr; ${(executionResult.profileAfter?.attributes?.totalSpend || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Syndication Dispatch */}
              <div className="p-3 bg-[#FAFBFD] rounded border border-[#CBD5E1] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1E2229]">
                  <Send className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Real-Time Outbound Syndication Dispatched</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {executionResult.syndicatedDestinations.map(d => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-[#CBD5E1] text-[#0D66D0]"
                    >
                      {d} &bull; Delivered (&lt; 20ms)
                    </span>
                  ))}
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
