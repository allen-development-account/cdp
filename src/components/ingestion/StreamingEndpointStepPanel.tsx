import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Radio,
  Upload,
  Server,
  Copy,
  Check,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Table,
  Sparkles,
  UserCheck,
  Store,
  Cloud,
  Smartphone,
  Webhook
} from 'lucide-react';

export type StreamingEndpointMode =
  | 'rest_api'
  | 'batch_file'
  | 'message_bus'
  | 'kafka_stream'
  | 'pos_terminal'
  | 'cloud_storage'
  | 'mobile_sdk'
  | 'salesforce_webhook';

interface StreamingEndpointStepPanelProps {
  mode: StreamingEndpointMode;
  onComplete: (summary: {
    sourceName: string;
    channel: string;
    schemaId: string;
    profileId?: string;
    latencyMs?: number;
    databricksSynced?: boolean;
    message: string;
  }) => void;
}

const SAMPLE_BATCH_ROWS = [
  {
    customer_email: 'claire.dubois@luxeglobal.fr',
    firstName: 'Claire',
    lastName: 'Dubois',
    eventType: 'Purchase',
    total_amount: 420.0,
    customer_tier: 'Platinum',
    city: 'Paris'
  },
  {
    customer_email: 'kenji.sato@tokyotech.co.jp',
    firstName: 'Kenji',
    lastName: 'Sato',
    eventType: 'AddToCart',
    total_amount: 189.0,
    customer_tier: 'VIP',
    city: 'Tokyo'
  },
  {
    customer_email: 'sarah.miller@austinfintech.io',
    firstName: 'Sarah',
    lastName: 'Miller',
    eventType: 'CartAbandoned',
    total_amount: 640.0,
    customer_tier: 'Gold',
    city: 'Austin'
  }
];

export const StreamingEndpointStepPanel: React.FC<StreamingEndpointStepPanelProps> = ({ mode, onComplete }) => {
  const {
    schemas,
    sources,
    addSource,
    ingestEvent,
    createDataset,
    addTerminalLog,
    addAuditLog,
    setActiveTab,
    setSelectedProfileId
  } = useCDP();

  const originUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  }, []);

  const collectEndpoint = `${originUrl}/api/v1/collect`;

  const [schemaId, setSchemaId] = useState(
    mode === 'batch_file' || mode === 'cloud_storage' ? 'xdm_individual_profile' : 'xdm_experience_event'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<{
    ok: boolean;
    message: string;
    profileId?: string;
    latencyMs?: number;
    databricksSynced?: boolean;
  } | null>(null);

  // REST / POS / Salesforce JSON payload states
  const getInitialPayloadForMode = (targetMode: StreamingEndpointMode) => {
    if (targetMode === 'pos_terminal') {
      return JSON.stringify(
        {
          channel: 'POS Terminal',
          eventType: 'InStorePurchase',
          customer_email: 'claire.dubois@luxeglobal.fr',
          loyalty_card_id: 'LYT-POS-88412',
          store_id: 'STORE_NYC_FLAGSHIP_01',
          terminal_id: 'POS-REG-04',
          sku: 'LUXE-SILK-SCARF-01',
          total_amount: 340.0
        },
        null,
        2
      );
    }
    if (targetMode === 'salesforce_webhook') {
      return JSON.stringify(
        {
          channel: 'Salesforce CRM',
          eventType: 'CRMContactUpdated',
          customer_email: 'elena.rostova@techenterprise.com',
          crm_id: 'SFDC_0034W000021aZq',
          firstName: 'Elena',
          lastName: 'Rostova',
          customer_tier: 'VIP',
          lifecycle_stage: 'Enterprise Opportunity'
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        channel: 'Web SDK',
        eventType: 'SubscriptionActivated',
        customer_email: 'marcus.vance@vancemedia.io',
        anon_cookie_id: 'ck_rest_882914',
        total_amount: 890.0,
        sku: 'XLR8-ENTERPRISE-PLAN'
      },
      null,
      2
    );
  };

  const [restTab, setRestTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [restPayload, setRestPayload] = useState(() => getInitialPayloadForMode(mode));

  // Batch File (CSV / JSON)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [batchFileName, setBatchFileName] = useState('commerce_batch_export.json');
  const [batchRows, setBatchRows] = useState<Record<string, any>[]>(SAMPLE_BATCH_ROWS);

  // Kafka / Message Bus
  const [kafkaBrokers, setKafkaBrokers] = useState('pkc-4r29z.us-east-1.aws.confluent.cloud:9092');
  const [kafkaTopic, setKafkaTopic] = useState('enterprise.cdp.commerce.events');
  const [kafkaGroup, setKafkaGroup] = useState('xlr8-flink-ingest-v1');

  // POS Terminal settings
  const [posStoreId, setPosStoreId] = useState('STORE_NYC_FLAGSHIP_01');
  const [posRegion, setPosRegion] = useState('North America East');

  // Cloud Storage Bucket (AWS S3 / GCS)
  const [storageProvider, setStorageProvider] = useState<'aws_s3' | 'gcs'>('aws_s3');
  const [bucketUri, setBucketUri] = useState('s3://northstar-cdp-lake/daily-exports/');
  const [bucketFormat, setBucketFormat] = useState<'parquet' | 'csv' | 'json'>('parquet');

  // Mobile SDK (iOS & Android)
  const [mobilePlatform, setMobilePlatform] = useState<'ios' | 'android'>('ios');
  const [mobileAppId, setMobileAppId] = useState('xlr8_mobile_commerce_prod');
  const [mobileEmail, setMobileEmail] = useState('sophia.tanaka@designstudios.jp');

  // Salesforce CRM Webhook
  const [sfdcOrgId, setSfdcOrgId] = useState('00D5g000008K9XLEAM');
  const [sfdcObject, setSfdcObject] = useState<'Contact' | 'Lead' | 'Opportunity'>('Contact');

  useEffect(() => {
    setStatusResult(null);
    setSchemaId(mode === 'batch_file' || mode === 'cloud_storage' ? 'xdm_individual_profile' : 'xdm_experience_event');
    setRestPayload(getInitialPayloadForMode(mode));
  }, [mode]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const restSnippets = {
    curl: `curl -X POST "${collectEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${restPayload.replace(/\n/g, '\n  ')}'`,
    node: `const res = await fetch('${collectEndpoint}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${restPayload})
});
const result = await res.json();
console.log(result);`,
    python: `import requests

response = requests.post(
    "${collectEndpoint}",
    json=${restPayload}
)
print(response.status_code, response.json())`
  };

  const kafkaPropertiesSnippet = `bootstrap.servers=${kafkaBrokers}
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
topic=${kafkaTopic}
group.id=${kafkaGroup}
auto.offset.reset=latest
enable.idempotence=true`;

  const mobileSnippets = {
    ios: `import XLR8MobileCore
import XLR8Edge

// Initialize in AppDelegate
MobileCore.registerExtensions([Edge.self, Identity.self]) {
    MobileCore.configureWith(appId: "${mobileAppId}")
}

// Stream Mobile Purchase / Cart Event
let xdmEvent = ExperienceEvent(xdm: [
    "customer_email": "${mobileEmail}",
    "eventType": "InAppPurchase",
    "sku": "MOBILE-VIP-BUNDLE",
    "total_amount": 199.00
])
Edge.sendEvent(experienceEvent: xdmEvent)`,
    android: `import com.xlr8.mobile.MobileCore
import com.xlr8.mobile.Edge
import com.xlr8.mobile.ExperienceEvent

// Initialize in Application.onCreate()
MobileCore.configureWithAppID("${mobileAppId}")

// Stream Android Commerce Telemetry
val eventData = mapOf(
    "customer_email" to "${mobileEmail}",
    "eventType" to "AddToCart",
    "sku" to "MOBILE-VIP-BUNDLE",
    "total_amount" to 199.00
)
Edge.sendEvent(ExperienceEvent.Builder().setXdmSchema(eventData).build())`
  };

  const handleExecuteJsonPost = async (opts: {
    sourceId: string;
    sourceName: string;
    sourceType: 'Streaming' | 'Webhook';
    category: 'Web & Mobile' | 'Event Streams' | 'Enterprise CRM' | 'Commerce & Retail';
    icon: string;
    channelLabel: string;
    authMethod: string;
    description: string;
  }) => {
    setIsExecuting(true);
    setStatusResult(null);
    try {
      const parsed = JSON.parse(restPayload);
      const bodyPayload = {
        schemaId,
        channel: parsed.channel || opts.channelLabel,
        ...parsed
      };

      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (!sources.some((s) => s.id === opts.sourceId)) {
          addSource({
            id: opts.sourceId,
            name: opts.sourceName,
            type: opts.sourceType,
            status: 'Healthy',
            ratePerSec: 24,
            todayEventCount: 1,
            latencyMs: data.latencyMs || 2.9,
            description: opts.description,
            icon: opts.icon,
            category: opts.category,
            targetSchemaId: schemaId,
            targetSchemaName: schemas.find((s) => s.id === schemaId)?.name || 'XDM Experience Event',
            authMethod: opts.authMethod
          });
        }

        addTerminalLog('success', 'ENDPOINT-INGEST', `${opts.sourceName} verified (${data.latencyMs}ms) -> ${data.profileId}`);
        addAuditLog({
          userId: 'usr_current_operator',
          userName: 'Current Operator',
          userRole: 'Data Architect',
          category: 'Schema & Ingestion',
          action: `Connected ${opts.sourceName}`,
          targetEntity: opts.sourceName,
          status: 'SUCCESS',
          summary: `Verified HTTP POST ingestion into ${schemaId} (${data.latencyMs}ms).`,
          complianceFlags: ['HTTPS Validated', 'Identity Stitched']
        });

        const msg = `${opts.sourceName} verified (${data.latencyMs}ms) and stitched to profile ${data.profileId}.`;
        setStatusResult({
          ok: true,
          message: msg,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced
        });

        onComplete({
          sourceName: opts.sourceName,
          channel: opts.channelLabel,
          schemaId,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced,
          message: msg
        });
      } else {
        setStatusResult({ ok: false, message: data.message || data.error || 'Ingestion request failed' });
      }
    } catch (err: any) {
      setStatusResult({ ok: false, message: `Invalid JSON or request failed: ${err.message}` });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBatchFileName(file.name);
    setStatusResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result || '');
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          setBatchRows(rows);
        } else {
          const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
            const rows = lines.slice(1).map((line) => {
              const vals = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
              const obj: Record<string, any> = {};
              headers.forEach((h, i) => {
                const raw = vals[i] || '';
                const num = Number(raw);
                obj[h] = !isNaN(num) && raw !== '' ? num : raw;
              });
              return obj;
            });
            setBatchRows(rows);
          }
        }
      } catch (err) {
        console.error('Batch file parse error:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBatchIngest = async () => {
    if (batchRows.length === 0) return;
    setIsExecuting(true);
    setStatusResult(null);

    try {
      batchRows.forEach((row) => {
        ingestEvent(row, 'Snowflake Batch', schemaId);
      });

      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          batchRows.map((row) => ({
            channel: 'Batch File (CSV/JSON)',
            schemaId,
            ...row
          }))
        )
      });
      const data = await res.json();

      const schemaName = schemas.find((s) => s.id === schemaId)?.name || 'Individual Profile';
      createDataset({
        name: `Batch Import - ${batchFileName.replace(/\.[^/.]+$/, '')}`,
        schemaName,
        schemaId,
        sourceConnectorName: 'Batch File Ingestion (CSV/JSON)',
        ingestionType: 'batch',
        format: batchFileName.endsWith('.json') ? 'json' : 'csv',
        recordCount: batchRows.length,
        sizeBytes: batchRows.length * 480,
        sizeFormatted: `${(batchRows.length * 0.48).toFixed(1)} KB`,
        status: 'Active',
        labels: ['C1', 'I1', 'R1'],
        description: `Ingested ${batchRows.length} batch records from ${batchFileName}.`
      });

      const sourceName = 'Batch File Ingestion (CSV / JSON)';
      if (!sources.some((s) => s.id === 'src_batch_file_upload')) {
        addSource({
          id: 'src_batch_file_upload',
          name: sourceName,
          type: 'Batch',
          status: 'Healthy',
          ratePerSec: 0,
          todayEventCount: batchRows.length,
          latencyMs: data.latencyMs || 18,
          description: `Structured CSV/JSON batch upload gateway (${batchFileName}).`,
          icon: 'database',
          category: 'Data Warehouses',
          targetSchemaId: schemaId,
          targetSchemaName: schemaName,
          authMethod: 'Batch Schema Validator'
        });
      }

      const msg = `Ingested ${batchRows.length} batch records from ${batchFileName} into ${schemaName}.`;
      setStatusResult({
        ok: true,
        message: msg,
        latencyMs: data.latencyMs,
        databricksSynced: data.databricksSynced
      });

      onComplete({
        sourceName,
        channel: 'Batch File (CSV/JSON)',
        schemaId,
        latencyMs: data.latencyMs,
        databricksSynced: data.databricksSynced,
        message: msg
      });
    } catch (err: any) {
      setStatusResult({ ok: false, message: err.message || 'Batch ingestion failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleConnectKafka = async () => {
    setIsExecuting(true);
    setStatusResult(null);
    try {
      const testMsgPayload = {
        channel: 'Kafka Ingestion',
        schemaId,
        eventType: 'AddToCart',
        customer_email: 'elena.rostova@techenterprise.com',
        anon_cookie_id: 'kafka_evt_' + Date.now().toString(36),
        sku: 'CLOUD-CLUSTER-X8',
        total_amount: 1299.0,
        kafka_topic: kafkaTopic,
        consumer_group: kafkaGroup
      };

      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMsgPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const labelPrefix = mode === 'kafka_stream' ? 'Apache Kafka / Confluent Stream' : 'Enterprise Message Bus';
        const sourceName = `${labelPrefix} (${kafkaTopic})`;
        const sourceId = mode === 'kafka_stream' ? 'src_apache_kafka_stream' : 'src_enterprise_kafka_bus';

        if (!sources.some((s) => s.id === sourceId)) {
          addSource({
            id: sourceId,
            name: sourceName,
            type: 'Streaming',
            status: 'Healthy',
            ratePerSec: 64,
            todayEventCount: 1,
            latencyMs: data.latencyMs || 1.8,
            description: `Kafka topic subscriber (${kafkaTopic}) via consumer group ${kafkaGroup}.`,
            icon: 'radio',
            category: 'Event Streams',
            targetSchemaId: schemaId,
            targetSchemaName: schemas.find((s) => s.id === schemaId)?.name || 'XDM Experience Event',
            authMethod: 'SASL_SSL / mTLS'
          });
        }

        addTerminalLog('success', 'KAFKA-BUS', `Subscribed to ${kafkaTopic} & consumed test message (${data.latencyMs}ms)`);

        const msg = `Connected ${labelPrefix} on topic "${kafkaTopic}" (${data.latencyMs}ms).`;
        setStatusResult({
          ok: true,
          message: msg,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced
        });

        onComplete({
          sourceName,
          channel: 'Kafka Ingestion',
          schemaId,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced,
          message: msg
        });
      } else {
        setStatusResult({ ok: false, message: data.message || 'Kafka verification failed' });
      }
    } catch (err: any) {
      setStatusResult({ ok: false, message: err.message || 'Failed to connect Kafka stream' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSyncCloudBucket = async () => {
    setIsExecuting(true);
    setStatusResult(null);
    try {
      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          SAMPLE_BATCH_ROWS.map((r) => ({
            channel: storageProvider === 'aws_s3' ? 'AWS S3 Bucket' : 'Google Cloud Storage',
            schemaId,
            bucket_uri: bucketUri,
            file_format: bucketFormat,
            ...r
          }))
        )
      });
      const data = await res.json();

      const providerName = storageProvider === 'aws_s3' ? 'AWS S3' : 'Google Cloud Storage';
      const sourceName = `Cloud Storage Bucket (${providerName})`;
      const schemaName = schemas.find((s) => s.id === schemaId)?.name || 'Individual Profile';

      createDataset({
        name: `${providerName} Export (${bucketFormat.toUpperCase()})`,
        schemaName,
        schemaId,
        sourceConnectorName: sourceName,
        ingestionType: 'batch',
        format: bucketFormat,
        recordCount: SAMPLE_BATCH_ROWS.length,
        sizeBytes: 2450,
        sizeFormatted: '2.4 KB',
        status: 'Active',
        labels: ['C1', 'I1', 'R1'],
        description: `Automated ${bucketFormat.toUpperCase()} ingestion from ${bucketUri}`
      });

      if (!sources.some((s) => s.id === 'src_cloud_storage_bucket')) {
        addSource({
          id: 'src_cloud_storage_bucket',
          name: sourceName,
          type: 'Batch',
          status: 'Healthy',
          ratePerSec: 12,
          todayEventCount: SAMPLE_BATCH_ROWS.length,
          latencyMs: data.latencyMs || 14,
          description: `Scheduled cloud object ingestion from ${bucketUri} (${bucketFormat}).`,
          icon: 'cloud',
          category: 'Data Warehouses',
          targetSchemaId: schemaId,
          targetSchemaName: schemaName,
          authMethod: storageProvider === 'aws_s3' ? 'IAM Role ARN' : 'GCP Service Account'
        });
      }

      const msg = `Synced ${SAMPLE_BATCH_ROWS.length} ${bucketFormat.toUpperCase()} objects from ${bucketUri}.`;
      setStatusResult({
        ok: true,
        message: msg,
        latencyMs: data.latencyMs,
        databricksSynced: data.databricksSynced
      });

      onComplete({
        sourceName,
        channel: providerName,
        schemaId,
        latencyMs: data.latencyMs,
        databricksSynced: data.databricksSynced,
        message: msg
      });
    } catch (err: any) {
      setStatusResult({ ok: false, message: err.message || 'Cloud bucket sync failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTestMobileSdk = async () => {
    setIsExecuting(true);
    setStatusResult(null);
    try {
      const payload = {
        channel: 'Mobile SDK',
        schemaId,
        eventType: 'InAppPurchase',
        customer_email: mobileEmail,
        device_token: `${mobilePlatform}_idfa_${Date.now().toString().slice(-6)}`,
        app_id: mobileAppId,
        os_platform: mobilePlatform === 'ios' ? 'iOS 18.2' : 'Android 15',
        sku: 'MOBILE-VIP-BUNDLE',
        total_amount: 199.0
      };

      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const sourceName = `Mobile SDK (${mobilePlatform === 'ios' ? 'iOS Swift' : 'Android Kotlin'})`;
        if (!sources.some((s) => s.id === 'src_mobile_sdk_live')) {
          addSource({
            id: 'src_mobile_sdk_live',
            name: sourceName,
            type: 'Streaming',
            status: 'Healthy',
            ratePerSec: 32,
            todayEventCount: 1,
            latencyMs: data.latencyMs || 2.8,
            description: `Native iOS & Android SDK telemetry (${mobileAppId}) with offline event queuing.`,
            icon: 'smartphone',
            category: 'Web & Mobile',
            targetSchemaId: schemaId,
            targetSchemaName: schemas.find((s) => s.id === schemaId)?.name || 'XDM Experience Event',
            authMethod: 'App Key + ECID'
          });
        }

        const msg = `Mobile SDK telemetry verified (${data.latencyMs}ms) for ${mobileEmail}.`;
        setStatusResult({
          ok: true,
          message: msg,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced
        });

        onComplete({
          sourceName,
          channel: 'Mobile SDK',
          schemaId,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced,
          message: msg
        });
      } else {
        setStatusResult({ ok: false, message: data.message || 'Mobile SDK test failed' });
      }
    } catch (err: any) {
      setStatusResult({ ok: false, message: err.message || 'Mobile SDK request failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const headerMeta: Record<StreamingEndpointMode, { title: string; badge: string; desc: string; Icon: any }> = {
    rest_api: {
      title: 'Streaming REST API & Webhooks',
      badge: 'Direct HTTPS POST',
      desc: 'Stream server-side commerce, CRM, or payment webhook events directly via HTTPS POST into /api/v1/collect.',
      Icon: Radio
    },
    batch_file: {
      title: 'Batch File Ingestion (CSV / JSON)',
      badge: 'Structured File Parser',
      desc: 'Upload structured CSV or JSON customer lists and transaction batches with automatic XDM schema binding.',
      Icon: Upload
    },
    message_bus: {
      title: 'Enterprise Message Bus',
      badge: 'Partitioned Event Bus',
      desc: 'Subscribe to high-throughput enterprise message bus topics with exactly-once Flink streaming normalization.',
      Icon: Server
    },
    kafka_stream: {
      title: 'Apache Kafka / Confluent Stream',
      badge: 'Kafka / Confluent',
      desc: 'Consume partitioned real-time clickstream and order event topics directly from Confluent Cloud or Apache Kafka.',
      Icon: Radio
    },
    pos_terminal: {
      title: 'Retail POS Terminal Stream',
      badge: 'Omnichannel Store POS',
      desc: 'Ingest real-time brick-and-mortar checkout receipts, loyalty IDs, and store SKU telemetry into Customer 360.',
      Icon: Store
    },
    cloud_storage: {
      title: 'Cloud Storage Bucket (AWS S3 / GCS)',
      badge: 'Cloud Object Sync',
      desc: 'Synchronize Parquet, CSV, or JSON customer exports from Amazon S3 or Google Cloud Storage buckets.',
      Icon: Cloud
    },
    mobile_sdk: {
      title: 'Mobile SDK (iOS & Android)',
      badge: 'Native App Telemetry',
      desc: 'Deploy native Swift and Kotlin SDK collectors to capture in-app purchases, screen views, and push tokens.',
      Icon: Smartphone
    },
    salesforce_webhook: {
      title: 'Salesforce CRM Webhook',
      badge: 'Enterprise CRM Sync',
      desc: 'Stream real-time Lead, Contact, and Opportunity updates from Salesforce Outbound Messages or Apex webhooks.',
      Icon: Webhook
    }
  };

  const currentMeta = headerMeta[mode];
  const HeaderIcon = currentMeta.Icon;
  const batchColumns = batchRows.length > 0 ? Object.keys(batchRows[0]).slice(0, 6) : [];

  return (
    <div className="bg-white rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
      {/* Step 2 Header Strip (Matches Step 1 Styling) */}
      <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
            <HeaderIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                Step 2
              </span>
              <h3 className="text-base font-bold text-white">{currentMeta.title}</h3>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">{currentMeta.desc}</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25 shrink-0 self-start sm:self-center">
          {currentMeta.badge}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* JSON HTTP POST MODES: REST API, POS TERMINAL, SALESFORCE WEBHOOK */}
        {(mode === 'rest_api' || mode === 'pos_terminal' || mode === 'salesforce_webhook') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                    {mode === 'pos_terminal'
                      ? 'POS Gateway Endpoint'
                      : mode === 'salesforce_webhook'
                      ? 'Salesforce Outbound Webhook URL'
                      : 'Live HTTPS Collection Endpoint'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('endpoint', collectEndpoint)}
                    className="text-xs font-bold text-[#1473E6] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'endpoint' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'endpoint' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <code className="block p-2.5 bg-[#0F172A] text-[#93C5FD] rounded-lg font-mono text-xs break-all">
                  POST {collectEndpoint}
                </code>

                {mode === 'pos_terminal' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">Store ID</label>
                      <input
                        type="text"
                        value={posStoreId}
                        onChange={(e) => setPosStoreId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">Region</label>
                      <input
                        type="text"
                        value={posRegion}
                        onChange={(e) => setPosRegion(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {mode === 'salesforce_webhook' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">Salesforce Org ID</label>
                      <input
                        type="text"
                        value={sfdcOrgId}
                        onChange={(e) => setSfdcOrgId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#1E2229] mb-1">CRM Object</label>
                      <select
                        value={sfdcObject}
                        onChange={(e) => setSfdcObject(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md text-xs font-semibold bg-white"
                      >
                        <option value="Contact">Contact</option>
                        <option value="Lead">Lead</option>
                        <option value="Opportunity">Opportunity</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#1E2229] mb-1">
                    Target Canonical XDM Schema
                  </label>
                  <select
                    value={schemaId}
                    onChange={(e) => setSchemaId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white"
                  >
                    {schemas.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-[#E1E5EA] rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(['curl', 'node', 'python'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRestTab(t)}
                        className={`px-2.5 py-1 rounded text-xs font-bold uppercase cursor-pointer ${
                          restTab === t ? 'bg-[#1473E6] text-white' : 'text-[#1E2229] hover:bg-[#E1E5EA]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('snippet', restSnippets[restTab])}
                    className="text-xs font-bold text-[#0D66D0] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'snippet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'snippet' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-[#0F172A] text-[#E2E8F0] font-mono text-[11px] overflow-x-auto max-h-52 leading-relaxed">
                  {restSnippets[restTab]}
                </pre>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="border border-[#E1E5EA] rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E2229]">Editable Event Payload</span>
                  <span className="text-[10px] font-mono text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                    application/json
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={restPayload}
                  onChange={(e) => setRestPayload(e.target.value)}
                  className="w-full p-3.5 font-mono text-xs bg-[#0F172A] text-[#93C5FD] focus:outline-none resize-none"
                  spellCheck={false}
                />
                <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E1E5EA]">
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => {
                      if (mode === 'pos_terminal') {
                        handleExecuteJsonPost({
                          sourceId: 'src_retail_pos_terminal',
                          sourceName: `Retail POS Terminal Stream (${posStoreId})`,
                          sourceType: 'Streaming',
                          category: 'Commerce & Retail',
                          icon: 'store',
                          channelLabel: 'POS Terminal',
                          authMethod: 'mTLS Store Key',
                          description: `In-store POS receipt & loyalty stream from ${posStoreId} (${posRegion}).`
                        });
                      } else if (mode === 'salesforce_webhook') {
                        handleExecuteJsonPost({
                          sourceId: 'src_salesforce_crm_webhook',
                          sourceName: `Salesforce CRM Webhook (${sfdcObject})`,
                          sourceType: 'Webhook',
                          category: 'Enterprise CRM',
                          icon: 'cloud',
                          channelLabel: 'Salesforce CRM',
                          authMethod: 'Signed Apex Webhook',
                          description: `Real-time ${sfdcObject} webhook stream from Salesforce Org ${sfdcOrgId}.`
                        });
                      } else {
                        handleExecuteJsonPost({
                          sourceId: 'src_streaming_rest_api',
                          sourceName: 'Streaming REST API & Webhooks',
                          sourceType: 'Webhook',
                          category: 'Web & Mobile',
                          icon: 'radio',
                          channelLabel: 'Web SDK',
                          authMethod: 'HTTPS Bearer / JSON',
                          description: `Direct HTTPS POST ingestion endpoint (${collectEndpoint}) for microservices and webhooks.`
                        });
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching Stream Event...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Live Test Event &amp; Complete Step 2</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BATCH FILE (CSV / JSON) MODE */}
        {mode === 'batch_file' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBatchFileUpload}
                  accept=".csv,.json,.txt"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-[#CBD5E1] hover:border-[#1473E6] bg-[#F8FAFC] hover:bg-[#EBF3FC] rounded-xl text-center cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-[#C5DCFA] flex items-center justify-center text-[#1473E6] mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#1E2229]">Select CSV or JSON Batch File</p>
                  <p className="text-xs text-[#5C6573] mt-1">
                    Active file: <span className="font-mono font-bold text-[#0D66D0]">{batchFileName}</span> ({batchRows.length} rows)
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#1E2229] mb-1">
                      Target XDM Schema
                    </label>
                    <select
                      value={schemaId}
                      onChange={(e) => setSchemaId(e.target.value)}
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white"
                    >
                      {schemas.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBatchFileName('commerce_batch_export.json');
                        setBatchRows(SAMPLE_BATCH_ROWS);
                      }}
                      className="w-full py-2 px-3 bg-white hover:bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Sample Batch File</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isExecuting || batchRows.length === 0}
                  onClick={handleExecuteBatchIngest}
                  className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Ingesting Batch Records...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Ingest {batchRows.length} Batch Records &amp; Complete Step 2</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="border border-[#E1E5EA] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center gap-2 text-xs font-bold text-[#1E2229]">
                <Table className="w-4 h-4 text-[#1473E6]" />
                <span>Parsed Batch Records Preview ({batchRows.length} rows)</span>
              </div>
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F2F4F7] border-b border-[#E1E5EA]">
                    <tr>
                      {batchColumns.map((c) => (
                        <th key={c} className="py-2 px-3 font-mono text-[11px] font-bold text-[#1E2229]">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {batchRows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-[#F8FAFC]">
                        {batchColumns.map((c) => (
                          <td key={c} className="py-2 px-3 font-mono text-[11px] text-[#1E2229]">
                            {String(r[c] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* KAFKA / CONFLUENT / ENTERPRISE MESSAGE BUS */}
        {(mode === 'message_bus' || mode === 'kafka_stream') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2229]">
                Kafka / Confluent Subscriber Settings
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Bootstrap Servers</label>
                <input
                  type="text"
                  value={kafkaBrokers}
                  onChange={(e) => setKafkaBrokers(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Topic Name</label>
                  <input
                    type="text"
                    value={kafkaTopic}
                    onChange={(e) => setKafkaTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Consumer Group ID</label>
                  <input
                    type="text"
                    value={kafkaGroup}
                    onChange={(e) => setKafkaGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Target Canonical Schema</label>
                <select
                  value={schemaId}
                  onChange={(e) => setSchemaId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white"
                >
                  {schemas.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="border border-[#E1E5EA] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E2229]">Kafka Consumer Properties</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('kafka', kafkaPropertiesSnippet)}
                    className="text-xs font-bold text-[#0D66D0] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'kafka' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'kafka' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-[#0F172A] text-[#93C5FD] font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {kafkaPropertiesSnippet}
                </pre>
              </div>

              <button
                type="button"
                disabled={isExecuting}
                onClick={handleConnectKafka}
                className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Kafka Consumer...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    <span>Connect Topic Consumer &amp; Complete Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CLOUD STORAGE BUCKET (AWS S3 / GCS) */}
        {mode === 'cloud_storage' && (
          <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStorageProvider('aws_s3');
                  setBucketUri('s3://northstar-cdp-lake/daily-exports/');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                  storageProvider === 'aws_s3'
                    ? 'bg-[#1473E6] text-white border-[#0D66D0]'
                    : 'bg-white text-[#1E2229] border-[#CBD5E1]'
                }`}
              >
                Amazon S3 Bucket
              </button>
              <button
                type="button"
                onClick={() => {
                  setStorageProvider('gcs');
                  setBucketUri('gs://northstar-analytics-exports/customers/');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                  storageProvider === 'gcs'
                    ? 'bg-[#1473E6] text-white border-[#0D66D0]'
                    : 'bg-white text-[#1E2229] border-[#CBD5E1]'
                }`}
              >
                Google Cloud Storage (GCS)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Bucket URI &amp; Prefix</label>
                <input
                  type="text"
                  value={bucketUri}
                  onChange={(e) => setBucketUri(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">File Format</label>
                <select
                  value={bucketFormat}
                  onChange={(e) => setBucketFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="parquet">Apache Parquet</option>
                  <option value="csv">CSV (UTF-8)</option>
                  <option value="json">NDJSON / JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Target Canonical Schema</label>
                <select
                  value={schemaId}
                  onChange={(e) => setSchemaId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white"
                >
                  {schemas.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isExecuting}
              onClick={handleSyncCloudBucket}
              className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Cloud Bucket...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>Sync Cloud Storage Objects &amp; Complete Step 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* MOBILE SDK (iOS & ANDROID) */}
        {mode === 'mobile_sdk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E5EA] space-y-3.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobilePlatform('ios')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                    mobilePlatform === 'ios'
                      ? 'bg-[#1473E6] text-white border-[#0D66D0]'
                      : 'bg-white text-[#1E2229] border-[#CBD5E1]'
                  }`}
                >
                  iOS (Swift)
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePlatform('android')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                    mobilePlatform === 'android'
                      ? 'bg-[#1473E6] text-white border-[#0D66D0]'
                      : 'bg-white text-[#1E2229] border-[#CBD5E1]'
                  }`}
                >
                  Android (Kotlin)
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Mobile App ID</label>
                <input
                  type="text"
                  value={mobileAppId}
                  onChange={(e) => setMobileAppId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Test App User Email</label>
                <input
                  type="email"
                  value={mobileEmail}
                  onChange={(e) => setMobileEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">Target Schema</label>
                <select
                  value={schemaId}
                  onChange={(e) => setSchemaId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white"
                >
                  {schemas.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="border border-[#E1E5EA] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E2229]">
                    {mobilePlatform === 'ios' ? 'Swift SDK Integration' : 'Kotlin SDK Integration'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('mobile', mobileSnippets[mobilePlatform])}
                    className="text-xs font-bold text-[#0D66D0] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'mobile' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'mobile' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-[#0F172A] text-[#93C5FD] font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {mobileSnippets[mobilePlatform]}
                </pre>
              </div>

              <button
                type="button"
                disabled={isExecuting}
                onClick={handleTestMobileSdk}
                className="w-full py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Mobile Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Verify Mobile SDK Event &amp; Complete Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result Banner */}
        {statusResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
              statusResult.ok
                ? 'bg-[#EBF3FC] border-[#BFDBFE] text-[#0A3D82]'
                : 'bg-[#EFF6FF] border-[#93C5FD] text-[#0A3D82]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {statusResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#1473E6] shrink-0" />
              )}
              <span>{statusResult.message}</span>
            </div>
            {statusResult.profileId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProfileId(statusResult.profileId!);
                  setActiveTab('profiles');
                }}
                className="text-xs font-bold text-[#1473E6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Inspect {statusResult.profileId}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
