import { DestinationFieldMapping } from '../../types/cdp';

export interface CatalogDestinationMeta {
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

export interface DestinationExtraField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'url';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
  helperText?: string;
}

export type PayloadFormatType = 'google_ads' | 'meta_capi' | 's3_batch' | 'martech' | 'analytics' | 'standard';

export interface DestinationAdapterSpec {
  id: string;
  authType: 'OAuth 2.0' | 'API Key Token' | 'Service Account (GCP/AWS)' | 'OAuth2 Bearer';
  authButtonLabel: string;
  authTitle: string;
  authDescription: string;
  accountTypes: { value: string; label: string }[];
  accountIdLabel: string;
  accountIdPlaceholder: string;
  accountIdDefault: string;
  accountIdHelper?: string;
  showManagerAccountId?: boolean;
  extraFields: DestinationExtraField[];
  defaultMappings: DestinationFieldMapping[];
  defaultPayloadFormat: PayloadFormatType;
  prerequisiteTitle?: string;
  prerequisiteText?: string;
}

const DEFAULT_AD_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'personalEmail.address', targetField: 'hashed_email', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
  { sourceXdmField: 'mobilePhone.number', targetField: 'hashed_phone_number', transform: 'E.164 + SHA-256', isIdentity: true, enabled: true },
  { sourceXdmField: 'identityMap.deviceId', targetField: 'mobile_id', transform: 'Direct Value', isIdentity: true, enabled: false },
];

const GOOGLE_ADS_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'personalEmail.address', targetField: 'hashed_email', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
  { sourceXdmField: 'mobilePhone.number', targetField: 'hashed_phone_number', transform: 'E.164 + SHA-256', isIdentity: true, enabled: true },
  { sourceXdmField: 'identityMap.deviceId', targetField: 'mobile_id', transform: 'Direct Value', isIdentity: true, enabled: false },
  { sourceXdmField: 'person.name.firstName', targetField: 'address_info.hashed_first_name', transform: 'SHA-256 (Lowercase)', isIdentity: false, enabled: true },
  { sourceXdmField: 'person.name.lastName', targetField: 'address_info.hashed_last_name', transform: 'SHA-256 (Lowercase)', isIdentity: false, enabled: true },
  { sourceXdmField: 'homeAddress.countryCode', targetField: 'address_info.country_code', transform: 'Direct Value', isIdentity: false, enabled: true },
];

const META_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'personalEmail.address', targetField: 'user_data.em', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
  { sourceXdmField: 'mobilePhone.number', targetField: 'user_data.ph', transform: 'E.164 + SHA-256', isIdentity: true, enabled: true },
  { sourceXdmField: 'person.name.firstName', targetField: 'user_data.fn', transform: 'SHA-256 (Lowercase)', isIdentity: false, enabled: true },
  { sourceXdmField: 'person.name.lastName', targetField: 'user_data.ln', transform: 'SHA-256 (Lowercase)', isIdentity: false, enabled: true },
  { sourceXdmField: 'homeAddress.city', targetField: 'user_data.ct', transform: 'SHA-256 (Lowercase)', isIdentity: false, enabled: true },
];

const LINKEDIN_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'personalEmail.address', targetField: 'EMAIL_SHA256', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
  { sourceXdmField: 'person.name.firstName', targetField: 'FIRSTNAME', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'person.name.lastName', targetField: 'LASTNAME', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'attributes.jobTitle', targetField: 'TITLE', transform: 'Direct Value', isIdentity: false, enabled: true },
];

const MARTECH_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'identityMap.crmId', targetField: 'external_id', transform: 'Direct Value', isIdentity: true, enabled: true },
  { sourceXdmField: 'personalEmail.address', targetField: 'email', transform: 'Direct Value', isIdentity: true, enabled: true },
  { sourceXdmField: 'mobilePhone.number', targetField: 'phone', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'person.name.firstName', targetField: 'first_name', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'attributes.customerTier', targetField: 'loyalty_tier', transform: 'Direct Value', isIdentity: false, enabled: true },
];

const ANALYTICS_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'identityMap.crmId', targetField: 'user_id', transform: 'Direct Value', isIdentity: true, enabled: true },
  { sourceXdmField: 'identityMap.deviceId', targetField: 'client_id', transform: 'Direct Value', isIdentity: true, enabled: true },
  { sourceXdmField: 'attributes.customerTier', targetField: 'user_properties.customer_tier', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'attributes.totalSpend', targetField: 'user_properties.lifetime_spend', transform: 'Direct Value', isIdentity: false, enabled: true },
];

const STORAGE_MAPPINGS: DestinationFieldMapping[] = [
  { sourceXdmField: 'identityMap.crmId', targetField: 'profile_id', transform: 'Direct Value', isIdentity: true, enabled: true },
  { sourceXdmField: 'personalEmail.address', targetField: 'email_sha256', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
  { sourceXdmField: 'attributes.totalSpend', targetField: 'total_spend_usd', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'attributes.customerTier', targetField: 'customer_tier', transform: 'Direct Value', isIdentity: false, enabled: true },
  { sourceXdmField: 'homeAddress.countryCode', targetField: 'country_code', transform: 'Direct Value', isIdentity: false, enabled: true },
];

const ADAPTER_REGISTRY: Record<string, DestinationAdapterSpec> = {
  // ================= ADVERTISING =================
  advertising_cloud: {
    id: 'advertising_cloud',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect Advertising Cloud',
    authTitle: 'XLR8 Advertising Cloud DSP OAuth 2.0',
    authDescription: 'Authorizes programmatic audience syndication to your Advertising Cloud DSP seat.',
    accountTypes: [
      { value: 'Advertising Cloud DSP', label: 'Advertising Cloud DSP (Display & Video)' },
      { value: 'Search Management', label: 'Advertising Cloud Search' },
    ],
    accountIdLabel: 'DSP Advertiser ID *',
    accountIdPlaceholder: 'adv_4920184',
    accountIdDefault: 'adv_4920184',
    extraFields: [
      { key: 'imsOrgId', label: 'Organization / Tenant ID *', type: 'text', placeholder: 'org_acme_emea_01', required: true, defaultValue: 'org_acme_emea_01' },
      { key: 'dspSeatId', label: 'Trading Desk Seat ID *', type: 'text', placeholder: 'seat_us_8821', required: true, defaultValue: 'seat_us_8821' },
      { key: 'region', label: 'DSP Region Cluster', type: 'select', options: ['NA (Virginia)', 'EMEA (Frankfurt)', 'APAC (Tokyo)'], defaultValue: 'NA (Virginia)' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  awin_mastertag: {
    id: 'awin_mastertag',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Awin Merchant Tag',
    authTitle: 'Awin Publisher & Mastertag Authorization',
    authDescription: 'Validates your numeric Awin Merchant ID and affiliate journey attribution token.',
    accountTypes: [{ value: 'Awin Advertiser Mastertag', label: 'Awin Advertiser Mastertag (Client-Side)' }],
    accountIdLabel: 'Awin Advertiser / Merchant ID *',
    accountIdPlaceholder: 'e.g. 18492',
    accountIdDefault: '18492',
    accountIdHelper: 'Numeric Advertiser ID from your Awin UI (Account > Overview).',
    extraFields: [
      { key: 'trackingDomain', label: 'Custom Tracking Domain', type: 'text', placeholder: 'www.awin1.com', required: true, defaultValue: 'www.awin1.com' },
      { key: 'currency', label: 'Default Commission Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD'], defaultValue: 'USD' },
      { key: 'oauthToken', label: 'Awin API OAuth2 Token (Masked)', type: 'password', placeholder: 'awin_tok_...', defaultValue: '' },
    ],
    defaultMappings: [
      { sourceXdmField: 'identityMap.crmId', targetField: 'customer_id', transform: 'Direct Value', isIdentity: true, enabled: true },
      { sourceXdmField: 'personalEmail.address', targetField: 'email_hash', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
    ],
    defaultPayloadFormat: 'standard',
  },

  awin_conversion: {
    id: 'awin_conversion',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Awin S2S Token',
    authTitle: 'Awin Server-to-Server Conversion API',
    authDescription: 'Validates Merchant ID and S2S attribution parameters for order validation.',
    accountTypes: [{ value: 'Awin S2S Conversion API', label: 'Awin S2S Conversion API' }],
    accountIdLabel: 'Awin Merchant ID *',
    accountIdPlaceholder: 'e.g. 18492',
    accountIdDefault: '18492',
    extraFields: [
      { key: 'attributionWindow', label: 'Click Attribution Window', type: 'select', options: ['30 Days', '60 Days', '90 Days'], defaultValue: '30 Days' },
      { key: 'currency', label: 'Transaction Currency', type: 'select', options: ['USD', 'EUR', 'GBP'], defaultValue: 'USD' },
      { key: 's2sSecret', label: 'Awin S2S API Secret (Masked)', type: 'password', placeholder: 'Optional S2S signature secret', defaultValue: '' },
    ],
    defaultMappings: [
      { sourceXdmField: 'identityMap.crmId', targetField: 'order_customer_ref', transform: 'Direct Value', isIdentity: true, enabled: true },
      { sourceXdmField: 'attributes.totalSpend', targetField: 'order_amount', transform: 'Direct Value', isIdentity: false, enabled: true },
    ],
    defaultPayloadFormat: 'standard',
  },

  bing_ads_uet: {
    id: 'bing_ads_uet',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect Microsoft Advertising',
    authTitle: 'Microsoft Advertising (Bing) OAuth 2.0 & UET Tag',
    authDescription: 'Authorizes Microsoft Advertising remarketing lists & UET conversion tag firing.',
    accountTypes: [
      { value: 'Microsoft Advertising UET', label: 'Microsoft Advertising UET Tag' },
      { value: 'Customer Match List', label: 'Microsoft Advertising Customer Match' },
    ],
    accountIdLabel: 'UET Tag ID (Numeric) *',
    accountIdPlaceholder: 'e.g. 135001234',
    accountIdDefault: '135001234',
    accountIdHelper: '7 to 10 digit numeric UET Tag ID from Microsoft Advertising Tools > UET tags.',
    extraFields: [
      { key: 'msAdsAccountId', label: 'Microsoft Ads Account ID *', type: 'text', placeholder: 'F1049281', required: true, defaultValue: 'F1049281' },
      { key: 'enhancedConversions', label: 'Enhanced Conversions (SHA-256 Email)', type: 'select', options: ['Enabled (Recommended)', 'Disabled'], defaultValue: 'Enabled (Recommended)' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  branch_experiences: {
    id: 'branch_experiences',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Branch App Key',
    authTitle: 'Branch.io App Attribution & Deep Linking',
    authDescription: 'Validates your Branch Live Key and App ID for web-to-app segment journeys.',
    accountTypes: [{ value: 'Branch Universal Ads', label: 'Branch Universal Ads & Journeys' }],
    accountIdLabel: 'Branch App ID *',
    accountIdPlaceholder: '104928371029384',
    accountIdDefault: '104928371029384',
    extraFields: [
      { key: 'branchKey', label: 'Branch Live Key (key_live_...) *', type: 'password', placeholder: 'key_live_abCDef123456...', required: true, defaultValue: 'key_live_xlr8prod90210' },
      { key: 'linkDomain', label: 'Branch Link Subdomain *', type: 'text', placeholder: 'brand.app.link', required: true, defaultValue: 'xlr8.app.link' },
    ],
    defaultMappings: [
      { sourceXdmField: 'identityMap.deviceId', targetField: 'idfa_or_aaid', transform: 'Direct Value', isIdentity: true, enabled: true },
      { sourceXdmField: 'identityMap.crmId', targetField: 'developer_identity', transform: 'Direct Value', isIdentity: true, enabled: true },
    ],
    defaultPayloadFormat: 'standard',
  },

  doubleclick_floodlight: {
    id: 'doubleclick_floodlight',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect Campaign Manager 360',
    authTitle: 'Google Campaign Manager 360 (DoubleClick) OAuth 2.0',
    authDescription: 'Connects Floodlight Advertiser ID (src=), Group Tag (type=), and Activity Tag (cat=).',
    accountTypes: [
      { value: 'CM360 Floodlight Counter', label: 'CM360 Floodlight Counter Tag' },
      { value: 'CM360 Floodlight Sales', label: 'CM360 Floodlight Sales Tag' },
    ],
    accountIdLabel: 'CM360 Advertiser ID (src=) *',
    accountIdPlaceholder: 'e.g. 9482014',
    accountIdDefault: '9482014',
    extraFields: [
      { key: 'floodlightGroup', label: 'Floodlight Group Tag String (type=) *', type: 'text', placeholder: 'e.g. retarg01', required: true, defaultValue: 'retarg01' },
      { key: 'activityTag', label: 'Floodlight Activity Tag String (cat=) *', type: 'text', placeholder: 'e.g. vipchk0', required: true, defaultValue: 'vipchk0' },
      { key: 'countingMethod', label: 'Counting Method', type: 'select', options: ['Standard', 'Unique', 'Per Session'], defaultValue: 'Unique' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'google_ads',
  },

  facebook_pixel: {
    id: 'facebook_pixel',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Verify Meta Pixel ID',
    authTitle: 'Meta (Facebook) Pixel & Limited Data Use (LDU)',
    authDescription: 'Binds your 15-digit Meta Pixel ID with automatic Advanced Matching & CCPA LDU flags.',
    accountTypes: [{ value: 'Meta Pixel v19.0', label: 'Meta Pixel (Client-Side Tag + Advanced Matching)' }],
    accountIdLabel: 'Meta Pixel ID (15–16 Digits) *',
    accountIdPlaceholder: 'e.g. 492019384756102',
    accountIdDefault: '492019384756102',
    extraFields: [
      { key: 'lduMode', label: 'Meta Limited Data Use (LDU)', type: 'select', options: ['Enabled (California CCPA)', 'Disabled'], defaultValue: 'Enabled (California CCPA)' },
      { key: 'advancedMatching', label: 'Automatic Advanced Matching', type: 'select', options: ['Enabled (SHA-256 Email/Phone)', 'Disabled'], defaultValue: 'Enabled (SHA-256 Email/Phone)' },
    ],
    defaultMappings: META_MAPPINGS,
    defaultPayloadFormat: 'meta_capi',
  },

  flashtalking_onetag: {
    id: 'flashtalking_onetag',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Flashtalking Container',
    authTitle: 'Mediaocean Flashtalking OneTag Authorization',
    authDescription: 'Validates your Flashtalking Site ID and Spotlight Container for DCO audience delivery.',
    accountTypes: [{ value: 'Flashtalking OneTag', label: 'Flashtalking OneTag / Spotlight' }],
    accountIdLabel: 'Flashtalking Site ID *',
    accountIdPlaceholder: 'e.g. 29481',
    accountIdDefault: '29481',
    extraFields: [
      { key: 'spotlightContainerId', label: 'Spotlight Container ID *', type: 'text', placeholder: 'e.g. ft_spot_881', required: true, defaultValue: 'ft_spot_881' },
      { key: 'clientCode', label: 'Flashtalking Client Code *', type: 'text', placeholder: 'e.g. acme_retail', required: true, defaultValue: 'acme_retail' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  google_ads_ext: {
    id: 'google_ads_ext',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect & Verify Google Ads',
    authTitle: 'Google Ads Tag & Enhanced Conversions OAuth 2.0',
    authDescription: 'Grants scoped Google Ads permissions and binds your Conversion ID (AW-...) or Customer ID.',
    accountTypes: [
      { value: 'Google Ads Tag', label: 'Google Ads Conversion & Remarketing Tag' },
      { value: 'AdWords', label: 'AdWords (Google Ads Customer Match)' },
    ],
    accountIdLabel: 'Google Ads Conversion ID (AW-...) or Customer ID *',
    accountIdPlaceholder: 'AW-1092837465 or 123-456-7890',
    accountIdDefault: 'AW-1092837465',
    accountIdHelper: 'Enter AW-XXXXXXXXXX tag ID or 10-digit Customer ID (XXX-XXX-XXXX).',
    showManagerAccountId: true,
    extraFields: [
      { key: 'conversionLabel', label: 'Conversion Label (Optional)', type: 'text', placeholder: 'e.g. AbCdEf123456', defaultValue: 'AbCdEf_XLR8Conv' },
      { key: 'enhancedConversions', label: 'Enhanced Conversions (SHA-256 PII)', type: 'select', options: ['Enabled', 'Disabled'], defaultValue: 'Enabled' },
    ],
    defaultMappings: GOOGLE_ADS_MAPPINGS,
    defaultPayloadFormat: 'google_ads',
    prerequisiteTitle: 'Google Ads Customer Match & Tag Prerequisites (Adobe RT-CDP Standard)',
    prerequisiteText: '1. Account must meet Google Ads Customer Match & EU User Consent policies. 2. Email & phone fields are normalized and SHA-256 hashed inside XLR8 prior to egress.',
  },

  google_customer_match: {
    id: 'google_customer_match',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect & Verify Google Ads',
    authTitle: 'Google Ads OAuth 2.0 Account Grant',
    authDescription: 'Grants scoped AdWords Customer Match permissions (https://www.googleapis.com/auth/adwords).',
    accountTypes: [
      { value: 'AdWords', label: 'AdWords (Google Ads Customer Match)' },
      { value: 'Google Ads Tag', label: 'Google Ads Conversion & Remarketing Tag' },
    ],
    accountIdLabel: 'Google Ads Customer ID (XXX-XXX-XXXX) *',
    accountIdPlaceholder: '123-456-7890',
    accountIdDefault: '123-456-7890',
    accountIdHelper: 'Enter your child advertiser Customer ID (123-456-7890), not your Manager (MCC) ID.',
    showManagerAccountId: true,
    extraFields: [
      { key: 'adUserDataConsent', label: 'DMA Ad User Data Signal', type: 'select', options: ['GRANTED (Consent Verified)', 'CONDITIONAL (Per-Profile DULE)'], defaultValue: 'GRANTED (Consent Verified)' },
    ],
    defaultMappings: GOOGLE_ADS_MAPPINGS,
    defaultPayloadFormat: 'google_ads',
    prerequisiteTitle: 'Google Ads Customer Match Prerequisites (Adobe RT-CDP Standard)',
    prerequisiteText: '1. Your Google Ads account must meet Google Customer Match eligibility policies. 2. Email & phone identifiers are normalized and SHA-256 hashed inside XLR8 before leaving the CDP. 3. Minimum 100–1,000 matched users are required to serve lists on Google Search & YouTube.',
  },

  meta_capi: {
    id: 'meta_capi',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect & Verify Meta Business',
    authTitle: 'Meta Business Manager & Conversions API Grant',
    authDescription: 'Validates your act_ Ad Account ID, Pixel Dataset ID, and System User Access Token.',
    accountTypes: [
      { value: 'Meta Business Manager', label: 'Meta Business Manager (Custom Audiences + CAPI)' },
      { value: 'Meta Pixel Dataset', label: 'Meta Conversions API Dataset Only' },
    ],
    accountIdLabel: 'Meta Ad Account ID (act_...) *',
    accountIdPlaceholder: 'act_8841209341',
    accountIdDefault: 'act_8841209341',
    accountIdHelper: 'Include the act_ prefix (e.g. act_8841209341) from Meta Business Settings.',
    extraFields: [
      { key: 'pixelDatasetId', label: 'Meta Pixel / Dataset ID *', type: 'text', placeholder: 'e.g. 492019384756102', required: true, defaultValue: '492019384756102' },
      { key: 'systemUserToken', label: 'System User Access Token (Masked)', type: 'password', placeholder: 'EAABsbCS1iHg...', defaultValue: '' },
      { key: 'graphApiVersion', label: 'Graph API Version', type: 'select', options: ['v20.0 (Latest)', 'v19.0'], defaultValue: 'v20.0 (Latest)' },
    ],
    defaultMappings: META_MAPPINGS,
    defaultPayloadFormat: 'meta_capi',
  },

  linkedin_matched: {
    id: 'linkedin_matched',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect LinkedIn Marketing',
    authTitle: 'LinkedIn Marketing Solutions OAuth 2.0',
    authDescription: 'Authorizes DMP Segment & Matched Audience sync via r_ads and rw_dmp_segments scopes.',
    accountTypes: [{ value: 'LinkedIn Campaign Manager', label: 'LinkedIn Campaign Manager (DMP Segments)' }],
    accountIdLabel: 'LinkedIn Sponsored Account URN / ID *',
    accountIdPlaceholder: 'urn:li:sponsoredAccount:509421882',
    accountIdDefault: 'urn:li:sponsoredAccount:509421882',
    extraFields: [
      { key: 'organizationId', label: 'LinkedIn Organization ID *', type: 'text', placeholder: 'e.g. 1441298', required: true, defaultValue: '1441298' },
      { key: 'matchType', label: 'Audience Match Mode', type: 'select', options: ['Contact Email + Job Title', 'Company Account List (ABM)'], defaultValue: 'Contact Email + Job Title' },
    ],
    defaultMappings: LINKEDIN_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  // ================= SOCIAL =================
  pinterest_tag: {
    id: 'pinterest_tag',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect Pinterest Ads',
    authTitle: 'Pinterest Business OAuth 2.0 & Conversions',
    authDescription: 'Validates your Pinterest Ad Account ID and Tag ID for Customer List & Event sync.',
    accountTypes: [{ value: 'Pinterest Ads API v5', label: 'Pinterest Ads API v5 (Customer Lists + Tag)' }],
    accountIdLabel: 'Pinterest Ad Account ID *',
    accountIdPlaceholder: '549755885123',
    accountIdDefault: '549755885123',
    extraFields: [
      { key: 'pinterestTagId', label: 'Pinterest Tag ID *', type: 'text', placeholder: '2613948102938', required: true, defaultValue: '2613948102938' },
      { key: 'conversionToken', label: 'Conversions API Access Token (Masked)', type: 'password', placeholder: 'pina_...', defaultValue: '' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  tiktok_events: {
    id: 'tiktok_events',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect TikTok Business',
    authTitle: 'TikTok for Business Marketing API',
    authDescription: 'Authorizes Custom Audience upload & Events API streaming to TikTok Ads Manager.',
    accountTypes: [
      { value: 'TikTok Business API', label: 'TikTok Custom Audience + Events API' },
      { value: 'TikTok Pixel S2S', label: 'TikTok Events API Only' },
    ],
    accountIdLabel: 'TikTok Advertiser ID *',
    accountIdPlaceholder: '7192837465019283',
    accountIdDefault: '7192837465019283',
    extraFields: [
      { key: 'tiktokPixelCode', label: 'TikTok Pixel / Event Source Code *', type: 'text', placeholder: 'C9XLR8PIXEL0192', required: true, defaultValue: 'C9XLR8PIXEL0192' },
      { key: 'accessToken', label: 'TikTok Long-Lived Access Token (Masked)', type: 'password', placeholder: 'Enter TikTok API Token', defaultValue: '' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  // ================= DMP =================
  xlr8_audience_mgr_dmp: {
    id: 'xlr8_audience_mgr_dmp',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Verify Audience Manager Trait Link',
    authTitle: 'XLR8 Audience Manager DMP Integration',
    authDescription: 'Binds your Trait Data Source ID and Organization ID for cross-publisher DMP syndication.',
    accountTypes: [{ value: 'Audience Manager DMP', label: 'Audience Manager S2S Trait Sync' }],
    accountIdLabel: 'Data Source / Trait Namespace ID *',
    accountIdPlaceholder: 'ds_dmp_109283',
    accountIdDefault: 'ds_dmp_109283',
    extraFields: [
      { key: 'imsOrgId', label: 'Organization IMS ID *', type: 'text', placeholder: 'ORG_99210@AdobeOrg', required: true, defaultValue: 'ORG_99210@XLR8Org' },
      { key: 'integrationCode', label: 'Segment Integration Code', type: 'text', placeholder: 'xlr8_vip_dmp', defaultValue: 'xlr8_vip_dmp' },
    ],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  liveramp_dmp: {
    id: 'liveramp_dmp',
    authType: 'API Key Token',
    authButtonLabel: 'Verify LiveRamp Distribution',
    authTitle: 'LiveRamp RampID & SFTP Distribution Hub',
    authDescription: 'Validates your LiveRamp Customer Config ID and Distribution Pool for privacy-safe matching.',
    accountTypes: [{ value: 'LiveRamp RampID Hub', label: 'LiveRamp RampID Syndication' }],
    accountIdLabel: 'LiveRamp Customer Config ID *',
    accountIdPlaceholder: 'lr_cfg_88412',
    accountIdDefault: 'lr_cfg_88412',
    extraFields: [
      { key: 'distributionPoolId', label: 'Destination Pool / SFTP Drop ID *', type: 'text', placeholder: 'pool_prog_dsp_04', required: true, defaultValue: 'pool_prog_dsp_04' },
      { key: 'identifierFormat', label: 'Output Identifier Format', type: 'select', options: ['RampID (Abilitec)', 'SHA-256 Email + Phone'], defaultValue: 'RampID (Abilitec)' },
    ],
    defaultMappings: [
      { sourceXdmField: 'personalEmail.address', targetField: 'email_sha256', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
      { sourceXdmField: 'mobilePhone.number', targetField: 'phone_sha256', transform: 'E.164 + SHA-256', isIdentity: true, enabled: true },
    ],
    defaultPayloadFormat: 's3_batch',
  },

  // ================= EMAIL & MARTECH =================
  braze_cdi: {
    id: 'braze_cdi',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Braze REST API Key',
    authTitle: 'Braze Cloud Data Ingestion & Users/Track API',
    authDescription: 'Connects to your regional Braze REST cluster using a scoped App Group REST API Key.',
    accountTypes: [
      { value: 'Braze REST API (/users/track)', label: 'Braze REST API (/users/track)' },
      { value: 'Braze Cloud Data Ingestion', label: 'Braze Cloud Data Ingestion (CDI)' },
    ],
    accountIdLabel: 'Braze App Group Identifier *',
    accountIdPlaceholder: 'app_grp_xlr8_prod',
    accountIdDefault: 'app_grp_xlr8_prod',
    extraFields: [
      { key: 'brazeClusterUrl', label: 'Braze REST Endpoint Cluster *', type: 'select', options: ['https://rest.iad-01.braze.com', 'https://rest.iad-03.braze.com', 'https://rest.eu-01.braze.eu', 'https://rest.au-01.braze.com'], required: true, defaultValue: 'https://rest.iad-01.braze.com' },
      { key: 'brazeApiKey', label: 'Braze REST API Key (Masked) *', type: 'password', placeholder: 'Enter Braze users.track API key', required: true, defaultValue: 'brz_live_key_demo_validated' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'martech',
  },

  klaviyo_sync: {
    id: 'klaviyo_sync',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Klaviyo Private Key',
    authTitle: 'Klaviyo Profiles & Lists API (v2024-10)',
    authDescription: 'Authorizes Klaviyo profile & list membership sync using a pk_ Private API Key.',
    accountTypes: [{ value: 'Klaviyo Profiles & Lists API', label: 'Klaviyo Lists & Flows API' }],
    accountIdLabel: 'Target Klaviyo List / Segment ID *',
    accountIdPlaceholder: 'e.g. X9kLm2',
    accountIdDefault: 'X9kLm2',
    extraFields: [
      { key: 'klaviyoPrivateKey', label: 'Klaviyo Private API Key (pk_...) *', type: 'password', placeholder: 'pk_live_...', required: true, defaultValue: 'pk_live_xlr8_demo_9912' },
      { key: 'smsOptInRegion', label: 'TCPA / SMS Consent Enforcement', type: 'select', options: ['US & Canada (TCPA Strict)', 'UK & EU (GDPR Opt-In)', 'Email Only (No SMS Sync)'], defaultValue: 'US & Canada (TCPA Strict)' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'martech',
  },

  marketo_dest: {
    id: 'marketo_dest',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Verify Marketo M2M Credentials',
    authTitle: 'Adobe Marketo Engage REST API',
    authDescription: 'Validates your Munchkin Account ID (XXX-XXX-XXX) and LaunchPoint OAuth Client credentials.',
    accountTypes: [{ value: 'Marketo Engage REST API', label: 'Marketo Engage Lead & Static List Sync' }],
    accountIdLabel: 'Marketo Munchkin Account ID (XXX-XXX-XXX) *',
    accountIdPlaceholder: 'e.g. 492-XLR-801',
    accountIdDefault: '492-XLR-801',
    extraFields: [
      { key: 'marketoRestUrl', label: 'Marketo REST Base Endpoint *', type: 'url', placeholder: 'https://492-XLR-801.mktorest.com', required: true, defaultValue: 'https://492-XLR-801.mktorest.com' },
      { key: 'marketoClientId', label: 'LaunchPoint Client ID *', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true, defaultValue: 'lp-client-xlr8-9941' },
      { key: 'marketoClientSecret', label: 'LaunchPoint Client Secret (Masked) *', type: 'password', placeholder: 'Enter Client Secret', required: true, defaultValue: 'lp_secret_validated' },
    ],
    defaultMappings: [
      { sourceXdmField: 'personalEmail.address', targetField: 'email', transform: 'Direct Value', isIdentity: true, enabled: true },
      { sourceXdmField: 'person.name.firstName', targetField: 'firstName', transform: 'Direct Value', isIdentity: false, enabled: true },
      { sourceXdmField: 'person.name.lastName', targetField: 'lastName', transform: 'Direct Value', isIdentity: false, enabled: true },
      { sourceXdmField: 'attributes.jobTitle', targetField: 'title', transform: 'Direct Value', isIdentity: false, enabled: true },
    ],
    defaultPayloadFormat: 'martech',
  },

  // ================= PERSONALIZATION =================
  xlr8_target_edge: {
    id: 'xlr8_target_edge',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Verify Target Edge Datastream',
    authTitle: 'XLR8 Target Edge Decisioning Connection',
    authDescription: 'Binds your Target Client Code and Edge Network Datastream ID for <50ms personalization.',
    accountTypes: [{ value: 'Edge Network Datastream', label: 'XLR8 Edge Network Decisioning' }],
    accountIdLabel: 'Target Client Code / Property Token *',
    accountIdPlaceholder: 'acme_retail_target',
    accountIdDefault: 'acme_retail_target',
    extraFields: [
      { key: 'datastreamId', label: 'Edge Datastream ID *', type: 'text', placeholder: 'ds_edge_prod_01', required: true, defaultValue: 'ds_edge_prod_01' },
      { key: 'environment', label: 'Target Environment', type: 'select', options: ['production', 'staging'], defaultValue: 'production' },
    ],
    defaultMappings: [
      { sourceXdmField: 'identityMap.crmId', targetField: 'thirdPartyId', transform: 'Direct Value', isIdentity: true, enabled: true },
      { sourceXdmField: 'attributes.customerTier', targetField: 'profile.customerTier', transform: 'Direct Value', isIdentity: false, enabled: true },
    ],
    defaultPayloadFormat: 'standard',
  },

  optimizely_full_stack: {
    id: 'optimizely_full_stack',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Optimizely ODP Key',
    authTitle: 'Optimizely Data Platform (ODP) & Experimentation',
    authDescription: 'Validates your Optimizely Project ID and ODP Private API Key for real-time feature flags.',
    accountTypes: [{ value: 'Optimizely ODP + Web', label: 'Optimizely Data Platform & Feature Flags' }],
    accountIdLabel: 'Optimizely Project ID *',
    accountIdPlaceholder: '24910293841',
    accountIdDefault: '24910293841',
    extraFields: [
      { key: 'odpApiKey', label: 'ODP Private API Key (Masked) *', type: 'password', placeholder: 'odp_priv_...', required: true, defaultValue: 'odp_priv_xlr8_demo' },
      { key: 'environmentKey', label: 'Experimentation Environment', type: 'select', options: ['production', 'staging', 'development'], defaultValue: 'production' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  dynamic_yield_sync: {
    id: 'dynamic_yield_sync',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Dynamic Yield Section',
    authTitle: 'Dynamic Yield Audience & Affinity Sync',
    authDescription: 'Connects your Dynamic Yield Section ID and regional API Access Key.',
    accountTypes: [{ value: 'Dynamic Yield API', label: 'Dynamic Yield Server-Side Audiences' }],
    accountIdLabel: 'Dynamic Yield Section ID *',
    accountIdPlaceholder: '8771029',
    accountIdDefault: '8771029',
    extraFields: [
      { key: 'dyAccessKey', label: 'Dynamic Yield API Key (Masked) *', type: 'password', placeholder: 'Enter DY API Key', required: true, defaultValue: 'dy_api_validated_key' },
      { key: 'dataCenter', label: 'Dynamic Yield Data Center', type: 'select', options: ['US (dy-api.com)', 'EU (dy-api.eu)'], defaultValue: 'US (dy-api.com)' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'standard',
  },

  // ================= ANALYTICS =================
  google_analytics_4: {
    id: 'google_analytics_4',
    authType: 'API Key Token',
    authButtonLabel: 'Verify GA4 Measurement Protocol',
    authTitle: 'Google Analytics 4 Measurement Protocol',
    authDescription: 'Validates your GA4 Measurement ID (G-XXXXXXXXXX) and Measurement Protocol API Secret.',
    accountTypes: [{ value: 'GA4 Measurement Protocol', label: 'GA4 Measurement Protocol (Server-to-Server)' }],
    accountIdLabel: 'GA4 Measurement ID (G-XXXXXXXXXX) *',
    accountIdPlaceholder: 'G-XLR89201AB',
    accountIdDefault: 'G-XLR89201AB',
    accountIdHelper: 'Found in Google Analytics Admin > Data Streams > Web Stream Details.',
    extraFields: [
      { key: 'ga4ApiSecret', label: 'Measurement Protocol API Secret (Masked) *', type: 'password', placeholder: 'Enter GA4 API Secret', required: true, defaultValue: 'ga4_secret_demo_token' },
      { key: 'streamId', label: 'GA4 Data Stream ID *', type: 'text', placeholder: '4920193847', required: true, defaultValue: '4920193847' },
    ],
    defaultMappings: ANALYTICS_MAPPINGS,
    defaultPayloadFormat: 'analytics',
    prerequisiteTitle: 'GA4 PII Governance Rule',
    prerequisiteText: 'Google Analytics 4 terms strictly prohibit sending raw email addresses or phone numbers. Use pseudonymous user_id / client_id and hashed non-PII attributes.',
  },

  mixpanel_cohort_sync: {
    id: 'mixpanel_cohort_sync',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Mixpanel Service Account',
    authTitle: 'Mixpanel Engage & Cohort Integration API',
    authDescription: 'Connects your Mixpanel Project ID, Project Token, and Service Account secret.',
    accountTypes: [{ value: 'Mixpanel Cohort Sync', label: 'Mixpanel Engage Cohort Sync' }],
    accountIdLabel: 'Mixpanel Project ID *',
    accountIdPlaceholder: '2948102',
    accountIdDefault: '2948102',
    extraFields: [
      { key: 'projectToken', label: 'Mixpanel Project Token *', type: 'text', placeholder: 'a91f8c2d3e4b5a6c7d8e9f0a1b2c3d4e', required: true, defaultValue: 'a91f8c2d3e4b5a6c7d8e9f0a' },
      { key: 'serviceSecret', label: 'Service Account Secret (Masked) *', type: 'password', placeholder: 'Enter Mixpanel Service Secret', required: true, defaultValue: 'mp_sa_secret_demo' },
      { key: 'residency', label: 'Data Residency', type: 'select', options: ['US Standard (mixpanel.com)', 'EU Residency (eu.mixpanel.com)'], defaultValue: 'US Standard (mixpanel.com)' },
    ],
    defaultMappings: ANALYTICS_MAPPINGS,
    defaultPayloadFormat: 'analytics',
  },

  // ================= SURVEYS =================
  qualtrics_xm: {
    id: 'qualtrics_xm',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Qualtrics XM Token',
    authTitle: 'Qualtrics XM Directory & Website Feedback',
    authDescription: 'Validates your Qualtrics Datacenter ID, XM Directory ID, and X-API-TOKEN.',
    accountTypes: [{ value: 'Qualtrics XM Directory', label: 'Qualtrics XM Directory Contacts' }],
    accountIdLabel: 'Qualtrics XM Directory ID *',
    accountIdPlaceholder: 'POOL_4xLR8912AbCd',
    accountIdDefault: 'POOL_4xLR8912AbCd',
    extraFields: [
      { key: 'datacenterId', label: 'Qualtrics Datacenter / Brand ID *', type: 'text', placeholder: 'iad1 / brand.qualtrics.com', required: true, defaultValue: 'iad1' },
      { key: 'qualtricsToken', label: 'Qualtrics X-API-TOKEN (Masked) *', type: 'password', placeholder: 'Enter Qualtrics API Token', required: true, defaultValue: 'qtx_api_token_demo' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'martech',
  },

  surveymonkey_ent: {
    id: 'surveymonkey_ent',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect SurveyMonkey Enterprise',
    authTitle: 'SurveyMonkey Enterprise OAuth 2.0',
    authDescription: 'Authorizes contact panel sync to a SurveyMonkey Collector and Contact List.',
    accountTypes: [{ value: 'SurveyMonkey Enterprise REST', label: 'SurveyMonkey Contact List & Collector' }],
    accountIdLabel: 'SurveyMonkey Collector ID *',
    accountIdPlaceholder: '409281736',
    accountIdDefault: '409281736',
    extraFields: [
      { key: 'contactListId', label: 'Target Contact List ID *', type: 'text', placeholder: 'list_8829103', required: true, defaultValue: 'list_8829103' },
      { key: 'smAccessToken', label: 'OAuth Access Token (Masked)', type: 'password', placeholder: 'Optional OAuth Bearer override', defaultValue: '' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'martech',
  },

  // ================= VOICE OF THE CUSTOMER =================
  medallia_voc: {
    id: 'medallia_voc',
    authType: 'OAuth 2.0',
    authButtonLabel: 'Connect Medallia Experience Cloud',
    authTitle: 'Medallia Streaming & Closed-Loop VoC API',
    authDescription: 'Validates your Medallia Instance URL and Program ID for VIP & churn-risk enrichment.',
    accountTypes: [{ value: 'Medallia Streaming API', label: 'Medallia Experience Cloud API' }],
    accountIdLabel: 'Medallia Program / Tenant ID *',
    accountIdPlaceholder: 'medallia_acme_cx',
    accountIdDefault: 'medallia_acme_cx',
    extraFields: [
      { key: 'medalliaInstanceUrl', label: 'Medallia Instance URL *', type: 'url', placeholder: 'https://acme.medallia.com', required: true, defaultValue: 'https://acme.medallia.com' },
      { key: 'medalliaClientToken', label: 'OAuth Client Secret / Token (Masked)', type: 'password', placeholder: 'Enter Medallia OAuth Token', defaultValue: 'med_token_demo' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'martech',
  },

  chattermill_voc: {
    id: 'chattermill_voc',
    authType: 'API Key Token',
    authButtonLabel: 'Verify Chattermill API Key',
    authTitle: 'Chattermill Insights & Sentiment Sync',
    authDescription: 'Validates your Chattermill Organization Slug and Feedback Dataset ID.',
    accountTypes: [{ value: 'Chattermill API v2', label: 'Chattermill Customer Cohorts API' }],
    accountIdLabel: 'Chattermill Organization Slug *',
    accountIdPlaceholder: 'acme-global-cx',
    accountIdDefault: 'acme-global-cx',
    extraFields: [
      { key: 'datasetStreamId', label: 'Chattermill Dataset / Stream ID *', type: 'text', placeholder: 'ds_voc_prod_01', required: true, defaultValue: 'ds_voc_prod_01' },
      { key: 'chattermillApiKey', label: 'Chattermill Bearer Key (Masked) *', type: 'password', placeholder: 'Enter Chattermill API Key', required: true, defaultValue: 'cm_live_demo_key' },
    ],
    defaultMappings: MARTECH_MAPPINGS,
    defaultPayloadFormat: 'martech',
  },

  // ================= CLOUD STORAGE & WEBHOOKS =================
  aws_s3_dest: {
    id: 'aws_s3_dest',
    authType: 'Service Account (GCP/AWS)',
    authButtonLabel: 'Verify S3 Bucket & IAM Role',
    authTitle: 'Amazon S3 Cross-Account IAM Role & KMS Encryption',
    authDescription: 'Validates your target S3 URI (s3://...), AWS Region, and cross-account IAM Role ARN.',
    accountTypes: [
      { value: 'AWS S3 / IAM Role', label: 'AWS S3 Bucket (Cross-Account IAM Role)' },
      { value: 'AWS S3 SSE-KMS', label: 'AWS S3 + Customer-Managed KMS Key' },
    ],
    accountIdLabel: 'Target S3 Bucket URI (s3://...) *',
    accountIdPlaceholder: 's3://xlr8-cdp-exports-prod/audiences/',
    accountIdDefault: 's3://xlr8-cdp-exports-prod/audiences/',
    accountIdHelper: 'Must start with s3:// followed by bucket name and optional prefix.',
    extraFields: [
      { key: 'awsRegion', label: 'AWS Region *', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1'], required: true, defaultValue: 'us-east-1' },
      { key: 'iamRoleArn', label: 'IAM Role ARN *', type: 'text', placeholder: 'arn:aws:iam::123456789012:role/XLR8ExportRole', required: true, defaultValue: 'arn:aws:iam::123456789012:role/XLR8ExportRole' },
      { key: 'fileFormat', label: 'Export File Format', type: 'select', options: ['Parquet (Snappy)', 'CSV (UTF-8)', 'JSON Lines (.jsonl)'], defaultValue: 'Parquet (Snappy)' },
    ],
    defaultMappings: STORAGE_MAPPINGS,
    defaultPayloadFormat: 's3_batch',
  },

  snowflake_cleanroom: {
    id: 'snowflake_cleanroom',
    authType: 'Service Account (GCP/AWS)',
    authButtonLabel: 'Verify Snowflake Share',
    authTitle: 'Snowflake Data Clean Room & Zero-Copy Share',
    authDescription: 'Validates your Snowflake Account Locator, Database.Schema, and Clean Room Provider Share.',
    accountTypes: [{ value: 'Snowflake Secure Share', label: 'Snowflake Data Clean Room Share' }],
    accountIdLabel: 'Snowflake Account Locator *',
    accountIdPlaceholder: 'acme_org-us_east_prod',
    accountIdDefault: 'acme_org-us_east_prod',
    extraFields: [
      { key: 'databaseSchema', label: 'Target Database.Schema *', type: 'text', placeholder: 'XLR8_PROD.CLEANROOM_EGRESS', required: true, defaultValue: 'XLR8_PROD.CLEANROOM_EGRESS' },
      { key: 'warehouseName', label: 'Compute Warehouse *', type: 'text', placeholder: 'COMPUTE_WH_CDP', required: true, defaultValue: 'COMPUTE_WH_CDP' },
      { key: 'shareName', label: 'Clean Room Share / Role', type: 'text', placeholder: 'XLR8_PRIVACY_SHARE', defaultValue: 'XLR8_PRIVACY_SHARE' },
    ],
    defaultMappings: STORAGE_MAPPINGS,
    defaultPayloadFormat: 's3_batch',
  },

  custom_http_webhook_dest: {
    id: 'custom_http_webhook_dest',
    authType: 'OAuth2 Bearer',
    authButtonLabel: 'Verify Webhook Endpoint',
    authTitle: 'Custom HTTP JSON Webhook & HMAC Signing',
    authDescription: 'Verifies target HTTPS webhook reachability and configures HMAC-SHA256 / Bearer signing.',
    accountTypes: [
      { value: 'Webhook Egress (HMAC-SHA256)', label: 'HTTPS Webhook (HMAC-SHA256 Signed)' },
      { value: 'Webhook Egress (Bearer)', label: 'HTTPS Webhook (Bearer Token)' },
    ],
    accountIdLabel: 'Webhook Integration Identifier *',
    accountIdPlaceholder: 'wh_prod_downstream_crm',
    accountIdDefault: 'wh_prod_downstream_crm',
    extraFields: [
      { key: 'authScheme', label: 'Outbound Auth Header Scheme', type: 'select', options: ['HMAC-SHA256 (X-XLR8-Signature-256)', 'Authorization: Bearer <token>', 'X-API-Key Header'], defaultValue: 'HMAC-SHA256 (X-XLR8-Signature-256)' },
      { key: 'batchSize', label: 'Max Events Per HTTP Batch', type: 'select', options: ['1 (Real-time Single)', '50 records', '250 records'], defaultValue: '50 records' },
    ],
    defaultMappings: [
      { sourceXdmField: 'identityMap.crmId', targetField: 'profile_id', transform: 'Direct Value', isIdentity: true, enabled: true },
      { sourceXdmField: 'personalEmail.address', targetField: 'email_sha256', transform: 'SHA-256 (Lowercase)', isIdentity: true, enabled: true },
      { sourceXdmField: 'attributes.customerTier', targetField: 'customer_tier', transform: 'Direct Value', isIdentity: false, enabled: true },
    ],
    defaultPayloadFormat: 'standard',
  },
};

export function getDestinationAdapter(card: CatalogDestinationMeta): DestinationAdapterSpec {
  if (ADAPTER_REGISTRY[card.id]) {
    return ADAPTER_REGISTRY[card.id];
  }

  // Fallback for any custom or dynamically added destination
  return {
    id: card.id,
    authType: 'OAuth 2.0',
    authButtonLabel: `Connect & Verify ${card.name}`,
    authTitle: `${card.name} API Authorization`,
    authDescription: 'Validates account credentials and issues a scoped destination egress token.',
    accountTypes: [
      { value: 'Partner REST API', label: 'Partner OAuth 2.0 / REST API' },
      { value: 'Webhook Egress', label: 'Custom Webhook Egress' },
    ],
    accountIdLabel: 'Workspace / Account Identifier *',
    accountIdPlaceholder: 'ws_prod_0192',
    accountIdDefault: 'ws_prod_0192',
    extraFields: [],
    defaultMappings: DEFAULT_AD_MAPPINGS,
    defaultPayloadFormat: 'standard',
  };
}
