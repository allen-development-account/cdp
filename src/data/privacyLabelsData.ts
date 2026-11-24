import { PrivacyLabelCategory, PrivacyLabelDefinition } from '../types/cdp';

export const STANDARD_PRIVACY_LABEL_CATEGORIES: PrivacyLabelCategory[] = [
  {
    id: 'Contract',
    name: 'Contractual & Usage Restrictions (C-Series)',
    codePrefix: 'C',
    description: 'Enforces data usage restrictions established by contracts, terms of service, partner data licenses, and vendor agreements.',
    badgeColor: 'indigo',
    iconName: 'FileText',
    labels: [
      {
        code: 'C1',
        category: 'Contract',
        name: 'Third-Party Data Syndication Prohibited',
        description: 'Data cannot be exported, syndicated, or shared with external third-party services, ad platforms, DSPs, or data brokers.',
        usageRestrictions: 'Strictly prohibited from Ad Networks, Social Media APIs, and programmatic bidding destinations.',
        defaultAction: 'Block',
        applicableRegulations: ['Contract Law', 'Partner Terms of Service', 'Vendor Licensing Agreements'],
        severity: 'Critical',
        taggedFieldCount: 5,
        examples: ['Partner Co-Op IDs', 'Licensed enrichment scores', 'Third-party intent feeds']
      },
      {
        code: 'C2',
        category: 'Contract',
        name: 'Third-Party Ad Networks Prohibited',
        description: 'Data cannot be exported to third-party ad networks or ad servers. Data is restricted to internal business intelligence and aggregate reporting.',
        usageRestrictions: 'Cannot be used for customer-facing communication, email personalization, or live edge decisioning on third-party networks.',
        defaultAction: 'Block',
        applicableRegulations: ['Internal Data Use Policies', 'Confidentiality Agreements', 'Ad Exchange Terms'],
        severity: 'High',
        taggedFieldCount: 6,
        examples: ['Internal audit logs', 'Risk assessment scores', 'Credit threshold formulas']
      },
      {
        code: 'C3',
        category: 'Contract',
        name: 'Combination with Directly Identifiable Data Prohibited',
        description: 'Data cannot be merged, combined, or stitched with directly identifiable data (such as names, email addresses, or phone numbers).',
        usageRestrictions: 'Prevents anonymous clickstream or pseudonymous data from being de-anonymized through graph stitching.',
        defaultAction: 'Block',
        applicableRegulations: ['Data Protection Principles', 'Publisher Agreements', 'Identity Graph Governance'],
        severity: 'High',
        taggedFieldCount: 3,
        examples: ['Anonymous browsing logs', 'Pseudonymous device beacons', 'Unauthenticated search queries']
      },
      {
        code: 'C4',
        category: 'Contract',
        name: 'Targeting or Ad Personalization Prohibited',
        description: 'Data cannot be utilized to construct tailored audiences, targeting cohorts, retargeting pools, or dynamic ad personalization.',
        usageRestrictions: 'Excluded from Meta Custom Audiences, Google Customer Match, TikTok Ads, and programmatic DSPs.',
        defaultAction: 'Block',
        applicableRegulations: ['Cross-Context Behavioral Advertising Agreements', 'Ad Exchange Governance'],
        severity: 'Critical',
        taggedFieldCount: 7,
        examples: ['Browsing clickstream', 'Product view telemetry', 'Cart interaction history', 'Purchase recency']
      },
      {
        code: 'C5',
        category: 'Contract',
        name: 'Cross-Site Tracking Prohibited',
        description: 'Data cannot be used for cross-site targeting, cross-publisher tracking, or stitched with third-party cookie graphs.',
        usageRestrictions: 'Forbidden from probabilistic graph stitching and cross-site identity co-op enrichment.',
        defaultAction: 'Block',
        applicableRegulations: ['Safari ITP', 'Chrome Privacy Sandbox', 'ePrivacy Directive'],
        severity: 'Medium',
        taggedFieldCount: 4,
        examples: ['Third-party cookie IDs', 'Cross-publisher unified IDs', 'Referral URL parameters']
      },
      {
        code: 'C6',
        category: 'Contract',
        name: 'Pseudo-Anonymous Targeted Advertising Prohibited',
        description: 'Data cannot be used to perform targeted advertising to pseudonymous or unauthenticated customer profiles without explicit opt-in.',
        usageRestrictions: 'Restricts audience activation when only anonymous identifiers (cookies, device IDs) are present.',
        defaultAction: 'Block',
        applicableRegulations: ['Digital Services Act (DSA)', 'ePrivacy Article 5(3)'],
        severity: 'High',
        taggedFieldCount: 2,
        examples: ['Anonymous session tokens', 'Guest checkout identifiers', 'Unlinked mobile ad IDs']
      },
      {
        code: 'C7',
        category: 'Contract',
        name: 'On-Site / On-App Content Personalization Prohibited',
        description: 'Data cannot be used for on-site or in-app dynamic content personalization, dynamic creative optimization (DCO), or personalized banners.',
        usageRestrictions: 'Enforced when customers opt out of experience testing or internal recommendation engines.',
        defaultAction: 'Block',
        applicableRegulations: ['Consumer Choice Frameworks', 'Internal Personalization Policies'],
        severity: 'Medium',
        taggedFieldCount: 3,
        examples: ['Dynamic hero banner traits', 'Personalized product carousels', 'In-app promotion triggers']
      },
      {
        code: 'C8',
        category: 'Contract',
        name: 'User Measurement or Analytics Prohibited',
        description: 'Data cannot be used for user-level measurement, multi-touch attribution, or individual analytics reporting.',
        usageRestrictions: 'Blocked from analytics reporting models, BI dashboards, and event-level attribution pipelines.',
        defaultAction: 'Block',
        applicableRegulations: ['Attribution Partner Agreements', 'Confidentiality Clauses'],
        severity: 'Medium',
        taggedFieldCount: 2,
        examples: ['User attribution path', 'Session interaction durations', 'Campaign touchpoint logs']
      },
      {
        code: 'C9',
        category: 'Contract',
        name: 'Data Science & Algorithmic Model Training Prohibited',
        description: 'Data cannot be used in data science, predictive machine learning algorithms, lookalike modeling, or AI training datasets.',
        usageRestrictions: 'Excluded from AutoML churn models, propensity scoring pipelines, and generative AI embeddings.',
        defaultAction: 'Block',
        applicableRegulations: ['EU AI Act', 'Partner IP Agreements', 'AI Training Consent Policies'],
        severity: 'Critical',
        taggedFieldCount: 4,
        examples: ['Customer feedback verbatims', 'Proprietary partner transactions', 'Employee internal notes']
      },
      {
        code: 'C10',
        category: 'Contract',
        name: 'Combination with External Data Sources Prohibited',
        description: 'Data cannot be combined, merged, or enriched with external third-party data sources, data co-ops, or demographic providers.',
        usageRestrictions: 'Must remain strictly isolated within its native enterprise dataset container.',
        defaultAction: 'Block',
        applicableRegulations: ['Data Provider Licensing Contracts', 'Non-Disclosure Agreements'],
        severity: 'High',
        taggedFieldCount: 3,
        examples: ['Isolated partner telemetry', 'Audited compliance feeds', 'Licensor benchmark indexes']
      },
      {
        code: 'C11',
        category: 'Contract',
        name: 'Contractual Restriction for Sensitive Data',
        description: 'Data subject to specialized contractual restrictions regarding commercial confidentiality, trade secrets, or protected partner information.',
        usageRestrictions: 'Access restricted to authorized data stewards with explicit role-based access control (RBAC).',
        defaultAction: 'Block',
        applicableRegulations: ['Trade Secret Protection', 'Enterprise Confidentiality Agreements'],
        severity: 'Critical',
        taggedFieldCount: 2,
        examples: ['Negotiated B2B contract pricing', 'Wholesale volume discounts', 'Proprietary supplier margins']
      },
      {
        code: 'C12',
        category: 'Contract',
        name: "Contractual Restriction for Children's Privacy / COPPA",
        description: "Contractual and regulatory restriction prohibiting the monetization, profiling, or sharing of personal data belonging to minors under 13 (or under 16 in the EU).",
        usageRestrictions: 'Complete exclusion from behavioral profiling, ad monetization, automated decisioning, and external sync.',
        defaultAction: 'Block',
        applicableRegulations: ["COPPA (Children's Online Privacy Protection Act)", 'GDPR Art. 8', 'California Age-Appropriate Design Code'],
        severity: 'Critical',
        taggedFieldCount: 2,
        examples: ['Parental Consent Verified Flag', 'Age Category <13', 'School District Account ID']
      }
    ]
  },
  {
    id: 'Identity',
    name: 'Identity & PII Descriptors (I-Series)',
    codePrefix: 'I',
    description: 'Classifies direct, indirect, and pseudonymous identifiers subject to cryptographic normalization, hashing, and identity protection.',
    badgeColor: 'blue',
    iconName: 'Fingerprint',
    labels: [
      {
        code: 'I1',
        category: 'Identity',
        name: 'Direct Identifiers (Direct PII)',
        description: 'Direct personal identifiable information that explicitly identifies a natural person without requiring secondary lookup keys.',
        usageRestrictions: 'Must be normalized (E.164 / lowercase) and cryptographically hashed (SHA-256) or masked before export to advertising ecosystems.',
        defaultAction: 'Mask_SHA256',
        applicableRegulations: ['GDPR Art. 4(1)', 'CCPA §1798.140(v)', 'LGPD Art. 5', 'ISO 27701'],
        severity: 'Critical',
        taggedFieldCount: 9,
        examples: ['Primary Email Address', 'Phone Number (E.164)', 'First & Last Name', 'Physical Street Address', 'Tax ID / SSN', 'CRM Contact ID']
      },
      {
        code: 'I2',
        category: 'Identity',
        name: 'Indirect & Pseudonymous Identifiers',
        description: 'Data elements that cannot directly identify an individual alone, but can identify a person when combined with auxiliary datasets or identity graph lookup.',
        usageRestrictions: 'Subject to pseudonymization, tokenization, and differential privacy noise in data clean rooms.',
        defaultAction: 'Mask_SHA256',
        applicableRegulations: ['GDPR Recital 26', 'CCPA Pseudonymous Data Rules', 'ePrivacy Directive'],
        severity: 'Medium',
        taggedFieldCount: 8,
        examples: ['First-Party Cookie ECID', 'Mobile Ad IDs (IDFA/GAID)', 'Client IP Address', 'Device Fingerprint', 'Loyalty Card Account Number']
      }
    ]
  },
  {
    id: 'Sensitive',
    name: 'Sensitive Personal Data (S-Series)',
    codePrefix: 'S',
    description: 'Special category personal data requiring elevated security safeguards, encryption at rest, explicit consent, and strict destination filtering.',
    badgeColor: 'rose',
    iconName: 'ShieldAlert',
    labels: [
      {
        code: 'S1',
        category: 'Sensitive',
        name: 'Precise Geolocation Data (Within 1,850 ft)',
        description: 'Exact geographic coordinates (latitude and longitude) derived from GPS, cellular trilateration, or beacon proximity within 1,850 feet.',
        usageRestrictions: 'Requires explicit opt-in consent under CPRA and GDPR. Must be fuzzed to regional zip code for general analytics.',
        defaultAction: 'Consent_Gated',
        applicableRegulations: ['CPRA Sensitive Personal Information', 'GDPR Special Location Rules'],
        severity: 'High',
        taggedFieldCount: 3,
        examples: ['Store Beacon Geofence Coordinates', 'Mobile GPS Fix', 'High-accuracy Wi-Fi Triangulation']
      },
      {
        code: 'S2',
        category: 'Sensitive',
        name: 'Biometric Data',
        description: 'Personal data generated by technical processing relating to physical, physiological, or behavioral characteristics (facial geometry vectors, fingerprint scans, voiceprints).',
        usageRestrictions: 'Strictly prohibited from algorithmic lookalike training, ad syndication, and unencrypted transmission.',
        defaultAction: 'Block',
        applicableRegulations: ['GDPR Art. 9(1)', 'BIPA (Illinois Biometric Information Privacy Act)', 'CPRA §1798.140'],
        severity: 'Critical',
        taggedFieldCount: 2,
        examples: ['Facial Geometry Vector Hash', 'Voiceprint Auth Token', 'Retinal Scan Template']
      },
      {
        code: 'S3',
        category: 'Sensitive',
        name: 'Health, Medical & Wellness Data (HIPAA)',
        description: 'Information concerning physical or mental health, medical conditions, clinical diagnosis codes, prescription medication history, or treatment telemetry.',
        usageRestrictions: 'Completely excluded from all third-party syndication. Strictly banned from digital marketing pipelines and advertising pixels.',
        defaultAction: 'Block',
        applicableRegulations: ['HIPAA Privacy Rule', 'GDPR Art. 9 Special Category', 'HITECH Act'],
        severity: 'Critical',
        taggedFieldCount: 3,
        examples: ['Medical Diagnosis Category (ICD-10)', 'Prescription Refill Timestamp', 'Clinical Wellness Survey']
      },
      {
        code: 'S4',
        category: 'Sensitive',
        name: 'Financial, Banking & Payment Data (PCI-DSS)',
        description: 'Primary Account Numbers (PANs), credit/debit card numbers, bank account numbers, IBANs, credit scores, transaction credentials, and income brackets.',
        usageRestrictions: 'Strictly prohibited from marketing clouds, advertising platforms, and unencrypted webhooks. Must satisfy PCI-DSS v4.0 tokenization.',
        defaultAction: 'Block',
        applicableRegulations: ['PCI-DSS v4.0', 'GLBA (Gramm-Leach-Bliley Act)', 'CPRA §1798.140'],
        severity: 'Critical',
        taggedFieldCount: 4,
        examples: ['Credit Card Token (PCI-DSS)', 'Bank Routing & Account Number', 'SSN / Tax Identification Number', 'Credit Bureau Score']
      },
      {
        code: 'S5',
        category: 'Sensitive',
        name: 'Sexual Orientation & Gender Identity',
        description: 'Data revealing an individual’s sexual orientation, gender identity, or gender reassignment history.',
        usageRestrictions: 'Prohibited from audience targeting, commercial monetization, and third-party syndication without explicit written consent.',
        defaultAction: 'Block',
        applicableRegulations: ['GDPR Art. 9(1) Special Category', 'International Human Rights Protections'],
        severity: 'Critical',
        taggedFieldCount: 1,
        examples: ['Self-identified sexual orientation', 'Gender transition status']
      },
      {
        code: 'S6',
        category: 'Sensitive',
        name: 'Religious or Philosophical Beliefs',
        description: 'Data revealing religious affiliations, philosophical tenets, church memberships, or moral belief systems.',
        usageRestrictions: 'Cannot be used for profiling, discriminatory filtering, or automated ad syndication.',
        defaultAction: 'Block',
        applicableRegulations: ['GDPR Art. 9(1)', 'CPRA Sensitive Personal Information', 'LGPD Art. 11'],
        severity: 'Critical',
        taggedFieldCount: 1,
        examples: ['Religious organization donation tag', 'Faith-based event attendance']
      },
      {
        code: 'S7',
        category: 'Sensitive',
        name: 'Racial or Ethnic Origin',
        description: 'Personal data revealing racial background, tribal citizenship, or ethnic ancestry.',
        usageRestrictions: 'Strictly prohibited from credit, housing, insurance underwriting, and targeted ad syndication under fair lending laws.',
        defaultAction: 'Block',
        applicableRegulations: ['GDPR Art. 9(1)', 'Equal Credit Opportunity Act (ECOA)', 'Fair Housing Act'],
        severity: 'Critical',
        taggedFieldCount: 1,
        examples: ['Self-declared racial background', 'Ethnic identity census descriptor']
      },
      {
        code: 'S8',
        category: 'Sensitive',
        name: 'Trade Union Membership',
        description: 'Data showing an individual’s membership in labor organizations, trade unions, or collective bargaining bodies.',
        usageRestrictions: 'Forbidden from workforce monitoring, discrimination, or programmatic audience monetization.',
        defaultAction: 'Block',
        applicableRegulations: ['GDPR Art. 9(1)', 'ILO International Labor Standards'],
        severity: 'Critical',
        taggedFieldCount: 1,
        examples: ['Labor union local affiliation ID', 'Union dues deduction flag']
      },
      {
        code: 'S9',
        category: 'Sensitive',
        name: 'Political Opinions or Affiliations',
        description: 'Data concerning political party affiliation, ideological voting records, campaign contributions, or political advocacy activities.',
        usageRestrictions: 'Gated under political micro-targeting laws; excluded from cross-context behavioral ad sharing.',
        defaultAction: 'Block',
        applicableRegulations: ['GDPR Art. 9(1)', 'EU Regulation on Political Advertising Transparency'],
        severity: 'Critical',
        taggedFieldCount: 1,
        examples: ['Political committee donor record', 'Party registration category']
      },
      {
        code: 'S10',
        category: 'Sensitive',
        name: 'Genetic Data',
        description: 'Personal data relating to the inherited or acquired genetic characteristics of a natural person, DNA sequencing profiles, or hereditary biomarkers.',
        usageRestrictions: 'Strictly prohibited from commercial syndication, insurance profiling, and unencrypted cloud storage.',
        defaultAction: 'Block',
        applicableRegulations: ['GINA (Genetic Information Nondiscrimination Act)', 'GDPR Art. 9(1)'],
        severity: 'Critical',
        taggedFieldCount: 1,
        examples: ['DNA sequencing sample ID', 'Hereditary disease risk biomarker hash']
      }
    ]
  },
  {
    id: 'Regulatory',
    name: 'Consent & Regulatory Frameworks (R-Series)',
    codePrefix: 'R',
    description: 'Jurisdiction-specific compliance frameworks governing lawful basis for processing, global opt-out signals, and cross-border data transfer.',
    badgeColor: 'emerald',
    iconName: 'ShieldCheck',
    labels: [
      {
        code: 'R1',
        category: 'Regulatory',
        name: 'GDPR Lawful Basis & Explicit Consent (EU)',
        description: 'Requires affirmative, freely given, specific opt-in consent for profiling, cross-context personalization, and cross-border data transfers.',
        usageRestrictions: 'Suppresses profile processing if gdprConsent is false. Grants full DSAR Right to be Forgotten.',
        defaultAction: 'Consent_Gated',
        applicableRegulations: ['EU General Data Protection Regulation (EU 2016/679)', 'UK GDPR'],
        severity: 'Critical',
        taggedFieldCount: 9,
        examples: ['Cookie Banner Consent String', 'EU Data Subject Flag', 'Explicit Opt-In Timestamp']
      },
      {
        code: 'R2',
        category: 'Regulatory',
        name: 'CCPA / CPRA "Do Not Sell or Share" (California)',
        description: 'Enforces statutory consumer right to opt out of the sale or sharing of personal data for cross-context behavioral advertising.',
        usageRestrictions: 'Automatically withholds profile records from all third-party advertising connectors.',
        defaultAction: 'Consent_Gated',
        applicableRegulations: ['California Consumer Privacy Act (Cal. Civ. Code §1798.100)', 'CPRA'],
        severity: 'Critical',
        taggedFieldCount: 9,
        examples: ['Global Privacy Control (GPC) Signal', 'CCPA Opt-Out Flag', 'Do Not Sell Link Click']
      },
      {
        code: 'R3',
        category: 'Regulatory',
        name: 'IAB TCF v2.2 Transparency & Consent Framework',
        description: 'Industry standard consent string encoding for Purpose 1-10 ad measurement, personalization, and vendor list permissions.',
        usageRestrictions: 'Parsed dynamically by edge gateway to filter downstream ad vendors.',
        defaultAction: 'Consent_Gated',
        applicableRegulations: ['IAB Europe TCF v2.2', 'Interactive Advertising Bureau Specifications'],
        severity: 'High',
        taggedFieldCount: 4,
        examples: ['TCF TCString (Base64)', 'IAB Purpose 1-10 Consent Array', 'Special Feature 1 Opt-In']
      },
      {
        code: 'R4',
        category: 'Regulatory',
        name: 'LGPD & International Data Sovereignty',
        description: 'Brazilian General Data Protection Law and national data residency compliance rules governing localization and cross-border transfers.',
        usageRestrictions: 'Enforces data localization within designated sovereign cloud regions.',
        defaultAction: 'Audit_Only',
        applicableRegulations: ['LGPD (Lei Geral de Proteção de Dados)', 'PIPEDA (Canada)', 'APPI (Japan)'],
        severity: 'Medium',
        taggedFieldCount: 3,
        examples: ['Data Residency Region Tag', 'Cross-Border Transfer Authorization']
      }
    ]
  }
];

export const CRISP_LABEL_PURPOSES: Record<string, string> = {
  // Contractual (C-Series)
  C1: 'Prohibits export, syndication, or sharing with external third-party ad platforms or data brokers.',
  C2: 'Restricts data to internal BI; prohibits export to third-party ad networks or ad servers.',
  C3: 'Prohibits merging, stitching, or combining with directly identifiable customer data (PII).',
  C4: 'Prohibits use in tailored audiences, retargeting cohorts, or dynamic ad personalization.',
  C5: 'Prohibits cross-site tracking, publisher co-ops, or third-party cookie stitching.',
  C6: 'Prohibits targeted advertising to pseudonymous or unauthenticated customer profiles.',
  C7: 'Prohibits on-site and in-app dynamic content personalization and recommendation engines.',
  C8: 'Prohibits user-level measurement, multi-touch attribution, and individual analytics.',
  C9: 'Prohibits use in predictive ML models, algorithmic training, and AI lookalike pipelines.',
  C10: 'Prohibits combining or enriching with external third-party demographic data feeds.',
  C11: 'Prohibits access except to authorized stewards under commercial confidentiality agreements.',
  C12: 'Prohibits profiling, targeting, or monetization of personal data from minors under COPPA.',

  // Identity (I-Series)
  I1: 'Directly Identifiable Data (email, phone, name); requires SHA-256 hashing or strict masking.',
  I2: 'Indirectly Identifiable Data (device IDs, IPs); requires pseudonymization and tokenization.',

  // Sensitive (S-Series)
  S1: 'Precise Geolocation (<1,850 ft); gated by explicit opt-in location consent.',
  S2: 'Biometric Identifiers (facial, voice, fingerprints); strictly blocked from ad targeting.',
  S3: 'Health & Medical Records; protected under HIPAA and blocked from marketing.',
  S4: 'Financial & Payment Account Numbers; strictly blocked from external export.',
  S5: 'Sexual Orientation & Gender Identity; special category requiring explicit written consent.',
  S6: 'Religious or Philosophical Beliefs; special category requiring explicit opt-in consent.',
  S7: 'Racial or Ethnic Origin; special category requiring explicit consent and fair lending compliance.',
  S8: 'Trade Union Membership; prohibited from workforce monitoring and ad monetization.',
  S9: 'Political Affiliation Data; strictly prohibited from audience targeting and ad sync.',
  S10: 'Genetic Data & Biomarkers; strictly prohibited from commercial ad syndication.',

  // Regulatory (R-Series)
  R1: 'GDPR Lawful Basis (EU); requires affirmative opt-in consent and enables full DSAR erasure.',
  R2: 'CCPA / CPRA Opt-Out (California); enforces statutory "Do Not Sell or Share My Info".',
  R3: 'IAB TCF v2.2 Consent String; dynamically filters authorized downstream ad vendors.',
  R4: 'LGPD & Data Sovereignty; enforces national data residency and sovereign cloud localization.'
};

export const getCrispPurpose = (code: string): string => {
  return CRISP_LABEL_PURPOSES[code] || 'Enforces Adobe Real-Time CDP governance policies across downstream activations.';
};

export const ALL_PRIVACY_LABELS: PrivacyLabelDefinition[] = STANDARD_PRIVACY_LABEL_CATEGORIES.flatMap(c =>
  c.labels.map(lbl => ({
    ...lbl,
    crispPurpose: CRISP_LABEL_PURPOSES[lbl.code] || lbl.description
  }))
);

