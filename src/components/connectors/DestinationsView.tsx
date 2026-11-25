import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { DestinationConnector } from '../../types/cdp';
import { BrandIcon } from './BrandLogos';
import { DestinationConfigWizard, CatalogDestinationMeta } from './DestinationConfigWizard';
import {
  Search,
  Video,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Network,
  Users,
  Info
} from 'lucide-react';

interface CatalogDestinationCard {
  id: string;
  name: string;
  brandKey: string;
  type: 'Extension' | 'Connection';
  category: string;
  status: 'Connected' | 'Available';
  description: string;
  targetPlatform: string;
  supportedIdentities: string[];
  enforcedPolicies: string[];
}

const DESTINATION_CATALOG: CatalogDestinationCard[] = [
  // Advertising (Matching Image 2 exactly)
  {
    id: 'advertising_cloud',
    name: 'Advertising Cloud',
    brandKey: 'advertising_cloud',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Real-time media DSP tag integration for programmatic display and video retargeting.',
    targetPlatform: 'Media Optimization DSP',
    supportedIdentities: ['ecid', 'email_sha256'],
    enforcedPolicies: ['No Sensitive PII (S1)', 'Ad Opt-Out Enforced (R2)']
  },
  {
    id: 'awin_mastertag',
    name: 'Awin Advertiser Mastertag',
    brandKey: 'awin_mastertag',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Affiliate marketing journey tracking, publisher attribution, and commission auditing.',
    targetPlatform: 'Awin Global Affiliate Network',
    supportedIdentities: ['awin_click_id', 'order_id'],
    enforcedPolicies: ['Consent Required (GDPR)', 'No Financial PII (S1)']
  },
  {
    id: 'awin_conversion',
    name: 'Awin Conversion Tag',
    brandKey: 'awin_conversion',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Post-purchase conversion tracking tag with automated basket value validation.',
    targetPlatform: 'Awin Tracking API',
    supportedIdentities: ['order_id', 'currency', 'total_amount'],
    enforcedPolicies: ['CCPA Opt-Out Enforced', 'SHA-256 Hashed']
  },
  {
    id: 'bing_ads_uet',
    name: 'Bing Ads UET Tag',
    brandKey: 'bing_ads',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Microsoft Advertising Universal Event Tracking for search audience remarketing.',
    targetPlatform: 'Microsoft Advertising UET',
    supportedIdentities: ['msclkid', 'email_sha256'],
    enforcedPolicies: ['Search Remarketing Consent', 'No Health Data (S2)']
  },
  {
    id: 'branch_experiences',
    name: 'Branch Experiences and M...',
    brandKey: 'branch',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Cross-platform deep linking, mobile attribution, and web-to-app smart banners.',
    targetPlatform: 'Branch.io Universal Ads',
    supportedIdentities: ['branch_identity', 'idfa_gaid'],
    enforcedPolicies: ['App Tracking Transparency (ATT)']
  },
  {
    id: 'doubleclick_floodlight',
    name: 'DoubleClick Floodlight (B...',
    brandKey: 'doubleclick',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Google Marketing Platform Campaign Manager 360 transaction and counter activity tags.',
    targetPlatform: 'Google Campaign Manager 360',
    supportedIdentities: ['gclid', 'dcm_cookie'],
    enforcedPolicies: ['EU User Consent Policy', 'No Sensitive PII (S1)']
  },
  {
    id: 'facebook_pixel',
    name: 'Facebook Pixel',
    brandKey: 'facebook_pixel',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Meta client-side web event tracker and standard event mapping for Meta Ads.',
    targetPlatform: 'Meta Pixel v19.0',
    supportedIdentities: ['fbp_cookie', 'fbc_cookie', 'email_sha256'],
    enforcedPolicies: ['Meta Limited Data Use (LDU)', 'CCPA Opt-Out Gated']
  },
  {
    id: 'flashtalking_onetag',
    name: 'Flashtalking OneTag',
    brandKey: 'flashtalking',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Independent ad server tag for dynamic creative optimization (DCO) and attribution.',
    targetPlatform: 'Mediaocean Flashtalking',
    supportedIdentities: ['ft_uid', 'guid'],
    enforcedPolicies: ['DCO Cookie Consent', 'No Sensitive PII (S1)']
  },
  {
    id: 'google_ads_ext',
    name: 'Google Ads',
    brandKey: 'google_ads',
    type: 'Extension',
    category: 'Advertising',
    status: 'Available',
    description: 'Google Ads conversion tracking tag and dynamic remarketing tag container.',
    targetPlatform: 'Google Ads Tagging Service',
    supportedIdentities: ['gclid', 'email_sha256'],
    enforcedPolicies: ['EU User Consent Policy', 'SHA-256 Hashed Identifiers']
  },

  // Connection types (Server-side API activations)
  {
    id: 'google_customer_match',
    name: 'Google Customer Match (Google Ads)',
    brandKey: 'google_ads',
    type: 'Connection',
    category: 'Advertising',
    status: 'Available',
    description: 'Direct Google Ads API Customer Match list sync using OAuth 2.0, Customer ID (XXX-XXX-XXXX), and SHA-256 PII matching.',
    targetPlatform: 'Google Ads API v18 (Customer Match)',
    supportedIdentities: ['email_lc_sha256', 'phone_e164_sha256', 'mobile_id', 'crm_id'],
    enforcedPolicies: ['EU User Consent Policy', 'SHA-256 Hashed Identifiers', 'No Sensitive PII (S1)']
  },
  {
    id: 'meta_capi',
    name: 'Meta Ads (Conversions API)',
    brandKey: 'meta',
    type: 'Connection',
    category: 'Advertising',
    status: 'Available',
    description: 'Direct server-to-server audience sync and conversion API dispatch bypassing ad blockers.',
    targetPlatform: 'Meta Conversions API',
    supportedIdentities: ['email_sha256', 'phone_e164_sha256', 'fbp_cookie'],
    enforcedPolicies: ['CCPA Opt-Out Gated', 'No Financial PII (S1)']
  },
  {
    id: 'linkedin_matched',
    name: 'LinkedIn Ads (Matched Audiences)',
    brandKey: 'linkedin',
    type: 'Connection',
    category: 'Advertising',
    status: 'Available',
    description: 'B2B company and contact audience sync for sponsored content and InMail campaigns.',
    targetPlatform: 'LinkedIn Marketing API',
    supportedIdentities: ['work_email_sha256', 'company_domain'],
    enforcedPolicies: ['GDPR B2B Legitimate Interest Validated']
  },
  {
    id: 'pinterest_tag',
    name: 'Pinterest Tag',
    brandKey: 'pinterest',
    type: 'Extension',
    category: 'Social',
    status: 'Available',
    description: 'Promoted Pins conversion tracking and audience qualification tag.',
    targetPlatform: 'Pinterest Ads API',
    supportedIdentities: ['email_sha256', 'epik_cookie'],
    enforcedPolicies: ['Pinterest Merchant Consent']
  },
  {
    id: 'tiktok_events',
    name: 'TikTok Ads (Events API)',
    brandKey: 'tiktok',
    type: 'Connection',
    category: 'Social',
    status: 'Available',
    description: 'Direct server-to-server audience matching for TikTok feed ads and Spark Ads.',
    targetPlatform: 'TikTok Business API',
    supportedIdentities: ['email_sha256', 'phone_e164_sha256'],
    enforcedPolicies: ['No Sensitive PII (S1)', 'CCPA Opt-Out Gated']
  },

  // DMP
  {
    id: 'xlr8_audience_mgr_dmp',
    name: 'XLR8 Audience Manager DMP',
    brandKey: 'xpr_audience',
    type: 'Connection',
    category: 'DMP',
    status: 'Available',
    description: 'Real-time trait & segment syndication into cross-publisher lookalike DMP pools.',
    targetPlatform: 'XLR8 Audience Marketplace',
    supportedIdentities: ['ecid', 'idfa_gaid'],
    enforcedPolicies: ['3rd-Party Sharing Consent Required']
  },
  {
    id: 'liveramp_dmp',
    name: 'LiveRamp RampID Syndication',
    brandKey: 'xpr',
    type: 'Connection',
    category: 'DMP',
    status: 'Available',
    description: 'Privacy-preserving RampID audience distribution to programmatic DSP networks.',
    targetPlatform: 'LiveRamp Distribution Hub',
    supportedIdentities: ['ramp_id', 'email_sha256'],
    enforcedPolicies: ['CCPA Opt-Out Enforced', 'SHA-256 Hashed']
  },

  // Email & MarTech
  {
    id: 'braze_cdi',
    name: 'Braze (Cloud Data Ingestion & API)',
    brandKey: 'braze',
    type: 'Connection',
    category: 'Email',
    status: 'Available',
    description: 'Sync live customer segments to Braze user tracks for push, in-app, and email campaigns.',
    targetPlatform: 'Braze REST API & CDI',
    supportedIdentities: ['external_user_id', 'email_sha256'],
    enforcedPolicies: ['Email Marketing Opt-In Validated']
  },
  {
    id: 'klaviyo_sync',
    name: 'Klaviyo',
    brandKey: 'klaviyo',
    type: 'Connection',
    category: 'Email',
    status: 'Available',
    description: 'Ecommerce list and segment sync for personalized flow automation and SMS campaigns.',
    targetPlatform: 'Klaviyo Profiles API',
    supportedIdentities: ['email', 'phone_number'],
    enforcedPolicies: ['TCPA Consent Required for SMS']
  },
  {
    id: 'marketo_dest',
    name: 'Marketo Engage',
    brandKey: 'marketo',
    type: 'Connection',
    category: 'Email',
    status: 'Available',
    description: 'B2B list membership sync for Smart Campaigns and lead nurturing tracks.',
    targetPlatform: 'Marketo REST Lead API',
    supportedIdentities: ['work_email', 'sfdc_lead_id'],
    enforcedPolicies: ['Enterprise B2B Governance']
  },

  // Personalization
  {
    id: 'xlr8_target_edge',
    name: 'XLR8 Target Edge Offers',
    brandKey: 'xpr',
    type: 'Extension',
    category: 'Personalization',
    status: 'Available',
    description: 'Sub-50ms edge decisioning and next-best-offer delivery for web hero banners and checkout.',
    targetPlatform: 'XLR8 Edge Decisioning API',
    supportedIdentities: ['ecid', 'crm_id'],
    enforcedPolicies: ['GDPR Profile Personalization Consent']
  },
  {
    id: 'optimizely_full_stack',
    name: 'Optimizely Feature & Web',
    brandKey: 'xpr_web_sdk',
    type: 'Connection',
    category: 'Personalization',
    status: 'Available',
    description: 'Stream real-time audience membership flags to Optimizely experimentation flags.',
    targetPlatform: 'Optimizely Data Platform',
    supportedIdentities: ['visitor_id', 'email_sha256'],
    enforcedPolicies: ['No Sensitive PII (S1)']
  },
  {
    id: 'dynamic_yield_sync',
    name: 'Dynamic Yield Audience Sync',
    brandKey: 'advertising_cloud',
    type: 'Connection',
    category: 'Personalization',
    status: 'Available',
    description: 'Synchronize behavioral cohorts and affinity scores for 1:1 product recommendations.',
    targetPlatform: 'Dynamic Yield API',
    supportedIdentities: ['dyid', 'email_sha256'],
    enforcedPolicies: ['Site Personalization Opt-In']
  },

  // Analytics
  {
    id: 'google_analytics_4',
    name: 'Google Analytics 4',
    brandKey: 'google',
    type: 'Connection',
    category: 'Analytics',
    status: 'Available',
    description: 'Measurement Protocol export sending audience qualification milestones into GA4.',
    targetPlatform: 'GA4 Measurement Protocol',
    supportedIdentities: ['client_id', 'user_id'],
    enforcedPolicies: ['No PII Egress (S1)']
  },
  {
    id: 'mixpanel_cohort_sync',
    name: 'Mixpanel Cohort Sync',
    brandKey: 'doubleclick',
    type: 'Connection',
    category: 'Analytics',
    status: 'Available',
    description: 'Export CDP segments into Mixpanel cohorts for product funnel and retention analysis.',
    targetPlatform: 'Mixpanel Engage API',
    supportedIdentities: ['distinct_id', 'email_sha256'],
    enforcedPolicies: ['Analytics Consent Validated']
  },

  // Surveys
  {
    id: 'qualtrics_xm',
    name: 'Qualtrics XM Intercepts',
    brandKey: 'xpr',
    type: 'Extension',
    category: 'Surveys',
    status: 'Available',
    description: 'Trigger targeted NPS and post-purchase experience surveys based on real-time segments.',
    targetPlatform: 'Qualtrics XM Directory',
    supportedIdentities: ['email', 'crm_id'],
    enforcedPolicies: ['Customer Feedback Consent']
  },
  {
    id: 'surveymonkey_ent',
    name: 'SurveyMonkey Enterprise',
    brandKey: 'customer_attributes',
    type: 'Connection',
    category: 'Surveys',
    status: 'Available',
    description: 'Sync segmented customer panels to SurveyMonkey Collectors for voice-of-market outreach.',
    targetPlatform: 'SurveyMonkey REST API',
    supportedIdentities: ['email', 'external_id'],
    enforcedPolicies: ['GDPR Marketing/Research Opt-In']
  },

  // Voice of the customer
  {
    id: 'medallia_voc',
    name: 'Medallia Experience Cloud',
    brandKey: 'salesforce',
    type: 'Connection',
    category: 'Voice of the customer',
    status: 'Available',
    description: 'Enrich VoC closed-loop workflows with VIP tier, churn risk, and recent purchase traits.',
    targetPlatform: 'Medallia Streaming API',
    supportedIdentities: ['crm_id', 'email_sha256'],
    enforcedPolicies: ['Confidentiality Boundary (C2)']
  },
  {
    id: 'chattermill_voc',
    name: 'Chattermill Insights Sync',
    brandKey: 'xpr',
    type: 'Connection',
    category: 'Voice of the customer',
    status: 'Available',
    description: 'Push unified segment labels to Chattermill sentiment models for cohort breakdown.',
    targetPlatform: 'Chattermill API v2',
    supportedIdentities: ['customer_id', 'email_sha256'],
    enforcedPolicies: ['No Sensitive Financial PII (S1)']
  },

  // Cloud storage
  {
    id: 'aws_s3_dest',
    name: 'Amazon S3 Export',
    brandKey: 'amazon_s3',
    type: 'Connection',
    category: 'Cloud storage',
    status: 'Available',
    description: 'Export segmented audiences as partitioned Parquet or CSV files to an enterprise data lake.',
    targetPlatform: 'Amazon S3 Bucket Egress',
    supportedIdentities: ['xpr_guid', 'all_hashed_attributes'],
    enforcedPolicies: ['Encryption at Rest (SSE-KMS)']
  },
  {
    id: 'snowflake_cleanroom',
    name: 'Snowflake Data Clean Room',
    brandKey: 'snowflake',
    type: 'Connection',
    category: 'Cloud storage',
    status: 'Available',
    description: 'Privacy-preserving zero-copy differential privacy queries and clean room syndication.',
    targetPlatform: 'Snowflake Secure Share',
    supportedIdentities: ['uid2_token', 'sha256_hashed'],
    enforcedPolicies: ['Differential Privacy k-Anonymity (k>=50)']
  },
  {
    id: 'custom_http_webhook_dest',
    name: 'Real-Time Custom Webhook',
    brandKey: 'xpr',
    type: 'Connection',
    category: 'Cloud storage',
    status: 'Available',
    description: 'Direct sub-second HTTPS JSON webhook dispatch to any external API or downstream system.',
    targetPlatform: 'HTTP JSON Egress Endpoint',
    supportedIdentities: ['email_sha256', 'profile_id'],
    enforcedPolicies: ['DULE Consent Gatekeep Verified']
  }
];

const DESTINATION_CATEGORIES = [
  'Advertising',
  'Analytics',
  'DMP',
  'Email',
  'Personalization',
  'Social',
  'Surveys',
  'Voice of the customer',
  'Cloud storage'
];

export const DestinationsView: React.FC = () => {
  const {
    destinations,
    audiences,
    profiles,
    connectDestination,
    activateDestination,
    addAuditLog,
    addTerminalLog,
    testOutboundWebhook,
    setActiveTab: setParentActiveTab
  } = useCDP();

  // Top navigation tabs matching reference Image 2
  const [activeTab, setActiveTab] = useState<'Overview' | 'Catalog' | 'Browse' | 'Accounts' | 'System View'>('Catalog');

  // Filter states
  const [destFilter, setDestFilter] = useState<'all' | 'my'>('all');
  const [typesFilter, setTypesFilter] = useState<{ connections: boolean; extensions: boolean }>({
    connections: true,
    extensions: true
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Advertising');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero banner toggle
  const [heroExpanded, setHeroExpanded] = useState(false);
  const [introVideoModalOpen, setIntroVideoModalOpen] = useState(false);
  const [specModalCard, setSpecModalCard] = useState<CatalogDestinationCard | null>(null);
  const [browseNotice, setBrowseNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Configuration Wizard State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CatalogDestinationCard | null>(null);
  const [wizardInitialStep, setWizardInitialStep] = useState<1 | 2 | 3 | 4>(1);

  // Popover menu
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const safeDestinations = destinations || [];
  const safeAudiences = audiences || [];

  const isCatalogCardConnected = (item: CatalogDestinationCard) => {
    return safeDestinations.some(
      d =>
        d.catalogId === item.id ||
        d.id === item.id ||
        d.id === `dest_${item.id}` ||
        d.name.toLowerCase() === item.name.toLowerCase() ||
        d.targetPlatform.toLowerCase() === item.targetPlatform.toLowerCase()
    );
  };

  // Filter catalog items
  const filteredCatalog = useMemo(() => {
    return DESTINATION_CATALOG.filter(item => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // My destinations filter (dynamically derived from live connected destinations)
      if (destFilter === 'my' && !isCatalogCardConnected(item)) {
        return false;
      }

      // Types filter (Connections vs Extensions)
      if (!typesFilter.connections && !typesFilter.extensions) {
        return false;
      } else if (typesFilter.connections && !typesFilter.extensions) {
        if (item.type !== 'Connection') return false;
      } else if (!typesFilter.connections && typesFilter.extensions) {
        if (item.type !== 'Extension') return false;
      }

      // Category filter (when not searching and not viewing all 'my')
      if (!searchQuery.trim() && destFilter === 'all' && selectedCategory) {
        return item.category === selectedCategory;
      }

      return true;
    });
  }, [searchQuery, destFilter, typesFilter, selectedCategory, safeDestinations]);

  const findMatchingCatalogCard = (dest: DestinationConnector): CatalogDestinationCard => {
    const match = DESTINATION_CATALOG.find(
      item =>
        dest.catalogId === item.id ||
        dest.id === item.id ||
        dest.id === `dest_${item.id}` ||
        dest.name.toLowerCase() === item.name.toLowerCase()
    );
    if (match) return match;
    return {
      id: dest.id,
      name: dest.name,
      brandKey: dest.icon || 'advertising_cloud',
      type: dest.type === 'ad_network' ? 'Connection' : 'Connection',
      category: dest.category === 'Ad Networks' ? 'Advertising' : dest.category === 'Cloud Storage' ? 'Cloud storage' : 'Email',
      status: 'Connected',
      description: dest.description,
      targetPlatform: dest.targetPlatform,
      supportedIdentities: dest.supportedIdentities || ['email_sha256'],
      enforcedPolicies: dest.enforcedPolicies || ['DULE Privacy Boundary Enforced'],
    };
  };

  const handleOpenConfigure = (card: CatalogDestinationCard, initialStep: 1 | 2 | 3 | 4 = 1) => {
    setSelectedCard(card);
    setWizardInitialStep(initialStep);
    setConfigModalOpen(true);
    setMenuOpenId(null);
  };

  const findExistingDestForCard = (card: CatalogDestinationCard | null): DestinationConnector | undefined => {
    if (!card) return undefined;
    return safeDestinations.find(
      d =>
        d.catalogId === card.id ||
        d.id === card.id ||
        d.id === `dest_${card.id}` ||
        d.name.toLowerCase() === card.name.toLowerCase()
    );
  };

  const handleSaveAccountOnly = (destObj: DestinationConnector) => {
    connectDestination(destObj);
    if (destObj.endpoint) {
      fetch(`/api/v1/destinations/${destObj.id}/endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: destObj.endpoint }),
      }).catch(() => {});
    }
    addAuditLog({
      userId: destObj.connectedUserEmail || 'usr_admin_session@xlr8.cdp',
      userName: 'Platform Admin',
      userRole: 'Super Admin',
      category: 'Audience & Activation',
      action: 'Authenticated Destination Account',
      targetEntity: `Destination: ${destObj.name} (${destObj.accountId || destObj.id})`,
      status: 'SUCCESS',
      ipAddress: '10.24.0.1',
      client: 'XLR8 Platform Destination Hub',
      summary: `Authenticated ${destObj.name} account (${destObj.accountId || 'N/A'}) via ${destObj.authType || 'OAuth 2.0'}.`,
      complianceFlags: ['OAuth 2.0 Scoped Grant', 'DULE Policy Ready']
    });
  };

  const handleSaveAndActivateWizard = (destObj: DestinationConnector, audienceId: string) => {
    connectDestination(destObj);
    if (destObj.endpoint) {
      fetch(`/api/v1/destinations/${destObj.id}/endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: destObj.endpoint }),
      }).catch(() => {});
    }
    const syncLog = activateDestination(destObj.id, audienceId, destObj);
    const chosenAudience = safeAudiences.find(a => a.id === audienceId);

    addAuditLog({
      userId: destObj.connectedUserEmail || 'usr_admin_session@xlr8.cdp',
      userName: 'Platform Admin',
      userRole: 'Super Admin',
      category: 'Audience & Activation',
      action: 'Configured Destination Activation',
      targetEntity: `Destination: ${destObj.name} (${destObj.accountId || destObj.id})`,
      status: 'SUCCESS',
      ipAddress: '10.24.0.1',
      client: 'XLR8 Platform Destination Hub',
      summary: `Activated "${chosenAudience?.name || audienceId}" to ${destObj.name} (${destObj.syncFrequency}): ${syncLog.profilesSynced} synced, ${syncLog.profilesBlockedPrivacy} privacy-blocked.`,
      complianceFlags: ['DULE Privacy Boundary Enforced', 'SHA-256 Masking']
    });

    return {
      profilesSynced: syncLog.profilesSynced,
      profilesBlockedPrivacy: syncLog.profilesBlockedPrivacy,
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#2C2C2C] overflow-hidden select-none" id="destinations-view-root">
      {/* Top Header */}
      <div className="px-8 pt-6 pb-0 border-b border-[#0E4DA4] bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white shrink-0">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <PageBackButton fallbackTab="hub_connections" fallbackLabel="Connections" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Destinations</h1>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setParentActiveTab('audiences')}
              className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] border border-white/25 font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-2xs transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Audience Builder</span>
            </button>
          </div>
        </div>

        {/* Horizontal Sub-tabs */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          {(['Overview', 'Catalog', 'Browse', 'Accounts', 'System View'] as const).map(tab => (
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

      {/* Main Body Content */}
      <div className="flex-1 overflow-hidden">
        {/* ================= CATALOG TAB (MATCHES IMAGE 2) ================= */}
        {activeTab === 'Catalog' && (
          <div className="h-full overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto space-y-6">
              {/* Hero Promotional Banner */}
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border border-[#0E4DA4] rounded-xl p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                    Activate your audiences using XLR8's Real-time Customer Data Platform
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIntroVideoModalOpen(true)}
                      className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white hover:bg-[#F2F4F7] text-xs font-semibold text-[#0D66D0] transition-colors shadow-2xs cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-[#1473E6]" />
                      <span>Introduction to destinations</span>
                    </button>
                  </div>

                  {heroExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/20 text-xs text-blue-100 space-y-2">
                      <p>
                        Destinations are pre-built integrations with destination partners that seamlessly activate customer audiences. Use extensions to configure client-side tags or use connections for real-time server-to-server data delivery.
                      </p>
                      <p>
                        All outbound data flows automatically enforce Data Usage Labeling & Enforcement (DULE) governance to prevent non-consented PII leakage.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Isometric 3D Destination Portal Graphic matching Image 2 */}
                <div className="flex items-center space-x-4 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setHeroExpanded(!heroExpanded)}
                    className="text-xs text-white hover:text-blue-100 bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-1 rounded-full font-semibold flex items-center space-x-1 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    <span>{heroExpanded ? 'Show less' : 'Show more'}</span>
                    {heroExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Isometric 3D Box Illustration matching screenshot */}
                  <div className="w-32 h-24 flex items-center justify-center relative">
                    <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-md">
                      <defs>
                        <linearGradient id="isoTop" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1B365D" />
                          <stop offset="100%" stopColor="#0B1A30" />
                        </linearGradient>
                        <linearGradient id="isoLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2E5C9A" />
                          <stop offset="100%" stopColor="#142B4D" />
                        </linearGradient>
                        <linearGradient id="isoRight" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3E7ACB" />
                          <stop offset="100%" stopColor="#1B3A68" />
                        </linearGradient>
                        <linearGradient id="arrowGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00E5FF" />
                          <stop offset="100%" stopColor="#0080FF" />
                        </linearGradient>
                      </defs>

                      {/* Lower shadow base */}
                      <path d="M60 85 L105 60 L60 38 L15 60 Z" fill="#E2E8F0" opacity="0.6" />

                      {/* 3D Isometric Cube */}
                      {/* Left face */}
                      <path d="M20 55 L60 76 L60 92 L20 70 Z" fill="url(#isoLeft)" />
                      {/* Right face */}
                      <path d="M60 76 L100 55 L100 70 L60 92 Z" fill="url(#isoRight)" />
                      {/* Top face with circular recessed activation portal */}
                      <path d="M60 34 L100 55 L60 76 L20 55 Z" fill="url(#isoTop)" />

                      {/* Glowing Cyan Portal Rim */}
                      <ellipse cx="60" cy="55" rx="20" ry="10" fill="#0D223F" stroke="#00C8FF" strokeWidth="2.5" />
                      <ellipse cx="60" cy="55" rx="14" ry="7" fill="#051224" />

                      {/* Outward curved activation arrow */}
                      <path
                        d="M60 55 Q75 35 62 20"
                        fill="none"
                        stroke="url(#arrowGlow)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <polygon points="56,22 64,16 68,24" fill="#00E5FF" />

                      {/* Little floating data cubes */}
                      <rect x="90" y="24" width="8" height="8" rx="2" fill="#93C5FD" opacity="0.8" />
                      <rect x="18" y="32" width="6" height="6" rx="1.5" fill="#BFDBFE" opacity="0.7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Catalog Filter & Cards Layout */}
              <div className="flex gap-8 items-start">
                {/* Left Sidebar Filter Panel matching Image 2 */}
                <div className="w-56 shrink-0 space-y-6">
                  {/* Radio: All destinations vs My destinations */}
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[#2C2C2C]">
                      <input
                        type="radio"
                        name="dest_filter"
                        checked={destFilter === 'all'}
                        onChange={() => setDestFilter('all')}
                        className="w-3.5 h-3.5 text-[#1473E6] focus:ring-[#1473E6]"
                      />
                      <span>All destinations</span>
                    </label>

                    <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[#2C2C2C]">
                      <input
                        type="radio"
                        name="dest_filter"
                        checked={destFilter === 'my'}
                        onChange={() => setDestFilter('my')}
                        className="w-3.5 h-3.5 text-[#1473E6] focus:ring-[#1473E6]"
                      />
                      <span>My destinations</span>
                    </label>
                  </div>

                  {/* TYPES Section matching Image 2 */}
                  <div>
                    <span className="text-[11px] font-bold text-[#1E2229] uppercase tracking-wider block mb-2">
                      Types
                    </span>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-[#2C2C2C]">
                        <input
                          type="checkbox"
                          checked={typesFilter.connections}
                          onChange={e =>
                            setTypesFilter(prev => ({ ...prev, connections: e.target.checked }))
                          }
                          className="w-3.5 h-3.5 rounded text-[#1473E6] focus:ring-[#1473E6]"
                        />
                        <span>Connections</span>
                      </label>

                      <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-[#2C2C2C]">
                        <input
                          type="checkbox"
                          checked={typesFilter.extensions}
                          onChange={e =>
                            setTypesFilter(prev => ({ ...prev, extensions: e.target.checked }))
                          }
                          className="w-3.5 h-3.5 rounded text-[#1473E6] focus:ring-[#1473E6]"
                        />
                        <span>Extensions</span>
                      </label>
                    </div>
                  </div>

                  {/* CATEGORIES Section matching Image 2 */}
                  <div>
                    <span className="text-[11px] font-bold text-[#1E2229] uppercase tracking-wider block mb-2">
                      Categories
                    </span>
                    <div className="space-y-0.5">
                      {DESTINATION_CATEGORIES.map(cat => {
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
                </div>

                {/* Right Cards Content Area matching Image 2 */}
                <div className="flex-1 min-w-0">
                  {/* Search Bar */}
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

                  {/* Section Title */}
                  <h2 className="text-sm font-bold text-[#2C2C2C] mb-4">
                    {searchQuery
                      ? `Search Results (${filteredCatalog.length})`
                      : destFilter === 'my'
                      ? `My Connected Destinations (${filteredCatalog.length})`
                      : selectedCategory}
                  </h2>

                  {/* 3-Column Card Grid exactly matching Image 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCatalog.map(card => {
                      const isConnected = isCatalogCardConnected(card);
                      return (
                        <div
                          key={card.id}
                          className={`bg-[#FFFFFF] border rounded-xl p-5 flex flex-col justify-between h-[160px] shadow-2xs transition-all ${
                            isConnected ? 'border-[#93C5FD] hover:border-[#1473E6]' : 'border-[#E5E7EB] hover:border-[#93C5FD]'
                          }`}
                        >
                          {/* Top: Logo + Name + Subtitle */}
                          <div className="flex items-start space-x-3.5">
                            <BrandIcon name={card.brandKey} className="w-9 h-9 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-[#2C2C2C] block truncate leading-snug">
                                  {card.name}
                                </span>
                                {isConnected && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] shrink-0">
                                    Connected
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#1E2229] block mt-0.5">
                                {card.type} · {card.category}
                              </span>
                            </div>
                          </div>

                          {/* Bottom: Configure Pill Button + '...' menu */}
                          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F2F4F7]">
                            <button
                              onClick={() => handleOpenConfigure(card)}
                              className="px-4 py-1 rounded-full border border-[#D5D5D5] hover:border-[#888888] hover:bg-[#F2F4F7] text-xs font-semibold text-[#2C2C2C] transition-all shadow-2xs"
                            >
                              {isConnected ? 'Sync / Edit' : 'Configure'}
                            </button>

                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === card.id ? null : card.id)}
                                className="p-1 rounded-full hover:bg-[#F2F4F7] text-[#1E2229] hover:text-[#2C2C2C] transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {/* Popover options menu */}
                              {menuOpenId === card.id && (
                                <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#FFFFFF] border border-[#E1E5EA] rounded-lg shadow-lg py-1 z-30 text-xs">
                                  <button
                                    onClick={() => handleOpenConfigure(card)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-[#F2F4F7] text-[#2C2C2C]"
                                  >
                                    Configure activation
                                  </button>
                                  <button
                                    onClick={() => {
                                      setParentActiveTab('governance');
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-[#F2F4F7] text-[#2C2C2C]"
                                  >
                                    Inspect DULE policies
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSpecModalCard(card);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-[#F2F4F7] text-[#2C2C2C]"
                                  >
                                    View integration specs
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredCatalog.length === 0 && (
                    <div className="text-center py-16 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E1E5EA] space-y-3">
                      <Search className="w-8 h-8 text-[#1473E6] mx-auto" />
                      <h3 className="text-sm font-bold text-[#2C2C2C]">
                        {destFilter === 'my' ? 'No connected destinations yet' : 'No destinations found'}
                      </h3>
                      <p className="text-xs text-[#1E2229] max-w-md mx-auto">
                        {destFilter === 'my'
                          ? 'No destination instances are connected in this clean workspace yet. Switch to All destinations to configure an endpoint.'
                          : 'Try adjusting your search filters or check both Connections and Extensions checkboxes.'}
                      </p>
                      {destFilter === 'my' && (
                        <button
                          onClick={() => setDestFilter('all')}
                          className="px-4 py-1.5 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold shadow-2xs cursor-pointer"
                        >
                          Browse All Destinations
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'Overview' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-5 py-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Audience Activation & Destinations Overview</h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Syndicate real-time customer segments to ad networks, marketing automation platforms, and data clean rooms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[#E1E5EA] shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">1. Segment Creation</span>
                <h3 className="text-sm font-bold text-[#2C2C2C]">Define Audiences</h3>
                <p className="text-xs text-[#1E2229]">
                  Build deterministic behavioral and profile audiences using PQL expressions or the visual Audience Builder.
                </p>
                <button
                  onClick={() => setParentActiveTab('audiences')}
                  className="text-xs text-[#1473E6] font-semibold hover:underline pt-2 block"
                >
                  Open Audience Builder →
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E1E5EA] shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">2. Governance Boundary</span>
                <h3 className="text-sm font-bold text-[#2C2C2C]">Automated DULE Checks</h3>
                <p className="text-xs text-[#1E2229]">
                  Data Usage Labeling & Enforcement automatically blocks profiles lacking marketing consent or containing sensitive PII.
                </p>
                <button
                  onClick={() => setParentActiveTab('governance')}
                  className="text-xs text-[#1473E6] font-semibold hover:underline pt-2 block"
                >
                  View DULE Policies →
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E1E5EA] shadow-2xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">3. Edge Dispatch</span>
                <h3 className="text-sm font-bold text-[#2C2C2C]">Sub-Second Syndication</h3>
                <p className="text-xs text-[#1E2229]">
                  Edge delivery feeds destination APIs via real-time webhooks or scheduled micro-batches.
                </p>
                <button
                  onClick={() => setActiveTab('Browse')}
                  className="text-xs text-[#1473E6] font-semibold hover:underline pt-2 block"
                >
                  Browse Active Instances →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= BROWSE TAB ================= */}
        {activeTab === 'Browse' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-5 py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Active Destination Integrations</h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Live outbound connections with real-time sync metrics, synced profile counts, and privacy gate counts.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('Catalog')}
                className="px-4 py-1.5 rounded-full bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold shadow-2xs transition-colors shrink-0 self-start sm:self-center cursor-pointer whitespace-nowrap"
              >
                + Connect New Destination
              </button>
            </div>

            {browseNotice && (
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                browseNotice.type === 'success'
                  ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]'
                  : 'bg-[#EFF6FF] border-[#93C5FD] text-[#0A3D82]'
              }`}>
                <span>{browseNotice.text}</span>
                <button onClick={() => setBrowseNotice(null)} className="font-bold ml-3">✕</button>
              </div>
            )}

            {safeDestinations.length === 0 ? (
              <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#D0D7DE] p-12 text-center space-y-3">
                <Send className="w-8 h-8 text-[#1473E6] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">No Active Destination Instances</h3>
                <p className="text-xs text-[#596780] max-w-md mx-auto">
                  Connect an ad network, MarTech platform, or webhook from the Catalog and pair it with an audience segment.
                </p>
                <button
                  onClick={() => setActiveTab('Catalog')}
                  className="px-4 py-1.5 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold cursor-pointer"
                >
                  Browse Destination Catalog
                </button>
              </div>
            ) : (
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] border-b border-[#0E4DA4] text-white font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-white">Destination Name</th>
                      <th className="px-5 py-3 text-white">Target Platform</th>
                      <th className="px-5 py-3 text-white">Cadence</th>
                      <th className="px-5 py-3 text-white">Status</th>
                      <th className="px-5 py-3 text-right text-white">Synced Profiles</th>
                      <th className="px-5 py-3 text-right text-white">DULE Blocked</th>
                      <th className="px-5 py-3 text-right text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {safeDestinations.map(dest => (
                      <tr key={dest.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <BrandIcon name={dest.icon || (dest.name.toLowerCase().includes('google') ? 'google_ads' : dest.name.toLowerCase().includes('meta') ? 'meta' : dest.name.toLowerCase().includes('linkedin') ? 'linkedin' : 'advertising_cloud')} className="w-7 h-7 shrink-0" />
                            <div>
                              <span className="font-bold text-[#2C2C2C] block">{dest.connectionName || dest.name}</span>
                              <span className="text-[10px] text-[#596780] font-mono">
                                {dest.accountId ? `Account ID: ${dest.accountId}` : dest.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#1A1D23] font-medium">
                          <span className="block">{dest.targetPlatform}</span>
                          {dest.configuredAudienceName && (
                            <span className="text-[10px] text-[#0D66D0] font-semibold">
                              Audience: {dest.configuredAudienceName}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF3FC] text-[#0D66D0]">
                            {dest.syncFrequency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F2FE] text-[#0369A1]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                            <span>{dest.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-[#2C2C2C]">
                          {dest.totalSynced.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-[#1D4ED8] font-semibold">
                          {dest.totalBlockedForPrivacy.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenConfigure(findMatchingCatalogCard(dest), 1)}
                              className="px-2.5 py-1 rounded border border-[#D5D5D5] hover:bg-[#F2F4F7] text-[#2C2C2C] text-xs font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (safeAudiences.length === 0) {
                                  setBrowseNotice({ type: 'error', text: 'Create at least one Audience Segment before triggering a sync.' });
                                  return;
                                }
                                const targetAudience =
                                  (dest.configuredAudienceId && safeAudiences.find(a => a.id === dest.configuredAudienceId)) ||
                                  safeAudiences[0];
                                const log = activateDestination(dest.id, targetAudience.id, dest);
                                if (dest.endpoint) {
                                  testOutboundWebhook(dest.endpoint, {
                                    event: 'audience_sync',
                                    destination: dest.name,
                                    accountId: dest.accountId,
                                    audienceId: targetAudience.id,
                                    audienceName: targetAudience.name,
                                    profilesSynced: log.profilesSynced,
                                    profilesBlockedPrivacy: log.profilesBlockedPrivacy,
                                  }).catch(() => {});
                                }
                                setBrowseNotice({
                                  type: 'success',
                                  text: `Synced "${targetAudience.name}" to ${dest.connectionName || dest.name}: ${log.profilesSynced} profile(s) delivered, ${log.profilesBlockedPrivacy} privacy-suppressed.`
                                });
                              }}
                              className="px-3 py-1 rounded bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Sync Now
                            </button>
                          </div>
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
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-5 py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Destination Ad Accounts &amp; Authorizations</h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Connected Customer IDs, OAuth 2.0 grants, and field mappings active in this workspace. Edit any account to renew OAuth credentials.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('Catalog')}
                className="px-4 py-1.5 rounded-full bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-center whitespace-nowrap"
              >
                + Connect Account
              </button>
            </div>

            {safeDestinations.length === 0 ? (
              <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#D0D7DE] p-12 text-center space-y-3">
                <Lock className="w-8 h-8 text-[#1473E6] mx-auto" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">No Authorized Destination Accounts</h3>
                <p className="text-xs text-[#596780] max-w-md mx-auto">
                  Select any destination (such as Google Ads or Meta Ads) in the Catalog to authorize OAuth 2.0 credentials and bind your Customer Account ID.
                </p>
                <button
                  onClick={() => setActiveTab('Catalog')}
                  className="px-4 py-1.5 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold cursor-pointer"
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {safeDestinations.map(dest => (
                  <div key={dest.id} className="bg-white p-5 rounded-xl border border-[#E1E5EA] shadow-2xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <BrandIcon name={dest.icon || 'advertising_cloud'} className="w-8 h-8 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#2C2C2C] block truncate">{dest.connectionName || dest.name}</span>
                            <span className="text-[10px] text-[#0369A1] font-semibold">
                              {dest.authStatus || 'Authenticated'} · {dest.authType || 'OAuth 2.0'}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] text-[10px] font-bold shrink-0">
                          {dest.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] bg-[#F8FAFC] p-3 rounded-lg border border-[#E1E5EA]">
                        <div className="flex justify-between gap-2">
                          <span className="text-[#596780] shrink-0">Customer / Account ID</span>
                          <span className="font-mono font-bold text-[#1E2229] truncate">{dest.accountId || 'Configured'}</span>
                        </div>
                        {dest.managerAccountId && (
                          <div className="flex justify-between gap-2">
                            <span className="text-[#596780] shrink-0">MCC Manager ID</span>
                            <span className="font-mono text-[#1E2229] truncate">{dest.managerAccountId}</span>
                          </div>
                        )}
                        {dest.customFields &&
                          Object.entries(dest.customFields)
                            .filter(([k, v]) => v && !/secret|token|key/i.test(k))
                            .slice(0, 2)
                            .map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-2">
                                <span className="text-[#596780] capitalize shrink-0">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-mono text-[#1E2229] truncate max-w-[160px]">{v}</span>
                              </div>
                            ))}
                        {dest.configuredAudienceName && (
                          <div className="flex justify-between gap-2">
                            <span className="text-[#596780] shrink-0">Active Audience</span>
                            <span className="font-semibold text-[#0D66D0] truncate max-w-[160px]">{dest.configuredAudienceName}</span>
                          </div>
                        )}
                        <div className="flex justify-between gap-2">
                          <span className="text-[#596780] shrink-0">Authorized Operator</span>
                          <span className="text-[#1E2229] truncate max-w-[160px]">{dest.connectedUserEmail || 'admin@xlr8.cdp'}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#596780] shrink-0">Mapped Keys</span>
                          <span className="font-semibold text-[#1473E6]">
                            {dest.fieldMappings ? `${dest.fieldMappings.filter(m => m.enabled).length} XDM fields` : 'Default Identities'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F2F4F7] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenConfigure(findMatchingCatalogCard(dest), 1)}
                        className="px-3 py-1.5 rounded-lg border border-[#D0D7DE] hover:bg-[#F2F4F7] text-[#1E2229] text-[11px] font-semibold cursor-pointer"
                      >
                        Edit / Renew Auth
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenConfigure(findMatchingCatalogCard(dest), 2)}
                        className="px-3 py-1.5 rounded-lg bg-[#EBF3FC] hover:bg-[#D9EAFA] text-[#0D66D0] text-[11px] font-semibold cursor-pointer"
                      >
                        Activate Segment →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SYSTEM VIEW TAB ================= */}
        {activeTab === 'System View' && (
          <div className="p-8 space-y-6 overflow-y-auto h-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-5 py-3.5 shadow-2xs">
              <h2 className="text-base font-bold text-white">Audience Activation Topology</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                End-to-end activation flow illustrating audience qualification, DULE policy evaluation, hashing, and dispatch.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E1E5EA] p-6 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E1E5EA] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229] block mb-1">Audience Segment</span>
                  <span className="text-xs font-bold text-[#2C2C2C]">Real-Time Streaming Edge</span>
                </div>
                <div className="text-center font-bold text-[#1473E6]">
                  <span className="text-xs block text-[#262A33] font-normal mb-1">Qualification</span>
                  →
                </div>
                <div className="p-4 bg-[#E0F2FE] rounded-lg border border-[#BAE6FD] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0369A1] block mb-1">DULE Privacy Gate</span>
                  <span className="text-xs font-bold text-[#0369A1]">Filter Non-Consented Profiles</span>
                </div>
                <div className="p-4 bg-[#EBF3FC] rounded-lg border border-[#C5DCFA] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D66D0] block mb-1">Syndication</span>
                  <span className="text-xs font-bold text-[#0D66D0]">Google, Meta, Braze, S3</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= CONFIGURE ACTIVATION WIZARD (4-STEP ADOBE RT-CDP FLOW) ================= */}
      {configModalOpen && selectedCard && (
        <DestinationConfigWizard
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          card={selectedCard as CatalogDestinationMeta}
          existingDestination={findExistingDestForCard(selectedCard)}
          audiences={safeAudiences}
          profiles={profiles}
          initialStep={wizardInitialStep}
          onSaveAccountOnly={handleSaveAccountOnly}
          onSaveAndActivate={handleSaveAndActivateWizard}
          onNavigateToAudiences={() => setParentActiveTab('audiences')}
          onTestEgress={testOutboundWebhook}
        />
      )}

      {/* ================= INTRODUCTION TO DESTINATIONS MODAL ================= */}
      {introVideoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E1E5EA] max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">Introduction to Destinations</h3>
              </div>
              <button
                onClick={() => setIntroVideoModalOpen(false)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="w-full aspect-video bg-[#1B365D] rounded-xl flex flex-col items-center justify-center text-white p-6 text-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3 shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-base mb-1">Activating Audiences in XLR8 Platform</h4>
                <p className="text-xs text-blue-100 max-w-md">
                  Watch how real-time segmentation and privacy governance syndicates profiles across advertising and marketing channels in sub-second latency.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[#2C2C2C] block">Key Concepts:</span>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-[#1A1D23]">
                  <div className="p-2.5 bg-[#F9FAFB] rounded border border-[#E1E5EA]">
                    <span className="font-semibold text-[#2C2C2C] block mb-0.5">Extensions</span>
                    Client-side tags managed through XLR8 tag container.
                  </div>
                  <div className="p-2.5 bg-[#F9FAFB] rounded border border-[#E1E5EA]">
                    <span className="font-semibold text-[#2C2C2C] block mb-0.5">Connections</span>
                    Server-to-server APIs with SHA-256 PII hashing.
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-end">
              <button
                onClick={() => setIntroVideoModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= INTEGRATION SPECS MODAL ================= */}
      {specModalCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E1E5EA] max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center space-x-2.5">
                <BrandIcon name={specModalCard.brandKey} className="w-6 h-6" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">{specModalCard.name} Specifications</h3>
              </div>
              <button
                onClick={() => setSpecModalCard(null)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#596780] uppercase text-[10px] block">Target Platform</span>
                <p className="font-semibold text-[#1E2229] mt-0.5">{specModalCard.targetPlatform}</p>
              </div>
              <div>
                <span className="font-bold text-[#596780] uppercase text-[10px] block">Connector Category & Mode</span>
                <p className="text-[#1E2229] mt-0.5">{specModalCard.category} · {specModalCard.type}</p>
              </div>
              <div>
                <span className="font-bold text-[#596780] uppercase text-[10px] block">Supported Identity Keys</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {specModalCard.supportedIdentities.map(idKey => (
                    <span key={idKey} className="px-2 py-0.5 bg-[#EBF3FC] text-[#0D66D0] rounded font-mono text-[10px] font-semibold">
                      {idKey}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-[#596780] uppercase text-[10px] block">DULE Enforced Guardrails</span>
                <ul className="list-disc pl-4 mt-1 text-[#1E2229] space-y-0.5">
                  {specModalCard.enforcedPolicies.map(p => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-end space-x-2">
              <button
                onClick={() => setSpecModalCard(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#D5D5D5] bg-white text-xs font-medium text-[#1E2229]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const card = specModalCard;
                  setSpecModalCard(null);
                  handleOpenConfigure(card);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
