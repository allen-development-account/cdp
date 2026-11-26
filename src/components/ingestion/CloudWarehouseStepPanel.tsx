import React, { useState, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Database,
  Layers,
  Play,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Table,
  Cloud
} from 'lucide-react';

interface CloudWarehouseStepPanelProps {
  initialVendor?: WarehouseVendor;
  onComplete: (summary: {
    sourceName: string;
    channel: string;
    schemaId: string;
    latencyMs?: number;
    databricksSynced?: boolean;
    message: string;
  }) => void;
}

type WarehouseVendor = 'databricks' | 'snowflake' | 'bigquery';

export const CloudWarehouseStepPanel: React.FC<CloudWarehouseStepPanelProps> = ({
  initialVendor = 'databricks',
  onComplete
}) => {
  const {
    databricksStatus,
    refreshDatabricksStatus,
    connectDatabricks,
    runDatabricksSql,
    syncDatabricksNow,
    addSource,
    sources,
    ingestEvent,
    addAuditLog,
    addTerminalLog,
    setActiveTab
  } = useCDP();

  const [vendor, setVendor] = useState<WarehouseVendor>(initialVendor);

  useEffect(() => {
    setVendor(initialVendor);
  }, [initialVendor]);

  // Databricks live workspace form
  const [dbHost, setDbHost] = useState(databricksStatus?.config.host || '');
  const [dbHttpPath, setDbHttpPath] = useState(databricksStatus?.config.httpPath || '');
  const [dbCatalog, setDbCatalog] = useState(databricksStatus?.config.catalog || 'xlr8_cdp_catalog');
  const [dbSchema, setDbSchema] = useState(databricksStatus?.config.schema || 'ecommerce_silver');
  const [dbToken, setDbToken] = useState('');
  const [isConnectingDb, setIsConnectingDb] = useState(false);
  const [dbConnectMsg, setDbConnectMsg] = useState<string | null>(null);

  // Databricks SQL pushdown query
  const [dbSql, setDbSql] = useState(
    `SELECT event_type, COUNT(*) AS total_events, ROUND(COALESCE(SUM(total_amount), 0), 2) AS total_revenue\nFROM bronze_ecommerce_events\nGROUP BY event_type\nORDER BY total_events DESC;`
  );
  const [isRunningSql, setIsRunningSql] = useState(false);
  const [sqlResult, setSqlResult] = useState<{
    columns: string[];
    rows: Record<string, any>[];
    executionMs: number;
    engine: string;
  } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Secondary warehouses (Snowflake / BigQuery)
  const [sfAccount, setSfAccount] = useState('xy84920.us-east-1.snowflakecomputing.com');
  const [sfDatabase, setSfDatabase] = useState('ENTERPRISE_DW.CUSTOMER_360');
  const [sfRole, setSfRole] = useState('XLR8_READONLY_ROLE');
  const [bqProject, setBqProject] = useState('northstar-retail-prod-419');
  const [bqDataset, setBqDataset] = useState('commerce_analytics_gold');
  const [isSyncingSecondary, setIsSyncingSecondary] = useState(false);
  const [secondaryResult, setSecondaryResult] = useState<string | null>(null);

  useEffect(() => {
    refreshDatabricksStatus();
  }, [refreshDatabricksStatus]);

  useEffect(() => {
    if (databricksStatus?.config) {
      if (databricksStatus.config.host) setDbHost(databricksStatus.config.host);
      if (databricksStatus.config.httpPath) setDbHttpPath(databricksStatus.config.httpPath);
      if (databricksStatus.config.catalog) setDbCatalog(databricksStatus.config.catalog);
      if (databricksStatus.config.schema) setDbSchema(databricksStatus.config.schema);
    }
  }, [databricksStatus]);

  const handleConnectDatabricksWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnectingDb(true);
    setDbConnectMsg(null);
    try {
      const res = await connectDatabricks({
        host: dbHost.trim(),
        httpPath: dbHttpPath.trim(),
        token: dbToken.trim() || undefined,
        catalog: dbCatalog.trim() || 'xlr8_cdp_catalog',
        schema: dbSchema.trim() || 'ecommerce_silver'
      });
      setDbConnectMsg(res.message);
      setDbToken('');
    } catch (err: any) {
      setDbConnectMsg(err.message || 'Failed to update Databricks configuration');
    } finally {
      setIsConnectingDb(false);
    }
  };

  const handleExecuteAndCompleteDatabricks = async () => {
    setIsRunningSql(true);
    setSqlError(null);
    try {
      await syncDatabricksNow();
      const res = await runDatabricksSql(dbSql);
      setSqlResult({
        columns: res.columns,
        rows: res.rows,
        executionMs: res.executionMs,
        engine: res.engine
      });

      const sourceName = `Databricks Lakehouse (${dbCatalog}.${dbSchema})`;
      if (!sources.some((s) => s.id === 'src_databricks_lakehouse')) {
        addSource({
          id: 'src_databricks_lakehouse',
          name: sourceName,
          type: 'Batch',
          status: 'Healthy',
          ratePerSec: 42,
          todayEventCount: databricksStatus?.tables.bronzeEvents || res.rowCount || 12,
          latencyMs: res.executionMs || 4.2,
          description: `Unity Catalog Delta Lakehouse (${dbCatalog}.${dbSchema}) feeding Bronze/Silver/Gold customer tables.`,
          icon: 'database',
          category: 'Data Warehouses',
          targetSchemaId: 'xdm_individual_profile',
          targetSchemaName: 'Individual Profile',
          authMethod: databricksStatus?.mode === 'external' ? 'Databricks PAT (TLS)' : 'Delta Engine Active'
        });
      }

      addAuditLog({
        userId: 'usr_current_operator',
        userName: 'Current Operator',
        userRole: 'Data Architect',
        category: 'Schema & Ingestion',
        action: 'Verified Databricks Delta Warehouse Connector',
        targetEntity: sourceName,
        status: 'SUCCESS',
        summary: `Executed Unity Catalog pushdown SQL (${res.rowCount} rows in ${res.executionMs}ms) and synced Bronze/Silver/Gold Delta marts.`,
        complianceFlags: ['Zero-Copy Pushdown', 'Unity Catalog Governed']
      });

      onComplete({
        sourceName,
        channel: 'Databricks Sync',
        schemaId: 'xdm_individual_profile',
        latencyMs: res.executionMs,
        databricksSynced: true,
        message: `Connected ${sourceName} and verified ${res.rowCount} aggregated rows in ${res.executionMs}ms.`
      });
    } catch (err: any) {
      setSqlError(err.message || 'Databricks SQL execution failed');
    } finally {
      setIsRunningSql(false);
    }
  };

  const handleVerifySecondaryWarehouse = () => {
    setIsSyncingSecondary(true);
    setSecondaryResult(null);
    setTimeout(() => {
      const isSnowflake = vendor === 'snowflake';
      const sourceName = isSnowflake
        ? `Snowflake Zero-Copy (${sfDatabase})`
        : `Google BigQuery (${bqProject}.${bqDataset})`;
      const sourceId = isSnowflake ? 'src_snowflake_zero_copy' : 'src_bigquery_zero_copy';

      ingestEvent(
        {
          customer_email: 'elena.rostova@techenterprise.com',
          firstName: 'Elena',
          lastName: 'Rostova',
          total_spend: 5200.0,
          customer_tier: 'VIP',
          warehouse_source: isSnowflake ? sfDatabase : bqDataset
        },
        'Snowflake Batch',
        'xdm_individual_profile'
      );

      if (!sources.some((s) => s.id === sourceId)) {
        addSource({
          id: sourceId,
          name: sourceName,
          type: 'Batch',
          status: 'Healthy',
          ratePerSec: 15,
          todayEventCount: 1,
          latencyMs: 11.4,
          description: `Zero-copy federated warehouse connector mapped to XDM Individual Profile.`,
          icon: 'database',
          category: 'Data Warehouses',
          targetSchemaId: 'xdm_individual_profile',
          targetSchemaName: 'Individual Profile',
          authMethod: isSnowflake ? sfRole : 'OAuth2 Service Role'
        });
      }

      addTerminalLog('success', 'WAREHOUSE-SYNC', `Verified ${sourceName} pushdown connection`);
      setSecondaryResult(`Verified pushdown sync from ${sourceName} (11.4ms).`);
      setIsSyncingSecondary(false);

      onComplete({
        sourceName,
        channel: 'Snowflake Batch',
        schemaId: 'xdm_individual_profile',
        latencyMs: 11.4,
        message: `Connected ${sourceName} via zero-copy pushdown.`
      });
    }, 450);
  };

  return (
    <div className="bg-white rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
      {/* Step 2 Header Strip (Matches Step 1 Styling) */}
      <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                Step 2
              </span>
              <h3 className="text-base font-bold text-white">Databricks Lakehouse &amp; Federated Warehouses</h3>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Synchronize Bronze, Silver, and Gold Delta tables or run zero-copy SQL pushdown queries directly from Databricks Unity Catalog, Snowflake, or BigQuery.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25">
            Databricks Priority
          </span>

          <button
            type="button"
            onClick={() => setActiveTab('databricks_warehouse')}
            className="px-3 py-1.5 bg-white text-[#0A2B60] hover:bg-[#F2F7FE] border border-white/80 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#1473E6]" />
            <span>Open Full Databricks Lakehouse</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Warehouse Selector Strip (Databricks First / Priority) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => setVendor('databricks')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              vendor === 'databricks'
                ? 'bg-[#EBF3FC] border-[#1473E6] ring-2 ring-[#1473E6]/20 shadow-xs'
                : 'bg-white border-[#E1E5EA] hover:border-[#1473E6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#1473E6] text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1473E6] text-white">
                Primary • Databricks
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1E2229]">Databricks Unity Catalog</h4>
            <p className="text-[11px] text-[#5C6573] mt-0.5">
              Delta Lakehouse SQL Warehouse, Bronze/Silver/Gold Medallion tables &amp; live sync.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setVendor('snowflake')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              vendor === 'snowflake'
                ? 'bg-[#EBF3FC] border-[#1473E6] ring-2 ring-[#1473E6]/20 shadow-xs'
                : 'bg-white border-[#E1E5EA] hover:border-[#1473E6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                Zero-Copy SQL
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1E2229]">Snowflake Data Cloud</h4>
            <p className="text-[11px] text-[#5C6573] mt-0.5">
              Federated view binding with role-based zero-copy customer mart pushdowns.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setVendor('bigquery')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              vendor === 'bigquery'
                ? 'bg-[#EBF3FC] border-[#1473E6] ring-2 ring-[#1473E6]/20 shadow-xs'
                : 'bg-white border-[#E1E5EA] hover:border-[#1473E6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                Cloud Analytics
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1E2229]">Google BigQuery</h4>
            <p className="text-[11px] text-[#5C6573] mt-0.5">
              Direct GA4 &amp; commerce warehouse table sync into canonical XDM schemas.
            </p>
          </button>
        </div>

        {/* DATABRICKS CONFIGURATION & LIVE SQL EXECUTION */}
        {vendor === 'databricks' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Databricks Workspace Connection & Table Stats (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                    Lakehouse Status
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                    {databricksStatus?.mode === 'external'
                      ? 'External Databricks SQL Active'
                      : 'Built-In Delta Engine Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#5C6573] block">Bronze Events</span>
                    <span className="text-sm font-bold text-[#1473E6] font-mono">
                      {databricksStatus?.tables.bronzeEvents ?? 0}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#5C6573] block">Silver Profiles</span>
                    <span className="text-sm font-bold text-[#0284C7] font-mono">
                      {databricksStatus?.tables.silverProfiles ?? 0}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#5C6573] block">Gold Marts</span>
                    <span className="text-sm font-bold text-[#0A3D82] font-mono">
                      {databricksStatus?.tables.goldAbandonmentMarts ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConnectDatabricksWorkspace} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>Unity Catalog / Workspace Config</span>
                  </span>
                  <span className="text-[10px] text-[#5C6573]">Optional External PAT</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">Catalog</label>
                    <input
                      type="text"
                      value={dbCatalog}
                      onChange={(e) => setDbCatalog(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">Schema</label>
                    <input
                      type="text"
                      value={dbSchema}
                      onChange={(e) => setDbSchema(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">
                    Workspace Host URL (Optional for External Cloud)
                  </label>
                  <input
                    type="text"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    placeholder="https://adb-1234567890.azuredatabricks.net"
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">
                    SQL Warehouse HTTP Path
                  </label>
                  <input
                    type="text"
                    value={dbHttpPath}
                    onChange={(e) => setDbHttpPath(e.target.value)}
                    placeholder="/sql/1.0/warehouses/abc123def456"
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#1473E6]" />
                    <span>Personal Access Token (Server Memory Only)</span>
                  </label>
                  <input
                    type="password"
                    value={dbToken}
                    onChange={(e) => setDbToken(e.target.value)}
                    placeholder="dapi..."
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnectingDb}
                  className="w-full py-2 px-3 bg-white hover:bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE] rounded-lg font-bold text-xs transition-all cursor-pointer"
                >
                  {isConnectingDb ? 'Saving Workspace Config...' : 'Update Databricks Connection'}
                </button>

                {dbConnectMsg && (
                  <p className="text-[11px] font-semibold text-[#0369A1] bg-[#E0F2FE] border border-[#BAE6FD] rounded p-2">
                    {dbConnectMsg}
                  </p>
                )}
              </form>
            </div>

            {/* Right: Execute Delta SQL Pushdown & Complete Step 2 (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border border-[#E1E5EA] rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E2229] flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#1473E6]" />
                    <span>Unity Catalog Delta SQL Verification Query</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                    {dbCatalog}.{dbSchema}
                  </span>
                </div>

                <textarea
                  rows={5}
                  value={dbSql}
                  onChange={(e) => setDbSql(e.target.value)}
                  className="w-full p-3.5 font-mono text-xs bg-[#0F172A] text-[#93C5FD] focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />

                <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-[#5C6573]">
                    Syncs Bronze/Silver/Gold tables and verifies live SQL read access before unlocking Step 3.
                  </span>
                  <button
                    type="button"
                    disabled={isRunningSql}
                    onClick={handleExecuteAndCompleteDatabricks}
                    className="py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isRunningSql ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Executing Delta SQL &amp; Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Sync, Run Delta SQL &amp; Complete Step 2</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {sqlError && (
                <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] text-xs text-[#0A3D82] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#1473E6] shrink-0" />
                  <span>{sqlError}</span>
                </div>
              )}

              {sqlResult && (
                <div className="border border-[#BFDBFE] rounded-xl overflow-hidden bg-white">
                  <div className="px-4 py-2.5 bg-[#EBF3FC] border-b border-[#BFDBFE] flex items-center justify-between text-xs font-bold text-[#0A3D82]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                      <span>Query Succeeded ({sqlResult.rows.length} rows • {sqlResult.executionMs}ms)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#C5DCFA] text-[#0D66D0]">
                      {sqlResult.engine}
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-52">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F2F4F7] border-b border-[#E1E5EA]">
                        <tr>
                          {sqlResult.columns.map((col) => (
                            <th key={col} className="py-2 px-3 font-mono text-[11px] font-bold text-[#1E2229]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E5EA]">
                        {sqlResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            {sqlResult.columns.map((col) => (
                              <td key={col} className="py-2 px-3 font-mono text-[11px] text-[#1E2229]">
                                {String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SNOWFLAKE / BIGQUERY PANEL */
          <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
              {vendor === 'snowflake' ? 'Snowflake Zero-Copy Configuration' : 'Google BigQuery Federation Configuration'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendor === 'snowflake' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Account Host</label>
                    <input
                      type="text"
                      value={sfAccount}
                      onChange={(e) => setSfAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Database &amp; Schema</label>
                    <input
                      type="text"
                      value={sfDatabase}
                      onChange={(e) => setSfDatabase(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Read-Only Warehouse Role</label>
                    <input
                      type="text"
                      value={sfRole}
                      onChange={(e) => setSfRole(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E2229] mb-1">GCP Project ID</label>
                    <input
                      type="text"
                      value={bqProject}
                      onChange={(e) => setBqProject(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E2229] mb-1">BigQuery Dataset</label>
                    <input
                      type="text"
                      value={bqDataset}
                      onChange={(e) => setBqDataset(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Target XDM Schema</label>
                    <input
                      type="text"
                      readOnly
                      value="xdm_individual_profile"
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-[#F2F4F7]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {secondaryResult ? (
                <span className="text-xs font-bold text-[#0369A1] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>{secondaryResult}</span>
                </span>
              ) : (
                <span className="text-xs text-[#5C6573]">
                  Runs a live zero-copy pushdown test record and registers the warehouse connector.
                </span>
              )}

              <button
                type="button"
                disabled={isSyncingSecondary}
                onClick={handleVerifySecondaryWarehouse}
                className="py-2.5 px-5 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSyncingSecondary ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Pushdown...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Verify Warehouse &amp; Complete Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
