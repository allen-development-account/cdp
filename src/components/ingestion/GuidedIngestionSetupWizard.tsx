import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { IngestionSource } from '../../types/cdp';
import {
  Globe,
  Smartphone,
  Store,
  Database,
  Terminal,
  Layers,
  Radio,
  X,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Cpu,
  Key,
  ShieldCheck,
  Send
} from 'lucide-react';

interface GuidedIngestionSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceType?: string;
}

interface SourceTemplate {
  id: string;
  name: string;
  channel: 'Web SDK' | 'Mobile SDK' | 'Salesforce CRM' | 'Snowflake Batch' | 'POS Terminal' | 'Kafka Ingestion';
  type: 'Streaming' | 'Batch' | 'Webhook';
  category: 'Web & Mobile' | 'Enterprise CRM' | 'Data Warehouses' | 'Commerce & Retail' | 'Event Streams';
  icon: string;
  description: string;
  defaultSchema: string;
  defaultIdentity: string;
  latencyMs: number;
}

const AVAILABLE_SOURCE_TEMPLATES: SourceTemplate[] = [
  {
    id: 'tpl_web_sdk',
    name: 'XLR8 Platform Web SDK',
    channel: 'Web SDK',
    type: 'Streaming',
    category: 'Web & Mobile',
    icon: 'globe',
    description: 'Lightweight client-side tag streaming real-time page visits, clicks, and conversions into the Edge Network.',
    defaultSchema: 'xdm_experience_event',
    defaultIdentity: 'ECID (Experience Cloud ID) & Email',
    latencyMs: 2.4
  },
  {
    id: 'tpl_mobile_sdk',
    name: 'Mobile SDK (iOS & Android)',
    channel: 'Mobile SDK',
    type: 'Streaming',
    category: 'Web & Mobile',
    icon: 'smartphone',
    description: 'Native mobile app telemetry capturing screen views, push notifications, and in-app transactions.',
    defaultSchema: 'xdm_experience_event',
    defaultIdentity: 'IDFA / GAID Device Token',
    latencyMs: 3.1
  },
  {
    id: 'tpl_salesforce',
    name: 'Salesforce CRM Webhook',
    channel: 'Salesforce CRM',
    type: 'Webhook',
    category: 'Enterprise CRM',
    icon: 'store',
    description: 'Bi-directional Change Data Capture (CDC) syncing contact updates, leads, and account lifecycle statuses.',
    defaultSchema: 'xdm_individual_profile',
    defaultIdentity: 'CRM Identifier (SFDC ID) & Email',
    latencyMs: 4.8
  },
  {
    id: 'tpl_snowflake',
    name: 'Snowflake Data Cloud Sync',
    channel: 'Snowflake Batch',
    type: 'Batch',
    category: 'Data Warehouses',
    icon: 'database',
    description: 'Federated micro-batch ingestion syncing enterprise customer tables directly from your cloud warehouse.',
    defaultSchema: 'xdm_individual_profile',
    defaultIdentity: 'Master Account ID & Email',
    latencyMs: 120.0
  },
  {
    id: 'tpl_kafka',
    name: 'Apache Kafka / Confluent Stream',
    channel: 'Kafka Ingestion',
    type: 'Streaming',
    category: 'Event Streams',
    icon: 'radio',
    description: 'Sub-second real-time event pipeline consuming partitioned Kafka telemetry topics at high throughput.',
    defaultSchema: 'xdm_experience_event',
    defaultIdentity: 'User GUID & Cookie ID',
    latencyMs: 1.8
  },
  {
    id: 'tpl_pos',
    name: 'Retail POS Terminal Stream',
    channel: 'POS Terminal',
    type: 'Streaming',
    category: 'Commerce & Retail',
    icon: 'store',
    description: 'In-store point-of-sale checkout stream connecting physical store transactions with digital customer profiles.',
    defaultSchema: 'xdm_experience_event',
    defaultIdentity: 'Loyalty Barcode & Phone',
    latencyMs: 5.2
  },
  {
    id: 'tpl_rest_api',
    name: 'Edge Streaming REST API & Webhooks',
    channel: 'Web SDK',
    type: 'Streaming',
    category: 'Web & Mobile',
    icon: 'radio',
    description: 'Direct server-to-server HTTPS POST endpoint forwarding microservice events with sub-5ms latency.',
    defaultSchema: 'xdm_experience_event',
    defaultIdentity: 'Customer Email & API Key',
    latencyMs: 3.5
  },
  {
    id: 'tpl_file_upload',
    name: 'Batch File Ingestion (CSV / JSON)',
    channel: 'Snowflake Batch',
    type: 'Batch',
    category: 'Data Warehouses',
    icon: 'database',
    description: 'Structured batch file ingestion for customer profiles, historical purchase transactions, or offline lists.',
    defaultSchema: 'xdm_individual_profile',
    defaultIdentity: 'Primary Email & Customer GUID',
    latencyMs: 95.0
  },
  {
    id: 'tpl_s3',
    name: 'Cloud Storage Bucket (AWS S3 / GCS)',
    channel: 'Snowflake Batch',
    type: 'Batch',
    category: 'Data Warehouses',
    icon: 'database',
    description: 'Automated polling of Parquet or JSON buckets with IAM Role delegation and schema validation.',
    defaultSchema: 'xdm_individual_profile',
    defaultIdentity: 'Customer Email & Account ID',
    latencyMs: 140.0
  }
];

export const GuidedIngestionSetupWizard: React.FC<GuidedIngestionSetupWizardProps> = ({
  isOpen,
  onClose,
  initialSourceType = 'tpl_web_sdk'
}) => {
  const { addSource, ingestEvent, schemas } = useCDP();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<SourceTemplate>(() => {
    return AVAILABLE_SOURCE_TEMPLATES.find(t => t.id === initialSourceType) || AVAILABLE_SOURCE_TEMPLATES[0];
  });

  // Step 2 Form State
  const [streamName, setStreamName] = useState(selectedTemplate.name);
  const [targetSchema, setTargetSchema] = useState(selectedTemplate.defaultSchema);
  const [identityKey, setIdentityKey] = useState(selectedTemplate.defaultIdentity);
  const [selectedLanguageTab, setSelectedLanguageTab] = useState<'javascript' | 'curl' | 'python'>('javascript');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Step 3 Test State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [activatedSource, setActivatedSource] = useState<IngestionSource | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: SourceTemplate) => {
    setSelectedTemplate(template);
    setStreamName(template.name);
    setTargetSchema(template.defaultSchema);
    setIdentityKey(template.defaultIdentity);
  };

  const getSourceIcon = (icon: string) => {
    switch (icon) {
      case 'globe': return <Globe className="w-5 h-5 text-[#1473E6]" />;
      case 'smartphone': return <Smartphone className="w-5 h-5 text-[#0E7A36]" />;
      case 'store': return <Store className="w-5 h-5 text-[#E68619]" />;
      case 'database': return <Database className="w-5 h-5 text-[#5C2B97]" />;
      default: return <Radio className="w-5 h-5 text-[#1473E6]" />;
    }
  };

  const ingressEndpoint = `https://edge.xprplatform.io/ee/v1/interact?configId=xpr_prod_${selectedTemplate.channel.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const getCodeSnippet = () => {
    switch (selectedLanguageTab) {
      case 'javascript':
        return `// XLR8 Web SDK Ingestion Tag
import { createInstance } from '@xpr/alloy-sdk';

const xpr = createInstance({ name: 'xprCDP' });
xpr('configure', {
  edgeDomain: 'edge.xprplatform.io',
  datastreamId: '${selectedTemplate.id}',
  orgId: 'ORG_ENTERPRISE_GLOBAL@XLR8'
});

// Stream real-time experience event
xpr('sendEvent', {
  xdm: {
    eventType: 'web.webpagedetails.pageViews',
    identityMap: {
      email: [{ id: 'alex.rivera@enterprisecorp.io', authenticatedState: 'authenticated' }]
    },
    web: {
      webPageDetails: { name: 'Homepage - Hero Banner', URL: window.location.href }
    }
  }
});`;
      case 'curl':
        return `# cURL Direct Streaming Ingress to Edge Pipeline
curl -X POST "${ingressEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer XLR8_TOKEN_SANDBOX_LIVE" \\
  -d '{
    "customer_email": "elena.rostova@cloudscale.io",
    "anon_cookie_id": "ck_edge_9842719",
    "event_name": "ProductPageView",
    "channel": "${selectedTemplate.channel}",
    "total_amount": 185.00
  }'`;
      case 'python':
        return `# Python Server-Side Real-Time Ingress
import requests
import json

payload = {
    "customer_email": "marcus.chen@fintech.io",
    "crm_id": "SFDC-992144",
    "event_name": "AccountActivated",
    "channel": "${selectedTemplate.channel}"
}

response = requests.post(
    "${ingressEndpoint}",
    headers={"Content-Type": "application/json"},
    data=json.dumps(payload)
)
print("Ingestion Status:", response.status_code) # 200 OK`;
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleTriggerVerificationAndActivate = () => {
    setIsVerifying(true);
    setVerificationProgress(1);

    setTimeout(() => {
      setVerificationProgress(2);
    }, 400);

    setTimeout(() => {
      setVerificationProgress(3);

      // Ingest the initial verification payload to establish identity node
      const samplePayload = {
        customer_email: 'new.user.onboarding@acme.com',
        anon_cookie_id: `ck_init_${Date.now().toString().slice(-6)}`,
        event_name: 'FirstStreamActivation',
        channel: selectedTemplate.channel,
        streamName,
        targetSchema,
        primaryIdentityKey: identityKey,
        timestamp: new Date().toISOString()
      };

      ingestEvent(samplePayload, selectedTemplate.channel, targetSchema);

      const newSource: IngestionSource = {
        id: `src_${selectedTemplate.channel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
        name: streamName,
        type: selectedTemplate.type,
        status: 'Healthy',
        todayEventCount: 1,
        ratePerSec: 18,
        latencyMs: selectedTemplate.latencyMs,
        description: `Verified inbound ${selectedTemplate.type} stream for ${selectedTemplate.channel}.`,
        icon: selectedTemplate.icon,
        category: selectedTemplate.category
      };

      addSource(newSource);
      setActivatedSource(newSource);
      setIsVerifying(false);
      setVerificationSuccess(true);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#D5D5D5] rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E5EA] bg-[#F8F9FA]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                Guided Onboarding • Step {currentStep} of 3
              </span>
              <h3 className="text-sm font-bold text-[#2C2C2C]">
                {currentStep === 1 && 'Connect Your First Data Source'}
                {currentStep === 2 && 'Configure Stream Contract & Schema'}
                {currentStep === 3 && 'Send First Telemetry Event & Verify'}
              </h3>
            </div>
            <p className="text-xs text-[#1E2229] mt-0.5">
              {currentStep === 1 && 'Select an ingestion connector archetype to start streaming telemetry.'}
              {currentStep === 2 && 'Define endpoint mapping, canonical XDM schema, and primary identity keys.'}
              {currentStep === 3 && 'Send a live verification payload to establish real-time identity stitching.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1E2229] hover:text-[#2C2C2C] hover:bg-[#E1E5EA] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 border-b border-[#E1E5EA] bg-[#FFFFFF] text-xs font-semibold">
          <button
            onClick={() => !verificationSuccess && setCurrentStep(1)}
            className={`py-2.5 px-4 text-center flex items-center justify-center space-x-2 border-b-2 transition-all ${
              currentStep === 1
                ? 'border-[#1473E6] text-[#1473E6] bg-[#F2F7FE]'
                : currentStep > 1
                ? 'border-[#0E7A36] text-[#0E7A36]'
                : 'border-transparent text-[#1E2229]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 1 ? 'bg-[#1473E6] text-white' : currentStep > 1 ? 'bg-[#0E7A36] text-white' : 'bg-[#E1E5EA] text-[#1E2229]'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span>Select Source</span>
          </button>

          <button
            onClick={() => !verificationSuccess && setCurrentStep(2)}
            className={`py-2.5 px-4 text-center flex items-center justify-center space-x-2 border-b-2 transition-all ${
              currentStep === 2
                ? 'border-[#1473E6] text-[#1473E6] bg-[#F2F7FE]'
                : currentStep > 2
                ? 'border-[#0E7A36] text-[#0E7A36]'
                : 'border-transparent text-[#1E2229]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 2 ? 'bg-[#1473E6] text-white' : currentStep > 2 ? 'bg-[#0E7A36] text-white' : 'bg-[#E1E5EA] text-[#1E2229]'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span>Schema & Keys</span>
          </button>

          <div
            className={`py-2.5 px-4 text-center flex items-center justify-center space-x-2 border-b-2 transition-all ${
              currentStep === 3
                ? 'border-[#1473E6] text-[#1473E6] bg-[#F2F7FE]'
                : 'border-transparent text-[#1E2229]'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 3 ? 'bg-[#1473E6] text-white' : 'bg-[#E1E5EA] text-[#1E2229]'
            }`}>
              3
            </span>
            <span>Verify & Stream</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Select Source Archetype */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_SOURCE_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`p-4 rounded border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#1473E6] bg-[#F2F7FE] ring-1 ring-[#1473E6]'
                          : 'border-[#E1E5EA] bg-white hover:border-[#B5C8E8] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 rounded bg-white border border-[#E1E5EA]">
                            {getSourceIcon(tmpl.icon)}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tmpl.type === 'Streaming'
                              ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]'
                              : tmpl.type === 'Webhook'
                              ? 'bg-[#F1E8FF] text-[#5C2B97] border border-[#D0B3FF]'
                              : 'bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]'
                          }`}>
                            {tmpl.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                          <span>{tmpl.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1473E6]" />}
                        </h4>
                        <p className="text-[11px] text-[#1E2229] mt-1 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#E1E5EA] flex items-center justify-between text-[10px] text-[#1E2229] font-mono">
                        <span>Latency: ~{tmpl.latencyMs}ms</span>
                        <span className="font-sans font-semibold text-[#1473E6]">Select & Configure →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Configure Schema & Stream Contract */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-[#F8F9FA] p-3.5 rounded border border-[#E1E5EA] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-white border border-[#E1E5EA]">
                    {getSourceIcon(selectedTemplate.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2C2C]">{selectedTemplate.name}</h4>
                    <p className="text-[11px] text-[#1E2229]">
                      Archetype: {selectedTemplate.category} • Protocol: {selectedTemplate.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#1473E6] hover:underline font-semibold"
                >
                  Change Connector
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                    Connector Stream Name
                  </label>
                  <input
                    type="text"
                    value={streamName}
                    onChange={(e) => setStreamName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D5D5D5] rounded text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                    placeholder="e.g. Production Web Storefront SDK"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                      Target Canonical Schema
                    </label>
                    <select
                      value={targetSchema}
                      onChange={(e) => setTargetSchema(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded text-xs text-[#2C2C2C] bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none font-semibold"
                    >
                      <option value="xdm_experience_event">XDM ExperienceEvent (Streaming Telemetry)</option>
                      <option value="xdm_individual_profile">XDM Individual Profile (Record CRM)</option>
                      {schemas.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                      Primary Identity Key Namespace
                    </label>
                    <select
                      value={identityKey}
                      onChange={(e) => setIdentityKey(e.target.value)}
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded text-xs text-[#2C2C2C] bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none font-semibold"
                    >
                      <option value="ECID (Experience Cloud ID) & Email">ECID (Experience Cloud ID) & Email</option>
                      <option value="Email (Deterministic Key)">Email (Deterministic Key)</option>
                      <option value="CRM ID (Salesforce / Snowflake)">CRM ID (Salesforce / Snowflake)</option>
                      <option value="Phone Number (E.164)">Phone Number (E.164)</option>
                      <option value="IDFA / GAID (Mobile Device)">IDFA / GAID (Mobile Device)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C2C2C] mb-1">
                    Live Edge Ingress Endpoint
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={ingressEndpoint}
                      className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-mono bg-[#F2F4F7] text-[#2C2C2C] select-all focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ingressEndpoint);
                        setCopiedSnippet(true);
                        setTimeout(() => setCopiedSnippet(false), 1500);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#D5D5D5] hover:bg-[#F2F4F7] rounded text-xs font-semibold text-[#2C2C2C] shrink-0 flex items-center space-x-1"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5 text-[#0E7A36]" /> : <Copy className="w-3.5 h-3.5 text-[#1E2229]" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Verify & Send First Payload */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {!verificationSuccess ? (
                <>
                  <div className="bg-[#F8F9FA] p-3.5 rounded border border-[#E1E5EA]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-[#1473E6]" />
                        <span>Edge Telemetry Integration Snippet</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        {(['javascript', 'curl', 'python'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguageTab(lang)}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                              selectedLanguageTab === lang
                                ? 'bg-[#1473E6] text-white'
                                : 'text-[#1E2229] hover:bg-[#E1E5EA]'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <pre className="p-3 bg-[#1E1E1E] text-[#9CDCFE] font-mono text-[11px] rounded border border-[#3E3E3E] max-h-48 overflow-y-auto leading-relaxed">
                        {getCodeSnippet()}
                      </pre>
                      <button
                        onClick={handleCopySnippet}
                        className="absolute top-2 right-2 px-2 py-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white rounded text-[10px] font-semibold flex items-center space-x-1"
                      >
                        {copiedSnippet ? <Check className="w-3 h-3 text-[#0E7A36]" /> : <Copy className="w-3 h-3 text-white" />}
                        <span>{copiedSnippet ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Status Box */}
                  <div className="p-4 rounded border border-[#C5DCFA] bg-[#F2F7FE] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isVerifying ? 'bg-[#E68619] animate-ping' : 'bg-[#1473E6]'}`} />
                        <h4 className="text-xs font-bold text-[#2C2C2C]">
                          Edge Ingress Pipeline Listener
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0D66D0]">
                        PORT 443 (SSL/TLS 1.3)
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#1E2229]">
                      <div className="flex items-center space-x-2">
                        <span className={verificationProgress >= 1 ? 'text-[#0E7A36] font-bold' : 'text-[#1E2229]'}>
                          {verificationProgress >= 1 ? '✓' : '○'} 1. Handshake with Edge Gateway ({ingressEndpoint.slice(0, 38)}...)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={verificationProgress >= 2 ? 'text-[#0E7A36] font-bold' : 'text-[#1E2229]'}>
                          {verificationProgress >= 2 ? '✓' : '○'} 2. Validating XDM Schema contract ({targetSchema})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={verificationProgress >= 3 ? 'text-[#0E7A36] font-bold' : 'text-[#1E2229]'}>
                          {verificationProgress >= 3 ? '✓' : '○'} 3. Deterministic Identity Graph resolution & stitching
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleTriggerVerificationAndActivate}
                      disabled={isVerifying}
                      className="w-full py-2.5 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white text-xs font-bold rounded shadow-2xs transition-all flex items-center justify-center space-x-2"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Streaming Test Verification Event...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Fire Verification Event & Connect Source</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Celebration & Success State */
                <div className="p-6 rounded border border-[#B4F0C3] bg-[#DEFBE6] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#0E7A36] text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0E7A36]">
                      First Ingestion Stream Successfully Connected!
                    </h3>
                    <p className="text-xs text-[#2C2C2C] mt-1 max-w-md mx-auto">
                      <strong>{activatedSource?.name}</strong> is now live and transmitting telemetry. Your initial test event was validated against <strong>{targetSchema}</strong> and resolved to a unified customer profile.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded border border-[#B4F0C3] max-w-md mx-auto text-left text-xs font-mono space-y-1">
                    <div className="flex justify-between text-[#1E2229]">
                      <span>Source Status:</span>
                      <strong className="text-[#0E7A36]">Healthy (Active)</strong>
                    </div>
                    <div className="flex justify-between text-[#1E2229]">
                      <span>Latency:</span>
                      <strong>{activatedSource?.latencyMs}ms</strong>
                    </div>
                    <div className="flex justify-between text-[#1E2229]">
                      <span>Events Ingested:</span>
                      <strong className="text-[#1473E6]">1 Event (Live)</strong>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[#0E7A36] hover:bg-[#0A5D28] text-white font-bold text-xs rounded shadow-2xs transition-all inline-flex items-center space-x-1.5"
                  >
                    <span>Go to Ingestion Cockpit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {!verificationSuccess && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#E1E5EA] bg-[#F8F9FA]">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-1.5 bg-white border border-[#D5D5D5] hover:bg-[#F2F4F7] text-[#2C2C2C] text-xs font-semibold rounded transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs text-[#1E2229] hover:text-[#2C2C2C] font-semibold"
              >
                Cancel
              </button>

              {currentStep < 3 && (
                <button
                  onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                  className="px-5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold rounded shadow-2xs transition-colors flex items-center space-x-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
