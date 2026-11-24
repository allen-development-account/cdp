import React, { useState, useRef } from 'react';
import { useCDP } from '../../context/CDPContext';
import { IngestionSource } from '../../types/cdp';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Table,
  Check
} from 'lucide-react';

interface FileIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV_ROWS = [
  {
    customer_email: 'claire.dubois@luxeglobal.fr',
    firstName: 'Claire',
    lastName: 'Dubois',
    total_spend: 3420.00,
    customer_tier: 'Platinum',
    city: 'Paris',
    country: 'France',
    gdpr_consent: true,
    ccpa_opt_out: false
  },
  {
    customer_email: 'kenji.sato@tokyotech.co.jp',
    firstName: 'Kenji',
    lastName: 'Sato',
    total_spend: 5890.50,
    customer_tier: 'VIP',
    city: 'Tokyo',
    country: 'Japan',
    gdpr_consent: true,
    ccpa_opt_out: false
  },
  {
    customer_email: 'sarah.miller@austinfintech.io',
    firstName: 'Sarah',
    lastName: 'Miller',
    total_spend: 1240.00,
    customer_tier: 'Gold',
    city: 'Austin',
    country: 'United States',
    gdpr_consent: true,
    ccpa_opt_out: false
  },
  {
    customer_email: 'mateo.silva@saopauloretail.br',
    firstName: 'Mateo',
    lastName: 'Silva',
    total_spend: 850.25,
    customer_tier: 'Silver',
    city: 'São Paulo',
    country: 'Brazil',
    gdpr_consent: true,
    ccpa_opt_out: false
  }
];

export const FileIngestionModal: React.FC<FileIngestionModalProps> = ({ isOpen, onClose }) => {
  const { ingestEvent, addSource, sources, schemas } = useCDP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('sample_customer_profiles_2026.csv');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>(SAMPLE_CSV_ROWS);
  const [selectedSchema, setSelectedSchema] = useState<string>('xdm_individual_profile');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ingestionResult, setIngestionResult] = useState<{ count: number; status: 'idle' | 'success' | 'error'; message?: string }>({
    count: 0,
    status: 'idle'
  });

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIngestionResult({ count: 0, status: 'idle' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          setParsedRows(rows.slice(0, 10));
        } else {
          // Simple CSV parser
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
            const rows = lines.slice(1, 11).map(line => {
              const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
              const obj: Record<string, any> = {};
              headers.forEach((h, idx) => {
                const val = vals[idx] || '';
                const num = Number(val);
                obj[h] = !isNaN(num) && val !== '' ? num : val;
              });
              return obj;
            });
            setParsedRows(rows);
          }
        }
      } catch (err) {
        console.error('File parsing error:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setFileName('sample_customer_profiles_2026.csv');
    setParsedRows(SAMPLE_CSV_ROWS);
    setIngestionResult({ count: 0, status: 'idle' });
  };

  const handleExecuteIngest = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      let ingestedCount = 0;
      parsedRows.forEach(row => {
        ingestEvent(row, 'Snowflake Batch', selectedSchema);
        ingestedCount++;
      });

      // Ensure batch source is present
      const sourceExists = sources.some(s => s.id === 'src_batch_file_upload');
      if (!sourceExists) {
        const newSource: IngestionSource = {
          id: 'src_batch_file_upload',
          name: 'Batch File Ingestion Gateway (CSV/JSON)',
          type: 'Batch',
          status: 'Healthy',
          todayEventCount: ingestedCount,
          ratePerSec: 0,
          latencyMs: 85.0,
          description: 'Client-side and cloud batch file ingestion for structured customer lists and offline transactions.',
          icon: 'database',
          category: 'Data Warehouses'
        };
        addSource(newSource);
      }

      setIsProcessing(false);
      setIngestionResult({
        count: ingestedCount,
        status: 'success',
        message: `Successfully ingested and stitched ${ingestedCount} profile records into canonical XDM Profile store!`
      });
    }, 600);
  };

  const columns = parsedRows.length > 0 ? Object.keys(parsedRows[0]).slice(0, 6) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#D5D5D5] rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E5EA] bg-[#F8F9FA]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#1473E6] flex items-center justify-center text-white shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#2C2C2C]">Batch File Ingestion (CSV / JSON)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                  Guided File Ingestion
                </span>
              </div>
              <p className="text-xs text-[#1E2229] mt-0.5">
                Upload customer files or offline event logs. The engine parses, validates XDM schema constraints, and executes deterministic identity stitching.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1E2229] hover:text-[#2C2C2C] hover:bg-[#E1E5EA] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#C5DCFA] hover:border-[#1473E6] bg-[#F2F7FE] hover:bg-[#EBF3FC] rounded-lg p-6 text-center cursor-pointer transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.json,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white border border-[#C5DCFA] flex items-center justify-center text-[#1473E6]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-[#2C2C2C]">
                  Click to select CSV or JSON file from your machine
                </p>
                <p className="text-[11px] text-[#1E2229] mt-0.5">
                  Supports standard CSV with headers (e.g. email, firstName, total_spend, consent) or JSON records array
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-[11px] bg-white border border-[#D5D5D5] px-2.5 py-1 rounded text-[#1473E6] font-semibold">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSample();
                  }}
                  className="text-[11px] font-bold text-[#1473E6] hover:underline"
                >
                  Load Sample CSV
                </button>
              </div>
            </div>
          </div>

          {/* Schema & Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded border border-[#E1E5EA]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                Target Canonical XDM Schema
              </label>
              <select
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-semibold bg-white text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
              >
                <option value="xdm_individual_profile">XDM Individual Profile (Customer 360)</option>
                <option value="xdm_experience_event">XDM Experience Event (Transactions)</option>
                {schemas.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                Primary Identity Key Field
              </label>
              <div className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-mono font-bold bg-white text-[#2C2C2C]">
                customer_email (Auto-Detected Primary Key)
              </div>
            </div>
          </div>

          {/* Parsed Records Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <Table className="w-4 h-4 text-[#1473E6]" />
                <span>Parsed File Records ({parsedRows.length} detected)</span>
              </h4>
              <span className="text-[11px] text-[#1E2229]">Showing top preview records</span>
            </div>

            <div className="border border-[#E1E5EA] rounded overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#F2F4F7] text-[#1E2229] font-bold border-b border-[#E1E5EA]">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="p-2 border-r border-[#E1E5EA] last:border-r-0 uppercase text-[9px] tracking-wider font-mono">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5EA]">
                  {parsedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#F8F9FA]">
                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className="p-2 font-mono text-[#2C2C2C] border-r border-[#E1E5EA] last:border-r-0 truncate max-w-[140px]">
                          {typeof row[col] === 'boolean' ? (row[col] ? 'TRUE' : 'FALSE') : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Success Result Banner */}
          {ingestionResult.status === 'success' && (
            <div className="p-3.5 bg-[#DEFBE6] border border-[#B4F0C3] rounded flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E7A36] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-[#0E7A36]">{ingestionResult.message}</p>
                <p className="text-[11px] text-[#1A1D23] mt-0.5">
                  Records have been unified into the Profile Graph and are immediately accessible in Customer 360 Profiles.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E1E5EA] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[#1E2229] hover:text-[#2C2C2C] font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExecuteIngest}
              disabled={isProcessing || parsedRows.length === 0}
              className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded shadow-2xs transition-all flex items-center space-x-1.5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting {parsedRows.length} Records...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ingest {parsedRows.length} Records to CDP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
