import React, { useState, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import { SchemaDefinition, SchemaField, PrivacyClassification } from '../../types/cdp';
import { STANDARD_SCHEMA_BLUEPRINTS } from '../../data/seedData';
import {
  FileCode,
  Layers,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Shield,
  Key,
  Database,
  Globe,
  ShoppingBag,
  Building2,
  Lock,
  X,
  Code2,
  Copy,
  CheckCircle2,
  HelpCircle,
  User,
  Activity,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Settings2,
  Compass,
  Moon,
  Sun
} from 'lucide-react';

interface CreateSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (schemaId: string) => void;
}

// Preset archetypes for the simplified flow
interface SchemaArchetype {
  id: string;
  name: string;
  category: SchemaDefinition['category'];
  icon: any;
  description: string;
  suggestedFields: Array<{
    name: string;
    dataType: SchemaField['dataType'];
    description: string;
    isIdentifier?: boolean;
    identifierType?: SchemaField['identifierType'];
    isRequired?: boolean;
    classification?: PrivacyClassification;
    isSensitive?: boolean;
  }>;
}

const ARCHETYPES: SchemaArchetype[] = [
  {
    id: 'customer_profile',
    name: 'Customer Profile',
    category: 'Profile',
    icon: User,
    description: 'Unified customer records with identity keys, demographic attributes, and loyalty tier.',
    suggestedFields: [
      { name: 'profileId', dataType: 'string', description: 'Global unified profile identifier', isIdentifier: true, identifierType: 'crmId', isRequired: true, classification: 'Standard' },
      { name: 'email', dataType: 'string', description: 'Primary contact email for deterministic matching', isIdentifier: true, identifierType: 'email', isRequired: false, classification: 'Standard' },
      { name: 'phone', dataType: 'string', description: 'E.164 phone number', isIdentifier: true, identifierType: 'phone', isRequired: false, classification: 'Standard' },
      { name: 'firstName', dataType: 'string', description: 'Customer first name', isRequired: false, classification: 'Standard' },
      { name: 'lastName', dataType: 'string', description: 'Customer last name', isRequired: false, classification: 'Standard' },
      { name: 'customerTier', dataType: 'string', description: 'Membership tier (Bronze, Silver, Gold, VIP)', isRequired: true, classification: 'Standard' },
      { name: 'totalSpend', dataType: 'number', description: 'Lifetime aggregate spend in USD', isRequired: false, classification: 'Financial' },
      { name: 'loyaltyPoints', dataType: 'number', description: 'Reward points balance', isRequired: false, classification: 'Standard' },
    ]
  },
  {
    id: 'ecommerce_events',
    name: 'E-Commerce & Orders',
    category: 'ExperienceEvent',
    icon: ShoppingBag,
    description: 'Transaction orders, SKU cart updates, checkouts, and monetary amounts.',
    suggestedFields: [
      { name: 'orderId', dataType: 'string', description: 'Unique transaction reference ID', isRequired: true, classification: 'Standard' },
      { name: 'profileId', dataType: 'string', description: 'Customer profile identifier', isIdentifier: true, identifierType: 'crmId', isRequired: true, classification: 'Standard' },
      { name: 'orderTotal', dataType: 'number', description: 'Transaction net total in USD', isRequired: true, classification: 'Financial' },
      { name: 'currencyCode', dataType: 'string', description: 'ISO-4217 currency (USD, EUR, GBP)', isRequired: true, classification: 'Standard' },
      { name: 'purchasedSkus', dataType: 'array', description: 'List of purchased item SKUs', isRequired: true, classification: 'Behavioral' },
      { name: 'paymentMethod', dataType: 'string', description: 'Payment tender type (CreditCard, ApplePay)', isRequired: false, classification: 'Standard' },
      { name: 'timestamp', dataType: 'timestamp', description: 'Transaction event timestamp', isRequired: true, classification: 'Standard' }
    ]
  },
  {
    id: 'web_telemetry',
    name: 'Web & Mobile Activity',
    category: 'ExperienceEvent',
    icon: Activity,
    description: 'Pageviews, button interactions, referrers, and device browser telemetry.',
    suggestedFields: [
      { name: 'eventType', dataType: 'string', description: 'Interaction verb: PageView, Click, FormSubmit', isRequired: true, classification: 'Behavioral' },
      { name: 'cookieId', dataType: 'string', description: '1st-party cookie token ECID', isIdentifier: true, identifierType: 'cookie', isRequired: false, classification: 'Standard' },
      { name: 'pageUrl', dataType: 'string', description: 'Canonical web URL path', isRequired: true, classification: 'Behavioral' },
      { name: 'referrerUrl', dataType: 'string', description: 'Inbound HTTP referrer', isRequired: false, classification: 'Behavioral' },
      { name: 'deviceBrowser', dataType: 'string', description: 'Browser and OS user agent', isRequired: false, classification: 'Standard' },
      { name: 'sessionDurationSec', dataType: 'number', description: 'Active session length in seconds', isRequired: false, classification: 'Behavioral' }
    ]
  },
  {
    id: 'b2b_organization',
    name: 'B2B Account / Company',
    category: 'B2BAccount',
    icon: Building2,
    description: 'Corporate entities, firmographics, revenue ranges, and intent surge indicators.',
    suggestedFields: [
      { name: 'accountId', dataType: 'string', description: 'Corporate CRM Account ID', isIdentifier: true, identifierType: 'crmId', isRequired: true, classification: 'Standard' },
      { name: 'accountName', dataType: 'string', description: 'Legal business company name', isRequired: true, classification: 'Standard' },
      { name: 'corporateDomain', dataType: 'string', description: 'Corporate web domain for Lead-to-Account matching', isRequired: true, classification: 'Standard' },
      { name: 'annualRevenue', dataType: 'number', description: 'Estimated annual revenue USD', isRequired: false, classification: 'Financial' },
      { name: 'employeeCount', dataType: 'number', description: 'Number of full-time employees', isRequired: false, classification: 'Standard' },
      { name: 'industry', dataType: 'string', description: 'NAICS industry classification', isRequired: false, classification: 'Standard' }
    ]
  },
  {
    id: 'consent_preferences',
    name: 'Consent & Privacy',
    category: 'Consent',
    icon: Shield,
    description: 'GDPR / CCPA consent flags, email/SMS opt-ins, and DULE privacy directives.',
    suggestedFields: [
      { name: 'profileId', dataType: 'string', description: 'Customer profile identifier', isIdentifier: true, identifierType: 'crmId', isRequired: true, classification: 'Standard' },
      { name: 'marketingEmailOptIn', dataType: 'boolean', description: 'Explicit opt-in for marketing emails', isRequired: true, classification: 'Standard' },
      { name: 'smsAlertsOptIn', dataType: 'boolean', description: 'Explicit opt-in for SMS messages', isRequired: true, classification: 'Standard' },
      { name: 'analyticsTracking', dataType: 'boolean', description: 'Cookie tracking consent', isRequired: true, classification: 'Standard' },
      { name: 'thirdPartySharingOptOut', dataType: 'boolean', description: 'CCPA Do-Not-Sell opt-out directive', isRequired: true, classification: 'Standard' }
    ]
  },
  {
    id: 'custom_blank',
    name: 'Custom / Blank Model',
    category: 'Profile',
    icon: Layers,
    description: 'Start with a clean blank canvas and configure exact attributes from scratch.',
    suggestedFields: [
      { name: 'profileId', dataType: 'string', description: 'Primary profile ID', isIdentifier: true, identifierType: 'crmId', isRequired: true, classification: 'Standard' },
      { name: 'email', dataType: 'string', description: 'Contact email', isIdentifier: true, identifierType: 'email', isRequired: false, classification: 'Standard' }
    ]
  }
];

export const CreateSchemaModal: React.FC<CreateSchemaModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { createSchema, loadSchemaBlueprint, uiMode } = useCDP();

  // Mode: 'simplified' vs 'pro_architect' vs 'blueprints'
  const [modalMode, setModalMode] = useState<'simplified' | 'pro_architect' | 'blueprints'>(
    uiMode === 'minimal' ? 'simplified' : 'simplified'
  );

  // Simplified Flow Steps: 1 = Template, 2 = Fields, 3 = Review & Publish
  const [simplifiedStep, setSimplifiedStep] = useState<1 | 2 | 3>(1);
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('customer_profile');
  const [stripTheme, setStripTheme] = useState<'dark' | 'light'>('dark');

  // Working state for fields in simplified flow
  const [activeFields, setActiveFields] = useState<Array<Omit<SchemaField, 'id'> & { enabled: boolean }>>([]);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldType, setCustomFieldType] = useState<SchemaField['dataType']>('string');
  const [customFieldIsId, setCustomFieldIsId] = useState(false);

  // Schema basic info
  const [schemaName, setSchemaName] = useState('Customer Profile Schema');
  const [schemaCategory, setSchemaCategory] = useState<SchemaDefinition['category']>('Profile');
  const [version, setVersion] = useState('1.0.0');
  const [tenantNamespace, setTenantNamespace] = useState('_tenant');
  const [description, setDescription] = useState('Canonical customer schema for unified omnichannel profile synchronization.');

  // Pro builder state
  const [builderTab, setBuilderTab] = useState<'design' | 'preview_json'>('design');
  const [copiedJson, setCopiedJson] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Synchronize fields when archetype is selected
  useEffect(() => {
    const archetype = ARCHETYPES.find(a => a.id === selectedArchetypeId) || ARCHETYPES[0];
    setSchemaName(`${archetype.name} Schema`);
    setSchemaCategory(archetype.category);
    setDescription(archetype.description);

    setActiveFields(
      archetype.suggestedFields.map(f => ({
        name: f.name,
        dataType: f.dataType,
        description: f.description,
        isIdentifier: f.isIdentifier || false,
        identifierType: f.identifierType,
        isRequired: f.isRequired || false,
        classification: f.classification || 'Standard',
        isSensitive: f.isSensitive || false,
        enabled: true
      }))
    );
  }, [selectedArchetypeId]);

  if (!isOpen) return null;

  const handleToggleField = (fieldName: string) => {
    setActiveFields(prev =>
      prev.map(f => (f.name === fieldName ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleAddQuickCustomField = () => {
    if (!customFieldName.trim()) return;
    setModalError(null);
    const formatted = customFieldName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (activeFields.some(f => f.name.toLowerCase() === formatted.toLowerCase())) {
      setModalError(`Field "${formatted}" already exists.`);
      return;
    }

    setActiveFields(prev => [
      ...prev,
      {
        name: formatted,
        dataType: customFieldType,
        description: `${formatted} attribute`,
        isIdentifier: customFieldIsId,
        identifierType: customFieldIsId ? 'crmId' : undefined,
        isRequired: false,
        classification: 'Standard',
        isSensitive: false,
        enabled: true
      }
    ]);

    setCustomFieldName('');
    setCustomFieldType('string');
    setCustomFieldIsId(false);
  };

  const handleRemoveField = (fieldName: string) => {
    setActiveFields(prev => prev.filter(f => f.name !== fieldName));
  };

  const getFinalFields = (): SchemaField[] => {
    return activeFields
      .filter(f => f.enabled)
      .map(f => ({
        id: 'f_' + Math.random().toString(36).substring(2, 8),
        name: f.name,
        dataType: f.dataType,
        description: f.description,
        isIdentifier: f.isIdentifier,
        identifierType: f.identifierType,
        isRequired: f.isRequired,
        classification: f.classification,
        isSensitive: f.isSensitive,
        maskInExports: f.isSensitive,
        blockInAdNetworks: f.isSensitive
      }));
  };

  const getBaseClassUri = (cat: SchemaDefinition['category']) => {
    switch (cat) {
      case 'Profile': return 'https://ns.xprplatform.com/xdm/context/profile';
      case 'ExperienceEvent': return 'https://ns.xprplatform.com/xdm/context/experienceevent';
      case 'B2BAccount': return 'https://ns.xprplatform.com/xdm/classes/b2b-account';
      case 'Consent': return 'https://ns.xprplatform.com/xdm/context/consent';
      case 'Lookup': return 'https://ns.xprplatform.com/xdm/classes/lookup';
      default: return 'https://ns.xprplatform.com/xdm/context/profile';
    }
  };

  const generateJsonSchema = () => {
    const fields = getFinalFields();
    const properties: Record<string, any> = {};
    const required: string[] = [];

    fields.forEach(f => {
      if (f.isRequired) required.push(f.name);
      properties[f.name] = {
        title: f.name,
        description: f.description,
        type: f.dataType === 'timestamp' ? 'string' : f.dataType,
        format: f.dataType === 'timestamp' ? 'date-time' : undefined,
        'meta:xdmField': true,
        'meta:isIdentifier': f.isIdentifier,
        'meta:identifierType': f.identifierType,
        'meta:duleClassification': f.classification,
      };
    });

    return {
      $schema: 'http://json-schema.org/draft-06/schema#',
      title: schemaName,
      type: 'object',
      version,
      description,
      'meta:baseClass': getBaseClassUri(schemaCategory),
      'meta:tenantNamespace': tenantNamespace,
      'meta:status': 'Enabled for Profile',
      required: required.length > 0 ? required : undefined,
      properties
    };
  };

  const handlePublishSchema = () => {
    setModalError(null);
    const finalFields = getFinalFields();
    if (finalFields.length === 0) {
      setModalError('Please select or add at least one field to create the schema.');
      return;
    }

    const created = createSchema({
      name: schemaName.trim() || 'Custom Schema',
      version: version.trim() || '1.0.0',
      category: schemaCategory,
      description: description.trim(),
      baseClass: getBaseClassUri(schemaCategory),
      fieldGroups: [selectedArchetypeId],
      tenantNamespace: tenantNamespace.trim() || '_tenant',
      status: 'Enabled for Profile',
      fields: finalFields,
    });

    onCreated(created.id);
    onClose();
  };

  const handleInstantiateBlueprint = (blueprintId: string) => {
    loadSchemaBlueprint(blueprintId);
    onClose();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(generateJsonSchema(), null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const enabledCount = activeFields.filter(f => f.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-md shadow-xl border border-[#E1E5EA] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-[#2C2C2C]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#F8F9FA] border-b border-[#E1E5EA] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1473E6] text-white flex items-center justify-center shadow-2xs">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-[#2C2C2C] text-sm tracking-tight">
                  {modalMode === 'simplified' ? 'Create New Schema' : 'XDM Schema Architect'}
                </h3>
                <span className="text-[10px] bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] font-semibold px-2 py-0.2 rounded uppercase">
                  {modalMode === 'simplified' ? 'Guided Flow' : 'Pro Architect'}
                </span>
              </div>
              <p className="text-xs text-[#1E2229] mt-0.5">
                {modalMode === 'simplified'
                  ? 'Define your customer or event model in 3 simple steps'
                  : 'Advanced XDM schema registry with custom namespaces, DULE governance & JSON Schema export'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Modal Mode Selector */}
            <div className="bg-[#FFFFFF] border border-[#D5D5D5] p-0.5 rounded flex items-center text-xs font-medium">
              <button
                onClick={() => setModalMode('simplified')}
                className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                  modalMode === 'simplified'
                    ? 'bg-[#1473E6] text-white font-medium shadow-2xs'
                    : 'text-[#1A1D23] hover:text-[#2C2C2C]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Simple Flow</span>
              </button>
              <button
                onClick={() => setModalMode('pro_architect')}
                className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                  modalMode === 'pro_architect'
                    ? 'bg-[#1473E6] text-white font-medium shadow-2xs'
                    : 'text-[#1A1D23] hover:text-[#2C2C2C]'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Pro Architect</span>
              </button>
              <button
                onClick={() => setModalMode('blueprints')}
                className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                  modalMode === 'blueprints'
                    ? 'bg-[#1473E6] text-white font-medium shadow-2xs'
                    : 'text-[#1A1D23] hover:text-[#2C2C2C]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Blueprints</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#1E2229] border border-[#E1E5EA] flex items-center justify-center transition-colors text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ========================================================================= */}
          {/* SIMPLIFIED 3-STEP FLOW                                                    */}
          {/* ========================================================================= */}
          {modalMode === 'simplified' && (
            <div className="space-y-5">
              {/* Step Navigation Indicator */}
              <div
                id="schema-wizard-step-strip"
                className={`flex items-center justify-between p-1.5 rounded-lg border transition-colors ${
                  stripTheme === 'dark'
                    ? 'bg-[#121620] border-[#252C3B] shadow-inner text-slate-100'
                    : 'bg-[#F8F9FA] border-[#E1E5EA] text-[#2C2C2C]'
                }`}
              >
                {/* Step 1 */}
                <button
                  id="step-strip-1-select-model"
                  type="button"
                  onClick={() => setSimplifiedStep(1)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                    simplifiedStep === 1
                      ? stripTheme === 'dark'
                        ? 'bg-[#1E2536] text-[#60A5FA] shadow-xs border border-[#3B82F6]/50 ring-1 ring-[#3B82F6]/25'
                        : 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs border border-[#E1E5EA]'
                      : stripTheme === 'dark'
                      ? 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#181E29]'
                      : 'text-[#1E2229] hover:text-[#2C2C2C] hover:bg-[#EAEFF5]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      simplifiedStep === 1
                        ? 'bg-[#1473E6] text-white shadow-xs'
                        : simplifiedStep > 1
                        ? stripTheme === 'dark'
                          ? 'bg-[#0C2D57] text-[#38BDF8] border border-[#0284C7]/50 font-bold'
                          : 'bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC]'
                        : stripTheme === 'dark'
                        ? 'bg-[#1E2535] text-[#64748B] border border-[#334155]'
                        : 'bg-[#E1E5EA] text-[#1E2229]'
                    }`}
                  >
                    {simplifiedStep > 1 ? '✓' : '1'}
                  </span>
                  <span className={simplifiedStep === 1 ? (stripTheme === 'dark' ? 'text-[#F1F5F9]' : 'text-[#1473E6]') : ''}>
                    Select Model Type
                  </span>
                </button>

                <div className={`px-1 select-none text-xs font-mono ${stripTheme === 'dark' ? 'text-[#475569]' : 'text-[#D5D5D5]'}`}>
                  →
                </div>

                {/* Step 2 */}
                <button
                  id="step-strip-2-choose-attributes"
                  type="button"
                  onClick={() => setSimplifiedStep(2)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                    simplifiedStep === 2
                      ? stripTheme === 'dark'
                        ? 'bg-[#1E2536] text-[#60A5FA] shadow-xs border border-[#3B82F6]/50 ring-1 ring-[#3B82F6]/25'
                        : 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs border border-[#E1E5EA]'
                      : stripTheme === 'dark'
                      ? 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#181E29]'
                      : 'text-[#1E2229] hover:text-[#2C2C2C] hover:bg-[#EAEFF5]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      simplifiedStep === 2
                        ? 'bg-[#1473E6] text-white shadow-xs'
                        : simplifiedStep > 2
                        ? stripTheme === 'dark'
                          ? 'bg-[#0C2D57] text-[#38BDF8] border border-[#0284C7]/50 font-bold'
                          : 'bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC]'
                        : stripTheme === 'dark'
                        ? 'bg-[#1E2535] text-[#64748B] border border-[#334155]'
                        : 'bg-[#E1E5EA] text-[#1E2229]'
                    }`}
                  >
                    {simplifiedStep > 2 ? '✓' : '2'}
                  </span>
                  <span className={simplifiedStep === 2 ? (stripTheme === 'dark' ? 'text-[#F1F5F9]' : 'text-[#1473E6]') : ''}>
                    Choose Attributes ({enabledCount})
                  </span>
                </button>

                <div className={`px-1 select-none text-xs font-mono ${stripTheme === 'dark' ? 'text-[#475569]' : 'text-[#D5D5D5]'}`}>
                  →
                </div>

                {/* Step 3 */}
                <button
                  id="step-strip-3-review-publish"
                  type="button"
                  onClick={() => setSimplifiedStep(3)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center space-x-2 ${
                    simplifiedStep === 3
                      ? stripTheme === 'dark'
                        ? 'bg-[#1E2536] text-[#60A5FA] shadow-xs border border-[#3B82F6]/50 ring-1 ring-[#3B82F6]/25'
                        : 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs border border-[#E1E5EA]'
                      : stripTheme === 'dark'
                      ? 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#181E29]'
                      : 'text-[#1E2229] hover:text-[#2C2C2C] hover:bg-[#EAEFF5]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      simplifiedStep === 3
                        ? 'bg-[#1473E6] text-white shadow-xs'
                        : stripTheme === 'dark'
                        ? 'bg-[#1E2535] text-[#64748B] border border-[#334155]'
                        : 'bg-[#E1E5EA] text-[#1E2229]'
                    }`}
                  >
                    3
                  </span>
                  <span className={simplifiedStep === 3 ? (stripTheme === 'dark' ? 'text-[#F1F5F9]' : 'text-[#1473E6]') : ''}>
                    Review & Publish
                  </span>
                </button>

                {/* Theme Toggle Button */}
                <button
                  type="button"
                  id="toggle-strip-theme-button"
                  onClick={() => setStripTheme(stripTheme === 'dark' ? 'light' : 'dark')}
                  className={`ml-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors flex items-center space-x-1 shrink-0 ${
                    stripTheme === 'dark'
                      ? 'bg-[#1E2536] text-[#94A3B8] hover:text-white border border-[#334155]'
                      : 'bg-white text-[#1E2229] hover:text-[#2C2C2C] border border-[#D5D5D5]'
                  }`}
                  title={`Switch to ${stripTheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {stripTheme === 'dark' ? (
                    <>
                      <Moon className="w-3 h-3 text-[#60A5FA]" />
                      <span className="hidden sm:inline">Dark</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3 h-3 text-[#0284C7]" />
                      <span className="hidden sm:inline">Light</span>
                    </>
                  )}
                </button>
              </div>

              {/* STEP 1: Select Model Type */}
              {simplifiedStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2C2C] uppercase tracking-wider">What kind of data are you modeling?</h4>
                    <p className="text-xs text-[#1E2229] mt-0.5">
                      Choose an archetype to pre-populate industry-standard identity keys and attributes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {ARCHETYPES.map(arch => {
                      const Icon = arch.icon;
                      const isSelected = selectedArchetypeId === arch.id;
                      return (
                        <div
                          key={arch.id}
                          onClick={() => {
                            setSelectedArchetypeId(arch.id);
                          }}
                          className={`p-3.5 rounded border transition-all cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? 'bg-[#FFFFFF] border-[#1473E6] ring-1 ring-[#1473E6] shadow-2xs'
                              : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#D5D5D5]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-1.5 rounded ${isSelected ? 'bg-gradient-to-br from-[#1473E6] to-[#0A3D82] text-white' : 'bg-[#EBF3FC] text-[#0D66D0]'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#F2F4F7] text-[#1A1D23] uppercase font-mono border border-[#E1E5EA]">
                                {arch.category}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-[#2C2C2C] mb-1">{arch.name}</h5>
                            <p className="text-[11px] text-[#1E2229] leading-snug">{arch.description}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#F2F4F7] flex items-center justify-between text-[11px] font-semibold text-[#1473E6]">
                            <span>{arch.suggestedFields.length} starter fields</span>
                            {isSelected ? <Check className="w-3.5 h-3.5 text-[#1473E6]" /> : <span className="text-[#262A33]">Select</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#E1E5EA]">
                    <button
                      type="button"
                      onClick={() => setSimplifiedStep(2)}
                      className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs"
                    >
                      <span>Continue to Attributes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Attributes */}
              {simplifiedStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#2C2C2C] uppercase tracking-wider">Select Attributes for {schemaName}</h4>
                      <p className="text-xs text-[#1E2229] mt-0.5">
                        Click chips to enable or disable fields. Add custom attributes as needed.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#0D66D0] bg-[#EBF3FC] px-2 py-0.5 rounded border border-[#C5DCFA]">
                      {enabledCount} of {activeFields.length} active
                    </span>
                  </div>

                  {/* Attribute Chips Selection */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1E2229]">
                      Pre-Configured Model Attributes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeFields.map(f => (
                        <div
                          key={f.name}
                          onClick={() => handleToggleField(f.name)}
                          className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                            f.enabled
                              ? 'bg-[#FFFFFF] border-[#1473E6] ring-1 ring-[#1473E6] shadow-2xs'
                              : 'bg-[#F8F9FA] border-[#E1E5EA] opacity-60 hover:opacity-80'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                              f.enabled ? 'bg-[#1473E6] text-white' : 'border border-[#D5D5D5] bg-[#FFFFFF]'
                            }`}>
                              {f.enabled && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold text-xs text-[#2C2C2C] truncate font-mono">{f.name}</span>
                                <span className="text-[10px] text-[#1E2229] font-mono bg-[#F2F4F7] px-1 py-0.2 rounded border border-[#E1E5EA]">
                                  {f.dataType}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#1E2229] truncate leading-snug">{f.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 ml-2">
                            {f.isIdentifier && (
                              <span className="text-[9px] font-semibold bg-[#EBF3FC] text-[#0D66D0] px-1.5 py-0.2 rounded border border-[#C5DCFA]">
                                ID KEY
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveField(f.name);
                              }}
                              className="text-[#262A33] hover:text-[#0A3D82] p-1 transition-colors"
                              title="Delete attribute"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Custom Attribute Row */}
                  <div className="bg-[#F8F9FA] p-3 rounded border border-[#E1E5EA] space-y-2">
                    <span className="text-xs font-semibold text-[#2C2C2C] flex items-center space-x-1">
                      <Plus className="w-3.5 h-3.5 text-[#1473E6]" />
                      <span>Add Custom Attribute</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={customFieldName}
                          onChange={(e) => setCustomFieldName(e.target.value)}
                          placeholder="Attribute name (e.g. churnScore)"
                          className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2.5 py-1 text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <select
                          value={customFieldType}
                          onChange={(e) => setCustomFieldType(e.target.value as any)}
                          className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2 py-1 text-xs font-medium text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                        >
                          <option value="string">Text (string)</option>
                          <option value="number">Number</option>
                          <option value="boolean">Yes/No (boolean)</option>
                          <option value="timestamp">Date / Time</option>
                          <option value="array">List (array)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex items-center">
                        <label className="flex items-center space-x-1 text-xs text-[#2C2C2C] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customFieldIsId}
                            onChange={(e) => setCustomFieldIsId(e.target.checked)}
                            className="rounded text-[#1473E6]"
                          />
                          <span className="text-[11px] font-semibold">Is ID Key</span>
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddQuickCustomField}
                          disabled={!customFieldName.trim()}
                          className="w-full bg-[#1473E6] hover:bg-[#0D66D0] disabled:opacity-50 text-white rounded py-1 text-xs font-medium transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    {modalError && (
                      <div className="mt-2 p-2 bg-[#FFEBEB] border border-[#FFCCD0] rounded text-xs text-[#D7373F]">
                        {modalError}
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E1E5EA]">
                    <button
                      type="button"
                      onClick={() => setSimplifiedStep(1)}
                      className="px-3.5 py-1.5 text-xs font-medium text-[#1A1D23] hover:bg-[#F2F4F7] rounded transition-colors flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimplifiedStep(3)}
                      className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs"
                    >
                      <span>Continue to Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Publish */}
              {simplifiedStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2C2C] uppercase tracking-wider">Review & Name Your Schema</h4>
                    <p className="text-xs text-[#1E2229] mt-0.5">
                      Confirm schema details and publish to the central catalog.
                    </p>
                  </div>

                  <div className="bg-[#F8F9FA] p-3.5 rounded border border-[#E1E5EA] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Schema Name *</label>
                        <input
                          type="text"
                          value={schemaName}
                          onChange={(e) => setSchemaName(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs font-medium text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                          placeholder="e.g. Retail Customer Profile"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Category</label>
                        <input
                          type="text"
                          disabled
                          value={schemaCategory}
                          className="w-full bg-[#F2F4F7] border border-[#E1E5EA] rounded px-3 py-1.5 text-xs font-mono text-[#1E2229]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-3.5 bg-[#F8F9FA] rounded border border-[#E1E5EA] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-[#1473E6] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {enabledCount}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2C2C2C]">
                          {enabledCount} Attributes Ready to Publish
                        </div>
                        <div className="text-[11px] text-[#1E2229] mt-0.5">
                          Deterministic identity keys: {getFinalFields().filter(f => f.isIdentifier).map(f => f.name).join(', ') || 'None'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>DULE Validated</span>
                    </span>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E1E5EA]">
                    <button
                      type="button"
                      onClick={() => setSimplifiedStep(2)}
                      className="px-3.5 py-1.5 text-xs font-medium text-[#1A1D23] hover:bg-[#F2F4F7] rounded transition-colors flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishSchema}
                      className="px-5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium transition-all flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Publish Schema</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRO ARCHITECT VIEW (FOR ENTERPRISE DATA ARCHITECTS)                       */}
          {/* ========================================================================= */}
          {modalMode === 'pro_architect' && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setBuilderTab('design')}
                    className={`px-3 py-1 rounded transition-all ${
                      builderTab === 'design'
                        ? 'bg-[#1473E6] text-white shadow-2xs font-medium'
                        : 'bg-[#F2F4F7] text-[#1A1D23] hover:bg-[#E1E5EA]'
                    }`}
                  >
                    1. Architecture & DULE Metadata
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderTab('preview_json')}
                    className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
                      builderTab === 'preview_json'
                        ? 'bg-[#1473E6] text-white shadow-2xs font-medium'
                        : 'bg-[#F2F4F7] text-[#1A1D23] hover:bg-[#E1E5EA]'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>2. JSON Schema Draft-06 ({getFinalFields().length} Fields)</span>
                  </button>
                </div>
                <span className="text-[11px] text-[#1E2229] font-mono">
                  Base URI: {getBaseClassUri(schemaCategory)}
                </span>
              </div>

              {builderTab === 'preview_json' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E2229]">
                      Standard XLR8 Platform / OpenAPI compatible JSON schema specification.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#1A1D23] text-xs font-medium rounded transition-colors"
                    >
                      {copiedJson ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 bg-[#1E1E1E] text-[#A6E22E] font-mono text-xs rounded overflow-x-auto max-h-96 border border-[#2D2D2D] leading-relaxed">
                    {JSON.stringify(generateJsonSchema(), null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {/* Pro Config Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#F8F9FA] p-3.5 rounded border border-[#E1E5EA]">
                    <div>
                      <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Schema Name</label>
                      <input
                        type="text"
                        value={schemaName}
                        onChange={(e) => setSchemaName(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2.5 py-1 text-xs font-medium text-[#2C2C2C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Base Class</label>
                      <select
                        value={schemaCategory}
                        onChange={(e) => setSchemaCategory(e.target.value as any)}
                        className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2 py-1 text-xs font-medium text-[#2C2C2C]"
                      >
                        <option value="Profile">XDM Individual Profile (Record)</option>
                        <option value="ExperienceEvent">XDM ExperienceEvent (Time-Series)</option>
                        <option value="B2BAccount">XDM B2B Account & Organization</option>
                        <option value="Consent">XDM Consent & Privacy Preferences</option>
                        <option value="Lookup">Lookup & Reference Dimension</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Namespace & Version</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={tenantNamespace}
                          onChange={(e) => setTenantNamespace(e.target.value)}
                          className="bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2 py-1 text-xs font-mono text-[#2C2C2C]"
                        />
                        <input
                          type="text"
                          value={version}
                          onChange={(e) => setVersion(e.target.value)}
                          className="bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2 py-1 text-xs font-mono text-[#2C2C2C]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Fields Table with Full Controls */}
                  <div className="border border-[#E1E5EA] rounded overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8F9FA] text-[10px] font-semibold text-[#1E2229] uppercase border-b border-[#E1E5EA]">
                        <tr>
                          <th className="px-3 py-2">Field</th>
                          <th className="px-3 py-2">Data Type</th>
                          <th className="px-3 py-2">DULE Class</th>
                          <th className="px-3 py-2">Identity</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E5EA]">
                        {getFinalFields().map((f) => (
                          <tr key={f.name} className="hover:bg-[#F9FAFB]">
                            <td className="px-3 py-2 font-mono font-semibold text-[#2C2C2C]">{f.name}</td>
                            <td className="px-3 py-2 font-mono text-[#1E2229]">{f.dataType}</td>
                            <td className="px-3 py-2">
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F2F4F7] text-[#1A1D23] border border-[#E1E5EA]">
                                {f.classification}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {f.isIdentifier ? (
                                <span className="text-[10px] font-semibold text-[#0D66D0] bg-[#EBF3FC] px-1.5 py-0.2 rounded border border-[#C5DCFA]">
                                  {f.identifierType?.toUpperCase()}
                                </span>
                              ) : (
                                <span className="text-[#262A33]">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveField(f.name)}
                                className="text-[#262A33] hover:text-[#0A3D82] p-1 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E1E5EA]">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 text-xs font-medium text-[#1A1D23] hover:bg-[#F2F4F7] rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishSchema}
                      className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium transition-all shadow-2xs flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Publish to Registry</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STANDARD XDM BLUEPRINTS STARTER GALLERY                                   */}
          {/* ========================================================================= */}
          {modalMode === 'blueprints' && (
            <div className="space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-[#2C2C2C] uppercase tracking-wider">Standard Production Blueprints</h4>
                <p className="text-xs text-[#1E2229] mt-0.5">
                  Select a certified Experience Data Model blueprint to instantiate directly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {STANDARD_SCHEMA_BLUEPRINTS.map(bp => (
                  <div
                    key={bp.id}
                    className="p-3.5 rounded border border-[#E1E5EA] hover:border-[#1473E6] bg-[#FFFFFF] transition-all shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                          {bp.category}
                        </span>
                        <span className="text-xs font-semibold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.2 rounded border border-[#BAE6FD]">
                          {bp.fields.length} Fields
                        </span>
                      </div>

                      <h5 className="font-bold text-xs text-[#2C2C2C] mb-1">{bp.name}</h5>
                      <p className="text-xs text-[#1E2229] leading-relaxed line-clamp-3 mb-3">{bp.description}</p>
                    </div>

                    <button
                      onClick={() => handleInstantiateBlueprint(bp.id)}
                      className="w-full py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instantiate Blueprint</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
