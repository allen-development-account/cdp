import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { DatabricksQueryResult } from '../../types/cdp';
import {
  Database,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layers,
  Terminal,
  Download,
  ShoppingBag,
  Plug,
  ShieldCheck,
  Table2,
  Clock,
  Activity,
  X,
  Unplug
} from 'lucide-react';

const PRESET_QUERIES = [
  {
    label: 'Bronze: Recent Storefront Events',
    sql: `SELECT event_timestamp, event_type, customer_email, product_name, cart_total, order_total, abandon_reason
FROM xlr8_cdp.ecommerce_lakehouse.bronze_ecommerce_events
ORDER BY event_timestamp DESC
LIMIT 25;`
  },
  {
    label: 'Gold: Abandoned Cart Funnel',
    sql: `SELECT profile_id, customer_email, unified_name, add_to_cart_events, cart_abandoned_events, purchase_events, abandoned_cart_value, cart_status, recovery_priority
FROM xlr8_cdp.ecommerce_lakehouse.gold_cart_abandonment_marts
ORDER BY abandoned_cart_value DESC
LIMIT 25;`
  },
  {
    label: 'Silver: Unified Customer Profiles',
    sql: `SELECT profile_id, unified_name, primary_email, customer_tier, total_spend, active_cart_value, abandoned_cart_count, predicted_ltv
FROM xlr8_cdp.ecommerce_lakehouse.silver_unified_profiles
ORDER BY total_spend DESC
LIMIT 25;`
  },
  {
    label: 'Aggregate: Events by Type',
    sql: `SELECT event_type, COUNT(*) AS event_count, SUM(cart_total) AS total_cart_value, SUM(order_total) AS total_revenue
FROM xlr8_cdp.ecommerce_lakehouse.bronze_ecommerce_events
GROUP BY event_type
ORDER BY event_count DESC;`
  },
  {
    label: 'SHOW TABLES',
    sql: `SHOW TABLES;`
  }
];

export const DatabricksWarehouseView: React.FC = () => {
  const {
    databricksStatus,
    refreshDatabricksStatus,
    connectDatabricks,
    disconnectDatabricks,
    runDatabricksSql,
    syncDatabricksNow,
    setActiveTab
  } = useCDP();

  const [sqlInput, setSqlInput] = useState<string>(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<DatabricksQueryResult | null>(null);
  const [isRunningSql, setIsRunningSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState<string>('bronze_ecommerce_events');

  // Connect Cloud Workspace modal
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [hostInput, setHostInput] = useState(databricksStatus?.host || 'https://dbc-xxxxxxxx-xxxx.cloud.databricks.com');
  const [httpPathInput, setHttpPathInput] = useState(databricksStatus?.httpPath || '/sql/1.0/warehouses/');
  const [catalogInput, setCatalogInput] = useState(databricksStatus?.catalog || 'xlr8_cdp');
  const [schemaInput, setSchemaInput] = useState(databricksStatus?.schema || 'ecommerce_lakehouse');
  const [tokenInput, setTokenInput] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleRunSql = async (sqlToExecute?: string) => {
    const targetSql = sqlToExecute ?? sqlInput;
    if (!targetSql.trim()) return;
    setIsRunningSql(true);
    try {
      const result = await runDatabricksSql(targetSql);
      setQueryResult(result);
    } finally {
      setIsRunningSql(false);
    }
  };

  const handleSelectTable = (tableName: string) => {
    setSelectedTableName(tableName);
    const catalog = databricksStatus?.catalog || 'xlr8_cdp';
    const schema = databricksStatus?.schema || 'ecommerce_lakehouse';
    const nextSql = `SELECT *\nFROM ${catalog}.${schema}.${tableName}\nLIMIT 25;`;
    setSqlInput(nextSql);
    handleRunSql(nextSql);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await syncDatabricksNow();
      await refreshDatabricksStatus();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setIsConnecting(true);
    try {
      await connectDatabricks({
        host: hostInput,
        httpPath: httpPathInput,
        token: tokenInput || undefined,
        catalog: catalogInput,
        schema: schemaInput
      });
      setTokenInput('');
      setIsConnectOpen(false);
    } catch (err: any) {
      setConnectError(err?.message || 'Unable to verify Databricks SQL Warehouse credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleExportCsv = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const header = cols.join(',');
    const lines = queryResult.rows.map((r) =>
      cols.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `databricks_${selectedTableName}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tables = databricksStatus?.tables || [];
  const activeTable = tables.find((t) => t.tableName === selectedTableName) || tables[0];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto overflow-y-auto h-full text-[#1E2229]">
      <PageBackButton />

      {/* Header Strip */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] p-5 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Databricks Unity Catalog &amp; Delta Lakehouse</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-sky-100">
                {databricksStatus?.mode === 'live_cloud' ? 'Live Cloud SQL Warehouse Connected' : 'Local Delta Lakehouse Active'}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Catalog: <span className="font-mono text-white font-semibold">{databricksStatus?.catalog || 'xlr8_cdp'}.{databricksStatus?.schema || 'ecommerce_lakehouse'}</span> · Real-time medallion tables updated on every e-commerce stream event.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ecommerce_store')}
            className="px-3.5 py-2 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#1473E6]" />
            <span>Open Live Storefront</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg border border-white/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync CDP Snapshot</span>
          </button>

          {databricksStatus?.mode === 'live_cloud' ? (
            <button
              onClick={() => disconnectDatabricks()}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg border border-white/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Unplug className="w-3.5 h-3.5" />
              <span>Disconnect Cloud</span>
            </button>
          ) : (
            <button
              onClick={() => setIsConnectOpen(true)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg border border-white/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plug className="w-3.5 h-3.5" />
              <span>Connect Cloud Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E1E5EA] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#64748B]">Bronze Stream Rows</span>
          <div className="text-2xl font-mono font-bold text-[#1473E6] mt-1">
            {(databricksStatus?.totalEventsStreamed ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#475569]">Raw e-commerce events</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E5EA] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#64748B]">Silver Unified Profiles</span>
          <div className="text-2xl font-mono font-bold text-[#0284C7] mt-1">
            {(databricksStatus?.totalProfilesMerged ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#475569]">Identity-stitched profiles</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E5EA] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#64748B]">Abandoned Cart Events</span>
          <div className="text-2xl font-mono font-bold text-[#0A3D82] mt-1">
            {(databricksStatus?.totalCartAbandonments ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#475569]">Tracked in Gold funnel mart</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1E5EA] shadow-xs">
          <span className="text-[11px] font-bold uppercase text-[#64748B]">Captured Order Revenue</span>
          <div className="text-2xl font-mono font-bold text-[#0369A1] mt-1">
            ${(databricksStatus?.totalRevenueCaptured ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#475569]">Verified Purchase Delta rows</span>
        </div>
      </div>

      {/* Medallion Delta Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tables.map((tbl) => {
          const isSelected = tbl.tableName === selectedTableName;
          return (
            <button
              key={tbl.tableName}
              onClick={() => handleSelectTable(tbl.tableName)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#EFF6FF] border-[#1473E6] shadow-sm'
                  : 'bg-white border-[#E1E5EA] hover:border-[#93C5FD]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gradient-to-r from-[#1473E6] to-[#0284C7] text-white">
                  {tbl.layer} Delta
                </span>
                <span className="text-xs font-mono font-bold text-[#0A3D82]">{tbl.rowCount.toLocaleString()} rows</span>
              </div>
              <h3 className="text-sm font-bold text-[#1E2229] flex items-center gap-1.5">
                <Table2 className="w-4 h-4 text-[#1473E6]" />
                <span className="font-mono">{tbl.tableName}</span>
              </h3>
              <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">{tbl.description}</p>
              <div className="mt-3 pt-2 border-t border-[#E1E5EA] flex items-center justify-between text-[10px] font-mono text-[#0369A1]">
                <span>{tbl.columns.length} columns</span>
                <span className="font-bold">Click to Query →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Delta SQL Console + Schema Explorer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#E1E5EA] shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-sky-200" />
              <h3 className="text-sm font-bold">Databricks Delta SQL Warehouse Runner</h3>
            </div>
            <span className="text-[11px] font-mono text-blue-100">
              {databricksStatus?.mode === 'live_cloud' ? databricksStatus.host : 'Engine: Local Delta SQL Cache'}
            </span>
          </div>

          <div className="p-5 space-y-4">
            {/* Preset Query Pills */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_QUERIES.map((q) => (
                <button
                  key={q.label}
                  onClick={() => {
                    setSqlInput(q.sql);
                    handleRunSql(q.sql);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0D66D0] border border-[#BFDBFE] text-[11px] font-semibold cursor-pointer transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              className="w-full bg-[#0F172A] text-sky-100 font-mono text-xs p-3.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#38BDF8]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-[#475569] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1473E6]" />
                <span>Queries run server-side against {databricksStatus?.mode === 'live_cloud' ? 'Databricks SQL Statement Execution API v2.0' : 'the persistent Delta Lakehouse store'}.</span>
              </div>

              <button
                onClick={() => handleRunSql()}
                disabled={isRunningSql}
                className="px-4 py-2 bg-gradient-to-r from-[#1473E6] to-[#0A3D82] hover:from-[#0D66D0] hover:to-[#082E63] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningSql ? 'Executing...' : 'Run Delta SQL'}</span>
              </button>
            </div>

            {queryResult && (
              <div className="pt-3 border-t border-[#E1E5EA] space-y-2.5">
                {!queryResult.success ? (
                  <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] text-xs text-[#0A3D82] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#1473E6] shrink-0" />
                    <span>{queryResult.message}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1E2229]">
                          Returned {queryResult.rowCount} rows
                        </span>
                        {queryResult.rows.length > 0 && (
                          <button
                            onClick={handleExportCsv}
                            className="text-[11px] font-bold text-[#1473E6] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                        {queryResult.executionTimeMs}ms · {queryResult.bytesScanned} · ID: {queryResult.statementId}
                      </span>
                    </div>

                    {queryResult.rows.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg border border-[#E1E5EA]">
                        No Delta rows match this query yet. Open the Live Storefront to stream customer events in real time!
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-[#E1E5EA] rounded-lg max-h-96">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-[#F2F4F7] text-[#1E2229] border-b border-[#E1E5EA] sticky top-0">
                            <tr>
                              {queryResult.columns.map((col) => (
                                <th key={col} className="p-2.5 whitespace-nowrap font-bold">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E1E5EA]">
                            {queryResult.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-[#F8FAFC]">
                                {queryResult.columns.map((col) => (
                                  <td key={col} className="p-2.5 whitespace-nowrap text-[#1E2229]">
                                    {typeof row[col] === 'boolean' ? (row[col] ? 'true' : 'false') : String(row[col] ?? '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Table Schema + Real-Time Sync Audit Trail */}
        <div className="xl:col-span-4 space-y-4">
          {activeTable && (
            <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1473E6]" />
                  <h4 className="text-xs font-bold font-mono text-[#1E2229]">{activeTable.tableName}</h4>
                </div>
                <span className="text-[10px] font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                  {activeTable.layer} Schema
                </span>
              </div>
              <div className="divide-y divide-[#E1E5EA] max-h-64 overflow-y-auto">
                {activeTable.columns.map((col) => (
                  <div key={col.name} className="px-4 py-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-[#1E2229]">{col.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#1473E6]">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1473E6]" />
                <h4 className="text-xs font-bold text-[#1E2229]">Delta Lakehouse Sync Log</h4>
              </div>
              <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
            </div>

            <div className="divide-y divide-[#E1E5EA] max-h-72 overflow-y-auto">
              {(databricksStatus?.recentSyncLogs || []).length === 0 ? (
                <div className="p-5 text-center text-xs text-[#64748B]">
                  No Delta writes recorded yet.
                </div>
              ) : (
                databricksStatus!.recentSyncLogs.map((log) => (
                  <div key={log.id} className="p-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                        {log.operation}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">{log.latencyMs}ms</span>
                    </div>
                    <p className="text-[11px] text-[#1E2229] font-medium">{log.message}</p>
                    <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between">
                      <span className="truncate max-w-[180px]">{log.targetTable}</span>
                      <span className="text-[#1473E6] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> {log.rowsAffected} rows
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connect Live Databricks Cloud Workspace Modal */}
      {isConnectOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-base font-bold text-[#1E2229]">Connect Live Databricks SQL Warehouse</h3>
              </div>
              <button onClick={() => setIsConnectOpen(false)} className="text-[#475569] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#475569]">
              Credentials are transmitted to the server runtime only and never stored in browser storage. On handshake, XLR8 automatically bootstraps Unity Catalog Delta tables via SQL Statement Execution API v2.0.
            </p>

            {connectError && (
              <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] text-xs text-[#0A3D82] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#1473E6] shrink-0 mt-0.5" />
                <span>{connectError}</span>
              </div>
            )}

            <form onSubmit={handleConnectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1E2229] mb-1">Workspace Host URL (HTTPS)</label>
                <input
                  type="url"
                  required
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                  placeholder="https://adb-1234567890123456.7.azuredatabricks.net"
                  className="w-full p-2 border border-[#D0D7DE] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#1473E6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1E2229] mb-1">SQL Warehouse HTTP Path</label>
                <input
                  type="text"
                  required
                  value={httpPathInput}
                  onChange={(e) => setHttpPathInput(e.target.value)}
                  placeholder="/sql/1.0/warehouses/ab12cd34ef56gh78"
                  className="w-full p-2 border border-[#D0D7DE] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#1473E6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E2229] mb-1">Unity Catalog</label>
                  <input
                    type="text"
                    required
                    value={catalogInput}
                    onChange={(e) => setCatalogInput(e.target.value)}
                    className="w-full p-2 border border-[#D0D7DE] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E2229] mb-1">Schema</label>
                  <input
                    type="text"
                    required
                    value={schemaInput}
                    onChange={(e) => setSchemaInput(e.target.value)}
                    className="w-full p-2 border border-[#D0D7DE] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#1473E6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1E2229] mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  required={!databricksStatus?.hasToken}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="dapi... (or configured via DATABRICKS_TOKEN env)"
                  className="w-full p-2 border border-[#D0D7DE] rounded-lg font-mono text-[11px] focus:outline-none focus:border-[#1473E6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectOpen(false)}
                  className="px-3.5 py-2 border border-[#D0D7DE] rounded-lg font-semibold text-[#1E2229] hover:bg-[#F2F4F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? 'Verifying & Bootstrapping...' : 'Verify & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
