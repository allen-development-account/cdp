import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { DataDistillerQuery, QueryTemplate } from '../../types/cdp';
import {
  Code,
  Play,
  Copy,
  Check,
  Download,
  Layers,
  Clock,
  HardDrive,
  Cpu,
  FileCode,
  Sparkles,
  Database,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const DataDistillerView: React.FC = () => {
  const { queries, queryTemplates, runDataDistillerQuery, createAudienceFromQuery, addTerminalLog } = useCDP();
  
  const [activeTemplate, setActiveTemplate] = useState<QueryTemplate>(queryTemplates[0]);
  const [sqlCode, setSqlCode] = useState<string>(queryTemplates[0].sql);
  const [currentQuery, setCurrentQuery] = useState<DataDistillerQuery>(queries[0]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [audienceModalOpen, setAudienceModalOpen] = useState<boolean>(false);
  const [audienceName, setAudienceName] = useState<string>('Champions RFM VIP Cohort');

  const handleSelectTemplate = (tmpl: QueryTemplate) => {
    setActiveTemplate(tmpl);
    setSqlCode(tmpl.sql);
  };

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runDataDistillerQuery(sqlCode, activeTemplate?.name || 'Custom SQL Execution');
      setCurrentQuery(res);
      setIsRunning(false);
    }, 450);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAudience = () => {
    if (!audienceName.trim()) return;
    createAudienceFromQuery(currentQuery.id, audienceName);
    setAudienceModalOpen(false);
  };

  const handleExportCsv = () => {
    if (!currentQuery.resultRows.length) return;
    const header = currentQuery.columns.join(',');
    const rows = currentQuery.resultRows.map(r =>
      currentQuery.columns.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_distiller_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <PageBackButton fallbackTab="hub_data_science" fallbackLabel="Data Science & Query" className="mt-0.5 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Code className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Data Distiller &amp; SQL Query Service</h2>
              <span className="text-xs font-medium text-blue-100 whitespace-nowrap shrink-0">
                &middot; XLR8 Query Service
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1.5 max-w-2xl leading-relaxed">
              Execute low-latency ANSI SQL queries directly against raw ExperienceEvents and unified XDM datasets. Generate calculated metrics and dynamic audiences.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            disabled={!currentQuery.resultRows.length}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-white/25 shadow-2xs transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            title="Export query results to CSV"
          >
            <Download className="w-4 h-4 text-blue-100 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setAudienceModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-white/25 shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-100 shrink-0" />
            <span>Save as Audience</span>
          </button>

          <button
            onClick={handleRunQuery}
            disabled={isRunning}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#0D66D0] shrink-0" />
                <span>Execute SQL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Query Templates Catalog */}
        <div className="lg:col-span-4 bg-[#FFFFFF] rounded border border-[#E1E5EA] p-4 flex flex-col overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
            <h3 className="text-xs font-bold text-[#2C2C2C] uppercase tracking-wider flex items-center space-x-1.5">
              <FileCode className="w-4 h-4 text-[#1473E6]" />
              <span>Enterprise Query Templates</span>
            </h3>
            <span className="text-[10px] text-[#1E2229] font-mono">XDM ANSI-SQL</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {queryTemplates.map((tmpl) => {
              const isSelected = activeTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-3 rounded border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#EBF3FC] border-[#1473E6] shadow-2xs'
                      : 'bg-[#FFFFFF] border-[#E1E5EA] hover:bg-[#F2F4F7]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2C2C2C]">{tmpl.name}</span>
                    <span className="text-[10px] bg-[#F2F4F7] border border-[#E1E5EA] text-[#1E2229] font-semibold px-2 py-0.5 rounded">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1E2229] mt-1 leading-relaxed">{tmpl.description}</p>
                </div>
              );
            })}
          </div>

          {/* Database Schema Catalog Pill */}
          <div className="mt-4 pt-3 border-t border-[#E1E5EA] bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA] text-[11px] text-[#1A1D23]">
            <div className="flex items-center space-x-1.5 font-bold text-[#2C2C2C] mb-1">
              <Database className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Queryable XDM Datasets:</span>
            </div>
            <div className="space-y-1 font-mono text-[10px] text-[#1E2229]">
              <p>• xdm_individual_profile (14.8M rows)</p>
              <p>• xdm_experience_events (24.2M events)</p>
              <p>• xdm_b2b_accounts (4 accounts)</p>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Result Table */}
        <div className="lg:col-span-8 flex flex-col space-y-4 overflow-hidden">
          {/* SQL Editor Tile */}
          <div className="bg-[#1E1E1E] rounded border border-[#333333] flex flex-col overflow-hidden shadow-2xs h-64 shrink-0">
            <div className="bg-[#181818] px-4 py-2 border-b border-[#333333] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#E34850]" />
                <span className="w-2 h-2 rounded-full bg-[#E5B500]" />
                <span className="w-2 h-2 rounded-full bg-[#2D9D78]" />
                <span className="text-xs text-[#959595] font-mono ml-2 font-semibold">sql_query_editor.xdm.sql</span>
              </div>

              <button
                onClick={handleCopySql}
                className="flex items-center space-x-1 text-[#B5B5B5] hover:text-white text-xs font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2D9D78]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              value={sqlCode}
              onChange={(e) => setSqlCode(e.target.value)}
              className="flex-1 bg-[#1E1E1E] text-[#E0E0E0] font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed select-text"
              spellCheck={false}
            />
          </div>

          {/* Query Results & Telemetry Tile */}
          <div className="flex-1 bg-[#FFFFFF] rounded border border-[#E1E5EA] flex flex-col overflow-hidden shadow-2xs min-h-0">
            {/* Telemetry Strip */}
            <div className="bg-[#F2F4F7] px-4 py-2 border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 text-[#1E2229]">
                  <Clock className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Execution: <strong className="text-[#2C2C2C] font-mono">{currentQuery.executionTimeMs}ms</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-[#1E2229]">
                  <Cpu className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Rows Scanned: <strong className="text-[#2C2C2C] font-mono">{currentQuery.rowsScanned.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-[#1E2229]">
                  <HardDrive className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Data Processed: <strong className="text-[#2C2C2C] font-mono">{currentQuery.bytesProcessed}</strong></span>
                </div>
              </div>

              <span className="text-[10px] bg-[#DEFBE6] text-[#0E7A36] font-bold px-2 py-0.5 rounded border border-[#A1ECC4] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>QUERY OK (ANSI-92)</span>
              </span>
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F2F4F7] border-b border-[#E1E5EA] text-[#1E2229] font-semibold sticky top-0">
                    {currentQuery.columns.map((col, idx) => (
                      <th key={idx} className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5EA]">
                  {currentQuery.resultRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-[#F2F4F7] transition-colors">
                      {currentQuery.columns.map((col, colIdx) => (
                        <td key={colIdx} className="py-2 px-3 text-[#2C2C2C] whitespace-nowrap font-mono text-[11px]">
                          {String(row[col] ?? '—')}
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

      {/* Save Audience Modal */}
      {audienceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-md w-full border border-[#E1E5EA] shadow-xl p-6">
            <h3 className="text-base font-bold text-[#2C2C2C]">Publish Query Result as Live Audience</h3>
            <p className="text-xs text-[#1E2229] mt-1">
              Creates a dynamic real-time audience segment evaluated continuously against this Data Distiller query specification.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Audience Segment Name</label>
                <input
                  type="text"
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E1E5EA] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#EBF3FC] rounded border border-[#C5DCFA] text-xs text-[#1473E6]">
                <span className="font-bold">Targetable Profile Count:</span> {currentQuery.resultRows.length} qualifying profiles in active query snapshot.
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setAudienceModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#2C2C2C] border border-[#E1E5EA] font-semibold rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAudience}
                className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded text-xs shadow-2xs"
              >
                Create Audience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
