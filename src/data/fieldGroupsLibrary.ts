import { SchemaField, PrivacyClassification } from '../types/cdp';

export interface FieldGroupTemplate {
  id: string;
  name: string;
  description: string;
  compatibleClasses: Array<'Profile' | 'ExperienceEvent' | 'B2BAccount' | 'Consent' | 'Lookup'>;
  category: string;
  isStandard: boolean;
  fields: Array<Omit<SchemaField, 'id'>>;
}

export const STANDARD_FIELD_GROUPS: FieldGroupTemplate[] = [
  // PROFILE CLASSES
  {
    id: 'fg_demographic_details',
    name: 'Demographic Details',
    description: 'Personal demographic attributes including individual name components, gender, and date of birth.',
    compatibleClasses: ['Profile'],
    category: 'Demographics',
    isStandard: true,
    fields: [
      {
        name: 'person.name.firstName',
        dataType: 'string',
        description: 'Individual given/first name',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'person.name.lastName',
        dataType: 'string',
        description: 'Individual family/surname',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'person.name.middleName',
        dataType: 'string',
        description: 'Individual middle name or initial',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'person.gender',
        dataType: 'string',
        description: 'Self-reported gender identification',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'person.birthDate',
        dataType: 'string',
        description: 'ISO-8601 calendar date of birth (YYYY-MM-DD)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_personal_contact_details',
    name: 'Personal Contact Details',
    description: 'Omnichannel personal communication channels including verified email address, telephone numbers, and postal address.',
    compatibleClasses: ['Profile'],
    category: 'Contact',
    isStandard: true,
    fields: [
      {
        name: 'personalEmail.address',
        dataType: 'string',
        description: 'Primary personal contact email address (RFC 5322)',
        classification: 'Standard',
        privacyLabels: ['I1', 'C1'],
        isIdentifier: true,
        identifierType: 'email',
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'mobilePhone.number',
        dataType: 'string',
        description: 'E.164 compliant cellular mobile telephone number',
        classification: 'Standard',
        privacyLabels: ['I1', 'C2'],
        isIdentifier: true,
        identifierType: 'phone',
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'homePhone.number',
        dataType: 'string',
        description: 'Fixed line residential telephone number',
        classification: 'Standard',
        privacyLabels: ['I1'],
        isIdentifier: true,
        identifierType: 'phone',
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'postalAddress.street1',
        dataType: 'string',
        description: 'Primary physical mailing address line',
        classification: 'Standard',
        privacyLabels: ['S1'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'postalAddress.city',
        dataType: 'string',
        description: 'City or municipality name',
        classification: 'Standard',
        privacyLabels: ['S1'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'postalAddress.stateProvince',
        dataType: 'string',
        description: 'Two-character state, province or region code',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'postalAddress.postalCode',
        dataType: 'string',
        description: 'Postal ZIP or routing code',
        classification: 'Standard',
        privacyLabels: ['S1'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'postalAddress.country',
        dataType: 'string',
        description: 'ISO 3166-1 alpha-2 sovereign country code',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_identity_descriptors',
    name: 'Identification Details',
    description: 'Deterministic and probabilistic identity keys for real-time customer graph stitching.',
    compatibleClasses: ['Profile', 'ExperienceEvent'],
    category: 'Identity',
    isStandard: true,
    fields: [
      {
        name: 'profileId',
        dataType: 'string',
        description: 'Global deterministic unified profile GUID (Primary CRM Key)',
        classification: 'Standard',
        privacyLabels: ['I1'],
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'ecid',
        dataType: 'string',
        description: 'Experience Cloud ID first-party cookie token for pseudonymous web resolution',
        classification: 'Standard',
        privacyLabels: ['I2'],
        isIdentifier: true,
        identifierType: 'cookie',
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'customerAccountNumber',
        dataType: 'string',
        description: 'Enterprise ERP / Core banking customer account reference number',
        classification: 'Standard',
        privacyLabels: ['I1'],
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_loyalty_rewards',
    name: 'Loyalty & Rewards Details',
    description: 'Membership status, reward balance tiers, earned points, and anniversary milestones.',
    compatibleClasses: ['Profile'],
    category: 'Loyalty',
    isStandard: true,
    fields: [
      {
        name: 'loyalty.memberNumber',
        dataType: 'string',
        description: 'Loyalty program membership card number',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'loyalty.tier',
        dataType: 'string',
        description: 'Current loyalty qualification tier (Bronze, Silver, Gold, Platinum, VIP)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'loyalty.pointsBalance',
        dataType: 'number',
        description: 'Current redeemable reward point balance',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'loyalty.lifetimePoints',
        dataType: 'number',
        description: 'Cumulative lifetime reward points earned',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'loyalty.joinDate',
        dataType: 'timestamp',
        description: 'Timestamp when customer joined the loyalty membership program',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_payment_spending',
    name: 'Payment & Spending Profile',
    description: 'Transaction monetary metrics, preferred payment tenders, and lifetime spend history.',
    compatibleClasses: ['Profile'],
    category: 'Finance',
    isStandard: true,
    fields: [
      {
        name: 'paymentDetails.preferredMethod',
        dataType: 'string',
        description: 'Default checkout payment tender (CreditCard, ApplePay, PayPal, Invoice)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'paymentDetails.currencyCode',
        dataType: 'string',
        description: 'ISO-4217 standard billing currency code (USD, EUR, GBP)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'paymentDetails.lifetimeSpend',
        dataType: 'number',
        description: 'Aggregate historical expenditure net total in base currency',
        classification: 'Financial',
        privacyLabels: ['S3'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: true,
      },
      {
        name: 'paymentDetails.averageOrderValue',
        dataType: 'number',
        description: 'Average calculated monetary value per completed purchase',
        classification: 'Financial',
        privacyLabels: ['S3'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_consent_preferences',
    name: 'Consents & Privacy Directives',
    description: 'Granular marketing opt-in preferences and DULE data usage directives for regulatory compliance.',
    compatibleClasses: ['Profile', 'Consent'],
    category: 'Governance',
    isStandard: true,
    fields: [
      {
        name: 'consents.marketing.email',
        dataType: 'boolean',
        description: 'Explicit opt-in directive for promotional marketing emails (GDPR Art. 7)',
        classification: 'Standard',
        privacyLabels: ['C1'],
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'consents.marketing.sms',
        dataType: 'boolean',
        description: 'Explicit opt-in directive for promotional SMS and instant messaging',
        classification: 'Standard',
        privacyLabels: ['C2'],
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'consents.analytics.collect',
        dataType: 'boolean',
        description: 'User consent allowing behavioral telemetry tracking on digital properties',
        classification: 'Standard',
        privacyLabels: ['C9'],
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'consents.share.thirdParty',
        dataType: 'boolean',
        description: 'CCPA / CPRA Do Not Sell or Share Personal Information opt-out status',
        classification: 'Standard',
        privacyLabels: ['C12'],
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      }
    ]
  },

  // EXPERIENCE EVENT CLASSES
  {
    id: 'fg_commerce_orders',
    name: 'Commerce & Order Details',
    description: 'Transactional purchase metrics, items, payment instruments, order identifiers and currency amounts.',
    compatibleClasses: ['ExperienceEvent'],
    category: 'Commerce',
    isStandard: true,
    fields: [
      {
        name: 'commerce.order.orderId',
        dataType: 'string',
        description: 'Canonical order confirmation identification number',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'commerce.order.priceTotal',
        dataType: 'number',
        description: 'Order net monetary settlement amount in transaction currency',
        classification: 'Financial',
        privacyLabels: ['S3'],
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'commerce.order.currencyCode',
        dataType: 'string',
        description: 'ISO-4217 three-letter currency code (e.g. USD)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'commerce.order.paymentMethod',
        dataType: 'string',
        description: 'Settled payment tender type (CreditCard, DebitCard, Klarna)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'commerce.cart.cartId',
        dataType: 'string',
        description: 'Session shopping cart UUID',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_web_sdk_telemetry',
    name: 'Web SDK Digital Telemetry',
    description: 'Browser interactions, canonical web page details, referrer URL paths, and client screen metrics.',
    compatibleClasses: ['ExperienceEvent'],
    category: 'Digital Telemetry',
    isStandard: true,
    fields: [
      {
        name: 'web.webPageDetails.name',
        dataType: 'string',
        description: 'Human-readable name or title of the visited web document',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'web.webPageDetails.URL',
        dataType: 'string',
        description: 'Canonical destination URL path',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'web.webReferrer.URL',
        dataType: 'string',
        description: 'Inbound HTTP referrer URL source',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'web.interaction.type',
        dataType: 'string',
        description: 'Interaction verb: PageView, Click, FormSubmit, VideoPlay',
        classification: 'Behavioral',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      }
    ]
  },
  {
    id: 'fg_device_environment',
    name: 'Device & Environment Details',
    description: 'Hardware user agent, operating system family, and geo-located IP environment.',
    compatibleClasses: ['ExperienceEvent'],
    category: 'Technical',
    isStandard: true,
    fields: [
      {
        name: 'device.browser',
        dataType: 'string',
        description: 'Client software browser engine (Chrome, Safari, Firefox)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'device.os',
        dataType: 'string',
        description: 'Host operating system family (macOS, Windows, iOS, Android)',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'device.type',
        dataType: 'string',
        description: 'Hardware form factor: Desktop, Mobile, Tablet, ConnectedTV',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'environment.geo.city',
        dataType: 'string',
        description: 'Coarse municipality location resolved via IP geolocation',
        classification: 'Standard',
        privacyLabels: ['S1'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'environment.geo.countryCode',
        dataType: 'string',
        description: 'ISO 3166-1 alpha-2 nation code resolved via edge IP',
        classification: 'Standard',
        privacyLabels: ['S1'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  },

  // B2B CLASSES
  {
    id: 'fg_b2b_firmographics',
    name: 'B2B Account Firmographics',
    description: 'Corporate organizational attributes including legal name, domain, revenue brackets, and NAICS industry.',
    compatibleClasses: ['B2BAccount'],
    category: 'B2B',
    isStandard: true,
    fields: [
      {
        name: 'b2b.accountId',
        dataType: 'string',
        description: 'Corporate CRM Account UUID (Primary CRM Key)',
        classification: 'Standard',
        privacyLabels: ['I1'],
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'b2b.accountName',
        dataType: 'string',
        description: 'Legal registered business company name',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'b2b.corporateDomain',
        dataType: 'string',
        description: 'Primary corporate web domain (e.g. acme.corp) for lead-to-account matching',
        classification: 'Standard',
        isIdentifier: true,
        identifierType: 'crmId',
        isRequired: true,
        isSensitive: false,
      },
      {
        name: 'b2b.annualRevenue',
        dataType: 'number',
        description: 'Estimated annual enterprise gross revenue in USD',
        classification: 'Financial',
        privacyLabels: ['S3'],
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'b2b.numberOfEmployees',
        dataType: 'number',
        description: 'Full-time employee headcount',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      },
      {
        name: 'b2b.industry',
        dataType: 'string',
        description: 'Standard NAICS or SIC industry sector',
        classification: 'Standard',
        isIdentifier: false,
        isRequired: false,
        isSensitive: false,
      }
    ]
  }
];

export interface XdmClassDefinition {
  id: 'Profile' | 'ExperienceEvent' | 'B2BAccount' | 'Consent' | 'Lookup';
  name: string;
  category: 'Record' | 'Time-series';
  description: string;
  baseUri: string;
  badgeColor: string;
}

export const XDM_CLASSES: XdmClassDefinition[] = [
  {
    id: 'Profile',
    name: 'XDM Individual Profile',
    category: 'Record',
    description: 'Behavioral record class representing an individual customer profile with persistent attributes, identity keys, and real-time segmentation membership.',
    baseUri: 'https://ns.xprplatform.com/xdm/context/profile',
    badgeColor: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]'
  },
  {
    id: 'ExperienceEvent',
    name: 'XDM ExperienceEvent',
    category: 'Time-series',
    description: 'Time-series class capturing point-in-time digital touchpoints, orders, clicks, conversions, and telemetry snapshots with precise timestamp sequencing.',
    baseUri: 'https://ns.xprplatform.com/xdm/context/experienceevent',
    badgeColor: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]'
  },
  {
    id: 'B2BAccount',
    name: 'XDM B2B Account',
    category: 'Record',
    description: 'Record class modeling commercial corporate organizations, firmographic profiles, corporate hierarchies, and buying group stakeholders.',
    baseUri: 'https://ns.xprplatform.com/xdm/classes/b2b-account',
    badgeColor: 'bg-[#F2EDFD] text-[#7024C4] border-[#D3BCF6]'
  },
  {
    id: 'Consent',
    name: 'XDM Consent & Preferences',
    category: 'Record',
    description: 'Record class dedicated to capturing real-time customer privacy choices, GDPR/CCPA directives, and omni-channel communication opt-ins.',
    baseUri: 'https://ns.xprplatform.com/xdm/context/consent',
    badgeColor: 'bg-[#FFF8E1] text-[#B25900] border-[#FFE082]'
  }
];
