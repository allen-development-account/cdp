import React, { useState, useEffect, useCallback } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  ShoppingBag,
  User,
  UserCheck,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Activity,
  Database,
  Users,
  Radio,
  FileText,
  Zap,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

const PRESET_SHOPPERS = [
  {
    label: 'Elena Rostova (CloudScale)',
    email: 'elena.rostova@cloudscale.io',
    firstName: 'Elena',
    lastName: 'Rostova',
    city: 'San Francisco'
  },
  {
    label: 'Marcus Vance (VanceMedia)',
    email: 'marcus.vance@vancemedia.io',
    firstName: 'Marcus',
    lastName: 'Vance',
    city: 'New York'
  },
  {
    label: 'Sophia Tanaka (DesignStudios)',
    email: 'sophia.tanaka@designstudios.jp',
    firstName: 'Sophia',
    lastName: 'Tanaka',
    city: 'Seattle'
  }
];

function getOrCreateStoreECID(): string {
  try {
    const existing = localStorage.getItem('xlr8_ecid');
    if (existing) return existing;
    const created = `ecid_store_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('xlr8_ecid', created);
    return created;
  } catch {
    return `ecid_store_${Date.now().toString(36)}`;
  }
}

export const LiveEcommerceStorefrontView: React.FC = () => {
  const {
    streamEvents,
    databricksStatus,
    refreshDatabricksStatus,
    setActiveTab,
    setSelectedProfileId,
    isLiveStreamConnected,
    liveWebSocketPingMs
  } = useCDP();

  const [ecid, setEcid] = useState<string>(() => getOrCreateStoreECID());
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [polledEvents, setPolledEvents] = useState<typeof streamEvents>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const syncFromServer = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [stateRes] = await Promise.all([
        fetch('/api/v1/state'),
        refreshDatabricksStatus()
      ]);
      if (stateRes.ok) {
        const snapshot = await stateRes.json();
        if (Array.isArray(snapshot?.streamEvents)) {
          setPolledEvents([...snapshot.streamEvents].reverse());
        }
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshDatabricksStatus]);

  // Automatically sync latest events when returning from the storefront tab
  useEffect(() => {
    syncFromServer();
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        syncFromServer();
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [syncFromServer]);

  // Merge live WebSocket events with polled server state events from this storefront (newest first, deduped by id)
  const loggedEvents = React.useMemo(() => {
    const map = new Map<string, (typeof streamEvents)[number]>();
    for (const ev of streamEvents) {
      if (ev.payload?.storefront_app) {
        map.set(ev.id, ev);
      }
    }
    for (const ev of polledEvents) {
      if (ev.payload?.storefront_app && !map.has(ev.id)) {
        map.set(ev.id, ev);
      }
    }
    return Array.from(map.values()).slice(0, 40);
  }, [streamEvents, polledEvents]);

  // Count distinct unified profiles only once a storefront shopper is actually identified & stitched
  const unifiedStorefrontProfilesCount = React.useMemo(() => {
    const unifiedIds = new Set<string>();
    for (const ev of loggedEvents) {
      const profileId = ev.stitchingLog?.matchedProfileId;
      const isIdentified = Boolean(
        ev.identifiers?.email ||
        ev.payload?.customer_email ||
        ev.stitchingLog?.isMerged
      );
      if (profileId && isIdentified) {
        unifiedIds.add(profileId);
      }
    }
    return unifiedIds.size;
  }, [loggedEvents]);

  const handleMintFreshEcid = () => {
    const next = `ecid_store_${Math.random().toString(36).slice(2, 8)}`;
    try {
      localStorage.setItem('xlr8_ecid', next);
    } catch {
      // ignore
    }
    setEcid(next);
  };

  const buildGuestUrl = () => {
    const qs = new URLSearchParams({
      mode: 'guest',
      ecid
    });
    return `/storefront?${qs.toString()}`;
  };

  const buildCustomerUrl = (opts: {
    email: string;
    firstName: string;
    lastName: string;
    city?: string;
  }) => {
    const fullName = `${opts.firstName} ${opts.lastName}`.trim();
    const qs = new URLSearchParams({
      mode: 'customer',
      ecid,
      email: opts.email.trim().toLowerCase(),
      name: fullName,
      firstName: opts.firstName,
      lastName: opts.lastName,
      city: opts.city || 'San Francisco'
    });
    return `/storefront?${qs.toString()}`;
  };

  const customParts = customName.trim().split(/\s+/).filter(Boolean);
  const customEmailTrimmed = customEmail.trim().toLowerCase();
  const isCustomEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmailTrimmed);
  const customCustomerUrl = isCustomEmailValid
    ? buildCustomerUrl({
        email: customEmailTrimmed,
        firstName: customParts[0] || customEmailTrimmed.split('@')[0],
        lastName: customParts.slice(1).join(' ')
      })
    : '#';

  return (
    <div className="h-full overflow-y-auto bg-[#F4F7FB] text-[#1E2229]">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-14 space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageBackButton />
          <div className="text-xs text-[#475569] font-medium tabular-nums">
            {isLiveStreamConnected
              ? `Real-Time CDP Listener Active (${liveWebSocketPingMs}ms)`
              : 'Real-Time CDP Listener Ready'}
          </div>
        </div>

        {/* Header */}
        <section className="rounded-2xl bg-gradient-to-r from-[#0C274E] via-[#123D7A] to-[#1460C4] text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Sample E-commerce Storefront
              </h1>
              <p className="text-xs sm:text-sm text-[#D6E6FC] mt-1 max-w-2xl">
                Launch the full external storefront in a new browser tab. Every browse, search, add-to-cart, abandonment, and checkout event there streams live into this CDP.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono bg-white/12 border border-white/20 px-3 py-1.5 rounded-lg text-[#E2EEFD]">
              ECID: {ecid}
            </span>
            <button
              type="button"
              onClick={handleMintFreshEcid}
              title="Generate a fresh guest session ID"
              className="p-2 rounded-lg bg-white/12 hover:bg-white/22 border border-white/20 text-white cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Launch External Storefront Options */}
        <section className="bg-white rounded-2xl border border-[#DCE3EE] shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E9EEF5] bg-[#F9FBFE] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Open Standalone Storefront in a New Tab
              </h2>
              <p className="text-xs text-[#525B69] mt-0.5">
                Choose how you want to shop. Events from that tab automatically update profiles, ingestion logs, and Databricks below.
              </p>
            </div>
            {showCustomerPicker && (
              <button
                type="button"
                onClick={() => setShowCustomerPicker(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#1473E6] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to options</span>
              </button>
            )}
          </div>

          <div className="p-6">
            {!showCustomerPicker ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Browse as Guest -> New Tab */}
                <div className="rounded-xl border border-[#DCE3EE] p-6 bg-[#FAFBFD] flex flex-col justify-between gap-5">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1473E6] flex items-center justify-center mb-3.5">
                      <User className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">Browse as Guest</h3>
                    <p className="text-xs text-[#525B69] mt-1.5 leading-relaxed">
                      Opens the standalone e-commerce site in a new tab as an anonymous visitor using cookie ID <span className="font-mono text-[#1473E6]">{ecid}</span>.
                    </p>
                  </div>

                  <div>
                    <a
                      href={buildGuestUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1473E6] hover:bg-[#0D5EC2] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Browse as Guest</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Sign In as Customer -> Choose Profile -> New Tab */}
                <div className="rounded-xl border border-[#BFD5F2] p-6 bg-[#F5F9FF] flex flex-col justify-between gap-5">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#1473E6] text-white flex items-center justify-center mb-3.5">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">Sign In as Customer</h3>
                    <p className="text-xs text-[#525B69] mt-1.5 leading-relaxed">
                      Pick a customer profile or enter an email to open the storefront signed in and stitch all shopping activity to Customer 360.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowCustomerPicker(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1473E6] hover:bg-[#0D5EC2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Sign In as Customer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Select a Customer Profile (Opens Storefront in New Tab)
                  </h3>
                  <p className="text-xs text-[#525B69] mt-0.5">
                    Clicking any shopper launches the full e-commerce site in a new tab with identity stitching active.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {PRESET_SHOPPERS.map((p) => (
                    <a
                      key={p.email}
                      href={buildCustomerUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-[#DCE3EE] bg-white hover:border-[#1473E6] hover:bg-[#F7FAFF] transition-all flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-[#0F172A]">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5">{p.city}</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#1473E6] shrink-0" />
                      </div>
                      <div className="text-xs font-mono text-[#1473E6] truncate">{p.email}</div>
                    </a>
                  ))}
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="pt-4 border-t border-[#E9EEF5] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
                >
                  <input
                    type="text"
                    placeholder="Full name (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#D0D7DE] rounded-lg focus:outline-none focus:border-[#1473E6]"
                  />
                  <input
                    type="email"
                    placeholder="Or custom customer email (e.g. alex@company.com)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#D0D7DE] rounded-lg focus:outline-none focus:border-[#1473E6]"
                  />
                  {isCustomEmailValid ? (
                    <a
                      href={customCustomerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1473E6] hover:bg-[#0D5EC2] whitespace-nowrap shrink-0"
                    >
                      <span>Open Storefront</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] bg-[#F1F5F9] whitespace-nowrap shrink-0">
                      Enter valid email
                    </span>
                  )}
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Live Logged Storefront Events in Real-Time CDP */}
        <section className="bg-white rounded-2xl border border-[#DCE3EE] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E9EEF5] bg-[#F9FBFE] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#1473E6]" />
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Live Events Logged to Real-Time CDP
                </h2>
                <p className="text-xs text-[#525B69]">
                  Updates automatically as you browse, add to cart, or check out in the storefront tab.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={syncFromServer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D0D7DE] bg-white hover:border-[#1473E6] text-xs font-semibold text-[#334155] hover:text-[#1473E6] cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Live Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E9EEF5] border-b border-[#E9EEF5] bg-white">
            <div className="px-5 py-4">
              <div className="text-xs text-[#64748B] font-medium">Logged Events</div>
              <div className="text-xl font-bold font-mono text-[#1473E6] tabular-nums mt-0.5">
                {loggedEvents.length}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-[#64748B] font-medium">Unified Profiles</div>
              <div className="text-xl font-bold font-mono text-[#0F172A] tabular-nums mt-0.5">
                {unifiedStorefrontProfilesCount}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-[#64748B] font-medium">Databricks Bronze</div>
              <div className="text-xl font-bold font-mono text-[#0284C7] tabular-nums mt-0.5">
                {(databricksStatus?.totalEventsStreamed ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-[#64748B] font-medium">Abandoned Carts</div>
              <div className="text-xl font-bold font-mono text-[#0A3D82] tabular-nums mt-0.5">
                {(databricksStatus?.totalCartAbandonments ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Event Feed */}
          <div className="divide-y divide-[#EEF1F5] max-h-[360px] overflow-y-auto">
            {loggedEvents.length === 0 ? (
              <div className="p-10 text-center space-y-1.5">
                <p className="text-sm font-semibold text-[#334155]">No storefront events logged yet</p>
                <p className="text-xs text-[#64748B]">
                  Click <strong>Browse as Guest</strong> or <strong>Sign In as Customer</strong> above to open the storefront and stream your first events.
                </p>
              </div>
            ) : (
              loggedEvents.map((ev) => {
                const actor = ev.identifiers?.email || ev.identifiers?.cookieId || 'Guest';
                const productName = ev.payload?.product_name;
                const searchQ = ev.payload?.search_query;
                const matchedProfileId = ev.stitchingLog?.matchedProfileId;
                return (
                  <div
                    key={ev.id}
                    className="px-6 py-3.5 hover:bg-[#F9FBFE] flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3D82] bg-[#EFF6FF] border border-[#C7DFFE] px-2 py-0.5 rounded">
                          <Zap className="w-3 h-3 text-[#1473E6]" />
                          {ev.eventType}
                        </span>
                        <span className="text-xs font-medium text-[#0F172A]">
                          {productName
                            ? productName
                            : searchQ
                            ? `Search: "${searchQ}"`
                            : ev.payload?.category
                            ? `Category: ${ev.payload.category}`
                            : ev.channel}
                        </span>
                        {typeof ev.payload?.total_amount === 'number' && (
                          <span className="text-xs font-mono font-semibold text-[#059669] tabular-nums">
                            ${ev.payload.total_amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#64748B]">
                        Actor: {actor}
                        {matchedProfileId ? ` · Profile: ${matchedProfileId}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {matchedProfileId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProfileId(matchedProfileId);
                            setActiveTab('profiles');
                          }}
                          className="text-xs font-semibold text-[#1473E6] hover:underline cursor-pointer"
                        >
                          View Profile
                        </button>
                      )}
                      <span className="text-xs font-mono text-[#64748B] tabular-nums">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick CDP Destinations */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E9EEF5] flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-[#525B69] mr-1">Inspect in CDP:</span>
            <button
              type="button"
              onClick={() => setActiveTab('profiles')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EE] hover:border-[#1473E6] text-xs font-semibold text-[#0F172A] hover:text-[#1473E6] cursor-pointer transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Customer 360 Profiles</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('databricks_warehouse')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EE] hover:border-[#1473E6] text-xs font-semibold text-[#0F172A] hover:text-[#1473E6] cursor-pointer transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Databricks Lakehouse</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ingestion')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EE] hover:border-[#1473E6] text-xs font-semibold text-[#0F172A] hover:text-[#1473E6] cursor-pointer transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Ingestion Streams</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit_logs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EE] hover:border-[#1473E6] text-xs font-semibold text-[#0F172A] hover:text-[#1473E6] cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#1473E6]" />
              <span>Audit Logs</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
