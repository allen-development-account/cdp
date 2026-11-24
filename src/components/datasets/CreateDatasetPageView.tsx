import React, { useState, useRef } from 'react';
import { useCDP } from '../../context/CDPContext';
import { Dataset, PrivacyLabelCategoryType } from '../../types/cdp';
import { ALL_PRIVACY_LABELS, STANDARD_PRIVACY_LABEL_CATEGORIES, getCrispPurpose } from '../../data/privacyLabelsData';
import { PageBackButton } from '../common/PageBackButton';
import {
  Database,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Cloud,
  Check,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Upload,
  Zap,
  Layers,
  Share2,
  FileCheck,
  RefreshCw,
  Table,
  CheckSquare,
  Server,
  Lock,
  Radio,
  ExternalLink,
  Code
} from 'lucide-react';

export type IngestionSourceOption =
  | 'csv'
  | 'excel'
  | 'streaming'
  | 'cloud'
  | 'mesh'
  | 'connector';

interface SourceMethodDefinition {
  id: IngestionSourceOption;
  title: string;
  category: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconBg: string;
  defaultFormat: 'CSV' | 'JSON' | 'Parquet' | 'Avro';
  defaultIngestionType: 'Streaming' | 'Batch' | 'Federated Zero-Copy';
  defaultConnector: string;
  defaultSchemaId: string;
  defaultName: string;
  defaultDescription: string;
  pipelineDetails: string;
}

const SOURCE_OPTIONS: SourceMethodDefinition[] = [
  {
    id: 'csv',
    title: 'CSV Delimited File',
    category: 'Flat File Import',
    description: 'Upload structured CSV or TSV files with auto-detected delimiters, headers, and column type inferencing.',
    badge: 'Fast File Drop',
    badgeColor: 'bg-[#EBF3FC] text-[#0A4BB5] border-[#BFDBFE]',
    icon: FileText,
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    defaultFormat: 'CSV',
    defaultIngestionType: 'Batch',
    defaultConnector: 'XLR8 CSV Delimited File Ingestion Engine',
    defaultSchemaId: 'xdm_experience_event',
    defaultName: 'Delimited Customer Transactions 2026',
    defaultDescription: 'Delimited CSV dataset imported for profile enrichment and behavioral event ingestion.',
    pipelineDetails: 'Auto-delimit parsing with RFC 4180 compliance, header normalization, and column inferencing.'
  },
  {
    id: 'excel',
    title: 'Microsoft Excel File',
    category: 'Spreadsheet Import',
    description: 'Import .xlsx or .xls workbooks with multi-sheet tab selection, header mapping, and automated formula resolution.',
    badge: 'Workbook Sync',
    badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
    icon: FileSpreadsheet,
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700',
    defaultFormat: 'CSV',
    defaultIngestionType: 'Batch',
    defaultConnector: 'Microsoft Excel (.xlsx) Ingestion Reader',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'Regional Loyalty Members Workbook',
    defaultDescription: 'Microsoft Excel customer records synced from regional operations and loyalty programs.',
    pipelineDetails: 'Binary OOXML spreadsheet streaming with automated type coercion and multi-tab sheet parsing.'
  },
  {
    id: 'streaming',
    title: 'Real-Time Streaming Endpoint',
    category: 'Sub-Second Stream',
    description: 'Publish live events directly via authenticated HTTP REST API Webhook or Kafka topic into edge network.',
    badge: 'Sub-Second Edge',
    badgeColor: 'bg-[#FFF4E5] text-[#B76E00] border-[#FFE2B3]',
    icon: Zap,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    defaultFormat: 'JSON',
    defaultIngestionType: 'Streaming',
    defaultConnector: 'HTTP Webhook Real-Time Ingestion Gateway',
    defaultSchemaId: 'xdm_experience_event',
    defaultName: 'Digital Interaction Real-Time Stream',
    defaultDescription: 'High-throughput real-time digital events streamed directly from XLR8 Edge Network Webhooks.',
    pipelineDetails: 'Sub-50ms distributed edge ingestion gateway with mTLS authentication and Kafka topic buffering.'
  },
  {
    id: 'cloud',
    title: 'Cloud Storage Batch Drop',
    category: 'Object Storage Sync',
    description: 'Scheduled recurring ingestion from Amazon S3, Google Cloud Storage (GCS), or Azure Blob Storage.',
    badge: 'Automated Batch',
    badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
    icon: Cloud,
    iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-700',
    defaultFormat: 'Parquet',
    defaultIngestionType: 'Batch',
    defaultConnector: 'AWS S3 Cloud Storage Bucket Connector',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'S3 Nightly Master Ingestion',
    defaultDescription: 'Scheduled batch extraction from cloud object storage data lake buckets.',
    pipelineDetails: 'Distributed parallel object manifest scanner with Parquet snappy compression and column pruning.'
  },
  {
    id: 'mesh',
    title: 'Federated Zero-Copy Mesh',
    category: 'Enterprise Data Mesh',
    description: 'Federated live pushdown query execution across Snowflake, BigQuery, or Databricks without data movement.',
    badge: 'Zero-Copy Query',
    badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
    icon: Layers,
    iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-700',
    defaultFormat: 'Parquet',
    defaultIngestionType: 'Federated Zero-Copy',
    defaultConnector: 'Snowflake Zero-Copy Federated Data Mesh',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'Snowflake Customer 360 Zero-Copy View',
    defaultDescription: 'Pushdown federated queries against cloud data warehouse tables with zero pipeline replication.',
    pipelineDetails: 'Pushdown execution via ANSI SQL ANSI-compliant query virtualizer without pipeline duplication.'
  },
  {
    id: 'connector',
    title: 'Enterprise CRM & App Connector',
    category: 'Managed SaaS Connector',
    description: 'Direct pre-built synchronization with Salesforce CRM, HubSpot, Shopify Plus, or Marketo Engage.',
    badge: 'Managed SaaS',
    badgeColor: 'bg-[#DEFBE6] text-[#065F46] border-[#A7F3D0]',
    icon: Share2,
    iconBg: 'bg-gradient-to-br from-teal-600 to-emerald-700',
    defaultFormat: 'JSON',
    defaultIngestionType: 'Batch',
    defaultConnector: 'Salesforce Enterprise CRM Connector',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'Salesforce CRM Contacts Master',
    defaultDescription: 'Managed SaaS connector synchronizing authenticated CRM customer accounts and contact histories.',
    pipelineDetails: 'Pre-authenticated OAuth 2.0 incremental change data capture (CDC) with retry backoffs.'
  }
];

export const CreateDatasetPageView: React.FC = () => {
  const { schemas, createDataset, setActiveTab, setSelectedDatasetId } = useCDP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard Step: 1: Method -> 2: Source Config -> 3: Identity & Schema -> 4: Technical Specs -> 5: Governance -> 6: Review & Finalize
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Hot reloading transition state when clicking a method
  const [isHotReloading, setIsHotReloading] = useState(false);
  const [hotReloadingMethod, setHotReloadingMethod] = useState<IngestionSourceOption | null>(null);

  // Selected Ingestion Source
  const [selectedSource, setSelectedSource] = useState<IngestionSourceOption>('csv');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    rows: number;
    sheetName?: string;
  } | null>({
    name: 'ecommerce_customer_orders_2026.csv',
    size: '342 KB',
    rows: 1420
  });

  // Source-specific configs
  const [delimiter, setDelimiter] = useState<',' | '\t' | ';' | '|'>(',');
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [streamingProtocol, setStreamingProtocol] = useState<'http_webhook' | 'kafka'>('http_webhook');
  const [kafkaTopic, setKafkaTopic] = useState('xlr8.prod.events.v1');
  const [cloudProvider, setCloudProvider] = useState<'s3' | 'gcs' | 'azure'>('s3');
  const [cloudPath, setCloudPath] = useState('s3://enterprise-cdp-lakehouse/raw/incoming_batches/');
  const [cloudSchedule, setCloudSchedule] = useState<'Hourly' | 'Every 6 Hours' | 'Nightly Batch (02:00 UTC)'>('Nightly Batch (02:00 UTC)');
  const [meshWarehouse, setMeshWarehouse] = useState<'snowflake' | 'bigquery' | 'databricks'>('snowflake');
  const [meshTable, setMeshTable] = useState('ANALYTICS_PROD.CUSTOMER_DATA.V_UNIFIED_PROFILES');
  const [isMeshVerified, setIsMeshVerified] = useState(true);
  const [connectorApp, setConnectorApp] = useState<'salesforce' | 'hubspot' | 'shopify' | 'marketo'>('salesforce');
  const [connectorEntity, setConnectorEntity] = useState('Contacts');

  // Step 3: Identity
  const [name, setName] = useState('Ecommerce Customer Orders 2026');
  const [description, setDescription] = useState(
    'Delimited CSV dataset imported for profile enrichment and behavioral event ingestion.'
  );
  const [schemaId, setSchemaId] = useState(schemas[0]?.id || 'xdm_experience_event');
  const [profileEnabled, setProfileEnabled] = useState(true);

  // Step 4: Technical
  const [ingestionType, setIngestionType] = useState<'Streaming' | 'Batch' | 'Federated Zero-Copy'>('Batch');
  const [format, setFormat] = useState<'JSON' | 'Parquet' | 'CSV' | 'Avro'>('CSV');
  const [sourceConnectorName, setSourceConnectorName] = useState('XLR8 CSV Delimited File Ingestion Engine');
  const [errorThresholdPercent, setErrorThresholdPercent] = useState('0.5');

  // Step 5: Governance
  const [labels, setLabels] = useState<string[]>(['C1', 'C4', 'I2']);
  const [categoryFilter, setCategoryFilter] = useState<'All' | PrivacyLabelCategoryType>('All');
  const [labelSearchQuery, setLabelSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory'])
  );

  const currentSourceDef = SOURCE_OPTIONS.find(s => s.id === selectedSource) || SOURCE_OPTIONS[0];
  const selectedSchema = schemas.find(s => s.id === schemaId);

  // Method Selection with Hot Reload Trigger
  const handleSelectMethodAndHotReload = (sourceId: IngestionSourceOption) => {
    setHotReloadingMethod(sourceId);
    setIsHotReloading(true);

    const def = SOURCE_OPTIONS.find(s => s.id === sourceId);
    if (!def) return;

    // Apply smart preset defaults
    setSelectedSource(sourceId);
    setIngestionType(def.defaultIngestionType);
    setFormat(def.defaultFormat);
    setSourceConnectorName(def.defaultConnector);
    if (def.defaultSchemaId) {
      const match = schemas.find(s => s.id === def.defaultSchemaId);
      if (match) setSchemaId(match.id);
    }

    if (sourceId === 'csv') {
      setUploadedFile({
        name: 'ecommerce_customer_orders_2026.csv',
        size: '342 KB',
        rows: 1420
      });
      setName('Ecommerce Customer Orders 2026');
      setDescription('Delimited CSV dataset imported for profile enrichment and behavioral event ingestion.');
    } else if (sourceId === 'excel') {
      setUploadedFile({
        name: 'regional_loyalty_members.xlsx',
        size: '418 KB',
        rows: 890,
        sheetName: 'Sheet1_Members'
      });
      setName('Regional Loyalty Members Workbook');
      setDescription('Microsoft Excel customer records synced from regional operations and loyalty programs.');
    } else if (sourceId === 'streaming') {
      setUploadedFile(null);
      setName('Digital Interaction Real-Time Stream');
      setDescription('High-throughput real-time digital events streamed directly from XLR8 Edge Network Webhooks.');
      setSourceConnectorName(
        streamingProtocol === 'http_webhook'
          ? 'HTTP Webhook Real-Time Ingestion Gateway'
          : 'Apache Kafka Event Stream Topic'
      );
    } else if (sourceId === 'cloud') {
      setUploadedFile(null);
      setName('S3 Nightly Master Ingestion');
      setDescription('Scheduled batch extraction from cloud object storage data lake buckets.');
      setSourceConnectorName('AWS S3 Cloud Storage Bucket Connector');
    } else if (sourceId === 'mesh') {
      setUploadedFile(null);
      setName('Snowflake Customer 360 Zero-Copy View');
      setDescription('Pushdown federated queries against cloud data warehouse tables with zero pipeline replication.');
      setSourceConnectorName('Snowflake Zero-Copy Federated Data Mesh');
    } else if (sourceId === 'connector') {
      setUploadedFile(null);
      setName('Salesforce CRM Contacts Master');
      setDescription('Managed SaaS connector synchronizing authenticated CRM customer accounts and contact histories.');
      setSourceConnectorName('Salesforce Enterprise CRM Connector');
    }

    // Simulate snappy Hot Reload transition
    setTimeout(() => {
      setIsHotReloading(false);
      setHotReloadingMethod(null);
      setStep(2); // Automatically advance to the next sequential screen!
    }, 450);
  };

  // Local file upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024) || 12;
    const estRows = Math.max(10, Math.round(sizeKb * 4.5));
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    setUploadedFile({
      name: file.name,
      size: `${sizeKb} KB`,
      rows: estRows,
      sheetName: selectedSource === 'excel' ? 'Sheet1' : undefined
    });
    setName(capitalizedName);
    setDescription(`Imported ${file.name} dataset with ${estRows} records for real-time customer data processing.`);
  };

  // Load verified test samples
  const loadPresetFile = (sampleType: 'ecommerce_csv' | 'crm_csv' | 'loyalty_xlsx' | 'inventory_xlsx') => {
    if (sampleType === 'ecommerce_csv') {
      setUploadedFile({
        name: 'ecommerce_checkout_events.csv',
        size: '512 KB',
        rows: 2450
      });
      setName('Ecommerce Checkout Events 2026');
      setDescription('Delimited CSV stream containing online product purchases, shopping cart updates, and payment confirmations.');
      setFormat('CSV');
      setIngestionType('Batch');
      setSourceConnectorName('XLR8 CSV Delimited File Ingestion Engine');
    } else if (sampleType === 'crm_csv') {
      setUploadedFile({
        name: 'b2b_crm_contacts_export.csv',
        size: '280 KB',
        rows: 1120
      });
      setName('B2B Enterprise Contacts Master');
      setDescription('Direct CSV customer export containing verified corporate email addresses, phone numbers, and company domains.');
      setFormat('CSV');
      setIngestionType('Batch');
      setSourceConnectorName('XLR8 CSV Delimited File Ingestion Engine');
    } else if (sampleType === 'loyalty_xlsx') {
      setUploadedFile({
        name: 'loyalty_club_rewards_q3.xlsx',
        size: '640 KB',
        rows: 1850,
        sheetName: 'Active_Tier_Members'
      });
      setName('Loyalty Club Tier Rewards Q3');
      setDescription('Multi-tier loyalty program member balances, point redemption milestones, and VIP classifications.');
      setFormat('CSV');
      setIngestionType('Batch');
      setSourceConnectorName('Microsoft Excel (.xlsx) Ingestion Reader');
    } else if (sampleType === 'inventory_xlsx') {
      setUploadedFile({
        name: 'omnichannel_store_fulfillments.xlsx',
        size: '390 KB',
        rows: 940,
        sheetName: 'Store_Shipments'
      });
      setName('Omnichannel Store Fulfillments');
      setDescription('Cross-channel retail store inventory orders, click-and-collect receipts, and local depot deliveries.');
      setFormat('CSV');
      setIngestionType('Batch');
      setSourceConnectorName('Microsoft Excel (.xlsx) Ingestion Reader');
    }
  };

  // Toggle governance label
  const toggleLabel = (code: string) => {
    setLabels(prev => (prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]));
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // Final submission and dataset creation
  const handleFinalSubmit = () => {
    if (!name.trim()) return;

    const rowCount = uploadedFile?.rows || 1250;
    const sizeBytes = uploadedFile ? parseInt(uploadedFile.size) * 1024 : 1024 * 512;
    const sizeFormatted = uploadedFile ? uploadedFile.size : '512 KB';

    const newDataset = createDataset({
      name: name.trim(),
      description: description.trim() || 'Custom dataset onboarded into XLR8 Real-Time CDP platform.',
      schemaId: schemaId,
      schemaName: selectedSchema?.name || 'XDM ExperienceEvent',
      sourceConnectorName: sourceConnectorName,
      ingestionType,
      recordCount: rowCount,
      sizeBytes,
      sizeFormatted,
      status: 'Active',
      isProfileEnabled: profileEnabled,
      format,
      labels,
      fieldLabels: {},
      tags: [
        currentSourceDef.title,
        ingestionType,
        format,
        profileEnabled ? 'Profile Enabled' : 'Analytical'
      ]
    });

    setSelectedDatasetId(newDataset.id);
    setActiveTab('datasets');
  };

  const filteredCategories = STANDARD_PRIVACY_LABEL_CATEGORIES.filter(cat => {
    if (categoryFilter === 'All') return true;
    return cat.id === categoryFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150" id="create-dataset-page-view">
      {/* Top Breadcrumb & Page Navigation */}
      <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
        <div className="flex items-center space-x-2.5 text-xs">
          <PageBackButton fallbackTab="datasets" fallbackLabel="Datasets" showForward />
          <span className="text-[#94A3B8]">/</span>
          <span className="text-[#64748B] hover:text-[#0F172A] cursor-pointer" onClick={() => setActiveTab('datasets')}>
            Datasets
          </span>
          <span className="text-[#94A3B8]">/</span>
          <span className="font-bold text-[#0F172A] text-sm">Bring In New Dataset</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('datasets')}
            className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] transition-all shadow-2xs"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Corporate Unified Blue Gradient Hero Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-2xl border border-[#0E4DA4] shadow-sm relative overflow-hidden p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-md text-white">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border shadow-2xs bg-white/15 text-white border-white/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Corporate Guided Ingestion Engine
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-[#8CE2A7] border border-[#8CE2A7]/40">
                  Adobe RT-CDP Compliant
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Bring in a New Dataset to XLR8
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1.5 max-w-2xl leading-relaxed font-medium">
                {step === 1 && 'Step 1: Choose how you want to bring in your data. Click any method to hot reload and configure sequential screens.'}
                {step === 2 && `Step 2: Configure source connection, file payloads, and endpoints for ${currentSourceDef.title}.`}
                {step === 3 && 'Step 3: Define dataset identity, business purpose, and bind to target XDM schema.'}
                {step === 4 && 'Step 4: Specify technical ingestion parameters, serialization formats, and error thresholds.'}
                {step === 5 && 'Step 5: Apply Adobe Real-Time CDP Data Usage Labeling & Enforcement (DULE) governance taxonomy.'}
                {step === 6 && 'Step 6: Review full architecture parameters and activate dataset ingestion.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-xs border border-white/25 shadow-2xs text-xs font-semibold text-white">
              <span className="text-blue-100">Method: </span>
              <span className="text-white font-bold">{currentSourceDef.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive Multi-Step Stepper Bar */}
      <div className="bg-white rounded-xl border border-[#D0D7DE] p-3 shadow-2xs flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-max">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center space-x-2 font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              step === 1
                ? 'bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 1
                  ? 'bg-[#1473E6] text-white'
                  : step > 1
                  ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}
            >
              {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
            </span>
            <span>1. Ingestion Source</span>
          </button>

          <span className="text-[#CBD5E1]">/</span>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center space-x-2 font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              step === 2
                ? 'bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 2
                  ? 'bg-[#1473E6] text-white'
                  : step > 2
                  ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}
            >
              {step > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
            </span>
            <span>2. Source Config</span>
          </button>

          <span className="text-[#CBD5E1]">/</span>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center space-x-2 font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              step === 3
                ? 'bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3
                  ? 'bg-[#1473E6] text-white'
                  : step > 3
                  ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}
            >
              {step > 3 ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
            </span>
            <span>3. Identity & Schema</span>
          </button>

          <span className="text-[#CBD5E1]">/</span>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => setStep(4)}
            className={`flex items-center space-x-2 font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              step === 4
                ? 'bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 4
                  ? 'bg-[#1473E6] text-white'
                  : step > 4
                  ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}
            >
              {step > 4 ? <Check className="w-3 h-3 stroke-[3]" /> : '4'}
            </span>
            <span>4. Technical Specs</span>
          </button>

          <span className="text-[#CBD5E1]">/</span>

          {/* Step 5 */}
          <button
            type="button"
            onClick={() => setStep(5)}
            className={`flex items-center space-x-2 font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              step === 5
                ? 'bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 5
                  ? 'bg-[#1473E6] text-white'
                  : step > 5
                  ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}
            >
              {step > 5 ? <Check className="w-3 h-3 stroke-[3]" /> : '5'}
            </span>
            <span>5. DULE Governance</span>
          </button>

          <span className="text-[#CBD5E1]">/</span>

          {/* Step 6 */}
          <button
            type="button"
            onClick={() => setStep(6)}
            className={`flex items-center space-x-2 font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
              step === 6
                ? 'bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 6
                  ? 'bg-[#1473E6] text-white'
                  : 'bg-[#E2E8F0] text-[#475569]'
              }`}
            >
              6
            </span>
            <span>6. Review & Deploy</span>
          </button>
        </div>

        {step > 1 && (
          <button
            onClick={() => setStep(1)}
            className="text-[11px] font-bold text-[#1473E6] hover:underline flex items-center gap-1 shrink-0 ml-4"
          >
            <RefreshCw className="w-3 h-3" />
            Switch Ingestion Method
          </button>
        )}
      </div>

      {/* Hot Reloading Notification Overlay Banner */}
      {isHotReloading && (
        <div className="bg-[#EBF3FC] border border-[#93C5FD] rounded-xl p-4 shadow-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-[#0A4BB5] animate-spin" />
            <div>
              <p className="text-xs font-bold text-[#0A2540]">
                Hot Reloading Ingestion Pipeline for {SOURCE_OPTIONS.find(s => s.id === hotReloadingMethod)?.title}...
              </p>
              <p className="text-[11px] text-[#2563EB]">
                Configuring connector driver, protocol handlers, and advancing to source configuration screen...
              </p>
            </div>
          </div>
          <div className="w-36 bg-blue-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#1473E6] h-full animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {/* ================= STEP 1: CHOOSE INGESTION METHOD ================= */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-[#D0D7DE] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E5EA] pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                How would you like to bring in your data?
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Click your desired method below. The system will hot reload this module and open its tailored sequential configuration screen.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE] self-start sm:self-auto">
              Select to Hot Reload & Advance
            </span>
          </div>

          {/* Ingestion Method Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SOURCE_OPTIONS.map(opt => {
              const IconComp = opt.icon;
              const isSelected = selectedSource === opt.id;
              const isReloading = isHotReloading && hotReloadingMethod === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectMethodAndHotReload(opt.id)}
                  className={`group relative p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#1473E6] bg-[#F8FAFD] shadow-md ring-2 ring-[#1473E6]/20'
                      : 'border-[#CBD5E1] bg-white hover:border-[#1473E6] hover:shadow-md hover:bg-[#FAFCFF]'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon & Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl ${opt.iconBg} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#1473E6] transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mt-0.5">
                      {opt.category}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-[#334155] leading-relaxed mt-2">
                      {opt.description}
                    </p>
                  </div>

                  {/* Bottom Strip */}
                  <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#64748B]">
                      Format: <strong className="text-[#0F172A]">{opt.defaultFormat}</strong>
                    </span>

                    {isReloading ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#0A4BB5]">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Hot Reloading...
                      </span>
                    ) : isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#0E7A36] bg-[#DEFBE6] px-2 py-0.5 rounded border border-[#B4F0C3]">
                        <Check className="w-3 h-3 stroke-[3]" /> Selected
                      </span>
                    ) : (
                      <span className="font-bold text-[#1473E6] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Select & Configure <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[#475569]">
              <Info className="w-4 h-4 text-[#1473E6] shrink-0" />
              <span>
                Selecting any option will immediately initiate that ingestion driver and take you to Step 2 for detailed source configuration.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSelectMethodAndHotReload(selectedSource)}
              className="px-4 py-2 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Continue with {currentSourceDef.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SOURCE CONFIGURATION ================= */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-[#D0D7DE] p-6 shadow-xs space-y-6">
          {/* Method Identification Bar */}
          <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl ${currentSourceDef.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                <currentSourceDef.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Source Pipeline: {currentSourceDef.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                    Active Configuration
                  </span>
                </div>
                <p className="text-[11px] text-[#475569] mt-0.5">
                  {currentSourceDef.pipelineDetails}
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg border border-[#93C5FD] bg-white hover:bg-[#EFF6FF] text-xs font-bold text-[#1473E6] transition-all shadow-2xs shrink-0 self-start sm:self-auto"
            >
              ← Choose Different Method
            </button>
          </div>

          {/* Conditional Method Screens */}
          {selectedSource === 'csv' && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Upload CSV / TSV Delimited File
              </h3>

              {/* Drag and Drop Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#93C5FD] hover:border-[#1473E6] bg-[#F8FAFD] hover:bg-[#F0F7FF] rounded-2xl p-8 text-center cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[#EBF3FC] text-[#1473E6] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  Click to browse or drop your CSV / TSV file here
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  Supports standard UTF-8 comma-separated or tab-delimited records (up to 200 MB per file)
                </p>
              </div>

              {/* Uploaded File Pill */}
              {uploadedFile && (
                <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#1473E6] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{uploadedFile.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Size: <strong className="text-[#0F172A]">{uploadedFile.size}</strong> &bull; Estimated Records:{' '}
                        <strong className="text-[#0F172A]">{uploadedFile.rows.toLocaleString()} rows</strong> &bull;{' '}
                        <span className="text-[#0E7A36] font-semibold">Ready for schema mapping</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                  >
                    Change File
                  </button>
                </div>
              )}

              {/* Parsing Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Field Delimiter
                  </label>
                  <select
                    value={delimiter}
                    onChange={e => setDelimiter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                  >
                    <option value=",">Comma (,)</option>
                    <option value="\t">Tab (\t)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Header Row
                  </label>
                  <label className="flex items-center space-x-2.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasHeaderRow}
                      onChange={e => setHasHeaderRow(e.target.checked)}
                      className="rounded text-[#1473E6] focus:ring-[#1473E6]"
                    />
                    <span className="text-xs font-medium text-[#1E293B]">
                      First row contains column headers
                    </span>
                  </label>
                </div>
              </div>

              {/* Verified Sample CSVs */}
              <div className="pt-2">
                <p className="text-xs font-bold text-[#475569] mb-2">
                  Or test instantly with pre-verified CSV samples:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadPresetFile('ecommerce_csv')}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F0F7FF] text-xs font-medium text-[#1E293B] flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>Sample: ecommerce_checkout_events.csv (2,450 rows)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetFile('crm_csv')}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F0F7FF] text-xs font-medium text-[#1E293B] flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>Sample: b2b_crm_contacts_export.csv (1,120 rows)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedSource === 'excel' && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Upload Microsoft Excel (.xlsx / .xls) Workbook
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#A7F3D0] hover:border-[#10B981] bg-[#F0FDF4] hover:bg-[#DCFCE7] rounded-2xl p-8 text-center cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[#DEFBE6] text-[#0E7A36] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  Click to browse or drop your Excel Workbook (.xlsx) here
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  Supports multi-sheet workbooks with automated date formatting and numeric normalization
                </p>
              </div>

              {uploadedFile && (
                <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] shadow-2xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#DEFBE6] text-[#0E7A36] flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{uploadedFile.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Size: <strong className="text-[#0F172A]">{uploadedFile.size}</strong> &bull; Sheet:{' '}
                        <strong className="text-[#0E7A36]">{uploadedFile.sheetName || 'Sheet1'}</strong> &bull; Records:{' '}
                        <strong className="text-[#0F172A]">{uploadedFile.rows.toLocaleString()} rows</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                  >
                    Change File
                  </button>
                </div>
              )}

              {/* Sample Excel Presets */}
              <div className="pt-2">
                <p className="text-xs font-bold text-[#475569] mb-2">
                  Or load verified sample Excel workbooks:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadPresetFile('loyalty_xlsx')}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F0FDF4] text-xs font-medium text-[#1E293B] flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#0E7A36]" />
                    <span>Sample: loyalty_club_rewards_q3.xlsx (1,850 rows)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetFile('inventory_xlsx')}
                    className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F0FDF4] text-xs font-medium text-[#1E293B] flex items-center space-x-1.5 transition-all shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#0E7A36]" />
                    <span>Sample: omnichannel_store_fulfillments.xlsx (940 rows)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedSource === 'streaming' && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Real-Time Streaming Ingestion Gateway
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Streaming Protocol
                  </label>
                  <select
                    value={streamingProtocol}
                    onChange={e => setStreamingProtocol(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                  >
                    <option value="http_webhook">HTTP REST Webhook Gateway</option>
                    <option value="kafka">Apache Kafka Event Stream Topic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Kafka Topic / Pipeline Channel
                  </label>
                  <input
                    type="text"
                    value={kafkaTopic}
                    onChange={e => setKafkaTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Streaming Endpoint Box */}
              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#CBD5E1] space-y-2">
                <p className="text-xs font-bold text-[#0F172A]">Live Edge Ingestion Endpoint URL:</p>
                <div className="p-2.5 rounded-lg bg-white border border-[#CBD5E1] font-mono text-xs text-[#0A4BB5] break-all flex items-center justify-between">
                  <span>https://edge.xlr8-cdp.net/ee/v1/interact?datasetId=ds_live_stream&tenant=xlr8_prod</span>
                  <span className="text-[10px] font-bold bg-[#EBF3FC] text-[#0A4BB5] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    POST
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Send single events or batches (up to 500 events per request). Sub-50ms streaming latency SLA.
                </p>
              </div>
            </div>
          )}

          {selectedSource === 'cloud' && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Cloud Object Storage Lakehouse Ingestion
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 's3', label: 'Amazon S3' },
                  { id: 'gcs', label: 'Google Cloud Storage' },
                  { id: 'azure', label: 'Azure Blob Storage' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCloudProvider(p.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      cloudProvider === p.id
                        ? 'border-[#1473E6] bg-[#EBF3FC] text-[#0A4BB5] shadow-xs'
                        : 'border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Object Storage Bucket URI Path
                  </label>
                  <input
                    type="text"
                    value={cloudPath}
                    onChange={e => setCloudPath(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">
                      Batch Extraction Schedule
                    </label>
                    <select
                      value={cloudSchedule || ''}
                      onChange={e => setCloudSchedule(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                    >
                      <option value="" disabled>Select Extraction Schedule...</option>
                      <option value="Hourly">Hourly Incremental Sync</option>
                      <option value="Every 6 Hours">Every 6 Hours</option>
                      <option value="Nightly Batch (02:00 UTC)">Nightly Batch (02:00 UTC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">
                      IAM Role Access
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="arn:aws:iam::281377796255:role/xlr8-cdp-s3-lakehouse-reader"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#64748B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSource === 'mesh' && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Federated Zero-Copy Data Mesh Pushdown Connection
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'snowflake', label: 'Snowflake Data Cloud' },
                  { id: 'bigquery', label: 'Google BigQuery' },
                  { id: 'databricks', label: 'Databricks Unity Catalog' }
                ].map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setMeshWarehouse(w.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      meshWarehouse === w.id
                        ? 'border-[#1473E6] bg-[#EBF3FC] text-[#0A4BB5] shadow-xs'
                        : 'border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Target Data Warehouse Table / View
                </label>
                <input
                  type="text"
                  value={meshTable}
                  onChange={e => setMeshTable(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#DEFBE6] border border-[#B4F0C3] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-[#0E7A36] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pushdown Query Engine Verified (Zero ETL & Zero Storage Re-duplication)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMeshVerified(true)}
                  className="px-3 py-1 rounded-lg bg-white border border-[#A2E8B4] text-xs font-semibold text-[#0E7A36] hover:bg-[#F0FDF4]"
                >
                  Re-test Pushdown
                </button>
              </div>
            </div>
          )}

          {selectedSource === 'connector' && (
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Enterprise Managed SaaS Connector
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'salesforce', label: 'Salesforce CRM' },
                  { id: 'hubspot', label: 'HubSpot Marketing' },
                  { id: 'shopify', label: 'Shopify Plus' },
                  { id: 'marketo', label: 'Marketo Engage' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConnectorApp(c.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      connectorApp === c.id
                        ? 'border-[#1473E6] bg-[#EBF3FC] text-[#0A4BB5] shadow-xs'
                        : 'border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    CRM Entity Object
                  </label>
                  <select
                    value={connectorEntity || ''}
                    onChange={e => setConnectorEntity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
                  >
                    <option value="" disabled>Select CRM Entity Object...</option>
                    <option value="Contacts">Contacts & Leads</option>
                    <option value="Accounts">Enterprise Accounts</option>
                    <option value="Opportunities">Deals & Opportunities</option>
                    <option value="Orders">Orders & Line Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">
                    Authorization State
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#DEFBE6] border border-[#B4F0C3] flex items-center space-x-2 text-xs font-bold text-[#0E7A36]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OAuth 2.0 Authenticated & Validated</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Navigation */}
          <div className="pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#475569] transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Ingestion Method</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Next: Dataset Identity & Schemas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: DATASET IDENTITY & SCHEMA ================= */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-[#D0D7DE] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              Dataset Identity & Schema Binding
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Specify business catalog metadata and select the target Adobe XDM schema to validate incoming records.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Dataset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ecommerce Transactions 2026"
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Business Purpose & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what data this dataset contains and intended operational usage..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:border-[#1473E6] focus:ring-2 focus:ring-[#1473E6]/20 focus:outline-none"
              />
            </div>

            {/* Schema Selection */}
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Target Experience Data Model (XDM) Schema <span className="text-red-500">*</span>
              </label>
              <select
                value={schemaId || ''}
                onChange={e => setSchemaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
              >
                <option value="" disabled>Select Target XDM Schema...</option>
                {schemas.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category} Schema &bull; {s.fields.length} Fields)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Schema Inspector Preview */}
            {selectedSchema && (
              <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#CBD5E1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-[#1473E6]" />
                    Bound Schema: {selectedSchema.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE]">
                    Category: {selectedSchema.category}
                  </span>
                </div>
                <p className="text-xs text-[#475569]">{selectedSchema.description}</p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {selectedSchema.fields.slice(0, 8).map(f => (
                    <span
                      key={f.id}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white border border-[#CBD5E1] text-[#334155]"
                    >
                      {f.name} ({f.dataType})
                    </span>
                  ))}
                  {selectedSchema.fields.length > 8 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-[#E2E8F0] text-[#475569]">
                      +{selectedSchema.fields.length - 8} more fields
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Real-Time Unified Profile Stitching Toggle */}
            <div className="p-4 rounded-xl border border-[#CBD5E1] bg-white flex items-start space-x-3">
              <input
                type="checkbox"
                id="profile-toggle"
                checked={profileEnabled}
                onChange={e => setProfileEnabled(e.target.checked)}
                className="mt-1 rounded text-[#1473E6] focus:ring-[#1473E6]"
              />
              <label htmlFor="profile-toggle" className="cursor-pointer select-none">
                <span className="text-xs font-bold text-[#0F172A] block">
                  Enable for Real-Time Unified Customer Profile (Identity Stitching)
                </span>
                <span className="text-xs text-[#64748B] block mt-0.5">
                  When enabled, records in this dataset with verified identity descriptors (e.g. Email, Phone, CRM ID) will automatically merge into cross-device Customer 360 profiles.
                </span>
              </label>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#475569] transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Source Config</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] disabled:opacity-50 text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Next: Technical Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: TECHNICAL SPECIFICATIONS ================= */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-[#D0D7DE] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              Technical Ingestion Specifications
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Configure ingestion pipeline mode, serialization format, connector driver, and error tolerance thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Ingestion Mode
              </label>
              <select
                value={ingestionType || ''}
                onChange={e => setIngestionType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
              >
                <option value="" disabled>Select Ingestion Mode...</option>
                <option value="Batch">Batch Ingestion (Scheduled & Ad-hoc)</option>
                <option value="Streaming">Streaming Ingestion (Sub-second Edge)</option>
                <option value="Federated Zero-Copy">Federated Zero-Copy Mesh (Pushdown Query)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Serialization Payload Format
              </label>
              <select
                value={format || ''}
                onChange={e => setFormat(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
              >
                <option value="" disabled>Select Serialization Format...</option>
                <option value="CSV">CSV (Comma-separated values)</option>
                <option value="JSON">JSON / NDJSON (Newline Delimited)</option>
                <option value="Parquet">Apache Parquet (Columnar Compressed)</option>
                <option value="Avro">Apache Avro (Binary Schema Encoded)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Source Connector Driver Name
              </label>
              <input
                type="text"
                value={sourceConnectorName}
                onChange={e => setSourceConnectorName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Max Error Tolerance (% Malformed Records)
              </label>
              <select
                value={errorThresholdPercent || ''}
                onChange={e => setErrorThresholdPercent(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#0F172A] focus:border-[#1473E6] focus:outline-none"
              >
                <option value="" disabled>Select Error Tolerance Threshold...</option>
                <option value="0.0">Strict 0.0% (Fail batch on first error)</option>
                <option value="0.5">0.5% (Recommended enterprise tolerance)</option>
                <option value="2.0">2.0% (Permissive for raw telemetry)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1.5">
                Dead Letter Queue (DLQ)
              </label>
              <div className="p-2.5 rounded-xl bg-[#F8FAFD] border border-[#CBD5E1] text-xs font-mono text-[#0A4BB5] flex items-center justify-between">
                <span>s3://xlr8-dlq/malformed-records/</span>
                <span className="text-[10px] font-bold text-[#0E7A36] bg-[#DEFBE6] px-1.5 py-0.5 rounded">Enabled</span>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#475569] transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Identity & Schema</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-5 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Next: DULE Governance Labels</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: DULE GOVERNANCE LABELS ================= */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-[#D0D7DE] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E5EA] pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0E7A36]" />
                Adobe RT-CDP Data Usage Labeling (DULE)
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Classify data with Contractual (C), Identity (I), Sensitive (S), and Regulatory (R) labels to enforce downstream activation policies.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0A4BB5] border border-[#BFDBFE]">
                {labels.length} Labels Applied
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#475569]">Quick Presets:</span>
            <button
              type="button"
              onClick={() => setLabels(['C1', 'C4', 'I2'])}
              className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EBF3FC] hover:text-[#0A4BB5] font-semibold text-[#334155] transition-all"
            >
              Standard Profile (C1, C4, I2)
            </button>
            <button
              type="button"
              onClick={() => setLabels(['C1', 'C2', 'C4', 'C7'])}
              className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EBF3FC] hover:text-[#0A4BB5] font-semibold text-[#334155] transition-all"
            >
              Strict Contractual (C1, C2, C4, C7)
            </button>
            <button
              type="button"
              onClick={() => setLabels(['I1', 'S1', 'S2', 'R1', 'R2'])}
              className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EBF3FC] hover:text-[#0A4BB5] font-semibold text-[#334155] transition-all"
            >
              Sensitive PII & GDPR (I1, S1, S2, R1, R2)
            </button>
            <button
              type="button"
              onClick={() => setLabels([])}
              className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-red-50 hover:text-red-600 font-semibold text-[#64748B] transition-all"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-2 border-b border-[#E1E5EA] pb-2 text-xs">
            {(['All', 'Contract', 'Identity', 'Sensitive', 'Regulatory'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#1473E6] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Labels Selection Accordion */}
          <div className="space-y-4">
            {filteredCategories.map(cat => {
              const isExpanded = expandedCategories.has(cat.id);
              const catLabels = cat.labels;

              return (
                <div key={cat.id} className="border border-[#CBD5E1] rounded-xl overflow-hidden bg-white">
                  <div
                    onClick={() => toggleCategory(cat.id)}
                    className="p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer flex items-center justify-between transition-colors border-b border-[#E2E8F0]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cat.badgeColor}`}>
                        {cat.codePrefix}-Series
                      </span>
                      <span className="text-xs font-extrabold text-[#0F172A]">{cat.name}</span>
                      <span className="text-[11px] text-[#64748B]">({catLabels.length} definitions)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold text-[#0A4BB5]">
                        {catLabels.filter(l => labels.includes(l.code)).length} Selected
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {catLabels.map(labelDef => {
                        const isChecked = labels.includes(labelDef.code);

                        return (
                          <div
                            key={labelDef.code}
                            onClick={() => toggleLabel(labelDef.code)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                              isChecked
                                ? 'bg-[#F0F7FF] border-[#1473E6] shadow-2xs'
                                : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#FAFAFA]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-[#1473E6] focus:ring-[#1473E6]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-xs font-bold text-[#0A4BB5]">
                                  {labelDef.code}: {labelDef.name}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#475569]">
                                  {labelDef.defaultAction}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#475569] mt-1 leading-normal">
                                {labelDef.crispPurpose || labelDef.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Navigation */}
          <div className="pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#475569] transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Technical Specs</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(6)}
              className="px-5 py-2.5 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-xs font-bold text-white transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Next: Review & Finalize</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 6: REVIEW & DEPLOY ================= */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-[#D0D7DE] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              Review & Finalize Ingestion
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Confirm dataset parameters and activate ingestion into the XLR8 Real-Time CDP catalog.
            </p>
          </div>

          {/* Architecture Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Source & Identity */}
            <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#CBD5E1] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-xs font-bold text-[#0F172A]">Source & Pipeline</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#0A4BB5]">
                  {currentSourceDef.category}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Method:</span>
                  <span className="font-bold text-[#0F172A]">{currentSourceDef.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Dataset Name:</span>
                  <span className="font-bold text-[#0F172A]">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Ingestion Connector:</span>
                  <span className="font-semibold text-[#0F172A]">{sourceConnectorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Records / Size:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {uploadedFile?.rows.toLocaleString() || '1,250'} rows ({uploadedFile?.size || '512 KB'})
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Schema & Governance */}
            <div className="p-4 rounded-xl bg-[#F8FAFD] border border-[#CBD5E1] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-xs font-bold text-[#0F172A]">Schema & Privacy Governance</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                  {profileEnabled ? 'Profile Enabled' : 'Analytical Only'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Target XDM Schema:</span>
                  <span className="font-bold text-[#0F172A]">{selectedSchema?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Format / Ingestion:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {format} &bull; {ingestionType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Governance Labels:</span>
                  <span className="font-bold text-[#0E7A36]">
                    {labels.length > 0 ? labels.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Green Banner */}
          <div className="p-4 rounded-xl bg-[#DEFBE6] border border-[#B4F0C3] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-[#0E7A36]" />
              <div>
                <p className="text-xs font-bold text-[#0E7A36]">
                  Validation Successful: Schema & Pipeline Configuration Verified
                </p>
                <p className="text-[11px] text-[#166534]">
                  All column mappings, format parsers, and DULE governance policies are ready for execution.
                </p>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 border-t border-[#E1E5EA] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#475569] transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: DULE Governance</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-3 rounded-xl bg-[#1473E6] hover:bg-[#0D66D0] text-sm font-extrabold text-white transition-all shadow-md flex items-center space-x-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Bring In & Activate Dataset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
