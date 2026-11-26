import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { SAMPLE_PRESET_PAYLOADS } from '../../data/seedData';
import { TerminalLog } from '../common/TerminalLog';
import { GuidedIngestionSetupWizard } from './GuidedIngestionSetupWizard';
import { LiveEdgeStreamConsole } from './LiveEdgeStreamConsole';
import { ExcelCsvFileIngestionSection } from './ExcelCsvFileIngestionSection';
import { WebSdkSetupPanel } from './WebSdkSetupPanel';
import { CloudWarehouseStepPanel } from './CloudWarehouseStepPanel';
import { StreamingEndpointStepPanel } from './StreamingEndpointStepPanel';
import {
  Radio,
  Send,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Database,
  Globe,
  Smartphone,
  Layers,
  Cloud,
  Store,
  RefreshCw,
  GitMerge,
  Cpu,
  Plus,
  ChevronDown,
  ChevronUp,
  Upload,
  FileSpreadsheet,
  Zap,
  Server,
  Wrench,
  ShoppingBag,
  Webhook
} from 'lucide-react';

export type IngestionSourceChoice =
  | 'excel_csv'
  | 'web_sdk'
  | 'rest_api'
  | 'batch_file'
  | 'cloud_warehouse'
  | 'message_bus'
  | 'kafka_stream'
  | 'pos_terminal'
  | 'cloud_storage'
  | 'mobile_sdk'
  | 'snowflake_sync'
  | 'salesforce_webhook';

interface CompletionSummary {
  sourceName: string;
  channel: string;
  schemaId: string;
  profileId?: string;
  latencyMs?: number;
  databricksSynced?: boolean;
  message: string;
  timestamp: string;
}

const SOURCE_LABELS: Record<IngestionSourceChoice, string> = {
  excel_csv: 'Upload Excel or CSV File',
  web_sdk: 'Client-Side Web SDK',
  rest_api: 'Streaming REST API and Webhooks',
  batch_file: 'Batch File Ingestion (CSV / JSON)',
  cloud_warehouse: 'Cloud Data Warehouses (Databricks)',
  message_bus: 'Enterprise Message Bus',
  kafka_stream: 'Apache Kafka / Confluent Stream',
  pos_terminal: 'Retail POS Terminal Stream',
  cloud_storage: 'Cloud Storage Bucket (AWS S3 / GCS)',
  mobile_sdk: 'Mobile SDK (iOS & Android)',
  snowflake_sync: 'Snowflake Data Cloud Sync',
  salesforce_webhook: 'Salesforce CRM Webhook'
};

interface MoreSourceTileConfig {
  id: IngestionSourceChoice;
  title: string;
  badge: string;
  description: string;
  footerMetric: string;
  Icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
}

const MORE_SOURCE_TILES: MoreSourceTileConfig[] = [
  {
    id: 'rest_api',
    title: 'Streaming REST API and Webhooks',
    badge: 'HTTPS POST',
    description: 'Direct backend JSON endpoint for payment webhooks and microservices.',
    footerMetric: '< 3.5ms Latency',
    Icon: Radio
  },
  {
    id: 'batch_file',
    title: 'Batch File Ingestion (CSV / JSON)',
    badge: 'Batch Parser',
    description: 'Drag-and-drop CSV or JSON bulk customer exports into canonical XDM.',
    footerMetric: 'CSV & JSON',
    Icon: Upload
  },
  {
    id: 'cloud_warehouse',
    title: 'Cloud Data Warehouses',
    badge: 'Databricks Priority',
    description: 'Databricks Unity Catalog & Delta SQL primary connector, plus Snowflake & BigQuery.',
    footerMetric: 'Databricks Lakehouse',
    Icon: Database,
    featured: true
  },
  {
    id: 'message_bus',
    title: 'Enterprise Message Bus',
    badge: 'Kafka / Flink',
    description: 'Partitioned enterprise event bus consumer pipelines with exactly-once guarantees.',
    footerMetric: '< 1.8ms Latency',
    Icon: Server
  },
  {
    id: 'kafka_stream',
    title: 'Apache Kafka / Confluent Stream',
    badge: 'Kafka Stream',
    description: 'Consume real-time Confluent Cloud & Apache Kafka clickstream or order topics.',
    footerMetric: 'Sub-2ms Stream',
    Icon: Radio
  },
  {
    id: 'pos_terminal',
    title: 'Retail POS Terminal Stream',
    badge: 'In-Store POS',
    description: 'Real-time store checkout receipts, loyalty card IDs, and SKU telemetry.',
    footerMetric: 'Omnichannel Sync',
    Icon: Store
  },
  {
    id: 'cloud_storage',
    title: 'Cloud Storage Bucket (AWS S3 / GCS)',
    badge: 'S3 / GCS',
    description: 'Automated Parquet, CSV, and JSON sync from Amazon S3 or Google Cloud Storage.',
    footerMetric: 'Scheduled / Event',
    Icon: Cloud
  },
  {
    id: 'mobile_sdk',
    title: 'Mobile SDK (iOS & Android)',
    badge: 'Swift & Kotlin',
    description: 'Native mobile SDK telemetry, push tokens, and offline event queuing.',
    footerMetric: '< 3.1ms Latency',
    Icon: Smartphone
  },
  {
    id: 'snowflake_sync',
    title: 'Snowflake Data Cloud Sync',
    badge: 'Zero-Copy SQL',
    description: 'Federated pushdown queries and scheduled syncs from Snowflake customer marts.',
    footerMetric: 'Zero-Copy Pushdown',
    Icon: Database
  },
  {
    id: 'salesforce_webhook',
    title: 'Salesforce CRM Webhook',
    badge: 'CRM Webhook',
    description: 'Stream Lead, Contact, and Opportunity updates via Salesforce Apex webhooks.',
    footerMetric: 'Real-Time CRM',
    Icon: Webhook
  }
];

export const DataIngestionView: React.FC = () => {
  const {
    sources,
    ingestEvent,
    schemas,
    setActiveTab,
    setSelectedProfileId,
    loadDemoSources,
    isLiveStreamConnected,
    liveWebSocketPingMs
  } = useCDP();

  // Progressive 3-Step Flow State (Step 2 & 3 hidden until previous step completed)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedSource, setSelectedSource] = useState<IngestionSourceChoice | null>(null);
  const [showMoreSources, setShowMoreSources] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);

  // Quick Create Wizard Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardTemplateId, setWizardTemplateId] = useState<string>('tpl_web_sdk');
  const [isExploreMoreOpen, setIsExploreMoreOpen] = useState(false);

  // Optional Developer Tools Accordion (shown inside Step 3)
  const [isPresetAccordionOpen, setIsPresetAccordionOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [rawJsonText, setRawJsonText] = useState(SAMPLE_PRESET_PAYLOADS[0].rawJson);
  const [selectedChannel, setSelectedChannel] = useState(SAMPLE_PRESET_PAYLOADS[0].channel);
  const [selectedSchemaId, setSelectedSchemaId] = useState(SAMPLE_PRESET_PAYLOADS[0].schemaId);
  const [isInjecting, setIsInjecting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSelectStep1Source = (choice: IngestionSourceChoice) => {
    setSelectedSource(choice);
    setCompletionSummary(null);
    setActiveStep(2);
  };

  const handleUnlockStep3 = (summary: Omit<CompletionSummary, 'timestamp'>) => {
    setCompletionSummary({
      ...summary,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleStep2Complete = (summary: Omit<CompletionSummary, 'timestamp'>) => {
    setCompletionSummary({
      ...summary,
      timestamp: new Date().toLocaleTimeString()
    });
    setActiveStep(3);
  };

  const handleOpenWizard = (templateId: string = 'tpl_web_sdk') => {
    setWizardTemplateId(templateId);
    setIsWizardOpen(true);
  };

  const handlePresetChange = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = SAMPLE_PRESET_PAYLOADS[index];
    setRawJsonText(preset.rawJson);
    setSelectedChannel(preset.channel);
    setSelectedSchemaId(preset.schemaId);
    setLastResult(null);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore invalid JSON
    }
  };

  const handleFireEvent = () => {
    setIsInjecting(true);
    setTimeout(() => {
      const res = ingestEvent(rawJsonText, selectedChannel, selectedSchemaId);
      setLastResult(res);
      setIsInjecting(false);
    }, 280);
  };

  const getSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe':
        return <Globe className="w-4 h-4 text-[#1473E6]" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4 text-[#0EA5E9]" />;
      case 'layers':
        return <Layers className="w-4 h-4 text-[#0284C7]" />;
      case 'database':
        return <Database className="w-4 h-4 text-[#1D4ED8]" />;
      case 'cloud':
        return <Cloud className="w-4 h-4 text-[#3B82F6]" />;
      case 'store':
        return <Store className="w-4 h-4 text-[#0A3D82]" />;
      default:
        return <Radio className="w-4 h-4 text-[#0F58B8]" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Guided Quick-Create Modal */}
      <GuidedIngestionSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialSourceType={wizardTemplateId}
      />

      {/* TOP BANNER — Clean, Uncluttered Header */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <PageBackButton
            fallbackTab="hub_data_management"
            fallbackLabel="Data Management"
            className="shrink-0"
          />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Data Ingestion &amp; Streaming Pipelines
            </h2>
            <span className="text-[10px] bg-white/15 text-sky-100 border border-sky-200/40 font-bold px-2.5 py-0.5 rounded uppercase whitespace-nowrap">
              Real-Time Stream &amp; Batch
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* STEP 1 VIEW: CHOOSE INGESTION SOURCE (ONLY STEP SHOWN INITIALLY)      */}
      {/* ===================================================================== */}
      {activeStep === 1 && (
        <div className="bg-white rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                    Step 1
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Where would you like to ingest data from?
                  </h3>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  Select real-time streaming via Client-Side Web SDK, upload an Excel/CSV file, or expand More Sources for APIs and Databricks Cloud Data Warehouses.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25 shrink-0 self-start sm:self-center">
              Priority: Real-Time Streaming
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* PRIMARY 3-BUTTON HORIZONTAL ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Upload Excel or CSV File */}
              <button
                type="button"
                onClick={() => handleSelectStep1Source('excel_csv')}
                className="rounded-xl border border-[#B3D4FA] hover:border-[#1473E6] bg-white hover:shadow-md text-left transition-all flex flex-col justify-between overflow-hidden group cursor-pointer shadow-2xs"
              >
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-5 py-3.5 text-white border-b border-[#0E4DA4]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-white/15 text-sky-100 border border-white/25">
                      Option 1 • Spreadsheet
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">
                    Upload Excel or CSV File
                  </h4>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#334155] leading-relaxed">
                    Import customer spreadsheets or offline transactions (.xlsx, .xls, .csv) with automatic XDM identity mapping.
                  </p>
                  <div className="mt-5 pt-3 border-t border-[#E1E5EA] flex items-center justify-between text-xs font-bold text-[#1473E6]">
                    <span>Select Spreadsheet Upload</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Option 2: Client-Side Web SDK (Main Streaming Priority) */}
              <button
                type="button"
                onClick={() => handleSelectStep1Source('web_sdk')}
                className="rounded-xl border-2 border-[#1473E6] bg-white hover:shadow-md text-left transition-all flex flex-col justify-between overflow-hidden group cursor-pointer shadow-xs"
              >
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-5 py-3.5 text-white border-b border-[#0E4DA4]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-white text-[#0D66D0] shadow-2xs">
                      Priority • Real-Time Stream
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">
                    Client-Side Web SDK
                  </h4>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between bg-[#F8FBFF]">
                  <p className="text-xs text-[#1E2229] leading-relaxed">
                    Install our live cross-origin <code className="bg-white px-1 rounded border border-[#C5DCFA] text-[#0D66D0]">sdk.js</code> tag on any real-world website to stream PageViews, AddToCart, CartAbandoned, and Purchases in real time.
                  </p>
                  <div className="mt-5 pt-3 border-t border-[#BFDBFE] flex items-center justify-between text-xs font-bold text-[#0D66D0]">
                    <span>Configure Live Web SDK</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Option 3: More Sources (Toggles Horizontal Tile Grid Below) */}
              <button
                type="button"
                onClick={() => setShowMoreSources((prev) => !prev)}
                className={`rounded-xl border-2 text-left transition-all flex flex-col justify-between overflow-hidden group cursor-pointer shadow-2xs ${
                  showMoreSources
                    ? 'border-[#1473E6] bg-[#F8FBFF]'
                    : 'border-[#B3D4FA] hover:border-[#1473E6] bg-white hover:shadow-md'
                }`}
              >
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-5 py-3.5 text-white border-b border-[#0E4DA4]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-white/15 text-sky-100 border border-white/25">
                      {MORE_SOURCE_TILES.length} More Connectors
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">
                    More Sources
                  </h4>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#334155] leading-relaxed">
                    Connect Kafka &amp; Confluent Streams, Retail POS Terminals, AWS S3 / GCS Buckets, Mobile SDKs, Databricks, Snowflake, and Salesforce CRM.
                  </p>
                  <div className="mt-5 pt-3 border-t border-[#E1E5EA] flex items-center justify-between text-xs font-bold text-[#1473E6]">
                    <span>{showMoreSources ? 'Hide Additional Sources' : 'Show More Sources'}</span>
                    {showMoreSources ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* DYNAMIC MORE SOURCES HORIZONTAL TILE GRID (APPEARS UPON CLICKING "MORE SOURCES") */}
            {showMoreSources && (
              <div className="pt-4 border-t border-[#E1E5EA] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                    Enterprise Streaming, Cloud &amp; Warehouse Sources ({MORE_SOURCE_TILES.length})
                  </span>
                  <span className="text-[11px] font-semibold text-[#1473E6]">
                    Click any tile to configure in Step 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MORE_SOURCE_TILES.map((tile) => {
                    const TileIcon = tile.Icon;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => handleSelectStep1Source(tile.id)}
                        className={`rounded-xl text-left transition-all flex flex-col justify-between overflow-hidden group cursor-pointer shadow-2xs hover:shadow-md ${
                          tile.featured
                            ? 'border-2 border-[#1473E6] bg-[#F8FBFF]'
                            : 'border border-[#B3D4FA] hover:border-[#1473E6] bg-white'
                        }`}
                      >
                        {/* Gradient Card Header with White Text & High-Contrast White Icon */}
                        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-4 py-3 text-white border-b border-[#0E4DA4]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
                              <TileIcon className="w-4 h-4 text-white" />
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                tile.featured
                                  ? 'bg-white text-[#0D66D0] shadow-2xs'
                                  : 'bg-white/15 text-sky-100 border border-white/25'
                              }`}
                            >
                              {tile.badge}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white mt-2.5 leading-snug">
                            {tile.title}
                          </h5>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <p className="text-[11px] text-[#334155] leading-relaxed">
                            {tile.description}
                          </p>
                          <div className="mt-3 pt-2.5 border-t border-[#E1E5EA] flex items-center justify-between text-[11px] font-bold text-[#1473E6]">
                            <span>{tile.footerMetric}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#1473E6] group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 2 VIEW: CONFIGURE & CONNECT (ONLY SHOWN AFTER STEP 1 SELECTION)  */}
      {/* ===================================================================== */}
      {activeStep === 2 && selectedSource && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-[#D0D7DE] hover:border-[#1473E6] text-xs font-bold text-[#0D66D0] flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Ingestion Source (Step 1)</span>
            </button>

            <span className="text-xs font-semibold text-[#5C6573]">
              Active Selection: <strong className="text-[#1E2229]">{SOURCE_LABELS[selectedSource]}</strong>
            </span>
          </div>

          {selectedSource === 'excel_csv' && (
            <ExcelCsvFileIngestionSection
              stepBadgeLabel="Step 2"
              onUnlockStep3={(summary) =>
                handleUnlockStep3({
                  sourceName: summary.datasetName || 'Excel & CSV Batch Ingestion',
                  channel: 'Excel / CSV Upload',
                  schemaId: summary.schemaId,
                  latencyMs: 65,
                  message: `Ingested ${summary.totalIngested} rows from spreadsheet into "${summary.datasetName}".`
                })
              }
              onIngestComplete={(summary) =>
                handleStep2Complete({
                  sourceName: summary.datasetName || 'Excel & CSV Batch Ingestion',
                  channel: 'Excel / CSV Upload',
                  schemaId: summary.schemaId,
                  latencyMs: 65,
                  message: `Ingested ${summary.totalIngested} rows from spreadsheet into "${summary.datasetName}".`
                })
              }
            />
          )}

          {selectedSource === 'web_sdk' && (
            <WebSdkSetupPanel onComplete={handleStep2Complete} />
          )}

          {(selectedSource === 'cloud_warehouse' || selectedSource === 'snowflake_sync') && (
            <CloudWarehouseStepPanel
              initialVendor={selectedSource === 'snowflake_sync' ? 'snowflake' : 'databricks'}
              onComplete={handleStep2Complete}
            />
          )}

          {(selectedSource === 'rest_api' ||
            selectedSource === 'batch_file' ||
            selectedSource === 'message_bus' ||
            selectedSource === 'kafka_stream' ||
            selectedSource === 'pos_terminal' ||
            selectedSource === 'cloud_storage' ||
            selectedSource === 'mobile_sdk' ||
            selectedSource === 'salesforce_webhook') && (
            <StreamingEndpointStepPanel
              mode={selectedSource}
              onComplete={handleStep2Complete}
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 3 VIEW: VERIFICATION, ACTIVE CONNECTORS & OPTIONAL DIAGNOSTICS   */}
      {/* ===================================================================== */}
      {activeStep === 3 && completionSummary && (
        <div className="space-y-6">
          {/* Step 3 Verification Summary Card (Matches Step 1 Header Strip Styling) */}
          <div className="bg-white rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                      Step 3
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {completionSummary.sourceName} is Connected &amp; Streaming
                    </h3>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {completionSummary.message}
                    {completionSummary.databricksSynced && (
                      <span className="ml-1.5 font-semibold text-sky-200">
                        (Synced to Databricks Bronze Delta table at {completionSummary.timestamp})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25 shrink-0 self-start sm:self-center">
                Pipeline Verified
              </span>
            </div>

            <div className="px-6 py-3.5 bg-[#F8FAFC] flex flex-wrap items-center justify-end gap-2">
              {completionSummary.profileId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileId(completionSummary.profileId!);
                    setActiveTab('profiles');
                  }}
                  className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Inspect Customer Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('databricks_warehouse')}
                className="px-3.5 py-2 bg-white hover:bg-[#F2F7FE] text-[#0D66D0] border border-[#BFDBFE] font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                View in Databricks
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-3.5 py-2 bg-white hover:bg-[#F2F4F7] text-[#1E2229] border border-[#D0D7DE] font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                + Connect Another Source
              </button>
            </div>
          </div>

          {/* Active Connectors Catalog */}
          <div className="bg-white rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                      Step 3
                    </span>
                    <h3 className="text-base font-bold text-white">Active Data Ingestion Connectors</h3>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Real-time streaming collectors, Web SDK endpoints, and Databricks warehouse pipelines feeding XDM schemas.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25">
                  {sources.length} Active Endpoints
                </span>
                {sources.length === 0 && (
                  <button
                    type="button"
                    onClick={loadDemoSources}
                    className="text-xs font-semibold px-3 py-1.5 text-white hover:bg-white/20 bg-white/10 border border-white/25 rounded-md transition-colors cursor-pointer"
                  >
                    Load Demo Connectors
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-bold px-3.5 py-1.5 bg-white text-[#0A2B60] hover:bg-[#F2F7FE] border border-white/80 rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Add Source</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {sources.length === 0 ? (
                <div className="p-6 border border-dashed border-[#C5DCFA] bg-[#F2F7FE] rounded-lg text-center text-xs text-[#1E2229]">
                  No connectors registered yet. Connect a source in Step 2 or click Load Demo Connectors.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {sources.map((src) => (
                    <div
                      key={src.id}
                      className="bg-white p-3.5 rounded-lg border border-[#E1E5EA] shadow-2xs flex flex-col justify-between hover:border-[#1473E6] transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 rounded bg-[#F2F4F7] border border-[#E1E5EA]">
                            {getSourceIcon(src.icon)}
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                            {src.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#1E2229] truncate" title={src.name}>
                          {src.name}
                        </h4>
                        <p className="text-[10px] text-[#5C6573] mt-0.5 font-mono">
                          {src.latencyMs}ms Latency
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#E1E5EA] flex items-baseline justify-between text-[11px]">
                        <span className="text-[#5C6573] text-[10px]">Today Events:</span>
                        <span className="font-bold text-[#1473E6] font-mono">
                          {src.todayEventCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <TerminalLog maxItems={5} className="h-44" />
            </div>
          </div>

          {/* Optional Collapsible Developer Diagnostics & Simulator */}
          <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPresetAccordionOpen(!isPresetAccordionOpen)}
              className={`w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] hover:brightness-105 text-white cursor-pointer ${
                isPresetAccordionOpen ? 'border-b border-[#0E4DA4]' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/25 px-2 py-0.5 rounded">
                      Optional Diagnostics
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Developer Tools, Edge Decisioning &amp; Live Simulator
                    </h3>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                    {isPresetAccordionOpen
                      ? 'Active developer mode. Click header to collapse edge console and simulation tools.'
                      : 'Expand Edge Console, DLQ Replay, Webhook Tester, and preset XDM payload simulators.'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3.5 py-1.5 bg-white text-[#0D66D0] rounded-md shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-center">
                <span>{isPresetAccordionOpen ? 'Hide Developer Tools' : 'Open Developer Tools'}</span>
                {isPresetAccordionOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#0D66D0]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#0D66D0]" />
                )}
              </span>
            </button>

            {isPresetAccordionOpen && (
              <div className="p-5 bg-white space-y-6">
                <LiveEdgeStreamConsole />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 bg-white rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white">
                          <Cpu className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-white">Live Event Simulator &amp; Transformer</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="text-[11px] font-bold text-[#0D66D0] bg-white px-2.5 py-1 rounded shadow-xs cursor-pointer"
                      >
                        Prettify JSON
                      </button>
                    </div>

                    <div className="p-5 space-y-4 flex flex-col flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SAMPLE_PRESET_PAYLOADS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePresetChange(idx)}
                            className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                              idx === selectedPresetIndex
                                ? 'bg-[#EBF3FC] border-[#1473E6] text-[#1E2229] ring-1 ring-[#1473E6]'
                                : 'bg-[#F2F4F7] border-[#E1E5EA] hover:bg-[#E1E5EA]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#2C2C2C]">{preset.name}</span>
                              <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-[#D5D5D5]">
                                {preset.channel}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={selectedChannel}
                          onChange={(e) => setSelectedChannel(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-semibold bg-[#F2F4F7]"
                        >
                          <option value="Web SDK">Web SDK</option>
                          <option value="Mobile SDK">Mobile SDK</option>
                          <option value="Snowflake Batch">Snowflake Batch</option>
                          <option value="Kafka Ingestion">Kafka Ingestion</option>
                        </select>

                        <select
                          value={selectedSchemaId}
                          onChange={(e) => setSelectedSchemaId(e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-semibold bg-[#F2F4F7]"
                        >
                          {schemas.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        rows={7}
                        value={rawJsonText}
                        onChange={(e) => setRawJsonText(e.target.value)}
                        className="w-full p-3 font-mono text-xs bg-[#0F172A] text-[#9CDCFE] rounded border border-[#3E3E3E] focus:outline-none resize-none"
                        spellCheck={false}
                      />

                      <button
                        type="button"
                        onClick={handleFireEvent}
                        disabled={isInjecting}
                        className="w-full py-2.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isInjecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Ingesting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Fire Ingestion Stream &amp; Stitch Identity</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GitMerge className="w-4 h-4 text-white" />
                        <h4 className="text-xs font-bold text-white">Deterministic Transformation Result</h4>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      {lastResult ? (
                        <div className="space-y-3">
                          <div className="p-3 rounded bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-bold">
                            {lastResult.message} (Profile: {lastResult.profileId})
                          </div>
                          <pre className="p-3 bg-[#0F172A] text-[#93C5FD] font-mono text-[11px] rounded max-h-48 overflow-y-auto">
                            {JSON.stringify(lastResult.transformedPayload, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#5C6573] space-y-2">
                          <Sparkles className="w-8 h-8 text-[#1473E6] opacity-60" />
                          <p className="font-bold text-xs text-[#1E2229]">Awaiting Event Execution</p>
                          <p className="text-[11px]">
                            Fire a test event on the left to inspect XDM normalization and profile stitching.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EXPLORE MORE ACCORDION (COLLAPSED BY DEFAULT, PLAIN WHITE STRIP)      */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-xl border border-[#D0D7DE] shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExploreMoreOpen((prev) => !prev)}
          aria-expanded={isExploreMoreOpen}
          className="w-full px-5 py-3.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-sm font-bold text-[#1E2229] tracking-tight">Explore More</span>
            <span className="text-xs text-[#5C6573] hidden sm:inline">
              Live E-Commerce Store, The Data Lakehouse, Live XDM Tester, Edge Streaming Status &amp; Pipeline Wizard
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[#1473E6]">
            <span className="text-xs font-semibold">
              {isExploreMoreOpen ? 'Collapse' : 'Expand'}
            </span>
            {isExploreMoreOpen ? (
              <ChevronUp className="w-4 h-4 text-[#1473E6]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#1473E6]" />
            )}
          </div>
        </button>

        {isExploreMoreOpen && (
          <div className="px-5 py-4 border-t border-[#E1E5EA] bg-[#FAFBFC] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#D0D7DE] text-xs font-semibold text-[#1E2229]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveStreamConnected ? 'bg-[#1473E6] animate-pulse' : 'bg-[#93C5FD]'
                  }`}
                />
                <span>
                  {isLiveStreamConnected
                    ? `Edge Streaming Active (${liveWebSocketPingMs}ms)`
                    : 'Edge Streaming Connecting...'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ecommerce_store')}
                className="px-3.5 py-2 bg-white hover:bg-[#F2F7FE] text-[#1E2229] hover:text-[#1473E6] font-semibold text-xs rounded-lg border border-[#D0D7DE] hover:border-[#1473E6] shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#1473E6]" />
                <span>Launch Live E-commerce Store</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('databricks_warehouse')}
                className="px-3.5 py-2 bg-white hover:bg-[#F2F7FE] text-[#1E2229] hover:text-[#1473E6] font-semibold text-xs rounded-lg border border-[#D0D7DE] hover:border-[#1473E6] shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4 text-[#1473E6]" />
                <span>The Data Lakehouse</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('xdm_tester')}
                className="px-3.5 py-2 bg-white hover:bg-[#F2F7FE] text-[#1E2229] hover:text-[#1473E6] font-semibold text-xs rounded-lg border border-[#D0D7DE] hover:border-[#1473E6] shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#1473E6]" />
                <span>Live XDM Tester</span>
              </button>
            </div>

            <button
              id="btn-create-data-ingestion"
              type="button"
              onClick={() => handleOpenWizard('tpl_web_sdk')}
              className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Data Ingestion</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
