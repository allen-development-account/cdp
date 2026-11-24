import {
  SchemaDefinition,
  Dataset,
  CustomerProfile,
  AudienceSegment,
  JourneyDefinition,
  DestinationConnector,
  IngestionSource,
  DestinationSyncLog,
  LiveTerminalLog,
  B2BAccountProfile,
  QueryTemplate,
  DataDistillerQuery,
  CalculatedAttributeDefinition,
  PrivacyDsarRequest,
  DynamicOffer,
  LookalikeModelConfig,
  CleanRoomQuery,
  SandboxDefinition,
  MergePolicy,
  WarehouseConnection,
  FederatedComposition,
  AgentPromptSession,
  AnomalyAlert,
  CampaignVariant,
  AuditLogEntry
} from '../types/cdp';

// Initial state starts with no schemas as requested ("Remove all the exisiting dummy demo schemas")
export const INITIAL_SCHEMAS: SchemaDefinition[] = [];

// Realistic Industry Standard XDM & Cloud Blueprint Schemas
export const STANDARD_SCHEMA_BLUEPRINTS: SchemaDefinition[] = [
  {
    id: 'xdm_individual_profile',
    name: 'XDM Individual Profile (Customer 360)',
    version: '1.4.0',
    category: 'Profile',
    description: 'Canonical individual person profile schema adhering to XDM Profile Class with deterministic identity resolution keys and DULE privacy labels.',
    baseClass: 'https://ns.xprplatform.com/xdm/context/profile',
    fieldGroups: [
      'xdm:mixins/profile-personal-details',
      'xdm:mixins/profile-contact-details',
      'xdm:mixins/identity-descriptors',
      'xdm:mixins/dule-governance-labels'
    ],
    tenantNamespace: '_enterpriseTenant',
    status: 'Enabled for Profile',
    createdDate: '2026-08-01T08:00:00Z',
    lastUpdated: '2026-08-19T14:30:00Z',
    fields: [
      {
        id: 'f_profile_guid',
        name: 'profileId',
        dataType: 'string',
        description: 'Global deterministic unified profile GUID (Primary CRM Key)',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'f_email_primary',
        name: 'email',
        dataType: 'string',
        description: 'Primary customer email address for deterministic resolution (RFC 5322)',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'email',
        isRequired: false,
        isSensitive: false,
        blockInAdNetworks: false,
      },
      {
        id: 'f_phone_e164',
        name: 'phone',
        dataType: 'string',
        description: 'E.164 formatted international telephone number',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'phone',
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'f_first_name',
        name: 'firstName',
        dataType: 'string',
        description: 'Individual given name',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'f_last_name',
        name: 'lastName',
        dataType: 'string',
        description: 'Individual family/surname',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'f_customer_tier',
        name: 'customerTier',
        dataType: 'string',
        description: 'Loyalty status tier: Bronze, Silver, Gold, Platinum, VIP',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'f_lifetime_spend',
        name: 'totalSpend',
        dataType: 'number',
        description: 'Lifetime aggregate net spend in USD currency',
        classification: 'Financial',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'f_loyalty_points',
        name: 'loyaltyPoints',
        dataType: 'number',
        description: 'Active reward points balance available for redemption',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'f_ssn_masked',
        name: 'ssnLast4',
        dataType: 'string',
        description: 'Last 4 digits of tax / national ID number (Regulated Sensitive PII)',
        classification: 'Sensitive',
        isIdentifier: false,
        isRequired: false,
        isSensitive: true,
        maskInExports: true,
        blockInAdNetworks: true,
      },
      {
        id: 'f_health_category',
        name: 'healthCategory',
        dataType: 'string',
        description: 'Special Category Health/Wellness classification (HIPAA / GDPR Art. 9)',
        classification: 'Health',
        isIdentifier: false,
        isRequired: false,
        isSensitive: true,
        maskInExports: true,
        blockInAdNetworks: true,
      }
    ]
  },
  {
    id: 'xdm_experience_event',
    name: 'XDM ExperienceEvent (Web & Mobile Behavioral)',
    version: '2.2.0',
    category: 'ExperienceEvent',
    description: 'Time-series behavioral telemetry stream captured via XLR8 Web SDK and Edge Network endpoints.',
    baseClass: 'https://ns.xprplatform.com/xdm/context/experienceevent',
    fieldGroups: [
      'xdm:mixins/web-interaction-details',
      'xdm:mixins/device-environment',
      'xdm:mixins/network-geo'
    ],
    tenantNamespace: '_enterpriseTenant',
    status: 'Enabled for Profile',
    createdDate: '2026-08-05T10:00:00Z',
    lastUpdated: '2026-08-19T11:00:00Z',
    fields: [
      {
        id: 'ee_timestamp',
        name: 'timestamp',
        dataType: 'timestamp',
        description: 'ISO-8601 UTC timestamp of the user interaction',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ee_event_type',
        name: 'eventType',
        dataType: 'string',
        description: 'ExperienceEvent verb: PageView, AddToCart, ProductView, FormSubmit, Search',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ee_cookie_id',
        name: 'cookieId',
        dataType: 'string',
        description: '1st-party Alloy.js ECID / visitor cookie identifier',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'cookie',
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ee_page_url',
        name: 'pageUrl',
        dataType: 'string',
        description: 'Full canonical URL location of the interaction',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'ee_referrer',
        name: 'referrerUrl',
        dataType: 'string',
        description: 'HTTP Referrer header URL for inbound marketing attribution',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'ee_device_browser',
        name: 'deviceBrowser',
        dataType: 'string',
        description: 'Client browser user-agent family and platform string',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'xdm_commerce_event',
    name: 'XDM Commerce & Transactional Event',
    version: '2.0.0',
    category: 'ExperienceEvent',
    description: 'Transactional purchase, refund, and payment event schema captured from e-commerce checkout and POS terminals.',
    baseClass: 'https://ns.xprplatform.com/xdm/context/experienceevent',
    fieldGroups: [
      'xdm:mixins/commerce-order-details',
      'xdm:mixins/payment-instruments',
      'xdm:mixins/product-list-items'
    ],
    tenantNamespace: '_enterpriseTenant',
    status: 'Enabled for Profile',
    createdDate: '2026-08-08T12:00:00Z',
    lastUpdated: '2026-08-19T13:15:00Z',
    fields: [
      {
        id: 'ce_order_id',
        name: 'orderId',
        dataType: 'string',
        description: 'Unique global transaction reference order ID',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ce_order_total',
        name: 'orderTotal',
        dataType: 'number',
        description: 'Net transaction amount after discounts in settlement currency',
        classification: 'Financial',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ce_currency_code',
        name: 'currencyCode',
        dataType: 'string',
        description: 'ISO-4217 3-letter currency code (e.g. USD, EUR, JPY)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ce_item_skus',
        name: 'purchasedSkus',
        dataType: 'array',
        description: 'Array of purchased product SKU identifiers',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'ce_customer_email',
        name: 'customerEmail',
        dataType: 'string',
        description: 'Billing/Account email address for deterministic order stitching',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'email',
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'ce_payment_method',
        name: 'paymentMethod',
        dataType: 'string',
        description: 'Payment token classification (CreditCard, ApplePay, PayPal, Wire)',
        classification: 'Financial',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'xdm_b2b_account',
    name: 'XDM B2B Organization & Account Schema',
    version: '1.2.0',
    category: 'B2BAccount',
    description: 'B2B Account entity representation for account hierarchies, firmographics, and Lead-to-Account (L2A) matching.',
    baseClass: 'https://ns.xprplatform.com/xdm/classes/b2b-account',
    fieldGroups: [
      'xdm:mixins/b2b-firmographics',
      'xdm:mixins/b2b-account-hierarchy',
      'xdm:mixins/buying-group-intent'
    ],
    tenantNamespace: '_enterpriseTenant',
    status: 'Enabled for Profile',
    createdDate: '2026-08-10T09:00:00Z',
    lastUpdated: '2026-08-19T09:40:00Z',
    fields: [
      {
        id: 'b2b_account_id',
        name: 'accountId',
        dataType: 'string',
        description: 'Primary corporate account identifier (Salesforce Account ID / CRM ID)',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'b2b_account_name',
        name: 'accountName',
        dataType: 'string',
        description: 'Legal registered business entity name',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'b2b_domain',
        name: 'corporateDomain',
        dataType: 'string',
        description: 'Primary internet domain (e.g. techenterprise.com) used for automated L2A lead matching',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'b2b_annual_revenue',
        name: 'annualRevenue',
        dataType: 'number',
        description: 'Estimated annual corporate revenue in USD',
        classification: 'Financial',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'b2b_employee_count',
        name: 'employeeCount',
        dataType: 'number',
        description: 'Total worldwide headcount',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        id: 'b2b_intent_score',
        name: 'intentSurgeScore',
        dataType: 'number',
        description: 'Real-time third-party B2B intent surge index (0-100 Bombora / 6sense)',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'xdm_consent_privacy',
    name: 'XDM Consent & Privacy Preferences',
    version: '1.1.0',
    category: 'Consent',
    description: 'Standardized data subject privacy consent records supporting GDPR, CCPA/CPRA, and IAB TCF 2.2 strings.',
    baseClass: 'https://ns.xprplatform.com/xdm/context/consent',
    fieldGroups: [
      'xdm:mixins/privacy-regulations-gdpr-ccpa',
      'xdm:mixins/channel-opt-in-preferences'
    ],
    tenantNamespace: '_enterpriseTenant',
    status: 'Enabled for Profile',
    createdDate: '2026-08-12T14:00:00Z',
    lastUpdated: '2026-08-19T10:00:00Z',
    fields: [
      {
        id: 'cp_subject_email',
        name: 'subjectEmail',
        dataType: 'string',
        description: 'Data subject email identifier',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'email',
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'cp_gdpr_consent',
        name: 'gdprConsent',
        dataType: 'boolean',
        description: 'Explicit EU GDPR Article 6 affirmative consent status',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'cp_ccpa_opt_out',
        name: 'ccpaOptOut',
        dataType: 'boolean',
        description: 'California CCPA/CPRA Do Not Sell or Share Personal Information flag',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'cp_marketing_email',
        name: 'marketingEmailConsent',
        dataType: 'boolean',
        description: 'Consent to receive promotional email campaigns',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        id: 'cp_third_party_share',
        name: 'thirdPartySharingConsent',
        dataType: 'boolean',
        description: 'Permission to syndicate data to 3rd-party ad networks and DMP platforms',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      }
    ]
  }
];

export const INITIAL_PROFILES: CustomerProfile[] = [
  {
    id: 'prof_89x_2910',
    unifiedName: 'Elena Rostova',
    primaryEmail: 'elena.rostova@techenterprise.com',
    primaryPhone: '+1 (415) 882-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-04-12T10:14:00Z',
    lastActiveAt: '2026-08-19T13:20:10Z',
    identities: [
      {
        id: 'id_elena_email',
        type: 'email',
        value: 'elena.rostova@techenterprise.com',
        firstSeen: '2026-04-12T10:14:00Z',
        lastSeen: '2026-08-19T13:20:10Z',
        source: 'Salesforce CRM',
        isPrimary: true,
      },
      {
        id: 'id_elena_cookie',
        type: 'cookie',
        value: 'cid_982b_alpha_44',
        firstSeen: '2026-04-10T18:02:00Z',
        lastSeen: '2026-08-19T13:18:00Z',
        source: 'Web SDK',
      },
      {
        id: 'id_elena_phone',
        type: 'phone',
        value: '+14158829012',
        firstSeen: '2026-05-01T09:30:00Z',
        lastSeen: '2026-08-15T11:00:00Z',
        source: 'Mobile SDK',
      },
      {
        id: 'id_elena_crm',
        type: 'crmId',
        value: 'SFDC_0034W000021aZq',
        firstSeen: '2026-04-12T10:14:00Z',
        lastSeen: '2026-08-10T12:00:00Z',
        source: 'Salesforce CRM',
      }
    ],
    identityLinks: [
      {
        sourceId: 'id_elena_cookie',
        targetId: 'id_elena_email',
        relationship: 'deterministic',
        confidence: 1.0,
        establishedAt: '2026-04-12T10:14:00Z',
        linkedByEvent: 'User Login Form Submit',
      },
      {
        sourceId: 'id_elena_phone',
        targetId: 'id_elena_email',
        relationship: 'deterministic',
        confidence: 1.0,
        establishedAt: '2026-05-01T09:30:00Z',
        linkedByEvent: 'SMS 2FA Authentication',
      },
      {
        sourceId: 'id_elena_crm',
        targetId: 'id_elena_email',
        relationship: 'deterministic',
        confidence: 1.0,
        establishedAt: '2026-04-12T10:14:00Z',
        linkedByEvent: 'Snowflake ETL Daily Batch',
      }
    ],
    attributes: {
      firstName: 'Elena',
      lastName: 'Rostova',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      customerTier: 'VIP',
      totalSpend: 4210.00,
      purchaseCount: 8,
      lastPurchaseDate: '2026-08-14T15:20:00Z',
      loyaltyPoints: 12400,
      company: 'TechEnterprise Corp',
      jobTitle: 'VP of Platform Engineering',
      preferredCategory: 'Enterprise Cloud Hardware',
      hasActiveSubscription: true,
      deviceType: 'MacBook Pro / iOS Mobile',
      ssnLast4: '8821',
      healthCategory: 'None'
    },
    consent: {
      gdprConsent: true,
      ccpaOptOut: false,
      marketingEmailConsent: true,
      thirdPartySharingConsent: true,
      sensitiveDataAllowed: false,
      lastUpdated: '2026-05-10T12:00:00Z',
      consentSource: 'OneTrust Cookie Banner & Preference Center',
    },
    predictions: {
      churnRisk: 14,
      churnRiskBand: 'Low',
      predictedLtv: 8500.00,
      upsellPropensity: 78,
      brandLoyaltyScore: 92,
      nextBestAction: 'Offer VIP Annual Hardware Pass Renewal',
      nextBestOffer: '15% Loyalty Credit towards Next Order',
      calculatedAt: '2026-08-19T12:00:00Z',
    },
    events: [
      {
        id: 'evt_elena_1',
        timestamp: '2026-08-19T13:20:10Z',
        eventType: 'AddToCart',
        channel: 'Web SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { cookieId: 'cid_982b_alpha_44', email: 'elena.rostova@techenterprise.com' },
        payload: { productSku: 'CLOUD-SERVER-RACK-8X', price: 1299.00, quantity: 1 },
      },
      {
        id: 'evt_elena_2',
        timestamp: '2026-08-19T13:18:00Z',
        eventType: 'PageView',
        channel: 'Web SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { cookieId: 'cid_982b_alpha_44' },
        payload: { pageUrl: '/products/cloud-infrastructure/rack-8x', referrer: 'https://google.com' },
      },
      {
        id: 'evt_elena_3',
        timestamp: '2026-08-14T15:20:00Z',
        eventType: 'Purchase',
        channel: 'POS Terminal',
        schemaId: 'schema_purchase_v1',
        identifiers: { email: 'elena.rostova@techenterprise.com', phone: '+14158829012' },
        payload: { orderId: 'ORD-998214', orderTotal: 1840.00, itemSkus: ['ROUTER-ENTERPRISE-PRO', 'FIBER-CABLE-10M'] },
      }
    ],
    qualifyingAudienceIds: ['aud_high_value_abandoners', 'aud_vip_loyalists'],
    activeJourneys: [
      {
        journeyId: 'jrn_cart_recovery',
        journeyName: 'Abandon Cart Recovery Campaign',
        currentStepIndex: 1,
        enteredAt: '2026-08-19T13:20:10Z',
        status: 'active',
      }
    ]
  },
  {
    id: 'prof_22m_4001',
    unifiedName: 'Marcus Vance',
    primaryEmail: 'marcus.vance@vancemedia.io',
    primaryPhone: '+1 (312) 555-8941',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-18T14:10:00Z',
    lastActiveAt: '2026-08-19T11:45:00Z',
    identities: [
      {
        id: 'id_marcus_email',
        type: 'email',
        value: 'marcus.vance@vancemedia.io',
        firstSeen: '2026-02-18T14:10:00Z',
        lastSeen: '2026-08-19T11:45:00Z',
        source: 'Snowflake Batch',
        isPrimary: true,
      },
      {
        id: 'id_marcus_device',
        type: 'device',
        value: 'IDFA_71A9_9941_B102',
        firstSeen: '2026-03-01T08:12:00Z',
        lastSeen: '2026-08-19T11:45:00Z',
        source: 'Mobile SDK',
      }
    ],
    identityLinks: [
      {
        sourceId: 'id_marcus_device',
        targetId: 'id_marcus_email',
        relationship: 'deterministic',
        confidence: 1.0,
        establishedAt: '2026-03-01T08:12:00Z',
        linkedByEvent: 'Mobile App Login',
      }
    ],
    attributes: {
      firstName: 'Marcus',
      lastName: 'Vance',
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      customerTier: 'Gold',
      totalSpend: 1840.50,
      purchaseCount: 3,
      lastPurchaseDate: '2026-06-20T10:00:00Z',
      loyaltyPoints: 3800,
      company: 'Vance Media Digital',
      jobTitle: 'Creative Director',
      preferredCategory: 'Display & Audio Monitors',
      hasActiveSubscription: false,
      deviceType: 'iOS App (iPhone 16 Pro)',
      ssnLast4: '4190',
      healthCategory: 'Ergonomic Support'
    },
    consent: {
      gdprConsent: true,
      ccpaOptOut: false,
      marketingEmailConsent: true,
      thirdPartySharingConsent: false, // Disallowed 3rd party ad retargeting
      sensitiveDataAllowed: false,
      lastUpdated: '2026-06-20T10:00:00Z',
      consentSource: 'iOS App Permission Prompt',
    },
    predictions: {
      churnRisk: 84, // High Churn Risk!
      churnRiskBand: 'High',
      predictedLtv: 2400.00,
      upsellPropensity: 32,
      brandLoyaltyScore: 41,
      nextBestAction: 'Trigger High-Priority Customer Success Re-engagement',
      nextBestOffer: '20% Come-Back Retention Voucher',
      calculatedAt: '2026-08-19T06:00:00Z',
    },
    events: [
      {
        id: 'evt_marcus_1',
        timestamp: '2026-08-19T11:45:00Z',
        eventType: 'AppOpen',
        channel: 'Mobile SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { deviceToken: 'IDFA_71A9_9941_B102', email: 'marcus.vance@vancemedia.io' },
        payload: { appVersion: '4.2.1', screen: 'Pricing & Cancelation FAQ' },
      },
      {
        id: 'evt_marcus_2',
        timestamp: '2026-08-10T16:00:00Z',
        eventType: 'SupportTicket',
        channel: 'Salesforce CRM',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { email: 'marcus.vance@vancemedia.io' },
        payload: { ticketSubject: 'Inquiry regarding subscription renewal cost', priority: 'Medium' },
      }
    ],
    qualifyingAudienceIds: ['aud_high_churn_spenders'],
    activeJourneys: [
      {
        journeyId: 'jrn_churn_retention',
        journeyName: 'Re-engagement for High Churn Risk',
        currentStepIndex: 0,
        enteredAt: '2026-08-19T11:45:00Z',
        status: 'active',
      }
    ]
  },
  {
    id: 'prof_71z_5521',
    unifiedName: 'Aarav Mehta',
    primaryEmail: 'aarav.mehta@globalfin.co.uk',
    primaryPhone: '+44 7700 900341',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-05-02T16:30:00Z',
    lastActiveAt: '2026-08-19T09:12:00Z',
    identities: [
      {
        id: 'id_aarav_email',
        type: 'email',
        value: 'aarav.mehta@globalfin.co.uk',
        firstSeen: '2026-05-02T16:30:00Z',
        lastSeen: '2026-08-19T09:12:00Z',
        source: 'Web SDK',
        isPrimary: true,
      },
      {
        id: 'id_aarav_cookie',
        type: 'cookie',
        value: 'cid_uk_9011_aarav',
        firstSeen: '2026-05-02T16:20:00Z',
        lastSeen: '2026-08-19T09:12:00Z',
        source: 'Web SDK',
      },
      {
        id: 'id_aarav_phone',
        type: 'phone',
        value: '+447700900341',
        firstSeen: '2026-05-15T11:00:00Z',
        lastSeen: '2026-08-01T10:00:00Z',
        source: 'POS Terminal',
      }
    ],
    identityLinks: [
      {
        sourceId: 'id_aarav_cookie',
        targetId: 'id_aarav_email',
        relationship: 'deterministic',
        confidence: 1.0,
        establishedAt: '2026-05-02T16:30:00Z',
        linkedByEvent: 'Registration Checkout',
      }
    ],
    attributes: {
      firstName: 'Aarav',
      lastName: 'Mehta',
      city: 'London',
      country: 'UK',
      customerTier: 'Silver',
      totalSpend: 922.00,
      purchaseCount: 2,
      lastPurchaseDate: '2026-07-15T14:10:00Z',
      loyaltyPoints: 1850,
      company: 'Global Financial UK',
      jobTitle: 'Senior Risk Analyst',
      preferredCategory: 'Security Key Hardware',
      hasActiveSubscription: true,
      deviceType: 'Windows PC (Chrome)',
      ssnLast4: '3319'
    },
    consent: {
      gdprConsent: false, // GDPR Opt-out requested
      ccpaOptOut: true,
      marketingEmailConsent: false,
      thirdPartySharingConsent: false,
      sensitiveDataAllowed: false,
      lastUpdated: '2026-08-01T10:00:00Z',
      consentSource: 'GDPR Cookie Consent Opt-Out Modal',
    },
    predictions: {
      churnRisk: 38,
      churnRiskBand: 'Medium',
      predictedLtv: 1800.00,
      upsellPropensity: 55,
      brandLoyaltyScore: 68,
      nextBestAction: 'Deliver Transactional Email Only (Respect GDPR)',
      nextBestOffer: 'Standard Support Portal Access',
      calculatedAt: '2026-08-19T00:00:00Z',
    },
    events: [
      {
        id: 'evt_aarav_1',
        timestamp: '2026-08-19T09:12:00Z',
        eventType: 'PageView',
        channel: 'Web SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { cookieId: 'cid_uk_9011_aarav', email: 'aarav.mehta@globalfin.co.uk' },
        payload: { pageUrl: '/documentation/security-keys/setup', referrer: 'direct' },
      }
    ],
    qualifyingAudienceIds: ['aud_privacy_opted_out'],
    activeJourneys: []
  },
  {
    id: 'prof_33b_9912',
    unifiedName: 'Sofia Tanaka',
    primaryEmail: 'sofia.tanaka@designstudios.jp',
    primaryPhone: '+81 90-1234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-06-10T08:00:00Z',
    lastActiveAt: '2026-08-19T12:55:00Z',
    identities: [
      {
        id: 'id_sofia_email',
        type: 'email',
        value: 'sofia.tanaka@designstudios.jp',
        firstSeen: '2026-06-10T08:00:00Z',
        lastSeen: '2026-08-19T12:55:00Z',
        source: 'Web SDK',
        isPrimary: true,
      },
      {
        id: 'id_sofia_cookie',
        type: 'cookie',
        value: 'cid_tokyo_7761',
        firstSeen: '2026-06-10T07:45:00Z',
        lastSeen: '2026-08-19T12:55:00Z',
        source: 'Web SDK',
      }
    ],
    identityLinks: [
      {
        sourceId: 'id_sofia_cookie',
        targetId: 'id_sofia_email',
        relationship: 'deterministic',
        confidence: 1.0,
        establishedAt: '2026-06-10T08:00:00Z',
        linkedByEvent: 'Web Checkout',
      }
    ],
    attributes: {
      firstName: 'Sofia',
      lastName: 'Tanaka',
      city: 'Tokyo',
      country: 'JP',
      customerTier: 'Platinum',
      totalSpend: 3120.00,
      purchaseCount: 5,
      lastPurchaseDate: '2026-08-12T04:00:00Z',
      loyaltyPoints: 7900,
      company: 'Tanaka Design Studios',
      jobTitle: 'Principal Architect',
      preferredCategory: 'Color Calibration Displays',
      hasActiveSubscription: true,
      deviceType: 'MacBook Air'
    },
    consent: {
      gdprConsent: true,
      ccpaOptOut: false,
      marketingEmailConsent: true,
      thirdPartySharingConsent: true,
      sensitiveDataAllowed: false,
      lastUpdated: '2026-06-10T08:00:00Z',
      consentSource: 'Regional Privacy Consent Modal',
    },
    predictions: {
      churnRisk: 9,
      churnRiskBand: 'Low',
      predictedLtv: 6200.00,
      upsellPropensity: 88,
      brandLoyaltyScore: 96,
      nextBestAction: 'Invite to Exclusive Product Advisory Board',
      nextBestOffer: 'Free Extended Pro Warranty',
      calculatedAt: '2026-08-19T06:00:00Z',
    },
    events: [
      {
        id: 'evt_sofia_1',
        timestamp: '2026-08-19T12:55:00Z',
        eventType: 'AddToCart',
        channel: 'Web SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { cookieId: 'cid_tokyo_7761', email: 'sofia.tanaka@designstudios.jp' },
        payload: { productSku: 'MONITOR-4K-CALIBRATED-32IN', price: 1450.00, quantity: 1 },
      }
    ],
    qualifyingAudienceIds: ['aud_high_value_abandoners', 'aud_vip_loyalists'],
    activeJourneys: []
  },
  {
    id: 'prof_anonymous_6021',
    unifiedName: 'Anonymous Visitor (Cookie 5104)',
    primaryEmail: 'anon_5104@unregistered.guest',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-19T13:10:00Z',
    lastActiveAt: '2026-08-19T13:30:00Z',
    identities: [
      {
        id: 'id_anon_cookie',
        type: 'cookie',
        value: 'cid_anon_temp_5104',
        firstSeen: '2026-08-19T13:10:00Z',
        lastSeen: '2026-08-19T13:30:00Z',
        source: 'Web SDK',
        isPrimary: true,
      }
    ],
    identityLinks: [],
    attributes: {
      city: 'Austin',
      state: 'TX',
      country: 'US',
      customerTier: 'Bronze',
      totalSpend: 0,
      purchaseCount: 0,
      loyaltyPoints: 0,
      preferredCategory: 'Cloud Storage Solutions',
      hasActiveSubscription: false,
      deviceType: 'Mobile Safari'
    },
    consent: {
      gdprConsent: true,
      ccpaOptOut: false,
      marketingEmailConsent: false,
      thirdPartySharingConsent: true,
      sensitiveDataAllowed: false,
      lastUpdated: '2026-08-19T13:10:00Z',
      consentSource: 'Default Anonymous Tracking Consent',
    },
    predictions: {
      churnRisk: 50,
      churnRiskBand: 'Medium',
      predictedLtv: 350.00,
      upsellPropensity: 40,
      brandLoyaltyScore: 20,
      nextBestAction: 'Show First-Time Visitor Signup Banner ($25 off)',
      nextBestOffer: '$25 off first order with email sign up',
      calculatedAt: '2026-08-19T13:30:00Z',
    },
    events: [
      {
        id: 'evt_anon_1',
        timestamp: '2026-08-19T13:30:00Z',
        eventType: 'AddToCart',
        channel: 'Web SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { cookieId: 'cid_anon_temp_5104' },
        payload: { productSku: 'STORAGE-ARRAY-10TB', price: 499.00, quantity: 1 },
      },
      {
        id: 'evt_anon_2',
        timestamp: '2026-08-19T13:10:00Z',
        eventType: 'PageView',
        channel: 'Web SDK',
        schemaId: 'schema_web_sdk_v1',
        identifiers: { cookieId: 'cid_anon_temp_5104' },
        payload: { pageUrl: '/products/cloud-storage/enterprise', referrer: 'https://twitter.com' },
      }
    ],
    qualifyingAudienceIds: ['aud_high_value_abandoners'],
    activeJourneys: []
  }
];

export const INITIAL_AUDIENCES: AudienceSegment[] = [
  {
    id: 'aud_high_value_abandoners',
    name: 'High-Value Cart Abandoners',
    description: 'Profiles who fired AddToCart event in the last 7 days and have spend > $0 or cart total > $400.',
    status: 'Active',
    rulesMatch: 'ALL',
    color: 'indigo',
    tags: ['Real-Time', 'E-Commerce', 'High-Intent'],
    rules: [
      {
        id: 'r_cart_event',
        category: 'event',
        field: 'AddToCart',
        operator: 'event_performed',
        value: 'AddToCart',
        timeWindowDays: 7,
        minEventCount: 1,
      },
      {
        id: 'r_tier_or_spend',
        category: 'attribute',
        field: 'totalSpend',
        operator: 'greater_than',
        value: 0,
      }
    ],
    qualifyingProfileCount: 3,
    targetableProfileCount: 3,
    lastCalculated: '2026-08-19T13:30:00Z',
  },
  {
    id: 'aud_high_churn_spenders',
    name: 'At-Risk Churn High Spenders',
    description: 'Customers with Lifetime Spend > $1,000 and AI Predictive Churn Risk score >= 80%.',
    status: 'Active',
    rulesMatch: 'ALL',
    color: 'rose',
    tags: ['AI-Scored', 'Retention', 'VIP-Rescue'],
    rules: [
      {
        id: 'r_churn_risk',
        category: 'ai_predictive',
        field: 'churnRisk',
        operator: 'gte',
        value: 80,
      },
      {
        id: 'r_spend_high',
        category: 'attribute',
        field: 'totalSpend',
        operator: 'gte',
        value: 1000,
      }
    ],
    qualifyingProfileCount: 1,
    targetableProfileCount: 1,
    lastCalculated: '2026-08-19T13:30:00Z',
  },
  {
    id: 'aud_vip_loyalists',
    name: 'VIP Brand Champions (LTV $3k+)',
    description: 'Gold & VIP tier customers with Brand Loyalty Score > 80% and Active Subscriptions.',
    status: 'Active',
    rulesMatch: 'ALL',
    color: 'emerald',
    tags: ['VIP', 'Upsell', 'High-LTV'],
    rules: [
      {
        id: 'r_loyalty_score',
        category: 'ai_predictive',
        field: 'brandLoyaltyScore',
        operator: 'gte',
        value: 80,
      },
      {
        id: 'r_tier_gold_vip',
        category: 'attribute',
        field: 'customerTier',
        operator: 'in',
        value: ['Gold', 'Platinum', 'VIP'],
      }
    ],
    qualifyingProfileCount: 2,
    targetableProfileCount: 2,
    lastCalculated: '2026-08-19T13:30:00Z',
  },
  {
    id: 'aud_privacy_opted_out',
    name: 'GDPR / CCPA Suppressed Profiles',
    description: 'Users who opted out of marketing cookies, third-party sharing, or exercised CCPA opt-out.',
    status: 'Active',
    rulesMatch: 'ANY',
    color: 'amber',
    tags: ['Governance', 'DULE-Enforced', 'Suppression'],
    rules: [
      {
        id: 'r_ccpa_optout',
        category: 'consent',
        field: 'ccpaOptOut',
        operator: 'equals',
        value: true,
      },
      {
        id: 'r_gdpr_optout',
        category: 'consent',
        field: 'gdprConsent',
        operator: 'equals',
        value: false,
      }
    ],
    qualifyingProfileCount: 1,
    targetableProfileCount: 0, // 0 targetable because blocked
    lastCalculated: '2026-08-19T13:30:00Z',
  }
];

export const INITIAL_JOURNEYS: JourneyDefinition[] = [
  {
    id: 'jrn_cart_recovery',
    name: 'Real-Time Abandoned Cart Recovery Loop',
    description: 'Triggered instantly when high-value profiles add items to cart without completing checkout within 2 hours.',
    status: 'Active',
    triggerAudienceId: 'aud_high_value_abandoners',
    totalEntered: 142,
    totalConverted: 49,
    createdAt: '2026-06-01T10:00:00Z',
    steps: [
      {
        id: 'step_1_trigger',
        title: 'Step 1: Audience Entry Trigger',
        type: 'trigger',
        description: 'Listen to Real-Time Ingestion Stream for "High-Value Cart Abandoners" membership entry.',
        config: {
          audienceId: 'aud_high_value_abandoners',
        },
        stats: {
          enteredCount: 142,
          passedCount: 142,
          droppedCount: 0,
        }
      },
      {
        id: 'step_2_wait',
        title: 'Step 2: Grace Period Delay',
        type: 'delay',
        description: 'Wait 2 Hours before evaluating purchase completion to prevent premature messaging.',
        config: {
          delayHours: 2,
        },
        stats: {
          enteredCount: 142,
          passedCount: 130,
          droppedCount: 12,
        }
      },
      {
        id: 'step_3_check',
        title: 'Step 3: Condition Check (Completed Purchase?)',
        type: 'condition',
        description: 'Check if unified profile fired Purchase event since journey entry timestamp.',
        config: {
          conditionField: 'purchaseCount',
          conditionOperator: 'has_not_increased',
          branchTrueStepId: 'step_4_action_email',
          branchFalseStepId: 'step_4_action_exit',
        },
        stats: {
          enteredCount: 130,
          passedCount: 98,
          droppedCount: 32, // Already purchased!
        }
      },
      {
        id: 'step_4_action_email',
        title: 'Step 4: Multi-Channel Personalized Incentive',
        type: 'action',
        description: 'Deliver dynamic cart reminder with AI Next Best Offer (15% loyalty voucher) via Braze + Email.',
        config: {
          actionChannel: 'Email',
          actionTemplate: 'tpl_cart_recovery_ai_dynamic_v2',
        },
        stats: {
          enteredCount: 98,
          passedCount: 98,
          droppedCount: 0,
        }
      }
    ]
  },
  {
    id: 'jrn_churn_retention',
    name: 'VIP Churn Prevention & Rescue Campaign',
    description: 'Proactively routes high-churn risk Gold & VIP users to Account Managers with custom retention incentives.',
    status: 'Active',
    triggerAudienceId: 'aud_high_churn_spenders',
    totalEntered: 38,
    totalConverted: 19,
    createdAt: '2026-07-15T09:00:00Z',
    steps: [
      {
        id: 'j2_step_1',
        title: 'Step 1: AI Predictive Trigger',
        type: 'trigger',
        description: 'Triggered when ML churn score crosses 80% threshold.',
        config: {
          audienceId: 'aud_high_churn_spenders',
        },
        stats: {
          enteredCount: 38,
          passedCount: 38,
          droppedCount: 0,
        }
      },
      {
        id: 'j2_step_2',
        title: 'Step 2: Salesforce CRM High-Priority Task',
        type: 'action',
        description: 'Creates a High-Priority Lead Escalation in Salesforce for Dedicated Account Director.',
        config: {
          actionChannel: 'Salesforce Task',
          actionTemplate: 'sfdc_task_urgent_vip_rescue',
        },
        stats: {
          enteredCount: 38,
          passedCount: 38,
          droppedCount: 0,
        }
      }
    ]
  }
];

export const INITIAL_DESTINATIONS: DestinationConnector[] = [
  {
    id: 'dest_meta_ads',
    name: 'Meta Custom Audiences & CAPI',
    icon: 'facebook',
    category: 'Ad Networks',
    status: 'Connected',
    description: 'Stream hashed identifiers (SHA-256 Email & Phone) to Facebook & Instagram Graph API for lookalikes and retargeting.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['Consent Required: GDPR Art. 6', 'Auto SHA-256 Hashing', 'No Financial PII'],
    totalSynced: 82140,
    totalBlockedForPrivacy: 14882,
    lastSyncTime: '2026-08-19T13:25:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://graph.facebook.com/v19.0/act_99182/users',
    targetPlatform: 'Meta Business Manager / Conversions API',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['email_sha256', 'phone_e164', 'madid_idfa', 'madid_gaid', 'fbp_cookie'],
    activeAudienceCount: 4
  },
  {
    id: 'dest_google_ads',
    name: 'Google Customer Match',
    icon: 'google',
    category: 'Ad Networks',
    status: 'Connected',
    description: 'Sync 1st-party customer lists to Google Search, YouTube, and Display Ads with automated consent enforcement.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['Google Consent Mode v2', 'SHA-256 Normalized Email', 'Excludes CCPA Opt-Outs'],
    totalSynced: 104250,
    totalBlockedForPrivacy: 18900,
    lastSyncTime: '2026-08-19T13:28:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://googleads.googleapis.com/v16/customers/882-991/userLists',
    targetPlatform: 'Google Ads & YouTube Match',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['email_sha256', 'phone_e164', 'postal_address_hash', 'google_cid'],
    activeAudienceCount: 6
  },
  {
    id: 'dest_tiktok_ads',
    name: 'TikTok Ads Manager & Events API',
    icon: 'video',
    category: 'Ad Networks',
    status: 'Connected',
    description: 'Real-time syndication of Gen-Z and mobile commerce audiences to TikTok Business Center with server-side CAPI events.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['Age Verification (18+)', 'SHA-256 Email/Phone Hashing', 'GDPR Ad Tracking Consent'],
    totalSynced: 34100,
    totalBlockedForPrivacy: 4920,
    lastSyncTime: '2026-08-19T13:10:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://business-api.tiktok.com/open_api/v1.3/dmp/custom_audience/apply/',
    targetPlatform: 'TikTok Ads & Pangle Network',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['email_sha256', 'phone_e164', 'idfa', 'gaid', 'ttclid'],
    activeAudienceCount: 3
  },
  {
    id: 'dest_linkedin_ads',
    name: 'LinkedIn Campaign Manager (Matched Audiences)',
    icon: 'linkedin',
    category: 'Ad Networks',
    status: 'Connected',
    description: 'Sync B2B decision makers, company domains, and ABM target lists for high-value enterprise pipeline acceleration.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['B2B Professional Contact Only', 'Hashed Work Email', 'No Consumer Health Data'],
    totalSynced: 18400,
    totalBlockedForPrivacy: 1250,
    lastSyncTime: '2026-08-19T11:45:00Z',
    syncFrequency: 'Hourly',
    endpoint: 'https://api.linkedin.com/v2/adSegmentsV2',
    targetPlatform: 'LinkedIn Marketing Solutions',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['work_email_sha256', 'company_domain', 'linkedin_member_urn'],
    activeAudienceCount: 5
  },
  {
    id: 'dest_amazon_dsp',
    name: 'Amazon DSP & Marketing Cloud (AMC)',
    icon: 'shopping-cart',
    category: 'Ad Networks',
    status: 'Connected',
    description: 'Activate retail media audiences across Prime Video, Amazon.com, FireTV, and the open web DSP exchange.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['AMC Privacy Differential Envelope', 'Hashed Postal & Email', 'Zero Raw Data Egress'],
    totalSynced: 62900,
    totalBlockedForPrivacy: 7800,
    lastSyncTime: '2026-08-19T12:15:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://advertising-api.amazon.com/dsp/audiences',
    targetPlatform: 'Amazon Advertising Platform',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['email_sha256', 'phone_e164', 'amazon_directed_id', 'zip_hash'],
    activeAudienceCount: 3
  },
  {
    id: 'dest_the_trade_desk',
    name: 'The Trade Desk (Unified ID 2.0 / UID2)',
    icon: 'tv',
    category: 'Ad Networks',
    status: 'Connected',
    description: 'Syndicate open-web and Connected TV (CTV) programmatic campaigns with privacy-conscious UID2 tokenized hashing.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['UID2 Opt-Out Token Registry Check', 'Decryption Key Rotation (Daily)'],
    totalSynced: 91400,
    totalBlockedForPrivacy: 11200,
    lastSyncTime: '2026-08-19T12:40:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://api.thetradedesk.com/v3/mydata/firstparty/segment',
    targetPlatform: 'The Trade Desk DSP',
    authType: 'API Key Token',
    authStatus: 'Authenticated',
    supportedIdentities: ['uid2_token', 'email_sha256', 'phone_e164', 'ip_address_masked'],
    activeAudienceCount: 4
  },
  {
    id: 'dest_braze',
    name: 'Braze Customer Engagement',
    icon: 'braze',
    category: 'MarTech',
    status: 'Connected',
    description: 'Push real-time unified user attributes, event triggers, and predictive scores for mobile push, SMS, and in-app messaging.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['Direct Messaging Opt-In Verified', 'Dynamic Attribute Redaction'],
    totalSynced: 45200,
    totalBlockedForPrivacy: 310,
    lastSyncTime: '2026-08-19T13:31:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://rest.iad-03.braze.com/users/track',
    targetPlatform: 'Braze Cloud',
    authType: 'API Key Token',
    authStatus: 'Authenticated',
    supportedIdentities: ['external_id', 'email', 'phone', 'braze_id', 'push_tokens'],
    activeAudienceCount: 5
  },
  {
    id: 'dest_klaviyo',
    name: 'Klaviyo E-Commerce Messaging',
    icon: 'mail',
    category: 'MarTech',
    status: 'Connected',
    description: 'Stream predictive segments and cart abandonment profiles to trigger omnichannel Shopify & direct-to-consumer email flows.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['CAN-SPAM / TCPA Double Opt-In Verified', 'Unsubscribe List Cleared'],
    totalSynced: 38700,
    totalBlockedForPrivacy: 420,
    lastSyncTime: '2026-08-19T13:15:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://a.klaviyo.com/api/profiles/',
    targetPlatform: 'Klaviyo Marketing Automation',
    authType: 'API Key Token',
    authStatus: 'Authenticated',
    supportedIdentities: ['email', 'phone_number', 'external_id', 'shopify_customer_id'],
    activeAudienceCount: 4
  },
  {
    id: 'dest_marketo',
    name: 'Marketo Enterprise Engage',
    icon: 'marketo',
    category: 'MarTech',
    status: 'Connected',
    description: 'Sync B2B lead records, account tiers, and lead scoring back into Marketo marketing automation.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['B2B Corporate Email Only', 'Lead Lifecycle State Synchronized'],
    totalSynced: 29800,
    totalBlockedForPrivacy: 840,
    lastSyncTime: '2026-08-19T12:00:00Z',
    syncFrequency: 'Hourly',
    endpoint: 'https://781-XYZ.mktorest.com/rest/v1/leads.json',
    targetPlatform: 'Marketing Automation Cloud',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['lead_id', 'email', 'sfdc_contact_id', 'account_domain'],
    activeAudienceCount: 3
  },
  {
    id: 'dest_iterable',
    name: 'Iterable Cross-Channel Platform',
    icon: 'send',
    category: 'MarTech',
    status: 'Connected',
    description: 'Trigger event-based push, in-app, SMS, and webhooks with millisecond payload dispatch from real-time customer journeys.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['Push Token Active', 'Suppression List Pre-Filter'],
    totalSynced: 21600,
    totalBlockedForPrivacy: 190,
    lastSyncTime: '2026-08-19T11:20:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://api.iterable.com/api/users/update',
    targetPlatform: 'Iterable Cloud',
    authType: 'API Key Token',
    authStatus: 'Authenticated',
    supportedIdentities: ['email', 'userId', 'phone', 'device_tokens'],
    activeAudienceCount: 2
  },
  {
    id: 'dest_salesforce_marketing_cloud',
    name: 'Salesforce Marketing Cloud (SFMC)',
    icon: 'cloud',
    category: 'MarTech',
    status: 'Connected',
    description: 'Sync audiences directly into SFMC Data Extensions and trigger Journey Builder multi-step email & SMS automations.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['SFMC Contact Key Mapping', 'Consent String Synced to All Subscribers'],
    totalSynced: 54100,
    totalBlockedForPrivacy: 1100,
    lastSyncTime: '2026-08-19T12:50:00Z',
    syncFrequency: 'Hourly',
    endpoint: 'https://mc.salesforce.com/data/v1/async/dataextensions/key:CDP_AUDIENCE/rows',
    targetPlatform: 'Salesforce Marketing Cloud',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['ContactKey', 'EmailAddress', 'SubscriberKey', 'MobileNumber'],
    activeAudienceCount: 4
  },
  {
    id: 'dest_hubspot_marketing',
    name: 'HubSpot Marketing Hub',
    icon: 'hubspot',
    category: 'MarTech',
    status: 'Connected',
    description: 'Sync static and dynamic contact lists to HubSpot for inbound workflows, email sequences, and lead nurturing.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['HubSpot GDPR Legal Basis Tagged', 'Unsubscribed Contacts Omitted'],
    totalSynced: 31200,
    totalBlockedForPrivacy: 610,
    lastSyncTime: '2026-08-19T10:30:00Z',
    syncFrequency: 'Hourly',
    endpoint: 'https://api.hubapi.com/contacts/v1/lists/add',
    targetPlatform: 'HubSpot Inbound Marketing',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['email', 'hubspot_vid', 'company_domain'],
    activeAudienceCount: 3
  },
  {
    id: 'dest_snowflake_cleanroom',
    name: 'Snowflake Data Clean Room & Reverse ETL',
    icon: 'snowflake',
    category: 'Cloud Storage',
    status: 'Connected',
    description: 'Secure differential-privacy enabled enterprise data sharing with external partners and clean rooms without data movement.',
    allowedPrivacyLabels: ['Standard', 'Financial', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['Differential Privacy Noise k=5', 'Secure Data Share Zero Copy', 'Audit Trail Logged'],
    totalSynced: 382000,
    totalBlockedForPrivacy: 5400,
    lastSyncTime: '2026-08-19T10:00:00Z',
    syncFrequency: 'Batch 24h',
    endpoint: 'snowflake://enterprise.eu-west-1.snowflakecomputing.com',
    targetPlatform: 'Snowflake Enterprise Data Cloud',
    authType: 'Service Account (GCP/AWS)',
    authStatus: 'Authenticated',
    supportedIdentities: ['snowflake_id', 'email_sha256', 'enterprise_account_id'],
    activeAudienceCount: 7
  },
  {
    id: 'dest_bigquery_export',
    name: 'Google BigQuery Dataset Export',
    icon: 'database',
    category: 'Cloud Storage',
    status: 'Connected',
    description: 'Direct partitioned table synchronization to BigQuery analytics marts for AI modeling and enterprise Looker reporting.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['Column-level Security (CLS) Masking', 'Audit Trail Export'],
    totalSynced: 215000,
    totalBlockedForPrivacy: 3100,
    lastSyncTime: '2026-08-19T09:00:00Z',
    syncFrequency: 'Batch 24h',
    endpoint: 'bigquery://gcp-enterprise-prod:cdp_curated_marts.active_audiences',
    targetPlatform: 'Google Cloud Platform BigQuery',
    authType: 'Service Account (GCP/AWS)',
    authStatus: 'Authenticated',
    supportedIdentities: ['google_user_id', 'email_sha256', 'crm_contact_id'],
    activeAudienceCount: 5
  },
  {
    id: 'dest_aws_s3_lakehouse',
    name: 'AWS S3 Parquet Lakehouse',
    icon: 'aws',
    category: 'Cloud Storage',
    status: 'Connected',
    description: 'Export gzip-compressed Apache Parquet audience partitions to AWS S3 bucket for Databricks and Athena querying.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive'],
    duleEnforcedRules: ['KMS SSE-S3 Key Encryption', 'Snappy Parquet Compression'],
    totalSynced: 175000,
    totalBlockedForPrivacy: 1800,
    lastSyncTime: '2026-08-19T08:30:00Z',
    syncFrequency: 'Batch 24h',
    endpoint: 's3://enterprise-cdp-datalake-us-east-1/curated/audiences/',
    targetPlatform: 'Amazon Web Services S3',
    authType: 'Service Account (GCP/AWS)',
    authStatus: 'Authenticated',
    supportedIdentities: ['profile_uuid', 'email_sha256', 'account_id'],
    activeAudienceCount: 4
  },
  {
    id: 'dest_salesforce_crm_tasks',
    name: 'Salesforce Sales & Service Cloud',
    icon: 'cloud',
    category: 'MarTech',
    status: 'Connected',
    description: 'Automate high-priority task creation for dedicated Account Executives and route churn-risk VIPs to Premier Support reps.',
    allowedPrivacyLabels: ['Standard', 'Behavioral', 'Financial'],
    blockedPrivacyLabels: ['Sensitive', 'Health'],
    duleEnforcedRules: ['B2B Enterprise CRM Role-Based Access', 'Automated Lead Escalation'],
    totalSynced: 14200,
    totalBlockedForPrivacy: 120,
    lastSyncTime: '2026-08-19T13:10:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://enterprise.my.salesforce.com/services/data/v58.0/sobjects/Task',
    targetPlatform: 'Salesforce Core CRM',
    authType: 'OAuth2 Bearer',
    authStatus: 'Authenticated',
    supportedIdentities: ['sfdc_contact_id', 'email', 'account_domain'],
    activeAudienceCount: 3
  },
  {
    id: 'dest_slack_alerts',
    name: 'Slack VIP Customer Escalation Bot',
    icon: 'message-square',
    category: 'Webhooks',
    status: 'Connected',
    description: 'Instant notification channel into #enterprise-vip-alerts and #churn-prevention when high-value accounts qualify for critical segments.',
    allowedPrivacyLabels: ['Standard'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['Masked PII in Public Slack Channels', 'Requires Secret Token Verification'],
    totalSynced: 8400,
    totalBlockedForPrivacy: 410,
    lastSyncTime: '2026-08-19T13:20:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://hooks.slack.com/services/T000/B000/XXXXX',
    targetPlatform: 'Slack Enterprise Grid',
    authType: 'API Key Token',
    authStatus: 'Authenticated',
    supportedIdentities: ['account_name', 'deal_value', 'churn_risk_badge'],
    activeAudienceCount: 2
  },
  {
    id: 'dest_webhook',
    name: 'Enterprise Event Webhook (HTTPS REST)',
    icon: 'webhook',
    category: 'Webhooks',
    status: 'Connected',
    description: 'Low-latency HTTPS POST notification pipeline triggered on any profile state mutation or segment qualification with HMAC SHA-256 signatures.',
    allowedPrivacyLabels: ['Standard', 'Behavioral'],
    blockedPrivacyLabels: ['Sensitive', 'Health', 'Financial'],
    duleEnforcedRules: ['HMAC SHA-256 Payload Signature', 'mTLS TLS 1.3 Strict Cipher', 'Exponential Backoff Retry'],
    totalSynced: 189400,
    totalBlockedForPrivacy: 1200,
    lastSyncTime: '2026-08-19T13:32:00Z',
    syncFrequency: 'Real-Time',
    endpoint: 'https://api.enterprise.corp/events/cdp-webhook-listener',
    targetPlatform: 'Internal Microservices Event Bus',
    authType: 'Mutual TLS',
    authStatus: 'Authenticated',
    supportedIdentities: ['profile_id', 'event_type', 'segment_membership'],
    activeAudienceCount: 6
  }
];

export const INITIAL_INGESTION_SOURCES: IngestionSource[] = [
  {
    id: 'src_web_sdk',
    name: 'XLR8 Platform Web SDK (Streaming)',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 4820,
    todayEventCount: 8420194,
    latencyMs: 3.2,
    description: 'Client-side event streaming with first-party cookie generation, Web Vitals, and real-time consent gating.',
    icon: 'globe',
    category: 'Web & Mobile',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event (Commerce & Behavioral)',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 1s ago)',
    errorRatePercent: 0.01,
    dataFlowUrl: 'https://edge.xprplatform.io/ee/v1/interact?configId=xpr_prod_771'
  },
  {
    id: 'src_gtm',
    name: 'Google Tag Manager (Client & Server-Side)',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 3640,
    todayEventCount: 6280400,
    latencyMs: 3.8,
    description: 'Server-side GTM container forwarding ecommerce data layer pushes, scroll depth, and custom page events.',
    icon: 'code',
    category: 'Web & Mobile',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 2s ago)',
    errorRatePercent: 0.02,
    dataFlowUrl: 'https://gtm.enterprise.com/cdp-ingest'
  },
  {
    id: 'src_mobile_sdk',
    name: 'Mobile SDK (iOS Swift & Android Kotlin)',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 2150,
    todayEventCount: 3912040,
    latencyMs: 4.8,
    description: 'Native mobile app lifecycle, screen views, in-app purchases, and push token registration with IDFA/GAID parsing.',
    icon: 'smartphone',
    category: 'Web & Mobile',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 1s ago)',
    errorRatePercent: 0.04,
    dataFlowUrl: 'https://mobile-ingest.nexus.io/v2/events'
  },
  {
    id: 'src_react_native_flutter',
    name: 'Cross-Platform SDK (React Native & Flutter)',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 1280,
    todayEventCount: 2180000,
    latencyMs: 5.1,
    description: 'Cross-platform hybrid application wrapper telemetry, offline event spooling, and automatic battery-safe batching.',
    icon: 'smartphone',
    category: 'Web & Mobile',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 3s ago)',
    errorRatePercent: 0.03,
    dataFlowUrl: 'https://mobile-ingest.nexus.io/v2/hybrid'
  },
  {
    id: 'src_kafka_ingest',
    name: 'Apache Kafka / Confluent Cloud Event Bus',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 5430,
    todayEventCount: 9812400,
    latencyMs: 1.8,
    description: 'High-throughput enterprise streaming queue connected directly to Apache Flink stream workers for real-time parsing.',
    icon: 'layers',
    category: 'Event Streams',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'mTLS / Kafka SASL',
    lastEventReceived: 'Just now (< 1s ago)',
    errorRatePercent: 0.00,
    dataFlowUrl: 'kafka://pkc-4r29z.us-east-2.aws.confluent.cloud:9092/topics/cdp.events.raw'
  },
  {
    id: 'src_kinesis_stream',
    name: 'Amazon Kinesis Data Streams',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 2840,
    todayEventCount: 4980200,
    latencyMs: 2.3,
    description: 'AWS shard-managed streaming pipeline consuming transactional clickstream and IoT device heartbeats.',
    icon: 'zap',
    category: 'Event Streams',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'Service Role',
    lastEventReceived: 'Just now (< 1s ago)',
    errorRatePercent: 0.01,
    dataFlowUrl: 'arn:aws:kinesis:us-east-1:123456789012:stream/enterprise-clickstream'
  },
  {
    id: 'src_gcp_pubsub',
    name: 'Google Cloud Pub/Sub Messaging',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 1980,
    todayEventCount: 3410900,
    latencyMs: 2.1,
    description: 'At-least-once messaging subscription forwarding microservice event triggers and backend user changes.',
    icon: 'radio',
    category: 'Event Streams',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'Service Role',
    lastEventReceived: 'Just now (< 2s ago)',
    errorRatePercent: 0.01,
    dataFlowUrl: 'projects/nexus-cdp-prod/subscriptions/realtime-event-sub'
  },
  {
    id: 'src_snowflake',
    name: 'Snowflake Data Cloud (Snowpipe & Zero-ETL)',
    type: 'Batch',
    status: 'Healthy',
    ratePerSec: 0,
    todayEventCount: 1540000,
    latencyMs: 120,
    description: 'Nightly incremental ETL batch synchronizer for historical sales, financial margins, and offline loyalty data.',
    icon: 'database',
    category: 'Data Warehouses',
    targetSchemaId: 'xdm_individual_profile',
    targetSchemaName: 'XDM Individual Profile (Demographic & PII)',
    authMethod: 'Service Role',
    lastEventReceived: '20 mins ago',
    errorRatePercent: 0.00,
    dataFlowUrl: 'snowflake://enterprise.us-east-1.snowflakecomputing.com/ANALYTICS_MART'
  },
  {
    id: 'src_bigquery_dw',
    name: 'Google BigQuery Storage Read API',
    type: 'Batch',
    status: 'Healthy',
    ratePerSec: 0,
    todayEventCount: 1820000,
    latencyMs: 95,
    description: 'High-speed parallel column streaming from BigQuery customer marts directly into CDP unified profile store.',
    icon: 'database',
    category: 'Data Warehouses',
    targetSchemaId: 'xdm_individual_profile',
    targetSchemaName: 'XDM Individual Profile',
    authMethod: 'Service Role',
    lastEventReceived: '45 mins ago',
    errorRatePercent: 0.00,
    dataFlowUrl: 'bigquery://gcp-enterprise-prod:customer_360_dw.dim_users'
  },
  {
    id: 'src_databricks_delta',
    name: 'Databricks Delta Lake (Delta Live Tables)',
    type: 'Batch',
    status: 'Healthy',
    ratePerSec: 0,
    todayEventCount: 940000,
    latencyMs: 140,
    description: 'Medallion architecture Gold tier consumer table ingestion with ACID transactional consistency and versioning.',
    icon: 'database',
    category: 'Data Warehouses',
    targetSchemaId: 'xdm_individual_profile',
    targetSchemaName: 'XDM Individual Profile',
    authMethod: 'OAuth 2.0 Bearer',
    lastEventReceived: '1 hour ago',
    errorRatePercent: 0.00,
    dataFlowUrl: 'databricks://dbc-prod-east.cloud.databricks.com/tables/gold_customer_features'
  },
  {
    id: 'src_s3_bucket_ingest',
    name: 'Amazon S3 Parquet Bucket Ingestion',
    type: 'Batch',
    status: 'Healthy',
    ratePerSec: 0,
    todayEventCount: 2400000,
    latencyMs: 110,
    description: 'Automated S3 SQS event notification triggered micro-batch reader processing snappy-compressed Parquet files.',
    icon: 'layers',
    category: 'Data Warehouses',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'Service Role',
    lastEventReceived: '15 mins ago',
    errorRatePercent: 0.00,
    dataFlowUrl: 's3://enterprise-cdp-raw-ingress/hourly-parquet/'
  },
  {
    id: 'src_salesforce_crm',
    name: 'Salesforce CRM (Change Data Capture / CDC)',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 180,
    todayEventCount: 420910,
    latencyMs: 8.4,
    description: 'Bi-directional Change Data Capture (CDC) for Lead, Contact, Account, and Opportunity entities via Pub/Sub API.',
    icon: 'cloud',
    category: 'Enterprise CRM',
    targetSchemaId: 'xdm_individual_profile',
    targetSchemaName: 'XDM Individual Profile',
    authMethod: 'OAuth 2.0 Bearer',
    lastEventReceived: 'Just now (< 5s ago)',
    errorRatePercent: 0.05,
    dataFlowUrl: 'https://enterprise.my.salesforce.com/cometd/58.0/data/ChangeEvents'
  },
  {
    id: 'src_hubspot_crm',
    name: 'HubSpot CRM Webhooks & Contact Sync',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 140,
    todayEventCount: 290100,
    latencyMs: 7.2,
    description: 'Real-time subscription to contact property modifications, lifecycle stage changes, and deal creation events.',
    icon: 'cloud',
    category: 'Enterprise CRM',
    targetSchemaId: 'xdm_individual_profile',
    targetSchemaName: 'XDM Individual Profile',
    authMethod: 'OAuth 2.0 Bearer',
    lastEventReceived: 'Just now (< 8s ago)',
    errorRatePercent: 0.02,
    dataFlowUrl: 'https://api.hubapi.com/webhooks/v3/v2/app_subscriptions'
  },
  {
    id: 'src_shopify_commerce',
    name: 'Shopify Plus Storefront & Webhooks',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 320,
    todayEventCount: 780400,
    latencyMs: 6.5,
    description: 'Live order placements, checkout updates, cart abandonments, and customer refund transactions via EventBridge.',
    icon: 'store',
    category: 'Commerce & Retail',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event (Commerce & Cart)',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 2s ago)',
    errorRatePercent: 0.01,
    dataFlowUrl: 'https://shopify-ingress.nexus.io/webhooks/orders_and_carts'
  },
  {
    id: 'src_stripe_billing',
    name: 'Stripe Billing & Subscriptions',
    type: 'Webhook',
    status: 'Healthy',
    ratePerSec: 85,
    todayEventCount: 164200,
    latencyMs: 9.1,
    description: 'Signature-verified HTTPS webhooks for recurring subscriptions, invoice paid, failed charge, and dispute events.',
    icon: 'credit-card',
    category: 'Commerce & Retail',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 10s ago)',
    errorRatePercent: 0.00,
    dataFlowUrl: 'https://api.nexus.io/v1/webhooks/stripe_signature_v1'
  },
  {
    id: 'src_zendesk_support',
    name: 'Zendesk Support & Sunshine Events',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 110,
    todayEventCount: 185400,
    latencyMs: 8.8,
    description: 'Real-time ingestion of support ticket ratings (CSAT), ticket creation, escalation status, and resolution times.',
    icon: 'life-buoy',
    category: 'Enterprise CRM',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'OAuth 2.0 Bearer',
    lastEventReceived: 'Just now (< 12s ago)',
    errorRatePercent: 0.02,
    dataFlowUrl: 'https://enterprise.zendesk.com/api/v2/channels/voice/events'
  },
  {
    id: 'src_segment_router',
    name: 'Segment / RudderStack Ingestion Gateway',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 1650,
    todayEventCount: 3120000,
    latencyMs: 4.2,
    description: 'Compatibility gateway receiving legacy Analytics.js track, identify, page, and group calls converted into XDM.',
    icon: 'share-2',
    category: 'Web & Mobile',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 1s ago)',
    errorRatePercent: 0.01,
    dataFlowUrl: 'https://segment-bridge.nexus.io/v1/import'
  },
  {
    id: 'src_postgres_debezium',
    name: 'PostgreSQL / MySQL CDC (Debezium)',
    type: 'Streaming',
    status: 'Healthy',
    ratePerSec: 720,
    todayEventCount: 1420900,
    latencyMs: 5.4,
    description: 'Write-Ahead Log (WAL) replication capturing row-level transactions from core production relational databases.',
    icon: 'database',
    category: 'Data Warehouses',
    targetSchemaId: 'xdm_individual_profile',
    targetSchemaName: 'XDM Individual Profile',
    authMethod: 'mTLS / Kafka SASL',
    lastEventReceived: 'Just now (< 3s ago)',
    errorRatePercent: 0.01,
    dataFlowUrl: 'postgres://cdp_cdc_user:***@db-primary.prod.internal:5432/core_db'
  },
  {
    id: 'src_pos_terminals',
    name: 'Brick & Mortar POS Terminals',
    type: 'Webhook',
    status: 'Healthy',
    ratePerSec: 95,
    todayEventCount: 149200,
    latencyMs: 14.1,
    description: 'Real-time retail register receipt & loyalty barcode scanning integration across 450 physical retail branches.',
    icon: 'store',
    category: 'Commerce & Retail',
    targetSchemaId: 'xdm_experience_event',
    targetSchemaName: 'XDM Experience Event',
    authMethod: 'API Secret / Web SDK Tag',
    lastEventReceived: 'Just now (< 15s ago)',
    errorRatePercent: 0.03,
    dataFlowUrl: 'https://pos-gateway.nexus.io/v1/receipt_events'
  }
];

export const INITIAL_SYNC_LOGS: DestinationSyncLog[] = [
  {
    id: 'log_sync_001',
    timestamp: '2026-08-19T13:25:00Z',
    destinationId: 'dest_meta_ads',
    destinationName: 'Meta Custom Audiences',
    audienceId: 'aud_high_value_abandoners',
    audienceName: 'High-Value Cart Abandoners',
    profilesAttempted: 3,
    profilesSynced: 3,
    profilesBlockedPrivacy: 0,
    sensitiveFieldsRedacted: 3,
    status: 'Success',
    details: [
      'Validated 3 profiles against Meta Ad Policy',
      'Masked and redacted sensitive field: ssnLast4',
      'Successfully pushed 3 SHA-256 hashed email identifiers to Meta Graph API v19.0'
    ]
  },
  {
    id: 'log_sync_002',
    timestamp: '2026-08-19T13:10:00Z',
    destinationId: 'dest_google_ads',
    destinationName: 'Google Customer Match',
    audienceId: 'aud_privacy_opted_out',
    audienceName: 'GDPR / CCPA Suppressed Profiles',
    profilesAttempted: 1,
    profilesSynced: 0,
    profilesBlockedPrivacy: 1,
    sensitiveFieldsRedacted: 1,
    status: 'Completed with Blocks',
    details: [
      'DULE Policy Enforcement: Profile prof_71z_5521 has CCPA Opt-Out = true and GDPR Consent = false',
      'BLOCKED 1 profile from sync to Google Customer Match to comply with user privacy preference',
      'Sync finished: 0 pushed, 1 blocked'
    ]
  }
];

export const INITIAL_TERMINAL_LOGS: LiveTerminalLog[] = [
  {
    id: 'tl_1',
    timestamp: '13:32:41',
    level: 'info',
    tag: 'INGEST',
    message: 'RECV EVENT from Web SDK (endpoint /v1/events/collect)',
    meta: { channel: 'Web SDK', eventType: 'AddToCart', bytes: 482 }
  },
  {
    id: 'tl_2',
    timestamp: '13:32:41',
    level: 'info',
    tag: 'SCHEMA',
    message: 'Mapped raw JSON keys -> WebInteractionEvent_v1 (100% match)',
  },
  {
    id: 'tl_3',
    timestamp: '13:32:42',
    level: 'success',
    tag: 'STITCH',
    message: 'Identity resolved: matched cookieId cid_982b_alpha_44 -> prof_89x_2910',
    meta: { confidence: '1.0 (Deterministic)', profile: 'Elena Rostova' }
  },
  {
    id: 'tl_4',
    timestamp: '13:32:42',
    level: 'ai',
    tag: 'AI-MODEL',
    message: 'Recalculated Predictive Churn: 14% [Low] | LTV: $8,500.00',
  },
  {
    id: 'tl_5',
    timestamp: '13:32:43',
    level: 'success',
    tag: 'SEGMENT',
    message: 'Audience evaluated: entered "High-Value Cart Abandoners" (Count: 3)',
  },
  {
    id: 'tl_6',
    timestamp: '13:32:43',
    level: 'info',
    tag: 'JOURNEY',
    message: 'Advanced journey "Real-Time Abandoned Cart Recovery Loop" -> Step 1',
  }
];

export const SAMPLE_PRESET_PAYLOADS = [
  {
    name: 'Anonymous Browsing -> Add to Cart',
    description: 'Simulates a new or returning visitor with cookieId adding a product to cart.',
    source: 'src_web_sdk',
    channel: 'Web SDK' as const,
    schemaId: 'schema_web_sdk_v1',
    rawJson: JSON.stringify({
      anon_cookie_id: 'cid_anon_temp_5104',
      event_name: 'AddToCart',
      page_location: 'https://store.enterprise.com/hardware/cloud-rack',
      sku: 'CLOUD-SERVER-RACK-8X',
      unit_price: 1299.00,
      qty: 1,
      device_browser: 'Chrome 128 / macOS',
      client_ip: '73.189.24.11'
    }, null, 2)
  },
  {
    name: 'Identity Stitching Login Event (Cookie + Email Match)',
    description: 'Deterministic Stitching: Links anonymous cookieId "cid_anon_temp_5104" to registered user "sofia.tanaka@designstudios.jp".',
    source: 'src_web_sdk',
    channel: 'Web SDK' as const,
    schemaId: 'schema_web_sdk_v1',
    rawJson: JSON.stringify({
      anon_cookie_id: 'cid_anon_temp_5104',
      customer_email: 'sofia.tanaka@designstudios.jp',
      event_name: 'FormSubmit',
      form_type: 'Account Login & Session Auth',
      page_location: 'https://store.enterprise.com/auth/login',
      device_browser: 'Safari Mobile / iOS 18',
      auth_timestamp: new Date().toISOString()
    }, null, 2)
  },
  {
    name: 'High-Value E-Commerce Purchase (POS / Web)',
    description: 'Increases customer lifetime spend, recalculates predictive LTV and upgrades VIP status.',
    source: 'src_pos_terminals',
    channel: 'POS Terminal' as const,
    schemaId: 'schema_purchase_v1',
    rawJson: JSON.stringify({
      customer_email: 'elena.rostova@techenterprise.com',
      contact_phone: '+14158829012',
      transaction_id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      total_amount: 2450.00,
      purchased_skus: ['ENTERPRISE-SWITCH-48P', 'FIBER-TRANSCEIVER-100G'],
      pos_location_code: 'STORE-SF-01'
    }, null, 2)
  },
  {
    name: 'High Churn Risk Signal (Cancellation / Negative Survey)',
    description: 'Fires high-risk churn telemetry that pushes predictive churn risk > 85% and triggers retention journey.',
    source: 'src_salesforce_crm',
    channel: 'Salesforce CRM' as const,
    schemaId: 'schema_web_sdk_v1',
    rawJson: JSON.stringify({
      customer_email: 'marcus.vance@vancemedia.io',
      event_name: 'SupportTicket',
      ticket_category: 'Subscription Cancellation Intent',
      sentiment_score: -0.85,
      nps_rating: 2,
      account_risk_flag: true
    }, null, 2)
  },
  {
    name: 'GDPR / CCPA Privacy Consent Revocation',
    description: 'Simulates a user revoking 3rd-party ad sharing consent in Preference Center. System immediately blocks activation.',
    source: 'src_web_sdk',
    channel: 'Web SDK' as const,
    schemaId: 'schema_profile_v1',
    rawJson: JSON.stringify({
      customer_email: 'elena.rostova@techenterprise.com',
      event_name: 'ConsentUpdate',
      gdpr_opt_in: true,
      ccpa_opt_out: true,
      marketing_email_opt_in: false,
      third_party_ad_sharing: false,
      consent_framework: 'IAB TCF v2.2'
    }, null, 2)
  }
];

// ========================================================
// XLR8 RT-CDP B2B Edition Seed Data
// ========================================================
export const INITIAL_B2B_ACCOUNTS: B2BAccountProfile[] = [
  {
    id: 'acc_acme_corp',
    accountName: 'Acme Cloud Technologies',
    domain: 'techenterprise.com',
    industry: 'Enterprise Cloud Infrastructure',
    naicsCode: '541512 - Computer Systems Design',
    annualRevenue: 485000000,
    employeeCount: 3400,
    accountTier: 'Strategic VIP',
    region: 'North America (West)',
    headquarters: 'San Francisco, CA',
    intentScore: 94,
    healthScore: 88,
    totalPipelineValue: 420000,
    matchedLeadCount: 14,
    lastEngagedAt: '2026-08-19T11:20:00Z',
    techStack: ['AWS', 'Kubernetes', 'Snowflake', 'Salesforce CRM', 'XLR8 Platform', 'Terraform'],
    buyingGroup: [
      {
        personId: 'c_prof_1',
        fullName: 'Elena Rostova',
        email: 'elena.rostova@techenterprise.com',
        role: 'Decision Maker',
        jobTitle: 'VP of Platform Engineering',
        engagementScore: 95,
        lastActive: '2026-08-19T10:45:00Z',
        leadScore: 92
      },
      {
        personId: 'c_prof_b2b_1',
        fullName: 'David K. Vance',
        email: 'david.vance@techenterprise.com',
        role: 'Economic Buyer',
        jobTitle: 'Chief Information Officer (CIO)',
        engagementScore: 82,
        lastActive: '2026-08-18T16:00:00Z',
        leadScore: 88
      },
      {
        personId: 'c_prof_b2b_2',
        fullName: 'Aria Montgomery',
        email: 'aria.m@techenterprise.com',
        role: 'Champion',
        jobTitle: 'Lead Cloud Architect',
        engagementScore: 98,
        lastActive: '2026-08-19T09:15:00Z',
        leadScore: 96
      },
      {
        personId: 'c_prof_b2b_3',
        fullName: 'Tomás Morales',
        email: 'tomas.m@techenterprise.com',
        role: 'Technical Evaluator',
        jobTitle: 'Principal Security Specialist',
        engagementScore: 74,
        lastActive: '2026-08-17T14:30:00Z',
        leadScore: 78
      }
    ],
    opportunities: [
      {
        id: 'opp_acme_q3_expansion',
        name: 'Enterprise Tier Multi-Region Cloud Expansion',
        amount: 280000,
        stage: 'Procurement',
        probability: 90,
        expectedCloseDate: '2026-09-30',
        ownerName: 'Rachel Thorne'
      },
      {
        id: 'opp_acme_security_addon',
        name: 'Edge WAF & Zero Trust Security Add-on',
        amount: 140000,
        stage: 'Proposal',
        probability: 70,
        expectedCloseDate: '2026-10-15',
        ownerName: 'Rachel Thorne'
      }
    ]
  },
  {
    id: 'acc_vance_media',
    accountName: 'Vance Digital Media Global',
    domain: 'vancemedia.io',
    industry: 'Broadcasting & Streaming Tech',
    naicsCode: '515210 - Cable & Pay TV',
    annualRevenue: 120000000,
    employeeCount: 890,
    accountTier: 'Enterprise',
    region: 'North America (East)',
    headquarters: 'New York, NY',
    intentScore: 42,
    healthScore: 35, // High Churn Risk!
    totalPipelineValue: 95000,
    matchedLeadCount: 6,
    lastEngagedAt: '2026-08-19T08:15:00Z',
    techStack: ['GCP', 'Fastly CDN', 'Salesforce Marketing Cloud', 'Segment', 'BigQuery'],
    buyingGroup: [
      {
        personId: 'c_prof_2',
        fullName: 'Marcus Vance',
        email: 'marcus.vance@vancemedia.io',
        role: 'Economic Buyer',
        jobTitle: 'Director of Growth Marketing',
        engagementScore: 38,
        lastActive: '2026-08-19T08:15:00Z',
        leadScore: 45
      },
      {
        personId: 'c_prof_b2b_4',
        fullName: 'Chloe Lin',
        email: 'chloe.lin@vancemedia.io',
        role: 'Decision Maker',
        jobTitle: 'VP of Digital Operations',
        engagementScore: 45,
        lastActive: '2026-08-15T11:00:00Z',
        leadScore: 50
      }
    ],
    opportunities: [
      {
        id: 'opp_vance_renewal_risk',
        name: 'Annual Streaming License Renewal (At-Risk)',
        amount: 95000,
        stage: 'Solution Validation',
        probability: 35,
        expectedCloseDate: '2026-09-15',
        ownerName: 'Liam Gallagher'
      }
    ]
  },
  {
    id: 'acc_tokyo_design',
    accountName: 'Tanaka Global Creative Studios',
    domain: 'designstudios.jp',
    industry: 'Industrial & Interactive Design',
    naicsCode: '541430 - Graphic Design',
    annualRevenue: 65000000,
    employeeCount: 420,
    accountTier: 'Mid-Market',
    region: 'Asia Pacific (Japan)',
    headquarters: 'Minato-ku, Tokyo, Japan',
    intentScore: 89,
    healthScore: 94,
    totalPipelineValue: 180000,
    matchedLeadCount: 9,
    lastEngagedAt: '2026-08-19T13:40:00Z',
    techStack: ['Figma', 'AWS Tokyo', 'Creative Cloud Suite', 'Shopify Plus', 'Stripe'],
    buyingGroup: [
      {
        personId: 'c_prof_3',
        fullName: 'Sofia Tanaka',
        email: 'sofia.tanaka@designstudios.jp',
        role: 'Champion',
        jobTitle: 'VP of Creative Technology',
        engagementScore: 96,
        lastActive: '2026-08-19T13:40:00Z',
        leadScore: 94
      },
      {
        personId: 'c_prof_b2b_5',
        fullName: 'Kenji Sato',
        email: 'kenji.sato@designstudios.jp',
        role: 'Decision Maker',
        jobTitle: 'Managing Partner & Co-Founder',
        engagementScore: 85,
        lastActive: '2026-08-19T12:00:00Z',
        leadScore: 89
      }
    ],
    opportunities: [
      {
        id: 'opp_tokyo_apac_expansion',
        name: 'APAC Design Ops Cluster Expansion',
        amount: 180000,
        stage: 'Proposal',
        probability: 80,
        expectedCloseDate: '2026-11-01',
        ownerName: 'Kenichi Takahashi'
      }
    ]
  },
  {
    id: 'acc_novastream_fintech',
    accountName: 'NovaStream Financial Services',
    domain: 'novastream.bank',
    industry: 'Financial Technology & Banking',
    naicsCode: '522110 - Commercial Banking',
    annualRevenue: 920000000,
    employeeCount: 5600,
    accountTier: 'Strategic VIP',
    region: 'North America & EMEA',
    headquarters: 'Charlotte, NC & London, UK',
    intentScore: 96,
    healthScore: 92,
    totalPipelineValue: 650000,
    matchedLeadCount: 22,
    lastEngagedAt: '2026-08-19T12:15:00Z',
    techStack: ['Azure Banking Cloud', 'MuleSoft', 'Salesforce Financial Services', 'Kafka', 'Databricks'],
    buyingGroup: [
      {
        personId: 'c_prof_b2b_6',
        fullName: 'Alexander Sterling',
        email: 'a.sterling@novastream.bank',
        role: 'Decision Maker',
        jobTitle: 'EVP of Digital Banking',
        engagementScore: 91,
        lastActive: '2026-08-19T12:15:00Z',
        leadScore: 95
      },
      {
        personId: 'c_prof_b2b_7',
        fullName: 'Beatriz Da Silva',
        email: 'b.dasilva@novastream.bank',
        role: 'Technical Evaluator',
        jobTitle: 'Head of Regulatory Compliance & DULE',
        engagementScore: 88,
        lastActive: '2026-08-18T15:30:00Z',
        leadScore: 86
      }
    ],
    opportunities: [
      {
        id: 'opp_novastream_core_cdp',
        name: 'Enterprise RT-CDP Banking Rollout',
        amount: 650000,
        stage: 'Procurement',
        probability: 95,
        expectedCloseDate: '2026-09-15',
        ownerName: 'Rachel Thorne'
      }
    ]
  }
];

// ========================================================
// Data Distiller / SQL Query Service Seed Data
// ========================================================
export const INITIAL_QUERY_TEMPLATES: QueryTemplate[] = [
  {
    id: 'tmpl_rfm_scoring',
    name: 'Customer RFM Segmentation & Quartile Analysis',
    category: 'RFM Scoring',
    description: 'Calculates Recency, Frequency, and Monetary (RFM) composite score across unified XDM profiles.',
    sql: `-- Data Distiller: RFM Customer Quartile Computation
SELECT 
  p.id AS profile_id,
  p.unifiedName AS customer_name,
  p.attributes.totalSpend AS monetary_value,
  p.attributes.purchaseCount AS frequency_count,
  DATEDIFF(day, p.attributes.lastPurchaseDate, CURRENT_TIMESTAMP()) AS recency_days,
  NTILE(4) OVER (ORDER BY p.attributes.totalSpend DESC) AS monetary_quartile,
  CASE 
    WHEN p.attributes.totalSpend > 5000 AND p.attributes.purchaseCount >= 5 THEN 'Champions (VIP)'
    WHEN p.attributes.totalSpend > 2000 AND p.predictions.churnRisk < 30 THEN 'Loyal Potential'
    WHEN p.predictions.churnRisk > 70 THEN 'At-Risk High Spender'
    ELSE 'Regular Shopper'
  END AS rfm_segment
FROM xdm_individual_profile p
WHERE p.consent.thirdPartySharingConsent = true
ORDER BY monetary_value DESC
LIMIT 50;`
  },
  {
    id: 'tmpl_cross_channel_attribution',
    name: 'Multi-Touch First/Last Channel Attribution Pathing',
    category: 'Attribution',
    description: 'Traces the event chain preceding a conversion purchase across Web SDK, POS, and Mobile channels.',
    sql: `-- Data Distiller: Multi-Touch Attribution Journey Path
SELECT 
  e.identifiers.email AS customer_email,
  COUNT(DISTINCT e.channel) AS unique_channels_touched,
  FIRST_VALUE(e.channel) OVER (PARTITION BY e.schemaId ORDER BY e.timestamp ASC) AS first_touch_channel,
  LAST_VALUE(e.channel) OVER (PARTITION BY e.schemaId ORDER BY e.timestamp ASC) AS last_touch_channel,
  SUM(CASE WHEN e.eventType = 'Purchase' THEN CAST(e.payload.total_amount AS DOUBLE) ELSE 0 END) AS attributed_revenue
FROM xdm_experience_events e
GROUP BY e.identifiers.email, e.schemaId, e.channel, e.timestamp, e.eventType, e.payload.total_amount
HAVING attributed_revenue > 0
ORDER BY attributed_revenue DESC;`
  },
  {
    id: 'tmpl_b2b_buying_intent',
    name: 'B2B Account Buying Group Intent Surge',
    category: 'B2B Insights',
    description: 'Aggregates contact level activity by B2B account domain to calculate 7-day intent surge score.',
    sql: `-- Data Distiller: B2B Account Engagement & Intent Surge
SELECT 
  acc.accountName,
  acc.domain,
  acc.accountTier,
  COUNT(DISTINCT bg.personId) AS active_buying_group_contacts,
  AVG(bg.engagementScore) AS average_contact_engagement,
  acc.intentScore AS third_party_intent_surge,
  acc.totalPipelineValue AS pipeline_at_stake
FROM xdm_b2b_accounts acc
JOIN xdm_b2b_buying_group bg ON acc.id = bg.accountId
WHERE acc.healthScore >= 50
GROUP BY acc.accountName, acc.domain, acc.accountTier, acc.intentScore, acc.totalPipelineValue
ORDER BY acc.intentScore DESC;`
  },
  {
    id: 'tmpl_privacy_audit_hygiene',
    name: 'Privacy DULE Compliance & Consent Opt-Out Audit',
    category: 'Data Hygiene',
    description: 'Audits profiles with revoked CCPA/GDPR consent and checks ad network destination suppression.',
    sql: `-- Data Distiller: Privacy DULE Opt-Out & Suppression Audit
SELECT 
  p.id AS profile_id,
  p.primaryEmail,
  p.consent.ccpaOptOut AS ccpa_opted_out,
  p.consent.thirdPartySharingConsent AS ad_sharing_allowed,
  p.consent.consentSource,
  p.consent.lastUpdated AS consent_timestamp
FROM xdm_individual_profile p
WHERE p.consent.ccpaOptOut = true 
   OR p.consent.thirdPartySharingConsent = false
ORDER BY p.consent.lastUpdated DESC;`
  }
];

export const INITIAL_QUERIES: DataDistillerQuery[] = [
  {
    id: 'query_1',
    name: 'High-Value Customer RFM Distribution',
    sql: INITIAL_QUERY_TEMPLATES[0].sql,
    lastRunAt: '2026-08-19T13:48:12Z',
    status: 'SUCCESS',
    executionTimeMs: 42,
    rowsScanned: 1250000,
    bytesProcessed: '34.8 MB',
    columns: ['profile_id', 'customer_name', 'monetary_value', 'frequency_count', 'recency_days', 'monetary_quartile', 'rfm_segment'],
    resultRows: [
      { profile_id: 'c_prof_1', customer_name: 'Elena Rostova', monetary_value: '$12,450.00', frequency_count: 14, recency_days: 2, monetary_quartile: 1, rfm_segment: 'Champions (VIP)' },
      { profile_id: 'c_prof_4', customer_name: 'Dr. Evelyn Reed', monetary_value: '$8,250.00', frequency_count: 9, recency_days: 4, monetary_quartile: 1, rfm_segment: 'Champions (VIP)' },
      { profile_id: 'c_prof_3', customer_name: 'Sofia Tanaka', monetary_value: '$4,120.00', frequency_count: 6, recency_days: 1, monetary_quartile: 2, rfm_segment: 'Loyal Potential' },
      { profile_id: 'c_prof_2', customer_name: 'Marcus Vance', monetary_value: '$1,890.00', frequency_count: 3, recency_days: 18, monetary_quartile: 3, rfm_segment: 'At-Risk High Spender' },
      { profile_id: 'c_prof_5', customer_name: 'Lucas Bennett', monetary_value: '$450.00', frequency_count: 2, recency_days: 12, monetary_quartile: 4, rfm_segment: 'Regular Shopper' }
    ]
  }
];

// ========================================================
// Calculated Attributes Seed Data
// ========================================================
export const INITIAL_CALCULATED_ATTRIBUTES: CalculatedAttributeDefinition[] = [
  {
    id: 'ca_30d_spend',
    name: 'rolling_30d_total_spend',
    displayName: '30-Day Rolling Purchase Volume',
    description: 'Real-time rolling sum of all completed purchase amounts in the past 30 days.',
    dataType: 'number',
    category: 'Spend',
    targetSchema: 'IndividualProfile',
    aggregationType: 'SUM',
    sourceEvent: 'Purchase',
    sourceField: 'payload.total_amount',
    lookbackDays: 30,
    status: 'Active',
    lastEvaluated: '2026-08-19T13:50:00Z',
    sampleValueFormula: 'SUM(e.payload.total_amount WHERE e.timestamp >= NOW() - 30d)'
  },
  {
    id: 'ca_web_visit_recency',
    name: 'days_since_last_web_visit',
    displayName: 'Days Since Last Web Interaction',
    description: 'Elapsed calendar days since the most recent Web SDK pageview or form submit event.',
    dataType: 'number',
    category: 'Recency',
    targetSchema: 'IndividualProfile',
    aggregationType: 'DAYS_SINCE',
    sourceEvent: 'PageView',
    sourceField: 'timestamp',
    lookbackDays: 90,
    status: 'Active',
    lastEvaluated: '2026-08-19T13:50:00Z',
    sampleValueFormula: 'DATEDIFF(day, MAX(e.timestamp), NOW())'
  },
  {
    id: 'ca_fav_product_cat',
    name: 'most_frequent_browse_category',
    displayName: 'Preferred Product Category (60-Day)',
    description: 'Statistical mode category of all viewed and added products over the past 60 days.',
    dataType: 'string',
    category: 'Engagement',
    targetSchema: 'IndividualProfile',
    aggregationType: 'MOST_FREQUENT',
    sourceEvent: 'ProductView',
    sourceField: 'payload.product_category',
    lookbackDays: 60,
    status: 'Active',
    lastEvaluated: '2026-08-19T13:50:00Z',
    sampleValueFormula: 'MODE(e.payload.product_category)'
  },
  {
    id: 'ca_b2b_intent_surge',
    name: 'account_composite_intent_surge',
    displayName: 'B2B Account Weekly Engagement Index',
    description: 'Sum of all web, docs, and pricing page visits across all matched contacts in the account domain.',
    dataType: 'number',
    category: 'B2B Surge',
    targetSchema: 'B2BAccountProfile',
    aggregationType: 'COUNT',
    sourceEvent: 'PageView',
    sourceField: 'id',
    lookbackDays: 7,
    status: 'Active',
    lastEvaluated: '2026-08-19T13:50:00Z',
    sampleValueFormula: 'COUNT(events WHERE contact.domain == account.domain)'
  }
];

// ========================================================
// Privacy Rights Management / DSAR Seed Data
// ========================================================
export const INITIAL_DSAR_REQUESTS: PrivacyDsarRequest[] = [
  {
    id: 'dsar_1',
    requestId: 'DSAR-2026-0812-001',
    requestType: 'ACCESS_EXPORT',
    subjectIdentifierType: 'email',
    subjectIdentifierValue: 'elena.rostova@techenterprise.com',
    regulation: 'GDPR (EU)',
    status: 'COMPLETED',
    submittedAt: '2026-08-12T09:30:00Z',
    completedAt: '2026-08-12T09:30:45Z',
    daysRemaining: 23,
    matchedProfileCount: 1,
    erasedNodesCount: 0,
    complianceCertHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    notes: 'Generated 360 profile archive JSON package with SHA-256 integrity seal.'
  },
  {
    id: 'dsar_2',
    requestId: 'DSAR-2026-0815-042',
    requestType: 'OPT_OUT_SALE',
    subjectIdentifierType: 'cookie',
    subjectIdentifierValue: 'cid_anon_temp_5104',
    regulation: 'CCPA / CPRA (California)',
    status: 'COMPLETED',
    submittedAt: '2026-08-15T14:15:00Z',
    completedAt: '2026-08-15T14:15:02Z',
    daysRemaining: 41,
    matchedProfileCount: 1,
    erasedNodesCount: 0,
    complianceCertHash: 'a8830869a08e1a6136d8f8ccabf1064d4b1f6305a2e584f23b20757f51b6ad7b',
    notes: 'Real-time DULE suppression flag applied to ad-network destination connectors.'
  },
  {
    id: 'dsar_3',
    requestId: 'DSAR-2026-0818-099',
    requestType: 'DELETE_FORGET',
    subjectIdentifierType: 'email',
    subjectIdentifierValue: 'test.user.forget@example.com',
    regulation: 'GDPR (EU)',
    status: 'COMPLETED',
    submittedAt: '2026-08-18T17:00:00Z',
    completedAt: '2026-08-18T17:00:15Z',
    daysRemaining: 29,
    matchedProfileCount: 1,
    erasedNodesCount: 4,
    complianceCertHash: 'c74f5195e4e466336e84be49f50f28dc3d178e2eb0e5b7fb5c88b0a9aa8a1562',
    notes: 'Cryptographically erased 4 identity graph links, PII attributes, and associated experience events.'
  }
];

// ========================================================
// Dynamic Offers for Edge Personalization Seed Data
// ========================================================
export const INITIAL_DYNAMIC_OFFERS: DynamicOffer[] = [
  {
    id: 'offer_vip_concierge',
    title: 'VIP Concierge & Diamond Upgrade',
    headline: 'Welcome Back, Esteemed Executive',
    subhead: 'Enjoy your bespoke Platinum tier benefits, private consultation channel, and 25% enterprise credit.',
    ctaText: 'Access VIP Concierge Suite',
    ctaLink: '/enterprise/vip-suite',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    badge: 'VIP Recognition',
    discountPercentage: 25,
    promoCode: 'PLATINUM-VIP-25',
    targetAudienceIds: ['aud_high_ltv_vip'],
    priority: 1,
    placement: 'Home Hero Banner'
  },
  {
    id: 'offer_retention_loyalty',
    title: 'High-Value Customer Win-Back Guarantee',
    headline: 'We Care About Your Experience',
    subhead: 'Get direct priority 24/7 dedicated support and a complimentary 2-month platform credit on us.',
    ctaText: 'Claim $150 Service Credit',
    ctaLink: '/support/priority-retention',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    badge: 'Priority Care',
    discountPercentage: 30,
    promoCode: 'CARE-RETENTION-150',
    targetAudienceIds: ['aud_churn_risk'],
    priority: 2,
    placement: 'Exit Intent Modal'
  },
  {
    id: 'offer_b2b_cloud_bundle',
    title: 'Enterprise Multi-Region Cloud Accelerate',
    headline: 'Scale Your Distributed Tech Stack',
    subhead: 'Accelerate container deployments with native Flink streaming and dedicated isolated clusters.',
    ctaText: 'Schedule Architect Demo',
    ctaLink: '/b2b/cloud-demo',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    badge: 'Enterprise Surge',
    targetAudienceIds: ['aud_engaged_mobile', 'aud_high_ltv_vip'],
    priority: 3,
    placement: 'Home Hero Banner'
  },
  {
    id: 'offer_standard_welcome',
    title: 'Real-Time Customer 360 Starter Kit',
    headline: 'Supercharge Your Customer Experience',
    subhead: 'Discover the power of real-time identity stitching and millisecond edge personalization.',
    ctaText: 'Explore Interactive Tour',
    ctaLink: '/tour',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    badge: 'Standard Placement',
    targetAudienceIds: [],
    priority: 99,
    placement: 'Home Hero Banner'
  }
];

// ========================================================
// Sensei AI Lookalike Models & Clean Room Seed Data
// ========================================================
export const INITIAL_LOOKALIKES: LookalikeModelConfig[] = [
  {
    id: 'lal_high_ltv_lookalike',
    name: 'Sensei Lookalike: High LTV VIP Customers (Top 1%)',
    seedAudienceId: 'aud_high_ltv_vip',
    seedAudienceName: 'High-LTV Enterprise VIPs ($5k+)',
    expansionRatio: 1, // 1%
    projectedAudienceSize: 840000,
    similarityScore: 96,
    status: 'Deployed',
    lastTrained: '2026-08-18T22:00:00Z',
    targetDestinations: ['Meta Custom Audiences', 'Google Customer Match', 'LinkedIn Ads B2B'],
    topInfluencingFeatures: [
      { feature: 'Rolling 30-Day Spend ($)', importance: 0.38 },
      { feature: 'Enterprise Tech Stack Match', importance: 0.26 },
      { feature: 'Average Order Value (AOV)', importance: 0.19 },
      { feature: 'High Engagement Session Velocity', importance: 0.17 }
    ]
  },
  {
    id: 'lal_churn_recovery',
    name: 'Lookalike: Resilient Retention Candidates',
    seedAudienceId: 'aud_churn_risk',
    seedAudienceName: 'Predictive Churn Hazard (>70%)',
    expansionRatio: 3,
    projectedAudienceSize: 2150000,
    similarityScore: 88,
    status: 'Trained',
    lastTrained: '2026-08-17T18:30:00Z',
    targetDestinations: ['Meta Custom Audiences', 'Klaviyo VIP Push'],
    topInfluencingFeatures: [
      { feature: 'Support Ticket Interaction Frequency', importance: 0.42 },
      { feature: 'Days Since Last Active Session', importance: 0.31 },
      { feature: 'Price Sensitivity Metric', importance: 0.27 }
    ]
  }
];

export const INITIAL_CLEAN_ROOM_QUERIES: CleanRoomQuery[] = [
  {
    id: 'crq_retail_media_coop',
    name: 'Retail Media Network Overlap & Incrementality',
    partnerName: 'OmniMedia Retail Network',
    partnerDataset: 'omni_retail_pos_loyalty_2026',
    differentialPrivacyEpsilon: 0.5,
    minOverlapThreshold: 100,
    resultOverlapCount: 384500,
    matchRatePercentage: 74.2,
    status: 'Completed',
    executedAt: '2026-08-19T10:30:00Z',
    querySummary: 'Differential Privacy noise injection applied (ε=0.5). Verified no raw PII disclosed. Computed joint ROAS: 4.8x across omni-channel cohort.'
  },
  {
    id: 'crq_fintech_cross_ad',
    name: 'FinTech Credit Affinity Co-Op Analysis',
    partnerName: 'Global Financial Data Alliance',
    partnerDataset: 'fin_alliance_verified_affluence',
    differentialPrivacyEpsilon: 0.25,
    minOverlapThreshold: 250,
    resultOverlapCount: 192000,
    matchRatePercentage: 62.8,
    status: 'Completed',
    executedAt: '2026-08-18T14:15:00Z',
    querySummary: 'Differential Privacy noise injection applied (ε=0.25). Filtered down to accredited accounts with zero PII exposure.'
  }
];

// ========================================================
// Sandboxes & Merge Policies Seed Data
// ========================================================
export const INITIAL_SANDBOXES: SandboxDefinition[] = [
  {
    id: 'sb_production',
    name: 'Production (Live Traffic)',
    type: 'Production',
    region: 'us-east-1 (N. Virginia)',
    profileCount: 14850200,
    datasetCount: 38,
    status: 'Active',
    isDefault: true
  },
  {
    id: 'sb_b2b_staging',
    name: 'B2B Enterprise Staging',
    type: 'Staging',
    region: 'us-west-2 (Oregon)',
    profileCount: 240500,
    datasetCount: 14,
    status: 'Active'
  },
  {
    id: 'sb_gdpr_eu',
    name: 'Marketing-Sandbox-EU (Strict DULE)',
    type: 'Development',
    region: 'eu-west-1 (Ireland)',
    profileCount: 950000,
    datasetCount: 19,
    status: 'Active'
  },
  {
    id: 'sb_dev_alloy',
    name: 'Dev-Testing & Alloy Web SDK',
    type: 'Sandbox',
    region: 'us-east-1 (N. Virginia)',
    profileCount: 45000,
    datasetCount: 8,
    status: 'Active'
  }
];

export const INITIAL_MERGE_POLICIES: MergePolicy[] = [
  {
    id: 'mp_default_timestamp',
    name: 'Timestamp Most-Recent Wins (Default)',
    isDefault: true,
    graphAlgorithm: 'Deterministic Link',
    attributePrecedence: 'Timestamp (Most Recent Wins)',
    identityDatasetOrder: ['Salesforce CRM Profile', 'Web SDK Ingestion', 'POS Store Transaction', 'Mobile SDK Event'],
    crossDeviceEnabled: true
  },
  {
    id: 'mp_crm_authoritative',
    name: 'CRM-Authoritative Precedence (Strict B2B)',
    isDefault: false,
    graphAlgorithm: 'Deterministic Link',
    attributePrecedence: 'Dataset Hierarchy (CRM > Web > POS)',
    identityDatasetOrder: ['Salesforce CRM Profile', 'POS Store Transaction', 'Web SDK Ingestion'],
    crossDeviceEnabled: false
  },
  {
    id: 'mp_probabilistic_coop',
    name: 'Deterministic + Probabilistic Identity Graph (>=85% Conf)',
    isDefault: false,
    graphAlgorithm: 'Deterministic + Probabilistic (Confidence >= 85%)',
    attributePrecedence: 'Timestamp (Most Recent Wins)',
    identityDatasetOrder: ['Web SDK Ingestion', 'Mobile SDK Event', 'Salesforce CRM Profile'],
    crossDeviceEnabled: true
  }
];

export const INITIAL_WAREHOUSE_CONNECTIONS: WarehouseConnection[] = [
  {
    id: 'wh_snowflake_prod',
    name: 'Snowflake Enterprise Data Cloud',
    type: 'Snowflake',
    accountOrHost: 'xy12345.us-east-1.snowflakecomputing.com',
    database: 'ENTERPRISE_DW',
    schema: 'ANALYTICS_MARTS',
    warehouseSize: 'X-SMALL (Multi-Cluster Auto-Suspend)',
    status: 'Connected',
    tablesCount: 24,
    lastPingMs: 42,
    zeroCopyEnabled: true,
    syncedAt: '2026-08-20T11:30:00Z',
    iconName: 'snowflake',
    availableTables: [
      {
        tableName: 'FACT_HISTORICAL_ORDERS',
        rowCount: 4520000,
        description: 'Complete 5-year offline and online transaction history with SKU lines, gross margin, and discount codes.',
        columns: [
          { name: 'CUSTOMER_CRM_ID', type: 'VARCHAR(64)', isJoinKey: true, description: 'Primary Salesforce/HubSpot CRM identifier' },
          { name: 'ORDER_ID', type: 'VARCHAR(32)', description: 'Unique transaction identifier' },
          { name: 'ORDER_TIMESTAMP', type: 'TIMESTAMP_NTZ', description: 'Order completion UTC timestamp' },
          { name: 'NET_REVENUE', type: 'NUMBER(12,2)', description: 'Net order revenue after promo discounts' },
          { name: 'PRODUCT_CATEGORY', type: 'VARCHAR(64)', description: 'Top purchased category (Enterprise, Cloud, Hardware)' },
          { name: 'PAYMENT_METHOD', type: 'VARCHAR(32)', description: 'Invoice, Credit Card, ACH' }
        ]
      },
      {
        tableName: 'DIM_CUSTOMER_LTV_MODELS',
        rowCount: 850000,
        description: 'Pre-computed ML feature store with historical 12-month spend, predicted margin, and churn index.',
        columns: [
          { name: 'EMAIL_HASH_SHA256', type: 'VARCHAR(64)', isJoinKey: true, description: 'Hashed customer primary email' },
          { name: 'HISTORICAL_LIFETIME_VALUE', type: 'FLOAT', description: 'Total accumulated spend across all business units' },
          { name: 'RECENCY_DAYS', type: 'INTEGER', description: 'Days elapsed since last registered transaction' },
          { name: 'MARGIN_TIER', type: 'VARCHAR(16)', description: 'Tier A (>60%), Tier B (40-60%), Tier C (<40%)' },
          { name: 'ACCOUNT_CREDIT_LIMIT', type: 'NUMBER(10,0)', description: 'Commercial line of credit' }
        ]
      },
      {
        tableName: 'B2B_CONTRACT_SUBSCRIPTIONS',
        rowCount: 125000,
        description: 'Active SaaS contract renewals, seat utilization, ARR, and contractual SLA terms.',
        columns: [
          { name: 'ACCOUNT_DOMAIN', type: 'VARCHAR(128)', isJoinKey: true, description: 'Corporate internet domain e.g. acme.com' },
          { name: 'ANNUAL_RECURRING_REVENUE', type: 'NUMBER(12,2)', description: 'Active contracted ARR in USD' },
          { name: 'RENEWAL_DATE', type: 'DATE', description: 'Upcoming contract expiration date' },
          { name: 'LICENSED_SEATS', type: 'INTEGER', description: 'Total purchased enterprise user seats' },
          { name: 'UTILIZATION_PCT', type: 'FLOAT', description: '30-day active seat utilization rate' }
        ]
      }
    ]
  },
  {
    id: 'wh_databricks_unity',
    name: 'Databricks Unity Catalog & Lakehouse',
    type: 'Databricks',
    accountOrHost: 'adb-849204128.12.azuredatabricks.net',
    database: 'gold_customer_lakehouse',
    schema: 'marketing_features',
    warehouseSize: 'Serverless SQL Medium (Delta Sharing)',
    status: 'Connected',
    tablesCount: 18,
    lastPingMs: 65,
    zeroCopyEnabled: true,
    syncedAt: '2026-08-20T11:15:00Z',
    iconName: 'databricks',
    availableTables: [
      {
        tableName: 'delta_churn_propensity_scores',
        rowCount: 1200000,
        description: 'XGBoost churn risk predictions computed daily on Apache Spark clusters.',
        columns: [
          { name: 'crm_contact_id', type: 'STRING', isJoinKey: true, description: 'CRM individual contact key' },
          { name: 'churn_risk_score', type: 'DOUBLE', description: 'Probability of subscription cancellation (0.00 to 1.00)' },
          { name: 'top_churn_factor', type: 'STRING', description: 'Primary predictive signal (e.g. Inactivity, Support Tickets)' },
          { name: 'scoring_date', type: 'DATE', description: 'Date model inference executed' }
        ]
      },
      {
        tableName: 'delta_app_telemetry_aggregates',
        rowCount: 8900000,
        description: 'Aggregated 90-day feature usage counters from mobile and desktop applications.',
        columns: [
          { name: 'device_advertising_id', type: 'STRING', isJoinKey: true, description: 'IDFA or GAID anonymized token' },
          { name: 'total_sessions_last_30d', type: 'INT', description: 'Active application launch count' },
          { name: 'premium_feature_clicks', type: 'INT', description: 'Interactions with paywalled capabilities' },
          { name: 'avg_session_duration_sec', type: 'DOUBLE', description: 'Average session engagement duration' }
        ]
      }
    ]
  },
  {
    id: 'wh_bigquery_gcp',
    name: 'Google BigQuery Enterprise Mart',
    type: 'BigQuery',
    accountOrHost: 'gcp-cdp-analytics-prod.bigquery.googleapis.com',
    database: 'enterprise_bi_mart',
    schema: 'customer_analytics',
    warehouseSize: 'On-Demand (Zero-Copy Google Storage)',
    status: 'Connected',
    tablesCount: 31,
    lastPingMs: 38,
    zeroCopyEnabled: true,
    syncedAt: '2026-08-20T10:45:00Z',
    iconName: 'google',
    availableTables: [
      {
        tableName: 'ga4_ecommerce_conversions',
        rowCount: 3400000,
        description: 'Raw web & mobile conversion funnels directly synced from Google Analytics 4 BigQuery export.',
        columns: [
          { name: 'user_pseudo_id', type: 'STRING', isJoinKey: true, description: 'GA4 Client Cookie ID' },
          { name: 'transaction_id', type: 'STRING', description: 'E-commerce unique purchase ID' },
          { name: 'purchase_revenue_usd', type: 'NUMERIC', description: 'Gross cart checkout value' },
          { name: 'traffic_campaign', type: 'STRING', description: 'UTM Campaign acquisition source' }
        ]
      }
    ]
  },
  {
    id: 'wh_aws_redshift',
    name: 'AWS Redshift Serverless Cluster',
    type: 'AWS Redshift',
    accountOrHost: 'redshift-cluster-1.c4f82.us-east-1.redshift.amazonaws.com:5439',
    database: 'finance_dw',
    schema: 'public',
    warehouseSize: '128 RPU Auto-Scaling',
    status: 'Connected',
    tablesCount: 15,
    lastPingMs: 51,
    zeroCopyEnabled: true,
    syncedAt: '2026-08-20T09:20:00Z',
    iconName: 'aws',
    availableTables: [
      {
        tableName: 'erp_invoice_ledger',
        rowCount: 2100000,
        description: 'SAP/NetSuite general ledger records including overdue payments and credit memos.',
        columns: [
          { name: 'customer_tax_id', type: 'VARCHAR(32)', isJoinKey: true, description: 'Business tax registration code' },
          { name: 'invoice_status', type: 'VARCHAR(16)', description: 'Paid, Overdue, Disputed, Pending' },
          { name: 'outstanding_balance', type: 'DECIMAL(12,2)', description: 'Unpaid invoice balance' }
        ]
      }
    ]
  }
];

export const INITIAL_FEDERATED_COMPOSITIONS: FederatedComposition[] = [
  {
    id: 'comp_vip_high_ltv_churn_risk',
    name: 'Zero-Copy: VIP High-LTV Accounts at Risk of Churn',
    description: 'Enrich real-time CDP abandoned cart profiles with Snowflake 5-year historical spend (> $10,000) and Databricks AI churn risk (> 0.70) without moving raw tables.',
    warehouseId: 'wh_snowflake_prod',
    warehouseName: 'Snowflake Enterprise Data Cloud',
    warehouseType: 'Snowflake',
    status: 'Active',
    estimatedAudienceSize: 4280,
    zeroCopyCostSavings: '$4,280/mo (Bypassed 1.2TB Ingestion Overhead)',
    lastRunTimestamp: '2026-08-20T11:00:00Z',
    schedule: 'Continuous Zero-Copy',
    targetDestinations: ['dest_salesforce', 'dest_meta_ads', 'dest_braze'],
    pushdownSql: `SELECT 
    p.profile_id,
    p.email,
    p.first_name,
    p.last_name,
    wh.HISTORICAL_LIFETIME_VALUE,
    wh.MARGIN_TIER,
    ml.churn_risk_score
FROM CDP_REALTIME_PROFILES p
JOIN ENTERPRISE_DW.ANALYTICS_MARTS.DIM_CUSTOMER_LTV_MODELS wh
    ON p.email_hash = wh.EMAIL_HASH_SHA256
JOIN delta_churn_propensity_scores ml
    ON p.crm_id = ml.crm_contact_id
WHERE wh.HISTORICAL_LIFETIME_VALUE >= 10000
  AND ml.churn_risk_score >= 0.70
  AND p.has_abandoned_cart_last_7d = TRUE;`,
    nodes: [
      {
        id: 'node_1',
        type: 'cdp_audience',
        title: 'CDP Stream: Cart Abandoners (7d)',
        description: 'Real-time streaming profiles with active carts not converted in 7 days.',
        config: { audienceId: 'aud_high_value_abandoners' },
        outputCount: 14200,
        status: 'Ready'
      },
      {
        id: 'node_2',
        type: 'warehouse_source',
        title: 'Snowflake: DIM_CUSTOMER_LTV_MODELS',
        description: 'Direct zero-copy connection to 5-year Enterprise spend history.',
        config: { warehouseId: 'wh_snowflake_prod', tableName: 'DIM_CUSTOMER_LTV_MODELS' },
        outputCount: 850000,
        status: 'Ready'
      },
      {
        id: 'node_3',
        type: 'join_enrich',
        title: 'Zero-Copy Join on Email SHA-256',
        description: 'Pushdown inner join executed in Snowflake compute cluster without moving data.',
        config: { joinKeyWarehouse: 'EMAIL_HASH_SHA256', joinKeyCDP: 'identifiers.email' },
        outputCount: 8920,
        status: 'Ready'
      },
      {
        id: 'node_4',
        type: 'filter',
        title: 'Filter: LTV >= $10,000 & Margin Tier A',
        description: 'Keep high-margin enterprise accounts with significant lifetime revenue.',
        config: { filterExpression: 'HISTORICAL_LIFETIME_VALUE >= 10000 AND MARGIN_TIER = "Tier A"' },
        outputCount: 4280,
        status: 'Ready'
      },
      {
        id: 'node_5',
        type: 'destination_sync',
        title: 'Reverse ETL: Salesforce & Meta CAPI',
        description: 'Real-time push sync to Salesforce High-Priority Queue and Meta Ad Retargeting.',
        config: { destinationId: 'dest_salesforce', syncCadence: 'Real-time Push' },
        outputCount: 4280,
        status: 'Ready'
      }
    ]
  },
  {
    id: 'comp_b2b_saas_renewal_pipeline',
    name: 'Zero-Copy: Upcoming Enterprise Renewals with Low Seat Usage',
    description: 'Federate Snowflake B2B Contract ARR with Databricks 30-day telemetry app usage to trigger proactive Customer Success interventions.',
    warehouseId: 'wh_snowflake_prod',
    warehouseName: 'Snowflake Enterprise Data Cloud',
    warehouseType: 'Snowflake',
    status: 'Active',
    estimatedAudienceSize: 1850,
    zeroCopyCostSavings: '$1,850/mo (Zero ETL Ingress Fee)',
    lastRunTimestamp: '2026-08-20T10:30:00Z',
    schedule: 'Every 1 Hour',
    targetDestinations: ['dest_salesforce', 'dest_slack_webhook'],
    pushdownSql: `SELECT 
    b2b.account_id,
    b2b.account_name,
    sub.ANNUAL_RECURRING_REVENUE,
    sub.RENEWAL_DATE,
    sub.UTILIZATION_PCT
FROM CDP_B2B_ACCOUNTS b2b
JOIN ENTERPRISE_DW.ANALYTICS_MARTS.B2B_CONTRACT_SUBSCRIPTIONS sub
    ON b2b.domain = sub.ACCOUNT_DOMAIN
WHERE sub.ANNUAL_RECURRING_REVENUE >= 50000
  AND sub.UTILIZATION_PCT < 0.40
  AND sub.RENEWAL_DATE <= CURRENT_DATE + INTERVAL '90 DAYS';`,
    nodes: [
      {
        id: 'node_b1',
        type: 'warehouse_source',
        title: 'Snowflake: B2B_CONTRACT_SUBSCRIPTIONS',
        description: 'Contract ARR, expiration dates, and licensed enterprise seats.',
        config: { warehouseId: 'wh_snowflake_prod', tableName: 'B2B_CONTRACT_SUBSCRIPTIONS' },
        outputCount: 125000,
        status: 'Ready'
      },
      {
        id: 'node_b2',
        type: 'filter',
        title: 'Filter: ARR >= $50k & Utilization < 40%',
        description: 'Identify accounts nearing renewal with dangerously low adoption.',
        config: { filterExpression: 'ANNUAL_RECURRING_REVENUE >= 50000 AND UTILIZATION_PCT < 0.40' },
        outputCount: 1850,
        status: 'Ready'
      },
      {
        id: 'node_b3',
        type: 'destination_sync',
        title: 'Reverse ETL: Salesforce CSM Renewal Alert',
        description: 'Creates priority CS intervention tasks in Salesforce CRM.',
        config: { destinationId: 'dest_salesforce', syncCadence: 'Hourly' },
        outputCount: 1850,
        status: 'Ready'
      }
    ]
  }
];

// =========================================================================
// AGENTIC AI COPILOT & AUTONOMOUS ANOMALIES SEED DATA
// =========================================================================
export const INITIAL_AGENT_PROMPTS: AgentPromptSession[] = [
  {
    id: 'agent_session_1',
    prompt: 'Find all Enterprise accounts in EMEA with high churn risk (>65%) that have not logged in for 14 days and visited our cancellation FAQ',
    timestamp: '2026-08-20T11:42:00Z',
    category: 'Audience Segmentation',
    generatedAudienceName: 'AI_EMEA_High_Risk_Churn_Intervention',
    generatedPql: `SELECT profile_id, b2b_account.id, attributes.email 
FROM xdm_individual_profile 
WHERE b2b_account.region = 'EMEA' 
  AND predictions.churnRisk > 0.65 
  AND event.eventType = 'PageView' 
  AND event.pagePath LIKE '%/support/cancel-faq%'
  AND DATEDIFF(day, lastActiveAt, CURRENT_TIMESTAMP()) >= 14`,
    generatedSql: `SELECT 
    p.id AS profile_id,
    p.primary_email,
    b.account_name,
    p.predictions_churn_risk,
    MAX(e.timestamp) AS last_active_ts
FROM profiles p
JOIN b2b_accounts b ON p.b2b_account_id = b.id
JOIN experience_events e ON e.profile_id = p.id
WHERE b.region = 'EMEA'
  AND p.predictions_churn_risk > 0.65
  AND e.page_url LIKE '%/cancel-faq%'
GROUP BY p.id, p.primary_email, b.account_name, p.predictions_churn_risk
HAVING DATEDIFF('day', MAX(e.timestamp), CURRENT_TIMESTAMP()) >= 14;`,
    estimatedProfiles: 1840,
    confidenceScore: 0.96,
    reasoningChain: [
      'Identified primary entities: Individual Profile joined with B2B Account Master.',
      'Extracted filter criteria: region == EMEA, ML churnRisk score >= 65%.',
      'Applied behavioral condition: PageView event matches /cancel-faq with inactivity delta >= 14 days.',
      'Verified DULE Data Governance: No Restricted Health/Financial labels violated. C1 Contractual consent validated.',
      'Assigned optimized activation destinations: Salesforce High-Priority Queue & Braze Emergency Nudge.'
    ],
    duleComplianceStatus: 'Passed (No Violations)',
    recommendedDestinations: ['dest_salesforce', 'dest_braze', 'dest_slack_webhook'],
    executionTimeMs: 142
  },
  {
    id: 'agent_session_2',
    prompt: 'Target high-LTV customers who abandoned carts with values over $250 in the last 48 hours, enriched with Snowflake Lifetime Order history',
    timestamp: '2026-08-20T10:15:00Z',
    category: 'Zero-Copy Query',
    generatedAudienceName: 'AI_High_Value_Cart_Recovery_Snowflake',
    generatedPql: `SELECT p.profile_id, p.email, p.attributes.firstName, e.cartTotal 
FROM xdm_individual_profile p
JOIN ENTERPRISE_DW.ANALYTICS.LTV_MARTS dw ON p.email = dw.CUSTOMER_EMAIL
WHERE e.eventType = 'AddToCart' 
  AND e.cartTotal >= 250 
  AND NOT EXISTS (SELECT 1 FROM events e2 WHERE e2.eventType = 'Purchase' AND e2.timestamp > e.timestamp)
  AND dw.HISTORICAL_LTV >= 5000`,
    generatedSql: `SELECT 
    p.id,
    p.primary_email,
    p.first_name,
    wh.TOTAL_REVENUE AS dw_historical_ltv,
    e.cart_value
FROM real_time_profiles p
JOIN ENTERPRISE_DW.PUBLIC.CUSTOMER_MASTER_VIEW wh ON p.primary_email = wh.ACCOUNT_ID
JOIN LATERAL (
    SELECT payload_cart_value as cart_value 
    FROM events 
    WHERE profile_id = p.id AND event_type = 'AddToCart' AND timestamp >= NOW() - INTERVAL '48 HOURS'
    ORDER BY timestamp DESC LIMIT 1
) e ON TRUE
WHERE e.cart_value >= 250
  AND wh.TOTAL_REVENUE >= 5000;`,
    estimatedProfiles: 4210,
    confidenceScore: 0.98,
    reasoningChain: [
      'Triggered Zero-Copy Federation pushdown to Snowflake ENTERPRISE_DW.',
      'Constructed deterministic join on primary_email <-> ACCOUNT_ID without moving warehouse tables.',
      'Evaluated Cart Abandonment logic with 48h recency window and exclusion of subsequent purchases.',
      'DULE Label check: Masked email for advertising downstream (Meta CAPI / Google Ads). Passed GDPR marketing consent.'
    ],
    duleComplianceStatus: 'Passed (No Violations)',
    recommendedDestinations: ['dest_meta_ads', 'dest_google_ads', 'dest_braze'],
    executionTimeMs: 118
  },
  {
    id: 'agent_session_3',
    prompt: 'Audit all audience segments exporting sensitive PII identifiers (SSN, Phone, Health) without explicit opt-in consent',
    timestamp: '2026-08-20T09:30:00Z',
    category: 'Privacy Audit',
    generatedAudienceName: 'AI_Governance_DULE_Violation_Watchlist',
    generatedPql: `SELECT segment_id, export_destination, field_name, dule_label 
FROM cdp_governance_catalog 
WHERE dule_label IN ('S1', 'S2', 'I2') 
  AND destination_type = 'Third-Party Ad Network'
  AND consent_verified = FALSE`,
    generatedSql: `SELECT 
    s.id AS audience_id,
    s.name AS audience_name,
    f.name AS sensitive_field,
    f.privacy_labels,
    d.name AS destination_name
FROM audiences s
JOIN audience_fields f ON f.audience_id = s.id
JOIN audience_destinations ad ON ad.audience_id = s.id
JOIN destinations d ON d.id = ad.destination_id
WHERE f.is_sensitive = TRUE
  AND d.category = 'Advertising Network';`,
    estimatedProfiles: 0,
    confidenceScore: 0.99,
    reasoningChain: [
      'Audited active DULE policy engine: Rule R_NO_SENSITIVE_TO_ADS active.',
      'Verified all 6 active audience definitions against field sensitivity tags.',
      '0 active policy breaches found. 12 fields are protected with automatic SHA-256 client-side masking.'
    ],
    duleComplianceStatus: 'Passed (No Violations)',
    recommendedDestinations: ['dest_salesforce'],
    executionTimeMs: 95
  }
];

export const INITIAL_ANOMALIES: AnomalyAlert[] = [
  {
    id: 'anom_1',
    title: 'Meta CAPI Match Rate Degradation (-18.4%)',
    category: 'Destination Sync',
    severity: 'Critical',
    detectedAt: '2026-08-20T11:20:00Z',
    impactMetric: '18.4% drop in ad conversion attribution',
    affectedEntities: 'Meta Conversions API (CAPI) Destination Connector',
    rootCause: 'Payload payload.email was dispatched as raw plaintext without required SHA-256 lowercase hashing for 2,400 checkout events.',
    autoFixActionName: 'Enable Automated Pre-Flight SHA-256 Normalization & Retrigger Batch',
    status: 'Active'
  },
  {
    id: 'anom_2',
    title: 'Identity Graph Orphan Profile Spike (+420 Profiles)',
    category: 'Identity Stitching',
    severity: 'Warning',
    detectedAt: '2026-08-20T10:45:00Z',
    impactMetric: '420 fragmented anonymous visitor IDs',
    affectedEntities: 'Web SDK Ingestion Stream (Safari ITP / iOS 17)',
    rootCause: 'Safari ITP 7-day cookie expiration caused duplicate ECID creation for recurring returning shoppers.',
    autoFixActionName: 'Apply Probabilistic IP+Device ML Linker (Confidence >= 82%)',
    status: 'Active'
  },
  {
    id: 'anom_3',
    title: 'Schema Payload Drift: Unexpected Field "promo_v2_code"',
    category: 'Data Drift',
    severity: 'Informational',
    detectedAt: '2026-08-20T08:10:00Z',
    impactMetric: '1,120 raw Kafka events routed to partial ingestion buffer',
    affectedEntities: 'XDM ExperienceEvent: Purchase Event',
    rootCause: 'Frontend release v4.18 added promo_v2_code to cart checkout payload without schema definition update.',
    autoFixActionName: 'Auto-Evolve XDM Schema & Map "promo_v2_code" to String Attribute',
    status: 'Active'
  },
  {
    id: 'anom_4',
    title: 'Snowflake Zero-Copy Token Expiration Near SLA',
    category: 'Warehouse Federation',
    severity: 'Informational',
    detectedAt: '2026-08-20T07:00:00Z',
    impactMetric: 'Latency jitter on federated audience pushdown queries',
    affectedEntities: 'Snowflake Production Analytics (US-EAST-1)',
    rootCause: 'OAuth refresh token approaching 24h rotation boundary.',
    autoFixActionName: 'Auto-Renew Cloud RSA Keypair & Re-probe Zero-Copy Access',
    status: 'Auto-Healed',
    resolutionTimestamp: '2026-08-20T07:02:14Z'
  }
];

export const INITIAL_CAMPAIGN_VARIANTS: CampaignVariant[] = [
  {
    id: 'var_1',
    label: 'Variant A: Urgency + VIP Tier Value',
    subjectLine: 'Exclusive for VIPs: Your $250 reward balance is expiring in 24 hours',
    messageHook: 'Hi {{firstName}}, as a valued Platinum member, your customized upgrade benefits are waiting for activation.',
    callToAction: 'Claim VIP Upgrade Now',
    targetAudience: 'High-Value VIPs & Cart Abandoners',
    predictedOpenRate: '48.2%',
    predictedConversionRate: '14.6%',
    predictedUplift: '+28.4% vs Baseline',
    recommendedChannel: 'Email'
  },
  {
    id: 'var_2',
    label: 'Variant B: Churn Prevention & Executive Concierge',
    subjectLine: 'How can we help? Dedicated Enterprise support for your team',
    messageHook: 'We noticed your team adoption in {{b2b_account.name}} dropped this month. Let our Principal Architect walk you through our new automation features.',
    callToAction: 'Book 15-Min Strategy Session',
    targetAudience: 'Enterprise At-Risk EMEA Accounts',
    predictedOpenRate: '54.1%',
    predictedConversionRate: '18.9%',
    predictedUplift: '+34.2% vs Baseline',
    recommendedChannel: 'Email'
  },
  {
    id: 'var_3',
    label: 'Variant C: Instant SMS Mobile Flash Nudge',
    subjectLine: '⚡ Nexus Alert: Items in your cart are selling fast',
    messageHook: 'Hey {{firstName}}, complete your order in the next 30 mins to get Free Same-Day Priority Delivery!',
    callToAction: 'Complete Order (1-Tap Apple Pay)',
    targetAudience: 'Mobile App Engaged Shoppers',
    predictedOpenRate: '88.5%',
    predictedConversionRate: '22.3%',
    predictedUplift: '+41.0% vs Baseline',
    recommendedChannel: 'SMS'
  }
];

// =========================================================================
// ENTERPRISE AUDIT TRAIL SEED DATA
// =========================================================================
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_log_101',
    timestamp: '2026-08-20T12:02:15Z',
    userId: 'usr_sec_marcus@nexus.enterprise.io',
    userName: 'Marcus Vance',
    userRole: 'SecOps Engineer',
    category: 'Administrative Action',
    action: 'Rotate API Secret & TLS Ingestion Certificate',
    targetEntity: 'ing_web_sdk_source (Production Web Stream)',
    status: 'SUCCESS',
    ipAddress: '192.241.142.88',
    client: 'NEXUS Security Console v4.2',
    summary: 'Rotated Web SDK edge ingestion symmetric auth token following 90-day rotation SLA policy.',
    details: {
      before: 'Token: ****************c89a (Created: 2026-05-22)',
      after: 'Token: ****************7f41 (Exp: 2026-11-20)',
      jsonPayload: {
        rotationReason: 'Quarterly Security SLA Cycle',
        invalidationWindowMinutes: 15,
        tlsProtocol: 'TLS 1.3 Strict',
        ciphersEnforced: ['TLS_AES_256_GCM_SHA384']
      }
    },
    complianceFlags: ['SOC2 Type II', 'ISO 27001 - A.10.1', 'NIST SP 800-57']
  },
  {
    id: 'audit_log_102',
    timestamp: '2026-08-20T11:48:30Z',
    userId: 'usr_dpo_sophia@privacy.nexus.io',
    userName: 'Sophia Laurent',
    userRole: 'Data Protection Officer (DPO)',
    category: 'Privacy & Consent',
    action: 'DSAR Right-to-be-Forgotten Execution',
    targetEntity: 'DSAR-2026-8849 (Subject: elena.rostova@acme.de)',
    status: 'SUCCESS',
    ipAddress: '10.240.4.19',
    client: 'NEXUS Privacy Service Portal',
    summary: 'Hard deleted 18 profile nodes, graph identity edges, and associated purchase event rows in accordance with GDPR Art. 17.',
    details: {
      before: 'Graph nodes: 18, Linked Identifiers: [Email, Phone, ECID, Salesforce Lead ID]',
      after: 'Graph nodes: 0, Tombstone Cryptographic Proof generated and archived.',
      jsonPayload: {
        regulation: 'GDPR (EU) Art. 17',
        erasureHash: 'sha256:4f88c89de02b78a9c1e345512bcf39a0081e8',
        cascadedDownstreams: ['dest_salesforce', 'dest_meta_ads', 'dest_snowflake_lake']
      }
    },
    complianceFlags: ['GDPR Art. 17', 'CCPA/CPRA Sec 1798.105', 'ePrivacy Directive']
  },
  {
    id: 'audit_log_103',
    timestamp: '2026-08-20T11:25:10Z',
    userId: 'usr_arch_chen@nexus.enterprise.io',
    userName: 'Dr. Arthur Chen',
    userRole: 'Data Architect',
    category: 'Schema & Ingestion',
    action: 'XDM Schema Evolution & Field Descriptor Addition',
    targetEntity: 'xdm_experience_event (Commerce Purchase Event)',
    status: 'SUCCESS',
    ipAddress: '172.56.21.90',
    client: 'NEXUS Schema Designer Web UI',
    summary: 'Added nullable field "promo_v2_code" (type: String, DULE Label: C1 Contractual) to Commerce Purchase Event XDM schema.',
    details: {
      before: 'Schema version: 1.4.0 (38 attributes, 4 mixins)',
      after: 'Schema version: 1.5.0 (39 attributes, 4 mixins, non-breaking forward compatible)',
      jsonPayload: {
        addedFieldPath: 'commerce.purchases.promo_v2_code',
        dataType: 'string',
        isNullable: true,
        dulePrivacyLabel: 'C1 - Contractual Marketing Data',
        encryptionAtRest: 'AES-256'
      }
    },
    complianceFlags: ['XDM 2026 Specification', 'Enterprise Schema Change Control']
  },
  {
    id: 'audit_log_104',
    timestamp: '2026-08-20T10:55:00Z',
    userId: 'usr_dpo_sophia@privacy.nexus.io',
    userName: 'Sophia Laurent',
    userRole: 'Data Protection Officer (DPO)',
    category: 'Privacy & Consent',
    action: 'Consumer Consent String Update: Global CCPA Opt-Out',
    targetEntity: 'Profile: usr_prof_9941 (j.doe.california@gmail.com)',
    status: 'SUCCESS',
    ipAddress: '198.51.100.44',
    client: 'OneTrust Universal Consent Webhook API',
    summary: 'Received OneTrust consent signal: consumer opted out of 3rd-party ad sales and profiling. Downstream ad syncs automatically suppressed.',
    details: {
      before: 'Consent: { gdprMarketing: true, ccpaSaleOptOut: false, shareToAdPartners: true }',
      after: 'Consent: { gdprMarketing: true, ccpaSaleOptOut: true, shareToAdPartners: false }',
      jsonPayload: {
        signalSource: 'OneTrust CMP Webhook #OT-99381',
        gpcHeaderDetected: true,
        enforcedDestinationsSuppressed: ['dest_meta_ads', 'dest_google_ads', 'dest_tiktok_capi']
      }
    },
    complianceFlags: ['CCPA/CPRA Opt-Out Mandate', 'Global Privacy Control (GPC)', 'DULE Policy R_NO_SALE']
  },
  {
    id: 'audit_log_105',
    timestamp: '2026-08-20T10:14:40Z',
    userId: 'usr_admin_elena@nexus.enterprise.io',
    userName: 'Elena Rostova',
    userRole: 'Super Admin',
    category: 'Administrative Action',
    action: 'Modify Sandbox Role-Based Access (RBAC)',
    targetEntity: 'Sandbox: "sandbox_emea_prod" (Production EMEA)',
    status: 'SUCCESS',
    ipAddress: '194.105.140.12',
    client: 'NEXUS Administrative IAM Portal',
    summary: 'Granted "Audience Publisher & Reverse ETL Admin" permission group to Marketing Operations team in EMEA Production sandbox.',
    details: {
      before: 'Assigned Roles: [Sandbox Viewer, Segment Drafter]',
      after: 'Assigned Roles: [Sandbox Viewer, Segment Drafter, Audience Publisher, Reverse ETL Operator]',
      jsonPayload: {
        targetUserGroup: 'EMEA Marketing Ops (12 members)',
        approvalTicketId: 'SEC-IT-4890',
        approvedBy: 'Marcus Vance (SecOps)'
      }
    },
    complianceFlags: ['SOC2 Principle of Least Privilege', 'ISO 27001 Access Control']
  },
  {
    id: 'audit_log_106',
    timestamp: '2026-08-20T09:32:18Z',
    userId: 'system_autonomous_sentinel',
    userName: 'Autonomous Drift Sentinel Agent',
    userRole: 'Automation Agent',
    category: 'Identity Graph',
    action: 'Self-Healing Identity Stitching Rule Applied',
    targetEntity: 'Identity Graph Linker Engine (ECID <-> Phone Linkage)',
    status: 'SUCCESS',
    ipAddress: '10.240.0.8',
    client: 'Autonomous Sentinel Background Daemon',
    summary: 'Applied probabilistic ML device graph linker for 420 fragmented Safari ITP cookie IDs exceeding 82% confidence threshold.',
    details: {
      before: 'Fragmented orphan nodes: 420 profiles',
      after: 'Merged unified clusters: 184 consolidated profile graphs',
      jsonPayload: {
        algorithm: 'Probabilistic IP-Subnet + UserAgent Entropy Classifier',
        confidenceCutoff: 0.82,
        falsePositiveEstimate: '< 0.04%'
      }
    },
    complianceFlags: ['Automated Data Quality SLA', 'Real-Time Graph Optimization']
  },
  {
    id: 'audit_log_107',
    timestamp: '2026-08-20T08:45:00Z',
    userId: 'usr_arch_chen@nexus.enterprise.io',
    userName: 'Dr. Arthur Chen',
    userRole: 'Data Architect',
    category: 'Audience & Activation',
    action: 'Zero-Copy Federated Pushdown Pipeline Authorized',
    targetEntity: 'Snowflake Enterprise DW (Warehouse: ANALYTICS_WH_L)',
    status: 'SUCCESS',
    ipAddress: '172.56.21.90',
    client: 'NEXUS Federated Composition Engine',
    summary: 'Authorized read-only zero-copy pushdown federated query targeting ENTERPRISE_DW.PUBLIC.CUSTOMER_360_VIEW.',
    details: {
      before: 'Federated Links: 2 active (BigQuery, Databricks)',
      after: 'Federated Links: 3 active (Snowflake added with RSA Keypair auth)',
      jsonPayload: {
        warehouseType: 'Snowflake Enterprise',
        roleUsed: 'CDP_FEDERATED_RO_ROLE',
        dataEgressPreventedGB: '1.4 TB / month'
      }
    },
    complianceFlags: ['SOC2 Data In-Place Security', 'Zero Data Duplication Standard']
  },
  {
    id: 'audit_log_108',
    timestamp: '2026-08-20T07:15:22Z',
    userId: 'usr_auditor_hansen@deloitte.com',
    userName: 'Lukas Hansen',
    userRole: 'Compliance Auditor',
    category: 'Privacy & Consent',
    action: 'Quarterly DULE Privacy & Data Lineage Audit Export',
    targetEntity: 'Global Privacy Catalog & Consent Registries',
    status: 'SUCCESS',
    ipAddress: '62.216.4.11',
    client: 'NEXUS Compliance Auditor Read-Only Sandbox',
    summary: 'Exported cryptographic tamper-evident audit report covering all 6 active audience egress destinations and 12 sensitive field tags.',
    details: {
      before: 'Last audit: 2026-05-18 (Status: Certified Compliant)',
      after: 'Current audit: 2026-08-20 (Status: Certified Compliant, 0 Breaches)',
      jsonPayload: {
        reportFormat: 'PDF/A + JSON-LD Signed Ledger',
        signatureKey: 'RSA-4096-NEXUS-AUDIT-ROOT',
        checkedRegulations: ['GDPR Art. 30', 'CCPA/CPRA', 'HIPAA Safe Harbor']
      }
    },
    complianceFlags: ['GDPR Article 30 Records of Processing', 'SOC2 Trust Services Criteria']
  },
  {
    id: 'audit_log_109',
    timestamp: '2026-08-20T06:30:00Z',
    userId: 'usr_sec_marcus@nexus.enterprise.io',
    userName: 'Marcus Vance',
    userRole: 'SecOps Engineer',
    category: 'Security & Auth',
    action: 'Enforce Mandatory IP Allowlisting & SAML 2.0 MFA',
    targetEntity: 'Admin IAM Organization Policy',
    status: 'SUCCESS',
    ipAddress: '192.241.142.88',
    client: 'NEXUS Security Policy Engine',
    summary: 'Enforced CIDR range restrictions for administrative UI and strict FIDO2 WebAuthn for Data Architect and Admin roles.',
    details: {
      before: 'Allowed Auth: Password + SMS OTP / SAML',
      after: 'Allowed Auth: Okta SAML 2.0 with Hardware Token (FIDO2) + IP VPN CIDR Gate',
      jsonPayload: {
        enforcedRoles: ['Super Admin', 'Data Architect', 'SecOps Engineer'],
        cidrRangesAllowed: ['192.241.142.0/24', '10.240.0.0/16', '194.105.140.0/24']
      }
    },
    complianceFlags: ['NIST 800-63B AAL3', 'CISA Zero Trust Maturity Model']
  },
  {
    id: 'audit_log_110',
    timestamp: '2026-08-19T22:10:05Z',
    userId: 'system_streaming_engine',
    userName: 'Real-Time Edge Streaming Engine',
    userRole: 'Automation Agent',
    category: 'Schema & Ingestion',
    action: 'Automated Dead-Letter Queue (DLQ) Drainage & Ingestion',
    targetEntity: 'Kafka Ingestion Topic: "rt_experience_events_v2"',
    status: 'SUCCESS',
    ipAddress: '10.240.2.14',
    client: 'NEXUS Pipeline Stream Worker',
    summary: 'Successfully replayed 1,420 buffered events from DLQ after schema evolution was deployed to edge edge validation proxies.',
    details: {
      before: 'DLQ Backlog: 1,420 messages (Hold reason: unrecognized attribute promo_v2_code)',
      after: 'DLQ Backlog: 0 messages (100% ingested into real-time unified profile store)',
      jsonPayload: {
        replayedBatchCount: 1420,
        averageProcessingLatencyMs: 4.8,
        validationErrors: 0
      }
    },
    complianceFlags: ['Zero Event Loss Guarantee', 'Enterprise Ingestion SLA']
  }
];

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'dataset_web_sdk_events',
    name: 'Web SDK Online Interaction Events',
    description: 'Real-time behavioral clickstream events, page views, product cart additions, and checkout steps captured through the XLR8 Web SDK and Edge Network.',
    schemaId: 'xdm_experience_event',
    schemaName: 'XDM ExperienceEvent (Digital Interaction)',
    sourceConnectorId: 'src_web_sdk',
    sourceConnectorName: 'XLR8 Web SDK & Edge Gateway',
    ingestionType: 'Streaming',
    format: 'JSON',
    recordCount: 1482000,
    sizeBytes: 5175705600,
    sizeFormatted: '4.82 GB',
    status: 'Active',
    isProfileEnabled: true,
    labels: ['C1', 'C4', 'I2'],
    fieldLabels: {
      'web.webPageDetails.URL': ['C5'],
      'commerce.order.priceTotal': ['S4'],
      'endUserIDs._experience.mcid': ['I2']
    },
    createdAt: '2026-08-01T09:00:00Z',
    lastIngestedAt: '2026-08-20T10:14:22Z',
    tags: ['Web SDK', 'Streaming', 'Clickstream', 'Real-Time Edge']
  },
  {
    id: 'dataset_crm_master_profiles',
    name: 'Enterprise CRM Customer Master Profiles',
    description: 'Authoritative customer master records containing authenticated contact details, loyalty status, address, and account lifecycle stages synced from Salesforce CRM.',
    schemaId: 'xdm_individual_profile',
    schemaName: 'XDM Individual Profile (Customer 360)',
    sourceConnectorId: 'src_salesforce_crm',
    sourceConnectorName: 'Salesforce CRM Connector',
    ingestionType: 'Batch',
    format: 'Parquet',
    recordCount: 842100,
    sizeBytes: 1342177280,
    sizeFormatted: '1.25 GB',
    status: 'Active',
    isProfileEnabled: true,
    labels: ['I1', 'C2', 'S4'],
    fieldLabels: {
      'personalEmail.address': ['I1'],
      'mobilePhone.number': ['I1'],
      'paymentProfile.accountNumber': ['S4']
    },
    createdAt: '2026-08-02T11:30:00Z',
    lastIngestedAt: '2026-08-20T06:00:00Z',
    tags: ['CRM', 'Batch', 'Individual Profile', 'Deterministic PII']
  },
  {
    id: 'dataset_mobile_telemetry',
    name: 'Mobile App Engagement & Geolocation Telemetry',
    description: 'High-frequency mobile application event stream including screen views, in-app push clicks, background beacons, and device hardware attributes.',
    schemaId: 'xdm_mobile_experience_event',
    schemaName: 'Mobile Application Event Schema',
    sourceConnectorId: 'src_mobile_sdk',
    sourceConnectorName: 'iOS & Android Edge SDK',
    ingestionType: 'Streaming',
    format: 'JSON',
    recordCount: 920400,
    sizeBytes: 2298478592,
    sizeFormatted: '2.14 GB',
    status: 'Active',
    isProfileEnabled: true,
    labels: ['C4', 'C5', 'I2', 'S1'],
    fieldLabels: {
      'placeContext.geo.point': ['S1'],
      'application.launch': ['C4'],
      'device.advertiserId': ['I2']
    },
    createdAt: '2026-08-05T14:15:00Z',
    lastIngestedAt: '2026-08-20T10:12:05Z',
    tags: ['Mobile', 'iOS', 'Android', 'Location S1', 'Streaming']
  },
  {
    id: 'dataset_pos_offline_orders',
    name: 'Point-of-Sale (POS) In-Store Transactions',
    description: 'Omnichannel physical retail store checkout transactions, scanned barcodes, payment tender tokens, and cashier register receipts.',
    schemaId: 'xdm_commerce_experience_event',
    schemaName: 'Commerce Order & Transaction Schema',
    sourceConnectorId: 'src_pos_ncr',
    sourceConnectorName: 'NCR / Square POS Retail Connector',
    ingestionType: 'Batch',
    format: 'Parquet',
    recordCount: 412800,
    sizeBytes: 933232640,
    sizeFormatted: '890 MB',
    status: 'Active',
    isProfileEnabled: true,
    labels: ['I1', 'S4', 'C1'],
    fieldLabels: {
      'paymentTender.token': ['S4'],
      'customer.loyaltyId': ['I2']
    },
    createdAt: '2026-08-08T08:00:00Z',
    lastIngestedAt: '2026-08-19T23:45:00Z',
    tags: ['POS', 'Retail', 'Offline Transactions', 'PCI-DSS']
  },
  {
    id: 'dataset_loyalty_rewards',
    name: 'Loyalty Rewards Program & Tier Balance Ledger',
    description: 'VIP tiers, accumulated reward points, promotional tier status, milestone expiration dates, and tier anniversary timestamps.',
    schemaId: 'xdm_loyalty_rewards_schema',
    schemaName: 'Loyalty & Rewards Account Schema',
    sourceConnectorId: 'src_oracle_loyalty',
    sourceConnectorName: 'Oracle Loyalty Cloud Ingestion',
    ingestionType: 'Batch',
    format: 'CSV',
    recordCount: 310500,
    sizeBytes: 356515840,
    sizeFormatted: '340 MB',
    status: 'Active',
    isProfileEnabled: true,
    labels: ['I1', 'C3'],
    createdAt: '2026-08-10T10:00:00Z',
    lastIngestedAt: '2026-08-20T04:30:00Z',
    tags: ['Loyalty', 'Points', 'Batch', 'Rewards']
  },
  {
    id: 'dataset_customer_service',
    name: 'Zendesk & Service Cloud Support Tickets',
    description: 'Inbound customer care inquiries, dispute escalation categories, CSAT satisfaction scores, and agent verbatim transcripts.',
    schemaId: 'xdm_support_tickets_schema',
    schemaName: 'Customer Service & Interventions Schema',
    sourceConnectorId: 'src_zendesk',
    sourceConnectorName: 'Zendesk Service Cloud Webhook',
    ingestionType: 'Streaming',
    format: 'JSON',
    recordCount: 154200,
    sizeBytes: 220200960,
    sizeFormatted: '210 MB',
    status: 'Active',
    isProfileEnabled: false,
    labels: ['I1', 'C9', 'C11'],
    createdAt: '2026-08-12T16:20:00Z',
    lastIngestedAt: '2026-08-20T09:55:00Z',
    tags: ['Support', 'Tickets', 'No AI Training (C9)', 'Streaming']
  },
  {
    id: 'dataset_snowflake_zero_copy',
    name: 'Snowflake Enterprise Data Warehouse Zero-Copy Sync',
    description: 'Enterprise data mesh view federating customer lifetime value, historical order summaries, and financial margin aggregates without data duplication.',
    schemaId: 'xdm_enterprise_data_mesh',
    schemaName: 'Federated Enterprise Mesh Schema',
    sourceConnectorId: 'src_snowflake_federated',
    sourceConnectorName: 'Snowflake Enterprise Zero-Copy',
    ingestionType: 'Federated Zero-Copy',
    format: 'Parquet',
    recordCount: 3250000,
    sizeBytes: 13315571712,
    sizeFormatted: '12.4 GB',
    status: 'Active',
    isProfileEnabled: true,
    labels: ['C1', 'C2', 'I1', 'I2'],
    createdAt: '2026-08-14T07:00:00Z',
    lastIngestedAt: '2026-08-20T10:00:00Z',
    tags: ['Zero-Copy', 'Snowflake', 'Warehouse Mesh', 'Federated']
  },
  {
    id: 'dataset_partner_intent_feed',
    name: 'Bombora B2B Partner Intent & Firmographics',
    description: 'Contracted third-party syndication feed providing surge intent scores, domain firmographics, and technology stack installations.',
    schemaId: 'xdm_b2b_intent_schema',
    schemaName: 'B2B Surge Intent & Firmographics Schema',
    sourceConnectorId: 'src_bombora_intent',
    sourceConnectorName: 'Bombora B2B Surge Connector',
    ingestionType: 'Batch',
    format: 'JSON',
    recordCount: 88400,
    sizeBytes: 99614720,
    sizeFormatted: '95 MB',
    status: 'Active',
    isProfileEnabled: false,
    labels: ['C1', 'C10'],
    createdAt: '2026-08-16T12:00:00Z',
    lastIngestedAt: '2026-08-19T18:00:00Z',
    tags: ['B2B', 'Intent', 'Third-Party Co-Op', 'Restricted (C1/C10)']
  }
];



