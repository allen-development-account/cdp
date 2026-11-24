import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { IngestionSource } from '../../types/cdp';
import { SAMPLE_PRESET_PAYLOADS } from '../../data/seedData';
import { BrandIcon } from './BrandLogos';
import {
  Search,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Plus,
  Play,
  Copy,
  Check,
  Server,
  Key,
  ShieldCheck,
  ExternalLink,
  Code,
  Activity,
  Terminal,
  Clock,
  Settings,
  RefreshCw,
  Cpu,
  Layers,
  MoreHorizontal,
  ChevronRight,
  Database,
  Lock,
  Network
} from 'lucide-react';

interface CatalogSourceCard {
  id: string;
  name: string;
  brandKey: string;
  category: string;
  type: 'Streaming' | 'Batch' | 'Webhook';
  status: 'Available' | 'Connected' | 'Beta';
  actionType: 'Set up' | 'Add data';
  isBeta?: boolean;
  description: string;
  defaultEndpoint: string;
  defaultSchema: string;
}

const CATALOG_ITEMS: CatalogSourceCard[] = [
  // XLR8 applications
  {
    id: 'xpr_analytics',
    name: 'XLR8 Analytics',
    brandKey: 'xpr',
    category: 'XLR8 applications',
    type: 'Streaming',
    status: 'Connected',
    actionType: 'Set up',
    description: 'Bi-directional telemetry feeding web hits, visits, and visitor classifications into XDM.',
    defaultEndpoint: 'https://edge.xprplatform.io/analytics/v2/stream',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'xpr_audience_manager',
    name: 'XLR8 Audience Manager',
    brandKey: 'xpr',
    category: 'XLR8 applications',
    type: 'Streaming',
    status: 'Connected',
    actionType: 'Set up',
    description: '3rd party DMP cookie sync, segment trait qualifications, and device graphs.',
    defaultEndpoint: 'https://edge.xprplatform.io/dmp/v1/sync',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'xpr_campaign_mgr',
    name: 'XLR8 Campaign Manager',
    brandKey: 'xpr',
    category: 'XLR8 applications',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Add data',
    description: 'Email delivery tracking, opens, clicks, unsubscribes, and message interaction events.',
    defaultEndpoint: 'https://edge.xprplatform.io/campaign/v1/deliveries',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'xpr_data_collection',
    name: 'XLR8 Data Collection',
    brandKey: 'xpr',
    category: 'XLR8 applications',
    type: 'Streaming',
    status: 'Connected',
    actionType: 'Add data',
    description: 'Tag management containers, client-side extensions, and Edge Network streaming.',
    defaultEndpoint: 'https://edge.xprplatform.io/ee/v1/interact?configId=xpr_prod_771',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'customer_attributes',
    name: 'Customer Attributes',
    brandKey: 'customer_attributes',
    category: 'XLR8 applications',
    type: 'Batch',
    status: 'Available',
    actionType: 'Add data',
    description: 'Enterprise offline attribute bulk sync mapping CRM IDs to online cookies.',
    defaultEndpoint: 'sftp://upload.xprplatform.io/attributes/daily/',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'marketo_engage',
    name: 'Marketo Engage',
    brandKey: 'marketo',
    category: 'XLR8 applications',
    type: 'Streaming',
    status: 'Connected',
    actionType: 'Add data',
    description: 'B2B lead scores, opportunity stages, marketing activities, and form fills.',
    defaultEndpoint: 'https://app-sj01.marketo.com/rest/v1/leads/sync',
    defaultSchema: 'xdm_b2b_account'
  },

  // Advertising
  {
    id: 'fb_insights',
    name: 'Facebook Insights',
    brandKey: 'facebook',
    category: 'Advertising',
    type: 'Streaming',
    status: 'Beta',
    actionType: 'Add data',
    isBeta: true,
    description: 'Campaign reach, impression logs, social engagement metrics, and ad spend aggregation.',
    defaultEndpoint: 'https://graph.facebook.com/v19.0/act_insights/stream',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'google_ads_beta',
    name: 'Google Ads',
    brandKey: 'google_ads',
    category: 'Advertising',
    type: 'Streaming',
    status: 'Beta',
    actionType: 'Add data',
    isBeta: true,
    description: 'Enhanced conversion adjustments, gclid click attribution, and search campaign performance.',
    defaultEndpoint: 'https://googleads.googleapis.com/v16/customers/stream',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    brandKey: 'google_ads',
    category: 'Advertising',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Standard Search, Shopping, YouTube, and Display performance dataflow sync.',
    defaultEndpoint: 'https://googleads.googleapis.com/v16/customers/reporting',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'linkedin_ads_beta',
    name: 'Linkedin Ads',
    brandKey: 'linkedin_ads',
    category: 'Advertising',
    type: 'Batch',
    status: 'Beta',
    actionType: 'Set up',
    isBeta: true,
    description: 'B2B sponsored content conversion tracking, account demographic breakdowns, and click events.',
    defaultEndpoint: 'https://api.linkedin.com/rest/adAnalyticsV2',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    brandKey: 'meta_ads',
    category: 'Advertising',
    type: 'Streaming',
    status: 'Connected',
    actionType: 'Set up',
    description: 'Meta Ads Manager telemetry, aggregate event measurement, and Instagram story campaign metrics.',
    defaultEndpoint: 'https://graph.facebook.com/v19.0/act_meta/reporting',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'pinterest_ads_beta',
    name: 'Pinterest Ads',
    brandKey: 'pinterest_ads',
    category: 'Advertising',
    type: 'Streaming',
    status: 'Beta',
    actionType: 'Set up',
    isBeta: true,
    description: 'Promoted Pins engagement, catalog shopping event attributions, and save signals.',
    defaultEndpoint: 'https://api.pinterest.com/v5/ad_accounts/analytics',
    defaultSchema: 'xdm_experience_event'
  },

  // Analytics
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    brandKey: 'google',
    category: 'Analytics',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Real-time GA4 Measurement Protocol streaming for cross-device web and app telemetry.',
    defaultEndpoint: 'https://www.google-analytics.com/mp/collect',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    brandKey: 'doubleclick',
    category: 'Analytics',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Add data',
    description: 'Product behavioral telemetry, user cohort properties, and funnel conversion milestones.',
    defaultEndpoint: 'https://api.mixpanel.com/track',
    defaultSchema: 'xdm_experience_event'
  },

  // Cloud storage
  {
    id: 'aws_s3',
    name: 'Amazon S3',
    brandKey: 'amazon_s3',
    category: 'Cloud storage',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'Automated ingestion of parquet, JSON, and CSV files via AWS S3 bucket event notifications.',
    defaultEndpoint: 's3://xpr-enterprise-cdp-datalake/inbound/',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'azure_blob',
    name: 'Azure Blob Storage',
    brandKey: 'xpr',
    category: 'Cloud storage',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'Secure Azure Blob container polling with Event Grid blob-created webhook triggers.',
    defaultEndpoint: 'https://xprcdp.blob.core.windows.net/ingest/',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'google_cloud_storage',
    name: 'Google Cloud Storage',
    brandKey: 'google',
    category: 'Cloud storage',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'Scheduled and Pub/Sub-triggered ingestion of CSV, Parquet, and NDJSON objects from GCS.',
    defaultEndpoint: 'gs://xlr8-cdp-landing/inbound/',
    defaultSchema: 'xdm_experience_event'
  },

  // Consent & Preferences
  {
    id: 'onetrust_consent',
    name: 'OneTrust Consent',
    brandKey: 'xpr',
    category: 'Consent & Preferences',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'Real-time GDPR, CCPA, and preference center opt-in/opt-out webhook synchronization.',
    defaultEndpoint: 'https://api.onetrust.com/v2/consent-receipts/webhook',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'cookiebot_cmp',
    name: 'Cookiebot CMP',
    brandKey: 'xpr',
    category: 'Consent & Preferences',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Ingest regional cookie consent state signals directly into DULE profile governance flags.',
    defaultEndpoint: 'https://consent.cookiebot.com/api/v1/stream',
    defaultSchema: 'xdm_individual_profile'
  },

  // Databases
  {
    id: 'snowflake_src',
    name: 'Snowflake',
    brandKey: 'snowflake',
    category: 'Databases',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'Snowflake Snowpipe automated stream or scheduled federated zero-copy table synchronization.',
    defaultEndpoint: 'snowflake://xy12345.us-east-1.snowflakecomputing.com/CDP_DB',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'bigquery_src',
    name: 'Google BigQuery',
    brandKey: 'google',
    category: 'Databases',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'High-throughput Storage Read API extraction and zero-copy dataset mirroring.',
    defaultEndpoint: 'bigquery://enterprise-analytics/cdp_warehouse',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'postgres_cdc',
    name: 'PostgreSQL CDC',
    brandKey: 'xpr',
    category: 'Databases',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Logical replication Change Data Capture stream for operational customer tables.',
    defaultEndpoint: 'postgres://db-prod.internal:5432/customers_cdc',
    defaultSchema: 'xdm_individual_profile'
  },

  // CRM
  {
    id: 'salesforce_crm',
    name: 'Salesforce CRM',
    brandKey: 'salesforce',
    category: 'CRM',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Change Data Capture (CDC) streaming for Contacts, Leads, Accounts, and Opportunities.',
    defaultEndpoint: 'https://enterprise.my.salesforce.com/services/data/v59.0/sobjects',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'hubspot_crm',
    name: 'HubSpot CRM',
    brandKey: 'marketo',
    category: 'CRM',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Real-time webhooks for CRM contact lifecycle stages, deals, and company properties.',
    defaultEndpoint: 'https://api.hubapi.com/crm/v3/objects/contacts',
    defaultSchema: 'xdm_individual_profile'
  },

  // Customer success
  {
    id: 'zendesk_support',
    name: 'Zendesk Support',
    brandKey: 'salesforce',
    category: 'Customer success',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'Stream customer support tickets, CSAT scores, and escalation events to update churn risk.',
    defaultEndpoint: 'https://enterprise.zendesk.com/api/v2/tickets/events',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'intercom_cs',
    name: 'Intercom',
    brandKey: 'xpr',
    category: 'Customer success',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'In-app messenger conversations, onboarding checklists, and customer health webhooks.',
    defaultEndpoint: 'https://api.intercom.io/webhooks/events',
    defaultSchema: 'xdm_experience_event'
  },

  // Data & Identity Partners
  {
    id: 'liveramp_identity',
    name: 'LiveRamp IdentityLink',
    brandKey: 'xpr',
    category: 'Data & Identity Partners',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'Deterministic RampID identity resolution and authenticated traffic enrichment.',
    defaultEndpoint: 'https://api.liveramp.com/identity/v2/resolve',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'experian_tapestry',
    name: 'Experian Demographic Sync',
    brandKey: 'customer_attributes',
    category: 'Data & Identity Partners',
    type: 'Batch',
    status: 'Available',
    actionType: 'Add data',
    description: 'Privacy-safe household & regional demographic enrichment mapped to XDM profile traits.',
    defaultEndpoint: 'sftp://exchange.experian.com/inbound/tapestry/',
    defaultSchema: 'xdm_individual_profile'
  },

  // Data sharing
  {
    id: 'snowflake_data_share',
    name: 'Snowflake Data Share',
    brandKey: 'snowflake',
    category: 'Data sharing',
    type: 'Batch',
    status: 'Available',
    actionType: 'Set up',
    description: 'Zero-copy cross-cloud data sharing from partner clean rooms and enterprise warehouses.',
    defaultEndpoint: 'snowflake://share.partner-org.us-east-1/CDP_SHARE',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'aws_data_exchange',
    name: 'AWS Data Exchange',
    brandKey: 'amazon_s3',
    category: 'Data sharing',
    type: 'Batch',
    status: 'Available',
    actionType: 'Add data',
    description: 'Ingest subscribed third-party datasets directly via AWS S3 Data Exchange revisions.',
    defaultEndpoint: 'https://dataexchange.us-east-1.amazonaws.com/v1/data-sets',
    defaultSchema: 'xdm_individual_profile'
  },

  // eCommerce
  {
    id: 'shopify_plus',
    name: 'Shopify Plus',
    brandKey: 'shopify',
    category: 'eCommerce',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Add data',
    description: 'Instant webhooks for orders, carts, checkouts, customers, and fulfillment lifecycle.',
    defaultEndpoint: 'https://shopify-ingress.xprplatform.io/webhooks/orders',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'stripe_commerce',
    name: 'Magento / XLR8 Commerce',
    brandKey: 'shopify',
    category: 'eCommerce',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Real-time storefront cart abandonment, SKU views, and completed order telemetry.',
    defaultEndpoint: 'https://commerce.xprplatform.io/rest/V1/events',
    defaultSchema: 'xdm_experience_event'
  },

  // Local system
  {
    id: 'local_excel_csv',
    name: 'Excel & CSV Batch Upload',
    brandKey: 'customer_attributes',
    category: 'Local system',
    type: 'Batch',
    status: 'Available',
    actionType: 'Add data',
    description: 'Upload .xlsx or .csv customer sheets directly into XDM profiles and stitch identities live.',
    defaultEndpoint: 'local://upload/spreadsheet-importer',
    defaultSchema: 'xdm_individual_profile'
  },
  {
    id: 'local_json_stream',
    name: 'Local JSON / NDJSON File',
    brandKey: 'xpr',
    category: 'Local system',
    type: 'Batch',
    status: 'Available',
    actionType: 'Add data',
    description: 'Ingest local NDJSON event archives with automatic schema conformance checks.',
    defaultEndpoint: 'local://upload/ndjson-batch',
    defaultSchema: 'xdm_experience_event'
  },

  // Loyalty
  {
    id: 'loyaltylion_src',
    name: 'LoyaltyLion',
    brandKey: 'shopify',
    category: 'Loyalty',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'Ingest customer tier upgrades, points balances, referrals, and reward redemptions.',
    defaultEndpoint: 'https://api.loyaltylion.com/v2/webhooks/events',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'talon_one_src',
    name: 'Talon.One Promotions',
    brandKey: 'xpr',
    category: 'Loyalty',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Real-time coupon redemptions, loyalty ledgers, and campaign qualification triggers.',
    defaultEndpoint: 'https://integration.talon.one/v1/events/stream',
    defaultSchema: 'xdm_experience_event'
  },

  // Marketing automation
  {
    id: 'braze_ingest',
    name: 'Braze Currents Stream',
    brandKey: 'braze',
    category: 'Marketing automation',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Real-time email sends, push opens, in-app clicks, and SMS engagement streams.',
    defaultEndpoint: 'https://currents.braze.com/v1/xpr-cdp-sink',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'klaviyo_ingest',
    name: 'Klaviyo Events Webhook',
    brandKey: 'klaviyo',
    category: 'Marketing automation',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'Sync subscriber campaign interactions, list subscriptions, and flow events.',
    defaultEndpoint: 'https://a.klaviyo.com/api/events/webhook',
    defaultSchema: 'xdm_experience_event'
  },

  // Payments
  {
    id: 'stripe_payments',
    name: 'Stripe Payments & Billing',
    brandKey: 'stripe',
    category: 'Payments',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'Capture charge.succeeded, invoice.paid, refund, and subscription lifecycle events live.',
    defaultEndpoint: 'https://api.stripe.com/v1/webhook_endpoints/cdp',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'adyen_checkout',
    name: 'Adyen Checkout Webhooks',
    brandKey: 'stripe',
    category: 'Payments',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'Global omnichannel POS and online payment authorization telemetry.',
    defaultEndpoint: 'https://checkout-live.adyen.com/v70/webhooks/cdp',
    defaultSchema: 'xdm_experience_event'
  },

  // Protocols
  {
    id: 'http_collector_api',
    name: 'HTTP Collector REST API',
    brandKey: 'xpr_web_sdk',
    category: 'Protocols',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Direct POST /api/v1/collect REST ingestion endpoint for any custom backend or microservice.',
    defaultEndpoint: '/api/v1/collect',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'generic_webhook_protocol',
    name: 'Generic JSON Webhook',
    brandKey: 'xpr',
    category: 'Protocols',
    type: 'Webhook',
    status: 'Available',
    actionType: 'Set up',
    description: 'HMAC-verified JSON webhook listener for custom third-party event producers.',
    defaultEndpoint: '/api/v1/collect?channel=Webhook',
    defaultSchema: 'xdm_experience_event'
  },

  // Streaming
  {
    id: 'xpr_web_sdk_src',
    name: 'XLR8 Platform Web SDK',
    brandKey: 'xpr_web_sdk',
    category: 'Streaming',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'Unified client-side JavaScript SDK sending streaming events directly to the XLR8 Edge Network.',
    defaultEndpoint: 'https://edge.xprplatform.io/ee/v1/interact?configId=xpr_prod_771',
    defaultSchema: 'xdm_experience_event'
  },
  {
    id: 'apache_kafka',
    name: 'Apache Kafka',
    brandKey: 'xpr',
    category: 'Streaming',
    type: 'Streaming',
    status: 'Available',
    actionType: 'Set up',
    description: 'High-throughput distributed streaming topics with mTLS and Avro schema registry integration.',
    defaultEndpoint: 'kafka://pkc-4r29z.us-east-2.aws.confluent.cloud:9092/topics/cdp.events',
    defaultSchema: 'xdm_experience_event'
  }
];

const SOURCE_CATEGORIES = [
  'XLR8 applications',
  'Advertising',
  'Analytics',
  'Cloud storage',
  'Consent & Preferences',
  'CRM',
  'Customer success',
  'Databases',
  'Data & Identity Partners',
  'Data sharing',
  'eCommerce',
  'Local system',
  'Loyalty',
  'Marketing automation',
  'Payments',
  'Protocols',
  'Streaming'
];

export const SourcesView: React.FC = () => {
  const {
    ingestionSources,
    schemas,
    systemMetrics,
    isDemoMode,
    ingestEvent,
    addSource,
    addAuditLog,
    addTerminalLog,
    setActiveTab: setParentActiveTab
  } = useCDP();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'Catalog' | 'Dataflows' | 'Accounts' | 'Key pairs' | 'Private endpoints' | 'System view'>('Catalog');

  // Filter states
  const [sourceFilter, setSourceFilter] = useState<'all' | 'my'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('XLR8 applications');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator & Config Modals
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customJsonPayload, setCustomJsonPayload] = useState(SAMPLE_PRESET_PAYLOADS[0]?.rawJson || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccessMsg, setSimulationSuccessMsg] = useState<string | null>(null);
  const [simulationErrorMsg, setSimulationErrorMsg] = useState<string | null>(null);

  // Setup / Add data Modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogSourceCard | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceEndpoint, setSourceEndpoint] = useState('');
  const [sourceSchemaId, setSourceSchemaId] = useState('xdm_experience_event');
  const [wizardStep, setWizardStep] = useState(1);
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [streamTestResult, setStreamTestResult] = useState<string | null>(null);

  // Quick action popover
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const safeSources = ingestionSources || [];

  const isCatalogCardConnected = (item: CatalogSourceCard) => {
    return safeSources.some(
      s =>
        s.id === item.id ||
        s.id === `src_${item.id}` ||
        s.name.toLowerCase() === item.name.toLowerCase() ||
        s.name.toLowerCase().includes(item.name.toLowerCase())
    );
  };

  // Filtered catalog cards
  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter(item => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // My sources toggle (derived dynamically from live connected ingestionSources)
      if (sourceFilter === 'my') {
        const connected = isCatalogCardConnected(item);
        if (!connected) return false;
        if (!searchQuery.trim() && selectedCategory) {
          return item.category === selectedCategory;
        }
        return true;
      }

      // If category selected and no search query active, match category
      if (!searchQuery.trim() && selectedCategory) {
        return item.category === selectedCategory;
      }

      return true;
    });
  }, [searchQuery, sourceFilter, selectedCategory, safeSources]);

  // Group by category when viewing all or searching
  const groupedCategories = useMemo(() => {
    if (searchQuery.trim() || sourceFilter === 'my') {
      const groups: { [key: string]: CatalogSourceCard[] } = {};
      filteredCatalog.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
      });
      return groups;
    }
    return { [selectedCategory]: filteredCatalog };
  }, [filteredCatalog, searchQuery, sourceFilter, selectedCategory]);

  const handleOpenSetup = (item: CatalogSourceCard) => {
    if (item.id === 'local_excel_csv') {
      setParentActiveTab('create_dataset');
      setMenuOpenId(null);
      return;
    }
    setSelectedItem(item);
    setSourceName(item.name);
    setSourceEndpoint(item.defaultEndpoint);
    setSourceSchemaId(item.defaultSchema || schemas[0]?.id || 'xdm_experience_event');
    setWizardStep(1);
    setStreamTestResult(null);
    setWizardOpen(true);
    setMenuOpenId(null);
  };

  const handleTestConnection = () => {
    setIsTestingStream(true);
    setStreamTestResult(null);
    setTimeout(() => {
      setIsTestingStream(false);
      setStreamTestResult(`200 OK: Validated SSL handshake and protocol mapping with target schema. Stream throughput test passed (2.8ms latency).`);
    }, 500);
  };

  const mapCatalogCategoryToIngestionCategory = (cat: string): IngestionSource['category'] => {
    if (cat === 'CRM' || cat === 'Customer success' || cat === 'Marketing automation') return 'Enterprise CRM';
    if (cat === 'Databases' || cat === 'Cloud storage' || cat === 'Data sharing') return 'Data Warehouses';
    if (cat === 'eCommerce' || cat === 'Payments' || cat === 'Loyalty') return 'Commerce & Retail';
    if (cat === 'Streaming' || cat === 'Protocols') return 'Event Streams';
    return 'Web & Mobile';
  };

  const handleSaveConnection = () => {
    if (!selectedItem) return;
    const trimmedName = sourceName.trim() || selectedItem.name;
    const targetSchema = schemas.find(s => s.id === sourceSchemaId);

    const newSource: IngestionSource = {
      id: `src_${selectedItem.id}_${Date.now().toString(36)}`,
      name: trimmedName,
      type: selectedItem.type,
      status: 'Healthy',
      ratePerSec: selectedItem.type === 'Streaming' ? 12 : 0,
      todayEventCount: 0,
      latencyMs: selectedItem.type === 'Streaming' ? 18 : 120,
      description: selectedItem.description,
      icon: selectedItem.brandKey,
      category: mapCatalogCategoryToIngestionCategory(selectedItem.category),
      targetSchemaId: sourceSchemaId,
      targetSchemaName: targetSchema?.name || 'XDM Experience Event',
      authMethod: selectedItem.type === 'Batch' ? 'Service Role' : 'OAuth 2.0 Bearer',
      lastEventReceived: new Date().toISOString(),
      errorRatePercent: 0,
      dataFlowUrl: sourceEndpoint.trim() || selectedItem.defaultEndpoint,
    };

    addSource(newSource);

    addAuditLog({
      userId: 'usr_admin_session@xlr8.cdp',
      userName: 'Platform Admin',
      userRole: 'Super Admin',
      category: 'Data Ingestion & Streaming',
      action: 'Configured Inbound Source Connector',
      targetEntity: `Source: ${trimmedName}`,
      status: 'SUCCESS',
      ipAddress: '10.24.0.1',
      client: 'XLR8 Platform Source Catalog',
      summary: `Activated inbound source dataflow for ${trimmedName} bound to schema ${targetSchema?.name || sourceSchemaId}.`,
      complianceFlags: ['SOC2 Ingestion Audit', 'TLS 1.3 Verified']
    });

    addTerminalLog('success', 'SOURCE_ACTIVATE', `Successfully activated source connection: "${trimmedName}"`);
    setWizardOpen(false);
    setActiveTab('Dataflows');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateSend = () => {
    setSimulationErrorMsg(null);
    setSimulationSuccessMsg(null);
    try {
      JSON.parse(customJsonPayload);
    } catch (err: any) {
      setSimulationErrorMsg(`Invalid JSON payload: ${err.message}`);
      return;
    }

    setIsSimulating(true);
    const chosenPreset = SAMPLE_PRESET_PAYLOADS[selectedPresetIndex];
    setTimeout(() => {
      const res = ingestEvent(
        customJsonPayload,
        (chosenPreset?.channel as any) || 'Web SDK',
        chosenPreset?.schemaId || 'xdm_individual_profile'
      );
      setIsSimulating(false);
      if (res && res.success === false) {
        setSimulationErrorMsg(res.message || 'Payload rejected by XDM validator and routed to Dead-Letter Queue.');
      } else {
        setSimulationSuccessMsg(`Successfully ingested into pipeline (${res?.message || '200 OK'}). Edge profile and identity graph updated.`);
        setTimeout(() => setSimulationSuccessMsg(null), 5000);
      }
    }, 250);
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#2C2C2C] overflow-hidden select-none" id="sources-view-root">
      {/* Top Header */}
      <div className="px-8 pt-6 pb-0 border-b border-[#0E4DA4] bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white shrink-0">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <PageBackButton fallbackTab="hub_connections" fallbackLabel="Connections" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Sources</h1>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setSimulatorOpen(true)}
              className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] border border-white/25 font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-2xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Test Stream Ingestion</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          {(['Catalog', 'Dataflows', 'Accounts', 'Key pairs', 'Private endpoints', 'System view'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-all relative cursor-pointer ${
                activeTab === tab
                  ? 'text-white font-bold border-b-2 border-white'
                  : 'text-blue-100 hover:text-white border-b-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body Area */}
      <div className="flex-1 overflow-hidden">
        {/* ================= CATALOG TAB (MATCHES IMAGE 1) ================= */}
        {activeTab === 'Catalog' && (
          <div className="flex h-full overflow-hidden">
            {/* Left Filter Sidebar */}
            <div className="w-56 border-r border-[#E1E5EA] bg-[#FFFFFF] p-5 overflow-y-auto shrink-0 flex flex-col justify-between">
              <div>
                {/* Radio: All sources vs My sources */}
                <div className="space-y-2.5 mb-6">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[#2C2C2C]">
                    <input
                      type="radio"
                      name="source_filter"
                      checked={sourceFilter === 'all'}
                      onChange={() => setSourceFilter('all')}
                      className="w-3.5 h-3.5 text-[#1473E6] focus:ring-[#1473E6]"
                    />
                    <span>All sources</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[#2C2C2C]">
                    <input
                      type="radio"
                      name="source_filter"
                      checked={sourceFilter === 'my'}
                      onChange={() => setSourceFilter('my')}
                      className="w-3.5 h-3.5 text-[#1473E6] focus:ring-[#1473E6]"
                    />
                    <span>My sources</span>
                  </label>
                </div>

                {/* Categories Header */}
                <div className="mb-2">
                  <span className="text-xs font-semibold text-[#1E2229]">Categories</span>
                </div>

                {/* Category List */}
                <div className="space-y-0.5">
                  {SOURCE_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat && !searchQuery;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#E8ECEF] text-[#2C2C2C] font-semibold'
                            : 'text-[#1A1D23] hover:bg-[#F2F4F7] hover:text-[#2C2C2C]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Note */}
              <div className="pt-4 mt-4 border-t border-[#E1E5EA] text-[11px] text-[#262A33]">
                <span>XLR8 Ingestion Hub v4.2</span>
              </div>
            </div>

            {/* Right Main Content Panel */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF]">
              {/* Search Bar matching Image 1 */}
              <div className="mb-6">
                <div className="relative w-72">
                  <Search className="w-4 h-4 text-[#262A33] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-full text-xs text-[#2C2C2C] placeholder-[#888888] focus:border-[#1473E6] focus:outline-none shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#262A33] hover:text-[#2C2C2C]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Categories and Cards */}
              <div className="space-y-8">
                {(Object.entries(groupedCategories) as [string, CatalogSourceCard[]][]).map(([catName, cards]) => {
                  if (cards.length === 0) return null;
                  return (
                    <div key={catName}>
                      <h2 className="text-sm font-bold text-[#2C2C2C] mb-4">{catName}</h2>

                      {/* 3 to 4 column grid of cards matching Image 1 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {cards.map(card => {
                          const isConnected = isCatalogCardConnected(card);
                          return (
                            <div
                              key={card.id}
                              className={`bg-[#FFFFFF] border rounded-xl p-4 flex flex-col justify-between h-[155px] shadow-2xs transition-all relative group ${
                                isConnected ? 'border-[#B4F0C3] hover:border-[#0E7A36]' : 'border-[#E5E7EB] hover:border-[#B5B5B5]'
                              }`}
                            >
                              {/* Top row: Brand Icon + Title */}
                              <div className="flex items-start space-x-3">
                                <BrandIcon name={card.brandKey} className="w-9 h-9 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-[#2C2C2C] leading-snug truncate">
                                      {card.name}
                                    </span>
                                    {isConnected && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] shrink-0">
                                        Connected
                                      </span>
                                    )}
                                  </div>
                                  {card.isBeta && (
                                    <span className="text-[10px] text-[#1E2229] block">(Beta)</span>
                                  )}
                                  <p className="text-[11px] text-[#1E2229] line-clamp-2 mt-1 leading-tight">
                                    {card.description}
                                  </p>
                                </div>
                              </div>

                              {/* Bottom action row: Pill Button + '...' menu */}
                              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F2F4F7]">
                                <button
                                  onClick={() => handleOpenSetup(card)}
                                  className="px-4 py-1 rounded-full border border-[#D5D5D5] hover:border-[#888888] hover:bg-[#F2F4F7] text-xs font-semibold text-[#2C2C2C] transition-all shadow-2xs"
                                >
                                  {isConnected ? 'Add data' : card.actionType}
                                </button>

                                <div className="relative">
                                  <button
                                    onClick={() => setMenuOpenId(menuOpenId === card.id ? null : card.id)}
                                    className="p-1 rounded-full hover:bg-[#F2F4F7] text-[#1E2229] hover:text-[#2C2C2C] transition-colors"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>

                                  {/* Popover Menu */}
                                  {menuOpenId === card.id && (
                                    <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#FFFFFF] border border-[#E1E5EA] rounded-lg shadow-lg py-1 z-30 text-xs">
                                      <button
                                        onClick={() => handleOpenSetup(card)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-[#F2F4F7] text-[#2C2C2C]"
                                      >
                                        Configure dataflow
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleCopy(card.id, card.defaultEndpoint);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-[#F2F4F7] text-[#2C2C2C]"
                                      >
                                        {copiedId === card.id ? 'Copied endpoint!' : 'Copy endpoint'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSimulatorOpen(true);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-[#F2F4F7] text-[#2C2C2C]"
                                      >
                                        Test stream ping
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredCatalog.length === 0 && (
                  <div className="text-center py-16 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E1E5EA] space-y-3">
                    <Search className="w-8 h-8 text-[#262A33] mx-auto" />
                    <h3 className="text-sm font-bold text-[#2C2C2C]">
                      {sourceFilter === 'my' ? 'No connected sources yet' : 'No sources found'}
                    </h3>
                    <p className="text-xs text-[#1E2229] max-w-md mx-auto">
                      {sourceFilter === 'my'
                        ? 'You have not configured any inbound sources in this clean account yet. Switch to All sources to explore and connect pipelines.'
                        : `No matching sources found in "${selectedCategory}". Try changing your search query or switching category.`}
                    </p>
                    {sourceFilter === 'my' && (
                      <button
                        onClick={() => setSourceFilter('all')}
                        className="px-4 py-1.5 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        Browse All Sources
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= DATAFLOWS TAB ================= */}
        {activeTab === 'Dataflows' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#2C2C2C]">Active Ingestion Dataflows</h2>
                <p className="text-xs text-[#1E2229]">
                  Real-time streaming and batch pipelines feeding XDM schemas with validation status.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold bg-[#EBF3FC] text-[#1473E6] px-2.5 py-1 rounded border border-[#D0E2F9]">
                  {systemMetrics.ratePerSec.toLocaleString()} events/sec
                </span>
              </div>
            </div>

            {safeSources.length === 0 ? (
              <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#D0D7DE] p-12 text-center space-y-3">
                <Radio className="w-8 h-8 text-[#1473E6] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">No Active Ingestion Dataflows</h3>
                <p className="text-xs text-[#596780] max-w-md mx-auto">
                  Connect an inbound source from the Catalog or ingest a live JSON/CSV payload to activate real-time dataflows.
                </p>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  <button
                    onClick={() => setActiveTab('Catalog')}
                    className="px-4 py-1.5 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold cursor-pointer"
                  >
                    Explore Source Catalog
                  </button>
                  <button
                    onClick={() => setSimulatorOpen(true)}
                    className="px-4 py-1.5 rounded-full border border-[#D5D5D5] bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] text-xs font-semibold cursor-pointer"
                  >
                    Send Test Event
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] border-b border-[#E1E5EA] text-[#1E2229] font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Source Dataflow</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Target Schema</th>
                      <th className="px-5 py-3 text-right">Throughput</th>
                      <th className="px-5 py-3 text-right">Records Today</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {safeSources.map(src => (
                      <tr key={src.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <BrandIcon name={src.icon || (src.id.includes('web') ? 'xpr_web_sdk' : src.id.includes('kafka') ? 'xpr' : 'salesforce')} className="w-7 h-7 shrink-0" />
                            <div>
                              <span className="font-bold text-[#2C2C2C] block">{src.name}</span>
                              <span className="text-[10px] text-[#1E2229] font-mono">{src.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF3FC] text-[#0D66D0]">
                            {src.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEFBE6] text-[#0E7A36]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A36] animate-pulse" />
                            <span>{src.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#2C2C2C] font-medium font-mono text-[11px]">
                          {src.targetSchemaName || 'XDM Experience Event'}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-[#1473E6]">
                          {src.ratePerSec} evt/s
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-[#2C2C2C]">
                          {(src.todayEventCount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setSimulatorOpen(true)}
                            className="px-3 py-1 rounded border border-[#D5D5D5] hover:bg-[#F2F4F7] text-[#2C2C2C] text-xs font-medium"
                          >
                            Test Stream
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= ACCOUNTS TAB ================= */}
        {activeTab === 'Accounts' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#2C2C2C]">Connected Source Accounts</h2>
                <p className="text-xs text-[#1E2229]">
                  Authorized provider credentials, OAuth 2.0 refresh tokens, and service principal connections.
                </p>
              </div>
            </div>

            {safeSources.length === 0 ? (
              <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#D0D7DE] p-12 text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#596780] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">No Source Accounts Authorized Yet</h3>
                <p className="text-xs text-[#596780] max-w-md mx-auto">
                  Configure a connector in the Source Catalog to register OAuth 2.0 tokens or service accounts here.
                </p>
                <button
                  onClick={() => setActiveTab('Catalog')}
                  className="px-4 py-1.5 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold cursor-pointer"
                >
                  Open Source Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {safeSources.map(src => (
                  <div key={src.id} className="bg-white p-5 rounded-xl border border-[#E1E5EA] shadow-2xs">
                    <div className="flex items-center space-x-3 mb-3">
                      <BrandIcon name={src.icon || 'xpr'} className="w-8 h-8" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#2C2C2C] block truncate">{src.name}</span>
                        <span className="text-[10px] text-[#0E7A36] font-semibold">{src.authMethod || 'OAuth 2.0 Active'}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#1E2229] font-mono truncate">{src.dataFlowUrl || src.id}</p>
                    <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex justify-between items-center text-[10px] text-[#262A33]">
                      <span>Status: {src.status}</span>
                      <span className="text-[#1473E6] font-semibold">{src.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= KEY PAIRS TAB ================= */}
        {activeTab === 'Key pairs' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-[#2C2C2C]">Cryptographic Key Pairs & mTLS</h2>
              <p className="text-xs text-[#1E2229]">
                Public and private key certificates utilized for SFTP batch ingestion and Kafka mTLS handshakes.
              </p>
            </div>

            {safeSources.length === 0 && !isDemoMode ? (
              <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#D0D7DE] p-12 text-center space-y-2">
                <Key className="w-8 h-8 text-[#596780] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">No Active Key Pairs Provisioned</h3>
                <p className="text-xs text-[#596780] max-w-md mx-auto">
                  Provision SFTP or Kafka mTLS sources from the Catalog to generate client key pairs.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E1E5EA] p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-[#1473E6]" />
                    <div>
                      <span className="text-xs font-bold text-[#2C2C2C] block">xpr-prod-sftp-ed25519</span>
                      <span className="text-[10px] text-[#1E2229] font-mono">Fingerprint: SHA256:d8a9f24...b83a</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#DEFBE6] text-[#0E7A36] rounded">Valid (Expires 2027)</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-[#0E7A36]" />
                    <div>
                      <span className="text-xs font-bold text-[#2C2C2C] block">kafka-mtls-client-cert</span>
                      <span className="text-[10px] text-[#1E2229] font-mono">Issuer: DigiCert Global Root G2</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#DEFBE6] text-[#0E7A36] rounded">Active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PRIVATE ENDPOINTS TAB ================= */}
        {activeTab === 'Private endpoints' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-[#2C2C2C]">Private Endpoints & VPC Peering</h2>
              <p className="text-xs text-[#1E2229]">
                Direct private network paths bypassing the public internet via AWS PrivateLink and Azure Private Link.
              </p>
            </div>

            {safeSources.length === 0 && !isDemoMode ? (
              <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#D0D7DE] p-12 text-center space-y-2">
                <Network className="w-8 h-8 text-[#596780] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">No VPC Peering Endpoints Configured</h3>
                <p className="text-xs text-[#596780] max-w-md mx-auto">
                  Connect an AWS S3, Snowflake, or Kafka source to establish private VPC ingress routes.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E1E5EA] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Network className="w-5 h-5 text-[#1473E6]" />
                    <div>
                      <span className="text-xs font-bold text-[#2C2C2C] block">AWS PrivateLink (vpce-038299104812f)</span>
                      <span className="text-[10px] text-[#1E2229]">Connected to VPC vpc-08a8e1 (us-east-1)</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#DEFBE6] text-[#0E7A36] rounded">
                    Connected (0.8ms Latency)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SYSTEM VIEW TAB ================= */}
        {activeTab === 'System view' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-[#2C2C2C]">Inbound Ingestion Topology</h2>
              <p className="text-xs text-[#1E2229]">
                Architectural data flow from upstream partner sources to the XLR8 Edge network and XDM schema validation.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E1E5EA] p-6 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E1E5EA] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229] block mb-1">Upstream Sources</span>
                  <span className="text-xs font-bold text-[#2C2C2C]">Web SDK, Mobile, Kafka, CRM</span>
                </div>
                <div className="text-center font-bold text-[#1473E6] flex justify-center items-center">
                  <ChevronRight className="w-6 h-6 animate-pulse" />
                </div>
                <div className="p-4 bg-[#EBF3FC] rounded-lg border border-[#C5DCFA] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D66D0] block mb-1">Edge Validation & Ingest</span>
                  <span className="text-xs font-bold text-[#0D66D0]">Flink Stream Parser + DULE</span>
                </div>
                <div className="p-4 bg-[#DEFBE6] rounded-lg border border-[#B4F0C3] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7A36] block mb-1">Canonical Storage</span>
                  <span className="text-xs font-bold text-[#0E7A36]">XDM Experience Event Lake</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SETUP / ADD DATA WIZARD MODAL ================= */}
      {wizardOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E1E5EA] max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center space-x-2.5">
                <BrandIcon name={selectedItem.brandKey} className="w-6 h-6" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">
                  {selectedItem.actionType}: {selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2C2C2C] block mb-1">Connector Name</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={e => setSourceName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#2C2C2C] block mb-1">Ingestion Target Endpoint</label>
                <input
                  type="text"
                  value={sourceEndpoint}
                  onChange={e => setSourceEndpoint(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded-lg text-xs font-mono bg-[#F9FAFB]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2C2C2C] block mb-1">Target XDM Schema</label>
                <select
                  value={sourceSchemaId}
                  onChange={e => setSourceSchemaId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded-lg text-xs"
                >
                  {schemas.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              {streamTestResult && (
                <div className="p-3 bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] rounded-lg text-xs">
                  {streamTestResult}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-between items-center">
              <button
                onClick={handleTestConnection}
                disabled={isTestingStream}
                className="px-3.5 py-1.5 rounded-lg border border-[#D5D5D5] hover:bg-[#FFFFFF] text-[#2C2C2C] font-semibold text-xs transition-colors"
              >
                {isTestingStream ? 'Validating...' : 'Test Connection'}
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => setWizardOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[#1E2229] hover:text-[#2C2C2C] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConnection}
                  className="px-4 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  Activate Dataflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TEST INGESTION SIMULATOR MODAL ================= */}
      {simulatorOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E1E5EA] max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">Live Event Stream Ingestion Simulator</h3>
              </div>
              <button
                onClick={() => setSimulatorOpen(false)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2C2C2C] block mb-1">Preset Payload</label>
                <div className="flex space-x-2">
                  {SAMPLE_PRESET_PAYLOADS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setCustomJsonPayload(preset.rawJson);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPresetIndex === idx
                          ? 'bg-[#1473E6] text-white shadow-2xs font-semibold'
                          : 'bg-[#F2F4F7] text-[#1A1D23] hover:bg-[#E8ECEF]'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2C2C2C] block mb-1">JSON Payload (XDM Conforming)</label>
                <textarea
                  rows={10}
                  value={customJsonPayload}
                  onChange={e => setCustomJsonPayload(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] bg-[#1E1E1E] text-[#A6E22E] rounded-lg border border-[#333333] focus:outline-none"
                />
              </div>

              {simulationErrorMsg && (
                <div className="p-3 bg-[#FFEBEB] text-[#D7373F] border border-[#FFCCD0] rounded-lg text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{simulationErrorMsg}</span>
                </div>
              )}

              {simulationSuccessMsg && (
                <div className="p-3 bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] rounded-lg text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{simulationSuccessMsg}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-end space-x-2">
              <button
                onClick={() => setSimulatorOpen(false)}
                className="px-4 py-1.5 rounded-lg text-[#1E2229] hover:text-[#2C2C2C] text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={handleSimulateSend}
                disabled={isSimulating}
                className="px-5 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold shadow-2xs transition-colors flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Ingesting...' : 'Send Event Stream'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
