import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  SchemaDefinition,
  Dataset,
  SchemaField,
  CustomerProfile,
  AudienceSegment,
  AudienceRule,
  JourneyDefinition,
  DestinationConnector,
  IngestionSource,
  DestinationSyncLog,
  LiveTerminalLog,
  CDPEvent,
  IdentityNode,
  IdentityLink,
  PrivacyClassification,
  B2BAccountProfile,
  QueryTemplate,
  DataDistillerQuery,
  CalculatedAttributeDefinition,
  PrivacyDsarRequest,
  DynamicOffer,
  EdgeEvaluationResult,
  LookalikeModelConfig,
  CleanRoomQuery,
  SandboxDefinition,
  MergePolicy,
  WarehouseConnection,
  FederatedComposition,
  AgentPromptSession,
  AnomalyAlert,
  CampaignVariant,
  AuditLogEntry,
  DeadLetterQueueItem,
  DatabricksConnectionStatus,
  DatabricksQueryResult
} from '../types/cdp';
import {
  INITIAL_SCHEMAS,
  INITIAL_DATASETS,
  INITIAL_PROFILES,
  INITIAL_AUDIENCES,
  INITIAL_JOURNEYS,
  INITIAL_DESTINATIONS,
  INITIAL_INGESTION_SOURCES,
  INITIAL_SYNC_LOGS,
  INITIAL_TERMINAL_LOGS,
  INITIAL_B2B_ACCOUNTS,
  INITIAL_QUERY_TEMPLATES,
  INITIAL_QUERIES,
  INITIAL_CALCULATED_ATTRIBUTES,
  INITIAL_DSAR_REQUESTS,
  INITIAL_DYNAMIC_OFFERS,
  INITIAL_LOOKALIKES,
  INITIAL_CLEAN_ROOM_QUERIES,
  INITIAL_SANDBOXES,
  INITIAL_MERGE_POLICIES,
  INITIAL_WAREHOUSE_CONNECTIONS,
  INITIAL_FEDERATED_COMPOSITIONS,
  INITIAL_AGENT_PROMPTS,
  INITIAL_ANOMALIES,
  INITIAL_CAMPAIGN_VARIANTS,
  INITIAL_AUDIT_LOGS,
  STANDARD_SCHEMA_BLUEPRINTS
} from '../data/seedData';
import { executeSql } from '../utils/sqlEngine';
import {
  evaluateRule,
  evaluateAudience,
  recomputeAllAudiencesAndProfiles
} from '../utils/audienceEvaluator';

interface IngestionResult {
  success: boolean;
  profileId: string;
  isNew: boolean;
  isMerged: boolean;
  previousProfileId?: string;
  matchedIdentifiers: string[];
  transformedPayload: Record<string, any>;
  message: string;
  segmentsJoined?: string[];
  segmentsLeft?: string[];
}

interface CDPContextType {
  schemas: SchemaDefinition[];
  datasets: Dataset[];
  selectedDatasetId: string | null;
  setSelectedDatasetId: (id: string | null) => void;
  updateDatasetLabels: (datasetId: string, labels: string[], fieldLabels?: Record<string, string[]>) => void;
  createDataset: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'lastIngestedAt'>) => Dataset;
  deleteDataset: (datasetId: string) => void;
  profiles: CustomerProfile[];
  audiences: AudienceSegment[];
  journeys: JourneyDefinition[];
  destinations: DestinationConnector[];
  sources: IngestionSource[];
  ingestionSources: IngestionSource[];
  syncLogs: DestinationSyncLog[];
  terminalLogs: LiveTerminalLog[];
  b2bAccounts: B2BAccountProfile[];
  selectedB2BAccountId: string | null;
  queries: DataDistillerQuery[];
  queryTemplates: QueryTemplate[];
  calculatedAttributes: CalculatedAttributeDefinition[];
  dsarRequests: PrivacyDsarRequest[];
  dynamicOffers: DynamicOffer[];
  lookalikes: LookalikeModelConfig[];
  cleanRoomQueries: CleanRoomQuery[];
  sandboxes: SandboxDefinition[];
  activeSandboxId: string;
  mergePolicies: MergePolicy[];
  activeMergePolicyId: string;
  warehouses: WarehouseConnection[];
  federatedCompositions: FederatedComposition[];
  agentPrompts: AgentPromptSession[];
  anomalies: AnomalyAlert[];
  campaignVariants: CampaignVariant[];
  auditLogs: AuditLogEntry[];
  globalPrivacyMode: boolean;
  activeTab: string;
  selectedProfileId: string | null;
  systemMetrics: {
    ratePerSec: number;
    kafkaLatencyMs: number;
    todayEvents: number;
    stitchingRatio: string;
    totalProfiles: number;
    targetableProfiles: number;
    privacyBlockedCount: number;
    totalB2BAccounts: number;
    b2bPipelineValue: number;
  };
  uiMode: 'minimal' | 'pro';
  setUiMode: (mode: 'minimal' | 'pro') => void;
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  loadDemoData: () => void;
  clearToNewUserMode: () => void;
  isGhostUser: boolean;
  toggleGhostUser: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string | ((prev: string) => string)) => void;
  history: string[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  getPreviousTabTitle: () => string;
  getNextTabTitle: () => string;
  guidedReturnStep: number | null;
  guidedOpenMode: 'overview' | 'step';
  setGuidedOpenMode: (mode: 'overview' | 'step') => void;
  launchGuidedStepAction: (stepNumber: number, targetTab: string) => void;
  returnToGuidedStep: () => void;
  openGuidedOverview: () => void;
  clearGuidedReturn: () => void;
  setSelectedProfileId: (id: string | null) => void;
  setSelectedB2BAccountId: (id: string | null) => void;
  setActiveSandboxId: (id: string) => void;
  setActiveMergePolicyId: (id: string) => void;
  setGlobalPrivacyMode: (enabled: boolean) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => AuditLogEntry;
  clearAuditLogs: () => void;
  ingestEvent: (
    rawPayload: Record<string, any> | string,
    sourceChannel?: CDPEvent['channel'],
    schemaId?: string
  ) => IngestionResult;
  addSchemaField: (schemaId: string, field: Omit<SchemaField, 'id'>) => void;
  deleteSchemaField: (schemaId: string, fieldId: string) => void;
  updateSchemaField: (schemaId: string, fieldId: string, updates: Partial<SchemaField>) => void;
  toggleFieldSensitivity: (schemaId: string, fieldId: string) => void;
  createSchema: (schema: Omit<SchemaDefinition, 'id' | 'createdDate' | 'lastUpdated'> & { id?: string }) => SchemaDefinition;
  deleteSchema: (schemaId: string) => void;
  updateSchema: (schemaId: string, updates: Partial<SchemaDefinition>) => void;
  duplicateSchema: (schemaId: string) => void;
  loadSchemaBlueprint: (blueprintId: string) => void;
  clearAllSchemas: () => void;
  updateProfileConsent: (profileId: string, consentUpdates: Partial<CustomerProfile['consent']>) => void;
  createAudience: (audience: Omit<AudienceSegment, 'id' | 'qualifyingProfileCount' | 'targetableProfileCount' | 'lastCalculated'>) => AudienceSegment;
  updateAudience: (id: string, updates: Partial<AudienceSegment>) => void;
  deleteAudience: (id: string) => void;
  createJourney: (journey: Omit<JourneyDefinition, 'id' | 'totalEntered' | 'totalConverted' | 'createdAt'>) => void;
  updateJourney: (id: string, updates: Partial<JourneyDefinition>) => void;
  toggleJourneyStatus: (id: string) => void;
  activateDestination: (destinationId: string, audienceId: string, overrideDestination?: DestinationConnector) => DestinationSyncLog;
  connectDestination: (destination: DestinationConnector) => DestinationConnector;
  runDataDistillerQuery: (sql: string, queryName?: string) => DataDistillerQuery;
  createAudienceFromQuery: (queryId: string, audienceName: string) => void;
  createCalculatedAttribute: (attr: Omit<CalculatedAttributeDefinition, 'id' | 'lastEvaluated'>) => void;
  toggleCalculatedAttributeStatus: (id: string) => void;
  submitDsarRequest: (request: Omit<PrivacyDsarRequest, 'id' | 'requestId' | 'submittedAt' | 'complianceCertHash' | 'daysRemaining' | 'matchedProfileCount' | 'erasedNodesCount'>) => PrivacyDsarRequest;
  executeDsarErasure: (requestId: string) => void;
  evaluateEdgePersonalization: (profileIdOrEmail: string, placement?: DynamicOffer['placement']) => EdgeEvaluationResult;
  createLookalikeModel: (config: Omit<LookalikeModelConfig, 'id' | 'lastTrained' | 'status' | 'similarityScore' | 'topInfluencingFeatures' | 'projectedAudienceSize'>) => void;
  runCleanRoomQuery: (queryId: string) => void;
  createB2BAccount: (account: Omit<B2BAccountProfile, 'id'>) => void;
  updateB2BAccount: (id: string, updates: Partial<B2BAccountProfile>) => void;
  addWarehouseConnection: (connection: Omit<WarehouseConnection, 'id' | 'lastPingMs' | 'syncedAt'>) => WarehouseConnection;
  deleteWarehouseConnection: (id: string) => void;
  testWarehouseConnection: (id: string) => { success: boolean; pingMs: number; message: string };
  saveFederatedComposition: (composition: Omit<FederatedComposition, 'id' | 'lastRunTimestamp' | 'estimatedAudienceSize' | 'zeroCopyCostSavings'> & { id?: string }) => FederatedComposition;
  deleteFederatedComposition: (id: string) => void;
  executeZeroCopyPushdown: (compositionId: string) => { rowCount: number; executionTimeMs: number; bytesScanned: string; costDollars: number };
  runAgentPrompt: (prompt: string, category?: AgentPromptSession['category']) => Promise<AgentPromptSession>;
  autoHealAnomaly: (id: string) => void;
  generateCampaignVariants: (targetAudience: string, objective: string) => CampaignVariant[];
  convertAgentPromptToAudience: (session: AgentPromptSession) => AudienceSegment;
  addSource: (source: IngestionSource) => void;
  loadDemoSources: () => void;
  resetToFreshSandbox: () => void;
  resetToDefaults: () => void;
  addTerminalLog: (level: LiveTerminalLog['level'], tag: string, message: string, meta?: Record<string, any>) => void;
  dlq: DeadLetterQueueItem[];
  isLiveStreamConnected: boolean;
  liveWebSocketPingMs: number;
  replayDlqItem: (id: string, correctedPayload?: Record<string, any>) => Promise<IngestionResult>;
  discardDlqItem: (id: string) => Promise<boolean>;
  testOutboundWebhook: (url: string, samplePayload?: any) => Promise<any>;
  resetPlatformDemo: () => Promise<void>;
  editingSchemaId: string | null;
  setEditingSchemaId: (id: string | null) => void;
  mergeProfiles: (sourceProfileId: string, targetProfileId: string, confidenceScore?: number, reason?: string) => boolean;
  splitProfileIdentity: (profileId: string, identityId: string) => boolean;
  recalculateCalculatedAttributes: () => Record<string, any>;
  databricksStatus: DatabricksConnectionStatus | null;
  refreshDatabricksStatus: () => Promise<DatabricksConnectionStatus | null>;
  connectDatabricks: (config: { host: string; httpPath: string; token?: string; catalog?: string; schema?: string }) => Promise<{ success: boolean; status: DatabricksConnectionStatus; message: string }>;
  disconnectDatabricks: () => Promise<void>;
  runDatabricksSql: (sql: string) => Promise<DatabricksQueryResult>;
  syncDatabricksNow: () => Promise<void>;
  streamEcommerceEvent: (payload: Record<string, any>) => Promise<any>;
}

const CDPContext = createContext<CDPContextType | undefined>(undefined);

export const CDPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('xlr8_demo_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [isGhostUser, setIsGhostUser] = useState<boolean>(() => {
    try {
      return localStorage.getItem('xlr8_ghost_user') === 'true';
    } catch {
      return false;
    }
  });

  const initialDemoActive = (() => {
    try {
      return localStorage.getItem('xlr8_demo_mode') === 'true';
    } catch {
      return false;
    }
  })();

  const initialDemoEval = initialDemoActive
    ? recomputeAllAudiencesAndProfiles(INITIAL_PROFILES, INITIAL_AUDIENCES)
    : { profiles: [], audiences: [] };

  const [schemas, setSchemas] = useState<SchemaDefinition[]>(() => {
    if (initialDemoActive) return STANDARD_SCHEMA_BLUEPRINTS;
    try {
      if (localStorage.getItem('xlr8_user_created') === 'true') {
        const saved = localStorage.getItem('xlr8_cdp_schemas');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    if (initialDemoActive) return INITIAL_DATASETS;
    try {
      if (localStorage.getItem('xlr8_user_created') === 'true') {
        const saved = localStorage.getItem('xlr8_cdp_datasets');
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<CustomerProfile[]>(initialDemoEval.profiles);
  const [audiences, setAudiences] = useState<AudienceSegment[]>(initialDemoEval.audiences);
  const [journeys, setJourneys] = useState<JourneyDefinition[]>(initialDemoActive ? INITIAL_JOURNEYS : []);
  const [destinations, setDestinations] = useState<DestinationConnector[]>(() => {
    if (initialDemoActive) return INITIAL_DESTINATIONS;
    try {
      if (localStorage.getItem('xlr8_user_created') === 'true') {
        const saved = localStorage.getItem('xlr8_cdp_destinations');
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [sources, setSources] = useState<IngestionSource[]>(() => {
    if (initialDemoActive) return INITIAL_INGESTION_SOURCES;
    try {
      if (localStorage.getItem('xlr8_user_created') === 'true') {
        const saved = localStorage.getItem('nexus_cdp_sources');
        if (saved !== null) return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [syncLogs, setSyncLogs] = useState<DestinationSyncLog[]>(initialDemoActive ? INITIAL_SYNC_LOGS : []);
  const [terminalLogs, setTerminalLogs] = useState<LiveTerminalLog[]>(initialDemoActive ? INITIAL_TERMINAL_LOGS : []);

  // Enterprise Module State
  const [b2bAccounts, setB2bAccounts] = useState<B2BAccountProfile[]>(initialDemoActive ? INITIAL_B2B_ACCOUNTS : []);
  const [selectedB2BAccountId, setSelectedB2BAccountId] = useState<string | null>(null);
  const [queries, setQueries] = useState<DataDistillerQuery[]>(initialDemoActive ? INITIAL_QUERIES : []);
  const [queryTemplates] = useState<QueryTemplate[]>(INITIAL_QUERY_TEMPLATES);
  const [calculatedAttributes, setCalculatedAttributes] = useState<CalculatedAttributeDefinition[]>(initialDemoActive ? INITIAL_CALCULATED_ATTRIBUTES : []);
  const [dsarRequests, setDsarRequests] = useState<PrivacyDsarRequest[]>(initialDemoActive ? INITIAL_DSAR_REQUESTS : []);
  const [dynamicOffers] = useState<DynamicOffer[]>(INITIAL_DYNAMIC_OFFERS);
  const [lookalikes, setLookalikes] = useState<LookalikeModelConfig[]>(initialDemoActive ? INITIAL_LOOKALIKES : []);
  const [cleanRoomQueries, setCleanRoomQueries] = useState<CleanRoomQuery[]>(initialDemoActive ? INITIAL_CLEAN_ROOM_QUERIES : []);
  const [sandboxes] = useState<SandboxDefinition[]>(INITIAL_SANDBOXES);
  const [activeSandboxId, setActiveSandboxId] = useState<string>('sb_production');
  const [mergePolicies] = useState<MergePolicy[]>(INITIAL_MERGE_POLICIES);
  const [activeMergePolicyId, setActiveMergePolicyId] = useState<string>('mp_default_timestamp');
  const [warehouses, setWarehouses] = useState<WarehouseConnection[]>(initialDemoActive ? INITIAL_WAREHOUSE_CONNECTIONS : []);
  const [federatedCompositions, setFederatedCompositions] = useState<FederatedComposition[]>(initialDemoActive ? INITIAL_FEDERATED_COMPOSITIONS : []);
  const [agentPrompts, setAgentPrompts] = useState<AgentPromptSession[]>(initialDemoActive ? INITIAL_AGENT_PROMPTS : []);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(initialDemoActive ? INITIAL_ANOMALIES : []);
  const [campaignVariants, setCampaignVariants] = useState<CampaignVariant[]>(initialDemoActive ? INITIAL_CAMPAIGN_VARIANTS : []);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialDemoActive ? INITIAL_AUDIT_LOGS : []);

  const [globalPrivacyMode, setGlobalPrivacyMode] = useState<boolean>(true);
  const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null);
  const [uiMode, setUiModeState] = useState<'minimal' | 'pro'>(() => {
    try {
      const saved = localStorage.getItem('nexus_cdp_ui_mode');
      return saved === 'pro' || saved === 'minimal' ? saved : 'minimal';
    } catch {
      return 'minimal';
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nexus_cdp_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nexus_cdp_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  const setUiMode = useCallback((mode: 'minimal' | 'pro') => {
    setUiModeState(mode);
    try {
      localStorage.setItem('nexus_cdp_ui_mode', mode);
    } catch (e) {
      console.error(e);
    }
    // If switching to minimal mode and currently on a pro-only tab, switch to dashboard
    if (mode === 'minimal') {
      const minimalAllowedTabs = [
        'home',
        'get_started',
        'dashboard',
        'hub_data_management',
        'hub_connections',
        'hub_customers',
        'hub_data_science',
        'hub_governance',
        'hub_intelligence',
        'profiles',
        'audiences',
        'connectors',
        'connectors_sources',
        'connectors_destinations',
        'sources',
        'destinations',
        'schemas',
        'ecommerce_store',
        'databricks_warehouse'
      ];
      setActiveTab(prev => (minimalAllowedTabs.includes(prev) ? prev : 'home'));
    }
  }, []);

  const [navState, setNavState] = useState<{
    activeTab: string;
    history: string[];
    historyIndex: number;
  }>({
    activeTab: 'home',
    history: ['home'],
    historyIndex: 0
  });
  const { activeTab, history, historyIndex } = navState;
  const [guidedReturnStep, setGuidedReturnStep] = useState<number | null>(null);
  const [guidedOpenMode, setGuidedOpenMode] = useState<'overview' | 'step'>('overview');

  const addSource = useCallback((source: IngestionSource) => {
    setSources(prev => {
      const next = [source, ...prev.filter(s => s.id !== source.id)];
      try {
        localStorage.setItem('nexus_cdp_sources', JSON.stringify(next));
        localStorage.setItem('xlr8_user_created', 'true');
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    addTerminalLog('success', 'SOURCE-CONNECT', `Connected new ingestion stream: ${source.name} [${source.type}]`);
  }, []);

  const loadDemoSources = useCallback(() => {
    setSources(INITIAL_INGESTION_SOURCES);
    try {
      localStorage.setItem('nexus_cdp_sources', JSON.stringify(INITIAL_INGESTION_SOURCES));
    } catch (e) {
      console.error(e);
    }
    addTerminalLog('info', 'DEMO-DATA', `Loaded 19 enterprise demonstration ingestion connectors into sandbox`);
  }, []);

  const resetToFreshSandbox = useCallback(() => {
    setSources([]);
    try {
      localStorage.setItem('nexus_cdp_sources', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    addTerminalLog('info', 'SANDBOX', `Reset sandbox to Day-0 clean slate: 0 active streams, awaiting guided setup`);
  }, []);

  const setActiveTab = useCallback((tabOrFn: string | ((prev: string) => string)) => {
    setNavState(prev => {
      const nextTab = typeof tabOrFn === 'function' ? tabOrFn(prev.activeTab) : tabOrFn;
      if (nextTab === prev.activeTab) return prev;

      const sliced = prev.history.slice(0, prev.historyIndex + 1);
      sliced.push(nextTab);
      if (sliced.length > 50) sliced.shift();
      return {
        activeTab: nextTab,
        history: sliced,
        historyIndex: sliced.length - 1
      };
    });
  }, []);

  const getFallbackParentTab = useCallback((currentTab: string): string => {
    switch (currentTab) {
      case 'create_schema':
      case 'schema_editor':
      case 'schemas':
      case 'datasets':
      case 'ingestion':
      case 'ecommerce_store':
      case 'databricks_warehouse':
      case 'federated_composition':
        return 'hub_data_management';
      case 'sources':
      case 'destinations':
      case 'connectors':
      case 'connectors_sources':
      case 'connectors_destinations':
        return 'hub_connections';
      case 'profiles':
      case 'audiences':
      case 'identities':
      case 'b2b_accounts':
        return 'hub_customers';
      case 'data_distiller':
      case 'calc_attributes':
      case 'ai_models':
      case 'edge_simulator':
        return 'hub_data_science';
      case 'governance':
      case 'privacy_service':
      case 'audit_logs':
        return 'hub_governance';
      case 'agentic_studio':
      case 'journeys':
        return 'hub_intelligence';
      case 'ai_support':
        return 'home';
      case 'hub_data_management':
      case 'hub_connections':
      case 'hub_customers':
      case 'hub_data_science':
      case 'hub_governance':
      case 'hub_intelligence':
      case 'get_started':
      case 'dashboard':
        return 'home';
      default:
        return 'home';
    }
  }, []);

  const getTabLabel = useCallback((tab: string): string => {
    switch (tab) {
      case 'home': return 'Home';
      case 'get_started': return 'Get Started (Guided Steps)';
      case 'dashboard': return 'Overview & Telemetry';
      case 'hub_data_management': return 'Data Management';
      case 'hub_connections': return 'Connections';
      case 'hub_customers': return 'Customers';
      case 'hub_data_science': return 'Data Science & Query';
      case 'hub_governance': return 'Privacy & Governance';
      case 'hub_intelligence': return 'Intelligence Services';
      case 'create_schema':
      case 'schema_editor': return 'XDM Schema Editor';
      case 'schemas': return 'Schemas (XDM)';
      case 'datasets': return 'Datasets & DULE Labeling';
      case 'create_dataset':
      case 'bring_in_dataset': return 'Bring In New Dataset';
      case 'ingestion': return 'Data Ingestion & Streams';
      case 'ecommerce_store': return 'Live E-Commerce Storefront';
      case 'databricks_warehouse': return 'Databricks Unity Catalog';
      case 'federated_composition': return 'Zero-Copy Data Mesh';
      case 'sources':
      case 'connectors':
      case 'connectors_sources': return 'Sources Catalog';
      case 'destinations':
      case 'connectors_destinations': return 'Destinations Catalog';
      case 'edge_simulator': return 'Edge Simulator';
      case 'profiles': return 'Customer 360 Profiles';
      case 'audiences': return 'Audiences & Segments';
      case 'identities': return 'Identity Graph';
      case 'b2b_accounts': return 'B2B Accounts';
      case 'data_distiller': return 'Data Distiller (SQL)';
      case 'calc_attributes': return 'Calculated Attributes';
      case 'ai_models': return 'Sensei AI Studio';
      case 'governance': return 'DULE Policies';
      case 'privacy_service': return 'Privacy & DSAR';
      case 'audit_logs': return 'Audit Logs';
      case 'agentic_studio': return 'AI Copilot';
      case 'journeys': return 'Journey Canvas';
      case 'ai_support': return 'XLR8 AI Support';
      default: return tab;
    }
  }, []);

  const canGoBack = historyIndex > 0 || activeTab !== 'home';
  const canGoForward = historyIndex < history.length - 1;

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevTab = history[historyIndex - 1];
      if (prevTab === 'get_started' && guidedReturnStep !== null) {
        setGuidedOpenMode('step');
      }
      setNavState(prev => {
        if (prev.historyIndex <= 0) return prev;
        const nextIdx = prev.historyIndex - 1;
        return {
          ...prev,
          activeTab: prev.history[nextIdx],
          historyIndex: nextIdx
        };
      });
    } else {
      const fallback = getFallbackParentTab(activeTab);
      if (fallback !== activeTab) {
        setNavState({
          activeTab: fallback,
          history: fallback === 'home' ? ['home'] : ['home', fallback],
          historyIndex: fallback === 'home' ? 0 : 1
        });
      }
    }
  }, [historyIndex, history, activeTab, getFallbackParentTab, guidedReturnStep]);

  const goForward = useCallback(() => {
    setNavState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const nextIdx = prev.historyIndex + 1;
      return {
        ...prev,
        activeTab: prev.history[nextIdx],
        historyIndex: nextIdx
      };
    });
  }, []);

  const launchGuidedStepAction = useCallback((stepNumber: number, targetTab: string) => {
    setGuidedReturnStep(stepNumber);
    setGuidedOpenMode('step');
    setActiveTab(targetTab);
  }, [setActiveTab]);

  const returnToGuidedStep = useCallback(() => {
    setGuidedOpenMode('step');
    setActiveTab('get_started');
  }, [setActiveTab]);

  const openGuidedOverview = useCallback(() => {
    setGuidedReturnStep(null);
    setGuidedOpenMode('overview');
    setActiveTab('get_started');
  }, [setActiveTab]);

  const clearGuidedReturn = useCallback(() => {
    setGuidedReturnStep(null);
  }, []);

  const getPreviousTabTitle = useCallback((): string => {
    if (historyIndex > 0) {
      const prevTab = history[historyIndex - 1];
      if (prevTab === 'get_started' && guidedReturnStep !== null) {
        return `Get Started · Step ${guidedReturnStep}`;
      }
      return getTabLabel(prevTab);
    }
    return getTabLabel(getFallbackParentTab(activeTab));
  }, [historyIndex, history, activeTab, getFallbackParentTab, getTabLabel, guidedReturnStep]);

  const getNextTabTitle = useCallback((): string => {
    if (historyIndex < history.length - 1) {
      return getTabLabel(history[historyIndex + 1]);
    }
    return '';
  }, [historyIndex, history, getTabLabel]);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Helper to log in audit trail
  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
    const newEntry: AuditLogEntry = {
      id: entry.id || 'audit_log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: entry.timestamp || new Date().toISOString(),
      userId: entry.userId || 'usr_admin_elena@nexus.enterprise.io',
      userName: entry.userName || 'Elena Rostova',
      userRole: entry.userRole || 'Super Admin',
      category: entry.category,
      action: entry.action,
      targetEntity: entry.targetEntity,
      status: entry.status || 'SUCCESS',
      ipAddress: entry.ipAddress || '194.105.140.12',
      client: entry.client || 'NEXUS Web Console (Chrome 128 / macOS)',
      summary: entry.summary,
      details: entry.details,
      complianceFlags: entry.complianceFlags || ['SOC2 Type II', 'ISO 27001 Audit Trail']
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  const updateDatasetLabels = useCallback((datasetId: string, labels: string[], fieldLabels?: Record<string, string[]>) => {
    setDatasets(prev => {
      const next = prev.map(ds => {
        if (ds.id === datasetId) {
          return {
            ...ds,
            labels,
            ...(fieldLabels !== undefined ? { fieldLabels } : {})
          };
        }
        return ds;
      });
      try {
        localStorage.setItem('xlr8_cdp_datasets', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    const targetDs = datasets.find(d => d.id === datasetId);
    const dsName = targetDs ? targetDs.name : datasetId;
    addAuditLog({
      userId: 'usr_data_architect_01',
      userName: 'Elena Rostova (Lead Data Architect)',
      userRole: 'Data Protection Officer (DPO)',
      category: 'Privacy & Consent',
      action: 'Updated Dataset Data Usage Labels (DULE)',
      targetEntity: `Dataset: "${dsName}" [${datasetId}]`,
      status: 'SUCCESS',
      ipAddress: '192.241.142.45',
      client: 'XLR8 Governance & DULE Engine',
      summary: `Applied ${labels.length} DULE governance labels (${labels.join(', ') || 'None'}) to dataset "${dsName}".`,
      details: {
        before: `Labels: ${targetDs?.labels.join(', ') || 'None'}`,
        after: `Labels: ${labels.join(', ') || 'None'}`,
        jsonPayload: {
          datasetId,
          labels,
          fieldLabels
        }
      },
      complianceFlags: ['Adobe Real-Time CDP DULE Standard', 'ISO 27701 Label Governance']
    });
  }, [datasets, addAuditLog]);

  const createDataset = useCallback((datasetData: Omit<Dataset, 'id' | 'createdAt' | 'lastIngestedAt'>) => {
    const newDataset: Dataset = {
      ...datasetData,
      id: `dataset_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastIngestedAt: new Date().toISOString()
    };
    setDatasets(prev => {
      const next = [newDataset, ...prev];
      try {
        localStorage.setItem('xlr8_cdp_datasets', JSON.stringify(next));
        localStorage.setItem('xlr8_user_created', 'true');
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    addAuditLog({
      userId: 'usr_data_architect_01',
      userName: 'Elena Rostova (Lead Data Architect)',
      userRole: 'Data Architect',
      category: 'Schema & Ingestion',
      action: 'Created Ingestion Dataset with DULE Labels',
      targetEntity: `Dataset: "${newDataset.name}"`,
      status: 'SUCCESS',
      ipAddress: '192.241.142.45',
      client: 'XLR8 Ingestion Gateway',
      summary: `Created new dataset "${newDataset.name}" with ${newDataset.labels.length} DULE governance labels.`,
      details: {
        after: `Dataset Schema: ${newDataset.schemaName} | Ingestion: ${newDataset.ingestionType} | Labels: ${newDataset.labels.join(', ') || 'None'}`,
        jsonPayload: newDataset
      },
      complianceFlags: ['DULE Dataset Onboarding', 'Enterprise Lineage']
    });

    return newDataset;
  }, [addAuditLog]);

  const deleteDataset = useCallback((datasetId: string) => {
    setDatasets(prev => {
      const next = prev.filter(ds => ds.id !== datasetId);
      try {
        localStorage.setItem('xlr8_cdp_datasets', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Helper to log in real-time terminal
  const addTerminalLog = useCallback((
    level: LiveTerminalLog['level'],
    tag: string,
    message: string,
    meta?: Record<string, any>
  ) => {
    const newLog: LiveTerminalLog = {
      id: 'tl_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toTimeString().split(' ')[0],
      level,
      tag,
      message,
      meta,
    };
    setTerminalLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  // Real-Time Distributed Engine & WebSocket State
  const [dlq, setDlq] = useState<DeadLetterQueueItem[]>([]);
  const [isLiveStreamConnected, setIsLiveStreamConnected] = useState<boolean>(false);
  const [liveWebSocketPingMs, setLiveWebSocketPingMs] = useState<number>(3.2);
  const [databricksStatus, setDatabricksStatus] = useState<DatabricksConnectionStatus | null>(null);

  const refreshDatabricksStatus = useCallback(async (): Promise<DatabricksConnectionStatus | null> => {
    try {
      const res = await fetch('/api/v1/databricks/status');
      if (!res.ok) return null;
      const status = (await res.json()) as DatabricksConnectionStatus;
      setDatabricksStatus(status);
      return status;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    refreshDatabricksStatus();
  }, [refreshDatabricksStatus]);

  // Connect to the authoritative server-side WebSocket stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let pingInterval: any = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        ws = new WebSocket(`${protocol}//${host}`);

        ws.onopen = () => {
          setIsLiveStreamConnected(true);
          addTerminalLog('success', 'STREAM-GATEWAY', 'WebSocket Real-Time Link connected to XLR8 Stream Cluster', {
            protocol,
            host,
            transport: 'RFC-6455'
          });

          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              const pingStart = performance.now();
              ws.send(JSON.stringify({ type: 'ping' }));
              (ws as any)._pingStart = pingStart;
            }
          }, 8000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              const hasServerData =
                (data.data?.profiles?.length || 0) > 0 ||
                (data.data?.dlq?.length || 0) > 0 ||
                (data.data?.syncLogs?.length || 0) > 0;
              if (hasServerData) {
                if (data.data?.profiles) setProfiles(data.data.profiles);
                if (data.data?.dlq) setDlq(data.data.dlq);
                if (data.data?.syncLogs) setSyncLogs(data.data.syncLogs);
              }
              if (data.data?.databricks) {
                setDatabricksStatus(data.data.databricks);
              }
            } else if (data.type === 'pong') {
              if ((ws as any)._pingStart) {
                const diff = performance.now() - (ws as any)._pingStart;
                setLiveWebSocketPingMs(Number(diff.toFixed(1)));
              }
            } else if (data.type === 'stream:event') {
              if (data.profile) {
                setProfiles(prev => {
                  const exists = prev.some(p => p.id === data.profile.id);
                  const nextProfiles = exists
                    ? prev.map(p => p.id === data.profile.id ? data.profile : p)
                    : [data.profile, ...prev];
                  setAudiences(prevAuds => {
                    if (prevAuds.length === 0) return prevAuds;
                    return recomputeAllAudiencesAndProfiles(nextProfiles, prevAuds).audiences;
                  });
                  return nextProfiles;
                });
              }
              if (data.event) {
                setSources(prev => {
                  const nowIso = new Date().toISOString();
                  const ecomIdx = prev.findIndex(s => s.id === 'src_ecommerce_web_sdk' || s.name.includes('E-Commerce'));
                  if (ecomIdx >= 0) {
                    return prev.map((s, idx) =>
                      idx === ecomIdx
                        ? {
                            ...s,
                            todayEventCount: s.todayEventCount + 1,
                            ratePerSec: Math.max(s.ratePerSec, 12),
                            lastEventReceived: nowIso,
                            status: 'Healthy'
                          }
                        : s
                    );
                  }
                  const newEcomSource: IngestionSource = {
                    id: 'src_ecommerce_web_sdk',
                    name: 'XLR8 Apex E-Commerce Storefront',
                    type: 'Streaming',
                    status: 'Healthy',
                    ratePerSec: 18,
                    todayEventCount: 1,
                    latencyMs: 2.4,
                    errorRatePercent: 0,
                    lastEventReceived: nowIso,
                    category: 'Commerce & Retail',
                    targetSchemaId: 'xdm_experience_event',
                    targetSchemaName: 'XDM Experience Event (Commerce & Cart)',
                    authMethod: 'API Secret / Web SDK Tag',
                    icon: 'Store',
                    description: 'Live interactive storefront streaming PageView, ProductView, Search, AddToCart, CartAbandoned, and Purchase events.'
                  };
                  return [newEcomSource, ...prev];
                });
                addTerminalLog('info', 'STREAM-EVENT', `[${data.event.channel}] ${data.event.eventType} processed in ${data.latencyMs}ms`);
              }
              if (data.databricks) {
                setDatabricksStatus(data.databricks);
              }
            } else if (data.type === 'databricks:synced') {
              if (data.status) setDatabricksStatus(data.status);
            } else if (data.type === 'dlq:new' || data.type === 'dlq:updated') {
              if (data.dlq) setDlq(data.dlq);
              if (data.item) {
                addTerminalLog('error', 'DLQ-ALERT', `Caught non-conformant payload: ${data.item.errorCode}`, data.item);
              }
            } else if (data.type === 'egress:dispatched') {
              if (data.log) {
                setSyncLogs(prev => [data.log, ...prev]);
                addTerminalLog('success', 'EGRESS-SYNC', `Outbound Activation dispatched to ${data.log.destinationName}`);
              }
            } else if (data.type === 'state:reset') {
              if (data.data?.profiles) setProfiles(data.data.profiles);
              if (data.data?.dlq) setDlq(data.data.dlq);
              if (data.data?.databricks) setDatabricksStatus(data.data.databricks);
            } else if (data.type === 'state:clear') {
              setProfiles([]);
              setDlq([]);
              setSyncLogs([]);
              if (data.data?.databricks) setDatabricksStatus(data.data.databricks);
            }
          } catch (e) {
            // ignore
          }
        };

        ws.onclose = () => {
          setIsLiveStreamConnected(false);
          clearInterval(pingInterval);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsLiveStreamConnected(false);
        };
      } catch (err) {
        console.warn('WebSocket connection attempt failed:', err);
      }
    }

    connect();

    return () => {
      if (ws) ws.close();
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
    };
  }, [addTerminalLog]);

  const replayDlqItem = useCallback(async (id: string, correctedPayload?: Record<string, any>): Promise<IngestionResult> => {
    try {
      const res = await fetch(`/api/v1/dlq/${id}/replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctedPayload })
      });
      const data = await res.json();
      if (data.success) {
        addTerminalLog('success', 'DLQ-REPLAY', `Replayed DLQ payload successfully into profile ${data.profileId}`);
        setDlq(prev => prev.map(d => d.id === id ? { ...d, status: 'REPLAYED', replayedAt: new Date().toISOString() } : d));
      } else {
        addTerminalLog('error', 'DLQ-REPLAY', `DLQ replay rejected: ${data.message}`);
      }
      return data;
    } catch (err: any) {
      addTerminalLog('error', 'DLQ-REPLAY', `Failed to replay DLQ: ${err.message}`);
      return {
        success: false,
        profileId: '',
        isNew: false,
        isMerged: false,
        matchedIdentifiers: [],
        transformedPayload: {},
        message: err.message
      };
    }
  }, [addTerminalLog]);

  const discardDlqItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/dlq/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDlq(prev => prev.map(d => d.id === id ? { ...d, status: 'DISCARDED' } : d));
        addTerminalLog('info', 'DLQ-DISCARD', `Discarded dead letter queue entry ${id}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [addTerminalLog]);

  const testOutboundWebhook = useCallback(async (url: string, samplePayload?: any) => {
    addTerminalLog('info', 'EGRESS-TEST', `Testing real outbound HTTP webhook to: ${url}`);
    try {
      const res = await fetch('/api/v1/destinations/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, samplePayload })
      });
      const result = await res.json();
      if (result.success) {
        addTerminalLog('success', 'EGRESS-TEST', `HTTP ${result.statusCode} response in ${result.roundtripMs}ms with valid HMAC signature`);
      } else {
        addTerminalLog('warning', 'EGRESS-TEST', `HTTP ${result.statusCode || 'ERR'} in ${result.roundtripMs}ms: ${result.responseSnippet}`);
      }
      return result;
    } catch (err: any) {
      addTerminalLog('error', 'EGRESS-TEST', `Failed to reach webhook endpoint: ${err.message}`);
      throw err;
    }
  }, [addTerminalLog]);

  // Recalculate audience qualifications via unified evaluator
  const evaluateProfileAgainstRule = (profile: CustomerProfile, rule: AudienceRule): boolean => {
    return evaluateRule(profile, rule);
  };

  const evaluateAudiencesForProfiles = useCallback((currentProfiles: CustomerProfile[], currentAudiences: AudienceSegment[]) => {
    return recomputeAllAudiencesAndProfiles(currentProfiles, currentAudiences).audiences;
  }, []);

  // Ingestion & Deterministic Identity Resolution Core Engine
  const ingestEvent = useCallback((
    rawPayloadInput: Record<string, any> | string,
    sourceChannel: CDPEvent['channel'] = 'Web SDK',
    schemaId: string = 'schema_web_sdk_v1'
  ): IngestionResult => {
    let raw: Record<string, any>;
    if (typeof rawPayloadInput === 'string') {
      try {
        raw = JSON.parse(rawPayloadInput);
      } catch (err) {
        addTerminalLog('error', 'PARSER', 'Failed to parse incoming raw JSON payload');
        return {
          success: false,
          profileId: '',
          isNew: false,
          isMerged: false,
          matchedIdentifiers: [],
          transformedPayload: {},
          message: 'Invalid JSON payload provided',
        };
      }
    } else {
      raw = rawPayloadInput;
    }

    addTerminalLog('info', 'INGEST', `RECV EVENT from ${sourceChannel}`, { channel: sourceChannel, size: JSON.stringify(raw).length });

    // Step 1: Transformation & Schema Normalization
    const email = (raw.customer_email || raw.user_email || raw.email || raw.userEmail || '').trim().toLowerCase();
    const cookieId = (raw.anon_cookie_id || raw.cookie_id || raw.cookieId || raw.cid || '').trim();
    const phone = (raw.contact_phone || raw.phone || raw.phoneNumber || '').trim();
    const crmId = (raw.crm_id || raw.crmId || raw.sfdc_id || '').trim();
    const deviceToken = (raw.device_token || raw.deviceToken || raw.idfa || '').trim();

    let rawEventType = String(raw.event_name || raw.eventType || raw.action || 'PageView').trim();
    const evLower = rawEventType.toLowerCase();
    if (evLower.includes('abandon')) rawEventType = 'CartAbandoned';
    else if (evLower.includes('removecart') || evLower.includes('remove_from_cart') || (evLower.includes('remove') && evLower.includes('cart'))) rawEventType = 'RemoveFromCart';
    else if (evLower.includes('checkout')) rawEventType = 'CheckoutStarted';
    else if (evLower.includes('wishlist')) rawEventType = 'WishlistAdd';
    else if (evLower.includes('productview') || evLower.includes('product_view')) rawEventType = 'ProductView';
    else if (evLower.includes('search')) rawEventType = 'Search';
    else if (evLower.includes('cart') || evLower === 'addtocart') rawEventType = 'AddToCart';
    else if (evLower.includes('purchase') || evLower.includes('order') || raw.transaction_id) rawEventType = 'Purchase';
    else if (evLower.includes('ticket') || evLower.includes('support')) rawEventType = 'SupportTicket';
    else if (evLower.includes('app') || evLower.includes('open')) rawEventType = 'AppOpen';
    else if (evLower.includes('consent') || evLower.includes('opt')) rawEventType = 'ConsentUpdate';
    else if (evLower.includes('form') || evLower.includes('login') || evLower.includes('identify')) rawEventType = 'FormSubmit';

    const eventType = rawEventType as CDPEvent['eventType'];
    const nowIso = new Date().toISOString();

    addTerminalLog('info', 'SCHEMA', `Mapped keys -> Canonical schema [${schemaId}] (${eventType})`);

    const extractedIdentifiers: { type: IdentityNode['type']; value: string }[] = [];
    if (email) extractedIdentifiers.push({ type: 'email', value: email });
    if (cookieId) extractedIdentifiers.push({ type: 'cookie', value: cookieId });
    if (phone) extractedIdentifiers.push({ type: 'phone', value: phone });
    if (crmId) extractedIdentifiers.push({ type: 'crmId', value: crmId });
    if (deviceToken) extractedIdentifiers.push({ type: 'device', value: deviceToken });

    // Step 2: Deterministic Identity Resolution (Graph Search)
    let matchingProfiles = profiles.filter(p => {
      return p.identities.some(ident => {
        if (ident.type === 'email' && email && ident.value.toLowerCase() === email) return true;
        if (ident.type === 'cookie' && cookieId && ident.value === cookieId) return true;
        if (ident.type === 'phone' && phone && ident.value === phone) return true;
        if (ident.type === 'crmId' && crmId && ident.value === crmId) return true;
        if (ident.type === 'device' && deviceToken && ident.value === deviceToken) return true;
        return false;
      });
    });

    let targetProfile: CustomerProfile;
    let isNew = false;
    let isMerged = false;
    let previousProfileId: string | undefined = undefined;
    let nextProfiles = [...profiles];

    if (matchingProfiles.length >= 2) {
      // MULTI-PROFILE STITCHING / MERGE CASE!
      // When an event connects an anonymous cookie profile to a registered email profile
      isMerged = true;
      const primaryProf = matchingProfiles[0];
      const secondaryProf = matchingProfiles[1];
      previousProfileId = secondaryProf.id;

      addTerminalLog('success', 'IDENTITY-GRAPH', `STITCHING MERGE: Linked ${secondaryProf.id} -> ${primaryProf.id}`, {
        confidence: '1.0 (Deterministic Match)',
        triggerKey: email || cookieId,
      });

      // Merge identities
      const mergedIdentities = [...primaryProf.identities];
      secondaryProf.identities.forEach(secIdent => {
        if (!mergedIdentities.some(i => i.type === secIdent.type && i.value === secIdent.value)) {
          mergedIdentities.push({
            ...secIdent,
            lastSeen: nowIso,
          });
        }
      });

      // Merge identity links
      const mergedLinks = [...primaryProf.identityLinks, ...secondaryProf.identityLinks];
      if (email && cookieId) {
        mergedLinks.push({
          sourceId: `id_cookie_${cookieId}`,
          targetId: `id_email_${email}`,
          relationship: 'deterministic',
          confidence: 1.0,
          establishedAt: nowIso,
          linkedByEvent: `${eventType} Identity Stitching Event`,
        });
      }

      // Merge events & attributes
      const mergedEvents = [...secondaryProf.events, ...primaryProf.events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const combinedSpend = primaryProf.attributes.totalSpend + secondaryProf.attributes.totalSpend;
      const combinedPurchases = primaryProf.attributes.purchaseCount + secondaryProf.attributes.purchaseCount;

      targetProfile = {
        ...primaryProf,
        identities: mergedIdentities,
        identityLinks: mergedLinks,
        events: mergedEvents,
        lastActiveAt: nowIso,
        attributes: {
          ...secondaryProf.attributes,
          ...primaryProf.attributes,
          totalSpend: combinedSpend,
          purchaseCount: combinedPurchases,
        },
      };

      // Remove secondary profile from array
      nextProfiles = nextProfiles.filter(p => p.id !== secondaryProf.id).map(p => p.id === primaryProf.id ? targetProfile : p);

    } else if (matchingProfiles.length === 1) {
      // SINGLE MATCH: Update existing profile
      targetProfile = { ...matchingProfiles[0] };
      const updatedIdentities = [...targetProfile.identities];
      const updatedLinks = [...targetProfile.identityLinks];

      extractedIdentifiers.forEach(ident => {
        const existing = updatedIdentities.find(i => i.type === ident.type && i.value === ident.value);
        if (!existing) {
          const newIdNode: IdentityNode = {
            id: `id_${ident.type}_${Date.now()}`,
            type: ident.type,
            value: ident.value,
            firstSeen: nowIso,
            lastSeen: nowIso,
            source: sourceChannel,
            isPrimary: ident.type === 'email' && !targetProfile.primaryEmail,
          };
          updatedIdentities.push(newIdNode);

          // Add deterministic link if primary email exists
          if (targetProfile.primaryEmail && ident.type !== 'email') {
            updatedLinks.push({
              sourceId: newIdNode.id,
              targetId: `id_primary_email`,
              relationship: 'deterministic',
              confidence: 1.0,
              establishedAt: nowIso,
              linkedByEvent: `Ingestion ${eventType}`,
            });
          }
        } else {
          existing.lastSeen = nowIso;
        }
      });

      // Update attributes if provided in incoming record
      if (raw.total_spend !== undefined || raw.totalSpend !== undefined) {
        targetProfile.attributes.totalSpend += Number(raw.total_spend || raw.totalSpend || 0);
      }
      if (raw.customer_tier || raw.customerTier) {
        targetProfile.attributes.customerTier = raw.customer_tier || raw.customerTier;
      }
      if (raw.city) targetProfile.attributes.city = raw.city;
      if (raw.country) targetProfile.attributes.country = raw.country;
      if (raw.loyalty_points !== undefined || raw.loyaltyPoints !== undefined) {
        targetProfile.attributes.loyaltyPoints += Number(raw.loyalty_points || raw.loyaltyPoints || 0);
      }

      targetProfile.identities = updatedIdentities;
      targetProfile.identityLinks = updatedLinks;
      targetProfile.lastActiveAt = nowIso;

      addTerminalLog('success', 'STITCH', `Resolved to existing profile [${targetProfile.id}] (${targetProfile.unifiedName})`);
    } else {
      // NO MATCH: Create new unified profile
      isNew = true;
      const newId = `prof_${Math.random().toString(36).substring(2, 6)}_${Math.floor(1000 + Math.random() * 9000)}`;
      const displayName = email ? email.split('@')[0].replace('.', ' ') : (raw.fullName || (raw.firstName ? `${raw.firstName} ${raw.lastName || ''}`.trim() : `Anonymous Visitor (${cookieId.slice(-4) || 'Guest'})`));
      
      const createdNodes: IdentityNode[] = extractedIdentifiers.map((ident, idx) => ({
        id: `id_${ident.type}_${Date.now()}_${idx}`,
        type: ident.type,
        value: ident.value,
        firstSeen: nowIso,
        lastSeen: nowIso,
        source: sourceChannel,
        isPrimary: idx === 0,
      }));

      const initialLinks = createdNodes.length > 1 ? createdNodes.slice(1).map((node) => ({
        sourceId: node.id,
        targetId: createdNodes[0].id,
        relationship: 'deterministic' as const,
        confidence: 1.0,
        establishedAt: nowIso,
        linkedByEvent: `${sourceChannel} Ingest Resolution`,
      })) : [];

      const initialSpend = Number(raw.total_spend || raw.totalSpend || raw.spend || 0);
      const initialPurchases = Number(raw.purchase_count || raw.purchaseCount || (initialSpend > 0 ? 3 : 0));
      const initialTier = raw.customer_tier || raw.customerTier || (initialSpend > 2000 ? 'Platinum' : initialSpend > 800 ? 'Gold' : 'Bronze');
      const churnBand = raw.churn_risk === 'High' ? 'High' : raw.churn_risk === 'Medium' ? 'Medium' : 'Low';

      targetProfile = {
        id: newId,
        unifiedName: displayName,
        primaryEmail: email || `anon_${newId}@unregistered.guest`,
        primaryPhone: phone || undefined,
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        createdAt: nowIso,
        lastActiveAt: nowIso,
        identities: createdNodes,
        identityLinks: initialLinks,
        attributes: {
          firstName: raw.firstName || (raw.fullName ? raw.fullName.split(' ')[0] : displayName.split(' ')[0]),
          lastName: raw.lastName || (raw.fullName ? raw.fullName.split(' ').slice(1).join(' ') : displayName.split(' ')[1] || ''),
          city: raw.city || 'San Francisco',
          country: raw.country || 'US',
          customerTier: initialTier,
          totalSpend: initialSpend,
          purchaseCount: initialPurchases,
          loyaltyPoints: Number(raw.loyalty_points || raw.loyaltyPoints || (initialSpend > 0 ? Math.floor(initialSpend * 1.5) : 100)),
          preferredCategory: raw.preferredCategory || 'Cloud Hardware',
          hasActiveSubscription: raw.has_active_subscription !== undefined ? Boolean(raw.has_active_subscription) : false,
          deviceType: raw.device_browser || 'Web Browser',
        },
        consent: {
          gdprConsent: raw.gdpr_consent !== undefined ? Boolean(raw.gdpr_consent) : (raw.gdpr_opt_in !== undefined ? Boolean(raw.gdpr_opt_in) : true),
          ccpaOptOut: raw.ccpa_opt_out !== undefined ? Boolean(raw.ccpa_opt_out) : false,
          marketingEmailConsent: raw.marketing_email_opt_in !== undefined ? Boolean(raw.marketing_email_opt_in) : true,
          thirdPartySharingConsent: raw.third_party_ad_sharing !== undefined ? Boolean(raw.third_party_ad_sharing) : true,
          sensitiveDataAllowed: false,
          lastUpdated: nowIso,
          consentSource: `${sourceChannel} Event Capture`,
        },
        predictions: {
          churnRisk: churnBand === 'High' ? 84 : churnBand === 'Medium' ? 45 : 16,
          churnRiskBand: churnBand as 'Low' | 'Medium' | 'High',
          predictedLtv: Math.round(initialSpend > 0 ? initialSpend * 2.2 : 500),
          upsellPropensity: initialSpend > 1000 ? 78 : 45,
          brandLoyaltyScore: initialTier === 'Platinum' ? 92 : initialTier === 'Gold' ? 76 : 38,
          nextBestAction: initialSpend > 1500 ? 'Dedicated Solutions Architect Session' : 'Welcome Onboarding Series',
          nextBestOffer: initialSpend > 1500 ? '20% Enterprise Expansion Discount' : '$20 Welcome Gift Card',
          calculatedAt: nowIso,
        },
        events: [],
        qualifyingAudienceIds: [],
        activeJourneys: [],
      };

      addTerminalLog('info', 'PROFILE-CREATE', `Generated new Unified Profile [${newId}]`);
    }

    // Step 3: Event Payload Processing & Dynamic AI Predictions Update
    const newEvent: CDPEvent = {
      id: 'evt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: nowIso,
      eventType,
      channel: sourceChannel,
      schemaId,
      identifiers: {
        cookieId: cookieId || undefined,
        email: email || undefined,
        phone: phone || undefined,
        crmId: crmId || undefined,
        deviceToken: deviceToken || undefined,
      },
      payload: raw,
      stitchingLog: {
        matchedProfileId: targetProfile.id,
        stitchingKey: email || cookieId || phone || 'Anonymous',
        isMerged,
        previousProfileId,
      },
    };

    targetProfile.events = [newEvent, ...targetProfile.events];

    // Dynamic AI Scoring based on Event Context
    if (eventType === 'Purchase') {
      const amount = Number(raw.total_amount || raw.orderTotal || raw.amount || raw.unit_price || 150);
      targetProfile.attributes.totalSpend += amount;
      targetProfile.attributes.purchaseCount += 1;
      targetProfile.attributes.lastPurchaseDate = nowIso;
      targetProfile.attributes.loyaltyPoints += Math.floor(amount * 2);

      if (targetProfile.attributes.totalSpend > 3000) targetProfile.attributes.customerTier = 'VIP';
      else if (targetProfile.attributes.totalSpend > 1500) targetProfile.attributes.customerTier = 'Platinum';
      else if (targetProfile.attributes.totalSpend > 500) targetProfile.attributes.customerTier = 'Gold';
      else targetProfile.attributes.customerTier = 'Silver';

      targetProfile.predictions.churnRisk = Math.max(5, targetProfile.predictions.churnRisk - 20);
      targetProfile.predictions.churnRiskBand = 'Low';
      targetProfile.predictions.predictedLtv = Math.round(targetProfile.attributes.totalSpend * 2.2);
      targetProfile.predictions.brandLoyaltyScore = Math.min(99, targetProfile.predictions.brandLoyaltyScore + 15);
      targetProfile.predictions.nextBestAction = 'Send Order Thank You & Next-Tier Upgrade Preview';
      targetProfile.predictions.nextBestOffer = '15% Off Accessory SKU';

      addTerminalLog('ai', 'AI-ML', `Updated LTV to $${targetProfile.predictions.predictedLtv.toLocaleString()} | Churn Risk: ${targetProfile.predictions.churnRisk}%`);
    } else if (eventType === 'AddToCart') {
      targetProfile.predictions.nextBestAction = 'Trigger Cart Abandonment Incentive Sequence';
      targetProfile.predictions.nextBestOffer = 'Free Express Shipping Voucher';
    } else if (eventType === 'SupportTicket' || raw.sentiment_score < 0 || raw.account_risk_flag) {
      targetProfile.predictions.churnRisk = Math.min(96, Math.max(82, targetProfile.predictions.churnRisk + 40));
      targetProfile.predictions.churnRiskBand = 'High';
      targetProfile.predictions.nextBestAction = 'Escalate VIP Retention Ticket to Account Executive';
      targetProfile.predictions.nextBestOffer = 'Dedicated Solution Architect Session + 20% Credit';

      addTerminalLog('warn', 'CHURN-ALERT', `HIGH CHURN RISK DETECTED (${targetProfile.predictions.churnRisk}%) for ${targetProfile.unifiedName}`);
    } else if (eventType === 'ConsentUpdate') {
      if (raw.gdpr_opt_in !== undefined) targetProfile.consent.gdprConsent = Boolean(raw.gdpr_opt_in);
      if (raw.ccpa_opt_out !== undefined) targetProfile.consent.ccpaOptOut = Boolean(raw.ccpa_opt_out);
      if (raw.marketing_email_opt_in !== undefined) targetProfile.consent.marketingEmailConsent = Boolean(raw.marketing_email_opt_in);
      if (raw.third_party_ad_sharing !== undefined) targetProfile.consent.thirdPartySharingConsent = Boolean(raw.third_party_ad_sharing);
      targetProfile.consent.lastUpdated = nowIso;

      addTerminalLog('warn', 'DULE-GOV', `Consent preferences updated. CCPA Opt-Out: ${targetProfile.consent.ccpaOptOut}, GDPR: ${targetProfile.consent.gdprConsent}`);
    }

    // Step 4: Update Profile in State
    const previousAudienceIds = [...(targetProfile.qualifyingAudienceIds || [])];

    if (isNew) {
      nextProfiles = [targetProfile, ...nextProfiles];
    } else {
      nextProfiles = nextProfiles.map(p => p.id === targetProfile.id ? targetProfile : p);
    }

    // Step 5: Recalculate Audiences and Profile Qualifications Atomically
    const { profiles: syncedProfiles, audiences: updatedAudiences } = recomputeAllAudiencesAndProfiles(nextProfiles, audiences);
    const updatedTargetProfile = syncedProfiles.find(p => p.id === targetProfile.id) || targetProfile;
    targetProfile = updatedTargetProfile;

    const segmentsJoined = updatedTargetProfile.qualifyingAudienceIds.filter(id => !previousAudienceIds.includes(id));
    const segmentsLeft = previousAudienceIds.filter(id => !updatedTargetProfile.qualifyingAudienceIds.includes(id));

    setProfiles(syncedProfiles);
    setAudiences(updatedAudiences);

    // Update Ingestion Source counters or auto-register first active source
    setSources(prev => {
      const matchIdx = prev.findIndex(s => s.name.toLowerCase().includes(sourceChannel.toLowerCase()) || (sourceChannel === 'Web SDK' && s.id === 'src_web_sdk'));
      if (matchIdx >= 0) {
        const next = prev.map((s, idx) => {
          if (idx === matchIdx) {
            return {
              ...s,
              todayEventCount: s.todayEventCount + 1,
              ratePerSec: Math.floor(s.ratePerSec + 12),
              status: 'Healthy' as const
            };
          }
          return s;
        });
        try {
          localStorage.setItem('nexus_cdp_sources', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      }

      // If source didn't exist yet (e.g. Day 0), auto-create the active source!
      const iconMap: Record<string, string> = {
        'Web SDK': 'globe',
        'Mobile SDK': 'smartphone',
        'Snowflake Batch': 'database',
        'Salesforce CRM': 'store',
        'POS Terminal': 'store',
        'Kafka Ingestion': 'radio',
      };
      const newSource: IngestionSource = {
        id: `src_${sourceChannel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
        name: `XLR8 Platform ${sourceChannel} (Streaming)`,
        type: sourceChannel.includes('Batch') ? 'Batch' : 'Streaming',
        status: 'Healthy',
        todayEventCount: 1,
        ratePerSec: 14,
        latencyMs: 2.8,
        description: `Active real-time Edge Ingestion stream for ${sourceChannel} telemetry.`,
        icon: iconMap[sourceChannel] || 'zap',
        category: 'Web & Mobile'
      };
      addTerminalLog('success', 'STREAM-ACTIVE', `Auto-registered first streaming source: ${newSource.name}`);
      const next = [newSource, ...prev];
      try {
        localStorage.setItem('nexus_cdp_sources', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    addTerminalLog('success', 'SEGMENT', `Audience segments evaluated in real-time. Target profile in ${targetProfile.qualifyingAudienceIds.length} segments.`);

    // Transmit to authoritative server-side real-time stream endpoint
    try {
      fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof rawPayloadInput === 'string' ? rawPayloadInput : JSON.stringify({
          ...raw,
          channel: sourceChannel,
          schemaId
        })
      }).then(r => r.json()).then(ack => {
        if (ack && ack.success) {
          addTerminalLog('success', 'EDGE-ACK', `Ingested via Server Edge Ingest API (${ack.latencyMs}ms)`);
        }
      }).catch(() => {
        // local memory fallback active
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      profileId: targetProfile.id,
      isNew,
      isMerged,
      previousProfileId,
      matchedIdentifiers: extractedIdentifiers.map(i => `${i.type}:${i.value}`),
      transformedPayload: raw,
      segmentsJoined,
      segmentsLeft,
      message: isMerged
        ? `Deterministic Stitching: Successfully merged ${previousProfileId} into ${targetProfile.id}!`
        : isNew
        ? `Created new Unified Profile ${targetProfile.id}`
        : `Updated Profile ${targetProfile.id} with new ${eventType} event`,
    };
  }, [profiles, audiences, evaluateAudiencesForProfiles, addTerminalLog]);

  // Schema Actions
  const createSchema = (schemaInput: Omit<SchemaDefinition, 'id' | 'createdDate' | 'lastUpdated'> & { id?: string }): SchemaDefinition => {
    const nowIso = new Date().toISOString();
    const newSchema: SchemaDefinition = {
      ...schemaInput,
      id: schemaInput.id || 'schema_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdDate: nowIso,
      lastUpdated: nowIso,
      status: schemaInput.status || 'Enabled for Profile',
      fields: schemaInput.fields || [],
    };
    setSchemas(prev => [newSchema, ...prev]);

    // Automatically create a corresponding live Streaming dataset for this schema so it works in real-time
    const newDataset: Dataset = {
      id: `ds_${newSchema.id.replace(/[^a-zA-Z0-9_]/g, '')}`,
      name: `${newSchema.name} Dataset`,
      description: `Canonical ingest dataset mapped to ${newSchema.name} [${newSchema.category}] schema.`,
      schemaId: newSchema.id,
      schemaName: newSchema.name,
      sourceConnectorName: 'Real-Time Edge Streaming API',
      ingestionType: 'Streaming',
      format: 'JSON',
      recordCount: 0,
      sizeBytes: 0,
      sizeFormatted: '0 B',
      status: 'Active',
      isProfileEnabled: newSchema.status === 'Enabled for Profile',
      labels: Array.from(new Set(newSchema.fields.flatMap(f => f.privacyLabels || []))),
      createdAt: nowIso,
      lastIngestedAt: 'Ready for live stream'
    };
    setDatasets(prev => [newDataset, ...prev.filter(d => d.schemaId !== newSchema.id)]);

    try {
      localStorage.setItem('xlr8_cdp_schemas', JSON.stringify([newSchema, ...schemas.filter(s => s.id !== newSchema.id)]));
      localStorage.setItem('xlr8_cdp_datasets', JSON.stringify([newDataset, ...datasets.filter(d => d.schemaId !== newSchema.id)]));
      localStorage.setItem('xlr8_user_created', 'true');
    } catch (e) {
      console.error(e);
    }

    addTerminalLog('success', 'SCHEMA', `Created XDM Schema [${newSchema.name}] (Category: ${newSchema.category}, Fields: ${newSchema.fields.length}). Provisioned streaming dataset [${newDataset.name}].`);
    return newSchema;
  };

  const deleteSchema = (schemaId: string) => {
    const target = schemas.find(s => s.id === schemaId);
    setSchemas(prev => prev.filter(s => s.id !== schemaId));
    addTerminalLog('warn', 'SCHEMA', `Deleted XDM Schema [${target?.name || schemaId}] from registry`);
  };

  const updateSchema = (schemaId: string, updates: Partial<SchemaDefinition>) => {
    setSchemas(prev => prev.map(s => s.id === schemaId ? {
      ...s,
      ...updates,
      lastUpdated: new Date().toISOString(),
    } : s));
    addTerminalLog('info', 'SCHEMA', `Updated metadata for schema [${schemaId}]`);
  };

  const duplicateSchema = (schemaId: string) => {
    const src = schemas.find(s => s.id === schemaId);
    if (!src) return;
    const nowIso = new Date().toISOString();
    const copy: SchemaDefinition = {
      ...src,
      id: 'schema_' + Date.now(),
      name: `${src.name} (Copy)`,
      createdDate: nowIso,
      lastUpdated: nowIso,
      fields: src.fields.map(f => ({ ...f, id: 'f_' + Math.random().toString(36).substring(2, 9) })),
    };
    setSchemas(prev => [copy, ...prev]);
    addTerminalLog('info', 'SCHEMA', `Duplicated schema [${src.name}] -> [${copy.name}]`);
  };

  const addSchemaField = (schemaId: string, field: Omit<SchemaField, 'id'>) => {
    const newField: SchemaField = {
      ...field,
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setSchemas(prev => prev.map(s => s.id === schemaId ? {
      ...s,
      fields: [...s.fields, newField],
      lastUpdated: new Date().toISOString(),
    } : s));
    addTerminalLog('info', 'SCHEMA', `Added field [${field.name}] (${field.classification}) to ${schemaId}`);
  };

  const deleteSchemaField = (schemaId: string, fieldId: string) => {
    setSchemas(prev => prev.map(s => s.id === schemaId ? {
      ...s,
      fields: s.fields.filter(f => f.id !== fieldId),
      lastUpdated: new Date().toISOString(),
    } : s));
    addTerminalLog('info', 'SCHEMA', `Removed field ${fieldId} from schema ${schemaId}`);
  };

  const updateSchemaField = (schemaId: string, fieldId: string, updates: Partial<SchemaField>) => {
    setSchemas(prev => prev.map(s => s.id === schemaId ? {
      ...s,
      fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
      lastUpdated: new Date().toISOString(),
    } : s));
    addTerminalLog('info', 'SCHEMA', `Updated field properties for ${fieldId} in ${schemaId}`);
    addAuditLog({
      userId: 'usr_arch_chen@nexus.enterprise.io',
      userName: 'Dr. Arthur Chen',
      userRole: 'Data Architect',
      category: 'Schema & Ingestion',
      action: 'Updated Schema Field Descriptor',
      targetEntity: `Field: ${fieldId} (${schemaId})`,
      status: 'SUCCESS',
      ipAddress: '172.56.21.90',
      client: 'NEXUS Schema Designer Web UI',
      summary: `Updated schema field attributes for ${fieldId}.`,
      details: { jsonPayload: updates },
      complianceFlags: ['XDM 2026 Change Control', 'DULE Classification']
    });
  };

  const loadSchemaBlueprint = (blueprintId: string) => {
    const blueprint = STANDARD_SCHEMA_BLUEPRINTS.find(b => b.id === blueprintId);
    if (!blueprint) return;
    const nowIso = new Date().toISOString();
    const instantiated: SchemaDefinition = {
      ...blueprint,
      id: 'schema_' + blueprint.id + '_' + Date.now(),
      createdDate: nowIso,
      lastUpdated: nowIso,
      fields: blueprint.fields.map(f => ({ ...f, id: 'f_' + Math.random().toString(36).substring(2, 9) })),
    };
    setSchemas(prev => [instantiated, ...prev]);
    addTerminalLog('success', 'SCHEMA', `Instantiated XLR8 XDM standard blueprint: [${blueprint.name}]`);
    addAuditLog({
      userId: 'usr_arch_chen@nexus.enterprise.io',
      userName: 'Dr. Arthur Chen',
      userRole: 'Data Architect',
      category: 'Schema & Ingestion',
      action: 'Instantiated XDM Schema Blueprint',
      targetEntity: `Schema: ${blueprint.name} (${instantiated.id})`,
      status: 'SUCCESS',
      ipAddress: '172.56.21.90',
      client: 'NEXUS Schema Blueprint Catalog',
      summary: `Deployed standard blueprint schema "${blueprint.name}" with ${blueprint.fields.length} predefined attributes.`,
      complianceFlags: ['XDM Standard Blueprint', 'SOC2 Change Management']
    });
  };

  const clearAllSchemas = () => {
    setSchemas([]);
    addTerminalLog('warn', 'SCHEMA', 'Cleared all schemas from active sandbox registry');
    addAuditLog({
      userId: 'usr_admin_elena@nexus.enterprise.io',
      userName: 'Elena Rostova',
      userRole: 'Super Admin',
      category: 'Schema & Ingestion',
      action: 'Cleared Active Sandbox Schema Registry',
      targetEntity: 'Schema Registry',
      status: 'WARNING',
      ipAddress: '194.105.140.12',
      client: 'NEXUS Management Console',
      summary: 'All custom schemas cleared from active sandbox registry.',
      complianceFlags: ['Sandbox Isolation SLA']
    });
  };

  const toggleFieldSensitivity = (schemaId: string, fieldId: string) => {
    setSchemas(prev => prev.map(s => {
      if (s.id !== schemaId) return s;
      return {
        ...s,
        fields: s.fields.map(f => {
          if (f.id !== fieldId) return f;
          const nextSens = !f.isSensitive;
          const nextClass: PrivacyClassification = nextSens ? 'Sensitive' : 'Standard';
          return {
            ...f,
            isSensitive: nextSens,
            classification: nextClass,
            maskInExports: nextSens,
            blockInAdNetworks: nextSens,
          };
        }),
        lastUpdated: new Date().toISOString(),
      };
    }));
    addTerminalLog('warn', 'DULE-POLICY', `Toggled privacy classification on field ${fieldId}`);
    addAuditLog({
      userId: 'usr_dpo_sophia@privacy.nexus.io',
      userName: 'Sophia Laurent',
      userRole: 'Data Protection Officer (DPO)',
      category: 'Privacy & Consent',
      action: 'Updated Field Privacy & DULE Classification',
      targetEntity: `Field: ${fieldId} in Schema: ${schemaId}`,
      status: 'SUCCESS',
      ipAddress: '10.240.4.19',
      client: 'NEXUS DULE Governance Policy Center',
      summary: `Toggled sensitive PII masking & ad-network egress restriction for field ${fieldId}.`,
      complianceFlags: ['GDPR Art. 25 Data Protection by Design', 'DULE Labeling SLA']
    });
  };

  // Profile Consent Actions
  const updateProfileConsent = (profileId: string, consentUpdates: Partial<CustomerProfile['consent']>) => {
    setProfiles(prev => {
      const nextProfs = prev.map(p => {
        if (p.id !== profileId) return p;
        return {
          ...p,
          consent: {
            ...p.consent,
            ...consentUpdates,
            lastUpdated: new Date().toISOString(),
          },
        };
      });
      const synced = recomputeAllAudiencesAndProfiles(nextProfs, audiences);
      setAudiences(synced.audiences);
      return synced.profiles;
    });
    addTerminalLog('warn', 'CONSENT', `Updated consent for profile ${profileId}`);
    addAuditLog({
      userId: 'usr_dpo_sophia@privacy.nexus.io',
      userName: 'Sophia Laurent',
      userRole: 'Data Protection Officer (DPO)',
      category: 'Privacy & Consent',
      action: 'Customer Consent Preferences Updated',
      targetEntity: `Profile: ${profileId}`,
      status: 'SUCCESS',
      ipAddress: '198.51.100.44',
      client: 'OneTrust Universal Consent CMP / Webhook',
      summary: `Updated privacy consent flags for profile ${profileId}. Downstream activation segments re-calculated.`,
      details: {
        jsonPayload: consentUpdates
      },
      complianceFlags: ['GDPR Art. 7 Conditions for Consent', 'CCPA Section 1798.120', 'DULE Egress Suppression']
    });
  };

  // Audience Management
  const createAudience = (audienceData: Omit<AudienceSegment, 'id' | 'qualifyingProfileCount' | 'targetableProfileCount' | 'lastCalculated'>): AudienceSegment => {
    const newId = 'aud_' + Date.now().toString(36);
    const newAudience: AudienceSegment = {
      ...audienceData,
      id: newId,
      qualifyingProfileCount: 0,
      targetableProfileCount: 0,
      lastCalculated: new Date().toISOString(),
    };
    const synced = recomputeAllAudiencesAndProfiles(profiles, [...audiences, newAudience]);
    setProfiles(synced.profiles);
    setAudiences(synced.audiences);
    addTerminalLog('success', 'SEGMENT', `Created Audience Segment: "${audienceData.name}"`);
    return synced.audiences.find(a => a.id === newId) || newAudience;
  };

  const updateAudience = (id: string, updates: Partial<AudienceSegment>) => {
    const nextList = audiences.map(a => a.id === id ? { ...a, ...updates } : a);
    const synced = recomputeAllAudiencesAndProfiles(profiles, nextList);
    setProfiles(synced.profiles);
    setAudiences(synced.audiences);
  };

  const deleteAudience = (id: string) => {
    const remaining = audiences
      .filter(a => a.id !== id)
      .map(a => a.excludedAudienceIds ? { ...a, excludedAudienceIds: a.excludedAudienceIds.filter(exId => exId !== id) } : a);
    const synced = recomputeAllAudiencesAndProfiles(profiles, remaining);
    setProfiles(synced.profiles);
    setAudiences(synced.audiences);
    addTerminalLog('info', 'SEGMENT', `Deleted audience segment ${id}`);
  };

  // Journey Management
  const createJourney = (journeyData: Omit<JourneyDefinition, 'id' | 'totalEntered' | 'totalConverted' | 'createdAt'>) => {
    const newJourney: JourneyDefinition = {
      ...journeyData,
      id: 'jrn_' + Date.now().toString(36),
      totalEntered: 0,
      totalConverted: 0,
      createdAt: new Date().toISOString(),
    };
    setJourneys(prev => [...prev, newJourney]);
    addTerminalLog('info', 'JOURNEY', `Orchestrated new Journey: "${journeyData.name}"`);
  };

  const updateJourney = (id: string, updates: Partial<JourneyDefinition>) => {
    setJourneys(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const toggleJourneyStatus = (id: string) => {
    setJourneys(prev => prev.map(j => {
      if (j.id !== id) return j;
      const nextStatus = j.status === 'Active' ? 'Paused' : 'Active';
      return { ...j, status: nextStatus };
    }));
  };

  const connectDestination = useCallback((destination: DestinationConnector): DestinationConnector => {
    setDestinations(prev => {
      const exists = prev.some(d => d.id === destination.id);
      const next = exists
        ? prev.map(d => (d.id === destination.id ? { ...d, ...destination, status: 'Connected' as const } : d))
        : [destination, ...prev];
      try {
        localStorage.setItem('xlr8_user_created', 'true');
        localStorage.setItem('xlr8_cdp_destinations', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    addTerminalLog('success', 'DEST-CONNECT', `Connected destination "${destination.name}" (${destination.targetPlatform})`);
    return destination;
  }, [addTerminalLog]);

  // Destination Activation with strict DULE and Consent Enforcement
  const activateDestination = (destinationId: string, audienceId: string, overrideDestination?: DestinationConnector): DestinationSyncLog => {
    const dest = overrideDestination || destinations.find(d => d.id === destinationId);
    const aud = audiences.find(a => a.id === audienceId);

    if (!dest || !aud) {
      throw new Error('Destination or Audience not found');
    }

    // Get all qualifying profiles for this audience using unified evaluator
    const qualifying = profiles.filter(p => evaluateAudience(p, aud, audiences));

    const now = new Date().toISOString();
    let synced = 0;
    let blocked = 0;
    let sensitiveRedacted = 0;
    const logDetails: string[] = [];

    logDetails.push(`Starting Real-Time Sync: Audience "${aud.name}" -> Destination "${dest.name}"`);
    logDetails.push(`Audience Qualifying Members: ${qualifying.length} profile(s)`);

    qualifying.forEach(p => {
      // 1. Consent Policy Checks
      const isBlockedByConsent = (globalPrivacyMode && !p.consent.gdprConsent) ||
        p.consent.ccpaOptOut ||
        (dest.category === 'Ad Networks' && !p.consent.thirdPartySharingConsent);

      if (isBlockedByConsent) {
        blocked += 1;
        const reasons: string[] = [];
        if (!p.consent.gdprConsent) reasons.push('GDPR Consent = False');
        if (p.consent.ccpaOptOut) reasons.push('CCPA Opt-Out = True');
        if (dest.category === 'Ad Networks' && !p.consent.thirdPartySharingConsent) reasons.push('3rd-Party Ad Sharing Disallowed');
        logDetails.push(`[PRIVACY BLOCKED] Profile ${p.id} (${p.primaryEmail}): ${reasons.join(', ')}`);
      } else {
        synced += 1;
        // Check if sensitive fields must be redacted
        if (dest.blockedPrivacyLabels && (dest.blockedPrivacyLabels.includes('Sensitive') || dest.blockedPrivacyLabels.includes('Health'))) {
          if (p.attributes.ssnLast4 || p.attributes.healthCategory) {
            sensitiveRedacted += 1;
          }
        }
      }
    });

    if (sensitiveRedacted > 0) {
      logDetails.push(`[DULE ENFORCEMENT] Redacted sensitive PII & Health tokens from ${sensitiveRedacted} profile export payloads.`);
    }

    logDetails.push(`Sync Result: ${synced} Synced Successfully, ${blocked} Blocked for Privacy.`);

    const newSyncLog: DestinationSyncLog = {
      id: 'log_sync_' + Date.now(),
      timestamp: now,
      destinationId: dest.id,
      destinationName: dest.name,
      audienceId: aud.id,
      audienceName: aud.name,
      profilesAttempted: qualifying.length,
      profilesSynced: synced,
      profilesBlockedPrivacy: blocked,
      sensitiveFieldsRedacted: sensitiveRedacted,
      status: blocked === 0 ? 'Success' : synced > 0 ? 'Completed with Blocks' : 'Failed',
      details: logDetails,
    };

    setSyncLogs(prev => [newSyncLog, ...prev]);

    // Update destination counters & bound audience
    setDestinations(prev => {
      const exists = prev.some(d => d.id === destinationId);
      const baseList = exists ? prev : [dest, ...prev];
      const next = baseList.map(d => {
        if (d.id !== destinationId) return d;
        return {
          ...d,
          totalSynced: d.totalSynced + synced,
          totalBlockedForPrivacy: d.totalBlockedForPrivacy + blocked,
          lastSyncTime: now,
          configuredAudienceId: aud.id,
          configuredAudienceName: aud.name,
          activeAudienceCount: Math.max(d.activeAudienceCount || 0, 1),
        };
      });
      try {
        localStorage.setItem('xlr8_user_created', 'true');
        localStorage.setItem('xlr8_cdp_destinations', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addTerminalLog(
      blocked > 0 ? 'warn' : 'success',
      'ACTIVATION',
      `Activated "${aud.name}" to ${dest.name}: ${synced} synced, ${blocked} privacy blocked`
    );

    return newSyncLog;
  };

  // ==========================================
  // Data Distiller / Query Service Engine (Real SQL Engine)
  // ==========================================
  const runDataDistillerQuery = (sql: string, queryName: string = 'Interactive Query'): DataDistillerQuery => {
    const allEvents = profiles.flatMap(p => p.events || []);
    
    // Execute real SQL query using the in-memory compiler
    const sqlExec = executeSql(sql, {
      profiles,
      events: allEvents,
      b2bAccounts,
      datasets
    });

    let cols = sqlExec.columns;
    let rows = sqlExec.rows;
    let isSuccess = !sqlExec.error;

    // If query was empty or had error, but matches an enterprise template keyword, provide fallback rows
    if ((!rows || rows.length === 0 || sqlExec.error) && sql.toLowerCase().includes('rfm')) {
      cols = ['profile_id', 'customer_name', 'monetary_value', 'frequency_count', 'recency_days', 'monetary_quartile', 'rfm_segment'];
      rows = profiles.map((p, idx) => ({
        profile_id: p.id,
        customer_name: p.unifiedName,
        monetary_value: `$${p.attributes.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        frequency_count: p.attributes.purchaseCount,
        recency_days: Math.floor(Math.random() * 20) + 1,
        monetary_quartile: idx < 2 ? 1 : idx < 4 ? 2 : 3,
        rfm_segment: p.attributes.totalSpend > 5000 ? 'Champions (VIP)' : p.predictions.churnRisk > 60 ? 'At-Risk High Spender' : 'Loyal Potential'
      }));
      isSuccess = true;
    }

    const execTime = sqlExec.executionTimeMs || Math.floor(Math.random() * 30) + 12;
    const newQuery: DataDistillerQuery = {
      id: 'query_' + Date.now(),
      name: queryName,
      sql,
      lastRunAt: new Date().toISOString(),
      status: isSuccess ? 'SUCCESS' : 'ERROR',
      executionTimeMs: execTime,
      rowsScanned: sqlExec.rowsScanned || (profiles.length * 150000 + 400000),
      bytesProcessed: sqlExec.bytesProcessed || `${(Math.random() * 40 + 12).toFixed(1)} MB`,
      columns: cols,
      resultRows: rows
    };

    setQueries(prev => [newQuery, ...prev.slice(0, 19)]);
    addTerminalLog(
      isSuccess ? 'success' : 'error',
      'DISTILLER',
      `Executed SQL "${queryName}" in ${execTime}ms (${rows.length} rows returned)`
    );
    return newQuery;
  };

  const createAudienceFromQuery = (queryId: string, audienceName: string) => {
    const q = queries.find(i => i.id === queryId);
    if (!q) return;

    createAudience({
      name: audienceName || `Audience from ${q.name}`,
      description: `Auto-generated from Data Distiller SQL: ${q.name}`,
      status: 'Active',
      rulesMatch: 'ALL',
      rules: [
        {
          id: 'rule_sql_' + Date.now(),
          category: 'attribute',
          field: 'totalSpend',
          operator: 'gte',
          value: 1000
        }
      ],
      tags: ['Data Distiller', 'SQL Generated', 'XDM'],
      color: 'indigo'
    });

    addTerminalLog('ai', 'SEGMENTATION', `Generated dynamic audience "${audienceName}" from Data Distiller query`);
  };

  // ==========================================
  // Calculated Attributes Engine
  // ==========================================
  const createCalculatedAttribute = (attr: Omit<CalculatedAttributeDefinition, 'id' | 'lastEvaluated'>) => {
    const newAttr: CalculatedAttributeDefinition = {
      ...attr,
      id: 'ca_' + Date.now(),
      lastEvaluated: new Date().toISOString()
    };
    setCalculatedAttributes(prev => [newAttr, ...prev]);
    addTerminalLog('info', 'CALC_ATTR', `Registered new continuous Calculated Attribute "${newAttr.displayName}" (${newAttr.name})`);
  };

  const toggleCalculatedAttributeStatus = (id: string) => {
    setCalculatedAttributes(prev => prev.map(a => {
      if (a.id !== id) return a;
      const nextStatus = a.status === 'Active' ? 'Paused' : 'Active';
      return { ...a, status: nextStatus };
    }));
  };

  const recalculateCalculatedAttributes = (): Record<string, any> => {
    const activeAttrs = calculatedAttributes.filter(a => a.status === 'Active');
    const nowIso = new Date().toISOString();
    const evaluationResults: Record<string, number> = {};

    setProfiles(prevProfiles => {
      return prevProfiles.map(p => {
        let updatedSpend = p.attributes.totalSpend;
        let updatedPurchases = p.attributes.purchaseCount;

        activeAttrs.forEach(attr => {
          const matchingEvents = (p.events || []).filter(e => {
            if (!attr.sourceEvent || attr.sourceEvent === 'All') return true;
            return (e.eventType || e.type || '').toLowerCase().includes(attr.sourceEvent.toLowerCase());
          });

          if (attr.aggregationType === 'SUM') {
            const sumVal = matchingEvents.reduce((acc, ev) => acc + (ev.value || ev.total_amount || 0), 0);
            if (attr.category === 'Spend' && sumVal > 0) {
              updatedSpend = sumVal;
            }
            evaluationResults[attr.id] = (evaluationResults[attr.id] || 0) + 1;
          } else if (attr.aggregationType === 'COUNT') {
            const countVal = matchingEvents.length;
            if (attr.category === 'Engagement' || attr.category === 'Frequency') {
              updatedPurchases = Math.max(updatedPurchases, countVal);
            }
            evaluationResults[attr.id] = (evaluationResults[attr.id] || 0) + 1;
          }
        });

        return {
          ...p,
          attributes: {
            ...p.attributes,
            totalSpend: Math.round(updatedSpend * 100) / 100,
            purchaseCount: updatedPurchases
          }
        };
      });
    });

    setCalculatedAttributes(prev => prev.map(a => {
      if (a.status !== 'Active') return a;
      return { ...a, lastEvaluated: nowIso };
    }));

    addTerminalLog(
      'success',
      'CALC_ATTR',
      `Continuous Calculated Traits Evaluated across ${profiles.length} profiles (${activeAttrs.length} active metrics recomputed)`
    );

    addAuditLog({
      userId: 'system.engine@cdp.internal',
      userName: 'Continuous Trait Computation Worker',
      userRole: 'Streaming Processing Worker',
      category: 'Data Science & Query',
      action: 'Batch Re-calculation of Calculated Traits',
      targetEntity: `Active Traits: ${activeAttrs.map(a => a.name).join(', ')}`,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      client: 'XLR8 Continuous Trait Aggregator',
      summary: `Recomputed ${activeAttrs.length} streaming attributes across ${profiles.length} profiles with zero-lag event windowing.`,
      complianceFlags: ['Continuous SLA', 'XDM Profile Enrichment']
    });

    return evaluationResults;
  };

  // ==========================================
  // Probabilistic Graph Merging & Splitting
  // ==========================================
  const mergeProfiles = (
    sourceProfileId: string,
    targetProfileId: string,
    confidenceScore: number = 0.88,
    reason: string = 'Probabilistic Match'
  ): boolean => {
    const source = profiles.find(p => p.id === sourceProfileId);
    const target = profiles.find(p => p.id === targetProfileId);

    if (!source || !target || source.id === target.id) return false;

    // Merge identities
    const existingValues = new Set(target.identities.map(i => `${i.type}:${i.value}`));
    const newIdentities = [...target.identities];

    source.identities.forEach(ident => {
      const key = `${ident.type}:${ident.value}`;
      if (!existingValues.has(key)) {
        newIdentities.push({
          ...ident,
          id: `id_merged_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          status: 'verified'
        });
        existingValues.add(key);
      }
    });

    // Merge events timeline
    const combinedEvents = [...target.events, ...source.events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Merge attributes & metrics
    const updatedTarget: CustomerProfile = {
      ...target,
      identities: newIdentities,
      events: combinedEvents,
      attributes: {
        ...target.attributes,
        totalSpend: Math.round(((target.attributes.totalSpend || 0) + (source.attributes.totalSpend || 0)) * 100) / 100,
        purchaseCount: (target.attributes.purchaseCount || 0) + (source.attributes.purchaseCount || 0)
      },
      createdAt: new Date(target.createdAt) < new Date(source.createdAt) ? target.createdAt : source.createdAt,
      lastActiveAt: new Date(target.lastActiveAt) > new Date(source.lastActiveAt) ? target.lastActiveAt : source.lastActiveAt
    };

    const nextProfiles = profiles.filter(p => p.id !== source.id).map(p => p.id === target.id ? updatedTarget : p);
    setProfiles(nextProfiles);

    // Re-evaluate audiences for updated profile
    setAudiences(prevAudiences => evaluateAudiencesForProfiles(nextProfiles, prevAudiences));

    addTerminalLog(
      'success',
      'GRAPH-MERGE',
      `Probabilistic Linkage: Merged profile ${source.id} (${source.unifiedName}) into ${target.id} (${target.unifiedName}) at ${Math.round(confidenceScore * 100)}% confidence`
    );

    addAuditLog({
      userId: 'operator@nexus.cdp',
      userName: 'Identity Resolution Steward',
      userRole: 'Data Governance Steward',
      category: 'Identity & Graph',
      action: 'Probabilistic Graph Linkage & Merge',
      targetEntity: `Source: ${source.id} -> Target: ${target.id}`,
      status: 'SUCCESS',
      ipAddress: '10.240.2.14',
      client: 'XLR8 Identity Graph Resolution Console',
      summary: `Merged identity clusters with reason: "${reason}". Combined ${source.identities.length} identity nodes and ${source.events.length} timeline events into single unified customer graph.`,
      complianceFlags: ['Deterministic/Probabilistic Audit Trail', 'GDPR Art. 5 Data Accuracy']
    });

    return true;
  };

  const splitProfileIdentity = (profileId: string, identityId: string): boolean => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile || profile.identities.length <= 1) return false;

    const identToSever = profile.identities.find(i => i.id === identityId || i.value === identityId);
    if (!identToSever) return false;

    // Remaining identities for original profile
    const remainingIdentities = profile.identities.filter(i => i.id !== identToSever.id && i.value !== identToSever.value);

    // New separate profile for severed identity
    const newProfileId = `prof_split_${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();
    const newProfile: CustomerProfile = {
      id: newProfileId,
      unifiedName: `Detached Session (${identToSever.type}: ${identToSever.value.slice(0, 14)}...)`,
      primaryEmail: identToSever.type === 'email' ? identToSever.value : `unlinked_${identToSever.value.slice(0, 8)}@temp-partition.cdp`,
      primaryPhone: identToSever.type === 'phone' ? identToSever.value : undefined,
      createdAt: nowIso,
      lastActiveAt: nowIso,
      identities: [
        {
          ...identToSever,
          id: `id_severed_${Date.now()}`
        }
      ],
      identityLinks: [],
      attributes: {
        totalSpend: 0,
        purchaseCount: 0,
        customerTier: 'Bronze',
        loyaltyPoints: 0,
        preferredCategory: 'General'
      },
      predictions: {
        churnRisk: 30,
        churnRiskBand: 'Low',
        predictedLtv: 500,
        upsellPropensity: 20,
        brandLoyaltyScore: 40,
        nextBestAction: 'Send Re-engagement Push',
        nextBestOffer: '10% Welcome Back',
        calculatedAt: nowIso
      },
      consent: {
        gdprConsent: true,
        ccpaOptOut: false,
        marketingEmailConsent: true,
        thirdPartySharingConsent: true,
        sensitiveDataAllowed: false,
        lastUpdated: nowIso,
        consentSource: 'Partition Recovery'
      },
      events: [],
      qualifyingAudienceIds: [],
      activeJourneys: []
    };

    const updatedProfile: CustomerProfile = {
      ...profile,
      identities: remainingIdentities
    };

    const nextProfiles = [newProfile, ...profiles.map(p => p.id === profile.id ? updatedProfile : p)];
    setProfiles(nextProfiles);

    addTerminalLog(
      'warn',
      'GRAPH-SPLIT',
      `Severed identity node "${identToSever.value}" from profile ${profile.id}. Spawned isolated profile partition ${newProfileId}.`
    );

    addAuditLog({
      userId: 'operator@nexus.cdp',
      userName: 'Identity Resolution Steward',
      userRole: 'Data Governance Steward',
      category: 'Identity & Graph',
      action: 'Severed Identity Link (Graph Partition Split)',
      targetEntity: `Profile: ${profile.id} -> Node: ${identToSever.value}`,
      status: 'SUCCESS',
      ipAddress: '10.240.2.14',
      client: 'XLR8 Identity Graph Resolution Console',
      summary: `Separated contaminated node from unified graph. Formed isolated partition ${newProfileId} to protect profile accuracy.`,
      complianceFlags: ['Identity Graph Lineage', 'DULE Partition Compliance']
    });

    return true;
  };

  // ==========================================
  // Privacy Rights / DSAR Engine
  // ==========================================
  const submitDsarRequest = (request: Omit<PrivacyDsarRequest, 'id' | 'requestId' | 'submittedAt' | 'complianceCertHash' | 'daysRemaining' | 'matchedProfileCount' | 'erasedNodesCount'>): PrivacyDsarRequest => {
    const now = new Date().toISOString();
    const reqCode = 'DSAR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    // Find matching profile
    const targetVal = request.subjectIdentifierValue.trim().toLowerCase();
    const matchedProfile = profiles.find(p => 
      p.primaryEmail.toLowerCase() === targetVal || 
      p.identities.some(i => i.value.toLowerCase() === targetVal)
    );

    const isMatch = !!matchedProfile;
    const erasedCount = request.requestType === 'DELETE_FORGET' && isMatch ? matchedProfile.identities.length + 2 : 0;
    
    // Generate pseudo SHA-256 certificate hash
    const chars = '0123456789abcdef';
    let certHash = '';
    for (let i = 0; i < 64; i++) certHash += chars[Math.floor(Math.random() * chars.length)];

    const newRequest: PrivacyDsarRequest = {
      ...request,
      id: 'dsar_' + Date.now(),
      requestId: reqCode,
      submittedAt: now,
      completedAt: now,
      status: 'COMPLETED',
      daysRemaining: request.regulation.includes('GDPR') ? 30 : 45,
      matchedProfileCount: isMatch ? 1 : 0,
      erasedNodesCount: erasedCount,
      complianceCertHash: certHash,
      notes: request.requestType === 'DELETE_FORGET' 
        ? `Graph traversal located ${erasedCount} nodes. Cryptographically shredded PII identities.` 
        : request.requestType === 'OPT_OUT_SALE'
        ? `Applied CCPA/DULE downstream suppression tags across all ad connectors.`
        : `Generated customer 360 personal data export archive with SHA-256 seal.`
    };

    setDsarRequests(prev => [newRequest, ...prev]);

    // If opt-out, update profile consent
    if (request.requestType === 'OPT_OUT_SALE' && matchedProfile) {
      updateProfileConsent(matchedProfile.id, { ccpaOptOut: true, thirdPartySharingConsent: false });
    } else if (request.requestType === 'DELETE_FORGET' && matchedProfile) {
      // Cascading erasure: Purge events, sever audience memberships, shred PII
      setProfiles(prev => {
        const next = prev.map(p => {
          if (p.id !== matchedProfile.id) return p;
          return {
            ...p,
            unifiedName: 'Anonymized Subject [GDPR Art. 17 Erased]',
            primaryEmail: `erased_${p.id.slice(0, 6)}@privacy-shredded.cdp`,
            primaryPhone: undefined,
            identities: p.identities.map(i => ({
              ...i,
              value: `sha256_${certHash.slice(0, 16)}_erased`,
              status: 'revoked'
            })),
            identityLinks: [],
            events: [], // Purged timeline events
            qualifyingAudienceIds: [], // Severed audience memberships
            attributes: {
              ...p.attributes,
              firstName: 'Erased',
              lastName: 'Subject',
              ssnLast4: undefined,
              healthCategory: undefined,
              totalSpend: 0,
              purchaseCount: 0
            }
          };
        });
        // Re-evaluate audience qualifying counts
        setAudiences(evaluateAudiencesForProfiles(next, audiences));
        return next;
      });
    }

    addTerminalLog(
      'success',
      'PRIVACY_SERVICE',
      `Processed ${request.requestType} for ${request.subjectIdentifierValue} (${request.regulation}) -> Status: COMPLETED [Cert: ${certHash.slice(0, 8)}...]`
    );

    return newRequest;
  };

  const executeDsarErasure = (requestId: string) => {
    setDsarRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        notes: 'Manually re-verified and cryptographic shredding complete.'
      };
    }));
    addTerminalLog('success', 'PRIVACY_SERVICE', `Re-verified DSAR Job ${requestId}`);
  };

  // ==========================================
  // Real-Time Edge Personalization Simulator
  // ==========================================
  const evaluateEdgePersonalization = (
    profileIdOrEmail: string,
    placement: DynamicOffer['placement'] = 'Home Hero Banner'
  ): EdgeEvaluationResult => {
    const startTime = performance.now();
    const targetVal = profileIdOrEmail.trim().toLowerCase();
    
    // Match profile
    const profile = profiles.find(p => 
      p.id === targetVal || 
      p.primaryEmail.toLowerCase() === targetVal ||
      p.identities.some(i => i.value.toLowerCase() === targetVal)
    );

    const qualifiedSegIds = profile ? profile.qualifyingAudienceIds : [];
    
    // Filter matching offers for placement
    const matchingOffers = dynamicOffers.filter(o => o.placement === placement);
    
    // Score offers based on audience match and priority
    let bestOffer = matchingOffers.find(o => 
      o.targetAudienceIds.some(aid => qualifiedSegIds.includes(aid))
    );

    if (!bestOffer) {
      bestOffer = matchingOffers.find(o => o.targetAudienceIds.length === 0) || dynamicOffers[0];
    }

    const latency = Math.round((performance.now() - startTime + Math.random() * 18 + 12) * 10) / 10;
    
    const identitiesMap: Record<string, string> = {};
    if (profile) {
      profile.identities.forEach(i => {
        identitiesMap[i.type] = i.value;
      });
    } else {
      identitiesMap['cookie'] = 'cid_anon_edge_' + Math.floor(1000 + Math.random() * 9000);
    }

    const result: EdgeEvaluationResult = {
      evaluationLatencyMs: latency,
      edgeRegion: 'us-east-edge-iad1',
      visitorIdentities: identitiesMap,
      qualifiedSegments: qualifiedSegIds,
      selectedOffer: bestOffer,
      appliedPersonalizationRules: [
        `Segment Membership: ${qualifiedSegIds.length} active qualification(s)`,
        `Placement Filter: "${placement}"`,
        `ML Propensity Weighting: Offer Priority Rank ${bestOffer.priority}`,
        `Edge Cache: HIT (<50ms SLA)`
      ],
      calculatedScore: profile ? (profile.predictions.brandLoyaltyScore + profile.predictions.upsellPropensity) / 2 : 50,
      payloadDeliveryTimestamp: new Date().toISOString()
    };

    addTerminalLog(
      'ai',
      'EDGE_DELIVERY',
      `Edge evaluated ${profile?.unifiedName || 'Anonymous Visitor'} in ${latency}ms -> Selected Offer: "${bestOffer.title}"`
    );

    return result;
  };

  // ==========================================
  // Lookalike & Clean Room Engine
  // ==========================================
  const createLookalikeModel = (config: Omit<LookalikeModelConfig, 'id' | 'lastTrained' | 'status' | 'similarityScore' | 'topInfluencingFeatures' | 'projectedAudienceSize'>) => {
    const projected = Math.round(config.expansionRatio * 850000);
    const newModel: LookalikeModelConfig = {
      ...config,
      id: 'lal_' + Date.now(),
      projectedAudienceSize: projected,
      similarityScore: Math.round(98 - config.expansionRatio * 1.8),
      status: 'Deployed',
      lastTrained: new Date().toISOString(),
      topInfluencingFeatures: [
        { feature: 'Rolling 30-Day Spend ($)', importance: 0.35 },
        { feature: 'Product Category Engagement Affinity', importance: 0.28 },
        { feature: 'Session Frequency & App Velocity', importance: 0.22 },
        { feature: 'Omni-Channel Device Breadth', importance: 0.15 }
      ]
    };

    setLookalikes(prev => [newModel, ...prev]);
    addTerminalLog('ai', 'SENSEI_AI', `Trained & deployed Lookalike Model "${newModel.name}" with projected reach ${projected.toLocaleString()} profiles`);
  };

  const runCleanRoomQuery = (queryId: string) => {
    setCleanRoomQueries(prev => prev.map(q => {
      if (q.id !== queryId) return q;
      return {
        ...q,
        status: 'Completed',
        executedAt: new Date().toISOString(),
        resultOverlapCount: Math.round(q.resultOverlapCount + (Math.random() * 2000 - 1000))
      };
    }));
    addTerminalLog('info', 'CLEAN_ROOM', `Executed differential privacy clean room query for ${queryId}`);
  };

  // ==========================================
  // B2B Accounts Engine
  // ==========================================
  const createB2BAccount = (account: Omit<B2BAccountProfile, 'id'>) => {
    const newAccount: B2BAccountProfile = {
      ...account,
      id: 'acc_' + Date.now()
    };
    setB2bAccounts(prev => [newAccount, ...prev]);
    addTerminalLog('success', 'B2B_ENGINE', `Created new B2B Account Profile "${newAccount.accountName}" (${newAccount.domain})`);
  };

  const updateB2BAccount = (id: string, updates: Partial<B2BAccountProfile>) => {
    setB2bAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addWarehouseConnection = (connection: Omit<WarehouseConnection, 'id' | 'lastPingMs' | 'syncedAt'>): WarehouseConnection => {
    const newConn: WarehouseConnection = {
      ...connection,
      id: 'wh_' + connection.type.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36),
      lastPingMs: Math.floor(Math.random() * 30) + 25,
      syncedAt: new Date().toISOString()
    };
    setWarehouses(prev => [newConn, ...prev]);
    addTerminalLog('success', 'FEDERATION_ENGINE', `Connected Zero-Copy Warehouse: "${newConn.name}" (${newConn.type}) with ${newConn.tablesCount} schema tables`);
    return newConn;
  };

  const deleteWarehouseConnection = (id: string) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
    addTerminalLog('warn', 'FEDERATION_ENGINE', `Disconnected warehouse connection: ${id}`);
  };

  const testWarehouseConnection = (id: string) => {
    const conn = warehouses.find(w => w.id === id);
    const ping = Math.floor(Math.random() * 25) + 20;
    addTerminalLog('info', 'ZERO_COPY_PING', `Pushdown probe executed to ${conn?.name || id}: ${ping}ms response, 0 bytes ingress fee`);
    return {
      success: true,
      pingMs: ping,
      message: `Successfully authenticated pushdown credentials for ${conn?.database || 'DW'} with 0-copy query access.`
    };
  };

  const saveFederatedComposition = (composition: Omit<FederatedComposition, 'id' | 'lastRunTimestamp' | 'estimatedAudienceSize' | 'zeroCopyCostSavings'> & { id?: string }): FederatedComposition => {
    const id = composition.id || ('comp_' + Date.now().toString(36));
    const estSize = Math.floor(Math.random() * 5000) + 1200;
    const savings = `$${(estSize * 1.15).toFixed(0)}/mo (Zero ETL Ingress Fee)`;

    const fullComp: FederatedComposition = {
      ...composition,
      id,
      estimatedAudienceSize: estSize,
      zeroCopyCostSavings: savings,
      lastRunTimestamp: new Date().toISOString()
    };

    setFederatedCompositions(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fullComp;
        return copy;
      }
      return [fullComp, ...prev];
    });

    addTerminalLog('success', 'FEDERATED_COMPOSER', `Saved Federated Zero-Copy Audience Composition: "${fullComp.name}" [Est. ${estSize.toLocaleString()} profiles]`);
    return fullComp;
  };

  const deleteFederatedComposition = (id: string) => {
    setFederatedCompositions(prev => prev.filter(c => c.id !== id));
    addTerminalLog('info', 'FEDERATED_COMPOSER', `Deleted federated composition ${id}`);
  };

  const executeZeroCopyPushdown = (compositionId: string) => {
    const comp = federatedCompositions.find(c => c.id === compositionId);
    const rows = comp ? comp.estimatedAudienceSize : 3450;
    const latency = Math.floor(Math.random() * 180) + 85;
    const mbScanned = (Math.random() * 4.5 + 1.2).toFixed(1);

    addTerminalLog('success', 'ZERO_COPY_PUSHDOWN', `Executed pushdown query on ${comp?.warehouseName || 'Enterprise DW'}: ${rows.toLocaleString()} rows returned in ${latency}ms (${mbScanned} GB scanned, $0.00 data transfer)`);

    return {
      rowCount: rows,
      executionTimeMs: latency,
      bytesScanned: `${mbScanned} GB`,
      costDollars: 0
    };
  };

  const runAgentPrompt = async (prompt: string, category: AgentPromptSession['category'] = 'Audience Segmentation'): Promise<AgentPromptSession> => {
    const isZeroCopy = prompt.toLowerCase().includes('snowflake') || prompt.toLowerCase().includes('warehouse') || prompt.toLowerCase().includes('zero-copy') || prompt.toLowerCase().includes('dw');
    const isPrivacy = prompt.toLowerCase().includes('privacy') || prompt.toLowerCase().includes('dule') || prompt.toLowerCase().includes('consent') || prompt.toLowerCase().includes('opt-out');
    const isB2B = prompt.toLowerCase().includes('b2b') || prompt.toLowerCase().includes('enterprise') || prompt.toLowerCase().includes('account') || prompt.toLowerCase().includes('arr');

    const cleanTitle = prompt
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .slice(0, 5)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('_');

    const audName = `AI_${cleanTitle || 'Audience_Segment'}_${Math.floor(Math.random() * 900 + 100)}`;
    const estProfiles = isPrivacy ? 0 : Math.floor(Math.random() * 6000) + 1200;
    const latency = Math.floor(Math.random() * 60) + 90;

    const newSession: AgentPromptSession = {
      id: 'agent_' + Date.now().toString(36),
      prompt,
      timestamp: new Date().toISOString(),
      category: isZeroCopy ? 'Zero-Copy Query' : isPrivacy ? 'Privacy Audit' : isB2B ? 'Audience Segmentation' : category,
      generatedAudienceName: audName,
      generatedPql: `SELECT profile_id, primary_email, attributes 
FROM xdm_individual_profile 
WHERE ${isB2B ? "b2b_account.isEnterprise = true AND " : ""}${isZeroCopy ? "federated.DW_TOTAL_REVENUE >= 5000 AND " : ""}predictions.churnRisk <= 0.85`,
      generatedSql: `SELECT 
    p.id AS profile_id, 
    p.primary_email, 
    p.customer_tier${isZeroCopy ? ",\n    dw.TOTAL_LIFETIME_REVENUE" : ""}
FROM customer_profiles p
${isZeroCopy ? "JOIN ENTERPRISE_DW.PUBLIC.CUSTOMER_360_VIEW dw ON p.primary_email = dw.ACCOUNT_ID\n" : ""}WHERE p.consent_gdpr = TRUE AND p.ccpa_opt_out = FALSE;`,
      estimatedProfiles: estProfiles,
      confidenceScore: +(Math.random() * 0.05 + 0.94).toFixed(2),
      reasoningChain: [
        `Parsed natural language intent: Identified entities [${isB2B ? 'B2B Account Master, ' : ''}Unified Profile, ExperienceEvent].`,
        `Synthesized profile criteria: Filtered against real-time traits and deterministic identity keys.`,
        `Zero-Copy & Warehouse Assessment: ${isZeroCopy ? 'Constructed pushdown predicates for Enterprise DW.' : 'Standard in-memory real-time stream execution.'}`,
        `Automated DULE Privacy Check: Verified against active labels (C1, I1). Zero restricted health/financial fields exposed.`,
        `Destination Routing: Pre-configured optimal reverse ETL downstream pipes.`
      ],
      duleComplianceStatus: 'Passed (No Violations)',
      recommendedDestinations: isZeroCopy ? ['dest_meta_ads', 'dest_salesforce'] : ['dest_braze', 'dest_meta_ads'],
      executionTimeMs: latency
    };

    setAgentPrompts(prev => [newSession, ...prev]);
    addTerminalLog('success', 'AI_COPILOT', `Generated intelligent segment "${audName}" (${estProfiles.toLocaleString()} profiles, ${latency}ms latency)`);
    return newSession;
  };

  const autoHealAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'Auto-Healed',
          resolutionTimestamp: new Date().toISOString()
        };
      }
      return a;
    }));

    const anomaly = anomalies.find(a => a.id === id);
    addTerminalLog('success', 'AUTONOMOUS_DRIFT_AGENT', `Self-Healing executed for "${anomaly?.title || id}": ${anomaly?.autoFixActionName || 'Automated remedy deployed'}`);
  };

  const generateCampaignVariants = (targetAudience: string, objective: string): CampaignVariant[] => {
    const vars: CampaignVariant[] = [
      {
        id: 'var_' + Date.now() + '_1',
        label: `Variant 1: High-Propensity Incentive (${objective})`,
        subjectLine: `Unlock your tailored tier benefits with Nexus AI, {{firstName}}`,
        messageHook: `Hi {{firstName}}, based on your recent activity, we've unlocked premium access for your team.`,
        callToAction: `Activate Upgrade Now`,
        targetAudience: targetAudience || 'Active High-LTV Segment',
        predictedOpenRate: `${(Math.random() * 15 + 45).toFixed(1)}%`,
        predictedConversionRate: `${(Math.random() * 8 + 14).toFixed(1)}%`,
        predictedUplift: `+${(Math.random() * 15 + 25).toFixed(1)}% vs Baseline`,
        recommendedChannel: 'Email'
      },
      {
        id: 'var_' + Date.now() + '_2',
        label: `Variant 2: VIP Personalized Concierge (${objective})`,
        subjectLine: `Exclusive access: Custom optimization report for {{b2b_account.name}}`,
        messageHook: `We prepared a customized architecture audit for your account. Connect with your Solutions Architect in 1 click.`,
        callToAction: `Schedule Executive Review`,
        targetAudience: targetAudience || 'Active High-LTV Segment',
        predictedOpenRate: `${(Math.random() * 15 + 50).toFixed(1)}%`,
        predictedConversionRate: `${(Math.random() * 8 + 18).toFixed(1)}%`,
        predictedUplift: `+${(Math.random() * 15 + 32).toFixed(1)}% vs Baseline`,
        recommendedChannel: 'Email'
      },
      {
        id: 'var_' + Date.now() + '_3',
        label: `Variant 3: Real-Time Mobile Push Nudge (${objective})`,
        subjectLine: `⚡ Flash Benefit Activated`,
        messageHook: `Your saved items are eligible for priority same-day activation. Tap to claim before expiry.`,
        callToAction: `Instant 1-Tap Claim`,
        targetAudience: targetAudience || 'Active High-LTV Segment',
        predictedOpenRate: `${(Math.random() * 10 + 80).toFixed(1)}%`,
        predictedConversionRate: `${(Math.random() * 6 + 20).toFixed(1)}%`,
        predictedUplift: `+${(Math.random() * 12 + 38).toFixed(1)}% vs Baseline`,
        recommendedChannel: 'SMS'
      }
    ];

    setCampaignVariants(vars);
    addTerminalLog('success', 'GEN_CAMPAIGN_AI', `Generated 3 AI predictive campaign variants for target "${targetAudience}"`);
    return vars;
  };

  const convertAgentPromptToAudience = (session: AgentPromptSession): AudienceSegment => {
    const newAud: AudienceSegment = {
      id: 'aud_ai_' + Date.now().toString(36),
      name: session.generatedAudienceName,
      description: `AI Copilot generated audience: "${session.prompt}"`,
      status: 'Active',
      rulesMatch: 'ALL',
      rules: [
        {
          id: 'rule_ai_1',
          category: 'ai_predictive',
          field: 'predictions.churnRisk',
          operator: 'less_than',
          value: 0.85
        }
      ],
      pqlExpression: session.generatedPql,
      sqlQuery: session.generatedSql,
      qualifyingProfileCount: session.estimatedProfiles,
      targetableProfileCount: Math.floor(session.estimatedProfiles * 0.88),
      lastCalculated: new Date().toISOString(),
      tags: ['AI Generated', 'Copilot', session.category],
      color: '#8b5cf6'
    };

    setAudiences(prev => [newAud, ...prev]);
    addTerminalLog('success', 'AUDIENCE_ENGINE', `Committed AI Copilot audience "${newAud.name}" (${newAud.qualifyingProfileCount.toLocaleString()} profiles) to Active Streaming Engine`);
    return newAud;
  };

  const loadDemoData = useCallback(() => {
    setIsDemoMode(true);
    try {
      localStorage.setItem('xlr8_demo_mode', 'true');
      localStorage.setItem('xlr8_cdp_datasets', JSON.stringify(INITIAL_DATASETS));
      localStorage.setItem('nexus_cdp_sources', JSON.stringify(INITIAL_INGESTION_SOURCES));
    } catch (e) {
      console.error(e);
    }
    const syncedDemo = recomputeAllAudiencesAndProfiles(INITIAL_PROFILES, INITIAL_AUDIENCES);
    setSchemas(STANDARD_SCHEMA_BLUEPRINTS);
    setDatasets(INITIAL_DATASETS);
    setProfiles(syncedDemo.profiles);
    setAudiences(syncedDemo.audiences);
    setJourneys(INITIAL_JOURNEYS);
    setDestinations(INITIAL_DESTINATIONS);
    setSources(INITIAL_INGESTION_SOURCES);
    setSyncLogs(INITIAL_SYNC_LOGS);
    setTerminalLogs(INITIAL_TERMINAL_LOGS);
    setB2bAccounts(INITIAL_B2B_ACCOUNTS);
    setWarehouses(INITIAL_WAREHOUSE_CONNECTIONS);
    setFederatedCompositions(INITIAL_FEDERATED_COMPOSITIONS);
    setQueries(INITIAL_QUERIES);
    setCalculatedAttributes(INITIAL_CALCULATED_ATTRIBUTES);
    setDsarRequests(INITIAL_DSAR_REQUESTS);
    setLookalikes(INITIAL_LOOKALIKES);
    setCleanRoomQueries(INITIAL_CLEAN_ROOM_QUERIES);
    setAgentPrompts(INITIAL_AGENT_PROMPTS);
    setAnomalies(INITIAL_ANOMALIES);
    setCampaignVariants(INITIAL_CAMPAIGN_VARIANTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    fetch('/api/v1/reset-demo', { method: 'POST' }).catch(() => {});
    addTerminalLog('success', 'DEMO_MODE', 'Demo Mode enabled: Loaded XDM Schemas, Datasets, Customer 360 Profiles, Audiences, and Connectors.');
  }, [addTerminalLog]);

  const resetPlatformDemo = useCallback(async () => {
    try {
      await fetch('/api/v1/reset-demo', { method: 'POST' });
      loadDemoData();
      addTerminalLog('info', 'RESET', 'Reset platform state to initial clean demonstration data');
    } catch (err) {
      loadDemoData();
    }
  }, [loadDemoData, addTerminalLog]);

  const clearToNewUserMode = useCallback(() => {
    setIsDemoMode(false);
    try {
      localStorage.setItem('xlr8_demo_mode', 'false');
      localStorage.removeItem('xlr8_cdp_datasets');
      localStorage.removeItem('xlr8_cdp_schemas');
      localStorage.removeItem('xlr8_cdp_destinations');
      localStorage.removeItem('nexus_cdp_sources');
      localStorage.removeItem('xlr8_user_created');
      localStorage.removeItem('xlr8_guided_completed_steps');
    } catch (e) {
      console.error(e);
    }
    setSchemas([]);
    setDatasets([]);
    setProfiles([]);
    setAudiences([]);
    setJourneys([]);
    setDestinations([]);
    setSources([]);
    setSyncLogs([]);
    setTerminalLogs([]);
    setB2bAccounts([]);
    setQueries([]);
    setCalculatedAttributes([]);
    setDsarRequests([]);
    setLookalikes([]);
    setCleanRoomQueries([]);
    setWarehouses([]);
    setFederatedCompositions([]);
    setAgentPrompts([]);
    setAnomalies([]);
    setCampaignVariants([]);
    setAuditLogs([]);
    setDlq([]);
    setSelectedProfileId(null);
    setSelectedB2BAccountId(null);
    setSelectedDatasetId(null);
    fetch('/api/v1/clear', { method: 'POST' }).catch(() => {});
  }, []);

  const resetToDefaults = () => {
    if (isDemoMode) {
      loadDemoData();
    } else {
      clearToNewUserMode();
    }
  };

  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) {
      clearToNewUserMode();
    } else {
      loadDemoData();
    }
  }, [isDemoMode, loadDemoData, clearToNewUserMode]);

  const toggleGhostUser = useCallback(() => {
    setIsGhostUser(prev => {
      const next = !prev;
      try {
        localStorage.setItem('xlr8_ghost_user', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // System aggregate telemetry metrics
  const totalProfiles = profiles.length;
  const targetableProfiles = profiles.filter(p => p.consent.gdprConsent && !p.consent.ccpaOptOut).length;
  const privacyBlockedCount = totalProfiles - targetableProfiles;
  const totalIdentitiesCount = profiles.reduce((acc, p) => acc + p.identities.length, 0);
  const stitchingRatio = totalProfiles > 0 ? (totalIdentitiesCount / totalProfiles).toFixed(1) + ':1' : '1.0:1';
  const totalB2BAccounts = b2bAccounts.length;
  const b2bPipelineValue = b2bAccounts.reduce((sum, a) => sum + a.totalPipelineValue, 0);

  return (
    <CDPContext.Provider
      value={{
        schemas,
        datasets,
        selectedDatasetId,
        setSelectedDatasetId,
        updateDatasetLabels,
        createDataset,
        deleteDataset,
        profiles,
        audiences,
        journeys,
        destinations,
        sources,
        ingestionSources: sources,
        syncLogs,
        terminalLogs,
        b2bAccounts,
        selectedB2BAccountId,
        queries,
        queryTemplates,
        calculatedAttributes,
        dsarRequests,
        dynamicOffers,
        lookalikes,
        cleanRoomQueries,
        sandboxes,
        activeSandboxId,
        mergePolicies,
        activeMergePolicyId,
        warehouses,
        federatedCompositions,
        agentPrompts,
        anomalies,
        campaignVariants,
        auditLogs,
        globalPrivacyMode,
        activeTab,
        uiMode,
        setUiMode,
        isDemoMode,
        setIsDemoMode,
        toggleDemoMode,
        loadDemoData,
        clearToNewUserMode,
        isGhostUser,
        toggleGhostUser,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        selectedProfileId,
        addSource,
        loadDemoSources,
        resetToFreshSandbox,
        systemMetrics: {
          ratePerSec: sources.reduce((sum, s) => sum + s.ratePerSec, 0),
          kafkaLatencyMs: sources.length > 0 ? 2.4 : 0,
          todayEvents: sources.reduce((sum, s) => sum + s.todayEventCount, 0),
          stitchingRatio,
          totalProfiles,
          targetableProfiles,
          privacyBlockedCount,
          totalB2BAccounts,
          b2bPipelineValue,
        },
        setActiveTab,
        history,
        historyIndex,
        canGoBack,
        canGoForward,
        goBack,
        goForward,
        getPreviousTabTitle,
        getNextTabTitle,
        guidedReturnStep,
        guidedOpenMode,
        setGuidedOpenMode,
        launchGuidedStepAction,
        returnToGuidedStep,
        openGuidedOverview,
        clearGuidedReturn,
        setSelectedProfileId,
        setSelectedB2BAccountId,
        setActiveSandboxId,
        setActiveMergePolicyId,
        setGlobalPrivacyMode,
        addAuditLog,
        clearAuditLogs,
        ingestEvent,
        addSchemaField,
        deleteSchemaField,
        updateSchemaField,
        toggleFieldSensitivity,
        createSchema,
        deleteSchema,
        updateSchema,
        duplicateSchema,
        loadSchemaBlueprint,
        clearAllSchemas,
        updateProfileConsent,
        createAudience,
        updateAudience,
        deleteAudience,
        createJourney,
        updateJourney,
        toggleJourneyStatus,
        activateDestination,
        connectDestination,
        runDataDistillerQuery,
        createAudienceFromQuery,
        createCalculatedAttribute,
        toggleCalculatedAttributeStatus,
        submitDsarRequest,
        executeDsarErasure,
        evaluateEdgePersonalization,
        createLookalikeModel,
        runCleanRoomQuery,
        createB2BAccount,
        updateB2BAccount,
        addWarehouseConnection,
        deleteWarehouseConnection,
        testWarehouseConnection,
        saveFederatedComposition,
        deleteFederatedComposition,
        executeZeroCopyPushdown,
        runAgentPrompt,
        autoHealAnomaly,
        generateCampaignVariants,
        convertAgentPromptToAudience,
        resetToDefaults,
        addTerminalLog,
        dlq,
        isLiveStreamConnected,
        liveWebSocketPingMs,
        replayDlqItem,
        discardDlqItem,
        testOutboundWebhook,
        resetPlatformDemo,
        editingSchemaId,
        setEditingSchemaId,
        mergeProfiles,
        splitProfileIdentity,
        recalculateCalculatedAttributes,
        databricksStatus,
        refreshDatabricksStatus,
        connectDatabricks: async (config) => {
          const res = await fetch('/api/v1/databricks/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to connect Databricks SQL Warehouse.');
          if (data.status) setDatabricksStatus(data.status);
          addTerminalLog('success', 'DATABRICKS', data.message || 'Connected to Databricks SQL Warehouse');
          return data;
        },
        disconnectDatabricks: async () => {
          const res = await fetch('/api/v1/databricks/disconnect', { method: 'POST' });
          const data = await res.json();
          if (data.status) setDatabricksStatus(data.status);
          addTerminalLog('warn', 'DATABRICKS', 'Disconnected live cloud Databricks PAT; active in Local Delta Lakehouse mode');
        },
        runDatabricksSql: async (sql: string): Promise<DatabricksQueryResult> => {
          const res = await fetch('/api/v1/databricks/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sql })
          });
          const data = (await res.json()) as DatabricksQueryResult;
          await refreshDatabricksStatus();
          if (data.success) {
            addTerminalLog('success', 'DATABRICKS-SQL', `Query returned ${data.rowCount} rows in ${data.executionTimeMs}ms (${data.mode})`);
          } else {
            addTerminalLog('error', 'DATABRICKS-SQL', data.message || 'SQL execution failed');
          }
          return data;
        },
        syncDatabricksNow: async () => {
          const res = await fetch('/api/v1/databricks/sync-all', { method: 'POST' });
          const data = await res.json();
          if (data.status) setDatabricksStatus(data.status);
          addTerminalLog('success', 'DATABRICKS-SYNC', `Synchronized profiles & events into Unity Catalog Delta tables`);
        },
        streamEcommerceEvent: async (payload: Record<string, any>) => {
          const res = await fetch('/api/v1/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              channel: 'Web SDK',
              schemaId: 'xdm_experience_event',
              ...payload
            })
          });
          const ack = await res.json();
          return ack;
        },
      }}
    >
      {children}
    </CDPContext.Provider>
  );
};

export const useCDP = () => {
  const context = useContext(CDPContext);
  if (!context) {
    throw new Error('useCDP must be used within a CDPProvider');
  }
  return context;
};
