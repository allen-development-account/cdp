import React, { useState, useRef } from 'react';
import { useCDP } from '../../context/CDPContext';
import { Dataset, PrivacyLabelCategoryType } from '../../types/cdp';
import { ALL_PRIVACY_LABELS, STANDARD_PRIVACY_LABEL_CATEGORIES, getCrispPurpose } from '../../data/privacyLabelsData';
import {
  X,
  Database,
  Plus,
  Shield,
  ShieldCheck,
  Radio,
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
  Cpu,
  Share2,
  FileCheck,
  RefreshCw,
  Table,
  CheckSquare
} from 'lucide-react';

interface BringInDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated?: (newDataset: Dataset) => void;
}

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
  icon: React.ElementType;
  defaultFormat: 'CSV' | 'JSON' | 'Parquet' | 'Avro';
  defaultIngestionType: 'Streaming' | 'Batch' | 'Federated Zero-Copy';
  defaultConnector: string;
  defaultSchemaId: string;
  defaultName: string;
  defaultDescription: string;
}

const SOURCE_OPTIONS: SourceMethodDefinition[] = [
  {
    id: 'csv',
    title: 'CSV Delimited File',
    category: 'Flat File Import',
    description: 'Upload structured CSV or TSV files with auto-detected delimiters, headers, and column type inferencing.',
    badge: 'Fast File Drop',
    icon: FileText,
    defaultFormat: 'CSV',
    defaultIngestionType: 'Batch',
    defaultConnector: 'XLR8 CSV Delimited File Ingestion Engine',
    defaultSchemaId: 'xdm_experience_event',
    defaultName: 'Delimited Customer Transactions 2026',
    defaultDescription: 'Delimited CSV dataset imported for profile enrichment and behavioral event ingestion.'
  },
  {
    id: 'excel',
    title: 'Microsoft Excel File',
    category: 'Spreadsheet Import',
    description: 'Import .xlsx or .xls workbooks with multi-sheet tab selection, header mapping, and automated formula resolution.',
    badge: 'Workbook Sync',
    icon: FileSpreadsheet,
    defaultFormat: 'CSV',
    defaultIngestionType: 'Batch',
    defaultConnector: 'Microsoft Excel (.xlsx) Ingestion Reader',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'Regional Loyalty Members Workbook',
    defaultDescription: 'Microsoft Excel customer records synced from regional operations and loyalty programs.'
  },
  {
    id: 'streaming',
    title: 'Real-Time Streaming Endpoint',
    category: 'Sub-Second Stream',
    description: 'Publish live events directly via authenticated HTTP REST API Webhook or Kafka topic into edge network.',
    badge: 'Sub-Second Edge',
    icon: Zap,
    defaultFormat: 'JSON',
    defaultIngestionType: 'Streaming',
    defaultConnector: 'HTTP Webhook Real-Time Ingestion Gateway',
    defaultSchemaId: 'xdm_experience_event',
    defaultName: 'Digital Interaction Real-Time Stream',
    defaultDescription: 'High-throughput real-time digital events streamed directly from XLR8 Edge Network Webhooks.'
  },
  {
    id: 'cloud',
    title: 'Cloud Storage Batch Drop',
    category: 'Object Storage Sync',
    description: 'Scheduled recurring ingestion from Amazon S3, Google Cloud Storage (GCS), or Azure Blob Storage.',
    badge: 'Automated Batch',
    icon: Cloud,
    defaultFormat: 'Parquet',
    defaultIngestionType: 'Batch',
    defaultConnector: 'AWS S3 Cloud Storage Bucket Connector',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'S3 Nightly Master Ingestion',
    defaultDescription: 'Scheduled batch extraction from cloud object storage data lake buckets.'
  },
  {
    id: 'mesh',
    title: 'Federated Zero-Copy Mesh',
    category: 'Enterprise Data Mesh',
    description: 'Federated live pushdown query execution across Snowflake, BigQuery, or Databricks without data movement.',
    badge: 'Zero-Copy Query',
    icon: Layers,
    defaultFormat: 'Parquet',
    defaultIngestionType: 'Federated Zero-Copy',
    defaultConnector: 'Snowflake Zero-Copy Federated Data Mesh',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'Snowflake Customer 360 Zero-Copy View',
    defaultDescription: 'Pushdown federated queries against cloud data warehouse tables with zero pipeline replication.'
  },
  {
    id: 'connector',
    title: 'Enterprise CRM & App Connector',
    category: 'Managed SaaS Connector',
    description: 'Direct pre-built synchronization with Salesforce CRM, HubSpot, Shopify Plus, or Marketo Engage.',
    badge: 'Managed SaaS',
    icon: Share2,
    defaultFormat: 'JSON',
    defaultIngestionType: 'Batch',
    defaultConnector: 'Salesforce Enterprise CRM Connector',
    defaultSchemaId: 'xdm_individual_profile',
    defaultName: 'Salesforce CRM Contacts Master',
    defaultDescription: 'Managed SaaS connector synchronizing authenticated CRM customer accounts and contact histories.'
  }
];

export const BringInDatasetModal: React.FC<BringInDatasetModalProps> = ({
  isOpen,
  onClose,
  onDatasetCreated
}) => {
  const { schemas, createDataset } = useCDP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive Wizard State (1: Source Method -> 2: Dataset Identity -> 3: Technical Specs -> 4: DULE Governance)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Ingestion Source Selection
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
  const [streamingProtocol, setStreamingProtocol] = useState<'http_webhook' | 'kafka'>('http_webhook');
  const [cloudProvider, setCloudProvider] = useState<'s3' | 'gcs' | 'azure'>('s3');
  const [cloudPath, setCloudPath] = useState('s3://enterprise-cdp-lakehouse/raw/incoming_batches/');
  const [meshWarehouse, setMeshWarehouse] = useState<'snowflake' | 'bigquery' | 'databricks'>('snowflake');
  const [meshTable, setMeshTable] = useState('ANALYTICS_PROD.CUSTOMER_DATA.V_UNIFIED_PROFILES');
  const [connectorApp, setConnectorApp] = useState<'salesforce' | 'hubspot' | 'shopify' | 'marketo'>('salesforce');

  // Step 2: Dataset Details & Technical Config
  const [name, setName] = useState('Ecommerce Customer Orders 2026');
  const [description, setDescription] = useState(
    'Delimited CSV dataset imported for profile enrichment and behavioral event ingestion.'
  );
  const [ingestionType, setIngestionType] = useState<'Streaming' | 'Batch' | 'Federated Zero-Copy'>('Batch');
  const [format, setFormat] = useState<'JSON' | 'Parquet' | 'CSV' | 'Avro'>('CSV');
  const [schemaId, setSchemaId] = useState(schemas[0]?.id || 'xdm_experience_event');
  const [sourceConnectorName, setSourceConnectorName] = useState('XLR8 CSV Delimited File Ingestion Engine');
  const [profileEnabled, setProfileEnabled] = useState(true);

  // Step 3: DULE Governance Labels
  const [labels, setLabels] = useState<string[]>(['C1', 'C4', 'I2']);
  const [categoryFilter, setCategoryFilter] = useState<'All' | PrivacyLabelCategoryType>('All');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory'])
  );

  if (!isOpen) return null;

  const currentSourceDef = SOURCE_OPTIONS.find(s => s.id === selectedSource) || SOURCE_OPTIONS[0];
  const selectedSchema = schemas.find(s => s.id === schemaId);

  // Switch source in Step 1 and apply smart defaults
  const handleSelectSource = (sourceId: IngestionSourceOption) => {
    setSelectedSource(sourceId);
    const def = SOURCE_OPTIONS.find(s => s.id === sourceId);
    if (!def) return;

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
  };

  // Handle local file drop/upload simulation
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

  // Preset file samples for quick evaluation
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

  // Toggle governance label in step 3
  const toggleLabel = (code: string) => {
    setLabels(prev => (prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]));
  };

  const applyPreset = (presetCodes: string[]) => {
    setLabels(presetCodes);
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const expandAll = () => setExpandedCategories(new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory']));
  const collapseAll = () => setExpandedCategories(new Set());

  // Final submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rowCount = uploadedFile?.rows || 1000;
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

    if (onDatasetCreated) {
      onDatasetCreated(newDataset);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-xl border border-[#D0D7DE] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh]">
        
        {/* Header Strip with Unified Blue Gradient */}
        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Bring in a New Dataset to XLR8
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shadow-2xs">
                  Guided Ingestion Wizard
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {step === 1 && 'Step 1 of 4: Choose how you want to bring in your data (CSV, Excel, Streaming, Cloud, or Mesh).'}
                {step === 2 && 'Step 2 of 4: Provide dataset name and business purpose description.'}
                {step === 3 && 'Step 3 of 4: Configure technical specifications, protocol mode, payload format, and target XDM schema.'}
                {step === 4 && 'Step 4 of 4: Review and apply Adobe Real-Time CDP governance (DULE) usage labels.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 text-white hover:bg-white/25 border border-white/25 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Multi-Step Breadcrumb Stepper */}
        <div className="px-6 py-3 bg-[#FFFFFF] border-b border-[#E1E5EA] flex items-center justify-between text-xs overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center space-x-2 font-semibold px-2.5 py-1 rounded-md transition-all ${
                step === 1
                  ? 'bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]'
                  : 'text-[#596780] hover:text-[#1E2229] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 1
                    ? 'bg-[#1473E6] text-white'
                    : step > 1
                    ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                    : 'bg-[#E1E5EA] text-[#596780]'
                }`}
              >
                {step > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
              </span>
              <span>1. Ingestion Source</span>
            </button>

            <span className="text-[#C5CCD6]">/</span>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center space-x-2 font-semibold px-2.5 py-1 rounded-md transition-all ${
                step === 2
                  ? 'bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]'
                  : 'text-[#596780] hover:text-[#1E2229] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 2
                    ? 'bg-[#1473E6] text-white'
                    : step > 2
                    ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                    : 'bg-[#E1E5EA] text-[#596780]'
                }`}
              >
                {step > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
              </span>
              <span>2. Dataset Identity</span>
            </button>

            <span className="text-[#C5CCD6]">/</span>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (name.trim()) setStep(3);
              }}
              className={`flex items-center space-x-2 font-semibold px-2.5 py-1 rounded-md transition-all ${
                step === 3
                  ? 'bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]'
                  : 'text-[#596780] hover:text-[#1E2229] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 3
                    ? 'bg-[#1473E6] text-white'
                    : step > 3
                    ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#A2E8B4]'
                    : 'bg-[#E1E5EA] text-[#596780]'
                }`}
              >
                {step > 3 ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
              </span>
              <span>3. Technical Specs</span>
            </button>

            <span className="text-[#C5CCD6]">/</span>

            {/* Step 4 Pill */}
            <button
              type="button"
              onClick={() => {
                if (name.trim()) setStep(4);
              }}
              className={`flex items-center space-x-2 font-semibold px-2.5 py-1 rounded-md transition-all ${
                step === 4
                  ? 'bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]'
                  : 'text-[#596780] hover:text-[#1E2229] hover:bg-[#F8FAFC]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 4 ? 'bg-[#1473E6] text-white' : 'bg-[#E1E5EA] text-[#596780]'
                }`}
              >
                4
              </span>
              <span>4. DULE Governance Labels ({labels.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#596780]">
            <span className="font-semibold text-[#1473E6]">Method:</span>
            <span className="font-bold text-[#1E2229] bg-[#F1F4F9] px-2 py-0.5 rounded border border-[#E1E5EA]">
              {currentSourceDef.title}
            </span>
          </div>
        </div>

        {/* Form Body with Multi-Step Views */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* ================= STEP 1: CHOOSE INGESTION SOURCE ================= */}
          {step === 1 && (
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[62vh] text-xs bg-[#FAFBFD]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-[#1E2229] flex items-center gap-2">
                    <span>How would you like to bring in your data?</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]">
                      Select Ingestion Method
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-[#596780]">
                  Choose how your data will enter XLR8 Real-Time CDP. Once defined, you will configure naming, schemas, and technical payload details.
                </p>
              </div>

              {/* 6 Ingestion Source Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {SOURCE_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const isSelected = selectedSource === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectSource(option.id)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#1473E6] bg-[#FFFFFF] shadow-sm ring-2 ring-[#1473E6]/20'
                          : 'border-[#E1E5EA] bg-[#FFFFFF] hover:border-[#B3D4FA] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#1473E6] text-white shadow-2xs'
                                : 'bg-[#F1F4F9] text-[#1473E6]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]'
                                : 'bg-[#F1F4F9] text-[#596780] border border-[#E1E5EA]'
                            }`}
                          >
                            {option.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#1E2229]">{option.title}</h4>
                        <span className="text-[10px] font-semibold text-[#8C9BAE] uppercase tracking-wider block mb-1">
                          {option.category}
                        </span>
                        <p className="text-[11px] text-[#596780] leading-relaxed">
                          {option.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#F1F4F9] flex items-center justify-between text-[10px]">
                        <span className="text-[#8C9BAE] font-medium">Format: {option.defaultFormat}</span>
                        <div className="flex items-center gap-1 font-bold text-[#1473E6]">
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-[#0E7A36] bg-[#DEFBE6] px-2 py-0.5 rounded border border-[#A2E8B4]">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="text-[#596780] hover:text-[#1473E6]">Click to Select</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contextual Interactive Configuration Panel for Selected Source */}
              <div className="bg-[#FFFFFF] rounded-xl border border-[#C5DCFA] shadow-xs p-4 sm:p-5">
                <div className="flex items-center space-x-2.5 mb-3">
                  <div className="w-7 h-7 rounded-md bg-[#1473E6] flex items-center justify-center text-white shadow-2xs">
                    <currentSourceDef.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E2229]">
                      Source Configuration: {currentSourceDef.title}
                    </h4>
                    <p className="text-[11px] text-[#596780]">
                      Define file drops, connection endpoints, or test using sample dataset templates.
                    </p>
                  </div>
                </div>

                {/* Option 1: CSV File Dropper & Samples */}
                {selectedSource === 'csv' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv,.tsv,.txt"
                      className="hidden"
                    />
                    
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#B3D4FA] hover:border-[#1473E6] bg-[#F8FAFD] hover:bg-[#F2F7FE] rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#EBF3FC] group-hover:bg-[#1473E6] text-[#1473E6] group-hover:text-white flex items-center justify-center transition-all mb-2 shadow-2xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#1E2229]">
                        Click to browse or drop your CSV / TSV file here
                      </span>
                      <span className="text-[11px] text-[#596780] mt-0.5">
                        Supports UTF-8 comma-separated or tab-delimited records (up to 200 MB per file)
                      </span>
                    </div>

                    {uploadedFile && (
                      <div className="bg-[#F0F7FF] border border-[#B3D4FA] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded bg-[#1473E6] flex items-center justify-center text-white shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#0A2540]">{uploadedFile.name}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-[#183B64] mt-0.5">
                              <span>Size: <strong>{uploadedFile.size}</strong></span>
                              <span>•</span>
                              <span>Estimated Records: <strong>{uploadedFile.rows.toLocaleString()} rows</strong></span>
                              <span>•</span>
                              <span className="text-[#0E7A36] font-bold">Ready for schema mapping</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold px-3 py-1 bg-white text-[#1473E6] border border-[#B3D4FA] rounded hover:bg-[#F2F7FE] transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
                        >
                          Change File
                        </button>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-[#1E2229] block mb-1.5">
                        Or test instantly with pre-verified CSV samples:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadPresetFile('ecommerce_csv')}
                          className="px-2.5 py-1 bg-white hover:bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA] rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Sample: ecommerce_checkout_events.csv (2,450 rows)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => loadPresetFile('crm_csv')}
                          className="px-2.5 py-1 bg-white hover:bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA] rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Sample: b2b_crm_contacts_export.csv (1,120 rows)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 2: Excel File Dropper & Samples */}
                {selectedSource === 'excel' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx,.xls"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#B3D4FA] hover:border-[#1473E6] bg-[#F8FAFD] hover:bg-[#F2F7FE] rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#EBF3FC] group-hover:bg-[#1473E6] text-[#1473E6] group-hover:text-white flex items-center justify-center transition-all mb-2 shadow-2xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#1E2229]">
                        Click to browse or drop your Excel Workbook (.xlsx / .xls)
                      </span>
                      <span className="text-[11px] text-[#596780] mt-0.5">
                        Automated multi-worksheet detection, header row discovery, and cell value sanitation
                      </span>
                    </div>

                    {uploadedFile && (
                      <div className="bg-[#F0F7FF] border border-[#B3D4FA] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded bg-[#107C41] flex items-center justify-center text-white shrink-0">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-[#0A2540]">{uploadedFile.name}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-[#183B64] mt-0.5">
                              <span>Active Sheet: <strong>{uploadedFile.sheetName || 'Sheet1'}</strong></span>
                              <span>•</span>
                              <span>Size: <strong>{uploadedFile.size}</strong></span>
                              <span>•</span>
                              <span>Rows: <strong>{uploadedFile.rows.toLocaleString()} rows</strong></span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold px-3 py-1 bg-white text-[#1473E6] border border-[#B3D4FA] rounded hover:bg-[#F2F7FE] transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
                        >
                          Change File
                        </button>
                      </div>
                    )}

                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-[#1E2229] block mb-1.5">
                        Or test instantly with pre-verified Excel samples:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadPresetFile('loyalty_xlsx')}
                          className="px-2.5 py-1 bg-white hover:bg-[#EBF3FC] text-[#107C41] border border-[#C5DCFA] rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Sample: loyalty_club_rewards_q3.xlsx (1,850 rows)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => loadPresetFile('inventory_xlsx')}
                          className="px-2.5 py-1 bg-white hover:bg-[#EBF3FC] text-[#107C41] border border-[#C5DCFA] rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>Sample: omnichannel_store_fulfillments.xlsx (940 rows)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 3: Streaming API */}
                {selectedSource === 'streaming' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Streaming Ingestion Protocol
                        </label>
                        <select
                          value={streamingProtocol}
                          onChange={e => setStreamingProtocol(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                        >
                          <option value="http_webhook">HTTP REST Webhook API (JSON POST)</option>
                          <option value="kafka">Apache Kafka Event Stream Topic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Assigned Ingestion Endpoint
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={
                            streamingProtocol === 'http_webhook'
                              ? 'https://edge.xlr8-cdp.internal/v1/events/stream'
                              : 'kafka://cluster.xlr8-cdp.internal:9092/customer.events'
                          }
                          className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#D0D7DE] rounded-md text-xs font-mono text-[#596780]"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] border border-[#E1E5EA] rounded-lg text-[11px] text-[#596780] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#1473E6]" />
                        <span>Sub-second event ingestion with sub-35ms pipeline latency into profile graph.</span>
                      </span>
                      <span className="font-mono font-bold text-[#0E7A36] bg-[#DEFBE6] px-2 py-0.5 rounded border border-[#A2E8B4]">
                        200 OK Edge Active
                      </span>
                    </div>
                  </div>
                )}

                {/* Option 4: Cloud Storage */}
                {selectedSource === 'cloud' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Cloud Storage Provider
                        </label>
                        <select
                          value={cloudProvider}
                          onChange={e => setCloudProvider(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                        >
                          <option value="s3">Amazon S3 (AWS)</option>
                          <option value="gcs">Google Cloud Storage (GCP)</option>
                          <option value="azure">Azure Blob Storage (Microsoft)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Target Bucket URI / Storage Path
                        </label>
                        <input
                          type="text"
                          value={cloudPath}
                          onChange={e => setCloudPath(e.target.value)}
                          placeholder="e.g. s3://my-cdp-lakehouse/batches/"
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs font-mono text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 5: Zero-Copy Mesh */}
                {selectedSource === 'mesh' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Data Warehouse Engine
                        </label>
                        <select
                          value={meshWarehouse}
                          onChange={e => setMeshWarehouse(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                        >
                          <option value="snowflake">Snowflake Data Cloud</option>
                          <option value="bigquery">Google BigQuery</option>
                          <option value="databricks">Databricks Unity Catalog</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Target Table or Analytical View
                        </label>
                        <input
                          type="text"
                          value={meshTable}
                          onChange={e => setMeshTable(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs font-mono text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 6: Enterprise Connector */}
                {selectedSource === 'connector' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#1E2229] mb-1">
                          SaaS Application
                        </label>
                        <select
                          value={connectorApp}
                          onChange={e => setConnectorApp(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                        >
                          <option value="salesforce">Salesforce CRM (Contacts & Accounts)</option>
                          <option value="hubspot">HubSpot Enterprise (Marketing Contacts)</option>
                          <option value="shopify">Shopify Plus (Orders & Customers)</option>
                          <option value="marketo">Marketo Engage (Lead Activities)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#1E2229] mb-1">
                          Sync Frequency
                        </label>
                        <select className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]">
                          <option>Every 15 Minutes (Near Real-Time)</option>
                          <option>Hourly Incremental Sync</option>
                          <option>Daily at Midnight (UTC)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: DATASET IDENTITY & DESCRIPTION ================= */}
          {step === 2 && (
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[62vh] text-xs bg-[#FFFFFF]">
              {/* Selected Source Method Banner */}
              <div className="p-3 bg-[#F0F7FF] rounded-lg border border-[#B3D4FA] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#1473E6] flex items-center justify-center text-white shrink-0">
                    <currentSourceDef.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-[#0A2540]">
                        Ingestion Method: {currentSourceDef.title}
                      </span>
                      {uploadedFile && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-white text-[#1473E6] border border-[#B3D4FA]">
                          {uploadedFile.name} ({uploadedFile.rows.toLocaleString()} records)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#183B64]">
                      Define the dataset name and business purpose before configuring technical parameters.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#1473E6] hover:underline shrink-0"
                >
                  ← Change Method
                </button>
              </div>

              {/* Dataset Name */}
              <div>
                <label className="block font-bold text-[#1E2229] mb-1">
                  Dataset Name <span className="text-[#D7373F]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Shopify Checkout Orders & Conversions"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6]"
                />
                <span className="text-[11px] text-[#596780] mt-1 block">
                  A unique, human-readable name identifying this dataset in the catalog.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#1E2229] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the operational and business purpose of this dataset..."
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6]"
                />
                <span className="text-[11px] text-[#596780] mt-1 block">
                  Document the business owner, upstream systems, and activation goals.
                </span>
              </div>

              {/* Informational Card previewing Step 3 */}
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1E2229] flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#1473E6]" />
                    Upcoming: Step 3 Technical Configuration Preview
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EBF3FC] text-[#1473E6]">
                    Step 3
                  </span>
                </div>
                <p className="text-[11px] text-[#596780]">
                  In the next step, you will specify the Ingestion Protocol Mode, Payload Format, Target XDM Schema, Connector Identifier, and Real-Time Profile routing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded bg-white border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#596780] block">Default Protocol:</span>
                    <span className="font-semibold text-xs text-[#1E2229]">{ingestionType}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#596780] block">Default Format:</span>
                    <span className="font-semibold text-xs text-[#1E2229]">{format}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#596780] block">Selected Schema:</span>
                    <span className="font-semibold text-xs text-[#1E2229] truncate block">
                      {selectedSchema?.name || 'XDM ExperienceEvent'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: TECHNICAL SPECIFICATIONS & INGESTION DETAILS ================= */}
          {step === 3 && (
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[62vh] text-xs bg-[#FFFFFF]">
              {/* Contextual Banner */}
              <div className="p-3 bg-[#F0F7FF] rounded-lg border border-[#B3D4FA] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#1473E6] flex items-center justify-center text-white shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-[#0A2540]">
                        Dataset: {name || 'Untitled Dataset'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#1473E6] border border-[#B3D4FA]">
                        Source: {currentSourceDef.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#183B64]">
                      Configure the protocol mode, payload serialization, target XDM canonical schema, and identity graph routing.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-[#1473E6] hover:underline shrink-0"
                >
                  ← Edit Name
                </button>
              </div>

              {/* Technical Specifications Grid (Requested in user screenshot) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-[#1E2229] mb-1">
                    Ingestion Protocol Mode
                  </label>
                  <select
                    value={ingestionType}
                    onChange={e => setIngestionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                  >
                    <option value="Batch">Batch Ingestion (Scheduled / File Drop)</option>
                    <option value="Streaming">Real-Time Streaming (Sub-Second API)</option>
                    <option value="Federated Zero-Copy">Federated Zero-Copy Mesh (Pushdown)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E2229] mb-1">
                    Payload Format
                  </label>
                  <select
                    value={format}
                    onChange={e => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                  >
                    <option value="CSV">Delimited CSV / TSV</option>
                    <option value="JSON">JSON (Standard XDM)</option>
                    <option value="Parquet">Apache Parquet (Columnar)</option>
                    <option value="Avro">Apache Avro (Binary)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1E2229] mb-1">
                    Target XDM Schema
                  </label>
                  <select
                    value={schemaId}
                    onChange={e => setSchemaId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                  >
                    {schemas.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.fields.length} fields)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source Connector Identifier */}
              <div>
                <label className="block font-bold text-[#1E2229] mb-1">
                  Source Connector Identifier
                </label>
                <input
                  type="text"
                  value={sourceConnectorName}
                  onChange={e => setSourceConnectorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>

              {/* Real-Time Customer Profile Enablement Toggle */}
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E1E5EA] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#1E2229]">Enable for Real-Time Customer Profile</h4>
                  <p className="text-[11px] text-[#596780] mt-0.5">
                    Stream records into the XLR8 Identity Graph & unified 360 profile engine for audience activation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileEnabled(!profileEnabled)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors relative ${
                    profileEnabled ? 'bg-[#1473E6]' : 'bg-[#C5CCD6]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      profileEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Schema Details & Governance Quick Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#FAFBFD] border border-[#E1E5EA]">
                  <span className="text-[11px] font-bold text-[#596780] block mb-1">Target Schema Details</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#596780]">Schema Class:</span>
                      <span className="font-bold text-[#1E2229]">{selectedSchema?.class || 'XDM ExperienceEvent'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#596780]">Total Fields:</span>
                      <span className="font-mono font-bold text-[#1473E6]">{selectedSchema?.fields.length || 0} fields</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#EBF3FC] border border-[#C5DCFA]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0D66D0] flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      DULE Labels Configured: {labels.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-[11px] font-bold text-[#1473E6] hover:underline"
                    >
                      Step 4 →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {labels.map(code => (
                      <span
                        key={code}
                        className="px-2 py-0.5 rounded bg-white font-mono font-bold text-[10px] text-[#1473E6] border border-[#C5DCFA]"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: DULE GOVERNANCE LABELS ================= */}
          {step === 4 && (
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[62vh] text-xs bg-[#FFFFFF]">
              
              {/* Presets Bar */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E1E5EA]">
                <span className="font-bold text-[#1E2229] block mb-2">
                  ⚡ Choose a Standard Governance Preset:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(['C1', 'C4', 'I2'])}
                    className="px-2.5 py-1 bg-white hover:bg-[#EEF2FF] border border-[#D0D7DE] rounded text-[11px] font-medium text-[#4F46E5] shadow-2xs transition-colors"
                  >
                    Web Clickstream (C1, C4, I2)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(['I1', 'C2', 'S4'])}
                    className="px-2.5 py-1 bg-white hover:bg-[#EBF3FC] border border-[#D0D7DE] rounded text-[11px] font-medium text-[#0D66D0] shadow-2xs transition-colors"
                  >
                    CRM Master (I1, C2, S4)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(['C4', 'C5', 'I2', 'S1'])}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFF1F2] border border-[#D0D7DE] rounded text-[11px] font-medium text-[#E11D48] shadow-2xs transition-colors"
                  >
                    Mobile Telemetry (C4, C5, I2, S1)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(['I1', 'C1', 'C4', 'S3', 'S4'])}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFF1F2] border border-[#D0D7DE] rounded text-[11px] font-medium text-[#D7373F] shadow-2xs transition-colors"
                  >
                    Strict Sensitive / HIPAA / PCI
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset([])}
                    className="px-2.5 py-1 text-[#8C9BAE] hover:text-[#D7373F] text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Category Filter Pills & Expand All */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('All')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      categoryFilter === 'All' ? 'bg-[#1473E6] text-white' : 'bg-[#F1F4F9] text-[#596780]'
                    }`}
                  >
                    All ({ALL_PRIVACY_LABELS.length})
                  </button>
                  {STANDARD_PRIVACY_LABEL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        categoryFilter === cat.id ? 'bg-[#1473E6] text-white' : 'bg-[#F1F4F9] text-[#596780]'
                      }`}
                    >
                      {cat.codePrefix}-Series ({cat.id})
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#2C3442]"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#596780]"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Category Accordions */}
              <div className="space-y-3">
                {STANDARD_PRIVACY_LABEL_CATEGORIES
                  .filter(cat => categoryFilter === 'All' || cat.id === categoryFilter)
                  .map(cat => {
                    const isExpanded = expandedCategories.has(cat.id);
                    const selectedCount = cat.labels.filter(l => labels.includes(l.code)).length;

                    return (
                      <div
                        key={cat.id}
                        className={`rounded-xl border transition-all overflow-hidden shadow-2xs bg-white ${
                          isExpanded ? 'border-[#1473E6]/60' : 'border-[#E1E5EA]'
                        }`}
                      >
                        {/* Header */}
                        <div
                          onClick={() => toggleCategory(cat.id)}
                          className="p-3 cursor-pointer flex items-center justify-between select-none hover:bg-[#F8FAFC] transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <button
                              type="button"
                              className={`p-1 rounded border transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 bg-[#EBF3FC] text-[#1473E6]' : 'text-[#596780]'
                              }`}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs text-[#1E2229]">{cat.name}</span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#F1F4F9] text-[#596780] border">
                              {cat.codePrefix}-Series
                            </span>
                            {selectedCount > 0 && (
                              <span className="text-[10px] font-bold text-[#1473E6] bg-[#EBF3FC] px-1.5 py-0.2 rounded-full">
                                {selectedCount} selected
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#1473E6]">
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </span>
                        </div>

                        {/* Dropdown Body */}
                        {isExpanded && (
                          <div className="border-t border-[#E1E5EA] bg-[#FAFBFD] p-3">
                            <div className="bg-white rounded-lg border border-[#E1E5EA] divide-y divide-[#E1E5EA] shadow-2xs overflow-hidden">
                              <div className="grid grid-cols-12 gap-2 px-3 py-1.5 bg-[#F1F4F9]/80 text-[10px] font-bold text-[#596780] uppercase tracking-wider items-center">
                                <div className="col-span-1 text-center">Select</div>
                                <div className="col-span-2 sm:col-span-1">Label</div>
                                <div className="col-span-4 sm:col-span-3">Label Name</div>
                                <div className="col-span-5 sm:col-span-7">Purpose (Crisp Definitions)</div>
                              </div>

                              {cat.labels.map(lbl => {
                                const isChecked = labels.includes(lbl.code);
                                const crispText = lbl.crispPurpose || getCrispPurpose(lbl.code);

                                return (
                                  <div
                                    key={lbl.code}
                                    onClick={() => toggleLabel(lbl.code)}
                                    className={`grid grid-cols-12 gap-2 px-3 py-2 items-center cursor-pointer transition-colors text-xs select-none ${
                                      isChecked ? 'bg-[#F0F7FF]/80 hover:bg-[#EBF4FE]' : 'hover:bg-[#F8FAFC]'
                                    }`}
                                  >
                                    <div className="col-span-1 flex items-center justify-center">
                                      <div
                                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                          isChecked ? 'bg-[#1473E6] border-[#1473E6] text-white' : 'border-[#CBD5E1] bg-white'
                                        }`}
                                      >
                                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                      </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 font-mono font-bold text-xs text-[#1473E6]">
                                      <span className="px-1.5 py-0.5 rounded bg-[#EBF3FC] border border-[#C5DCFA]">
                                        {lbl.code}
                                      </span>
                                    </div>
                                    <div className="col-span-4 sm:col-span-3 font-bold text-[#1E2229] leading-snug">
                                      {lbl.name}
                                    </div>
                                    <div className="col-span-5 sm:col-span-7 text-[#2C3442] font-medium leading-relaxed">
                                      {crispText}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ================= MODAL FOOTER CONTROLS ================= */}
          <div className="p-4 sm:px-6 bg-[#F8FAFC] border-t border-[#E1E5EA] flex items-center justify-between">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#596780] hover:text-[#1E2229] border border-[#D0D7DE] rounded-lg bg-white shadow-2xs"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-[#596780] hover:text-[#1E2229] border border-[#D0D7DE] rounded-lg bg-white shadow-2xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {step === 2 && 'Back to Ingestion Sources'}
                  {step === 3 && 'Back to Dataset Identity'}
                  {step === 4 && 'Back to Technical Specifications'}
                </span>
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1473E6] hover:bg-[#0D66D0] rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Next: Dataset Identity & Description</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!name.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#C5CCD6] rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Next: Technical Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : step === 3 ? (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1473E6] hover:bg-[#0D66D0] rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Next: DULE Governance Labels ({labels.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#0E7A36] hover:bg-[#0A5A27] rounded-lg shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Bring In Dataset & Complete Setup</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
