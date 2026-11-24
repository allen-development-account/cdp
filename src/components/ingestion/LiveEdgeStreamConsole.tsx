import React, { useState, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Activity,
  Zap,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Copy,
  ExternalLink,
  Code,
  ShieldAlert,
  Server,
  Terminal,
  Globe,
  RefreshCw,
  Play,
  Check,
  Database,
  Sliders,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export const LiveEdgeStreamConsole: React.FC = () => {
  const {
    isLiveStreamConnected,
    liveWebSocketPingMs,
    dlq,
    replayDlqItem,
    discardDlqItem,
    testOutboundWebhook,
    systemMetrics,
    destinations,
    addTerminalLog
  } = useCDP();

  const [activeTab, setActiveTab] = useState<'sdk_playground' | 'edge_decisioning' | 'automated_egress' | 'dlq' | 'webhook_tester' | 'curl_builder'>('sdk_playground');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isFiringSdkEvent, setIsFiringSdkEvent] = useState(false);
  const [sdkEventResponse, setSdkEventResponse] = useState<any>(null);

  // Edge Decisioning State
  const [decisionEmail, setDecisionEmail] = useState('elena.rostova@techenterprise.com');
  const [decisionEcid, setDecisionEcid] = useState('ecid_88290141');
  const [decisionPlacement, setDecisionPlacement] = useState('Home Hero Banner');
  const [isQueryingEdge, setIsQueryingEdge] = useState(false);
  const [edgeDecisionResult, setEdgeDecisionResult] = useState<any>(null);

  // Automated Webhook Egress State
  const [selectedDestId, setSelectedDestId] = useState(destinations[0]?.id || 'dest_webhook_realtime');
  const [destEndpointUrl, setDestEndpointUrl] = useState('https://httpbin.org/post');
  const [isSavingEndpoint, setIsSavingEndpoint] = useState(false);
  const [endpointSaveMsg, setEndpointSaveMsg] = useState<string | null>(null);

  // Webhook Tester State
  const [webhookUrl, setWebhookUrl] = useState('https://httpbin.org/post');
  const [webhookPayload, setWebhookPayload] = useState(JSON.stringify({
    event: 'segment_qualification',
    profileId: 'prof_elena_rostova_01',
    audienceName: 'High-Value VIP Customers ($1000+)',
    identities: {
      email: 'elena.rostova@techenterprise.com',
      ecid: 'ecid_88290141',
      crmId: 'SFDC_0034W000021aZq'
    },
    totalSpend: 4210.00,
    timestamp: new Date().toISOString()
  }, null, 2));
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  // Storage info state
  const [storageInfo, setStorageInfo] = useState<any>(null);

  // DLQ Replay State
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const edgeCollectUrl = `${baseUrl}/api/v1/collect`;
  const sdkScriptTag = `<!-- XLR8 Real-Time CDP Web Tracking SDK -->\n<script src="${baseUrl}/api/v1/sdk.js" async></script>\n<script>\n  window.xlr8 = window.xlr8 || function() { (window.xlr8.q = window.xlr8.q || []).push(arguments); };\n  xlr8("init", { datastreamId: "ds_production_edge_web" });\n  xlr8("track", "PageView", { pageName: document.title, url: window.location.href });\n</script>`;

  const curlCommand = `curl -X POST "${edgeCollectUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "channel": "Web SDK",\n    "eventType": "Purchase",\n    "customer_email": "sarah.connor@cyberdyne.io",\n    "anon_cookie_id": "ecid_8829104",\n    "total_amount": 849.50,\n    "sku": "TITANIUM-CHASSIS-v2"\n  }'`;

  useEffect(() => {
    fetch('/api/v1/storage/status')
      .then(res => res.json())
      .then(data => setStorageInfo(data.storage))
      .catch(() => {});
  }, [activeTab]);

  const copyToClipboard = (text: string, type: 'script' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const handleFireLiveSdkEvent = async (actionType: 'pageview' | 'cart' | 'identify' | 'dlq_violation') => {
    setIsFiringSdkEvent(true);
    setSdkEventResponse(null);

    let payload: Record<string, any> = {};

    if (actionType === 'pageview') {
      payload = {
        channel: 'Web SDK',
        eventType: 'PageView',
        schemaId: 'xdm_experience_event',
        anon_cookie_id: 'ecid_live_' + Math.random().toString(36).substring(2, 8),
        page_name: 'Product Details - Enterprise Server Cluster',
        url: window.location.href,
        referrer: 'https://google.com/search?q=enterprise+cdp'
      };
    } else if (actionType === 'cart') {
      payload = {
        channel: 'Web SDK',
        eventType: 'AddToCart',
        schemaId: 'xdm_experience_event',
        anon_cookie_id: 'ecid_live_shopper_99',
        product_name: 'High-Density GPU Node 8X',
        total_amount: 1450.00,
        sku: 'GPU-NODE-H100'
      };
    } else if (actionType === 'identify') {
      payload = {
        channel: 'Web SDK',
        eventType: 'FormSubmit',
        schemaId: 'xdm_individual_profile',
        customer_email: 'sarah.connor@cyberdyne.io',
        anon_cookie_id: 'ecid_live_shopper_99',
        crm_id: 'SFDC-992014-SC',
        firstName: 'Sarah',
        lastName: 'Connor',
        city: 'Los Angeles',
        total_amount: 320.00
      };
    } else if (actionType === 'dlq_violation') {
      payload = {
        channel: 'Web SDK',
        eventType: 'PageView',
        schemaId: 'xdm_experience_event',
        unmappedAttribute: 'Anonymous action without any identity token',
        randomSessionKey: 'sess_' + Date.now()
      };
    }

    try {
      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSdkEventResponse({ status: res.status, data });
      if (res.ok) {
        addTerminalLog('success', 'LIVE-SDK', `Event acknowledged by HTTP edge gateway (${data.latencyMs}ms)`, data);
      } else {
        addTerminalLog('warning', 'DLQ-TRIP', `Payload rejected by edge gateway (${data.errorCode}). Routed to DLQ.`, data);
      }
    } catch (err: any) {
      setSdkEventResponse({ status: 500, error: err.message });
      addTerminalLog('error', 'LIVE-SDK', `Failed to transmit beacon: ${err.message}`);
    } finally {
      setIsFiringSdkEvent(false);
    }
  };

  const handleQueryEdgeDecision = async () => {
    setIsQueryingEdge(true);
    setEdgeDecisionResult(null);

    try {
      const res = await fetch('/api/v1/edge/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decisionEmail,
          ecid: decisionEcid,
          placement: decisionPlacement,
          context: {
            pageUrl: window.location.href,
            device: 'desktop',
            sessionTimestamp: new Date().toISOString()
          }
        })
      });
      const data = await res.json();
      setEdgeDecisionResult(data);
      addTerminalLog('success', 'EDGE-DECISION', `Evaluated edge decision in ${data.decisionLatencyMs}ms: "${data.selectedOffer?.title}"`);
    } catch (err: any) {
      setEdgeDecisionResult({ error: err.message });
    } finally {
      setIsQueryingEdge(false);
    }
  };

  const handleSaveDestinationEndpoint = async () => {
    if (!selectedDestId || !destEndpointUrl) return;
    setIsSavingEndpoint(true);
    setEndpointSaveMsg(null);
    try {
      const res = await fetch(`/api/v1/destinations/${selectedDestId}/endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: destEndpointUrl })
      });
      const data = await res.json();
      if (data.success) {
        setEndpointSaveMsg('Webhook endpoint saved to persistent disk! Live events qualifying for this destination will automatically dispatch HTTP POST requests.');
        addTerminalLog('success', 'DEST-CONFIG', `Updated automated webhook endpoint for ${selectedDestId}: ${destEndpointUrl}`);
      } else {
        setEndpointSaveMsg('Failed to update destination endpoint: ' + data.message);
      }
    } catch (err: any) {
      setEndpointSaveMsg('Error saving endpoint: ' + err.message);
    } finally {
      setIsSavingEndpoint(false);
    }
  };

  const handleReplayDlq = async (item: any) => {
    setReplayingId(item.id);
    try {
      const corrected = { ...item.rawPayload };
      if (!corrected.customer_email && !corrected.anon_cookie_id && !corrected.crm_id) {
        corrected.customer_email = 'repaired.lead@enterprise-audit.io';
        corrected.anon_cookie_id = 'ecid_replayed_' + Date.now().toString(36);
      }
      await replayDlqItem(item.id, corrected);
    } finally {
      setReplayingId(null);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(webhookPayload);
      } catch (e) {
        parsed = { text: webhookPayload };
      }
      const result = await testOutboundWebhook(webhookUrl, parsed);
      setWebhookResult(result);
    } catch (err: any) {
      setWebhookResult({ success: false, statusCode: 0, responseSnippet: err.message, roundtripMs: 0 });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="bg-white border border-[#D0D7DE] rounded-xl shadow-xs overflow-hidden mb-6">
      {/* Real-time Status Header */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Live Edge Stream, Decisioning & Real-Time Engine Console
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isLiveStreamConnected ? 'bg-white/15 text-[#8CE2A7] border border-[#8CE2A7]/40' : 'bg-white/15 text-[#FDE68A] border border-[#FDE68A]/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isLiveStreamConnected ? 'bg-[#8CE2A7] animate-ping' : 'bg-[#FDE68A]'}`} />
                {isLiveStreamConnected ? `Stream Active (${liveWebSocketPingMs}ms RTT)` : 'Connecting to Stream...'}
              </span>
            </div>
            <p className="text-xs text-blue-100">
              Disk Persistence Active (data/cdp-storage.json) • Automated Background Webhooks • Edge Decisioning API (&lt;2ms)
            </p>
          </div>
        </div>

        {/* Live Metrics Counters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white px-3 py-1.5 rounded-md border border-[#E1E5EA] text-center">
            <span className="text-[#6E7681] block">Cluster Throughput</span>
            <span className="font-semibold text-[#1E2229]">{systemMetrics.ratePerSec} ev/sec</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-md border border-[#E1E5EA] text-center">
            <span className="text-[#6E7681] block">Kafka Queue Latency</span>
            <span className="font-semibold text-[#0E7A36]">{systemMetrics.kafkaLatencyMs} ms</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-md border border-[#E1E5EA] text-center">
            <span className="text-[#6E7681] block">Disk Storage</span>
            <span className="font-semibold text-[#1473E6]">
              {storageInfo?.exists ? `${(storageInfo.sizeBytes / 1024).toFixed(1)} KB` : 'Active'}
            </span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-md border border-[#E1E5EA] text-center">
            <span className="text-[#6E7681] block">Dead Letter Queue</span>
            <span className={`font-semibold ${dlq.filter(d => d.status === 'PENDING').length > 0 ? 'text-[#D73A49]' : 'text-[#6E7681]'}`}>
              {dlq.filter(d => d.status === 'PENDING').length} Rejected
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-[#E1E5EA] bg-[#FCFDFD] px-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sdk_playground')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'sdk_playground'
              ? 'border-[#1473E6] text-[#1473E6] bg-white font-semibold'
              : 'border-transparent text-[#5C6573] hover:text-[#1E2229]'
          }`}
        >
          <Globe className="w-4 h-4" />
          Live Web SDK Playground
        </button>

        <button
          onClick={() => setActiveTab('edge_decisioning')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'edge_decisioning'
              ? 'border-[#1473E6] text-[#1473E6] bg-white font-semibold'
              : 'border-transparent text-[#5C6573] hover:text-[#1E2229]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          Edge Decisioning REST API
          <span className="px-1.5 py-0.2 bg-[#F3E8FF] text-[#8B5CF6] rounded text-[10px] font-bold border border-[#8B5CF6]/30">
            &lt; 2ms
          </span>
        </button>

        <button
          onClick={() => setActiveTab('automated_egress')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'automated_egress'
              ? 'border-[#1473E6] text-[#1473E6] bg-white font-semibold'
              : 'border-transparent text-[#5C6573] hover:text-[#1E2229]'
          }`}
        >
          <Zap className="w-4 h-4 text-[#E68619]" />
          Automated Background Webhooks
        </button>

        <button
          onClick={() => setActiveTab('dlq')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'dlq'
              ? 'border-[#1473E6] text-[#1473E6] bg-white font-semibold'
              : 'border-transparent text-[#5C6573] hover:text-[#1E2229]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-[#D73A49]" />
          Dead Letter Queue (DLQ)
          {dlq.filter(d => d.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#D73A49] text-white rounded-full text-[10px] font-bold">
              {dlq.filter(d => d.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('webhook_tester')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'webhook_tester'
              ? 'border-[#1473E6] text-[#1473E6] bg-white font-semibold'
              : 'border-transparent text-[#5C6573] hover:text-[#1E2229]'
          }`}
        >
          <Send className="w-4 h-4 text-[#1473E6]" />
          Manual Webhook Tester
        </button>

        <button
          onClick={() => setActiveTab('curl_builder')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'curl_builder'
              ? 'border-[#1473E6] text-[#1473E6] bg-white font-semibold'
              : 'border-transparent text-[#5C6573] hover:text-[#1E2229]'
          }`}
        >
          <Terminal className="w-4 h-4 text-[#0E7A36]" />
          cURL Edge Ingest
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* TAB 1: Live Web SDK Playground */}
        {activeTab === 'sdk_playground' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1E2229] uppercase tracking-wider">
                    Production Embed Tag (xlr8.js)
                  </span>
                  <button
                    onClick={() => copyToClipboard(sdkScriptTag, 'script')}
                    className="inline-flex items-center gap-1.5 text-xs text-[#1473E6] hover:underline font-medium"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript ? 'Copied to Clipboard!' : 'Copy Script Tag'}
                  </button>
                </div>
                <div className="bg-[#1E2229] text-[#E1E5EA] p-3 rounded-lg font-mono text-xs overflow-x-auto border border-[#30363D]">
                  <pre>{sdkScriptTag}</pre>
                </div>
                <p className="text-xs text-[#5C6573]">
                  Host endpoint: <code className="bg-[#F1F3F5] text-[#1E2229] px-1.5 py-0.5 rounded">{baseUrl}/api/v1/sdk.js</code>. Manages 1st-party ECID persistence, and automatically dispatches to <code className="bg-[#F1F3F5] text-[#1E2229] px-1.5 py-0.5 rounded">/api/v1/collect</code>.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#1E2229] uppercase tracking-wider block">
                  Fire Live Beacons Directly to Edge Gateway
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    disabled={isFiringSdkEvent}
                    onClick={() => handleFireLiveSdkEvent('pageview')}
                    className="p-3 border border-[#D0D7DE] rounded-lg hover:border-[#1473E6] hover:bg-[#F0F7FF] text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#1473E6]" />
                      <span className="text-xs font-bold text-[#1E2229]">1. Track PageView</span>
                    </div>
                    <span className="text-[11px] text-[#5C6573] block">
                      Anonymous ECID visitor browsing catalog.
                    </span>
                  </button>

                  <button
                    disabled={isFiringSdkEvent}
                    onClick={() => handleFireLiveSdkEvent('cart')}
                    className="p-3 border border-[#D0D7DE] rounded-lg hover:border-[#E68619] hover:bg-[#FFF9F2] text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#E68619]" />
                      <span className="text-xs font-bold text-[#1E2229]">2. Track AddToCart ($1,450)</span>
                    </div>
                    <span className="text-[11px] text-[#5C6573] block">
                      Triggers automated background webhook egress!
                    </span>
                  </button>

                  <button
                    disabled={isFiringSdkEvent}
                    onClick={() => handleFireLiveSdkEvent('identify')}
                    className="p-3 border border-[#D0D7DE] rounded-lg hover:border-[#0E7A36] hover:bg-[#F2FAF5] text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#0E7A36]" />
                      <span className="text-xs font-bold text-[#1E2229]">3. Identify (Sarah Connor)</span>
                    </div>
                    <span className="text-[11px] text-[#5C6573] block">
                      Stitches anon ECID to CRM profile!
                    </span>
                  </button>

                  <button
                    disabled={isFiringSdkEvent}
                    onClick={() => handleFireLiveSdkEvent('dlq_violation')}
                    className="p-3 border border-[#D0D7DE] rounded-lg hover:border-[#D73A49] hover:bg-[#FFF5F5] text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#D73A49]" />
                      <span className="text-xs font-bold text-[#D73A49]">4. Breach Identity (DLQ)</span>
                    </div>
                    <span className="text-[11px] text-[#5C6573] block">
                      Omits identity to test DLQ rejection.
                    </span>
                  </button>
                </div>

                {sdkEventResponse && (
                  <div className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                    sdkEventResponse.status === 200
                      ? 'bg-[#E6F4EA]/40 border-[#0E7A36]/30 text-[#0E7A36]'
                      : 'bg-[#FFF5F5] border-[#D73A49]/30 text-[#D73A49]'
                  }`}>
                    <div className="font-semibold mb-1 flex items-center justify-between">
                      <span>HTTP {sdkEventResponse.status} {sdkEventResponse.status === 200 ? 'Acknowledged' : 'Rejected'}</span>
                      {sdkEventResponse.data?.latencyMs && <span>Latency: {sdkEventResponse.data.latencyMs}ms</span>}
                    </div>
                    <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(sdkEventResponse.data || sdkEventResponse.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Edge Decisioning REST API */}
        {activeTab === 'edge_decisioning' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E2229]">
                  Real-Time Edge Personalization & Decisioning Engine (POST /api/v1/edge/decide)
                </h3>
                <p className="text-xs text-[#5C6573]">
                  Sub-2ms server-side edge decisioning endpoint. Evaluates unified profile traits, active audience memberships, and dynamic offers on the fly for headless apps, CDNs, and mobile storefronts.
                </p>
              </div>
              <span className="text-xs font-mono bg-[#F8FAFC] border border-[#E1E5EA] px-2.5 py-1 rounded text-[#1473E6]">
                Target SLA: &lt; 2.5ms Roundtrip
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Query Builder */}
              <div className="space-y-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E1E5EA]">
                <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wider block">
                  Simulate Incoming Edge Visitor Request
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1E2229] block mb-1">
                      Customer Email or Profile Key:
                    </label>
                    <input
                      type="text"
                      value={decisionEmail}
                      onChange={(e) => setDecisionEmail(e.target.value)}
                      placeholder="e.g. elena.rostova@techenterprise.com"
                      className="w-full px-3 py-1.5 border border-[#D0D7DE] rounded-md text-xs font-mono focus:border-[#1473E6] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#1E2229] block mb-1">
                      Anonymous ECID / Device Token:
                    </label>
                    <input
                      type="text"
                      value={decisionEcid}
                      onChange={(e) => setDecisionEcid(e.target.value)}
                      placeholder="e.g. ecid_88290141"
                      className="w-full px-3 py-1.5 border border-[#D0D7DE] rounded-md text-xs font-mono focus:border-[#1473E6] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#1E2229] block mb-1">
                      Placement Surface:
                    </label>
                    <select
                      value={decisionPlacement}
                      onChange={(e) => setDecisionPlacement(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#D0D7DE] rounded-md text-xs focus:border-[#1473E6] outline-none bg-white"
                    >
                      <option value="Home Hero Banner">Home Hero Banner</option>
                      <option value="Exit Intent Modal">Exit Intent Modal</option>
                      <option value="Cart Checkout Nudge">Cart Checkout Nudge</option>
                    </select>
                  </div>

                  {/* Preset Quick-Buttons */}
                  <div>
                    <span className="text-[11px] text-[#6E7681] block mb-1.5 font-medium">Quick Persona Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setDecisionEmail('elena.rostova@techenterprise.com');
                          setDecisionEcid('ecid_88290141');
                          setDecisionPlacement('Home Hero Banner');
                        }}
                        className="px-2.5 py-1 bg-white border border-[#D0D7DE] hover:border-[#1473E6] rounded text-[11px] font-medium text-[#1E2229]"
                      >
                        Elena (High-LTV VIP)
                      </button>
                      <button
                        onClick={() => {
                          setDecisionEmail('marcus.vance@vancemedia.io');
                          setDecisionEcid('ck_vance_8829');
                          setDecisionPlacement('Exit Intent Modal');
                        }}
                        className="px-2.5 py-1 bg-white border border-[#D0D7DE] hover:border-[#1473E6] rounded text-[11px] font-medium text-[#1E2229]"
                      >
                        Marcus (Churn Hazard)
                      </button>
                      <button
                        onClick={() => {
                          setDecisionEmail('');
                          setDecisionEcid('ecid_anon_guest_910');
                          setDecisionPlacement('Home Hero Banner');
                        }}
                        className="px-2.5 py-1 bg-white border border-[#D0D7DE] hover:border-[#1473E6] rounded text-[11px] font-medium text-[#1E2229]"
                      >
                        Unidentified Guest
                      </button>
                    </div>
                  </div>

                  <button
                    disabled={isQueryingEdge}
                    onClick={handleQueryEdgeDecision}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isQueryingEdge ? 'Evaluating Edge Model...' : 'Execute POST /api/v1/edge/decide'}
                  </button>
                </div>
              </div>

              {/* Live Decision Outcome Preview */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wider block">
                  Edge Decision Response
                </span>

                {edgeDecisionResult ? (
                  <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E9D5FF]">
                      <span className="text-xs font-bold text-[#6B21A8] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
                        Matched: {edgeDecisionResult.matchedProfileId || 'Anonymous Profile'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#8B5CF6]">
                        {edgeDecisionResult.decisionLatencyMs}ms Latency
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-[#E9D5FF] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider">
                          {edgeDecisionResult.selectedOffer?.badge || 'Personalized Offer'}
                        </span>
                        {edgeDecisionResult.selectedOffer?.discountPercentage && (
                          <span className="px-2 py-0.5 bg-[#DEFBE6] text-[#0E7A36] rounded font-bold text-xs">
                            {edgeDecisionResult.selectedOffer.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[#1E2229]">
                        {edgeDecisionResult.selectedOffer?.headline || edgeDecisionResult.selectedOffer?.title}
                      </h4>
                      <p className="text-xs text-[#5C6573]">
                        {edgeDecisionResult.selectedOffer?.subhead || 'Tailored to real-time customer behavioral segment.'}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs border-t border-[#F1F3F5]">
                        <span className="text-[#6E7681]">Promo Code: <strong className="text-[#1E2229]">{edgeDecisionResult.selectedOffer?.promoCode || 'N/A'}</strong></span>
                        <span className="px-3 py-1 bg-[#1473E6] text-white rounded font-medium text-xs">
                          {edgeDecisionResult.selectedOffer?.ctaText || 'Learn More'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#6B21A8] space-y-1">
                      <div><strong>Decision Logic:</strong> {edgeDecisionResult.decisionRuleApplied}</div>
                      <div><strong>Qualified Audiences:</strong> {edgeDecisionResult.matchedAudienceNames?.join(', ') || 'None'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#F8FAFC] rounded-lg border border-dashed border-[#D0D7DE] text-xs text-[#5C6573]">
                    Click <strong>"Execute POST /api/v1/edge/decide"</strong> to simulate millisecond edge offer decisioning.
                  </div>
                )}

                {/* GET Personalize CDN URL snippet */}
                <div className="pt-2">
                  <span className="text-[11px] font-medium text-[#6E7681] block mb-1">Direct CDN GET Endpoint:</span>
                  <code className="text-[11px] bg-[#1E2229] text-[#E1E5EA] p-2 rounded block font-mono overflow-x-auto">
                    GET {baseUrl}/api/v1/edge/personalize?ecid=ecid_88290141&amp;placement=Home%20Hero%20Banner
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Automated Background Webhooks */}
        {activeTab === 'automated_egress' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E2229]">
                  Automated Background Webhook Egress Configuration
                </h3>
                <p className="text-xs text-[#5C6573]">
                  Configure target endpoint URLs on active destinations. Every incoming streaming event that qualifies a customer profile will automatically fire a signed HTTP POST request in the background.
                </p>
              </div>
              <span className="text-xs bg-[#DEFBE6] text-[#0E7A36] px-2.5 py-1 rounded font-bold border border-[#0E7A36]/20">
                HMAC-SHA256 Signed
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoint Config Form */}
              <div className="space-y-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E1E5EA]">
                <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wider block">
                  Select Destination Connector
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1E2229] block mb-1">
                      Outbound Destination:
                    </label>
                    <select
                      value={selectedDestId}
                      onChange={(e) => {
                        setSelectedDestId(e.target.value);
                        const match = destinations.find(d => d.id === e.target.value);
                        if (match?.endpoint) setDestEndpointUrl(match.endpoint);
                      }}
                      className="w-full px-3 py-2 border border-[#D0D7DE] rounded-md text-xs focus:border-[#1473E6] outline-none bg-white font-medium"
                    >
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.category}) - {d.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#1E2229] block mb-1">
                      Automated Webhook Endpoint URL:
                    </label>
                    <input
                      type="url"
                      value={destEndpointUrl}
                      onChange={(e) => setDestEndpointUrl(e.target.value)}
                      placeholder="https://your-webhook-service.com/webhook"
                      className="w-full px-3 py-2 border border-[#D0D7DE] rounded-md text-xs font-mono focus:border-[#1473E6] outline-none"
                    />
                    <span className="text-[11px] text-[#5C6573] mt-1 block">
                      Try <strong>https://httpbin.org/post</strong> or your own <strong>webhook.site</strong> test URL.
                    </span>
                  </div>

                  <button
                    disabled={isSavingEndpoint || !destEndpointUrl}
                    onClick={handleSaveDestinationEndpoint}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1473E6] hover:bg-[#005ECE] text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isSavingEndpoint ? 'Persisting Endpoint...' : 'Save & Enable Live Automated Dispatch'}
                  </button>

                  {endpointSaveMsg && (
                    <div className="p-3 bg-[#E6F4EA] border border-[#0E7A36]/30 text-[#0E7A36] rounded-lg text-xs">
                      {endpointSaveMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* Egress Specifications */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wider block">
                  Automatic Dispatch Specification
                </span>

                <div className="bg-[#1E2229] text-[#E1E5EA] p-3.5 rounded-xl font-mono text-xs space-y-2 border border-[#30363D]">
                  <div className="text-[#58A6FF] font-semibold">// Live HTTP POST Headers on Event Trigger:</div>
                  <pre className="text-[11px]">{`POST {endpoint_url} HTTP/1.1
Content-Type: application/json
User-Agent: XLR8-Realtime-CDP-Live-Egress/1.4
X-XLR8-Signature-256: 5983368272dd9032a9ba444f...
X-XLR8-Event-Type: AudienceQualification
X-XLR8-Profile-Id: prof_elena_rostova_01
X-XLR8-Timestamp: 2026-10-04T18:20:00Z`}</pre>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E1E5EA] text-xs text-[#5C6573] space-y-1">
                  <div><strong>Trigger Rule:</strong> Fired non-blocking in the background whenever an incoming event causes a profile to qualify for an audience linked to an active destination.</div>
                  <div><strong>Retry Logic:</strong> 5,000ms timeout with automated fail-over logging.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Dead Letter Queue (DLQ) */}
        {activeTab === 'dlq' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E2229]">
                  Dead Letter Queue (Non-Conformant Ingestion Payloads)
                </h3>
                <p className="text-xs text-[#5C6573]">
                  Events rejected by schema validation or strict identity resolution gating are isolated here for auditing, remediation, and replay.
                </p>
              </div>
              <span className="text-xs text-[#5C6573]">
                Total Records: <strong>{dlq.length}</strong> ({dlq.filter(d => d.status === 'PENDING').length} pending remediation)
              </span>
            </div>

            {dlq.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-lg border border-dashed border-[#D0D7DE]">
                <CheckCircle2 className="w-8 h-8 text-[#0E7A36] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#1E2229]">Dead Letter Queue is Empty</p>
                <p className="text-xs text-[#5C6573]">All incoming streaming events have passed schema validation and identity gating.</p>
              </div>
            ) : (
              <div className="border border-[#E1E5EA] rounded-lg overflow-hidden divide-y divide-[#E1E5EA]">
                {dlq.map(item => (
                  <div key={item.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.status === 'PENDING'
                            ? 'bg-[#FFEBE9] text-[#CF222E] border border-[#CF222E]/20'
                            : item.status === 'REPLAYED'
                            ? 'bg-[#E6F4EA] text-[#0E7A36] border border-[#0E7A36]/20'
                            : 'bg-[#F1F3F5] text-[#5C6573]'
                        }`}>
                          {item.status}
                        </span>
                        <code className="text-xs font-bold text-[#1E2229]">{item.errorCode}</code>
                        <span className="text-xs text-[#6E7681]">via {item.channel}</span>
                        <span className="text-xs text-[#8C95A0]">• {new Date(item.receivedAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === 'PENDING' && (
                          <button
                            disabled={replayingId === item.id}
                            onClick={() => handleReplayDlq(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1473E6] hover:bg-[#005ECE] text-white text-xs font-semibold rounded shadow-xs transition-all disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${replayingId === item.id ? 'animate-spin' : ''}`} />
                            {replayingId === item.id ? 'Replaying...' : 'Fix & Replay'}
                          </button>
                        )}
                        <button
                          onClick={() => discardDlqItem(item.id)}
                          className="p-1 text-[#6E7681] hover:text-[#D73A49] transition-colors"
                          title="Discard Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#D73A49] mb-2 font-medium">
                      {item.errorMessage}
                    </p>

                    <div className="bg-[#1E2229] text-[#E1E5EA] p-2.5 rounded font-mono text-[11px] overflow-x-auto">
                      <pre>{JSON.stringify(item.rawPayload, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Outbound Webhook Tester */}
        {activeTab === 'webhook_tester' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1E2229]">
                Live Real-Time Outbound Webhook Egress Tester
              </h3>
              <p className="text-xs text-[#5C6573]">
                Sends an actual HTTP POST request directly from the XLR8 server with cryptographic HMAC-SHA256 headers (<code className="bg-[#F1F3F5] px-1 rounded">X-XLR8-Signature-256</code>) to verify destination endpoint readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#1E2229] block">
                  Target Webhook URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-webhook-endpoint.com/webhook"
                    className="flex-1 px-3 py-2 border border-[#D0D7DE] rounded-lg text-xs font-mono focus:border-[#1473E6] focus:ring-1 focus:ring-[#1473E6] outline-none"
                  />
                  <button
                    disabled={isTestingWebhook || !webhookUrl}
                    onClick={handleTestWebhook}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1473E6] hover:bg-[#005ECE] text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                    {isTestingWebhook ? 'Sending...' : 'Test Dispatch'}
                  </button>
                </div>

                <label className="text-xs font-semibold text-[#1E2229] block">
                  Sample Egress JSON Payload
                </label>
                <textarea
                  rows={8}
                  value={webhookPayload}
                  onChange={(e) => setWebhookPayload(e.target.value)}
                  className="w-full p-2.5 border border-[#D0D7DE] rounded-lg font-mono text-xs focus:border-[#1473E6] outline-none bg-[#F8FAFC]"
                />
              </div>

              {/* Webhook Result */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#1E2229] block">
                  Live Dispatch Outcome
                </span>
                {webhookResult ? (
                  <div className={`p-4 rounded-lg border text-xs font-mono ${
                    webhookResult.success
                      ? 'bg-[#E6F4EA]/40 border-[#0E7A36]/30 text-[#1E2229]'
                      : 'bg-[#FFF5F5] border-[#D73A49]/30 text-[#1E2229]'
                  }`}>
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E1E5EA]">
                      <span className="font-bold flex items-center gap-1.5">
                        {webhookResult.success ? <CheckCircle2 className="w-4 h-4 text-[#0E7A36]" /> : <AlertTriangle className="w-4 h-4 text-[#D73A49]" />}
                        HTTP Status: {webhookResult.statusCode}
                      </span>
                      <span className="text-[#6E7681]">Roundtrip: <strong>{webhookResult.roundtripMs}ms</strong></span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-[#6E7681] block">HMAC SHA-256 Digest:</span>
                        <code className="text-[#1473E6] text-[10px] break-all">{webhookResult.signature}</code>
                      </div>

                      <div>
                        <span className="text-[#6E7681] block">Response Body Snippet:</span>
                        <pre className="bg-[#1E2229] text-[#E1E5EA] p-2 rounded text-[10px] overflow-x-auto">
                          {webhookResult.responseSnippet}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#F8FAFC] rounded-lg border border-dashed border-[#D0D7DE] text-xs text-[#5C6573]">
                    Click <strong>"Test Dispatch"</strong> to execute an actual HTTP POST from the server to your endpoint.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REST Edge Endpoint & cURL */}
        {activeTab === 'curl_builder' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E2229]">
                  Edge Ingestion REST API Endpoint (cURL / Backend Microservices)
                </h3>
                <p className="text-xs text-[#5C6573]">
                  Direct HTTPS POST endpoint for external servers, batch ETL, and microservices to push events directly into the real-time stream.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(curlCommand, 'curl')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D0D7DE] hover:bg-[#F1F3F5] text-xs font-semibold text-[#1E2229] rounded-md transition-colors"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-[#0E7A36]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCurl ? 'Copied cURL!' : 'Copy cURL Command'}
              </button>
            </div>

            <div className="bg-[#1E2229] text-[#E1E5EA] p-4 rounded-lg font-mono text-xs overflow-x-auto border border-[#30363D]">
              <pre>{curlCommand}</pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E1E5EA]">
                <span className="text-xs font-semibold text-[#1E2229] block mb-1">Target Endpoint</span>
                <code className="text-xs text-[#1473E6] break-all">{edgeCollectUrl}</code>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E1E5EA]">
                <span className="text-xs font-semibold text-[#1E2229] block mb-1">Payload Support</span>
                <span className="text-xs text-[#5C6573]">Single JSON Event or Batch JSON Array</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E1E5EA]">
                <span className="text-xs font-semibold text-[#1E2229] block mb-1">Processing SLA</span>
                <span className="text-xs text-[#0E7A36] font-semibold">&lt; 3.8ms Deterministic Resolution</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
