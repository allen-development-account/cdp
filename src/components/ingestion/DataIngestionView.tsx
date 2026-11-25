import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { SAMPLE_PRESET_PAYLOADS } from '../../data/seedData';
import { TerminalLog } from '../common/TerminalLog';
import { GuidedIngestionSetupWizard } from './GuidedIngestionSetupWizard';
import { FileIngestionModal } from './FileIngestionModal';
import { MethodGuideModal, IngestionMethodDetails } from './MethodGuideModal';
import { LiveEdgeStreamConsole } from './LiveEdgeStreamConsole';
import { ExcelCsvFileIngestionSection } from './ExcelCsvFileIngestionSection';
import {
  Radio,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  Smartphone,
  Layers,
  Cloud,
  Store,
  RefreshCw,
  GitMerge,
  Cpu,
  ShieldAlert,
  Plus,
  ChevronDown,
  ChevronUp,
  Upload,
  Code,
  FileText,
  FileSpreadsheet,
  Compass,
  Zap,
  Server,
  Terminal,
  Sliders,
  ExternalLink,
  Play,
  Wrench
} from 'lucide-react';

const GUIDED_METHODS: IngestionMethodDetails[] = [
  {
    id: 'tpl_web_sdk',
    title: 'Client-Side Web SDK',
    subtitle: 'Alloy.js Tag & Edge Network',
    badge: 'Real-Time Edge',
    category: 'Web & Mobile',
    icon: 'globe',
    description: 'Deploy the lightweight client-side Alloy tag on your web properties to stream clicks, page views, and conversions directly into the Edge Network.',
    sla: '< 2.4ms Latency',
    protocol: 'Real-Time Streaming | Alloy.js',
    channel: 'Web SDK',
    schemaId: 'xdm_experience_event',
    steps: [
      {
        number: 1,
        title: 'Embed JavaScript Tag',
        desc: 'Add the lightweight Alloy snippet or npm package to your header or tag manager.'
      },
      {
        number: 2,
        title: 'Configure Datastream ID',
        desc: 'Specify your tenant edge datastream ID and organization credentials.'
      },
      {
        number: 3,
        title: 'Stream Events (alloy)',
        desc: 'Execute alloy("sendEvent") to stream user interactions and automatic identity maps.'
      }
    ],
    snippets: [
      {
        language: 'javascript',
        label: 'Alloy.js Web Tag',
        code: `// XLR8 Web SDK Ingestion Tag
import { createInstance } from '@xpr/alloy-sdk';

const xpr = createInstance({ name: 'xprCDP' });
xpr('configure', {
  edgeDomain: 'edge.xprplatform.io',
  datastreamId: 'ds_web_prod_01',
  orgId: 'ORG_ENTERPRISE_GLOBAL@XLR8'
});

// Stream real-time experience event with Identity Map
xpr('sendEvent', {
  xdm: {
    eventType: 'web.webpagedetails.pageViews',
    identityMap: {
      email: [{ id: 'alex.rivera@enterprisecorp.io', authenticatedState: 'authenticated' }]
    },
    web: {
      webPageDetails: { name: 'Homepage - Hero Banner', URL: window.location.href }
    }
  }
});`
      },
      {
        language: 'html',
        label: 'HTML Script Tag',
        code: `<!-- XLR8 Real-Time Tag Embed -->
<script src="https://cdn.xprplatform.io/alloy/v2.18/alloy.min.js" async></script>
<script>
  window.xpr = window.xpr || function() { (window.xpr.q = window.xpr.q || []).push(arguments); };
  xpr("configure", { datastreamId: "ds_web_prod_01" });
  xpr("sendEvent", { xdm: { eventType: "PageView" } });
</script>`
      }
    ],
    testPayload: {
      anon_cookie_id: 'cid_anon_web_' + Math.floor(1000 + Math.random() * 9000),
      customer_email: 'alex.rivera@enterprisecorp.io',
      event_name: 'PageView',
      page_location: 'https://store.enterprise.com/solutions/real-time-cdp',
      device_browser: 'Chrome 128 / macOS'
    }
  },
  {
    id: 'tpl_mobile_sdk',
    title: 'Mobile App SDK',
    subtitle: 'iOS Swift & Android Kotlin',
    badge: 'Native Real-Time',
    category: 'Web & Mobile',
    icon: 'smartphone',
    description: 'Capture native mobile telemetry, push notification interaction tokens, in-app purchases, and lifecycle sessions with offline event queuing.',
    sla: '< 3.1ms Latency',
    protocol: 'Real-Time Streaming | iOS / Android',
    channel: 'Mobile SDK',
    schemaId: 'xdm_experience_event',
    steps: [
      {
        number: 1,
        title: 'Install CocoaPod / Gradle',
        desc: 'Add the XLR8 Mobile Core dependency to your iOS Podfile or Android build.gradle.'
      },
      {
        number: 2,
        title: 'Initialize Mobile Core',
        desc: 'Register Identity and Edge extensions in Application onCreate / AppDelegate.'
      },
      {
        number: 3,
        title: 'Track Actions & Screen',
        desc: 'Call MobileCore.trackAction() and capture device tokens for push retargeting.'
      }
    ],
    snippets: [
      {
        language: 'swift',
        label: 'Swift (iOS)',
        code: `import XLR8MobileCore
import XLR8Edge

// In AppDelegate
MobileCore.registerExtensions([Edge.self, Identity.self]) {
    MobileCore.configureWith(appId: "xpr_mobile_app_prod")
}

// Track In-App Purchase Event
let eventData: [String: Any] = [
    "customer_email": "sophia.tanaka@designstudios.jp",
    "event_name": "InAppPurchase",
    "sku": "SUBSCRIPTION_PRO_ANNUAL",
    "total_amount": 199.00
]
let experienceEvent = ExperienceEvent(xdm: eventData)
Edge.sendEvent(experienceEvent: experienceEvent)`
      },
      {
        language: 'kotlin',
        label: 'Kotlin (Android)',
        code: `import com.xlr8.mobile.MobileCore
import com.xlr8.mobile.Edge
import com.xlr8.mobile.ExperienceEvent

// Track screen view
val eventData = mapOf(
    "customer_email" to "elena.rostova@cloudscale.io",
    "event_name" to "ScreenView",
    "screen_name" to "CheckoutConfirmation"
)
Edge.sendEvent(ExperienceEvent.Builder().setXdmSchema(eventData).build())`
      }
    ],
    testPayload: {
      customer_email: 'sophia.tanaka@designstudios.jp',
      device_token: 'idfa_mobile_ios_' + Math.floor(100000 + Math.random() * 900000),
      event_name: 'AppOpen',
      os_version: 'iOS 18.2',
      app_version: '3.4.1'
    }
  },
  {
    id: 'tpl_rest_api',
    title: 'Streaming REST API & Webhooks',
    subtitle: 'Server-to-Server Ingress',
    badge: 'Direct HTTPS POST',
    category: 'Web & Mobile',
    icon: 'radio',
    description: 'Direct server-to-server HTTPS POST endpoint for backend microservices, payment gateways (Stripe), and serverless functions with sub-5ms processing.',
    sla: '< 3.5ms Latency',
    protocol: 'HTTPS REST / JSON | Auth Bearer',
    channel: 'Web SDK',
    schemaId: 'xdm_experience_event',
    steps: [
      {
        number: 1,
        title: 'Generate API Secret Key',
        desc: 'Obtain an authenticated streaming ingest bearer token in your sandbox settings.'
      },
      {
        number: 2,
        title: 'POST JSON Payload',
        desc: 'Send an HTTPS POST request to https://edge.xlr8-cdp.net/v1/stream/ingest.'
      },
      {
        number: 3,
        title: 'Deterministic Stitching',
        desc: 'Engine normalizes raw JSON keys and executes real-time identity linking.'
      }
    ],
    snippets: [
      {
        language: 'bash',
        label: 'cURL Command',
        code: `curl -X POST "https://edge.xlr8-cdp.net/v1/stream/ingest" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer XLR8_PROD_BEARER_TOKEN" \\
  -d '{
    "customer_email": "marcus.vance@vancemedia.io",
    "anon_cookie_id": "ck_rest_882914",
    "event_name": "SubscriptionActivated",
    "total_amount": 890.00,
    "timestamp": "2026-09-19T14:30:00Z"
  }'`
      },
      {
        language: 'python',
        label: 'Python Requests',
        code: `import requests

url = "https://edge.xlr8-cdp.net/v1/stream/ingest"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer XLR8_PROD_BEARER_TOKEN"
}
payload = {
    "customer_email": "marcus.vance@vancemedia.io",
    "event_name": "AccountActivated",
    "crm_id": "SFDC-992144"
}
response = requests.post(url, json=payload, headers=headers)
print("Ingestion Status:", response.status_code)`
      }
    ],
    testPayload: {
      customer_email: 'marcus.vance@vancemedia.io',
      anon_cookie_id: 'ck_rest_882914',
      event_name: 'SubscriptionActivated',
      total_amount: 890.00,
      channel: 'Web SDK'
    }
  },
  {
    id: 'tpl_file_upload',
    title: 'Batch File Ingestion (CSV / JSON)',
    subtitle: 'Drag & Drop File Parser',
    badge: 'Interactive Upload',
    category: 'Data Warehouses',
    icon: 'database',
    description: 'Upload customer lists, offline purchase transactions, or point-of-sale catalog files with automatic schema column mapping and deterministic unification.',
    sla: '< 95ms Parse Time',
    protocol: 'Batch File Upload | CSV / JSON',
    channel: 'Snowflake Batch',
    schemaId: 'xdm_individual_profile',
    steps: [
      {
        number: 1,
        title: 'Select CSV or JSON File',
        desc: 'Drag and drop or browse files containing customer records or offline events.'
      },
      {
        number: 2,
        title: 'Review Field Mapping',
        desc: 'Auto-detect columns (e.g. customer_email, firstName, total_spend, consent).'
      },
      {
        number: 3,
        title: 'Execute Batch Ingestion',
        desc: 'Records are parsed, validated, and unified directly into the Customer 360 graph.'
      }
    ],
    snippets: [
      {
        language: 'csv',
        label: 'Sample CSV Format',
        code: `customer_email,firstName,lastName,total_spend,customer_tier,city,country
claire.dubois@luxeglobal.fr,Claire,Dubois,3420.00,Platinum,Paris,France
kenji.sato@tokyotech.co.jp,Kenji,Sato,5890.50,VIP,Tokyo,Japan
sarah.miller@austinfintech.io,Sarah,Miller,1240.00,Gold,Austin,United States`
      },
      {
        language: 'json',
        label: 'Sample JSON Records',
        code: `[
  {
    "customer_email": "claire.dubois@luxeglobal.fr",
    "firstName": "Claire",
    "lastName": "Dubois",
    "total_spend": 3420.00,
    "customer_tier": "Platinum"
  }
]`
      }
    ],
    testPayload: {
      customer_email: 'claire.dubois@luxeglobal.fr',
      firstName: 'Claire',
      lastName: 'Dubois',
      total_spend: 3420.00,
      customer_tier: 'Platinum',
      city: 'Paris',
      country: 'France'
    }
  },
  {
    id: 'tpl_snowflake',
    title: 'Cloud Data Warehouses',
    subtitle: 'Snowflake, BigQuery, Databricks',
    badge: 'Zero-Copy Federated',
    category: 'Data Warehouses',
    icon: 'database',
    description: 'Execute federated zero-copy pushdown queries or scheduled micro-batch synchronizers querying customer marts directly in Snowflake, BigQuery, or Databricks.',
    sla: 'Zero-Copy Pushdown',
    protocol: 'Federated SQL / Scheduled ELT',
    channel: 'Snowflake Batch',
    schemaId: 'xdm_individual_profile',
    steps: [
      {
        number: 1,
        title: 'Authenticate Warehouse Role',
        desc: 'Configure Snowflake Role, Warehouse, and read permissions on customer views.'
      },
      {
        number: 2,
        title: 'Map View to XDM Profile',
        desc: 'Bind warehouse dimension tables to canonical XDM Individual Profile schema.'
      },
      {
        number: 3,
        title: 'Zero-Copy Execution',
        desc: 'CDP queries data in-place without costly data replication or egress fees.'
      }
    ],
    snippets: [
      {
        language: 'sql',
        label: 'Snowflake Pushdown SQL',
        code: `-- XLR8 Zero-Copy Pushdown Query
SELECT 
    p.ACCOUNT_ID AS profile_id,
    p.CUSTOMER_EMAIL AS primary_email,
    p.FIRST_NAME,
    p.LAST_NAME,
    p.LIFETIME_REVENUE AS totalSpend,
    p.RISK_SCORE AS churnRisk
FROM ENTERPRISE_DW.PUBLIC.CUSTOMER_360_MART p
WHERE p.IS_ACTIVE = TRUE AND p.CONSENT_GDPR = TRUE;`
      }
    ],
    testPayload: {
      customer_email: 'elena.rostova@techenterprise.com',
      firstName: 'Elena',
      total_spend: 5200.00,
      customer_tier: 'VIP',
      warehouse_source: 'SNOWFLAKE_PROD_MART'
    }
  },
  {
    id: 'tpl_kafka',
    title: 'Enterprise Message Bus',
    subtitle: 'Apache Kafka & Confluent Cloud',
    badge: 'Streaming Pipeline',
    category: 'Event Streams',
    icon: 'radio',
    description: 'High-throughput partitioned Kafka topic subscribers consuming microservice telemetry events with exactly-once processing guarantees.',
    sla: '< 1.8ms Latency',
    protocol: 'Apache Kafka SASL / mTLS',
    channel: 'Kafka Ingestion',
    schemaId: 'xdm_experience_event',
    steps: [
      {
        number: 1,
        title: 'Configure Kafka Brokers',
        desc: 'Specify bootstrap server endpoints, topic name, and SASL/mTLS credentials.'
      },
      {
        number: 2,
        title: 'Set Consumer Group ID',
        desc: 'Allocate distributed consumer workers with automatic partition rebalancing.'
      },
      {
        number: 3,
        title: 'Continuous Streaming',
        desc: 'Sub-second event stream consumption into Apache Flink real-time engine.'
      }
    ],
    snippets: [
      {
        language: 'properties',
        label: 'Kafka Client Config',
        code: `bootstrap.servers=pkc-4r29z.us-east-1.aws.confluent.cloud:9092
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \\
  username="XLR8_API_KEY" \\
  password="XLR8_SECRET_TOKEN";
topic=enterprise.cdp.clickstream.telemetry
group.id=xlr8-flink-ingest-consumer-v1`
      }
    ],
    testPayload: {
      customer_email: 'marcus.vance@vancemedia.io',
      event_name: 'AddToCart',
      sku: 'CLOUD-SERVER-RACK-8X',
      total_amount: 1299.00,
      topic_partition: 'telemetry_part_3'
    }
  }
];

export const DataIngestionView: React.FC = () => {
  const { sources, ingestEvent, schemas, setActiveTab, setSelectedProfileId, loadDemoSources } = useCDP();

  // Wizard & Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardTemplateId, setWizardTemplateId] = useState<string>('tpl_web_sdk');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedGuideMethod, setSelectedGuideMethod] = useState<IngestionMethodDetails | null>(null);

  // Accordion Toggle for Preset Ingestion Scenarios (Requirement: consolidated as an accordion toggle)
  const [isPresetAccordionOpen, setIsPresetAccordionOpen] = useState(false);

  // Simulator State (inside accordion)
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [rawJsonText, setRawJsonText] = useState(SAMPLE_PRESET_PAYLOADS[0].rawJson);
  const [selectedChannel, setSelectedChannel] = useState(SAMPLE_PRESET_PAYLOADS[0].channel);
  const [selectedSchemaId, setSelectedSchemaId] = useState(SAMPLE_PRESET_PAYLOADS[0].schemaId);
  const [isInjecting, setIsInjecting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleOpenWizard = (templateId: string = 'tpl_web_sdk') => {
    setWizardTemplateId(templateId);
    setIsWizardOpen(true);
  };

  const handlePresetChange = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = SAMPLE_PRESET_PAYLOADS[index];
    setRawJsonText(preset.rawJson);
    setSelectedChannel(preset.channel);
    setSelectedSchemaId(preset.schemaId);
    setLastResult(null);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // ignore
    }
  };

  const handleFireEvent = () => {
    setIsInjecting(true);
    setTimeout(() => {
      const res = ingestEvent(rawJsonText, selectedChannel, selectedSchemaId);
      setLastResult(res);
      setIsInjecting(false);
    }, 280);
  };

  const getSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe': return <Globe className="w-4 h-4 text-[#1473E6]" />;
      case 'smartphone': return <Smartphone className="w-4 h-4 text-[#0EA5E9]" />;
      case 'layers': return <Layers className="w-4 h-4 text-[#0284C7]" />;
      case 'database': return <Database className="w-4 h-4 text-[#1D4ED8]" />;
      case 'cloud': return <Cloud className="w-4 h-4 text-[#3B82F6]" />;
      case 'store': return <Store className="w-4 h-4 text-[#0A3D82]" />;
      default: return <Radio className="w-4 h-4 text-[#0F58B8]" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Modals */}
      <GuidedIngestionSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialSourceType={wizardTemplateId}
      />

      <FileIngestionModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
      />

      <MethodGuideModal
        method={selectedGuideMethod}
        isOpen={!!selectedGuideMethod}
        onClose={() => setSelectedGuideMethod(null)}
        onLaunchWizard={(templateId) => {
          setSelectedGuideMethod(null);
          handleOpenWizard(templateId);
        }}
      />

      {/* Top Banner with Colored Background Strip */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_data_management" fallbackLabel="Data Management" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">Data Ingestion & Streaming Pipelines</h2>
              <span className="text-[10px] bg-white/15 text-sky-200 border border-sky-200/40 font-bold px-2 py-0.5 rounded uppercase backdrop-blur-xs">
                Real-Time Stream & Batch
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5 max-w-3xl leading-relaxed">
              Connect, configure, and ingest real-time event streams and batch data directly into canonical XDM schemas with continuous deterministic identity resolution.
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('xdm_tester')}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-2 border border-white/25 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-sky-200 fill-sky-200" />
            <span>Live XDM Tester & Edge Simulator</span>
          </button>

          <button
            id="btn-create-data-ingestion"
            onClick={() => handleOpenWizard('tpl_web_sdk')}
            className="px-4 py-2 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-2 border border-white/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Data Ingestion</span>
          </button>

          <span className="text-xs font-mono text-blue-100 bg-white/15 border border-white/25 px-3 py-2 rounded-lg hidden sm:inline-block">
            Engine: <strong className="text-white">Apache Flink 1.18</strong>
          </span>
        </div>
      </div>

      {/* STEP 1: DEDICATED EXCEL & CSV FILE INGESTION (Main Section on Top) */}
      <div id="section-file-ingestion">
        <ExcelCsvFileIngestionSection />
      </div>

      {/* STEP 2: Guided Ingestion Methods & Streaming Protocols */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden">
        {/* Colored Background Strip Header */}
        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs shrink-0">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0D66D0] px-2 py-0.5 rounded shadow-2xs">
                  Step 2
                </span>
                <h3 className="text-sm font-bold text-white">Real-Time Streaming & Application Connectors</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shadow-2xs">
                  SDKs & Cloud Endpoints
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5 max-w-2xl">
                Choose an ingestion protocol below to deploy client-side Alloy tags, mobile app SDKs, or cloud warehouse zero-copy pushdown connectors.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                const el = document.getElementById('section-file-ingestion');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold px-3.5 py-1.5 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] border border-white/80 rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Jump to Step 1 Upload</span>
            </button>
          </div>
        </div>

        {/* 6 Ingestion Methods Grid */}
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {GUIDED_METHODS.map((method) => {
            const isFile = method.id === 'tpl_file_upload';
            return (
              <div
                key={method.id}
                className="p-4 rounded border border-[#E1E5EA] bg-[#FFFFFF] hover:border-[#1473E6] hover:shadow-2xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded bg-[#F8F9FA] border border-[#E1E5EA] group-hover:border-[#C5DCFA] group-hover:bg-[#F2F7FE] transition-colors">
                      {getSourceIcon(method.icon)}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                        {method.badge}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                    <span>{method.title}</span>
                  </h4>
                  <p className="text-[10px] text-[#1473E6] font-medium mt-0.5">{method.subtitle}</p>

                  <p className="text-[11px] text-[#1E2229] mt-2 line-clamp-2 leading-relaxed">
                    {method.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E1E5EA] space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] text-[#1E2229]">
                    <span className="font-mono text-[#0284C7] font-semibold">{method.sla}</span>
                    <span className="truncate max-w-[140px] text-right font-mono text-[#555]">{method.protocol.split('|')[0]}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedGuideMethod(method)}
                      className="w-full py-1.5 px-2 bg-[#F2F4F7] hover:bg-[#E1E5EA] text-[#2C2C2C] font-semibold text-[11px] rounded border border-[#D5D5D5] transition-colors flex items-center justify-center gap-1"
                    >
                      <Code className="w-3 h-3 text-[#1473E6]" />
                      <span>Setup Guide</span>
                    </button>

                    {isFile ? (
                      <button
                        onClick={() => setIsFileModalOpen(true)}
                        className="w-full py-1.5 px-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-[11px] rounded shadow-2xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenWizard(method.id)}
                        className="w-full py-1.5 px-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-[11px] rounded shadow-2xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Configure</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* STEP 3: Connected Ingestion Connectors Catalog */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden">
        {/* Colored Background Strip Header */}
        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0D66D0] px-2 py-0.5 rounded shadow-2xs">
                  Step 3
                </span>
                <h3 className="text-sm font-bold text-white">Active Data Ingestion Connectors Catalog</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shadow-2xs">
                  {sources.length} Active Endpoints
                </span>
                {sources.length > 0 && (
                  <span className="text-[10px] text-sky-200 font-bold flex items-center gap-1.5 bg-white/15 px-2 py-0.5 rounded border border-sky-200/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                    All Operational
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                Active streaming pipelines, SDK collectors, and batch warehouse connectors feeding canonical schemas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {sources.length === 0 && (
              <button
                onClick={loadDemoSources}
                className="text-xs font-semibold px-3 py-1.5 text-white hover:bg-white/25 bg-white/15 border border-white/25 rounded-md transition-colors shadow-2xs cursor-pointer"
              >
                Load 19 Demo Connectors
              </button>
            )}
            <button
              onClick={() => handleOpenWizard('tpl_web_sdk')}
              className="text-xs font-bold px-3.5 py-1.5 bg-white text-[#0D66D0] hover:bg-[#F2F7FE] border border-white/80 rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Add Connector</span>
            </button>
          </div>
        </div>

        <div className="p-5">
        {sources.length === 0 ? (
          <div className="p-6 border border-dashed border-[#C5DCFA] bg-[#F2F7FE] rounded text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white border border-[#C5DCFA] flex items-center justify-center text-[#1473E6] mx-auto">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#2C2C2C]">No Ingestion Connectors Configured Yet</h4>
            <p className="text-[11px] text-[#1E2229] max-w-md mx-auto">
              Follow one of the guided methods above or click "Create Data Ingestion" to set up your first stream.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => handleOpenWizard('tpl_web_sdk')}
                className="px-3 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded transition-colors"
              >
                Create Ingestion Connector
              </button>
              <button
                onClick={loadDemoSources}
                className="px-3 py-1.5 bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] font-semibold text-xs rounded border border-[#D5D5D5] transition-colors"
              >
                Populate Demo Connectors
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-[#FFFFFF] p-3.5 rounded border border-[#E1E5EA] shadow-2xs flex flex-col justify-between hover:border-[#1473E6] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded bg-[#F2F4F7] border border-[#E1E5EA]">
                      {getSourceIcon(src.icon)}
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                      {src.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#2C2C2C] truncate" title={src.name}>
                    {src.name}
                  </h4>
                  <p className="text-[10px] text-[#1E2229] mt-0.5 font-mono">{src.latencyMs}ms Latency</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E1E5EA] flex items-baseline justify-between text-[11px]">
                  <span className="text-[#1E2229] text-[10px]">Today:</span>
                  <span className="font-bold text-[#2C2C2C] font-mono">{(src.todayEventCount / 1000).toFixed(1)}k</span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* STEP 4: Developer Diagnostics & Edge Simulator (Optional, Collapsible by default) */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#CBD5E1] shadow-xs overflow-hidden">
        {/* Accordion Toggle Header */}
        <button
          onClick={() => setIsPresetAccordionOpen(!isPresetAccordionOpen)}
          className={`w-full px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-all focus:outline-none bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] hover:brightness-105 text-white cursor-pointer ${
            isPresetAccordionOpen ? 'border-b border-[#0E4DA4]' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs shrink-0">
              <Wrench className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/25 px-2 py-0.5 rounded shadow-2xs">
                  Step 4 (Optional)
                </span>
                <h3 className="text-sm font-bold text-white">Developer Tools, Edge Decisioning & Live Simulator</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shadow-2xs">
                  Advanced Diagnostics
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                {isPresetAccordionOpen
                  ? 'Active developer mode. Click header to collapse edge console and simulation tools.'
                  : 'Click to expand Edge Console, cURL snippets, Web SDK playground, and preset scenario simulators.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold px-3.5 py-1.5 bg-white text-[#0D66D0] hover:bg-[#F2F4F7] rounded-md transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap">
              <span>{isPresetAccordionOpen ? 'Hide Developer Tools' : 'Open Developer Tools'}</span>
              {isPresetAccordionOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#0D66D0]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#0D66D0]" />}
            </span>
          </div>
        </button>

        {/* Accordion Content (Reveals the Edge Console, Preset Scenarios and Event Transformer) */}
        {isPresetAccordionOpen && (
          <div className="p-5 bg-[#FFFFFF] space-y-6">
            {/* Real-Time Live Streaming Edge Console & Web SDK Playground */}
            <LiveEdgeStreamConsole />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Preset Selector & JSON Editor */}
              <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Live Event Simulator & Transformer</h4>
                      <p className="text-[10px] text-blue-100 font-medium">Select a preset scenario below or edit the raw JSON directly</p>
                    </div>
                  </div>
                  <button
                    onClick={handleFormatJson}
                    className="text-[11px] font-bold text-[#0D66D0] hover:bg-[#F2F7FE] bg-white border border-white/80 px-2.5 py-1 rounded shadow-xs transition-colors cursor-pointer"
                  >
                    Prettify JSON
                  </button>
                </div>

                <div className="p-5 space-y-4 flex flex-col flex-1">

                {/* Preset Scenario Buttons */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-2">
                    Preset Ingestion Scenarios
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_PRESET_PAYLOADS.map((preset, idx) => {
                      const isSelected = idx === selectedPresetIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => handlePresetChange(idx)}
                          className={`p-2.5 rounded border text-left transition-all ${
                            isSelected
                              ? 'bg-[#EBF3FC] border-[#1473E6] text-[#1E2229] ring-1 ring-[#1473E6]'
                              : 'bg-[#F2F4F7] border-[#E1E5EA] hover:bg-[#E1E5EA] text-[#2C2C2C]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#2C2C2C]">{preset.name}</span>
                            <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#1E2229] border border-[#D5D5D5]">
                              {preset.channel}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#1E2229] mt-1 line-clamp-1">{preset.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Config Row */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                      Source Channel
                    </label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-semibold bg-[#F2F4F7] text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                    >
                      <option value="Web SDK">Web SDK</option>
                      <option value="Mobile SDK">Mobile SDK</option>
                      <option value="Snowflake Batch">Snowflake Batch</option>
                      <option value="Salesforce CRM">Salesforce CRM</option>
                      <option value="POS Terminal">POS Terminal</option>
                      <option value="Kafka Ingestion">Kafka Ingestion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                      Target Schema
                    </label>
                    <select
                      value={selectedSchemaId}
                      onChange={(e) => setSelectedSchemaId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#D5D5D5] rounded text-xs font-semibold bg-[#F2F4F7] text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                    >
                      {schemas.length === 0 ? (
                        <option value="auto_dynamic">Auto-Normalize (Dynamic XDM)</option>
                      ) : (
                        schemas.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* JSON Textarea */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                    Raw JSON Payload Editor
                  </label>
                  <textarea
                    rows={8}
                    value={rawJsonText}
                    onChange={(e) => setRawJsonText(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-[#1E1E1E] text-[#9CDCFE] rounded border border-[#3E3E3E] focus:outline-none focus:ring-1 focus:ring-[#1473E6] resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Trigger Ingestion Button */}
                <button
                  onClick={handleFireEvent}
                  disabled={isInjecting}
                  className="w-full py-2.5 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded shadow-2xs transition-all flex items-center justify-center space-x-2"
                >
                  {isInjecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting into Real-Time Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Fire Ingestion Stream & Stitch Identity</span>
                    </>
                  )}
                </button>
                </div>
              </div>

              {/* Right: Transformation & Resolution Result Visualizer */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="bg-[#FFFFFF] rounded-xl border border-[#B3D4FA] shadow-xs overflow-hidden flex flex-col flex-1">
                  <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-xs">
                        <GitMerge className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Deterministic Transformation Result</h4>
                    </div>
                    {lastResult && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs ${
                        lastResult.success ? 'bg-white text-[#0D66D0]' : 'bg-white text-[#0A3D82]'
                      }`}>
                        {lastResult.isMerged ? 'MERGED PROFILES' : lastResult.isNew ? 'NEW PROFILE' : 'PROFILE UPDATED'}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">

                  {lastResult ? (
                    <div className="space-y-3.5 flex-1">
                      <div className={`p-3.5 rounded border ${
                        lastResult.isMerged
                          ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                          : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1]'
                      }`}>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#0284C7] mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-xs">{lastResult.message}</p>
                            <p className="text-[11px] text-[#1A1D23] mt-0.5">
                              Profile ID: <strong className="font-mono text-[#2C2C2C]">{lastResult.profileId}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Extracted Identifiers */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1.5">
                          Extracted Identity Keys
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {lastResult.matchedIdentifiers.map((idKey: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-[#EBF3FC] border border-[#C5DCFA] text-[#0D66D0] rounded text-xs font-mono font-bold"
                            >
                              {idKey}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Transformed Payload */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229] mb-1.5">
                          Canonical Normalized XDM Mapping
                        </p>
                        <div className="p-3 bg-[#1E1E1E] text-[#D4D4D4] font-mono text-[11px] rounded border border-[#3E3E3E] max-h-40 overflow-y-auto">
                          <pre className="text-[#4EC9B0]">{JSON.stringify(lastResult.transformedPayload, null, 2)}</pre>
                        </div>
                      </div>

                      {/* Profile Link Action */}
                      <button
                        onClick={() => {
                          setSelectedProfileId(lastResult.profileId);
                          setActiveTab('profiles');
                        }}
                        className="w-full py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Inspect Unified Profile in 360 Explorer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#1E2229] space-y-2">
                      <Sparkles className="w-8 h-8 text-[#1473E6] opacity-60" />
                      <p className="font-bold text-xs text-[#2C2C2C]">Awaiting Event Execution</p>
                      <p className="text-[11px] text-[#1E2229] max-w-xs">
                        Click "Fire Ingestion Stream" above to run immediate schema mapping, deterministic identity linking, and real-time audience evaluation.
                      </p>
                    </div>
                  )}
                  </div>
                </div>

                {/* Terminal Log Widget */}
                <TerminalLog maxItems={4} className="h-44" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
