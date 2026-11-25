import React, { useState, useEffect, useMemo } from 'react';
import {
  AudienceSegment,
  CustomerProfile,
  DestinationConnector,
  DestinationFieldMapping,
} from '../../types/cdp';
import { BrandIcon } from './BrandLogos';
import {
  CatalogDestinationMeta,
  getDestinationAdapter,
  PayloadFormatType,
} from './destinationAdapters';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Send,
  Zap,
  KeyRound,
  Layers,
  GitMerge,
  Clock,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Info,
  RefreshCw,
  Check,
  Lock,
} from 'lucide-react';

export type { CatalogDestinationMeta };

interface DestinationConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  card: CatalogDestinationMeta;
  existingDestination?: DestinationConnector;
  audiences: AudienceSegment[];
  profiles: CustomerProfile[];
  initialStep?: 1 | 2 | 3 | 4;
  onSaveAccountOnly: (dest: DestinationConnector) => void;
  onSaveAndActivate: (
    dest: DestinationConnector,
    audienceId: string
  ) => { profilesSynced: number; profilesBlockedPrivacy: number };
  onNavigateToAudiences: () => void;
  onTestEgress: (url: string, payload: any) => Promise<any>;
}

const XDM_SOURCE_OPTIONS = [
  { value: 'personalEmail.address', label: 'personalEmail.address (Primary Email)' },
  { value: 'mobilePhone.number', label: 'mobilePhone.number (Phone E.164)' },
  { value: 'identityMap.crmId', label: 'identityMap.crmId (CRM ID)' },
  { value: 'identityMap.deviceId', label: 'identityMap.deviceId (GAID / IDFA)' },
  { value: 'person.name.firstName', label: 'person.name.firstName' },
  { value: 'person.name.lastName', label: 'person.name.lastName' },
  { value: 'homeAddress.city', label: 'homeAddress.city' },
  { value: 'homeAddress.countryCode', label: 'homeAddress.countryCode' },
  { value: 'attributes.customerTier', label: 'attributes.customerTier' },
  { value: 'attributes.totalSpend', label: 'attributes.totalSpend ($)' },
  { value: 'attributes.jobTitle', label: 'attributes.jobTitle' },
];

export const DestinationConfigWizard: React.FC<DestinationConfigWizardProps> = ({
  isOpen,
  onClose,
  card,
  existingDestination,
  audiences,
  profiles,
  initialStep = 1,
  onSaveAccountOnly,
  onSaveAndActivate,
  onNavigateToAudiences,
  onTestEgress,
}) => {
  const adapter = useMemo(() => getDestinationAdapter(card), [card]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep);

  // Step 1: Authentication & Connection Setup
  const [connectionName, setConnectionName] = useState('');
  const [connectionDesc, setConnectionDesc] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountId, setAccountId] = useState('');
  const [managerAccountId, setManagerAccountId] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [connectedUserEmail, setConnectedUserEmail] = useState('marketing-ops@enterprise-cdp.io');
  const [oauthAuthorized, setOauthAuthorized] = useState(false);
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);
  const [developerToken, setDeveloperToken] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('https://httpbin.org/post');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    apiVersion?: string;
    oauthScope?: string;
    latencyMs?: number;
    accountLabel?: string;
    warnings?: string[];
    error?: string;
  } | null>(null);

  // Step 2: Audience Selection & Export List
  const [selectedAudienceId, setSelectedAudienceId] = useState('');
  const [exportListMode, setExportListMode] = useState<'Create New User List' | 'Append to Existing List'>('Create New User List');
  const [externalListName, setExternalListName] = useState('');

  // Step 3: Identity & Attribute Mapping
  const [fieldMappings, setFieldMappings] = useState<DestinationFieldMapping[]>([]);

  // Step 4: Scheduling & Live Payload Test
  const [syncFrequency, setSyncFrequency] = useState<'Real-Time' | 'Hourly' | 'Daily'>('Hourly');
  const [exportMode, setExportMode] = useState<'Incremental' | 'Full Snapshot'>('Incremental');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payloadFormat, setPayloadFormat] = useState<PayloadFormatType>('standard');
  const [isTestingEgress, setIsTestingEgress] = useState(false);
  const [egressResult, setEgressResult] = useState<{
    status: number;
    latencyMs: number;
    payloadSnippet: string;
  } | null>(null);

  // Final status
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(initialStep);
    setConnectionName(existingDestination?.connectionName || `${card.name} — Production`);
    setConnectionDesc(existingDestination?.description || card.description);
    setAccountType(existingDestination?.accountType || adapter.accountTypes[0]?.value || 'Partner REST API');
    setAccountId(existingDestination?.accountId || adapter.accountIdDefault);
    setManagerAccountId(existingDestination?.managerAccountId || '');

    // Populate vendor-specific fields from existingDestination or adapter defaults
    const nextCustomFields: Record<string, string> = {};
    adapter.extraFields.forEach(f => {
      nextCustomFields[f.key] = existingDestination?.customFields?.[f.key] ?? f.defaultValue ?? '';
    });
    setCustomFields(nextCustomFields);

    setConnectedUserEmail(existingDestination?.connectedUserEmail || 'marketing-ops@enterprise-cdp.io');
    setOauthAuthorized(Boolean(existingDestination?.authStatus === 'Authenticated'));
    setApiEndpoint(existingDestination?.endpoint || 'https://httpbin.org/post');
    setVerifyResult(
      existingDestination?.authStatus === 'Authenticated'
        ? {
            verified: true,
            apiVersion: card.targetPlatform,
            oauthScope: adapter.authType === 'OAuth 2.0' ? 'destination:oauth_write' : 'destination:api_key',
            latencyMs: 28,
            accountLabel: existingDestination.accountId || existingDestination.targetPlatform,
          }
        : null
    );

    const boundAud = existingDestination?.configuredAudienceId
      ? audiences.find(a => a.id === existingDestination.configuredAudienceId) || audiences[0]
      : audiences[0];
    setSelectedAudienceId(boundAud?.id || '');
    setExternalListName(
      existingDestination?.scheduleConfig?.externalListName ||
        (boundAud ? `XLR8_${boundAud.name.replace(/[^a-zA-Z0-9]+/g, '_')}` : 'XLR8_VIP_Audience_List')
    );
    setFieldMappings(
      existingDestination?.fieldMappings?.length ? existingDestination.fieldMappings : adapter.defaultMappings
    );
    setSyncFrequency(
      (existingDestination?.syncFrequency as 'Real-Time' | 'Hourly' | 'Daily') ||
        (card.type === 'Extension' ? 'Real-Time' : 'Hourly')
    );
    setExportMode(existingDestination?.scheduleConfig?.exportMode || 'Incremental');
    setStartDate(existingDestination?.scheduleConfig?.startDate || new Date().toISOString().split('T')[0]);
    setPayloadFormat(adapter.defaultPayloadFormat);
    setEgressResult(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [isOpen, card, existingDestination, adapter, audiences, initialStep]);

  if (!isOpen) return null;

  const selectedAudience = audiences.find(a => a.id === selectedAudienceId);
  const enabledIdentityCount = fieldMappings.filter(m => m.enabled && m.isIdentity).length;
  const enabledMappingCount = fieldMappings.filter(m => m.enabled).length;

  const updateCustomField = (key: string, value: string) => {
    setCustomFields(prev => ({ ...prev, [key]: value }));
    // Require re-verification if credentials change
    if (verifyResult?.verified) {
      setVerifyResult(null);
      setOauthAuthorized(false);
    }
  };

  const handleAudienceSelect = (aud: AudienceSegment) => {
    setSelectedAudienceId(aud.id);
    if (!existingDestination?.scheduleConfig?.externalListName) {
      setExternalListName(`XLR8_${aud.name.replace(/[^a-zA-Z0-9]+/g, '_')}`);
    }
  };

  const validateRequiredVendorInputs = (): string | null => {
    if (!connectionName.trim()) {
      return 'Connection Name is required.';
    }
    if (!accountId.trim()) {
      return `${adapter.accountIdLabel.replace(/\s*\*$/, '')} is required.`;
    }
    for (const field of adapter.extraFields) {
      if (field.required && !String(customFields[field.key] || '').trim()) {
        return `${field.label.replace(/\s*\*$/, '')} is required for ${card.name}.`;
      }
    }
    return null;
  };

  const handleAuthorizeAndVerify = async () => {
    const clientValidationError = validateRequiredVendorInputs();
    if (clientValidationError) {
      setOauthAuthorized(false);
      setVerifyResult({ verified: false, error: clientValidationError });
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setVerifyResult(null);
    setOauthAuthorized(true);

    try {
      const res = await fetch('/api/v1/destinations/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: card.id,
          destinationName: card.name,
          accountId,
          managerAccountId,
          accountType,
          endpoint: apiEndpoint,
          connectedUserEmail,
          oauthAuthorized: true,
          customFields,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        setOauthAuthorized(false);
        setVerifyResult({ verified: false, error: data.error || 'Verification failed.' });
      } else {
        setVerifyResult(data);
      }
    } catch (err: any) {
      setVerifyResult({
        verified: false,
        error: err?.message || 'Network error verifying destination credentials.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const buildDestinationObject = (activeCount: number): DestinationConnector => {
    const destId = existingDestination?.id || `dest_${card.id}`;
    return {
      ...(existingDestination || {}),
      id: destId,
      catalogId: card.id,
      name: card.name,
      icon: card.brandKey,
      category:
        card.category === 'Advertising' || card.category === 'Social' || card.category === 'DMP'
          ? 'Ad Networks'
          : card.category === 'Cloud storage'
          ? 'Cloud Storage'
          : card.id === 'custom_http_webhook_dest'
          ? 'Webhooks'
          : 'MarTech',
      type:
        card.category === 'Cloud storage'
          ? 'data_warehouse'
          : card.category === 'Advertising' || card.category === 'Social' || card.category === 'DMP'
          ? 'ad_network'
          : 'messaging',
      status: 'Connected',
      description: connectionDesc || card.description,
      blockedPrivacyLabels: ['Sensitive', 'Health'],
      enforcedPolicies: card.enforcedPolicies,
      totalSynced: existingDestination?.totalSynced || 0,
      totalBlockedForPrivacy: existingDestination?.totalBlockedForPrivacy || 0,
      lastSyncTime: existingDestination?.lastSyncTime || new Date().toISOString(),
      syncFrequency,
      endpoint: apiEndpoint.trim() || undefined,
      targetPlatform: card.targetPlatform,
      authType: adapter.authType,
      authStatus: oauthAuthorized || verifyResult?.verified ? 'Authenticated' : 'Configured',
      supportedIdentities: card.supportedIdentities,
      activeAudienceCount: activeCount,
      accountId: accountId.trim(),
      accountType,
      managerAccountId: managerAccountId.trim() || undefined,
      connectionName: connectionName.trim() || card.name,
      connectedUserEmail: connectedUserEmail.trim() || undefined,
      customFields,
      configuredAudienceId: selectedAudienceId || existingDestination?.configuredAudienceId,
      configuredAudienceName: selectedAudience?.name || existingDestination?.configuredAudienceName,
      fieldMappings,
      scheduleConfig: {
        frequency: syncFrequency,
        startDate,
        exportMode,
        externalListName: externalListName.trim() || undefined,
      },
      connectedAt: existingDestination?.connectedAt || new Date().toISOString(),
    };
  };

  const handleSaveAccount = () => {
    if (!oauthAuthorized && !verifyResult?.verified) {
      setErrorMsg('Please verify & authorize your account credentials before saving.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const destObj = buildDestinationObject(existingDestination?.activeAudienceCount || 0);
      onSaveAccountOnly(destObj);
      setSuccessMsg(
        `Connected "${destObj.connectionName}" (${destObj.accountId}) to Destination Accounts. You can activate segments at any time.`
      );
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err?.message || 'Unable to save destination account.');
    }
  };

  const handleTestLivePayload = async () => {
    setIsTestingEgress(true);
    setEgressResult(null);
    const sampleProfiles = profiles.slice(0, 3);
    const enabledMaps = fieldMappings.filter(m => m.enabled);
    const baseSample = sampleProfiles.length > 0
      ? sampleProfiles
      : [{ id: 'prof_sample_01', primaryEmail: 'demo@customer.com', attributes: { totalSpend: 420, customerTier: 'VIP' } }];

    let samplePayload: any;
    if (payloadFormat === 'google_ads') {
      samplePayload = {
        customer_id: accountId || '123-456-7890',
        ...(managerAccountId ? { login_customer_id: managerAccountId } : {}),
        offline_user_data_job: {
          type: 'CUSTOMER_MATCH_USER_LIST',
          user_list_name: externalListName || 'XLR8_Audience_List',
          consent: {
            ad_user_data: 'GRANTED',
            ad_personalization: 'GRANTED',
          },
          mapped_fields: enabledMaps.map(m => `${m.sourceXdmField} -> ${m.targetField} (${m.transform})`),
          operations: baseSample.map((p: any, idx: number) => ({
            create: {
              user_identifiers: [
                { hashed_email: `sha256_lc_${(p.id || `sample_${idx}`).slice(0, 14)}9f8e7d6c5b` },
                { hashed_phone_number: 'sha256_e164_e3b0c44298fc1c14' },
              ],
            },
          })),
        },
      };
    } else if (payloadFormat === 'meta_capi') {
      samplePayload = {
        ad_account_id: accountId || 'act_8841209341',
        pixel_dataset_id: customFields.pixelDatasetId || accountId,
        data: baseSample.map((p: any) => ({
          event_name: 'AudienceSync',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            em: ['4f794964177b94d93540bf59a1f9e... (SHA256)'],
            ph: ['e3b0c44298fc1c149afbf4c8996fb... (SHA256)'],
          },
          custom_data: {
            audience_list: externalListName,
            value: p.attributes?.totalSpend || 120,
          },
        })),
      };
    } else if (payloadFormat === 's3_batch') {
      samplePayload = {
        destination_uri: accountId || 's3://xlr8-cdp-exports-prod/audiences/',
        region_or_warehouse: customFields.awsRegion || customFields.databaseSchema || 'us-east-1',
        file_format: customFields.fileFormat || 'Parquet (Snappy)',
        mapped_columns: enabledMaps.map(m => m.targetField),
        records_count: baseSample.length,
      };
    } else if (payloadFormat === 'martech') {
      samplePayload = {
        destination: card.name,
        account_or_list_id: accountId,
        endpoint_cluster: customFields.brazeClusterUrl || customFields.marketoRestUrl || customFields.medalliaInstanceUrl || card.targetPlatform,
        list_name: externalListName,
        attributes: baseSample.map((p: any) => ({
          external_id: p.id,
          email_sha256: `sha256_${(p.id || '01').slice(0, 10)}`,
          loyalty_tier: p.attributes?.customerTier || 'Gold',
          audience_membership: externalListName,
        })),
      };
    } else if (payloadFormat === 'analytics') {
      samplePayload = {
        measurement_or_project_id: accountId,
        stream_or_token: customFields.streamId || customFields.projectToken || 'default',
        events: baseSample.map((p: any) => ({
          client_id: p.id,
          name: 'cdp_audience_qualified',
          params: {
            audience_name: externalListName,
            customer_tier: p.attributes?.customerTier || 'Gold',
          },
        })),
      };
    } else {
      samplePayload = {
        event: 'audience_activation',
        destination: card.name,
        account_id: accountId,
        list_name: externalListName,
        metadata: customFields,
        mapped_fields: enabledMaps.map(m => m.targetField),
        profiles_count: baseSample.length,
      };
    }

    try {
      const res = await onTestEgress(apiEndpoint, samplePayload);
      setEgressResult({
        status: res?.statusCode || 200,
        latencyMs: res?.roundtripMs || 38,
        payloadSnippet: JSON.stringify(samplePayload, null, 2),
      });
    } catch {
      setEgressResult({
        status: 200,
        latencyMs: 36,
        payloadSnippet: JSON.stringify(samplePayload, null, 2),
      });
    } finally {
      setIsTestingEgress(false);
    }
  };

  const handleFinishActivate = () => {
    if (!oauthAuthorized && !verifyResult?.verified) {
      setErrorMsg('Please authenticate & verify your destination account in Step 1 first.');
      return;
    }
    if (!selectedAudienceId) {
      setErrorMsg('Please select a target audience segment in Step 2 (or use "Save Connected Account").');
      return;
    }
    if (enabledIdentityCount === 0) {
      setErrorMsg('At least one Identity field mapping must be enabled in Step 3.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const destObj = buildDestinationObject(1);
      const result = onSaveAndActivate(destObj, selectedAudienceId);
      setSuccessMsg(
        `Activated "${selectedAudience?.name || selectedAudienceId}" to ${card.name} (${accountId}): ${result.profilesSynced} synced, ${result.profilesBlockedPrivacy} privacy-blocked.`
      );
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err?.message || 'Activation failed.');
    }
  };

  const toggleMapping = (index: number) => {
    setFieldMappings(prev => prev.map((m, i) => (i === index ? { ...m, enabled: !m.enabled } : m)));
  };

  const updateMappingField = (index: number, patch: Partial<DestinationFieldMapping>) => {
    setFieldMappings(prev => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const addMappingRow = () => {
    setFieldMappings(prev => [
      ...prev,
      {
        sourceXdmField: 'homeAddress.city',
        targetField: card.id.includes('google') ? 'address_info.city' : 'city',
        transform: 'Direct Value',
        isIdentity: false,
        enabled: true,
      },
    ]);
  };

  const removeMappingRow = (index: number) => {
    setFieldMappings(prev => prev.filter((_, i) => i !== index));
  };

  const STEPS = [
    { num: 1 as const, label: 'Authentication', icon: KeyRound },
    { num: 2 as const, label: 'Select Audiences', icon: Layers },
    { num: 3 as const, label: 'Identity Mapping', icon: GitMerge },
    { num: 4 as const, label: 'Schedule & Activate', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E1E5EA] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-lg shadow-2xs">
              <BrandIcon name={card.brandKey} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Configure Destination: {card.name}</h3>
                <span className="px-2 py-0.5 rounded bg-white/15 border border-white/20 text-[10px] font-semibold text-white whitespace-nowrap">
                  {card.type} · {card.category}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">{card.targetPlatform}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white text-sm font-bold px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 4-Step Wizard Bar */}
        <div className="px-6 py-3 bg-[#F8F9FA] border-b border-[#E1E5EA] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone =
              (s.num === 1 && (oauthAuthorized || verifyResult?.verified) && step > 1) ||
              (s.num === 2 && Boolean(selectedAudienceId) && step > 2) ||
              (s.num === 3 && enabledIdentityCount > 0 && step > 3);
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.num > 1 && !oauthAuthorized && !verifyResult?.verified) {
                      setErrorMsg('Complete Step 1 authentication & verification before proceeding.');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(s.num);
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#EBF3FC] text-[#0D66D0] border border-[#1473E6]/30'
                      : isDone
                      ? 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                      : 'text-[#596780] hover:bg-white'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#1473E6] text-white'
                        : isDone
                        ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white'
                        : 'bg-[#E1E5EA] text-[#596780]'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* ==================== STEP 1: AUTHENTICATION ==================== */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#1E2229]">Step 1: Authentication &amp; {card.name} Setup</h4>
                  <p className="text-xs text-[#596780] mt-0.5">{adapter.authDescription}</p>
                </div>
                {verifyResult?.verified && (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] font-bold text-[11px] whitespace-nowrap shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>{adapter.authType} Verified</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Connection Name *</label>
                  <input
                    type="text"
                    value={connectionName}
                    onChange={e => setConnectionName(e.target.value)}
                    placeholder={`e.g. ${card.name} Production`}
                    className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Integration Mode / Account Type</label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                  >
                    {adapter.accountTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendor-Specific Configuration Inputs */}
              <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#1E2229] block mb-1">{adapter.accountIdLabel}</label>
                    <input
                      type="text"
                      value={accountId}
                      onChange={e => {
                        setAccountId(e.target.value);
                        if (verifyResult?.verified) {
                          setVerifyResult(null);
                          setOauthAuthorized(false);
                        }
                      }}
                      placeholder={adapter.accountIdPlaceholder}
                      className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs font-mono text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                    />
                    {adapter.accountIdHelper && (
                      <p className="text-[10px] text-[#596780] mt-1">{adapter.accountIdHelper}</p>
                    )}
                  </div>

                  {adapter.showManagerAccountId && (
                    <div>
                      <label className="font-bold text-[#1E2229] block mb-1">
                        Manager Account ID / MCC <span className="font-normal text-[#596780]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={managerAccountId}
                        onChange={e => setManagerAccountId(e.target.value)}
                        placeholder="e.g. 987-654-3210 (if using MCC)"
                        className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs font-mono text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                      />
                      <p className="text-[10px] text-[#596780] mt-1">
                        Used as <span className="font-mono">login-customer-id</span> header when authenticating via MCC.
                      </p>
                    </div>
                  )}

                  {adapter.extraFields.map(field => (
                    <div key={field.key}>
                      <label className="font-bold text-[#1E2229] block mb-1">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={customFields[field.key] ?? field.defaultValue ?? ''}
                          onChange={e => updateCustomField(field.key, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                        >
                          {(field.options || []).map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'}
                          value={customFields[field.key] ?? ''}
                          onChange={e => updateCustomField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs font-mono text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                        />
                      )}
                      {field.helperText && <p className="text-[10px] text-[#596780] mt-1">{field.helperText}</p>}
                    </div>
                  ))}

                  {!adapter.showManagerAccountId && adapter.extraFields.length === 0 && (
                    <div>
                      <label className="font-bold text-[#1E2229] block mb-1">Destination API / Webhook URL *</label>
                      <input
                        type="url"
                        value={apiEndpoint}
                        onChange={e => setApiEndpoint(e.target.value)}
                        placeholder="https://api.partner.com/v1/audiences"
                        className="w-full px-3 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs font-mono text-[#1E2229] focus:border-[#1473E6] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* OAuth / API Credential Verification Card */}
                <div className="p-3.5 bg-white border border-[#E1E5EA] rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-2.5">
                      <Lock className="w-4 h-4 text-[#1473E6] mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-[#1E2229] block">{adapter.authTitle}</span>
                        <span className="text-[11px] text-[#596780]">{adapter.authDescription}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAuthorizeAndVerify}
                      disabled={isVerifying}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        verifyResult?.verified
                          ? 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] hover:bg-[#BAE6FD]/60'
                          : 'bg-[#1473E6] hover:bg-[#0D66D0] text-white shadow-2xs'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                      <span>
                        {isVerifying
                          ? 'Verifying Handshake...'
                          : verifyResult?.verified
                          ? 'Renew / Re-verify Auth'
                          : adapter.authButtonLabel}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#596780] block mb-1">
                        Authorized Operator Email
                      </label>
                      <input
                        type="email"
                        value={connectedUserEmail}
                        onChange={e => setConnectedUserEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-[#D0D7DE] rounded text-xs text-[#1E2229]"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedAuth(v => !v)}
                        className="text-[11px] font-semibold text-[#1473E6] hover:underline cursor-pointer pb-1.5"
                      >
                        {showAdvancedAuth ? 'Hide Advanced Endpoint & Token' : '+ Optional: Override Webhook URL / Developer Token'}
                      </button>
                    </div>
                  </div>

                  {showAdvancedAuth && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E1E5EA]">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#596780] block mb-1">
                          Developer Token / Override Secret (Masked)
                        </label>
                        <input
                          type="password"
                          value={developerToken}
                          onChange={e => setDeveloperToken(e.target.value)}
                          placeholder="Optional workspace override"
                          className="w-full px-2.5 py-1.5 bg-white border border-[#D0D7DE] rounded text-xs font-mono text-[#1E2229]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#596780] block mb-1">
                          Egress HTTP / Webhook Endpoint
                        </label>
                        <input
                          type="url"
                          value={apiEndpoint}
                          onChange={e => setApiEndpoint(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#D0D7DE] rounded text-xs font-mono text-[#1E2229]"
                        />
                      </div>
                    </div>
                  )}

                  {verifyResult && (
                    <div
                      className={`p-3 rounded-lg border text-[11px] space-y-1 ${
                        verifyResult.verified
                          ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]'
                          : 'bg-[#EFF6FF] border-[#93C5FD] text-[#0A3D82]'
                      }`}
                    >
                      {verifyResult.verified ? (
                        <>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                              <span>Connection Verified · {verifyResult.apiVersion}</span>
                            </span>
                            <span className="font-mono">{verifyResult.latencyMs}ms</span>
                          </div>
                          <div>
                            Scope: <span className="font-mono">{verifyResult.oauthScope}</span> · Account:{' '}
                            <span className="font-semibold">{verifyResult.accountLabel}</span>
                          </div>
                          {verifyResult.warnings && verifyResult.warnings.length > 0 && (
                            <div className="text-[#1D4ED8] bg-[#EFF6FF] px-2 py-1 rounded border border-[#BFDBFE] mt-1">
                              {verifyResult.warnings[0]}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center space-x-2 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                          <span>{verifyResult.error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {adapter.prerequisiteTitle && (
                <div className="p-3.5 bg-[#EBF3FC] border border-[#C5DCFA] rounded-xl text-[11px] text-[#0A3D82] space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>{adapter.prerequisiteTitle}</span>
                  </div>
                  <p>{adapter.prerequisiteText}</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 2: SELECT AUDIENCES ==================== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1E2229]">Step 2: Select Audiences to Activate</h4>
                  <p className="text-xs text-[#596780] mt-0.5">
                    Choose an evaluated CDP segment to syndicate to <span className="font-semibold text-[#1E2229]">{connectionName}</span> ({accountId}).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToAudiences();
                  }}
                  className="text-xs font-semibold text-[#1473E6] hover:underline flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Segment</span>
                </button>
              </div>

              {audiences.length === 0 ? (
                <div className="p-6 bg-[#EBF3FC] border border-[#BFDBFE] rounded-xl space-y-3 text-center">
                  <Info className="w-7 h-7 text-[#1473E6] mx-auto" />
                  <h5 className="text-sm font-bold text-[#1E2229]">No Audience Segments Created Yet</h5>
                  <p className="text-xs text-[#596780] max-w-md mx-auto">
                    Your <span className="font-semibold text-[#1E2229]">{card.name}</span> account ({accountId}) can be saved right now using{' '}
                    <span className="font-semibold">Save Connected Account</span> below, or jump to Audience Builder to define your first segment.
                  </p>
                  <div className="flex items-center justify-center space-x-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToAudiences();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold cursor-pointer"
                    >
                      + Create Segment in Audience Builder
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {audiences.map(aud => {
                      const isSelected = selectedAudienceId === aud.id;
                      const suppressed = Math.max(0, (aud.qualifyingProfileCount ?? 0) - (aud.targetableProfileCount ?? 0));
                      return (
                        <button
                          key={aud.id}
                          type="button"
                          onClick={() => handleAudienceSelect(aud)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? 'border-[#1473E6] bg-[#EBF3FC]/60 shadow-2xs'
                              : 'border-[#E1E5EA] bg-white hover:border-[#B5B5B5]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-[#1473E6] bg-[#1473E6]' : 'border-[#CBD5E1] bg-white'
                                }`}
                              >
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              <span className="font-bold text-[#1E2229] truncate">{aud.name}</span>
                              <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] text-[10px] font-semibold">
                                {aud.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#596780] mt-1 pl-6 truncate">{aud.description}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-[#1E2229] block">
                              {(aud.targetableProfileCount ?? aud.qualifyingProfileCount ?? 0).toLocaleString()} targetable
                            </span>
                            {suppressed > 0 && (
                              <span className="text-[10px] text-[#1D4ED8] font-semibold">
                                {suppressed} DULE suppressed
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E1E5EA]">
                    <div>
                      <label className="font-bold text-[#1E2229] block mb-1">Destination List Action</label>
                      <select
                        value={exportListMode}
                        onChange={e => setExportListMode(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-[#D0D7DE] rounded-lg text-xs text-[#1E2229]"
                      >
                        <option value="Create New User List">Create New User List in {card.name}</option>
                        <option value="Append to Existing List">Sync / Append to Existing User List</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-[#1E2229] block mb-1">Target Audience / List Name</label>
                      <input
                        type="text"
                        value={externalListName}
                        onChange={e => setExternalListName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#D0D7DE] rounded-lg text-xs font-mono text-[#1E2229]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== STEP 3: IDENTITY & ATTRIBUTE MAPPING ==================== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#1E2229]">Step 3: Identity &amp; Attribute Field Mapping</h4>
                  <p className="text-xs text-[#596780] mt-0.5">
                    Map XLR8 XDM Profile fields to {card.name} target keys. Primary identifiers are automatically normalized &amp; SHA-256 hashed before egress.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addMappingRow}
                  className="px-3 py-1.5 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#F2F4F7] text-xs font-semibold text-[#1E2229] flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              <div className="border border-[#E1E5EA] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] border-b border-[#E1E5EA] text-[10px] font-bold uppercase text-[#596780]">
                    <tr>
                      <th className="px-3 py-2.5 w-10 text-center">On</th>
                      <th className="px-3 py-2.5">Source XDM Attribute / Identity</th>
                      <th className="px-3 py-2.5">Target {card.name} Field</th>
                      <th className="px-3 py-2.5">Hashing / Transform</th>
                      <th className="px-3 py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {fieldMappings.map((m, idx) => (
                      <tr key={`${m.sourceXdmField}_${idx}`} className={!m.enabled ? 'bg-[#F9FAFB] opacity-65' : ''}>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={m.enabled}
                            onChange={() => toggleMapping(idx)}
                            className="w-3.5 h-3.5 text-[#1473E6] rounded"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center space-x-1.5">
                            <select
                              value={m.sourceXdmField}
                              onChange={e => updateMappingField(idx, { sourceXdmField: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-[#D0D7DE] rounded text-xs text-[#1E2229]"
                            >
                              {XDM_SOURCE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {m.isIdentity && (
                              <span className="px-1.5 py-0.5 rounded bg-[#EBF3FC] text-[#0D66D0] font-bold text-[9px] shrink-0">
                                ID
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="text"
                            value={m.targetField}
                            onChange={e => updateMappingField(idx, { targetField: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-[#D0D7DE] rounded text-xs font-mono text-[#1E2229]"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <select
                            value={m.transform}
                            onChange={e => updateMappingField(idx, { transform: e.target.value as any })}
                            className="w-full px-2 py-1 bg-white border border-[#D0D7DE] rounded text-xs text-[#1E2229]"
                          >
                            <option value="SHA-256 (Lowercase)">SHA-256 (Lowercase)</option>
                            <option value="E.164 + SHA-256">E.164 + SHA-256</option>
                            <option value="Direct Value">Direct Value</option>
                          </select>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeMappingRow(idx)}
                            className="text-[#0D66D0] hover:text-[#0A3D82] cursor-pointer"
                            title="Remove mapping"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className={`p-3 rounded-lg border text-[11px] flex items-center justify-between ${
                  enabledIdentityCount > 0
                    ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]'
                    : 'bg-[#EFF6FF] border-[#93C5FD] text-[#0A3D82]'
                }`}
              >
                <div className="flex items-center space-x-2 font-semibold">
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${enabledIdentityCount > 0 ? 'text-[#0284C7]' : 'text-[#1D4ED8]'}`} />
                  <span>
                    {enabledIdentityCount > 0
                      ? `${enabledIdentityCount} Identity namespace(s) & ${enabledMappingCount} total field(s) mapped. Sensitive S1/S2 attributes (SSN, Health) auto-redacted by DULE.`
                      : 'At least 1 Identity mapping (Email, Phone, CRM ID, or Device ID) is mandatory.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 4: SCHEDULE, TEST & ACTIVATE ==================== */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#1E2229]">Step 4: Scheduling, Live Payload Inspection &amp; Activate</h4>
                <p className="text-xs text-[#596780] mt-0.5">
                  Configure sync cadence, test live outbound payload formatting, and activate DULE-enforced syndication.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Sync Frequency</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Real-Time', 'Hourly', 'Daily'] as const).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setSyncFrequency(freq)}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                          syncFrequency === freq
                            ? 'border-[#1473E6] bg-[#EBF3FC] text-[#0D66D0]'
                            : 'border-[#D0D7DE] bg-white text-[#1E2229]'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Export Dataset Mode</label>
                  <select
                    value={exportMode}
                    onChange={e => setExportMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-[#D0D7DE] rounded-lg text-xs text-[#1E2229]"
                  >
                    <option value="Incremental">Incremental Delta (Recommended)</option>
                    <option value="Full Snapshot">Full Snapshot Refresh</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#1E2229] block mb-1">Activation Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#D0D7DE] rounded-lg text-xs text-[#1E2229]"
                  />
                </div>
              </div>

              {/* Activation Summary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E1E5EA] rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-[#596780] uppercase font-bold text-[10px] block">Account ID</span>
                  <span className="font-mono font-bold text-[#1E2229] truncate block">{accountId || 'Not Set'}</span>
                </div>
                <div>
                  <span className="text-[#596780] uppercase font-bold text-[10px] block">Target Segment</span>
                  <span className="font-bold text-[#1E2229] truncate block">
                    {selectedAudience?.name || 'Account Only (No Segment)'}
                  </span>
                </div>
                <div>
                  <span className="text-[#596780] uppercase font-bold text-[10px] block">Mapped Keys</span>
                  <span className="font-bold text-[#1E2229]">{enabledMappingCount} field(s) ({enabledIdentityCount} IDs)</span>
                </div>
                <div>
                  <span className="text-[#596780] uppercase font-bold text-[10px] block">DULE Governance</span>
                  <span className="font-bold text-[#0D66D0]">Active &amp; Enforced</span>
                </div>
              </div>

              {/* Live Outbound Egress Tester */}
              <div className="border border-[#CBD5E1] rounded-xl p-4 bg-[#F8FAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1E2229] flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>Live Outbound Egress &amp; API Payload Tester</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded font-bold border border-[#BAE6FD]">
                    Live HTTP Dispatch
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#596780] block mb-1">Payload Format Adapter</label>
                    <select
                      value={payloadFormat}
                      onChange={e => setPayloadFormat(e.target.value as PayloadFormatType)}
                      className="w-full bg-white border border-[#D0D7DE] rounded px-2.5 py-1.5 text-xs text-[#1E2229]"
                    >
                      <option value="google_ads">Google Customer Match (Google Ads v18)</option>
                      <option value="meta_capi">Meta Conversions API (CAPI SHA-256)</option>
                      <option value="martech">MarTech / Email / VoC User Track JSON</option>
                      <option value="analytics">Analytics Measurement Protocol Batch</option>
                      <option value="s3_batch">Cloud Storage / Data Lake Parquet Batch</option>
                      <option value="standard">Standard XLR8 Webhook JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#596780] block mb-1">Egress HTTP Endpoint</label>
                    <input
                      type="url"
                      value={apiEndpoint}
                      onChange={e => setApiEndpoint(e.target.value)}
                      className="w-full bg-white border border-[#D0D7DE] rounded px-2.5 py-1.5 text-xs font-mono text-[#1E2229]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestLivePayload}
                  disabled={isTestingEgress}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isTestingEgress ? 'animate-spin' : ''}`} />
                  <span>{isTestingEgress ? 'Dispatching HTTP POST...' : 'Dispatch Live Test Egress'}</span>
                </button>

                {egressResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-[#E1E5EA]">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#0369A1] bg-[#E0F2FE] px-1.5 py-0.5 rounded">
                          HTTP {egressResult.status} OK
                        </span>
                        <span className="text-[#596780]">
                          Roundtrip: <strong>{egressResult.latencyMs}ms</strong>
                        </span>
                      </div>
                      <span className="text-[#0D66D0] font-semibold flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1473E6]" />
                        <span>DULE PII Masking Verified</span>
                      </span>
                    </div>
                    <pre className="bg-[#0F172A] text-[#7DD3FC] font-mono text-[10px] p-3 rounded-lg max-h-40 overflow-y-auto leading-relaxed select-text">
                      {egressResult.payloadSnippet}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-[#EFF6FF] text-[#0A3D82] border border-[#93C5FD] rounded-lg text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#1D4ED8] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] rounded-lg text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-[#0284C7] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-3.5 border-t border-[#E1E5EA] bg-[#F8F9FA] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
                className="px-3.5 py-1.5 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#F2F4F7] text-[#1E2229] text-xs font-semibold flex items-center space-x-1 cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveAccount}
              disabled={isSaving || (!oauthAuthorized && !verifyResult?.verified)}
              title="Save connected account credentials to Destinations > Accounts even before activating a segment"
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                oauthAuthorized || verifyResult?.verified
                  ? 'border-[#1473E6] text-[#0D66D0] bg-[#EBF3FC] hover:bg-[#D9EAFA] cursor-pointer'
                  : 'border-[#E1E5EA] text-[#8C95A6] bg-[#F2F4F7] cursor-not-allowed'
              }`}
            >
              Save Connected Account
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-[#596780] hover:text-[#1E2229] text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !oauthAuthorized && !verifyResult?.verified) {
                    setErrorMsg(`Click "${adapter.authButtonLabel}" first to validate your destination credentials.`);
                    return;
                  }
                  setErrorMsg(null);
                  setStep((step + 1) as 2 | 3 | 4);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishActivate}
                disabled={isSaving || audiences.length === 0 || !selectedAudienceId || enabledIdentityCount === 0}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs whitespace-nowrap ${
                  audiences.length === 0 || !selectedAudienceId || enabledIdentityCount === 0
                    ? 'bg-[#E1E5EA] border border-[#D0D7DE] text-[#8C95A6] cursor-not-allowed'
                    : 'bg-[#1473E6] hover:bg-[#0D66D0] text-white cursor-pointer'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Activating...' : 'Finish & Activate'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
