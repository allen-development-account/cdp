import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  Server,
  Database,
  Layers,
  Zap,
  Play,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  ArrowRight,
  Filter,
  DollarSign,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  ShieldCheck,
  Send,
  Sliders,
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';
import { WarehouseConnection, FederatedComposition, WarehouseType, CompositionNode } from '../../types/cdp';

export const FederatedCompositionView: React.FC = () => {
  const {
    warehouses,
    federatedCompositions,
    addWarehouseConnection,
    deleteWarehouseConnection,
    testWarehouseConnection,
    saveFederatedComposition,
    deleteFederatedComposition,
    executeZeroCopyPushdown,
    destinations,
    audiences
  } = useCDP();

  const [activeSubTab, setActiveSubTab] = useState<'compositions' | 'warehouses' | 'sql_console' | 'reverse_etl'>('compositions');
  const [selectedCompositionId, setSelectedCompositionId] = useState<string>(
    federatedCompositions[0]?.id || ''
  );
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [testingWarehouseId, setTestingWarehouseId] = useState<string | null>(null);
  const [executingCompositionId, setExecutingCompositionId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    compositionName: string;
    rowCount: number;
    executionTimeMs: number;
    bytesScanned: string;
    costDollars: number;
  } | null>(null);

  // SQL Console state
  const [consoleWarehouseId, setConsoleWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [consoleSql, setConsoleSql] = useState<string>(`SELECT 
    p.CUSTOMER_CRM_ID,
    p.NET_REVENUE,
    p.PRODUCT_CATEGORY,
    ltv.HISTORICAL_LIFETIME_VALUE,
    ltv.MARGIN_TIER
FROM ENTERPRISE_DW.ANALYTICS_MARTS.FACT_HISTORICAL_ORDERS p
JOIN ENTERPRISE_DW.ANALYTICS_MARTS.DIM_CUSTOMER_LTV_MODELS ltv
    ON p.CUSTOMER_CRM_ID = ltv.EMAIL_HASH_SHA256
WHERE ltv.HISTORICAL_LIFETIME_VALUE > 10000
ORDER BY p.NET_REVENUE DESC
LIMIT 50;`);
  const [isConsoleRunning, setIsConsoleRunning] = useState(false);
  const [consoleResult, setConsoleResult] = useState<any[] | null>(null);

  // New Connection Form state
  const [newConnName, setNewConnName] = useState('');
  const [newConnType, setNewConnType] = useState<WarehouseType>('Snowflake');
  const [newConnHost, setNewConnHost] = useState('');
  const [newConnDb, setNewConnDb] = useState('');
  const [newConnSchema, setNewConnSchema] = useState('');
  const [newConnWarehouseSize, setNewConnWarehouseSize] = useState('X-SMALL');

  // New Composition Form state
  const [newCompName, setNewCompName] = useState('');
  const [newCompDesc, setNewCompDesc] = useState('');
  const [newCompWarehouseId, setNewCompWarehouseId] = useState(warehouses[0]?.id || '');
  const [newCompSchedule, setNewCompSchedule] = useState<FederatedComposition['schedule']>('Continuous Zero-Copy');

  const selectedComposition = federatedCompositions.find(c => c.id === selectedCompositionId) || federatedCompositions[0];

  const handleTestConnection = (id: string) => {
    setTestingWarehouseId(id);
    setTimeout(() => {
      testWarehouseConnection(id);
      setTestingWarehouseId(null);
    }, 450);
  };

  const handleExecutePushdown = (comp: FederatedComposition) => {
    setExecutingCompositionId(comp.id);
    setTimeout(() => {
      const res = executeZeroCopyPushdown(comp.id);
      setExecutingCompositionId(null);
      setExecutionResult({
        compositionName: comp.name,
        ...res
      });
    }, 600);
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnName.trim() || !newConnDb.trim()) return;

    addWarehouseConnection({
      name: newConnName,
      type: newConnType,
      accountOrHost: newConnHost || `${newConnName.toLowerCase().replace(/\s+/g, '')}.enterprise.cloud`,
      database: newConnDb.toUpperCase(),
      schema: newConnSchema.toUpperCase() || 'PUBLIC',
      warehouseSize: `${newConnWarehouseSize} Auto-Scaling`,
      status: 'Connected',
      tablesCount: 8,
      zeroCopyEnabled: true,
      iconName: newConnType.toLowerCase(),
      availableTables: [
        {
          tableName: `${newConnDb.toUpperCase()}_MASTER_VIEW`,
          rowCount: 750000,
          description: 'Primary customer entity master view with zero-copy pushdown authorization.',
          columns: [
            { name: 'ACCOUNT_ID', type: 'VARCHAR(64)', isJoinKey: true, description: 'Enterprise Unique Identifier' },
            { name: 'TOTAL_REVENUE', type: 'NUMERIC(14,2)', description: 'Gross customer ledger total' },
            { name: 'STATUS', type: 'VARCHAR(24)', description: 'Active, Inactive, Pending' }
          ]
        }
      ]
    });

    setIsConnectModalOpen(false);
    setNewConnName('');
    setNewConnDb('');
    setNewConnHost('');
  };

  const handleCreateComposition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    const wh = warehouses.find(w => w.id === newCompWarehouseId) || warehouses[0];
    const created = saveFederatedComposition({
      name: newCompName,
      description: newCompDesc || 'Zero-copy federated audience composition joining warehouse analytics with real-time CDP profiles.',
      warehouseId: wh.id,
      warehouseName: wh.name,
      warehouseType: wh.type,
      status: 'Active',
      schedule: newCompSchedule,
      targetDestinations: ['dest_salesforce', 'dest_meta_ads'],
      pushdownSql: `SELECT 
    p.profile_id,
    p.email,
    wh.TOTAL_REVENUE
FROM CDP_REALTIME_PROFILES p
JOIN ${wh.database}.${wh.schema}.${wh.availableTables[0]?.tableName || 'CUSTOMER_DATA'} wh
    ON p.identifiers.email = wh.ACCOUNT_ID
WHERE wh.TOTAL_REVENUE >= 5000;`,
      nodes: [
        {
          id: 'node_src_1',
          type: 'cdp_audience',
          title: 'CDP Stream: All Unified Profiles',
          description: 'Real-time deterministic identity profiles.',
          config: { audienceId: 'aud_all_profiles' },
          outputCount: 15400,
          status: 'Ready'
        },
        {
          id: 'node_src_2',
          type: 'warehouse_source',
          title: `${wh.type}: ${wh.availableTables[0]?.tableName || 'ENTERPRISE_TABLE'}`,
          description: `Direct zero-copy connection to ${wh.name}.`,
          config: { warehouseId: wh.id, tableName: wh.availableTables[0]?.tableName },
          outputCount: wh.availableTables[0]?.rowCount || 500000,
          status: 'Ready'
        },
        {
          id: 'node_join_3',
          type: 'join_enrich',
          title: 'Zero-Copy Join on Email',
          description: 'Pushdown execution without moving underlying data.',
          config: { joinKeyWarehouse: 'ACCOUNT_ID', joinKeyCDP: 'identifiers.email' },
          outputCount: 6200,
          status: 'Ready'
        },
        {
          id: 'node_dest_4',
          type: 'destination_sync',
          title: 'Reverse ETL: Salesforce & Meta CAPI',
          description: 'Pushdown activation to destination tools.',
          config: { destinationId: 'dest_salesforce', syncCadence: 'Real-time Push' },
          outputCount: 6200,
          status: 'Ready'
        }
      ]
    });

    setIsComposeModalOpen(false);
    setSelectedCompositionId(created.id);
    setNewCompName('');
    setNewCompDesc('');
  };

  const handleRunConsoleSql = () => {
    setIsConsoleRunning(true);
    setTimeout(() => {
      setIsConsoleRunning(false);
      setConsoleResult([
        { CUSTOMER_CRM_ID: 'CRM_849201', NET_REVENUE: 48920.50, PRODUCT_CATEGORY: 'Enterprise Suite', HISTORICAL_LIFETIME_VALUE: 184500, MARGIN_TIER: 'Tier A' },
        { CUSTOMER_CRM_ID: 'CRM_193842', NET_REVENUE: 34100.00, PRODUCT_CATEGORY: 'Cloud Storage Max', HISTORICAL_LIFETIME_VALUE: 92400, MARGIN_TIER: 'Tier A' },
        { CUSTOMER_CRM_ID: 'CRM_572019', NET_REVENUE: 28450.00, PRODUCT_CATEGORY: 'AI Compute Tokens', HISTORICAL_LIFETIME_VALUE: 64200, MARGIN_TIER: 'Tier A' },
        { CUSTOMER_CRM_ID: 'CRM_902814', NET_REVENUE: 19800.75, PRODUCT_CATEGORY: 'Security Fabric Pro', HISTORICAL_LIFETIME_VALUE: 53100, MARGIN_TIER: 'Tier A' },
        { CUSTOMER_CRM_ID: 'CRM_339102', NET_REVENUE: 16500.00, PRODUCT_CATEGORY: 'Enterprise Suite', HISTORICAL_LIFETIME_VALUE: 41200, MARGIN_TIER: 'Tier B' }
      ]);
    }, 400);
  };

  const handleExportPushdownCsv = () => {
    if (!consoleResult || !consoleResult.length) return;
    const cols = Object.keys(consoleResult[0]);
    const header = cols.join(',');
    const rows = consoleResult.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `federated_pushdown_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <PageBackButton fallbackTab="hub_data_management" fallbackLabel="Data Management" className="mt-0.5 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Federated Audience Composition &amp; Zero-Copy Hub</h2>
              <span className="text-xs font-medium text-blue-100 whitespace-nowrap shrink-0">
                &middot; Composable Zero-Copy CDP
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1.5 max-w-2xl leading-relaxed">
              Build and enrich real-time audiences directly from Snowflake, Databricks, BigQuery, and Redshift without data duplication or ETL ingestion fees.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-white/25 shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className="w-4 h-4 text-blue-100 shrink-0" />
            <span>Connect Warehouse</span>
          </button>

          <button
            onClick={() => setIsComposeModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Zero-Copy Composition</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Connected Warehouses</span>
            <Database className="w-3.5 h-3.5 text-[#1473E6]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">{warehouses.length} Clouds</p>
          <span className="text-[10px] text-[#0369A1] font-semibold mt-1 block">Snowflake, Databricks, BigQuery, Redshift</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Zero-Copy Ingestion Savings</span>
            <DollarSign className="w-3.5 h-3.5 text-[#0284C7]" />
          </div>
          <p className="text-xl font-bold text-[#0369A1] mt-1 font-mono">$6,130/mo</p>
          <span className="text-[10px] text-[#1E2229] font-semibold mt-1 block">Zero Ingestion/Storage Overhead</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Pushdown Execution SLA</span>
            <Zap className="w-3.5 h-3.5 text-[#0EA5E9]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">&lt; 120ms</p>
          <span className="text-[10px] text-[#1D4ED8] font-semibold mt-1 block">Pushdown Query Optimization</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Reverse ETL Destinations</span>
            <Send className="w-3.5 h-3.5 text-[#1473E6]" />
          </div>
          <p className="text-xl font-bold text-[#1473E6] mt-1 font-mono">{destinations.length} Active</p>
          <span className="text-[10px] text-[#1473E6] font-semibold mt-1 block">Salesforce, Meta, Google, Braze</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 bg-[#E1E5EA] p-1 rounded border border-[#E1E5EA] w-fit">
        <button
          onClick={() => setActiveSubTab('compositions')}
          className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded transition-all ${
            activeSubTab === 'compositions'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs'
              : 'text-[#1E2229] hover:text-[#2C2C2C]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#1473E6]" />
          <span>Composition Studio ({federatedCompositions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded transition-all ${
            activeSubTab === 'warehouses'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs'
              : 'text-[#1E2229] hover:text-[#2C2C2C]'
          }`}
        >
          <Database className="w-4 h-4 text-[#1473E6]" />
          <span>Data Warehouses & Tables ({warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql_console')}
          className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded transition-all ${
            activeSubTab === 'sql_console'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs'
              : 'text-[#1E2229] hover:text-[#2C2C2C]'
          }`}
        >
          <Code className="w-4 h-4 text-[#1473E6]" />
          <span>Zero-Copy SQL Pushdown Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reverse_etl')}
          className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded transition-all ${
            activeSubTab === 'reverse_etl'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs'
              : 'text-[#1E2229] hover:text-[#2C2C2C]'
          }`}
        >
          <Send className="w-4 h-4 text-[#1473E6]" />
          <span>Reverse ETL & Sync Automation</span>
        </button>
      </div>

      {/* Sub-View Content */}
      {activeSubTab === 'compositions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Compositions Directory */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-4 py-3 shadow-2xs flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Federated Compositions
              </span>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded tabular-nums">
                {federatedCompositions.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {federatedCompositions.map((comp) => {
                const isSelected = comp.id === selectedComposition?.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompositionId(comp.id)}
                    className={`p-3.5 rounded border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#EBF3FC] border-[#1473E6] shadow-2xs'
                        : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#D5D5D5] hover:bg-[#F2F4F7] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                        <h3 className="text-xs font-bold text-[#2C2C2C] leading-snug line-clamp-1">
                          {comp.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-[#F2F4F7] text-[#1E2229] border border-[#E1E5EA] px-1.5 py-0.5 rounded">
                        {comp.warehouseType}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#1E2229] line-clamp-2 mt-1.5 leading-relaxed">
                      {comp.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-[#E1E5EA] flex items-center justify-between text-[10px]">
                      <span className="text-[#1E2229] font-semibold">
                        Audience: <strong className="text-[#1473E6] font-mono font-bold">{comp.estimatedAudienceSize.toLocaleString()}</strong>
                      </span>
                      <span className="text-[#0369A1] font-semibold bg-[#E0F2FE] px-1.5 py-0.5 rounded border border-[#BAE6FD]">
                        Zero-Copy
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Pipeline Canvas & Pushdown SQL */}
          <div className="lg:col-span-8 space-y-4">
            {selectedComposition ? (
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
                {/* Composition Summary Header */}
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base font-bold text-white">{selectedComposition.name}</h3>
                      <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2 py-0.5 rounded uppercase">
                        {selectedComposition.schedule}
                      </span>
                    </div>
                    <p className="text-xs text-blue-100 mt-1">{selectedComposition.description}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleExecutePushdown(selectedComposition)}
                      disabled={executingCompositionId === selectedComposition.id}
                      className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      {executingCompositionId === selectedComposition.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Pushdown Executing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-[#0D66D0]" />
                          <span>Run Pushdown Test</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteFederatedComposition(selectedComposition.id)}
                      className="p-2 bg-white/15 border border-white/25 text-white hover:text-sky-200 hover:bg-white/25 hover:border-white/40 rounded-lg transition-all cursor-pointer"
                      title="Delete Composition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-5">

                {/* Savings Banner */}
                <div className="bg-[#E0F2FE]/50 p-3.5 rounded border border-[#BAE6FD] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <DollarSign className="w-4 h-4 text-[#0284C7]" />
                    <div>
                      <span className="text-xs font-bold text-[#2C2C2C]">Zero-Copy TCO Advantage</span>
                      <p className="text-[10px] text-[#1E2229]">
                        {selectedComposition.zeroCopyCostSavings} by querying Snowflake directly without XLR8 dataset ingestion fees.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0369A1] bg-white px-2.5 py-1 rounded border border-[#BAE6FD] shadow-2xs">
                    $0.00 Ingestion Fee
                  </span>
                </div>

                {/* Visual Pipeline Nodes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                      Visual Pipeline Canvas (DAG)
                    </span>
                    <span className="text-[10px] text-[#1E2229] font-medium">
                      Executed in Snowflake/Databricks Compute
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedComposition.nodes.map((node, index) => (
                      <div key={node.id} className="relative">
                        <div className="bg-[#F2F4F7] hover:bg-[#EAEAEA] p-3.5 rounded border border-[#E1E5EA] flex items-center justify-between transition-all">
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 rounded bg-[#1473E6] flex items-center justify-center text-xs font-bold text-white shadow-2xs">
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-[#2C2C2C]">{node.title}</span>
                                <span className="text-[9px] font-bold bg-white text-[#1E2229] px-1.5 py-0.5 rounded border border-[#E1E5EA] uppercase">
                                  {node.type.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#1E2229] mt-0.5">{node.description}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-[#2C2C2C]">
                              {node.outputCount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#1E2229] block">Profiles</span>
                          </div>
                        </div>

                        {index < selectedComposition.nodes.length - 1 && (
                          <div className="h-2 flex justify-center items-center my-0.5">
                            <div className="w-0.5 h-full bg-[#E1E5EA]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pushdown SQL Editor Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                      Generated Pushdown ANSI SQL (Zero-Copy)
                    </span>
                    <span className="text-[10px] font-mono text-[#1473E6] bg-[#EBF3FC] px-2 py-0.5 rounded border border-[#C5DCFA]">
                      Optimized for {selectedComposition.warehouseType}
                    </span>
                  </div>
                  <pre className="bg-[#1E1E1E] text-[#E0E0E0] p-4 rounded text-[11px] font-mono overflow-x-auto leading-relaxed border border-[#333333]">
                    {selectedComposition.pushdownSql}
                  </pre>
                </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-8 text-center text-[#1E2229]">
                Select a federated composition to view its visual pipeline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warehouses Tab */}
      {activeSubTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-[#1473E6] flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                    {wh.type === 'Snowflake' ? '❄️' : wh.type === 'Databricks' ? '🧱' : wh.type === 'BigQuery' ? '🔍' : '☁️'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-[#2C2C2C]">{wh.name}</h3>
                      <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2 py-0.5 rounded">
                        {wh.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#1E2229] font-mono mt-0.5">{wh.accountOrHost}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleTestConnection(wh.id)}
                    disabled={testingWarehouseId === wh.id}
                    className="flex items-center space-x-1 text-xs font-semibold text-[#1473E6] hover:bg-[#EBF3FC] px-2.5 py-1.5 rounded transition-all border border-[#C5DCFA]"
                  >
                    {testingWarehouseId === wh.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    <span>Ping ({wh.lastPingMs}ms)</span>
                  </button>
                  <button
                    onClick={() => deleteWarehouseConnection(wh.id)}
                    className="p-1.5 text-[#0D66D0] hover:text-[#0A3D82] hover:bg-[#EBF3FC] rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Warehouse Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA]">
                <div>
                  <span className="text-[10px] text-[#1E2229] block uppercase font-bold">Database & Schema</span>
                  <span className="font-mono font-bold text-[#2C2C2C]">{wh.database}.{wh.schema}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#1E2229] block uppercase font-bold">Compute Size</span>
                  <span className="font-mono font-bold text-[#2C2C2C]">{wh.warehouseSize || 'Auto-Scaling'}</span>
                </div>
              </div>

              {/* Available Tables Catalog */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229] block">
                  Introspected Warehouse Tables ({wh.availableTables.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {wh.availableTables.map((tbl) => (
                    <div key={tbl.tableName} className="p-2.5 bg-[#F2F4F7] hover:bg-[#EAEAEA] rounded border border-[#E1E5EA] transition-all text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 font-mono font-bold text-[#1473E6]">
                          <Database className="w-3.5 h-3.5 text-[#1473E6]" />
                          <span>{tbl.tableName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#1E2229] font-bold">
                          {tbl.rowCount.toLocaleString()} rows
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1E2229] mt-1">{tbl.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tbl.columns.map(col => (
                          <span
                            key={col.name}
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              col.isJoinKey ? 'bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA] font-bold' : 'bg-white text-[#1E2229] border border-[#E1E5EA]'
                            }`}
                          >
                            {col.name} ({col.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SQL Console Tab */}
      {activeSubTab === 'sql_console' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Zero-Copy SQL Pushdown Console</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Execute live ANSI SQL pushdown queries against connected warehouses with instantaneous result previews and scan telemetry.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <select
                value={consoleWarehouseId}
                onChange={(e) => setConsoleWarehouseId(e.target.value)}
                className="bg-white/15 border border-white/25 text-xs font-semibold px-3 py-1.5 rounded-lg text-white focus:outline-none [&>option]:text-[#1E2229]"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                ))}
              </select>

              <button
                onClick={handleRunConsoleSql}
                disabled={isConsoleRunning}
                className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-4 py-1.5 rounded-lg shadow-2xs transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                {isConsoleRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Pushdown...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-[#0D66D0]" />
                    <span>Execute SQL (Zero-Copy)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">

          <textarea
            value={consoleSql}
            onChange={(e) => setConsoleSql(e.target.value)}
            rows={7}
            className="w-full bg-[#1E1E1E] text-[#E0E0E0] font-mono text-xs p-4 rounded border border-[#333333] focus:outline-none focus:border-[#1473E6] leading-relaxed"
          />

          {consoleResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[#2C2C2C]">Pushdown Result: {consoleResult.length} Records</span>
                  <button
                    onClick={handleExportPushdownCsv}
                    className="text-[11px] text-[#1473E6] hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>Download CSV</span>
                  </button>
                </div>
                <span className="text-[10px] text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded font-mono font-bold border border-[#BAE6FD]">
                  Latency: 118ms | Bytes Scanned: 1.4 GB ($0.00 ETL Fee)
                </span>
              </div>
              <div className="overflow-x-auto border border-[#E1E5EA] rounded">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F2F4F7] text-[#1E2229] font-semibold border-b border-[#E1E5EA]">
                    <tr>
                      <th className="p-2">CUSTOMER_CRM_ID</th>
                      <th className="p-2">NET_REVENUE</th>
                      <th className="p-2">PRODUCT_CATEGORY</th>
                      <th className="p-2">HISTORICAL_LTV</th>
                      <th className="p-2">MARGIN_TIER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {consoleResult.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F2F4F7]">
                        <td className="p-2 font-bold text-[#1473E6]">{row.CUSTOMER_CRM_ID}</td>
                        <td className="p-2 text-[#2C2C2C]">${row.NET_REVENUE.toLocaleString()}</td>
                        <td className="p-2 text-[#1E2229]">{row.PRODUCT_CATEGORY}</td>
                        <td className="p-2 font-bold text-[#0369A1]">${row.HISTORICAL_LIFETIME_VALUE.toLocaleString()}</td>
                        <td className="p-2">
                          <span className="bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#BAE6FD]">
                            {row.MARGIN_TIER}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Reverse ETL Tab */}
      {activeSubTab === 'reverse_etl' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 border-b border-[#0E4DA4]">
            <h3 className="text-sm font-bold text-white">Reverse ETL & Destination Activation Cadence</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Synchronize federated audience segments directly from warehouse pushdown outputs into advertising networks, CRM suites, and engagement platforms.
            </p>
          </div>

          <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinations.map((dest) => (
              <div key={dest.id} className="p-4 rounded border border-[#E1E5EA] bg-[#FFFFFF] shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-[#F2F4F7] border border-[#E1E5EA] flex items-center justify-center font-bold text-[#1473E6]">
                    {dest.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2C2C]">{dest.name}</h4>
                    <span className="text-[10px] text-[#1E2229]">{dest.category} • {dest.syncFrequency}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] px-2 py-0.5 rounded">
                  Zero-Copy Stream Ready
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Execution Result Modal */}
      {executionResult && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white rounded border border-[#0284C7]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2C2C2C]">Pushdown Execution Successful</h3>
                  <p className="text-xs text-[#1E2229]">{executionResult.compositionName}</p>
                </div>
              </div>
              <button
                onClick={() => setExecutionResult(null)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA]">
                <span className="text-[10px] text-[#1E2229] block uppercase font-bold">Profiles Qualified</span>
                <span className="text-lg font-mono font-bold text-[#1473E6]">{executionResult.rowCount.toLocaleString()}</span>
              </div>
              <div className="bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA]">
                <span className="text-[10px] text-[#1E2229] block uppercase font-bold">Execution Latency</span>
                <span className="text-lg font-mono font-bold text-[#0284C7]">{executionResult.executionTimeMs} ms</span>
              </div>
              <div className="bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA]">
                <span className="text-[10px] text-[#1E2229] block uppercase font-bold">Warehouse Data Scanned</span>
                <span className="text-sm font-mono font-bold text-[#2C2C2C]">{executionResult.bytesScanned}</span>
              </div>
              <div className="bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA]">
                <span className="text-[10px] text-[#1E2229] block uppercase font-bold">Data Movement Ingress Fee</span>
                <span className="text-sm font-mono font-bold text-[#0369A1]">$0.00 (Zero-Copy)</span>
              </div>
            </div>

            <button
              onClick={() => setExecutionResult(null)}
              className="w-full py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold text-xs rounded shadow-2xs transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Connect Warehouse Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-md w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <h3 className="text-base font-bold text-[#2C2C2C]">Connect Cloud Data Warehouse</h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-[#1E2229] hover:text-[#2C2C2C] text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Warehouse Platform</label>
                <select
                  value={newConnType}
                  onChange={(e) => setNewConnType(e.target.value as WarehouseType)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] font-semibold text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                >
                  <option value="Snowflake">Snowflake Data Cloud</option>
                  <option value="Databricks">Databricks Unity Catalog</option>
                  <option value="BigQuery">Google BigQuery</option>
                  <option value="AWS Redshift">AWS Redshift Serverless</option>
                  <option value="Amazon S3">Amazon S3 / Delta Lake</option>
                </select>
              </div>

              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Connection Name</label>
                <input
                  type="text"
                  placeholder="e.g. Snowflake Production Analytics"
                  value={newConnName}
                  onChange={(e) => setNewConnName(e.target.value)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Account / Host URL</label>
                <input
                  type="text"
                  placeholder="e.g. xy12345.us-east-1.snowflakecomputing.com"
                  value={newConnHost}
                  onChange={(e) => setNewConnHost(e.target.value)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] font-mono text-[11px] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#2C2C2C] font-semibold mb-1">Database</label>
                  <input
                    type="text"
                    placeholder="ENTERPRISE_DW"
                    value={newConnDb}
                    onChange={(e) => setNewConnDb(e.target.value)}
                    className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] font-mono text-[11px] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#2C2C2C] font-semibold mb-1">Schema</label>
                  <input
                    type="text"
                    placeholder="PUBLIC / MARTS"
                    value={newConnSchema}
                    onChange={(e) => setNewConnSchema(e.target.value)}
                    className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] font-mono text-[11px] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-3.5 py-1.5 text-[#2C2C2C] font-semibold hover:bg-[#F2F4F7] rounded border border-[#E1E5EA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded shadow-2xs"
                >
                  Authenticate Zero-Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Composition Modal */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
              <h3 className="text-base font-bold text-[#2C2C2C]">Create Zero-Copy Composition</h3>
              <button onClick={() => setIsComposeModalOpen(false)} className="text-[#1E2229] hover:text-[#2C2C2C] text-xs font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateComposition} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Composition Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zero-Copy High Margin Customers"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Target Cloud Warehouse</label>
                <select
                  value={newCompWarehouseId}
                  onChange={(e) => setNewCompWarehouseId(e.target.value)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] font-semibold text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Sync Schedule Cadence</label>
                <select
                  value={newCompSchedule}
                  onChange={(e) => setNewCompSchedule(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                >
                  <option value="Continuous Zero-Copy">Continuous Zero-Copy (Sub-minute)</option>
                  <option value="Every 1 Hour">Every 1 Hour</option>
                  <option value="Every 24 Hours">Every 24 Hours</option>
                  <option value="Manual Trigger">Manual Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-[#2C2C2C] font-semibold mb-1">Description & Business Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the audience rules and target destinations..."
                  value={newCompDesc}
                  onChange={(e) => setNewCompDesc(e.target.value)}
                  className="w-full bg-[#FFFFFF] p-2 rounded border border-[#E1E5EA] text-[#2C2C2C] focus:border-[#1473E6] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-3.5 py-1.5 text-[#2C2C2C] font-semibold hover:bg-[#F2F4F7] rounded border border-[#E1E5EA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded shadow-2xs"
                >
                  Create Composition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
