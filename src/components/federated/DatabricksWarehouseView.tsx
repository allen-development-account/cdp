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
  Activity,
  X,
  Unplug,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Compass
} from 'lucide-react';

const PRESET_QUERIES = [
  {
    label: 'Recent Storefront Events (Bronze)',
    sql: `SELECT event_timestamp, event_type, customer_email, product_name, cart_total, order_total, abandon_reason
FROM xlr8_cdp.ecommerce_lakehouse.bronze_ecommerce_events
ORDER BY event_timestamp DESC
LIMIT 25;`
  },
  {
    label: 'Unified Customer Profiles (Silver)',
    sql: `SELECT profile_id, unified_name, primary_email, customer_tier, total_spend, active_cart_value, abandoned_cart_count, predicted_ltv
FROM xlr8_cdp.ecommerce_lakehouse.silver_unified_profiles
ORDER BY total_spend DESC
LIMIT 25;`
  },
  {
    label: 'Abandoned Cart Funnel (Gold)',
    sql: `SELECT profile_id, customer_email, unified_name, add_to_cart_events, cart_abandoned_events, purchase_events, abandoned_cart_value, cart_status, recovery_priority
FROM xlr8_cdp.ecommerce_lakehouse.gold_cart_abandonment_marts
ORDER BY abandoned_cart_value DESC
LIMIT 25;`
  },
  {
    label: 'Events Summary by Type',
    sql: `SELECT event_type, COUNT(*) AS event_count, SUM(cart_total) AS total_cart_value, SUM(order_total) AS total_revenue
FROM xlr8_cdp.ecommerce_lakehouse.bronze_ecommerce_events
GROUP BY event_type
ORDER BY event_count DESC;`
  },
  {
    label: 'Show Available Tables',
    sql: `SHOW TABLES;`
  }
];

type LakehouseStep = 'overview' | 'tables' | 'sql';

const LAYER_FRIENDLY_NAME: Record<string, string> = {
  Bronze: 'Step 1 · Raw Event Stream',
  Silver: 'Step 2 · Cleaned & Unified Profiles',
  Gold: 'Step 3 · Ready-to-Use Funnel Metrics'
};

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

  const [activeStep, setActiveStep] = useState<LakehouseStep>('overview');
  const [showSyncHistory, setShowSyncHistory] = useState(false);

  const [sqlInput, setSqlInput] = useState<string>(PRESET_QUERIES[0].sql);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
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

  const handleQueryTableFromBrowser = (tableName: string) => {
    setSelectedTableName(tableName);
    const catalog = databricksStatus?.catalog || 'xlr8_cdp';
    const schema = databricksStatus?.schema || 'ecommerce_lakehouse';
    const nextSql = `SELECT *\nFROM ${catalog}.${schema}.${tableName}\nLIMIT 25;`;
    setSqlInput(nextSql);
    setActiveStep('sql');
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
  const syncLogs = databricksStatus?.recentSyncLogs || [];

  const totalEvents = databricksStatus?.totalEventsStreamed ?? 0;
  const totalProfiles = databricksStatus?.totalProfilesMerged ?? 0;
  const totalAbandoned = databricksStatus?.totalCartAbandonments ?? 0;
  const totalRevenue = databricksStatus?.totalRevenueCaptured ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#1E2229]">
      {/* Clean Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <PageBackButton fallbackTab="hub_data_management" fallbackLabel="Data Management" className="shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-white truncate">
              Databricks Unity Catalog &amp; Delta Lakehouse
            </h1>
            <p className="text-xs text-blue-100 mt-0.5 truncate">
              {databricksStatus?.catalog || 'xlr8_cdp'}.{databricksStatus?.schema || 'ecommerce_lakehouse'}
              <span aria-hidden="true" className="mx-1.5">·</span>
              {databricksStatus?.mode === 'live_cloud' ? 'Live Cloud Warehouse Connected' : 'Local Delta Lakehouse Mode'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ecommerce_store')}
            className="px-4 py-2 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] font-semibold text-xs rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#1473E6]" />
            <span>Open Live Storefront</span>
          </button>

          {databricksStatus?.mode === 'live_cloud' ? (
            <button
              type="button"
              onClick={() => disconnectDatabricks()}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg border border-white/25 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Unplug className="w-3.5 h-3.5" />
              <span>Disconnect Cloud</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsConnectOpen(true)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg border border-white/25 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plug className="w-3.5 h-3.5" />
              <span>Connect Cloud Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Step Navigation Bar — Let the user pick what they want to see */}
      <div className="bg-white rounded-xl border border-[#E1E5EA] p-2 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveStep('overview')}
          className={`px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
            activeStep === 'overview'
              ? 'bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F8FAFC] text-[#1E2229]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                activeStep === 'overview'
                  ? 'bg-white text-[#0A2B60]'
                  : 'bg-[#EBF3FC] text-[#0D66D0]'
              }`}
            >
              1
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Overview &amp; Data Setup</p>
              <p className={`text-[11px] truncate ${activeStep === 'overview' ? 'text-blue-100' : 'text-[#596780]'}`}>
                Choose an action or populate data
              </p>
            </div>
          </div>
          <Compass className={`w-4 h-4 shrink-0 ${activeStep === 'overview' ? 'text-sky-200' : 'text-[#94A3B8]'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveStep('tables')}
          className={`px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
            activeStep === 'tables'
              ? 'bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F8FAFC] text-[#1E2229]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                activeStep === 'tables'
                  ? 'bg-white text-[#0A2B60]'
                  : 'bg-[#EBF3FC] text-[#0D66D0]'
              }`}
            >
              2
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Tables &amp; Columns</p>
              <p className={`text-[11px] truncate ${activeStep === 'tables' ? 'text-blue-100' : 'text-[#596780]'}`}>
                Inspect Bronze, Silver &amp; Gold tables ({tables.length})
              </p>
            </div>
          </div>
          <Layers className={`w-4 h-4 shrink-0 ${activeStep === 'tables' ? 'text-sky-200' : 'text-[#94A3B8]'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveStep('sql')}
          className={`px-4 py-3 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
            activeStep === 'sql'
              ? 'bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white shadow-xs'
              : 'bg-white hover:bg-[#F8FAFC] text-[#1E2229]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                activeStep === 'sql'
                  ? 'bg-white text-[#0A2B60]'
                  : 'bg-[#EBF3FC] text-[#0D66D0]'
              }`}
            >
              3
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">SQL Query Runner</p>
              <p className={`text-[11px] truncate ${activeStep === 'sql' ? 'text-blue-100' : 'text-[#596780]'}`}>
                Run ready-made or custom Delta SQL
              </p>
            </div>
          </div>
          <Terminal className={`w-4 h-4 shrink-0 ${activeStep === 'sql' ? 'text-sky-200' : 'text-[#94A3B8]'}`} />
        </button>
      </div>

      {/* ===================================================================== */}
      {/* STEP 1: OVERVIEW & GUIDED CHOICE                                      */}
      {/* ===================================================================== */}
      {activeStep === 'overview' && (
        <div className="space-y-6">
          {/* Clean Single-Row Summary Bar */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E1E5EA]">
            <div className="p-5">
              <p className="text-xs font-semibold text-[#596780]">Bronze Stream Rows</p>
              <p className="text-2xl font-mono font-bold text-[#1473E6] mt-1 tabular-nums">
                {totalEvents.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Raw storefront events</p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-[#596780]">Silver Unified Profiles</p>
              <p className="text-2xl font-mono font-bold text-[#0284C7] mt-1 tabular-nums">
                {totalProfiles.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Identity-stitched customers</p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-[#596780]">Abandoned Cart Events</p>
              <p className="text-2xl font-mono font-bold text-[#0A3D82] mt-1 tabular-nums">
                {totalAbandoned.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Tracked in Gold funnel mart</p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-[#596780]">Captured Order Revenue</p>
              <p className="text-2xl font-mono font-bold text-[#0369A1] mt-1 tabular-nums">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">Verified purchase events</p>
            </div>
          </div>

          {/* What would you like to do? — 3 Clean Guided Cards */}
          <div className="bg-white rounded-xl border border-[#93C5FD] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white px-6 py-4 border-b border-[#071E47] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white">What would you like to explore in your Lakehouse?</h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Pick a task below so only the tools you need appear on screen.
                </p>
              </div>
              <span className="text-xs text-blue-100 font-medium shrink-0">
                {totalEvents === 0 ? 'Tip: Sync or stream sample data first' : `${totalEvents.toLocaleString()} events ready to query`}
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Option A: Populate Data */}
              <div className="rounded-xl border border-[#E1E5EA] bg-[#FFFFFF] flex flex-col justify-between overflow-hidden">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-5 py-3.5 text-white">
                  <p className="text-[11px] font-semibold text-blue-100">Option 1 · Populate Data</p>
                  <h3 className="text-sm font-bold text-white mt-0.5">Sync or Stream Live Events</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Populate Bronze, Silver, and Gold tables immediately from your existing CDP profiles, or open the storefront to stream live shopping actions.
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSyncAll}
                      disabled={isSyncing}
                      className="w-full px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing Snapshot...' : 'Sync CDP Snapshot Now'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ecommerce_store')}
                      className="w-full px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#0D66D0] border border-[#BFDBFE] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Open Live Storefront</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Option B: Browse Tables */}
              <div className="rounded-xl border border-[#E1E5EA] bg-[#FFFFFF] flex flex-col justify-between overflow-hidden">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-5 py-3.5 text-white">
                  <p className="text-[11px] font-semibold text-blue-100">Option 2 · Inspect Structure</p>
                  <h3 className="text-sm font-bold text-white mt-0.5">Browse Tables &amp; Columns</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs text-[#475569] leading-relaxed">
                    View how raw events flow through Bronze, Silver, and Gold Delta layers and inspect each table&apos;s column types before running queries.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveStep('tables')}
                    className="w-full px-4 py-2 bg-[#F8FAFC] hover:bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE] text-xs font-semibold rounded-lg transition-colors flex items-center justify-between whitespace-nowrap cursor-pointer"
                  >
                    <span>View {tables.length} Delta Tables</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Option C: Run SQL */}
              <div className="rounded-xl border border-[#E1E5EA] bg-[#FFFFFF] flex flex-col justify-between overflow-hidden">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] px-5 py-3.5 text-white">
                  <p className="text-[11px] font-semibold text-blue-100">Option 3 · Analyze Data</p>
                  <h3 className="text-sm font-bold text-white mt-0.5">Run Delta SQL Queries</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Use one-click starter queries or write custom SQL to inspect customer events, cart abandonments, and export results to CSV.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveStep('sql')}
                    className="w-full px-4 py-2 bg-[#F8FAFC] hover:bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE] text-xs font-semibold rounded-lg transition-colors flex items-center justify-between whitespace-nowrap cursor-pointer"
                  >
                    <span>Open SQL Query Runner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsed-by-Default Sync Activity Accordion */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSyncHistory((prev) => !prev)}
              className="w-full px-5 py-3.5 bg-white hover:bg-[#F8FAFC] flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-[#1473E6]" />
                <span className="text-xs font-bold text-[#1E2229]">Explore More · Recent Lakehouse Sync Activity</span>
                <span className="text-xs text-[#64748B] tabular-nums">({syncLogs.length} entries)</span>
              </div>
              {showSyncHistory ? (
                <ChevronDown className="w-4 h-4 text-[#64748B]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              )}
            </button>

            {showSyncHistory && (
              <div className="border-t border-[#E1E5EA] divide-y divide-[#E1E5EA] max-h-72 overflow-y-auto">
                {syncLogs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B]">
                    No Delta writes recorded yet. Click &ldquo;Sync CDP Snapshot Now&rdquo; above or stream events from the Live Storefront.
                  </div>
                ) : (
                  syncLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-[#596780]">
                          <span className="font-mono font-semibold text-[#0D66D0]">{log.operation}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono truncate">{log.targetTable}</span>
                        </div>
                        <p className="text-xs text-[#1E2229] font-medium mt-0.5">{log.message}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#64748B] shrink-0 tabular-nums">
                        <span className="text-[#1473E6] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {log.rowsAffected} rows
                        </span>
                        <span>{log.latencyMs}ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 2: FOCUSED TABLES & COLUMNS VIEW                                 */}
      {/* ===================================================================== */}
      {activeStep === 'tables' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#93C5FD] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white px-6 py-4 border-b border-[#071E47] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">Step 2 · Choose a Table to Inspect</h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Select a medallion layer on the left to review its columns, or click &ldquo;Query This Table&rdquo; to preview rows in SQL.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveStep('overview')}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
              >
                Back to Overview
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Table Selector List */}
              <div className="lg:col-span-5 space-y-3">
                {tables.map((tbl) => {
                  const isSelected = tbl.tableName === activeTable?.tableName;
                  return (
                    <button
                      key={tbl.tableName}
                      type="button"
                      onClick={() => setSelectedTableName(tbl.tableName)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#1473E6] shadow-2xs'
                          : 'bg-white border-[#E1E5EA] hover:border-[#93C5FD]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-[#0D66D0]">
                          {LAYER_FRIENDLY_NAME[tbl.layer] || `${tbl.layer} Layer`}
                        </span>
                        <span className="font-mono font-bold text-[#1E2229] tabular-nums">
                          {tbl.rowCount.toLocaleString()} rows
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Table2 className="w-4 h-4 text-[#1473E6] shrink-0" />
                        <span className="text-sm font-bold font-mono text-[#1E2229] truncate">{tbl.tableName}</span>
                      </div>
                      <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">{tbl.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Right: Selected Table Columns */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#E1E5EA] overflow-hidden">
                {activeTable ? (
                  <>
                    <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold font-mono text-[#1E2229]">{activeTable.tableName}</h3>
                        <p className="text-xs text-[#596780] mt-0.5 tabular-nums">
                          {activeTable.layer} Delta · {activeTable.columns.length} columns · {activeTable.rowCount.toLocaleString()} rows
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQueryTableFromBrowser(activeTable.tableName)}
                        className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Query This Table</span>
                      </button>
                    </div>

                    <div className="divide-y divide-[#E1E5EA] max-h-[420px] overflow-y-auto">
                      {activeTable.columns.map((col) => (
                        <div key={col.name} className="px-5 py-2.5 flex items-center justify-between text-xs hover:bg-[#F8FAFC]">
                          <span className="font-mono font-semibold text-[#1E2229]">{col.name}</span>
                          <span className="font-mono text-[11px] text-[#0D66D0]">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-[#64748B]">
                    Select a table on the left to view its schema.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 3: FOCUSED SQL QUERY RUNNER                                      */}
      {/* ===================================================================== */}
      {activeStep === 'sql' && (
        <div className="bg-white rounded-xl border border-[#93C5FD] shadow-2xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white px-6 py-4 border-b border-[#071E47] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Step 3 · Delta SQL Query Runner</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Pick a starter query from the dropdown or edit the SQL below, then click Run Delta SQL.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveStep('overview')}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Back to Overview
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Simple Dropdown Selector for Presets */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1 max-w-md space-y-1.5">
                <label htmlFor="preset-sql-select" className="block text-xs font-semibold text-[#1E2229]">
                  Starter Query Template
                </label>
                <select
                  id="preset-sql-select"
                  value={selectedPresetIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedPresetIndex(idx);
                    const nextSql = PRESET_QUERIES[idx].sql;
                    setSqlInput(nextSql);
                    handleRunSql(nextSql);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-[#D0D7DE] rounded-lg text-xs font-medium text-[#1E2229] focus:outline-none focus:border-[#1473E6] cursor-pointer"
                >
                  {PRESET_QUERIES.map((q, idx) => (
                    <option key={q.label} value={idx}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('tables')}
                  className="px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#1E2229] border border-[#D0D7DE] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  View Table Columns
                </button>
                <button
                  type="button"
                  onClick={() => handleRunSql()}
                  disabled={isRunningSql}
                  className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isRunningSql ? 'Executing...' : 'Run Delta SQL'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              className="w-full bg-[#0F172A] text-sky-100 font-mono text-xs p-4 rounded-lg border border-slate-700 focus:outline-none focus:border-[#38BDF8]"
            />

            <div className="text-[11px] text-[#596780] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1473E6] shrink-0" />
              <span>
                Queries execute server-side against {databricksStatus?.mode === 'live_cloud' ? 'Databricks SQL Statement Execution API v2.0' : 'your local Delta Lakehouse store'}.
              </span>
            </div>

            {queryResult && (
              <div className="pt-4 border-t border-[#E1E5EA] space-y-3">
                {!queryResult.success ? (
                  <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] text-xs text-[#0A3D82] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#1473E6] shrink-0" />
                    <span>{queryResult.message}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#1E2229] tabular-nums">
                          Returned {queryResult.rowCount} rows
                        </span>
                        <span className="text-[#64748B] font-mono tabular-nums">
                          {queryResult.executionTimeMs}ms · {queryResult.bytesScanned}
                        </span>
                      </div>
                      {queryResult.rows.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExportCsv}
                          className="text-xs font-semibold text-[#1473E6] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      )}
                    </div>

                    {queryResult.rows.length === 0 ? (
                      <div className="p-6 text-center space-y-3 bg-[#F8FAFC] rounded-xl border border-[#E1E5EA]">
                        <p className="text-xs font-semibold text-[#1E2229]">No rows found in this table yet</p>
                        <p className="text-xs text-[#596780]">
                          Sync your CDP snapshot or interact with the Live Storefront to populate Delta tables.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSyncAll}
                            disabled={isSyncing}
                            className="px-3.5 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            Sync CDP Snapshot
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('ecommerce_store')}
                            className="px-3.5 py-2 bg-white hover:bg-[#F2F4F7] text-[#1E2229] border border-[#D0D7DE] text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            Open Live Storefront
                          </button>
                        </div>
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
      )}

      {/* Connect Live Databricks Cloud Workspace Modal */}
      {isConnectOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-base font-bold text-[#1E2229]">Connect Live Databricks SQL Warehouse</h3>
              </div>
              <button type="button" onClick={() => setIsConnectOpen(false)} className="text-[#475569] cursor-pointer">
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
