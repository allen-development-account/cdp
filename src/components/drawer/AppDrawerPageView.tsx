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
  Award
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
    warehouses
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
      color: 'from-blue-600 to-indigo-700',
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
          iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
          description: 'Define Experience Data Model schemas, custom field groups, base classes, and profile-enabled tenant schemas.',
          metrics: `${schemas.filter(s => s.status.includes('Profile')).length} Profile-Enabled`,
          tags: ['XDM System', 'Mixins', 'Behavioral Events', 'Tenancy']
        },
        {
          id: 'ingestion',
          tabId: 'ingestion',
          title: 'Data Ingestion & Streams',
          badge: 'Live Stream',
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <Radio className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
          description: 'Streaming event ingestion endpoints, Flink validation pipeline, live payload inspector, and throughput graphs.',
          metrics: `${systemMetrics.ratePerSec.toLocaleString()} evt/sec (2.4ms latency)`,
          tags: ['Kafka', 'Web SDK', 'Streaming Gateway', 'JSON/Avro']
        },
        {
          id: 'xdm_tester',
          tabId: 'xdm_tester',
          title: 'Live XDM Ingestion Tester',
          badge: 'Sub-5ms Edge',
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <Zap className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          description: 'Interactive XDM playground to fire sample ExperienceEvents, trace real-time pipeline latency, and observe dynamic segment qualification.',
          metrics: '< 5ms Edge SLA Latency',
          tags: ['XDM Tester', 'Edge Simulation', 'Live Payload', 'PQL Trace']
        },
        {
          id: 'federated_composition',
          tabId: 'federated_composition',
          title: 'Federated Zero-Copy Data Mesh',
          badge: 'Zero-Copy',
          badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
          icon: <Server className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-700',
          description: 'Execute pushdown SQL queries into Snowflake, Google BigQuery, and Databricks without duplicating or moving data.',
          metrics: warehouses.length > 0 ? `${warehouses.length} Warehouses Connected` : 'Zero-Copy Pushdown Ready',
          tags: ['Pushdown Query', 'Snowflake', 'BigQuery', 'Databricks']
        },
        {
          id: 'datasets',
          tabId: 'datasets',
          title: 'Datasets & DULE Labeling',
          badge: `${datasets.length} Datasets`,
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <Database className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-700',
          description: 'Catalog of brought-in datasets with Adobe Real-Time CDP Data Usage Labels (C, I, S, R series) and enforcement.',
          metrics: `${datasets.filter(d => d.labels.length > 0).length} Labeled / ${datasets.length} Total`,
          tags: ['DULE Labels', 'Adobe RT-CDP', 'Contractual C-Series', 'Identity I-Series']
        },
        {
          id: 'create_dataset',
          tabId: 'create_dataset',
          title: 'Bring in New Dataset',
          badge: 'Dedicated Page Flow',
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <FolderPlus className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-600 to-teal-600',
          description: 'Dedicated web page to bring in datasets (CSV, Excel, Streaming, Cloud, Zero-Copy), hot reload ingestion drivers, bind XDM schemas, and configure DULE governance.',
          metrics: 'Streaming, Batch & Zero-Copy Ingestion',
          tags: ['Bring In Dataset', 'XDM Schema Binding', 'DULE Governance', 'Profile-Enabled'],
          actionLabel: 'Bring In Dataset',
          onClick: () => setActiveTab('create_dataset')
        }
      ]
    },
    connections: {
      title: 'Connections',
      icon: <Plug className="w-6 h-6 text-white" />,
      color: 'from-teal-600 to-emerald-600',
      bannerGradient: 'from-[#F2F9F7] via-[#BCE3DB] to-[#0E473E]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#0E473E] border-[#A7F3D0]',
      badgeDot: 'bg-[#0D9488]',
      description: 'Unified ecosystem of 20+ inbound data connectors and outbound privacy-governed advertising and cloud export destinations.',
      items: [
        {
          id: 'sources',
          tabId: 'sources',
          title: 'Explore Sources',
          badge: `${ingestionSources?.length || 0} Connectors`,
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <ArrowDownToLine className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-700',
          description: 'Browse, configure, and add data to 20+ pre-built connectors including Web SDK, Kafka, CRM, Cloud storage, and eCommerce.',
          metrics: `${ingestionSources?.length || 0} Active Sources • 25+ Catalog`,
          tags: ['Inbound', 'Streaming & Batch', 'Web SDK', 'SFTP']
        },
        {
          id: 'destinations',
          tabId: 'destinations',
          title: 'Explore Destinations',
          badge: `${destinations?.length || 0} Connected`,
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <ArrowUpFromLine className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-emerald-500 to-green-700',
          description: 'Activate real-time audience segments to Google Ads, Meta CAPI, Braze, TikTok, LinkedIn Matched Audiences, and Amazon S3.',
          metrics: `${destinations?.length || 0} Connected • 18+ Catalog Targets`,
          tags: ['Outbound', 'Audience Sync', 'DULE Privacy Gate', 'CAPI']
        },
        {
          id: 'edge_simulator_conn',
          tabId: 'edge_simulator',
          title: 'Edge Network Streaming & Simulator',
          badge: '<50ms Latency',
          badgeColor: 'bg-[#FFF4E5] text-[#B76E00] border-[#FFE2B3]',
          icon: <Zap className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          description: 'Simulate sub-50ms Edge Network rule evaluation, geo-distributed edge nodes, and next-best dynamic offer selection.',
          metrics: 'Sub-50ms Global Edge POPs',
          tags: ['Edge Network', 'Sub-second', 'Rule Dispatch', 'Geo Nodes']
        }
      ]
    },
    customers: {
      title: 'Customers',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'from-indigo-600 to-purple-600',
      bannerGradient: 'from-[#F7F6FB] via-[#CDC8EB] to-[#2B2359]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#2B2359] border-[#C7D2FE]',
      badgeDot: 'bg-[#4F46E5]',
      description: 'Unified 360 Customer Profiles, visual Audience Builder, cross-device Identity Graph resolution, and B2B Account hierarchies.',
      items: [
        {
          id: 'profiles',
          tabId: 'profiles',
          title: 'Profiles (Customer 360)',
          badge: `${systemMetrics.totalProfiles.toLocaleString()} Profiles`,
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <Users className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
          description: 'Explore unified customer profile records with comprehensive event timelines, merged identity aliases, and behavioral scores.',
          metrics: systemMetrics.totalProfiles > 0 ? 'Identity Graph Active' : 'Ready for Profile Unification',
          tags: ['Customer 360', 'Unified Timeline', 'Attribute Store', 'Consent']
        },
        {
          id: 'audiences',
          tabId: 'audiences',
          title: 'Audiences & Segments',
          badge: `${audiences.length} Audiences`,
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <Layers className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-700',
          description: 'Visual segment builder with Profile Query Language (PQL) rule editor, real-time qualification, and export syndication.',
          metrics: `${audiences.filter(a => a.status === 'Active').length} Live Streaming Segments`,
          tags: ['Audience Builder', 'PQL Engine', 'Streaming Qualification']
        },
        {
          id: 'audience_overlap',
          tabId: 'audience_overlap',
          title: 'Audience Overlap & Venn Explorer',
          badge: 'Anti-Fatigue',
          badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
          icon: <Split className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-700',
          description: '2-way and 3-way Venn diagram visualizer to detect segment cannibalization, customer fatigue, and generate mutually exclusive cohorts.',
          metrics: 'Venn Intersections & Fatigue Scoring',
          tags: ['Venn Diagram', 'Overlap Analysis', 'Anti-Fatigue', 'Deduplication']
        },
        {
          id: 'identities',
          tabId: 'identities',
          title: 'Identity Graph',
          badge: 'Deterministic',
          badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
          icon: <GitMerge className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-pink-700',
          description: 'Visual graph showing deterministic and probabilistic links across ECIDs, emails, phone numbers, CRM IDs, and loyalty codes.',
          metrics: 'Cross-Device Cluster Resolution',
          tags: ['Graph Resolution', 'ECID', 'SHA-256 Hashes', 'Namespace Merge']
        },
        {
          id: 'b2b_accounts',
          tabId: 'b2b_accounts',
          title: 'B2B Accounts & Buying Groups',
          badge: 'B2B Edition',
          badgeColor: 'bg-[#FFF4E5] text-[#B76E00] border-[#FFE2B3]',
          icon: <Building2 className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-rose-500 to-red-700',
          description: 'Account hierarchy trees, buying center committees, department contact mapping, and firmographic scoring.',
          metrics: `${b2bAccounts.length} Enterprise Accounts Tracked`,
          tags: ['Account Hierarchy', 'Buying Centers', 'Firmographics', 'Lead-to-Account']
        }
      ]
    },
    data_science: {
      title: 'Data Science & Query',
      icon: <Cpu className="w-6 h-6 text-white" />,
      color: 'from-amber-500 to-orange-600',
      bannerGradient: 'from-[#FFF9F5] via-[#F6D7C1] to-[#7C2D12]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#7C2D12] border-[#FED7AA]',
      badgeDot: 'bg-[#EA580C]',
      description: 'ANSI SQL multi-dataset analytics with Data Distiller, computed rolling event aggregations, Sensei ML models, and edge personalization.',
      items: [
        {
          id: 'data_distiller',
          tabId: 'data_distiller',
          title: 'Data Distiller (SQL Query Service)',
          badge: 'ANSI SQL',
          badgeColor: 'bg-[#FFF4E5] text-[#B76E00] border-[#FFE2B3]',
          icon: <Code className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
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
          iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-700',
          description: 'Define computed behavioral aggregations like lifetime spend, rolling 30-day session counts, and favorite category traits.',
          metrics: 'Computed on Stream Ingest',
          tags: ['Lifetime Value', 'Rolling Windows', 'Aggregation Rules']
        },
        {
          id: 'ai_models',
          tabId: 'ai_models',
          title: 'Sensei AI & Clean Room',
          badge: 'ML Studio',
          badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
          icon: <Sparkles className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-700',
          description: 'AutoML predictive churn scoring, next-purchase propensity models, lookalike model expansion, and differential privacy clean rooms.',
          metrics: 'Pre-Trained Predictive Models',
          tags: ['Churn Hazard', 'Lookalike Expander', 'Clean Room', 'k-Anonymity']
        },
        {
          id: 'edge_simulator',
          tabId: 'edge_simulator',
          title: 'Edge Personalization Decisions',
          badge: '<50ms',
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <Zap className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
          description: 'Next-best-action decisioning engine testing dynamic promotion eligibility, frequency capping, and instant sub-50ms rule delivery.',
          metrics: 'Sub-50ms Edge Decisioning',
          tags: ['Dynamic Offers', 'Next Best Action', 'Frequency Caps']
        }
      ]
    },
    governance: {
      title: 'Privacy & Governance',
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      color: 'from-emerald-600 to-green-700',
      bannerGradient: 'from-[#F3F9F5] via-[#C3E4CD] to-[#14472A]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#14472A] border-[#BBF7D0]',
      badgeDot: 'bg-[#16A34A]',
      description: 'Data Usage Labeling & Enforcement (DULE), automated consumer GDPR/CCPA DSAR rights, and immutable compliance audit trails.',
      items: [
        {
          id: 'governance',
          tabId: 'governance',
          title: 'Policies & Governance (DULE)',
          badge: 'DULE Active',
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <ShieldCheck className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
          description: 'Data Usage Labeling & Enforcement framework applying contract labels (C1-C12), sensitive data masking, and egress gating.',
          metrics: destinations.length > 0 ? `${destinations.length} Destination Policies Active` : 'DULE Rule Engine Ready',
          tags: ['DULE Engine', 'Contract Labels', 'Sensitive PII Masking', 'Ad Egress Block']
        },
        {
          id: 'privacy_service',
          tabId: 'privacy_service',
          title: 'Privacy Rights & DSAR',
          badge: `${dsarRequests.length} Requests`,
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <FileCheck className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-700',
          description: 'Automated GDPR Art. 15 (Access) and Art. 17 (Right to be Forgotten) erasure requests cascading across identity graph clusters.',
          metrics: 'Zero Privacy Breach Record',
          tags: ['GDPR Art 17', 'CCPA Deletion', 'Cryptographic Proof', 'Audit Verification']
        },
        {
          id: 'audit_logs',
          tabId: 'audit_logs',
          title: 'Audit Trail & Compliance Logs',
          badge: 'SOC2 Type II',
          badgeColor: 'bg-[#F2F4F7] text-[#1A1D23] border-[#D5D5D5]',
          icon: <FileText className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-slate-600 to-gray-800',
          description: 'Immutable, tamper-evident audit logs recording every schema modification, dataset export, user query, and permission escalation.',
          metrics: 'SOC2 Type II & HIPAA Certified',
          tags: ['Audit Trail', 'SHA-256 Proof', 'Role-Based Access', 'Forensics']
        },
        {
          id: 'dataset_dule',
          tabId: 'datasets',
          title: 'Dataset Labeling Studio',
          badge: `${datasets.length} Datasets`,
          badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          icon: <ShieldCheck className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700',
          description: 'Label datasets using Adobe Real-Time CDP DULE taxonomy (Contractual, Identity, Sensitive, Regulatory).',
          metrics: 'C1-C12, I1-I2, S1-S10, R1-R4',
          tags: ['Adobe DULE', 'Dataset Governance', 'PII Masking', 'Policy Compliance']
        }
      ]
    },
    intelligence: {
      title: 'Intelligence Services',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      color: 'from-purple-600 to-pink-600',
      bannerGradient: 'from-[#FAF4F8] via-[#E2C7D9] to-[#4A154B]',
      bannerBorder: 'border-[#CBD5E1]',
      badgeStyle: 'bg-white/95 text-[#4A154B] border-[#FBCFE8]',
      badgeDot: 'bg-[#DB2777]',
      description: 'Autonomous AI Copilot for natural language CDP workflows, multi-channel journey canvases, and predictive propensity ML.',
      items: [
        {
          id: 'agentic_studio',
          tabId: 'agentic_studio',
          title: 'Autonomous AI Copilot (Agentic Studio)',
          badge: anomalies?.length ? `${anomalies.filter(a => a.status === 'Active').length} Alerts` : 'GenAI',
          badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
          icon: <Bot className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
          description: 'Ask questions in natural language to generate PQL audience rules, diagnose schema issues, and auto-heal pipeline anomalies.',
          metrics: 'Natural Language to CDP Engine',
          tags: ['GenAI Copilot', 'PQL Generator', 'Auto-Heal', 'Root Cause Analysis']
        },
        {
          id: 'journeys',
          tabId: 'journeys',
          title: 'Journey Orchestration Canvas',
          badge: 'Omnichannel',
          badgeColor: 'bg-[#FFF4E5] text-[#B76E00] border-[#FFE2B3]',
          icon: <GitFork className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-rose-500 to-orange-600',
          description: 'Interactive flowchart canvas to orchestrate multi-step customer journeys triggered by real-time events with split tests.',
          metrics: 'Dynamic Decision Splits & Timers',
          tags: ['Journey Canvas', 'Event Triggers', 'Wait Steps', 'Push & Email Actions']
        },
        {
          id: 'ai_models_intel',
          tabId: 'ai_models',
          title: 'Predictive Propensity & Churn Models',
          badge: 'AutoML',
          badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          icon: <Sparkles className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
          description: 'Machine learning algorithms continuously training on unified profile activity to predict churn risk and lifetime conversion.',
          metrics: 'High Accuracy ML Scoring',
          tags: ['Propensity ML', 'Hazard Modeling', 'Feature Importance']
        },
        {
          id: 'why_excelr8',
          tabId: 'why_excelr8',
          title: 'Why Choose XLR8 Realtime CDP?',
          badge: 'vs Adobe',
          badgeColor: 'bg-[#F2EBF9] text-[#7B2CBF] border-[#E1D0F5]',
          icon: <Award className="w-6 h-6 text-white" />,
          iconBg: 'bg-gradient-to-br from-amber-500 to-indigo-700',
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

        {/* Mobile App Drawer Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setActiveTab(item.tabId as any);
                  }
                }}
                className="bg-white rounded-2xl border border-[#E1E5EA] hover:border-[#1473E6] p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top: Dedicated App Icon + Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      {item.icon}
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-[#F2F4F7] text-[#1A1D23] border-[#E1E5EA]'}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#1E1E1E] group-hover:text-[#1473E6] transition-colors mb-1.5 flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#1473E6]" />
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#1E2229] leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Bottom: Tags + Metric + Launch Button */}
                <div className="pt-4 border-t border-[#F2F4F7] space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#262A33] font-medium">Status / Telemetry:</span>
                    <span className="font-semibold text-[#2C2C2C] font-mono text-[10px]">{item.metrics}</span>
                  </div>

                  {/* Tag chips */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#F8F9FA] text-[#1A1D23] border border-[#E8ECEF]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        setActiveTab(item.tabId as any);
                      }
                    }}
                    className="w-full mt-2 py-2 rounded-xl bg-[#F8F9FA] group-hover:bg-[#1473E6] group-hover:text-white border border-[#E1E5EA] group-hover:border-[#1473E6] text-xs font-semibold text-[#2C2C2C] transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <span>{item.actionLabel || 'Launch Flow'}</span>
                    {item.onClick ? <Plus className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

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
