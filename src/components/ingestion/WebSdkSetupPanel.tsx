import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Globe,
  Code,
  Copy,
  Check,
  Download,
  Zap,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  AlertCircle,
  UserCheck,
  ArrowRight,
  Radio,
  ShieldCheck
} from 'lucide-react';

interface WebSdkSetupPanelProps {
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

const escapeHtmlText = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const WebSdkSetupPanel: React.FC<WebSdkSetupPanelProps> = ({ onComplete }) => {
  const { schemas, sources, addSource, addTerminalLog, addAuditLog, setActiveTab, setSelectedProfileId } = useCDP();

  const [siteName, setSiteName] = useState('NorthStar Commerce Storefront');
  const [siteDomain, setSiteDomain] = useState('https://shop.northstarretail.io');
  const [datastreamId, setDatastreamId] = useState('ds_web_prod_01');
  const [schemaId, setSchemaId] = useState('xdm_experience_event');

  // Auto-capture flags
  const [capturePageView, setCapturePageView] = useState(true);
  const [captureCommerce, setCaptureCommerce] = useState(true);
  const [captureAbandonment, setCaptureAbandonment] = useState(true);

  // Code tab & copy state
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'ecommerce' | 'identify'>('html');
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadedDemo, setDownloadedDemo] = useState(false);

  // Live beacon verification state
  const [testEmail, setTestEmail] = useState('elena.rostova@techenterprise.com');
  const [selectedTestEvent, setSelectedTestEvent] = useState<'PageView' | 'AddToCart' | 'CartAbandoned' | 'Purchase'>('AddToCart');
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    ok: boolean;
    status: number;
    profileId?: string;
    latencyMs?: number;
    databricksSynced?: boolean;
    message?: string;
    payloadSent?: Record<string, any>;
  } | null>(null);

  const originUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  }, []);

  const sdkUrl = `${originUrl}/api/v1/sdk.js`;
  const collectUrl = `${originUrl}/api/v1/collect`;

  const htmlInstallSnippet = `<!-- XLR8 Real-Time CDP Web SDK (Cross-Origin Ready) -->
<script src="${sdkUrl}" async></script>
<script>
  window.xlr8 = window.xlr8 || function () {
    (window.xlr8.q = window.xlr8.q || []).push(arguments);
  };

  xlr8('init', {
    endpoint: '${collectUrl}',
    datastreamId: '${datastreamId}',
    schemaId: '${schemaId}',
    siteName: ${JSON.stringify(siteName)}
  });${
    capturePageView
      ? `

  // Automatic initial PageView capture
  xlr8('track', 'PageView', {
    page_name: document.title,
    page_url: window.location.href
  });`
      : ''
  }
</script>`;

  const ecommerceSnippet = `// Stream E-Commerce Shopping & Cart Lifecycle Events
xlr8('track', 'ProductView', {
  sku: 'NS-AUDIO-PRO-01',
  product_name: 'AeroStudio Wireless ANC Headphones',
  category: 'Audio & Electronics',
  price: 349.00,
  currency: 'USD'
});

xlr8('track', 'AddToCart', {
  sku: 'NS-AUDIO-PRO-01',
  product_name: 'AeroStudio Wireless ANC Headphones',
  quantity: 1,
  cart_value: 349.00,
  total_amount: 349.00
});${
    captureAbandonment
      ? `

// Exit-intent / session abandonment with keepalive beacon
window.addEventListener('beforeunload', function () {
  if (window.__cartItemCount > 0) {
    xlr8('track', 'CartAbandoned', {
      cart_value: window.__cartTotal,
      abandoned_items: window.__cartItemCount,
      keepalive: true
    });
  }
});`
      : ''
  }

xlr8('track', 'Purchase', {
  order_id: 'ORD-' + Date.now(),
  total_amount: 349.00,
  currency: 'USD',
  payment_method: 'Credit Card'
});`;

  const identifySnippet = `// Stitch Anonymous 1st-Party ECID Cookie to Known Customer Profile
xlr8('identify', {
  email: '${testEmail || 'alex.rivera@enterprisecorp.io'}',
  firstName: 'Elena',
  lastName: 'Rostova',
  crmId: 'SFDC_0034W000021aZq',
  customer_tier: 'VIP',
  gdpr_consent: true
});`;

  const currentCode =
    activeCodeTab === 'html'
      ? htmlInstallSnippet
      : activeCodeTab === 'ecommerce'
      ? ecommerceSnippet
      : identifySnippet;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleDownloadStandaloneSite = () => {
    const safeTitle = escapeHtmlText(siteName);
    const safeDomain = escapeHtmlText(siteDomain);
    const configJson = JSON.stringify({
      endpoint: collectUrl,
      datastreamId,
      schemaId,
      siteName
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — Live XLR8 Web SDK Storefront</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F5F7FA; color: #1E2229; margin: 0; padding: 32px 16px; }
    .wrap { max-width: 920px; margin: 0 auto; }
    .hero { background: linear-gradient(120deg, #1473E6, #0A3D82); color: #fff; padding: 24px 28px; border-radius: 14px; margin-bottom: 24px; }
    .hero h1 { margin: 0 0 6px; font-size: 22px; }
    .hero p { margin: 0; font-size: 13px; color: #DBEAFE; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #fff; border: 1px solid #E1E5EA; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; }
    .card h3 { margin: 0 0 6px; font-size: 16px; }
    .price { color: #1473E6; font-weight: 700; font-size: 18px; margin: 8px 0 14px; }
    button { background: #1473E6; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; font-weight: 600; font-size: 13px; cursor: pointer; }
    button:hover { background: #0D66D0; }
    button.sec { background: #EBF3FC; color: #0D66D0; border: 1px solid #BFDBFE; }
    .panel { background: #fff; border: 1px solid #E1E5EA; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
    .row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    input { padding: 9px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px; min-width: 240px; }
    pre { background: #0F172A; color: #93C5FD; padding: 14px; border-radius: 10px; font-size: 12px; overflow-x: auto; max-height: 220px; }
  </style>
  <script src="${sdkUrl}" async></script>
  <script>
    window.xlr8 = window.xlr8 || function () {
      (window.xlr8.q = window.xlr8.q || []).push(arguments);
    };
    xlr8('init', ${configJson});
  </script>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>${safeTitle}</h1>
      <p>External Real-World Storefront (${safeDomain}) • Streaming live events to ${escapeHtmlText(collectUrl)}</p>
    </div>

    <div class="panel">
      <h3>1. Identify Shopper</h3>
      <div class="row">
        <input id="emailInput" type="email" value="${escapeHtmlText(testEmail)}" placeholder="customer@domain.com" />
        <button onclick="identifyShopper()">Identify Customer</button>
        <button class="sec" onclick="trackCustom('PageView', { page_name: 'Catalog Home', page_url: window.location.href })">Track PageView</button>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div>
          <h3>AeroStudio ANC Headphones</h3>
          <p style="font-size:13px;color:#555;">SKU: NS-AUDIO-PRO-01</p>
          <div class="price">$349.00</div>
        </div>
        <button onclick="addToCart('NS-AUDIO-PRO-01', 'AeroStudio ANC Headphones', 349)">Add to Cart</button>
      </div>
      <div class="card">
        <div>
          <h3>CloudScale Mechanical Keyboard</h3>
          <p style="font-size:13px;color:#555;">SKU: NS-KEY-ULTRA-02</p>
          <div class="price">$189.00</div>
        </div>
        <button onclick="addToCart('NS-KEY-ULTRA-02', 'CloudScale Mechanical Keyboard', 189)">Add to Cart</button>
      </div>
      <div class="card">
        <div>
          <h3>Cart Actions & Checkout</h3>
          <p id="cartSummary" style="font-size:13px;color:#555;">Cart: 0 items ($0.00)</p>
        </div>
        <div class="row" style="margin-top:12px;">
          <button onclick="completePurchase()">Complete Purchase</button>
          <button class="sec" onclick="abandonCart()">Simulate Cart Abandonment</button>
        </div>
      </div>
    </div>

    <div class="panel">
      <h3>Live Beacon Log</h3>
      <pre id="beaconLog">Waiting for user interactions...</pre>
    </div>
  </div>

  <script>
    var cartItems = [];
    function log(msg, data) {
      var el = document.getElementById('beaconLog');
      var entry = '[' + new Date().toLocaleTimeString() + '] ' + msg + (data ? ' ' + JSON.stringify(data) : '');
      el.textContent = entry + '\\n' + el.textContent;
    }
    function updateCartUI() {
      var total = cartItems.reduce(function (s, i) { return s + i.price; }, 0);
      document.getElementById('cartSummary').textContent = 'Cart: ' + cartItems.length + ' items ($' + total.toFixed(2) + ')';
    }
    function identifyShopper() {
      var email = document.getElementById('emailInput').value.trim();
      xlr8('identify', { email: email, storefront_app: ${JSON.stringify(siteName)} });
      log('Sent Identify:', { email: email });
    }
    function trackCustom(evt, props) {
      xlr8('track', evt, props || {});
      log('Sent ' + evt + ':', props);
    }
    function addToCart(sku, name, price) {
      cartItems.push({ sku: sku, name: name, price: price });
      updateCartUI();
      var total = cartItems.reduce(function (s, i) { return s + i.price; }, 0);
      trackCustom('AddToCart', { sku: sku, product_name: name, price: price, total_amount: price, cart_value: total, cart_items_count: cartItems.length });
    }
    function abandonCart() {
      var total = cartItems.reduce(function (s, i) { return s + i.price; }, 0) || 349;
      trackCustom('CartAbandoned', { cart_value: total, abandoned_items: cartItems.length || 1, abandon_reason: 'ExitIntent' });
    }
    function completePurchase() {
      var total = cartItems.reduce(function (s, i) { return s + i.price; }, 0) || 349;
      trackCustom('Purchase', { order_id: 'ORD-' + Date.now(), total_amount: total, items_purchased: cartItems.length || 1 });
      cartItems = [];
      updateCartUI();
    }
    window.addEventListener('load', function () {
      trackCustom('PageView', { page_name: document.title, page_url: window.location.href });
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_xlr8_sdk_store.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedDemo(true);
    setTimeout(() => setDownloadedDemo(false), 3000);
    addTerminalLog('info', 'WEB-SDK', `Generated standalone external HTML storefront pre-configured with ${sdkUrl}`);
  };

  const buildTestPayload = (eventType: 'PageView' | 'AddToCart' | 'CartAbandoned' | 'Purchase') => {
    const base = {
      channel: 'Web SDK',
      eventType,
      schemaId,
      datastreamId,
      storefront_app: siteName,
      page_url: siteDomain,
      customer_email: testEmail.trim() || 'elena.rostova@techenterprise.com',
      anon_cookie_id: 'ecid_websdk_live_901',
      device_browser: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 60) : 'Web Browser'
    };

    if (eventType === 'PageView') {
      return {
        ...base,
        page_name: `${siteName} - Catalog Showcase`
      };
    }
    if (eventType === 'AddToCart') {
      return {
        ...base,
        sku: 'NS-AUDIO-PRO-01',
        product_name: 'AeroStudio Wireless ANC Headphones',
        quantity: 1,
        total_amount: 349.0,
        cart_value: 349.0
      };
    }
    if (eventType === 'CartAbandoned') {
      return {
        ...base,
        sku: 'NS-AUDIO-PRO-01',
        product_name: 'AeroStudio Wireless ANC Headphones',
        cart_value: 349.0,
        abandoned_items: 1,
        abandon_reason: 'SessionTimeout'
      };
    }
    return {
      ...base,
      order_id: `ORD-${Date.now().toString().slice(-6)}`,
      sku: 'NS-AUDIO-PRO-01',
      product_name: 'AeroStudio Wireless ANC Headphones',
      total_amount: 349.0,
      currency: 'USD'
    };
  };

  const handleVerifyAndConnect = async (eventOverride?: 'PageView' | 'AddToCart' | 'CartAbandoned' | 'Purchase') => {
    const evtType = eventOverride || selectedTestEvent;
    if (eventOverride) setSelectedTestEvent(eventOverride);

    setIsTesting(true);
    setTestResponse(null);

    const payload = buildTestPayload(evtType);

    try {
      const res = await fetch('/api/v1/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const resultObj = {
          ok: true,
          status: res.status,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced,
          message: `Verified live ${evtType} beacon on ${siteName} (${data.latencyMs}ms)`,
          payloadSent: payload
        };
        setTestResponse(resultObj);

        const sourceName = `Client-Side Web SDK (${siteName})`;
        if (!sources.some((s) => s.id === 'src_client_websdk_live')) {
          addSource({
            id: 'src_client_websdk_live',
            name: sourceName,
            type: 'Streaming',
            status: 'Healthy',
            ratePerSec: 18,
            todayEventCount: 1,
            latencyMs: data.latencyMs || 2.4,
            description: `Cross-origin Alloy/XLR8 Web SDK tag streaming live commerce & behavioral events from ${siteDomain}.`,
            icon: 'globe',
            category: 'Web & Mobile',
            targetSchemaId: schemaId,
            targetSchemaName: schemas.find((s) => s.id === schemaId)?.name || 'XDM Experience Event',
            authMethod: `Datastream Key (${datastreamId})`
          });
        }

        addTerminalLog('success', 'WEB-SDK', `Web SDK beacon verified (${evtType}) -> Profile ${data.profileId} (${data.latencyMs}ms)`, {
          datastreamId,
          databricksSynced: data.databricksSynced
        });

        addAuditLog({
          userId: 'usr_current_operator',
          userName: 'Current Operator',
          userRole: 'Data Architect',
          category: 'Schema & Ingestion',
          action: 'Connected Real-Time Client-Side Web SDK',
          targetEntity: sourceName,
          status: 'SUCCESS',
          summary: `Verified live HTTP/CORS Web SDK beacon (${evtType}) for datastream ${datastreamId}.`,
          complianceFlags: ['CORS Origin Validated', 'Identity Graph Active']
        });

        onComplete({
          sourceName,
          channel: 'Web SDK',
          schemaId,
          profileId: data.profileId,
          latencyMs: data.latencyMs,
          databricksSynced: data.databricksSynced,
          message: resultObj.message
        });
      } else {
        setTestResponse({
          ok: false,
          status: res.status,
          message: data.message || data.error || 'Beacon validation failed',
          payloadSent: payload
        });
      }
    } catch (err: any) {
      setTestResponse({
        ok: false,
        status: 500,
        message: err.message || 'Network error while reaching /api/v1/collect',
        payloadSent: payload
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#93C5FD] shadow-xs overflow-hidden">
      {/* Step 2 Header Strip (Matches Step 1 Styling) */}
      <div className="bg-gradient-to-r from-[#051636] via-[#0A2B60] to-[#10428E] text-white border-b border-[#071E47] px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center text-white shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white text-[#0A2B60] px-2 py-0.5 rounded shadow-2xs">
                Step 2
              </span>
              <h3 className="text-base font-bold text-white">Client-Side Web SDK</h3>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Embed the live <code className="bg-white/15 px-1.5 py-0.5 rounded text-white">sdk.js</code> tag on any real-world website to stream PageViews, AddToCart, CartAbandoned, and Purchases directly into your CDP and Databricks Lakehouse.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/10 text-sky-100 border border-white/25">
            Cross-Origin Edge &lt;2.4ms
          </span>

          <button
            type="button"
            onClick={handleDownloadStandaloneSite}
            className="px-3 py-1.5 bg-white text-[#0A2B60] hover:bg-[#F2F7FE] border border-white/80 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {downloadedDemo ? <Check className="w-3.5 h-3.5 text-[#0284C7]" /> : <Download className="w-3.5 h-3.5 text-[#1473E6]" />}
            <span>{downloadedDemo ? 'Downloaded Test Site!' : 'Download Test Website (.html)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ecommerce_store')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-sky-200" />
            <span>Open Live Storefront</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration & Auto-Capture (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#F8FAFC] border border-[#E1E5EA] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2229] flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#1473E6]" />
                <span>1. Website & Datastream Settings</span>
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                CORS Enabled
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                Website / Storefront Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white text-[#1E2229] focus:ring-2 focus:ring-[#1473E6] focus:outline-none"
                placeholder="e.g., NorthStar Commerce Storefront"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Production Origin URL
                </label>
                <input
                  type="url"
                  value={siteDomain}
                  onChange={(e) => setSiteDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white text-[#1E2229] focus:ring-2 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                  Edge Datastream ID
                </label>
                <input
                  type="text"
                  value={datastreamId}
                  onChange={(e) => setDatastreamId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white text-[#1E2229] focus:ring-2 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229] mb-1">
                Target XDM Schema
              </label>
              <select
                value={schemaId}
                onChange={(e) => setSchemaId(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs font-semibold bg-white text-[#1E2229] focus:ring-2 focus:ring-[#1473E6] focus:outline-none"
              >
                {schemas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
                {schemas.length === 0 && (
                  <option value="xdm_experience_event">XDM Experience Event</option>
                )}
              </select>
            </div>

            <div className="pt-1 space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#1E2229]">
                Auto-Capture Event Streams
              </span>
              <label className="flex items-center gap-2 text-xs text-[#1E2229] cursor-pointer">
                <input
                  type="checkbox"
                  checked={capturePageView}
                  onChange={(e) => setCapturePageView(e.target.checked)}
                  className="accent-[#1473E6]"
                />
                <span>Capture PageView & Referrer Metadata automatically</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#1E2229] cursor-pointer">
                <input
                  type="checkbox"
                  checked={captureCommerce}
                  onChange={(e) => setCaptureCommerce(e.target.checked)}
                  className="accent-[#1473E6]"
                />
                <span>E-Commerce Cart & Checkout Events (AddToCart, Purchase)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#1E2229] cursor-pointer">
                <input
                  type="checkbox"
                  checked={captureAbandonment}
                  onChange={(e) => setCaptureAbandonment(e.target.checked)}
                  className="accent-[#1473E6]"
                />
                <span>Exit-Intent CartAbandoned Keepalive Beacon</span>
              </label>
            </div>
          </div>

          {/* Real-world readiness box */}
          <div className="p-4 rounded-xl bg-[#EBF3FC] border border-[#BFDBFE] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A3D82]">
              <ShieldCheck className="w-4 h-4 text-[#1473E6]" />
              <span>Real-World Cross-Origin Ingestion Ready</span>
            </div>
            <p className="text-[11px] text-[#1E2229] leading-relaxed">
              Your live SDK URL <code className="bg-white px-1.5 py-0.5 rounded border border-[#C5DCFA] text-[#0D66D0] font-mono break-all">{sdkUrl}</code> automatically resolves its origin so external websites stream directly to <code className="bg-white px-1 rounded text-[#0D66D0] font-mono">/api/v1/collect</code>.
            </p>
          </div>
        </div>

        {/* Right: Code Embed & Live Beacon Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Code Snippet Card */}
          <div className="border border-[#E1E5EA] rounded-xl overflow-hidden bg-white">
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('html')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    activeCodeTab === 'html'
                      ? 'bg-[#1473E6] text-white'
                      : 'text-[#1E2229] hover:bg-[#E1E5EA]'
                  }`}
                >
                  1. HTML &lt;script&gt; Tag
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('ecommerce')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    activeCodeTab === 'ecommerce'
                      ? 'bg-[#1473E6] text-white'
                      : 'text-[#1E2229] hover:bg-[#E1E5EA]'
                  }`}
                >
                  2. Cart & Purchase Events
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('identify')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    activeCodeTab === 'identify'
                      ? 'bg-[#1473E6] text-white'
                      : 'text-[#1E2229] hover:bg-[#E1E5EA]'
                  }`}
                >
                  3. Customer Identify
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-md bg-white border border-[#CBD5E1] hover:border-[#1473E6] text-xs font-bold text-[#0D66D0] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#0284C7]" /> : <Copy className="w-3.5 h-3.5 text-[#1473E6]" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>

            <div className="bg-[#0F172A] text-[#E2E8F0] p-4 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
              <pre>{currentCode}</pre>
            </div>
          </div>

          {/* Live Handshake & Beacon Verification */}
          <div className="border border-[#B3D4FA] rounded-xl p-4 bg-[#F9FAFC] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E2229] flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#1473E6]" />
                  <span>2. Test Live SDK Beacon & Complete Setup</span>
                </h4>
                <p className="text-[11px] text-[#5C6573] mt-0.5">
                  Send a live HTTP POST event through the Web SDK gateway to register this stream and unlock Step 3 monitoring.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                POST /api/v1/collect
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">
                  Test Customer Email (Identity Key)
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-xs font-mono bg-white text-[#1E2229] focus:ring-2 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1E2229] mb-1">
                  Live Test Event Type
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['PageView', 'AddToCart', 'CartAbandoned', 'Purchase'] as const).map((evt) => (
                    <button
                      key={evt}
                      type="button"
                      onClick={() => setSelectedTestEvent(evt)}
                      className={`py-1.5 px-1.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer truncate ${
                        selectedTestEvent === evt
                          ? 'bg-[#1473E6] text-white border-[#0D66D0]'
                          : 'bg-white text-[#1E2229] border-[#CBD5E1] hover:border-[#1473E6]'
                      }`}
                    >
                      {evt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleVerifyAndConnect()}
                className="flex-1 min-w-[220px] py-2.5 px-4 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Live Web SDK Beacon...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Fire {selectedTestEvent} Beacon &amp; Complete Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isTesting}
                onClick={() => handleVerifyAndConnect('CartAbandoned')}
                className="py-2.5 px-3.5 bg-white hover:bg-[#EBF3FC] text-[#0D66D0] border border-[#BFDBFE] font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Test Cart Abandonment</span>
              </button>
            </div>

            {testResponse && (
              <div
                className={`p-3.5 rounded-lg border text-xs ${
                  testResponse.ok
                    ? 'bg-[#EBF3FC] border-[#BFDBFE] text-[#0A3D82]'
                    : 'bg-[#EFF6FF] border-[#93C5FD] text-[#0A3D82]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    {testResponse.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#1473E6]" />
                    )}
                    <span>{testResponse.message}</span>
                  </span>
                  {testResponse.profileId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProfileId(testResponse.profileId!);
                        setActiveTab('profiles');
                      }}
                      className="text-[11px] text-[#1473E6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Inspect {testResponse.profileId}</span>
                    </button>
                  )}
                </div>
                {testResponse.ok && (
                  <p className="text-[11px] text-[#1E2229]">
                    Databricks Bronze Sync: <strong>{testResponse.databricksSynced ? 'Synced' : 'Queued'}</strong> • Latency: <strong>{testResponse.latencyMs}ms</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
