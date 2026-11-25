import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useCDP } from '../../context/CDPContext';
import { Dataset } from '../../types/cdp';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Table,
  Check,
  Download,
  Eye,
  ShieldCheck,
  Key,
  Users,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

interface SampleDatasetOption {
  id: string;
  name: string;
  description: string;
  targetSchema: string;
  defaultDatasetName: string;
  data: Record<string, any>[];
}

const SAMPLE_DATASETS: SampleDatasetOption[] = [
  {
    id: 'sample_profiles',
    name: 'Customer 360 Profiles',
    description: 'Enterprise contacts with email identities, loyalty tier, spend & GDPR consent',
    targetSchema: 'xdm_individual_profile',
    defaultDatasetName: 'Enterprise Customer Profiles (Excel Import)',
    data: [
      {
        customer_email: 'claire.dubois@luxeglobal.fr',
        firstName: 'Claire',
        lastName: 'Dubois',
        contact_phone: '+33 6 12 34 56 78',
        total_spend: 3420.00,
        customer_tier: 'Platinum',
        city: 'Paris',
        country: 'France',
        gdpr_consent: true,
        churn_risk: 'Low'
      },
      {
        customer_email: 'kenji.sato@tokyotech.co.jp',
        firstName: 'Kenji',
        lastName: 'Sato',
        contact_phone: '+81 90 1234 5678',
        total_spend: 5890.50,
        customer_tier: 'VIP',
        city: 'Tokyo',
        country: 'Japan',
        gdpr_consent: true,
        churn_risk: 'Low'
      },
      {
        customer_email: 'sarah.miller@austinfintech.io',
        firstName: 'Sarah',
        lastName: 'Miller',
        contact_phone: '+1 512 555 0192',
        total_spend: 1240.00,
        customer_tier: 'Gold',
        city: 'Austin',
        country: 'United States',
        gdpr_consent: true,
        churn_risk: 'Medium'
      },
      {
        customer_email: 'mateo.silva@saopauloretail.br',
        firstName: 'Mateo',
        lastName: 'Silva',
        contact_phone: '+55 11 98765 4321',
        total_spend: 850.25,
        customer_tier: 'Silver',
        city: 'São Paulo',
        country: 'Brazil',
        gdpr_consent: true,
        churn_risk: 'Medium'
      },
      {
        customer_email: 'elena.rostova@techenterprise.com',
        firstName: 'Elena',
        lastName: 'Rostova',
        contact_phone: '+1 415 555 2671',
        total_spend: 4210.00,
        customer_tier: 'VIP',
        city: 'San Francisco',
        country: 'United States',
        gdpr_consent: true,
        churn_risk: 'Low'
      },
      {
        customer_email: 'marcus.vance@vancemedia.io',
        firstName: 'Marcus',
        lastName: 'Vance',
        contact_phone: '+44 20 7946 0912',
        total_spend: 2180.00,
        customer_tier: 'Gold',
        city: 'London',
        country: 'United Kingdom',
        gdpr_consent: true,
        churn_risk: 'Low'
      }
    ]
  },
  {
    id: 'sample_events',
    name: 'Digital Experience & Purchase Telemetry',
    description: 'Omnichannel digital transactions, SKUs, and commerce revenue',
    targetSchema: 'xdm_experience_event',
    defaultDatasetName: 'Digital Commerce Events (Excel Import)',
    data: [
      {
        customer_email: 'claire.dubois@luxeglobal.fr',
        eventType: 'Purchase',
        orderId: 'PO-2026-90412',
        sku: 'LUXE-SILK-SCARF-01',
        total_amount: 340.00,
        channel: 'Web Store',
        device_browser: 'Safari / macOS'
      },
      {
        customer_email: 'kenji.sato@tokyotech.co.jp',
        eventType: 'Purchase',
        orderId: 'PO-2026-90413',
        sku: 'ULTRA-4K-MONITOR-PRO',
        total_amount: 1199.00,
        channel: 'Web Store',
        device_browser: 'Chrome / Windows'
      },
      {
        customer_email: 'sarah.miller@austinfintech.io',
        eventType: 'AddToCart',
        orderId: 'CART-882194',
        sku: 'FINTECH-API-PRO-TIER',
        total_amount: 499.00,
        channel: 'Mobile App',
        device_browser: 'iOS App v4.2'
      },
      {
        customer_email: 'elena.rostova@techenterprise.com',
        eventType: 'Purchase',
        orderId: 'PO-2026-90414',
        sku: 'ENTERPRISE-CLUSTER-8X',
        total_amount: 2850.00,
        channel: 'Direct Sales Portal',
        device_browser: 'Edge / Windows'
      }
    ]
  }
];

export const ExcelCsvFileIngestionSection: React.FC = () => {
  const { ingestEvent, schemas, createDataset, addAuditLog, setActiveTab, setSelectedProfileId } = useCDP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [fileData, setFileData] = useState<Record<string, any>[]>(SAMPLE_DATASETS[0].data);
  const [fileName, setFileName] = useState<string>('customer_360_profiles.xlsx');
  const [fileSizeStr, setFileSizeStr] = useState<string>('18.4 KB');
  const [sheetNames, setSheetNames] = useState<string[]>(['Customer_Profiles']);
  const [selectedSheet, setSelectedSheet] = useState<string>('Customer_Profiles');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Configuration state
  const [selectedSchema, setSelectedSchema] = useState<string>('xdm_individual_profile');
  const [datasetName, setDatasetName] = useState<string>('Customer Profiles Ingestion (Excel)');

  // Ingestion execution state
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestProgress, setIngestProgress] = useState<number>(0);
  const [ingestSuccessResult, setIngestSuccessResult] = useState<{
    totalIngested: number;
    datasetId?: string;
    datasetName?: string;
    schemaId: string;
    timestamp: string;
  } | null>(null);

  // Columns detected
  const columns = fileData.length > 0 ? Object.keys(fileData[0]) : [];

  // Helper to infer identity and DULE type for columns
  const getColumnBadge = (col: string) => {
    const lower = col.toLowerCase();
    if (lower.includes('email') || lower.includes('phone') || lower.includes('crm') || lower.includes('id')) {
      return { label: 'Primary Identity', color: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]', icon: Key };
    }
    if (lower.includes('consent') || lower.includes('opt_out') || lower.includes('gdpr') || lower.includes('ccpa')) {
      return { label: 'Consent (R-Series)', color: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]', icon: ShieldCheck };
    }
    if (lower.includes('spend') || lower.includes('revenue') || lower.includes('amount') || lower.includes('price')) {
      return { label: 'Financial (S3)', color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]', icon: Layers };
    }
    if (lower.includes('city') || lower.includes('country') || lower.includes('geo')) {
      return { label: 'Location (S1)', color: 'bg-[#DBEAFE] text-[#0A3D82] border-[#93C5FD]', icon: ShieldCheck };
    }
    return { label: 'Profile Trait', color: 'bg-[#F8FAFC] text-[#1473E6] border-[#E1E5EA]', icon: Users };
  };

  // Handle file reading using SheetJS (XLSX)
  const processUploadedFile = (file: File) => {
    setFileName(file.name);
    setFileSizeStr((file.size / 1024).toFixed(1) + ' KB');
    setIngestSuccessResult(null);

    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          setFileData(rows);
          setSheetNames(['JSON_Document']);
          setSelectedSheet('JSON_Document');
          setDatasetName(`JSON Batch Import - ${file.name.replace(/\.[^/.]+$/, '')}`);
        } catch (err) {
          console.error('Failed to parse JSON file:', err);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel (.xlsx, .xls) or CSV
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheets = workbook.SheetNames;
          setSheetNames(sheets);

          if (sheets.length > 0) {
            const firstSheet = sheets[0];
            setSelectedSheet(firstSheet);
            const worksheet = workbook.Sheets[firstSheet];
            const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
            setFileData(jsonRows);
            setDatasetName(`Excel Import - ${file.name.replace(/\.[^/.]+$/, '')}`);
          }
        } catch (err) {
          console.error('Failed to parse Excel/CSV file:', err);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Load sample dataset
  const handleLoadSample = (sample: SampleDatasetOption) => {
    setFileData(sample.data);
    setFileName(`${sample.id}.xlsx`);
    setFileSizeStr('14.2 KB');
    setSheetNames(['Primary_Data']);
    setSelectedSheet('Primary_Data');
    setSelectedSchema(sample.targetSchema);
    setDatasetName(sample.defaultDatasetName);
    setIngestSuccessResult(null);
  };

  // Download Sample Template file (.csv or .xlsx)
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    const ws = XLSX.utils.json_to_sheet(fileData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    if (format === 'xlsx') {
      XLSX.writeFile(wb, `xlr8_ingestion_template_${selectedSchema}.xlsx`);
    } else {
      XLSX.writeFile(wb, `xlr8_ingestion_template_${selectedSchema}.csv`);
    }
  };

  // Execute ingestion into CDP Context & Engine
  const handleExecuteIngest = () => {
    if (fileData.length === 0) return;
    setIsIngesting(true);
    setIngestProgress(10);

    const interval = setInterval(() => {
      setIngestProgress(p => (p >= 85 ? p : p + 25));
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIngestProgress(100);

      // Ingest each record into the real-time pipeline
      let ingestedCount = 0;
      fileData.forEach((row) => {
        ingestEvent(row, 'Batch Excel/CSV Gateway', selectedSchema);
        ingestedCount++;
      });

      // Auto-register corresponding dataset in the CDP Catalog
      const targetSchemaObj = schemas.find(s => s.id === selectedSchema);
      const schemaName = targetSchemaObj ? targetSchemaObj.name : 'Individual Profile';

      const newDataset = createDataset({
        name: datasetName || `Imported Dataset (${fileName})`,
        schemaName,
        schemaId: selectedSchema,
        sourceConnectorName: 'Excel / CSV File Ingestion',
        ingestionType: 'batch',
        format: fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ? 'parquet' : 'csv',
        recordCount: ingestedCount,
        sizeBytes: fileData.length * 520,
        sizeFormatted: `${(fileData.length * 0.52).toFixed(1)} KB`,
        status: 'Active',
        labels: ['C1', 'I1', 'S1', 'R1'],
        description: `Imported ${ingestedCount} customer records from spreadsheet "${fileName}" on ${new Date().toLocaleDateString()}.`
      });

      addAuditLog({
        userId: 'usr_current_operator',
        userName: 'Current Operator',
        userRole: 'Data Architect',
        category: 'Schema & Ingestion',
        action: 'Ingested Excel / CSV Dataset',
        targetEntity: `Dataset: "${newDataset.name}"`,
        status: 'SUCCESS',
        summary: `Successfully parsed and ingested ${ingestedCount} rows from ${fileName} into schema "${schemaName}".`,
        complianceFlags: ['DULE Governed', 'Audit Trail Verified']
      });

      setIngestSuccessResult({
        totalIngested: ingestedCount,
        datasetId: newDataset.id,
        datasetName: newDataset.name,
        schemaId: selectedSchema,
        timestamp: new Date().toLocaleTimeString()
      });

      setIsIngesting(false);
    }, 600);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden">
      {/* Step 1 Header Strip */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0D66D0] px-2 py-0.5 rounded shadow-2xs">
                Step 1: Main Ingestion
              </span>
              <h3 className="text-base font-bold text-white">
                Excel & CSV File Ingestion
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shadow-2xs">
                Direct Spreadsheet Upload
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium mt-0.5 max-w-2xl leading-relaxed">
              Upload customer lists, offline transactions, or lead spreadsheets (.xlsx, .xls, .csv). Data is automatically validated, normalized to canonical XDM schemas, and resolved in real-time.
            </p>
          </div>
        </div>

        {/* Quick Sample Loaders & Template Downloads */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          <div className="relative group">
            <button
              onClick={() => handleDownloadTemplate('xlsx')}
              className="px-3 py-1.5 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] border border-white/80 rounded-md font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Download Excel Template"
            >
              <Download className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Download Excel Template</span>
            </button>
          </div>

          <button
            onClick={() => handleDownloadTemplate('csv')}
            className="px-3 py-1.5 bg-white/15 text-white hover:bg-white/25 border border-white/25 rounded-md font-semibold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Download CSV Template"
          >
            <Download className="w-3.5 h-3.5 text-blue-100" />
            <span>.CSV Template</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Sample Selectors Bar */}
        <div className="bg-[#F8FAFC] border border-[#E1E5EA] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-[#555]">
            <Sparkles className="w-4 h-4 text-[#1473E6] shrink-0" />
            <span className="font-semibold text-[#1E2229]">Try with instant ready-made templates:</span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            {SAMPLE_DATASETS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className={`px-3 py-1 text-xs rounded border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  fileName.includes(sample.id) || datasetName === sample.defaultDatasetName
                    ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#1473E6] font-bold shadow-2xs'
                    : 'bg-white text-[#2C2C2C] border-[#D5D5D5] hover:bg-[#F2F4F7] font-medium'
                }`}
              >
                <FileText className="w-3 h-3 text-[#1473E6]" />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone & Ingestion Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Drag & Drop Upload Zone (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#1473E6] bg-[#EBF3FC] scale-99'
                  : 'border-[#CBD5E1] bg-[#FCFDFD] hover:border-[#1473E6] hover:bg-[#F9FAFC]'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-[#EBF3FC] border border-[#C5DCFA] flex items-center justify-center text-[#1473E6] mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-[#1473E6]" />
              </div>
              <h4 className="text-sm font-bold text-[#1E2229]">
                Choose an Excel or CSV file to upload
              </h4>
              <p className="text-xs text-[#555] mt-1 max-w-xs leading-relaxed">
                Drag and drop your spreadsheet here, or click to browse files from your computer.
              </p>

              <div className="flex items-center space-x-2 mt-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  .XLSX
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  .XLS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                  .CSV
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  .JSON
                </span>
              </div>
            </div>

            {/* Selected File Information Card */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-lg border border-[#E1E5EA] flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#1E2229] truncate">{fileName}</p>
                  <p className="text-[10px] text-[#666] font-mono mt-0.5">
                    {fileSizeStr} • {fileData.length} records detected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#1473E6] hover:underline shrink-0 ml-2"
              >
                Change File
              </button>
            </div>

            {/* Multi-sheet selector (if Excel has multiple sheets) */}
            {sheetNames.length > 1 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Active Spreadsheet Worksheet
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md text-xs font-semibold bg-white text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Column: Schema Target & Dataset Destination (7 cols) */}
          <div className="lg:col-span-7 bg-[#F9FAFC] border border-[#E1E5EA] rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-white shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Schema Binding & Ingestion Settings
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD] shrink-0">
                Ready to Ingest
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1.5">
                    Target Canonical XDM Schema
                  </label>
                  <select
                    value={selectedSchema}
                    onChange={(e) => setSelectedSchema(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white text-[#2C2C2C] focus:ring-2 focus:ring-[#1473E6] focus:outline-none shadow-2xs"
                  >
                    {schemas.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status})
                      </option>
                    ))}
                    {schemas.length === 0 && (
                      <option value="xdm_individual_profile">Individual Profile (Customer 360)</option>
                    )}
                  </select>
                  <p className="text-[10px] text-[#666] mt-1">
                    Rows will be normalized to this schema's canonical identity graph.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1.5">
                    Destination Dataset Name
                  </label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white text-[#2C2C2C] focus:ring-2 focus:ring-[#1473E6] focus:outline-none shadow-2xs"
                    placeholder="e.g., Enterprise Customer Profiles 2026"
                  />
                  <p className="text-[10px] text-[#666] mt-1">
                    Will be cataloged in the Datasets library with DULE privacy tags.
                  </p>
                </div>
              </div>

              {/* Column Detection & Auto-Mapping Preview */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E2229]">
                    Detected Spreadsheet Columns ({columns.length}) & Identity Mapping
                  </span>
                  <span className="text-[10px] text-[#1473E6] font-semibold">
                    Automatic Semantic Recognition
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white rounded-lg border border-[#E1E5EA]">
                  {columns.map((col) => {
                    const badge = getColumnBadge(col);
                    const Icon = badge.icon;
                    return (
                      <span
                        key={col}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${badge.color}`}
                        title={`${col} -> ${badge.label}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="font-semibold">{col}</span>
                        <span className="text-[9px] opacity-75 font-sans">({badge.label})</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ingestion Trigger Button & Progress */}
            <div className="pt-3 border-t border-[#E1E5EA]">
              {isIngesting ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1473E6]">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting {fileData.length} spreadsheet records into CDP...</span>
                    </span>
                    <span>{ingestProgress}%</span>
                  </div>
                  <div className="w-full bg-[#E1E5EA] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#1473E6] h-2 rounded-full transition-all duration-200"
                      style={{ width: `${ingestProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteIngest}
                  disabled={fileData.length === 0}
                  className="w-full py-3 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-99 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    Ingest {fileData.length} Records into Real-Time Platform
                  </span>
                </button>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Success Confirmation Card (When Ingestion Completes) */}
        {ingestSuccessResult && (
          <div className="p-4 bg-[#EBF3FC] border border-[#BFDBFE] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 text-[#0284C7] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#0A3D82]">
                  File Ingestion Successful! {ingestSuccessResult.totalIngested} Records Ingested
                </h4>
                <p className="text-xs text-[#1E2229] mt-0.5">
                  Dataset <strong className="font-semibold text-[#0D66D0]">"{ingestSuccessResult.datasetName}"</strong> has been registered with active DULE governance labels and deterministic profile stitching completed at {ingestSuccessResult.timestamp}.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={() => {
                  if (fileData[0]?.customer_email) {
                    setSelectedProfileId(fileData[0].customer_email);
                  }
                  setActiveTab('profiles');
                }}
                className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>View Customer Profiles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveTab('datasets')}
                className="px-3 py-1.5 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] border border-[#BFDBFE] font-bold text-xs rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Inspect Dataset
              </button>
            </div>
          </div>
        )}

        {/* Spreadsheet Data Preview Table */}
        <div className="border border-[#E1E5EA] rounded-xl overflow-hidden bg-white">
          <div className="px-5 py-3 bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-white shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Spreadsheet Data Preview ({fileData.length} Total Rows)
              </h4>
            </div>
            <span className="text-[11px] text-blue-100">
              Showing first {Math.min(fileData.length, 6)} rows
            </span>
          </div>

          <div className="overflow-x-auto max-h-60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F2F4F7] border-b border-[#E1E5EA] text-[#1E2229]">
                  <th className="py-2 px-3 font-mono text-[11px] font-bold text-[#666] w-12 text-center">#</th>
                  {columns.map((col) => (
                    <th key={col} className="py-2 px-3 font-semibold text-[11px] whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5EA]">
                {fileData.slice(0, 6).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2 px-3 font-mono text-[10px] text-[#888] text-center bg-[#FDFDFD]">
                      {idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="py-2 px-3 text-[#2C2C2C] whitespace-nowrap font-mono text-[11px]">
                        {typeof row[col] === 'boolean' ? (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${row[col] ? 'bg-[#E0F2FE] text-[#0369A1]' : 'bg-[#F2F4F7] text-[#666]'}`}>
                            {row[col] ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : typeof row[col] === 'number' ? (
                          <span className="text-[#0D66D0] font-semibold">
                            {row[col].toLocaleString()}
                          </span>
                        ) : (
                          String(row[col] ?? '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
