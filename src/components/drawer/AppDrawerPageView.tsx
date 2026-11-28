import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { BringInDatasetModal } from '../datasets/BringInDatasetModal';
import {
  Database,
  Plug,
  Users,
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Radio,
  Layers,
  GitMerge,
  Code,
  Calculator,
  Zap,
  Server,
  Building2,
  FileCheck,
  FileText,
  Bot,
  GitFork,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  ExternalLink,
  Activity,
  CheckCircle2,
  Lock,
  Network,
  Plus,
  FolderPlus,
  Split,
  Award,
  ShoppingBag,
  Info
} from 'lucide-react';

export type DrawerCategory =
  | 'data_management'
  | 'connections'
  | 'customers'
  | 'data_science'
  | 'governance'
  | 'intelligence';

interface DrawerItem {
  id: string;
  tabId: string;
  title: string;
  badge: string;
  badgeColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
  metrics: string;
  tags: string[];
  actionLabel?: string;
  onClick?: () => void;
}

interface AppDrawerPageViewProps {
  category: DrawerCategory;
}

export const AppDrawerPageView: React.FC<AppDrawerPageViewProps> = ({ category: initialCategory }) => {
  const {
    setActiveTab,
    schemas,
    datasets,
    systemMetrics,
    audiences,
    destinations,
    ingestionSources,
    b2bAccounts,
    dsarRequests,
    anomalies,
    warehouses,
    databricksStatus
  } = useCDP();

  const [activeCategory, setActiveCategory] = useState<DrawerCategory>(initialCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false);

  // Keep state in sync if parent prop changes
  React.useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const categoryDefinitions: Record<
    DrawerCategory,
    {
      title: string;
      icon: React.ReactNode;
      color: string;
      bannerGradient: string;
      bannerBorder: string;
      badgeStyle: string;
      badgeDot: string;
      description: string;
      items: DrawerItem[];
    }
  > = {
    data_management: {
      title: 'Data Management',
      icon: <Database className="w-6 h-6 text-white" />,
      color: 'from-[#38BDF8] to-[#1473E6]',
      bannerGradient: 'from-[#F5F8FC] via-[#C4D8EE] to-[#143254]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#0A4BB5] border-[#BFDBFE]',
      badgeDot: 'bg-[#1473E6]',
      description: 'Standardized Experience Data Model schemas, real-time streaming ingestion pipelines, and federated zero-copy data warehouse mesh.',
      items: [
        {
          id: 'schemas',
          tabId: 'schemas',
          title: 'Schemas (XDM)',
          badge: `${schemas.length} Schemas`,
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <Database className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]',
          description: 'Define Experience Data Model schemas, custom field groups, base classes, and profile-enabled tenant schemas.',
          metrics: `${schemas.filter(s => s.status.includes('Profile')).length} Profile-Enabled`,
          tags: ['XDM System', 'Mixins', 'Behavioral Events', 'Tenancy']
        },
        {
          id: 'create_dataset',
          tabId: 'create_dataset',
          title: 'Bring in New Dataset',
          badge: 'Onboarding Flow',
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <FolderPlus className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#1473E6] to-[#0284C7]',
          description: 'Bring in datasets (CSV, Excel, Streaming, Cloud, Zero-Copy), bind XDM schemas, and configure DULE governance.',
          metrics: 'Streaming, Batch & Zero-Copy',
          tags: ['Bring In Dataset', 'XDM Schema Binding', 'DULE Governance', 'Profile-Enabled'],
          actionLabel: 'Bring In Dataset',
          onClick: () => setActiveTab('create_dataset')
        },
        {
          id: 'ingestion',
          tabId: 'ingestion',
          title: 'Data Ingestion & Streams',
          badge: 'Live Stream',
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <Radio className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7]',
          description: 'Streaming event ingestion endpoints, Flink validation pipeline, live payload inspector, and throughput graphs.',
          metrics: `${systemMetrics.ratePerSec.toLocaleString()} evt/sec · 2.4ms latency`,
          tags: ['Kafka', 'Web SDK', 'Streaming Gateway', 'JSON/Avro']
        },
        {
          id: 'datasets',
          tabId: 'datasets',
          title: 'Datasets & DULE Labeling',
          badge: `${datasets.length} Datasets`,
          badgeColor: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
          icon: <Database className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0F58B8] to-[#0A3D82]',
          description: 'Catalog of brought-in datasets with Adobe Real-Time CDP Data Usage Labels (C, I, S, R series) and enforcement.',
          metrics: `${datasets.filter(d => d.labels.length > 0).length} Labeled / ${datasets.length} Total`,
          tags: ['DULE Labels', 'Adobe RT-CDP', 'Contractual C-Series', 'Identity I-Series']
        },
        {
          id: 'ecommerce_store',
          tabId: 'ecommerce_store',
          title: 'Live E-Commerce Storefront',
          badge: 'Real-Time Stream',
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <ShoppingBag className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#1473E6]',
          description: 'Interactive Apex Commerce storefront streaming PageView, Search, AddToCart, CartAbandoned, Identify, and Purchase events live.',
          metrics: `${(databricksStatus?.totalEventsStreamed ?? 0).toLocaleString()} Streamed Events`,
          tags: ['Web SDK', 'Cart Abandonment', 'Checkout', 'Identity Stitching']
        },
        {
          id: 'xdm_tester',
          tabId: 'xdm_tester',
          title: 'Live XDM Ingestion Tester',
          badge: 'Sub-5ms Edge',
          badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          icon: <Zap className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0EA5E9] to-[#1473E6]',
          description: 'Interactive XDM playground to fire sample ExperienceEvents, trace real-time pipeline latency, and observe dynamic segment qualification.',
          metrics: '< 5ms Edge SLA Latency',
          tags: ['XDM Tester', 'Edge Simulation', 'Live Payload', 'PQL Trace']
        },
        {
          id: 'databricks_warehouse',
          tabId: 'databricks_warehouse',
          title: 'Databricks Delta Lakehouse',
          badge: databricksStatus?.mode === 'live_cloud' ? 'Cloud SQL Connected' : 'Delta Active',
          badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          icon: <Database className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#1473E6] to-[#0A3D82]',
          description: 'Unity Catalog Bronze/Silver/Gold Delta tables receiving live storefront events, unified profiles, and cart abandonment analytics.',
          metrics: `${(databricksStatus?.totalProfilesMerged ?? 0).toLocaleString()} Silver Profiles · ${(databricksStatus?.totalCartAbandonments ?? 0).toLocaleString()} Abandoned`,
          tags: ['Unity Catalog', 'Delta Lake', 'SQL Warehouse', 'Bronze/Silver/Gold']
        },
        {
          id: 'federated_composition',
          tabId: 'federated_composition',
          title: 'Federated Zero-Copy Data Mesh',
          badge: 'Zero-Copy',
          badgeColor: 'bg-[#EBF3FC] text-[#1E40AF] border-[#C7D2FE]',
          icon: <Server className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#1E3A8A]',
          description: 'Execute pushdown SQL queries into Snowflake, Google BigQuery, and Databricks without duplicating or moving data.',
          metrics: warehouses.length > 0 ? `${warehouses.length} Warehouses Connected` : 'Zero-Copy Pushdown Ready',
          tags: ['Pushdown Query', 'Snowflake', 'BigQuery', 'Databricks']
        }
      ]
    },
    connections: {
      title: 'Connections',
      icon: <Plug className="w-6 h-6 text-white" />,
      color: 'from-[#0EA5E9] to-[#0369A1]',
      bannerGradient: 'from-[#F5F8FC] via-[#C4D8EE] to-[#143254]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#0369A1] border-[#BAE6FD]',
      badgeDot: 'bg-[#0284C7]',
      description: 'Unified ecosystem of 20+ inbound data connectors and outbound privacy-governed advertising and cloud export destinations.',
      items: [
        {
          id: 'sources',
          tabId: 'sources',
          title: 'Explore Sources',
          badge: `${ingestionSources?.length || 0} Connectors`,
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <ArrowDownToLine className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#0369A1]',
          description: 'Browse, configure, and add data to 20+ pre-built connectors including Web SDK, Kafka, CRM, Cloud storage, and eCommerce.',
          metrics: `${ingestionSources?.length || 0} Active Sources • 25+ Catalog`,
          tags: ['Inbound', 'Streaming & Batch', 'Web SDK', 'SFTP']
        },
        {
          id: 'destinations',
          tabId: 'destinations',
          title: 'Explore Destinations',
          badge: `${destinations?.length || 0} Connected`,
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#BFDBFE]',
          icon: <ArrowUpFromLine className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#1473E6] to-[#0A3D82]',
          description: 'Activate real-time audience segments to Google Ads, Meta CAPI, Braze, TikTok, LinkedIn Matched Audiences, and Amazon S3.',
          metrics: `${destinations?.length || 0} Connected • 18+ Catalog Targets`,
          tags: ['Outbound', 'Audience Sync', 'DULE Privacy Gate', 'CAPI']
        },
        {
          id: 'edge_simulator_conn',
          tabId: 'edge_simulator',
          title: 'Edge Network Streaming & Simulator',
          badge: '<50ms Latency',
          badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          icon: <Zap className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0284C7] to-[#1E40AF]',
          description: 'Simulate sub-50ms Edge Network rule evaluation, geo-distributed edge nodes, and next-best dynamic offer selection.',
          metrics: 'Sub-50ms Global Edge POPs',
          tags: ['Edge Network', 'Sub-second', 'Rule Dispatch', 'Geo Nodes']
        }
      ]
    },
    customers: {
      title: 'Customers',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'from-[#2563EB] to-[#1E3A8A]',
      bannerGradient: 'from-[#F5F8FC] via-[#C4D8EE] to-[#143254]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#1E3A8A] border-[#BFDBFE]',
      badgeDot: 'bg-[#2563EB]',
      description: 'Unified 360 Customer Profiles, visual Audience Builder, cross-device Identity Graph resolution, and B2B Account hierarchies.',
      items: [
        {
          id: 'profiles',
          tabId: 'profiles',
          title: 'Profiles (Customer 360)',
          badge: `${systemMetrics.totalProfiles.toLocaleString()} Profiles`,
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <Users className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#1473E6]',
          description: 'Explore unified customer profile records with comprehensive event timelines, merged identity aliases, and behavioral scores.',
          metrics: systemMetrics.totalProfiles > 0 ? 'Identity Graph Active' : 'Ready for Profile Unification',
          tags: ['Customer 360', 'Unified Timeline', 'Attribute Store', 'Consent']
        },
        {
          id: 'audiences',
          tabId: 'audiences',
          title: 'Audiences & Segments',
          badge: `${audiences.length} Audiences`,
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <Layers className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0EA5E9] to-[#1D4ED8]',
          description: 'Visual segment builder with Profile Query Language (PQL) rule editor, real-time qualification, and export syndication.',
          metrics: `${audiences.filter(a => a.status === 'Active').length} Live Streaming Segments`,
          tags: ['Audience Builder', 'PQL Engine', 'Streaming Qualification']
        },
        {
          id: 'audience_overlap',
          tabId: 'audience_overlap',
          title: 'Audience Overlap & Venn Explorer',
          badge: 'Anti-Fatigue',
          badgeColor: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
          icon: <Split className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#0F58B8]',
          description: '2-way and 3-way Venn diagram visualizer to detect segment cannibalization, customer fatigue, and generate mutually exclusive cohorts.',
          metrics: 'Venn Intersections & Fatigue Scoring',
          tags: ['Venn Diagram', 'Overlap Analysis', 'Anti-Fatigue', 'Deduplication']
        },
        {
          id: 'identities',
          tabId: 'identities',
          title: 'Identity Graph',
          badge: 'Deterministic',
          badgeColor: 'bg-[#EBF3FC] text-[#0A4BB5] border-[#BFDBFE]',
          icon: <GitMerge className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#1D4ED8] to-[#0A3D82]',
          description: 'Visual graph showing deterministic and probabilistic links across ECIDs, emails, phone numbers, CRM IDs, and loyalty codes.',
          metrics: 'Cross-Device Cluster Resolution',
          tags: ['Graph Resolution', 'ECID', 'SHA-256 Hashes', 'Namespace Merge']
        },
        {
          id: 'b2b_accounts',
          tabId: 'b2b_accounts',
          title: 'B2B Accounts & Buying Groups',
          badge: 'B2B Edition',
          badgeColor: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
          icon: <Building2 className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0369A1] to-[#0B2E58]',
          description: 'Account hierarchy trees, buying center committees, department contact mapping, and firmographic scoring.',
          metrics: `${b2bAccounts.length} Enterprise Accounts Tracked`,
          tags: ['Account Hierarchy', 'Buying Centers', 'Firmographics', 'Lead-to-Account']
        }
      ]
    },
    data_science: {
      title: 'Data Science & Query',
      icon: <Cpu className="w-6 h-6 text-white" />,
      color: 'from-[#0284C7] to-[#1E40AF]',
      bannerGradient: 'from-[#F5F8FC] via-[#C4D8EE] to-[#143254]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#0369A1] border-[#BAE6FD]',
      badgeDot: 'bg-[#0284C7]',
      description: 'ANSI SQL multi-dataset analytics with Data Distiller, computed rolling event aggregations, Sensei ML models, and edge personalization.',
      items: [
        {
          id: 'data_distiller',
          tabId: 'data_distiller',
          title: 'Data Distiller (SQL Query Service)',
          badge: 'ANSI SQL',
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <Code className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#1473E6]',
          description: 'Interactive SQL studio querying raw event streams, unified profile snapshots, and writing CTAS custom output datasets.',
          metrics: 'Accelerated SQL Engine',
          tags: ['ANSI SQL', 'CTAS Schedules', 'Multi-Dataset Joins', 'Query History']
        },
        {
          id: 'calc_attributes',
          tabId: 'calc_attributes',
          title: 'Calculated Attributes',
          badge: 'Rolling 30D',
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <Calculator className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#0D66D0]',
          description: 'Define computed behavioral aggregations like lifetime spend, rolling 30-day session counts, and favorite category traits.',
          metrics: 'Computed on Stream Ingest',
          tags: ['Lifetime Value', 'Rolling Windows', 'Aggregation Rules']
        },
        {
          id: 'ai_models',
          tabId: 'ai_models',
          title: 'Sensei AI & Clean Room',
          badge: 'ML Studio',
          badgeColor: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
          icon: <Sparkles className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A]',
          description: 'AutoML predictive churn scoring, next-purchase propensity models, lookalike model expansion, and differential privacy clean rooms.',
          metrics: 'Pre-Trained Predictive Models',
          tags: ['Churn Hazard', 'Lookalike Expander', 'Clean Room', 'k-Anonymity']
        },
        {
          id: 'edge_simulator',
          tabId: 'edge_simulator',
          title: 'Edge Personalization Decisions',
          badge: '<50ms',
          badgeColor: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
          icon: <Zap className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1]',
          description: 'Next-best-action decisioning engine testing dynamic promotion eligibility, frequency capping, and instant sub-50ms rule delivery.',
          metrics: 'Sub-50ms Edge Decisioning',
          tags: ['Dynamic Offers', 'Next Best Action', 'Frequency Caps']
        }
      ]
    },
    governance: {
      title: 'Privacy & Governance',
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      color: 'from-[#1473E6] to-[#0A3D82]',
      bannerGradient: 'from-[#F5F8FC] via-[#C4D8EE] to-[#143254]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#0A3D82] border-[#BFDBFE]',
      badgeDot: 'bg-[#1473E6]',
      description: 'Data Usage Labeling & Enforcement (DULE), automated consumer GDPR/CCPA DSAR rights, and immutable compliance audit trails.',
      items: [
        {
          id: 'governance',
          tabId: 'governance',
          title: 'Policies & Governance (DULE)',
          badge: 'DULE Active',
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#BFDBFE]',
          icon: <ShieldCheck className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0EA5E9] to-[#0D66D0]',
          description: 'Data Usage Labeling & Enforcement framework applying contract labels (C1-C12), sensitive data masking, and egress gating.',
          metrics: destinations.length > 0 ? `${destinations.length} Destination Policies Active` : 'DULE Rule Engine Ready',
          tags: ['DULE Engine', 'Contract Labels', 'Sensitive PII Masking', 'Ad Egress Block']
        },
        {
          id: 'privacy_service',
          tabId: 'privacy_service',
          title: 'Privacy Rights & DSAR',
          badge: `${dsarRequests.length} Requests`,
          badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          icon: <FileCheck className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#1E40AF]',
          description: 'Automated GDPR Art. 15 (Access) and Art. 17 (Right to be Forgotten) erasure requests cascading across identity graph clusters.',
          metrics: 'Zero Privacy Breach Record',
          tags: ['GDPR Art 17', 'CCPA Deletion', 'Cryptographic Proof', 'Audit Verification']
        },
        {
          id: 'audit_logs',
          tabId: 'audit_logs',
          title: 'Audit Trail & Compliance Logs',
          badge: 'SOC2 Type II',
          badgeColor: 'bg-[#EBF3FC] text-[#0A3D82] border-[#BFDBFE]',
          icon: <FileText className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0F58B8] to-[#0B2E58]',
          description: 'Immutable, tamper-evident audit logs recording every schema modification, dataset export, user query, and permission escalation.',
          metrics: 'SOC2 Type II & HIPAA Certified',
          tags: ['Audit Trail', 'SHA-256 Proof', 'Role-Based Access', 'Forensics']
        },
        {
          id: 'dataset_dule',
          tabId: 'datasets',
          title: 'Dataset Labeling Studio',
          badge: `${datasets.length} Datasets`,
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <ShieldCheck className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7]',
          description: 'Label datasets using Adobe Real-Time CDP DULE taxonomy (Contractual, Identity, Sensitive, Regulatory).',
          metrics: 'C1-C12, I1-I2, S1-S10, R1-R4',
          tags: ['Adobe DULE', 'Dataset Governance', 'PII Masking', 'Policy Compliance']
        }
      ]
    },
    intelligence: {
      title: 'Intelligence Services',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      color: 'from-[#3B82F6] to-[#0B2E58]',
      bannerGradient: 'from-[#F5F8FC] via-[#C4D8EE] to-[#143254]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#0A3D82] border-[#BFDBFE]',
      badgeDot: 'bg-[#1D4ED8]',
      description: 'Autonomous AI Copilot for natural language CDP workflows, multi-channel journey canvases, and predictive propensity ML.',
      items: [
        {
          id: 'agentic_studio',
          tabId: 'agentic_studio',
          title: 'Autonomous AI Copilot (Agentic Studio)',
          badge: anomalies?.length ? `${anomalies.filter(a => a.status === 'Active').length} Alerts` : 'GenAI',
          badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          icon: <Bot className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8]',
          description: 'Ask questions in natural language to generate PQL audience rules, diagnose schema issues, and auto-heal pipeline anomalies.',
          metrics: 'Natural Language to CDP Engine',
          tags: ['GenAI Copilot', 'PQL Generator', 'Auto-Heal', 'Root Cause Analysis']
        },
        {
          id: 'journeys',
          tabId: 'journeys',
          title: 'Journey Orchestration Canvas',
          badge: 'Omnichannel',
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#BFDBFE]',
          icon: <GitFork className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0EA5E9] to-[#1473E6]',
          description: 'Interactive flowchart canvas to orchestrate multi-step customer journeys triggered by real-time events with split tests.',
          metrics: 'Dynamic Decision Splits & Timers',
          tags: ['Journey Canvas', 'Event Triggers', 'Wait Steps', 'Push & Email Actions']
        },
        {
          id: 'ai_models_intel',
          tabId: 'ai_models',
          title: 'Predictive Propensity & Churn Models',
          badge: 'AutoML',
          badgeColor: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
          icon: <Sparkles className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#2563EB] to-[#0A3D82]',
          description: 'Machine learning algorithms continuously training on unified profile activity to predict churn risk and lifetime conversion.',
          metrics: 'High Accuracy ML Scoring',
          tags: ['Propensity ML', 'Hazard Modeling', 'Feature Importance']
        },
        {
          id: 'why_excelr8',
          tabId: 'why_excelr8',
          title: 'Why Choose XLR8 Realtime CDP?',
          badge: 'vs Adobe',
          badgeColor: 'bg-[#EBF3FC] text-[#0A4BB5] border-[#BFDBFE]',
          icon: <Award className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-[#0369A1] to-[#1E3A8A]',
          description: 'Side-by-side architectural and operational evaluation matrix comparing Adobe Real-Time CDP vs. XLR8 Realtime CDP.',
          metrics: '100% XDM/DULE Parity + Visual Simulators',
          tags: ['Adobe Comparison', 'XDM Parity', 'DULE Compliance', 'Evaluation Matrix']
        }
      ]
    }
  };

  const currentDef = categoryDefinitions[activeCategory];

  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return currentDef.items;
    const q = searchFilter.toLowerCase();
    return currentDef.items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [currentDef, searchFilter]);

  return (
    <div className="h-full overflow-y-auto bg-[#F8F9FA] text-[#2C2C2C] select-none" id="app-drawer-view-root">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Navigation Breadcrumb & Back to Home */}
        <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-4">
          <div className="flex items-center space-x-2.5 text-xs">
            <PageBackButton fallbackTab="home" fallbackLabel="Home" showForward />
            <span className="text-[#262A33]">/</span>
            <span className="font-bold text-[#1E1E1E] text-sm">{currentDef.title}</span>
          </div>
        </div>

        {/* Category Hero Header Banner with Unified Blue Gradient */}
        <div className="rounded-2xl border border-[#0E4DA4] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 transition-all bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white">
          <div className="flex items-start space-x-4 relative z-10">
            {/* App Category Icon Box with Elevated Contrast */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentDef.color} flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/40`}>
              {currentDef.icon}
            </div>

            <div>
              {/* Category Taxonomy Badge */}
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border shadow-2xs bg-white/15 text-white border-white/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  XLR8 Enterprise Hub
                </span>
              </div>

              {/* Main Heading with High-Contrast White Typography */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentDef.title}
              </h1>

              {/* High-Contrast Description Text */}
              <p className="text-xs sm:text-sm text-blue-100 mt-1.5 max-w-2xl leading-relaxed font-medium">
                {currentDef.description}
              </p>
            </div>
          </div>

          {/* Quick Search inside Drawer */}
          <div className="w-full md:w-72 shrink-0 relative z-10">
            <div className="relative">
              <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter apps in this drawer..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white/95 backdrop-blur-xs border border-white/80 rounded-xl text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:bg-white focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none shadow-sm transition-all"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  aria-label="Clear filter"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] p-0.5 rounded transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compact Vertical Strips List */}
        <div className="space-y-4">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveTab(item.tabId as any);
                }
              }}
              className="relative hover:z-20 bg-white rounded-xl border border-[#E1E5EA] hover:border-[#1473E6] px-5 py-4 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="text-xs font-mono font-bold text-[#64748B] w-6 text-center shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs [&_svg]:w-4 [&_svg]:h-4`}>
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#1E2229] group-hover:text-[#1473E6] transition-colors truncate">
                    {item.title}
                  </h3>
                  <Info className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#1473E6] transition-colors shrink-0" />
                </div>
              </div>

              {/* Hover Tooltip showing stats & description */}
              <div
                role="tooltip"
                className={`pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity duration-150 absolute left-5 sm:left-16 z-30 w-[calc(100%-2.5rem)] max-w-lg rounded-xl bg-[#0F172A] text-white p-3.5 shadow-xl border border-slate-700 ${
                  idx === 0 ? 'top-full mt-2' : 'bottom-full mb-2'
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-sky-300">
                  <span>{item.badge}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.metrics}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end shrink-0 pl-9 sm:pl-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      setActiveTab(item.tabId as any);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] group-hover:bg-[#1473E6] group-hover:text-white border border-[#E1E5EA] group-hover:border-[#1473E6] text-xs font-semibold text-[#1E2229] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>{item.actionLabel || 'Launch Flow'}</span>
                  {item.onClick ? <Plus className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#E1E5EA]">
              <Search className="w-8 h-8 text-[#262A33] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#2C2C2C]">No tools found</h3>
              <p className="text-xs text-[#1E2229] mt-1">
                Try a different search query or select another category drawer above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create New Dataset Modal */}
      <BringInDatasetModal
        isOpen={isCreateDatasetModalOpen}
        onClose={() => setIsCreateDatasetModalOpen(false)}
        onDatasetCreated={() => {
          setIsCreateDatasetModalOpen(false);
          setActiveTab('datasets');
        }}
      />
    </div>
  );
};
