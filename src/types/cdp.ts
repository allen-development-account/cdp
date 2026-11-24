export type PrivacyClassification = 'Standard' | 'Sensitive' | 'Financial' | 'Health' | 'Behavioral';

export type PrivacyLabelCategoryType = 'Contract' | 'Identity' | 'Sensitive' | 'Regulatory';

export interface PrivacyLabelDefinition {
  code: string; // e.g. 'C1', 'C2', 'I1', 'I2', 'S1', 'S2', 'R1', 'R2'
  category: PrivacyLabelCategoryType;
  name: string;
  description: string;
  usageRestrictions: string;
  crispPurpose?: string; // Crisp 1-sentence purpose
  defaultAction: 'Block' | 'Mask_SHA256' | 'Consent_Gated' | 'Audit_Only';
  applicableRegulations: string[];
  severity: 'Critical' | 'High' | 'Medium' | 'Informational';
  taggedFieldCount?: number;
  examples: string[];
}

export interface PrivacyLabelCategory {
  id: PrivacyLabelCategoryType;
  name: string;
  codePrefix: string;
  description: string;
  badgeColor: string;
  iconName: string;
  labels: PrivacyLabelDefinition[];
}

export interface SchemaField {
  id: string;
  name: string;
  dataType: 'string' | 'number' | 'boolean' | 'timestamp' | 'object' | 'array';
  description: string;
  classification: PrivacyClassification;
  privacyLabels?: string[]; // e.g. ['C1', 'I1', 'S2']
  isIdentifier: boolean;
  identifierType?: 'cookie' | 'email' | 'phone' | 'crmId' | 'device';
  isRequired: boolean;
  isSensitive: boolean;
  maskInExports?: boolean;
  blockInAdNetworks?: boolean;
}

export interface SchemaDefinition {
  id: string;
  name: string;
  version: string;
  category: 'Profile' | 'ExperienceEvent' | 'Consent' | 'Lookup' | 'B2BAccount';
  description: string;
  fields: SchemaField[];
  createdDate: string;
  lastUpdated: string;
  baseClass?: string;
  fieldGroups?: string[];
  tenantNamespace?: string;
  status?: 'Enabled for Profile' | 'Draft' | 'Deprecated';
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  schemaId: string;
  schemaName: string;
  sourceConnectorId?: string;
  sourceConnectorName: string;
  ingestionType: 'Streaming' | 'Batch' | 'Federated Zero-Copy';
  format: 'JSON' | 'Parquet' | 'Avro' | 'CSV';
  recordCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  status: 'Active' | 'Ingesting' | 'Paused' | 'Draft';
  isProfileEnabled: boolean;
  labels: string[]; // e.g. ['C1', 'C4', 'I1', 'S4']
  fieldLabels?: Record<string, string[]>; // field path -> labels array
  createdAt: string;
  lastIngestedAt: string;
  tags?: string[];
}

export interface IdentityNode {
  id: string;
  type: 'cookie' | 'email' | 'phone' | 'crmId' | 'device';
  value: string;
  firstSeen: string;
  lastSeen: string;
  source: string;
  isPrimary?: boolean;
}

export interface IdentityLink {
  sourceId: string;
  targetId: string;
  relationship: 'deterministic' | 'probabilistic';
  confidence: number;
  establishedAt: string;
  linkedByEvent: string;
}

export interface PrivacyConsent {
  gdprConsent: boolean;
  ccpaOptOut: boolean;
  marketingEmailConsent: boolean;
  thirdPartySharingConsent: boolean;
  sensitiveDataAllowed: boolean;
  lastUpdated: string;
  consentSource: string;
}

export interface AIPredictions {
  churnRisk: number; // 0 - 100%
  churnRiskBand: 'Low' | 'Medium' | 'High';
  predictedLtv: number; // in USD
  upsellPropensity: number; // 0 - 100%
  brandLoyaltyScore: number; // 0 - 100%
  nextBestAction: string;
  nextBestOffer: string;
  calculatedAt: string;
}

export interface CDPEvent {
  id: string;
  timestamp: string;
  eventType: 'PageView' | 'AddToCart' | 'Purchase' | 'AppOpen' | 'FormSubmit' | 'ConsentUpdate' | 'SupportTicket' | 'Search' | 'ProductView';
  channel: 'Web SDK' | 'Mobile SDK' | 'Snowflake Batch' | 'Salesforce CRM' | 'POS Terminal' | 'Kafka Ingestion';
  schemaId: string;
  identifiers: {
    cookieId?: string;
    email?: string;
    phone?: string;
    crmId?: string;
    deviceToken?: string;
  };
  payload: Record<string, any>;
  stitchingLog?: {
    matchedProfileId: string;
    stitchingKey: string;
    isMerged: boolean;
    previousProfileId?: string;
  };
}

export interface CustomerProfile {
  id: string;
  unifiedName: string;
  primaryEmail: string;
  primaryPhone?: string;
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt: string;
  identities: IdentityNode[];
  identityLinks: IdentityLink[];
  attributes: {
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    country?: string;
    customerTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP';
    totalSpend: number;
    purchaseCount: number;
    lastPurchaseDate?: string;
    loyaltyPoints: number;
    company?: string;
    jobTitle?: string;
    preferredCategory?: string;
    hasActiveSubscription?: boolean;
    deviceType?: string;
    ssnLast4?: string; // sensitive
    healthCategory?: string; // sensitive
  };
  consent: PrivacyConsent;
  predictions: AIPredictions;
  events: CDPEvent[];
  qualifyingAudienceIds: string[];
  activeJourneys: {
    journeyId: string;
    journeyName: string;
    currentStepIndex: number;
    enteredAt: string;
    status: 'active' | 'completed' | 'branched';
  }[];
}

export type AudienceRuleOperator = 
  | ''
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'contains' 
  | 'in' 
  | 'event_performed' 
  | 'event_not_performed'
  | 'gte'
  | 'lte'
  | 'is_set'
  | 'is_not_set'
  | 'between';

export interface AudienceRule {
  id: string;
  category: 'attribute' | 'event' | 'ai_predictive' | 'consent' | 'calculated_attribute';
  field: string;
  operator: AudienceRuleOperator;
  value: any;
  secondValue?: any; // For 'between' operator
  timeWindowDays?: number;
  minEventCount?: number;
  eventFilterField?: string;
  eventFilterOperator?: string;
  eventFilterValue?: any;
  label?: string;
}

export interface AudienceRuleGroup {
  id: string;
  condition: 'AND' | 'OR';
  rules: AudienceRule[];
  childGroups?: AudienceRuleGroup[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Archived';
  rulesMatch: 'ALL' | 'ANY'; // AND / OR top level
  rules: AudienceRule[];
  ruleGroups?: AudienceRuleGroup[];
  pqlExpression?: string; // XLR8 Profile Query Language
  sqlQuery?: string;
  qualifyingProfileCount: number;
  targetableProfileCount: number; // minus privacy blocked
  lastCalculated: string;
  tags: string[];
  color: string;
  estimatedReachPercentage?: number;
  excludedAudienceIds?: string[];
}

export interface JourneyStep {
  id: string;
  title: string;
  type: 'trigger' | 'delay' | 'condition' | 'action';
  description: string;
  config: {
    audienceId?: string;
    delayDays?: number;
    delayHours?: number;
    conditionField?: string;
    conditionOperator?: string;
    conditionValue?: any;
    actionChannel?: 'Email' | 'Push' | 'SMS' | 'Meta Custom Audience' | 'Google Customer Match' | 'Salesforce Task' | 'Webhook';
    actionTemplate?: string;
    branchTrueStepId?: string;
    branchFalseStepId?: string;
  };
  stats: {
    enteredCount: number;
    passedCount: number;
    droppedCount: number;
  };
}

export interface JourneyDefinition {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Paused';
  triggerAudienceId: string;
  steps: JourneyStep[];
  totalEntered: number;
  totalConverted: number;
  createdAt: string;
}

export interface DestinationSyncLog {
  id: string;
  timestamp: string;
  destinationId: string;
  destinationName: string;
  audienceId: string;
  audienceName: string;
  profilesAttempted: number;
  profilesSynced: number;
  profilesBlockedPrivacy: number;
  sensitiveFieldsRedacted: number;
  status: 'Success' | 'Completed with Blocks' | 'Failed';
  details: string[];
}

export interface DestinationFieldMapping {
  sourceXdmField: string;
  targetField: string;
  transform: 'SHA-256 (Lowercase)' | 'E.164 + SHA-256' | 'Direct Value';
  isIdentity: boolean;
  enabled: boolean;
}

export interface DestinationConnector {
  id: string;
  name: string;
  icon?: string;
  category: 'Ad Networks' | 'MarTech' | 'Cloud Storage' | 'Webhooks';
  type?: 'ad_network' | 'messaging' | 'crm' | 'data_warehouse' | 'webhook';
  status: 'Connected' | 'Error' | 'Paused';
  description: string;
  allowedPrivacyLabels?: (PrivacyClassification | string)[];
  blockedPrivacyLabels?: (PrivacyClassification | string)[];
  duleEnforcedRules?: string[];
  enforcedPolicies?: string[];
  totalSynced: number;
  totalBlockedForPrivacy: number;
  lastSyncTime: string;
  syncFrequency: 'Real-Time' | 'Hourly' | 'Daily' | 'Batch 24h' | 'Batch (24h)';
  endpoint?: string;
  targetPlatform: string;
  authType?: 'OAuth2 Bearer' | 'OAuth 2.0' | 'API Key Token' | 'Service Account (GCP/AWS)' | 'Service Role' | 'Mutual TLS';
  authStatus?: 'Authenticated' | 'Requires Re-auth' | 'Configured';
  supportedIdentities?: string[];
  activeAudienceCount?: number;
  accountId?: string;
  accountType?: string;
  managerAccountId?: string;
  connectionName?: string;
  connectedUserEmail?: string;
  fieldMappings?: DestinationFieldMapping[];
  scheduleConfig?: {
    frequency: 'Real-Time' | 'Hourly' | 'Daily';
    startDate: string;
    exportMode?: 'Incremental' | 'Full Snapshot';
    externalListName?: string;
  };
  connectedAt?: string;
}

export interface IngestionSource {
  id: string;
  name: string;
  type: 'Streaming' | 'Batch' | 'Webhook';
  status: 'Healthy' | 'Degraded' | 'Idle';
  ratePerSec: number;
  todayEventCount: number;
  latencyMs: number;
  description: string;
  icon: string;
  category?: 'Web & Mobile' | 'Event Streams' | 'Enterprise CRM' | 'Data Warehouses' | 'Commerce & Retail';
  targetSchemaId?: string;
  targetSchemaName?: string;
  authMethod?: 'API Secret / Web SDK Tag' | 'mTLS / Kafka SASL' | 'OAuth 2.0 Bearer' | 'Service Role';
  lastEventReceived?: string;
  errorRatePercent?: number;
  dataFlowUrl?: string;
}

export interface LiveTerminalLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'ai';
  tag: string;
  message: string;
  meta?: Record<string, any>;
}

// ==========================================
// XLR8 RT-CDP B2B Edition Models
// ==========================================
export interface BuyingGroupMember {
  personId: string;
  fullName: string;
  email: string;
  role: 'Decision Maker' | 'Champion' | 'Economic Buyer' | 'Technical Evaluator' | 'Influencer';
  jobTitle: string;
  engagementScore: number; // 0-100
  lastActive: string;
  leadScore: number;
}

export interface B2BOpportunity {
  id: string;
  name: string;
  amount: number;
  stage: 'Discovery' | 'Solution Validation' | 'Proposal' | 'Procurement' | 'Closed Won' | 'Closed Lost';
  probability: number;
  expectedCloseDate: string;
  ownerName: string;
}

export interface B2BAccountProfile {
  id: string;
  accountName: string;
  domain: string;
  industry: string;
  naicsCode: string;
  annualRevenue: number;
  employeeCount: number;
  accountTier: 'Strategic VIP' | 'Enterprise' | 'Mid-Market' | 'Growth';
  parentAccountId?: string;
  parentAccountName?: string;
  region: string;
  headquarters: string;
  intentScore: number; // 0-100 (Bombora / 6sense surge)
  healthScore: number; // 0-100
  totalPipelineValue: number;
  buyingGroup: BuyingGroupMember[];
  opportunities: B2BOpportunity[];
  techStack: string[];
  lastEngagedAt: string;
  matchedLeadCount: number;
}

// ==========================================
// Data Distiller / SQL Query Service Models
// ==========================================
export interface QueryTemplate {
  id: string;
  name: string;
  category: 'Segmentation' | 'Attribution' | 'Data Hygiene' | 'B2B Insights' | 'RFM Scoring';
  description: string;
  sql: string;
}

export interface DataDistillerQuery {
  id: string;
  name: string;
  sql: string;
  lastRunAt: string;
  status: 'SUCCESS' | 'RUNNING' | 'ERROR' | 'QUEUED';
  executionTimeMs: number;
  rowsScanned: number;
  bytesProcessed: string;
  resultRows: Record<string, any>[];
  columns: string[];
}

// ==========================================
// Calculated Attributes Models
// ==========================================
export interface CalculatedAttributeDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  dataType: 'number' | 'string' | 'boolean' | 'timestamp';
  category: 'Spend' | 'Engagement' | 'Recency' | 'B2B Surge' | 'Loyalty';
  targetSchema: 'IndividualProfile' | 'B2BAccountProfile';
  aggregationType: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX' | 'MOST_FREQUENT' | 'DAYS_SINCE';
  sourceEvent: string;
  sourceField: string;
  lookbackDays: number;
  filterCriteria?: string;
  status: 'Active' | 'Draft' | 'Paused';
  lastEvaluated: string;
  sampleValueFormula: string;
}

// ==========================================
// Privacy Rights Management / DSAR Service Models
// ==========================================
export interface PrivacyDsarRequest {
  id: string;
  requestId: string;
  requestType: 'ACCESS_EXPORT' | 'DELETE_FORGET' | 'OPT_OUT_SALE';
  subjectIdentifierType: 'email' | 'cookie' | 'phone' | 'crmId';
  subjectIdentifierValue: string;
  regulation: 'GDPR (EU)' | 'CCPA / CPRA (California)' | 'LGPD (Brazil)' | 'HIPAA Privacy';
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING_VERIFICATION' | 'REJECTED';
  submittedAt: string;
  completedAt?: string;
  daysRemaining: number;
  matchedProfileCount: number;
  erasedNodesCount: number;
  complianceCertHash: string;
  notes: string;
}

// ==========================================
// Real-Time Edge Personalization & Decisioning
// ==========================================
export interface DynamicOffer {
  id: string;
  title: string;
  headline: string;
  subhead: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  badge: string;
  discountPercentage?: number;
  promoCode?: string;
  targetAudienceIds: string[];
  priority: number;
  placement: 'Home Hero Banner' | 'Exit Intent Modal' | 'Checkout Upsell' | 'Mobile Push Carousel';
}

export interface EdgeEvaluationResult {
  evaluationLatencyMs: number;
  edgeRegion: string;
  visitorIdentities: Record<string, string>;
  qualifiedSegments: string[];
  selectedOffer: DynamicOffer;
  appliedPersonalizationRules: string[];
  calculatedScore: number;
  payloadDeliveryTimestamp: string;
}

// ==========================================
// Sensei AI Lookalike Models & Data Clean Room
// ==========================================
export interface LookalikeModelConfig {
  id: string;
  name: string;
  seedAudienceId: string;
  seedAudienceName: string;
  expansionRatio: number; // 1% to 10%
  projectedAudienceSize: number;
  similarityScore: number; // 0-100%
  topInfluencingFeatures: { feature: string; importance: number }[];
  targetDestinations: string[];
  status: 'Trained' | 'Training' | 'Deployed';
  lastTrained: string;
}

export interface CleanRoomQuery {
  id: string;
  name: string;
  partnerName: string;
  partnerDataset: string;
  differentialPrivacyEpsilon: number; // e.g. 0.5
  minOverlapThreshold: number; // e.g. 50
  resultOverlapCount: number;
  matchRatePercentage: number;
  status: 'Ready' | 'Executing' | 'Completed';
  executedAt: string;
  querySummary: string;
}

// ==========================================
// Sandbox & Merge Policy Models
// ==========================================
export interface SandboxDefinition {
  id: string;
  name: string;
  type: 'Production' | 'Development' | 'Staging' | 'Sandbox';
  region: string;
  profileCount: number;
  datasetCount: number;
  status: 'Active' | 'Maintenance';
  isDefault?: boolean;
}

export interface MergePolicy {
  id: string;
  name: string;
  isDefault: boolean;
  graphAlgorithm: 'Deterministic Link' | 'Deterministic + Probabilistic (Confidence >= 85%)' | 'Private Identity Graph';
  attributePrecedence: 'Timestamp (Most Recent Wins)' | 'Dataset Hierarchy (CRM > Web > POS)' | 'Manual Rule-Based';
  identityDatasetOrder: string[];
  crossDeviceEnabled: boolean;
}

// ==========================================
// Federated Audience Composition & Zero-Copy
// ==========================================
export type WarehouseType = 'Snowflake' | 'Databricks' | 'BigQuery' | 'AWS Redshift' | 'Amazon S3';

export interface WarehouseConnection {
  id: string;
  name: string;
  type: WarehouseType;
  accountOrHost: string;
  database: string;
  schema: string;
  warehouseSize?: string;
  status: 'Connected' | 'Error' | 'Syncing';
  tablesCount: number;
  lastPingMs: number;
  zeroCopyEnabled: boolean;
  syncedAt: string;
  iconName: string;
  availableTables: WarehouseTableSchema[];
}

export interface WarehouseTableSchema {
  tableName: string;
  rowCount: number;
  columns: { name: string; type: string; isJoinKey?: boolean; description?: string }[];
  description: string;
}

export interface CompositionNode {
  id: string;
  type: 'warehouse_source' | 'cdp_audience' | 'join_enrich' | 'filter' | 'rank_limit' | 'destination_sync';
  title: string;
  description: string;
  config: {
    warehouseId?: string;
    tableName?: string;
    audienceId?: string;
    joinKeyWarehouse?: string;
    joinKeyCDP?: string;
    filterExpression?: string;
    rankField?: string;
    limitCount?: number;
    destinationId?: string;
    syncCadence?: 'Real-time Push' | 'Hourly' | 'Daily' | 'Manual';
  };
  outputCount: number;
  status: 'Ready' | 'Configuring' | 'Executing';
}

export interface FederatedComposition {
  id: string;
  name: string;
  description: string;
  warehouseId: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  status: 'Active' | 'Draft' | 'Paused';
  nodes: CompositionNode[];
  estimatedAudienceSize: number;
  zeroCopyCostSavings: string;
  lastRunTimestamp: string;
  pushdownSql: string;
  targetDestinations: string[];
  schedule: 'Continuous Zero-Copy' | 'Every 1 Hour' | 'Every 24 Hours' | 'Manual Trigger';
}

// ==========================================
// Agentic AI Copilot & Autonomous Drift Agent
// ==========================================
export interface AgentPromptSession {
  id: string;
  prompt: string;
  timestamp: string;
  category: 'Audience Segmentation' | 'Zero-Copy Query' | 'Privacy Audit' | 'Journey Optimization';
  generatedAudienceName: string;
  generatedPql: string;
  generatedSql: string;
  estimatedProfiles: number;
  confidenceScore: number;
  reasoningChain: string[];
  duleComplianceStatus: 'Passed (No Violations)' | 'Restricted (C1/I1 Masking Required)' | 'Gated by CCPA Opt-Out';
  recommendedDestinations: string[];
  executionTimeMs: number;
}

export interface AnomalyAlert {
  id: string;
  title: string;
  category: 'Identity Stitching' | 'Data Drift' | 'Destination Sync' | 'Consent Compliance' | 'Warehouse Federation';
  severity: 'Critical' | 'Warning' | 'Informational';
  detectedAt: string;
  impactMetric: string;
  affectedEntities: string;
  rootCause: string;
  autoFixActionName: string;
  status: 'Active' | 'Investigating' | 'Auto-Healed';
  resolutionTimestamp?: string;
}

export interface CampaignVariant {
  id: string;
  label: string;
  subjectLine: string;
  messageHook: string;
  callToAction: string;
  targetAudience: string;
  predictedOpenRate: string;
  predictedConversionRate: string;
  predictedUplift: string;
  recommendedChannel: 'Email' | 'SMS' | 'Push' | 'Meta Ad CAPI' | 'Web Modal';
}

export interface DeadLetterQueueItem {
  id: string;
  receivedAt: string;
  channel: string;
  schemaId?: string;
  errorCode: 'SCHEMA_VALIDATION_FAILED' | 'MISSING_PRIMARY_IDENTITY' | 'INVALID_JSON_FORMAT' | 'CORRUPT_PAYLOAD' | 'RATE_LIMIT_EXCEEDED';
  errorMessage: string;
  rawPayload: Record<string, any> | string;
  retryCount: number;
  status: 'PENDING' | 'REPLAYED' | 'DISCARDED';
  replayedAt?: string;
}

// ==========================================
// Enterprise Audit Logs & Compliance Trail
// ==========================================
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'Super Admin' | 'Data Architect' | 'Data Protection Officer (DPO)' | 'SecOps Engineer' | 'Automation Agent' | 'Compliance Auditor';
  category: 'Administrative Action' | 'Schema & Ingestion' | 'Privacy & Consent' | 'Audience & Activation' | 'Identity Graph' | 'Security & Auth';
  action: string;
  targetEntity: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'PENDING_APPROVAL';
  ipAddress: string;
  client: string;
  summary: string;
  details?: {
    before?: string;
    after?: string;
    jsonPayload?: Record<string, any>;
  };
  complianceFlags: string[];
}

