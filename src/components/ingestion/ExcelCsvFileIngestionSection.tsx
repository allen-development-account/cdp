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
  X,
  ArrowLeft,
  ChevronDown,
  ChevronUp
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

interface ExcelCsvFileIngestionSectionProps {
  onIngestComplete?: (summary: {
    totalIngested: number;
    datasetId?: string;
    datasetName?: string;
    schemaId: string;
    timestamp: string;
  }) => void;
  onUnlockStep3?: (summary: {
    totalIngested: number;
    datasetId?: string;
    datasetName?: string;
    schemaId: string;
    timestamp: string;
  }) => void;
  stepBadgeLabel?: string;
}

type ExcelFlowStep = 'upload' | 'binding' | 'ingesting' | 'preview';

export const ExcelCsvFileIngestionSection: React.FC<ExcelCsvFileIngestionSectionProps> = ({
  onIngestComplete,
  onUnlockStep3,
  stepBadgeLabel = 'Step 2: Configure & Ingest'
}) => {
  const { ingestEvent, schemas, createDataset, addAuditLog, addSource, sources } = useCDP();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workbookRef = useRef<XLSX.WorkBook | null>(null);

  // Multi-step sub-flow state
  const [excelStep, setExcelStep] = useState<ExcelFlowStep>('upload');
  const [isTemplatesAccordionOpen, setIsTemplatesAccordionOpen] = useState<boolean>(false);

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
          workbookRef.current = workbook;
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

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbookRef.current && workbookRef.current.Sheets[sheetName]) {
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbookRef.current.Sheets[sheetName]);
      setFileData(jsonRows);
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
    if (excelStep === 'preview') {
      setExcelStep('upload');
    }
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
    setExcelStep('ingesting');
    setIngestProgress(12);

    const interval = setInterval(() => {
      setIngestProgress((p) => (p >= 88 ? p : p + 19));
    }, 170);

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
      const targetSchemaObj = schemas.find((s) => s.id === selectedSchema);
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

      if (!sources.some((s) => s.id === 'src_excel_csv_gateway')) {
        addSource({
          id: 'src_excel_csv_gateway',
          name: 'Excel & CSV Batch Ingestion',
          type: 'Batch',
          status: 'Healthy',
          ratePerSec: 0,
          todayEventCount: ingestedCount,
          latencyMs: 65,
          description: `Spreadsheet ingestion gateway (${fileName}) mapped to ${schemaName}.`,
          icon: 'database',
          category: 'Data Warehouses',
          targetSchemaId: selectedSchema,
          targetSchemaName: schemaName,
          authMethod: 'Signed File Upload'
        });
      }

      const completionSummary = {
        totalIngested: ingestedCount,
        datasetId: newDataset.id,
        datasetName: newDataset.name,
        schemaId: selectedSchema,
        timestamp: new Date().toLocaleTimeString()
      };

      setIngestSuccessResult(completionSummary);
      setIsIngesting(false);
      setExcelStep('preview');
      onUnlockStep3?.(completionSummary);
    }, 950);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#FFFFFF] rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
        {/* Step 2 Header Strip (Matches Step 1 Styling) */}
        <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                  {stepBadgeLabel}
                </span>
                <h3 className="text-base font-bold text-white">
                  Excel &amp; CSV File Ingestion
                </h3>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Upload customer lists, offline transactions, or lead spreadsheets (.xlsx, .xls, .csv). Data is automatically validated, normalized to canonical XDM schemas, and resolved in real-time.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25 shrink-0 self-start sm:self-center">
            Direct Spreadsheet Upload
          </span>
        </div>

      {/* Sub-step Progress Indicator Strip */}
      <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            disabled={excelStep === 'ingesting'}
            onClick={() => setExcelStep('upload')}
            className={`px-3 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              excelStep === 'upload'
                ? 'bg-[#1473E6] text-white shadow-2xs'
                : 'bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE]'
            }`}
          >
            <span>1. Upload File</span>
            {excelStep !== 'upload' && <Check className="w-3.5 h-3.5" />}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />

          <button
            type="button"
            disabled={fileData.length === 0 || excelStep === 'ingesting'}
            onClick={() => setExcelStep('binding')}
            className={`px-3 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              excelStep === 'binding'
                ? 'bg-[#1473E6] text-white shadow-2xs cursor-pointer'
                : excelStep === 'ingesting' || excelStep === 'preview'
                ? 'bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE] cursor-pointer'
                : 'bg-white text-[#64748B] border border-[#E1E5EA] cursor-not-allowed'
            }`}
          >
            <span>2. Schema Binding &amp; Settings</span>
            {excelStep === 'preview' && <Check className="w-3.5 h-3.5" />}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />

          <div
            className={`px-3 py-1 rounded-md font-bold flex items-center gap-1.5 ${
              excelStep === 'preview' || excelStep === 'ingesting'
                ? 'bg-[#1473E6] text-white shadow-2xs'
                : 'bg-white text-[#64748B] border border-[#E1E5EA]'
            }`}
          >
            <span>3. Ingested Records Preview</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#5C6573]">
          File: <strong className="text-[#1E2229]">{fileName}</strong> ({fileData.length} rows)
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* =============================================================== */}
        {/* SUB-STEP 1: INITIAL SCREEN — ONLY UPLOADER & UPLOADED FILE      */}
        {/* =============================================================== */}
        {excelStep === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#1473E6] bg-[#EBF3FC] scale-99'
                  : 'border-[#CBD5E1] bg-[#FCFDFD] hover:border-[#1473E6] hover:bg-[#F9FAFC]'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-[#EBF3FC] border border-[#C5DCFA] flex items-center justify-center text-[#1473E6] mb-3 transition-transform">
                <Upload className="w-7 h-7 text-[#1473E6]" />
              </div>
              <h4 className="text-sm font-bold text-[#1E2229]">
                Choose an Excel or CSV file to upload
              </h4>
              <p className="text-xs text-[#555] mt-1 max-w-sm leading-relaxed">
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

            {/* Uploaded File Card */}
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#C5DCFA] shadow-2xs flex items-center justify-between">
              <div className="flex items-center space-x-3.5 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
                    Uploaded File Ready
                  </p>
                  <p className="text-sm font-bold text-[#1E2229] truncate">{fileName}</p>
                  <p className="text-xs text-[#5C6573] font-mono mt-0.5">
                    {fileSizeStr} • {fileData.length} records detected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md bg-[#EBF3FC] hover:bg-[#DBEAFE] text-xs font-bold text-[#1473E6] shrink-0 ml-2 cursor-pointer"
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
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D5D5] rounded-md text-xs font-semibold bg-white text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Bottom Button -> Next Screen (Schema Binding & Settings) */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={fileData.length === 0}
                onClick={() => setExcelStep('binding')}
                className="w-full py-3 px-5 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Schema Binding &amp; Ingestion Settings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-STEP 2: SCHEMA BINDING & INGESTION SETTINGS                 */}
        {/* =============================================================== */}
        {excelStep === 'binding' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setExcelStep('upload')}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#D0D7DE] hover:border-[#1473E6] text-xs font-bold text-[#0D66D0] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to File Upload</span>
              </button>

              <span className="text-xs font-mono text-[#5C6573] bg-[#F8FAFC] px-3 py-1 rounded-md border border-[#E1E5EA]">
                {fileName} • {fileData.length} records
              </span>
            </div>

            <div className="bg-[#F9FAFC] border border-[#E1E5EA] rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-white shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Schema Binding &amp; Ingestion Settings
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD] shrink-0">
                  Ready to Ingest
                </span>
              </div>

              <div className="p-6 space-y-5">
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
                      Rows will be normalized to this schema&apos;s canonical identity graph.
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E2229]">
                      Detected Spreadsheet Columns ({columns.length}) &amp; Identity Mapping
                    </span>
                    <span className="text-[10px] text-[#1473E6] font-semibold">
                      Automatic Semantic Recognition
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 bg-white rounded-lg border border-[#E1E5EA]">
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

                {/* Bottom Action Button: Ingest Records into Real-Time Platform */}
                <div className="pt-3 border-t border-[#E1E5EA]">
                  <button
                    type="button"
                    onClick={handleExecuteIngest}
                    disabled={fileData.length === 0 || isIngesting}
                    className="w-full py-3 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-99 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Ingest {fileData.length} Records into Real-Time Platform</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-STEP 3: LOADER ANIMATION WHILE INGESTING                    */}
        {/* =============================================================== */}
        {excelStep === 'ingesting' && (
          <div className="max-w-xl mx-auto py-12 px-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#EBF3FC] border-2 border-[#BFDBFE] flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-[#1473E6] animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-[#1E2229]">
                Ingesting {fileData.length} Records into Real-Time Platform...
              </h4>
              <p className="text-xs text-[#5C6573]">
                Normalizing XDM schema fields, assigning DULE governance labels, and executing deterministic profile stitching.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-[#E1E5EA] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1473E6] to-[#0284C7] h-2.5 rounded-full transition-all duration-150"
                  style={{ width: `${ingestProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#1473E6] block">
                {ingestProgress}% Complete
              </span>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* SUB-STEP 4: PREVIEW PANEL OF INGESTED DATA RECORDS              */}
        {/* =============================================================== */}
        {excelStep === 'preview' && (
          <div className="space-y-5">
            {/* Success Confirmation Banner */}
            {ingestSuccessResult && (
              <div className="p-4 bg-gradient-to-r from-[#ECFDF5] via-[#E8FAEF] to-[#D1FAE5] border border-[#86EFAC] rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-[#BBF7D0] border border-[#4ADE80] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#14532D]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#14532D]">
                    Ingestion Complete! {ingestSuccessResult.totalIngested} Records Ingested into Real-Time Platform
                  </h4>
                  <p className="text-xs text-[#111827] mt-0.5 leading-relaxed">
                    Dataset <strong className="font-bold text-[#166534]">&quot;{ingestSuccessResult.datasetName}&quot;</strong> has been registered with active DULE governance labels and deterministic profile stitching completed at <span className="font-semibold text-[#111827]">{ingestSuccessResult.timestamp}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Ingested Records Preview Table */}
            <div className="border border-[#E1E5EA] rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-3 bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-white shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Ingested Data Records Preview ({fileData.length} Total Rows)
                  </h4>
                </div>
                <span className="text-[11px] text-blue-100">
                  Showing {Math.min(fileData.length, 50)} of {fileData.length} ingested rows
                </span>
              </div>

              <div className="overflow-x-auto max-h-80">
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
                    {fileData.slice(0, 50).map((row, idx) => (
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

            {/* Bottom Navigation Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIngestSuccessResult(null);
                    setExcelStep('upload');
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#1E2229] border border-[#D0D7DE] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Upload Another File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExcelStep('binding')}
                  className="px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#0D66D0] border border-[#BFDBFE] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Adjust Schema Settings</span>
                </button>
              </div>

              {onIngestComplete && ingestSuccessResult && (
                <button
                  type="button"
                  onClick={() => onIngestComplete(ingestSuccessResult)}
                  className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Step 3: Active Connectors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Outside Main Container (Directly Above Explore More Accordion): Instant Ready-Made Templates & Template Downloads Accordion (Collapsed by Default) */}
      <div className="bg-white border border-[#D0D7DE] rounded-xl shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsTemplatesAccordionOpen((prev) => !prev)}
          aria-expanded={isTemplatesAccordionOpen}
          className="w-full px-5 py-3.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-4 h-4 text-[#1473E6] shrink-0" />
            <span className="text-sm font-bold text-[#1E2229] tracking-tight">
              Try with Instant Ready-Made Templates
            </span>
            <span className="text-xs text-[#5C6573] hidden sm:inline">
              Customer 360 Profiles, Purchase Telemetry, Excel &amp; CSV Sample Downloads
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[#1473E6]">
            <span className="text-xs font-semibold">
              {isTemplatesAccordionOpen ? 'Collapse' : 'Expand'}
            </span>
            {isTemplatesAccordionOpen ? (
              <ChevronUp className="w-4 h-4 text-[#1473E6]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#1473E6]" />
            )}
          </div>
        </button>

        {isTemplatesAccordionOpen && (
          <div className="px-5 py-4 border-t border-[#E1E5EA] bg-[#FAFBFC] flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold text-[#5C6573] shrink-0">Load sample data:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {SAMPLE_DATASETS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleLoadSample(sample)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      fileName.includes(sample.id) || datasetName === sample.defaultDatasetName
                        ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#1473E6] font-bold shadow-2xs'
                        : 'bg-white text-[#1E2229] border-[#D0D7DE] hover:bg-[#F2F7FE] hover:border-[#93C5FD] font-semibold'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap lg:border-l lg:border-[#E1E5EA] lg:pl-4">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('xlsx')}
                className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download Excel Template"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Download Excel Template</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadTemplate('csv')}
                className="px-3.5 py-1.5 bg-white hover:bg-[#F2F7FE] text-[#0D66D0] border border-[#BFDBFE] hover:border-[#1473E6] rounded-lg font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download CSV Template"
              >
                <Download className="w-3.5 h-3.5 text-[#1473E6]" />
                <span>Download .CSV Template</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
