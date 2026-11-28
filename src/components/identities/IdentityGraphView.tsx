import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { CustomerProfile, IdentityNode, IdentityLink } from '../../types/cdp';
import { resolveAvatarUrl } from '../../utils/avatarResolver';
import {
  GitMerge,
  Key,
  Globe,
  Mail,
  Phone,
  Database,
  Smartphone,
  Shield,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Split,
  Cpu,
  RefreshCw,
  Info,
  Sliders,
  Check,
  Zap,
  Activity,
  UserCheck,
  ChevronDown
} from 'lucide-react';

interface CollisionScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  sharedIdentifier: { type: string; value: string };
  profileA: { name: string; crmId: string; email: string };
  profileB: { name: string; crmId: string; email: string };
}

const COLLISION_SCENARIOS: CollisionScenario[] = [
  {
    id: 'shared_tablet',
    title: 'Shared Household iPad Collision',
    subtitle: 'Cross-Account Device Reuse',
    description: 'Two adult family members alternate browsing and authenticating on a shared household iPad tablet.',
    sharedIdentifier: { type: 'cookie', value: 'ECID_IPAD_HOUSEHOLD_9941' },
    profileA: { name: 'Sofia Tanaka', crmId: 'CRM_90214', email: 'sofia.tanaka@designstudios.jp' },
    profileB: { name: 'Kenji Tanaka', crmId: 'CRM_90882', email: 'kenji.tanaka@tokyomedia.jp' }
  },
  {
    id: 'recycled_phone',
    title: 'Recycled Mobile Phone Number',
    subtitle: 'Telco SIM Re-assignment',
    description: 'A mobile number (+1-555-0192) was re-assigned to a new subscriber after 90 days of carrier dormancy.',
    sharedIdentifier: { type: 'phone', value: '+1-555-0192' },
    profileA: { name: 'Alex Rivera', crmId: 'CRM_44102', email: 'alex.rivera@enterprisecorp.io' },
    profileB: { name: 'Jordan Hayes', crmId: 'CRM_66710', email: 'jordan.hayes@cloudworks.net' }
  },
  {
    id: 'corporate_kiosk',
    title: 'Retail Store POS Kiosk Session',
    subtitle: 'Unauthenticated Terminal Overflow',
    description: 'Multiple shoppers interact with the same instore showroom kiosk within a 15-minute window.',
    sharedIdentifier: { type: 'device', value: 'KIOSK_RETAIL_SOHO_04' },
    profileA: { name: 'Marcus Vance', crmId: 'CRM_11048', email: 'marcus.vance@apexlogistics.com' },
    profileB: { name: 'Elena Rostova', crmId: 'CRM_77391', email: 'elena.rostova@fintech-security.de' }
  }
];

type ResolutionStrategy = 'strict_partition' | 'primary_precedence' | 'soft_link' | 'household_cluster';

export const IdentityGraphView: React.FC = () => {
  const { profiles, ingestEvent, setSelectedProfileId, setActiveTab, mergeProfiles, splitProfileIdentity, generateSampleProfiles } = useCDP();

  // Navigation mode: 'node_graph' | 'collision_simulator' | 'live_stitcher' | 'probabilistic_studio'
  const [activeTabMode, setActiveTabMode] = useState<'node_graph' | 'collision_simulator' | 'live_stitcher' | 'probabilistic_studio'>('node_graph');

  // Probabilistic Studio State
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [similarityAlgo, setSimilarityAlgo] = useState<'jaro_winkler' | 'levenshtein'>('jaro_winkler');
  const [nameWeight, setNameWeight] = useState<number>(40);
  const [deviceWeight, setDeviceWeight] = useState<number>(30);
  const [emailDomainWeight, setEmailDomainWeight] = useState<number>(20);
  const [dismissedPairs, setDismissedPairs] = useState<Set<string>>(new Set());
  const [probabilisticMergeSuccess, setProbabilisticMergeSuccess] = useState<string | null>(null);

  // Split Node State
  const [splitSourceProfileId, setSplitSourceProfileId] = useState<string>(profiles[0]?.id || '');
  const [splitTargetNodeId, setSplitTargetNodeId] = useState<string>('');
  const [splitSuccessMsg, setSplitSuccessMsg] = useState<string | null>(null);

  // Selected Profile for Graph Explorer
  const [selectedProfileId, setGraphProfileId] = useState<string>(profiles[0]?.id || '');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [edgeFilter, setEdgeFilter] = useState<'all' | 'deterministic' | 'probabilistic'>('all');

  // Live Stitching Form State
  const [testEmail, setTestEmail] = useState('sofia.tanaka@designstudios.jp');
  const [testCookie, setTestCookie] = useState('cid_anon_temp_5104');
  const [mergeMessage, setMergeMessage] = useState<string | null>(null);

  // Collision Simulator State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('shared_tablet');
  const [selectedStrategy, setSelectedStrategy] = useState<ResolutionStrategy>('strict_partition');
  const [isSimulatingCollision, setIsSimulatingCollision] = useState<boolean>(false);
  const [collisionResult, setCollisionResult] = useState<{
    status: 'resolved';
    strategyApplied: ResolutionStrategy;
    summary: string;
    steps: { title: string; detail: string; timestamp: string }[];
    resultingGraphs: { profileName: string; crmId: string; nodes: string[]; role: string }[];
  } | null>(null);

  const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];
  const selectedScenario = COLLISION_SCENARIOS.find(s => s.id === selectedScenarioId) || COLLISION_SCENARIOS[0];

  const handleSimulateStitch = () => {
    const res = ingestEvent(
      {
        anon_cookie_id: testCookie,
        customer_email: testEmail,
        event_name: 'FormSubmit',
        auth_action: 'Deterministic Stitching Test'
      },
      'Web SDK',
      'schema_web_sdk_v1'
    );
    setMergeMessage(res.message);
    setGraphProfileId(res.profileId);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-[#1473E6]" />;
      case 'cookie': return <Globe className="w-4 h-4 text-[#0284C7]" />;
      case 'phone': return <Phone className="w-4 h-4 text-[#0EA5E9]" />;
      case 'crmId': return <Database className="w-4 h-4 text-[#1D4ED8]" />;
      case 'device': return <Smartphone className="w-4 h-4 text-[#0A3D82]" />;
      default: return <Key className="w-4 h-4 text-[#0F58B8]" />;
    }
  };

  // Filter nodes based on selected edge type
  const displayedNodes = useMemo(() => {
    if (!activeProfile) return [];
    if (edgeFilter === 'all') return activeProfile.identities;
    if (edgeFilter === 'deterministic') {
      return activeProfile.identities.filter((_, idx) => idx % 3 !== 2);
    }
    // probabilistic
    return activeProfile.identities.filter((_, idx) => idx % 3 === 2);
  }, [activeProfile, edgeFilter]);

  const activeNode = activeProfile?.identities.find(n => n.id === selectedNodeId) || activeProfile?.identities[0];

  // Execute collision simulator
  const handleRunCollisionSimulation = async () => {
    setIsSimulatingCollision(true);
    setCollisionResult(null);

    await new Promise(r => setTimeout(r, 600));

    const strategyDescriptions: Record<ResolutionStrategy, string> = {
      strict_partition: 'Strict Single-Account Partition applied. Shared device link was severed between conflicting CRM namespaces to prevent PII leakage and cross-account contamination.',
      primary_precedence: 'Primary Identity Precedence applied. Device retained on oldest authenticated profile (Profile A); Profile B flagged as guest session on this device.',
      soft_link: 'Probabilistic Soft-Link (0.65 confidence) established. Device mapped to household tier but excluded from 1-to-1 personalized marketing.',
      household_cluster: 'Household Graph Cluster created. Formed an overarching household container linking both individual profile graphs with shared television/tablet traits.'
    };

    const steps = [
      {
        title: 'Collision Ingestion Alert',
        detail: `Identifier ${selectedScenario.sharedIdentifier.value} presented credentials for both ${selectedScenario.profileA.name} (${selectedScenario.profileA.crmId}) and ${selectedScenario.profileB.name} (${selectedScenario.profileB.crmId}).`,
        timestamp: 'T+0.8ms'
      },
      {
        title: 'Namespace Conflict Validation',
        detail: 'Detected multiple distinct authoritative CRM IDs bound to a single client hardware signature.',
        timestamp: 'T+1.4ms'
      },
      {
        title: 'DULE Privacy Policy Evaluation',
        detail: `Policy check: C1 (Contractual Restriction) & I1 (Identity Confidentiality) prevent automated silent graph merging.`,
        timestamp: 'T+2.1ms'
      },
      {
        title: 'Resolution Algorithm Execution',
        detail: strategyDescriptions[selectedStrategy],
        timestamp: 'T+3.2ms'
      }
    ];

    const resultingGraphs = [
      {
        profileName: selectedScenario.profileA.name,
        crmId: selectedScenario.profileA.crmId,
        nodes: [selectedScenario.profileA.email, selectedScenario.profileA.crmId, selectedStrategy === 'primary_precedence' ? selectedScenario.sharedIdentifier.value : 'ECID_DESKTOP_SECURE_01'],
        role: 'Primary Account (Authoritative)'
      },
      {
        profileName: selectedScenario.profileB.name,
        crmId: selectedScenario.profileB.crmId,
        nodes: [selectedScenario.profileB.email, selectedScenario.profileB.crmId, selectedStrategy === 'strict_partition' ? 'ECID_MOBILE_ISOLATED_88' : 'ECID_SECONDARY_SESSION'],
        role: selectedStrategy === 'strict_partition' ? 'Isolated Partition (Secure)' : 'Secondary Account'
      }
    ];

    setCollisionResult({
      status: 'resolved',
      strategyApplied: selectedStrategy,
      summary: strategyDescriptions[selectedStrategy],
      steps,
      resultingGraphs
    });

    setIsSimulatingCollision(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner: Clean 2-tier layout so title, description, and mode switcher never crowd on laptop/desktop */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-start gap-4 min-w-0">
          <PageBackButton fallbackTab="hub_customers" fallbackLabel="Customers" className="mt-0.5 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <GitMerge className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Identity Graph Stitching &amp; Collision Visualizer
              </h2>
              <span className="text-xs font-medium text-blue-100 whitespace-nowrap shrink-0">
                &middot; Graph DB Engine
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1.5 max-w-3xl leading-relaxed">
              Inspect cross-device identity clusters, deterministic &amp; probabilistic links, and test automated resolution of identity collisions during shared device usage.
            </p>
          </div>
        </div>

        {/* Preferred View Type Dropdown */}
        <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-3">
          <label
            htmlFor="identity-view-type-select"
            className="text-xs font-semibold text-blue-100 whitespace-nowrap"
          >
            Select your preferred view type
          </label>
          <div className="relative inline-block min-w-[260px]">
            <select
              id="identity-view-type-select"
              value={activeTabMode}
              onChange={(e) =>
                setActiveTabMode(
                  e.target.value as
                    | 'node_graph'
                    | 'collision_simulator'
                    | 'live_stitcher'
                    | 'probabilistic_studio'
                )
              }
              className="w-full appearance-none bg-white text-[#0A3D82] border border-white/80 rounded-lg pl-3.5 pr-9 py-2 text-xs font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
            >
              <option value="node_graph">Node-Link Graph Explorer</option>
              <option value="collision_simulator">Collision &amp; Split Simulator</option>
              <option value="live_stitcher">Real-Time Stitcher</option>
              <option value="probabilistic_studio">Probabilistic Studio &amp; Merge Policies</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#1473E6] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Mode 1: Node-Link Graph Explorer */}
      {activeTabMode === 'node_graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Unified Profile Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Customer Profiles
                </h3>
                <span className="text-[10px] font-mono bg-white/15 border border-white/25 text-white px-2 py-0.5 rounded font-semibold tabular-nums">{profiles.length} Unified Records</span>
              </div>

              <div className="p-5 space-y-2 max-h-[380px] overflow-y-auto">
                {profiles.length === 0 ? (
                  <div className="py-6 px-3 text-center space-y-3 bg-[#F8FAFC] rounded-lg border border-dashed border-[#D0D7DE]">
                    <p className="text-xs font-semibold text-[#1E2229]">No customer profiles yet</p>
                    <p className="text-[11px] text-[#596780]">
                      Generate unified customer profiles with distinct portraits and multi-node identity graphs.
                    </p>
                    <button
                      type="button"
                      onClick={generateSampleProfiles}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Customer Profiles</span>
                    </button>
                  </div>
                ) : (
                  profiles.map(p => {
                    const isSelected = p.id === activeProfile?.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setGraphProfileId(p.id);
                          setSelectedNodeId(null);
                        }}
                        className={`p-3 rounded border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                            : 'bg-[#FFFFFF] border-[#E1E5EA] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {p.avatarUrl ? (
                            <img
                              src={resolveAvatarUrl(p.avatarUrl, p.id)}
                              alt={p.unifiedName}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E1E5EA]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] flex items-center justify-center text-[10px] font-bold shrink-0">
                              {(p.unifiedName || 'U')
                                .split(' ')
                                .map(s => s[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs truncate font-bold text-[#1E2229]">{p.unifiedName}</p>
                            <p className="text-[10px] text-[#596780] font-mono truncate">{p.id}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono bg-[#F2F4F7] px-2 py-0.5 rounded border border-[#D0D7DE] text-[#1E2229] shrink-0 font-semibold">
                          {p.identities.length} nodes
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              {profiles.length > 0 && (
                <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E1E5EA] flex items-center justify-between">
                  <span className="text-[11px] text-[#596780]">Need additional records?</span>
                  <button
                    type="button"
                    onClick={generateSampleProfiles}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white hover:bg-[#EBF3FC] border border-[#D0D7DE] hover:border-[#1473E6] text-[#1473E6] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Selected Node Inspector */}
            {activeNode && (
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3 border-b border-[#0E4DA4] flex items-center space-x-2">
                  <Key className="w-4 h-4 text-white shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Node Inspector: {activeNode.type.toUpperCase()}
                  </h3>
                </div>

                <div className="p-5 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[#596780] uppercase font-bold">Identifier Value</label>
                    <p className="font-mono text-xs font-bold text-[#1E2229] break-all bg-[#F8FAFC] p-2 rounded border border-[#E1E5EA]">
                      {activeNode.value}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#596780] uppercase font-bold">Namespace</label>
                      <p className="font-bold text-[#1E2229]">{activeNode.type}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#596780] uppercase font-bold">Confidence</label>
                      <p className="font-bold text-[#0E7A36] font-mono">1.0 (Deterministic)</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#596780] uppercase font-bold">Source Ingestion Channel</label>
                    <p className="text-[#1E2229]">{activeNode.source}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#596780] pt-1">
                    <div>First Seen: {new Date(activeNode.firstSeen).toLocaleDateString()}</div>
                    <div>Last Seen: {new Date(activeNode.lastSeen).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Visual Node-Link Canvas */}
          <div className="lg:col-span-8 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden flex flex-col justify-between">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-6 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{activeProfile?.unifiedName}</h3>
                  <span className="text-[10px] bg-white/15 text-white border border-white/25 font-mono px-2 py-0.5 rounded font-bold">
                    {activeProfile?.id}
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  Unified identity cluster linking {activeProfile?.identities.length} devices, cookies, and authenticated accounts.
                </p>
              </div>

              {/* Edge Filter Toggle */}
              <div className="flex items-center space-x-1 bg-white/15 p-1 rounded border border-white/25 shrink-0">
                <button
                  type="button"
                  onClick={() => setEdgeFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded whitespace-nowrap cursor-pointer ${
                    edgeFilter === 'all' ? 'bg-white text-[#0D66D0] shadow-2xs' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  All Edges
                </button>
                <button
                  type="button"
                  onClick={() => setEdgeFilter('deterministic')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded whitespace-nowrap cursor-pointer ${
                    edgeFilter === 'deterministic' ? 'bg-white text-[#0E7A36] shadow-2xs' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  Deterministic (1.0)
                </button>
                <button
                  type="button"
                  onClick={() => setEdgeFilter('probabilistic')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded whitespace-nowrap cursor-pointer ${
                    edgeFilter === 'probabilistic' ? 'bg-white text-[#B25900] shadow-2xs' : 'text-blue-100 hover:text-white'
                  }`}
                >
                  Probabilistic (&lt;1.0)
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>

              {/* Node-Link Canvas Visualizer */}
              <div className="bg-[#FAFBFD] rounded-xl p-6 border border-[#E1E5EA] relative overflow-hidden min-h-[360px] flex flex-col items-center justify-center select-none">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#D5D5D5_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

                {/* Central Unified Hub Node */}
                <div className="relative z-10 p-4 bg-white rounded-xl border-2 border-[#1473E6] shadow-sm flex flex-col items-center text-center max-w-[210px] mb-8 ring-4 ring-[#EBF3FC]">
                  <div className="w-12 h-12 rounded-full bg-[#1473E6] text-white flex items-center justify-center font-bold text-base shadow-xs mb-2">
                    <GitMerge className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#1E2229] truncate w-full">
                    {activeProfile?.unifiedName}
                  </span>
                  <span className="text-[9px] font-mono text-[#1473E6] font-bold bg-[#EBF3FC] px-2 py-0.5 rounded mt-1">
                    UNIFIED PERSON HUB
                  </span>
                </div>

                {/* Connected Identity Nodes Grid */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                  {displayedNodes.map((node, idx) => {
                    const isSelected = activeNode?.id === node.id;
                    const isProbabilistic = idx % 3 === 2;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 bg-white rounded-lg border transition-all cursor-pointer flex items-center space-x-3 shadow-2xs ${
                          isSelected
                            ? 'border-[#1473E6] ring-2 ring-[#BFDBFE]'
                            : 'border-[#E1E5EA] hover:border-[#1473E6]'
                        }`}
                      >
                        <div className="p-2 bg-[#F2F4F7] rounded border border-[#E1E5EA] shrink-0">
                          {getNodeIcon(node.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-[#596780] font-mono">
                              {node.type}
                            </span>
                            <span
                              className={`text-[9px] font-bold font-mono px-1 rounded ${
                                isProbabilistic
                                  ? 'bg-[#FFF4E5] text-[#B76E00]'
                                  : 'bg-[#DEFBE6] text-[#0E7A36]'
                              }`}
                            >
                              {isProbabilistic ? '0.85 PROB' : '1.0 MATCH'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#1E2229] font-mono truncate mt-0.5" title={node.value}>
                            {node.value}
                          </p>
                          <p className="text-[9px] text-[#596780] truncate mt-0.5">Source: {node.source}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Audit & Compliance Footer */}
            <div className="pt-3 border-t border-[#E1E5EA] flex flex-wrap items-center justify-between text-xs text-[#596780] gap-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#0D66D0]" />
                <span>Deterministic identity cluster complies with SOC 2 & GDPR Art. 15 right to access.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedProfileId(activeProfile?.id);
                  setActiveTab('profiles');
                }}
                className="text-xs font-semibold text-[#1473E6] hover:underline flex items-center space-x-1"
              >
                <span>View Full 360 Customer Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Identity Collision & Graph Split Simulator */}
      {activeTabMode === 'collision_simulator' && (
        <div className="space-y-6">
          {/* Scenario Selection Deck */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Real-World Identity Collision Scenario
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Simulate ambiguity when distinct authenticated customers interact with the same device or cookie.
                </p>
              </div>
            </div>

            <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {COLLISION_SCENARIOS.map(scenario => {
                const isSelected = scenario.id === selectedScenarioId;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioId(scenario.id);
                      setCollisionResult(null);
                    }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6] shadow-2xs'
                        : 'bg-white border-[#E1E5EA] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase text-[#1D4ED8] block">{scenario.subtitle}</span>
                    <p className="text-xs font-bold text-[#1E2229] mt-0.5">{scenario.title}</p>
                    <p className="text-[11px] text-[#596780] mt-1 leading-snug">{scenario.description}</p>
                    <div className="mt-3 pt-2 border-t border-[#E1E5EA] flex items-center space-x-1.5 text-[10px] font-mono text-[#1E2229]">
                      <span className="text-[#596780]">Contested:</span>
                      <strong className="text-[#0D66D0] truncate">{scenario.sharedIdentifier.value}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          </div>

          {/* Strategy Selection & Run Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Strategy Selector */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-white shrink-0" />
                  <span>Collision Resolution Policy Engine</span>
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Choose the automated governance strategy applied when this identity conflict is detected in real time:
                </p>
              </div>

              <div className="p-5 space-y-4 flex-1">
              <div className="space-y-2.5">
                {[
                  {
                    id: 'strict_partition',
                    title: 'Strict Single-Account Partition (Recommended)',
                    desc: 'Immediately drops the ambiguous bridge and maintains separate customer profile clusters to eliminate PII leakage risk.'
                  },
                  {
                    id: 'primary_precedence',
                    title: 'Primary Identity Precedence',
                    desc: 'Retains device link to the oldest verified CRM profile; treats the secondary user session as an isolated guest.'
                  },
                  {
                    id: 'soft_link',
                    title: 'Probabilistic Soft-Link (0.65 Match)',
                    desc: 'Maintains a low-confidence association without merging financial traits, suppressed from sensitive activations.'
                  },
                  {
                    id: 'household_cluster',
                    title: 'Household Graph Cluster',
                    desc: 'Builds a parent household node linking both individuals while preserving individual CRM accounts.'
                  }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3 rounded border block cursor-pointer transition-all ${
                      selectedStrategy === opt.id
                        ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                        : 'bg-[#F8FAFC] border-[#E1E5EA] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="radio"
                        name="resolution_strategy"
                        value={opt.id}
                        checked={selectedStrategy === opt.id}
                        onChange={() => setSelectedStrategy(opt.id as ResolutionStrategy)}
                        className="mt-0.5 text-[#1473E6] focus:ring-[#1473E6]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#1E2229]">{opt.title}</p>
                        <p className="text-[11px] text-[#596780] mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRunCollisionSimulation}
                disabled={isSimulatingCollision}
                className={`w-full py-2.5 rounded text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-2xs ${
                  isSimulatingCollision
                    ? 'bg-[#CBD5E1] text-[#64748B] cursor-wait'
                    : 'bg-gradient-to-r from-[#1473E6] to-[#0A3D82] hover:from-[#0D66D0] hover:to-[#082E63] text-white cursor-pointer'
                }`}
              >
                {isSimulatingCollision ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resolving Graph Conflict...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Execute Graph Collision Resolution</span>
                  </>
                )}
              </button>
              </div>
            </div>

            {/* Right: Interactive Split / Merge Visualizer */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-white shrink-0" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Graph Resolution Visualizer
                    </h3>
                  </div>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Inspect partitioned sub-graphs and deterministic trace logs after conflict execution.
                  </p>
                </div>

                {collisionResult && (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] rounded shrink-0">
                    POLICY RESOLVED (3.2ms)
                  </span>
                )}
              </div>

              <div className="p-5 space-y-4 flex-1">

              {!collisionResult ? (
                <div className="p-8 text-center border border-dashed border-[#CBD5E1] rounded-lg bg-[#FAFBFD] space-y-2">
                  <AlertTriangle className="w-6 h-6 text-[#0284C7] mx-auto" />
                  <p className="text-xs font-bold text-[#1E2229]">
                    Collision Condition Pending Resolution
                  </p>
                  <p className="text-[11px] text-[#596780] max-w-sm mx-auto">
                    {selectedScenario.sharedIdentifier.value} is contested by {selectedScenario.profileA.name} and {selectedScenario.profileB.name}. Click Execute to simulate the resolution logic.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Summary Callout */}
                  <div className="p-3 bg-[#EBF3FC] border border-[#BFDBFE] rounded text-xs text-[#0A3D82] flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D66D0] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Collision Resolved Cleanly</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed">{collisionResult.summary}</p>
                    </div>
                  </div>

                  {/* Resulting Sub-Graphs Visual */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#596780] uppercase tracking-wider block">
                      Partitioned Identity Clusters
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {collisionResult.resultingGraphs.map((g, idx) => (
                        <div key={idx} className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E1E5EA] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1E2229]">{g.profileName}</span>
                            <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#BFDBFE] text-[#1D4ED8] font-semibold">
                              {g.crmId}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#0D66D0] font-semibold block">{g.role}</span>
                          <div className="space-y-1 pt-1 border-t border-[#E1E5EA]">
                            {g.nodes.map((n, nIdx) => (
                              <div key={nIdx} className="text-[10px] font-mono text-[#596780] truncate flex items-center space-x-1">
                                <span>&bull;</span>
                                <span className="truncate">{n}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Steps Trace */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E1E5EA]">
                    <span className="text-[10px] font-bold text-[#596780] uppercase tracking-wider block">
                      Resolution Trace Steps
                    </span>
                    <div className="space-y-1">
                      {collisionResult.steps.map((st, sIdx) => (
                        <div key={sIdx} className="p-2 bg-[#FAFBFD] rounded border border-[#E1E5EA] text-[11px] flex items-start justify-between">
                          <div className="min-w-0 pr-2">
                            <strong className="text-[#1E2229] block">{st.title}</strong>
                            <span className="text-[#596780] leading-snug block mt-0.5">{st.detail}</span>
                          </div>
                          <span className="text-[9px] font-mono text-[#596780] shrink-0 font-semibold">{st.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Real-Time Live Stitching Playground */}
      {activeTabMode === 'live_stitcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Interactive Live Stitching Form
                </h3>
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Trigger an authentication event that dynamically merges an anonymous cookie with an authenticated email address in real time.
              </p>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-[#596780] uppercase font-bold">Anonymous Cookie ID (ECID)</label>
                <input
                  type="text"
                  value={testCookie}
                  onChange={e => setTestCookie(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0E7A36] font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#596780] uppercase font-bold">Target User Email (CRM)</label>
                <input
                  type="text"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-[#0D66D0] font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSimulateStitch}
                className="w-full py-2.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Execute Graph Link & Merge</span>
              </button>

              {mergeMessage && (
                <div className="p-3 bg-[#EBF3FC] border border-[#BFDBFE] text-[#0A3D82] rounded text-xs">
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-[#0D66D0]" />
                  {mergeMessage}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Deterministic Stitching Architecture
              </h3>
              <p className="text-[11px] text-blue-100 mt-0.5">
                How authenticated identity hashes trigger real-time cluster graph traversal and edge propagation.
              </p>
            </div>
            <div className="p-5 space-y-3">
            <p className="text-xs text-[#596780] leading-relaxed">
              When a visitor signs in, the XLR8 Identity Service receives both the client-side ECID and the authenticated hash. It immediately executes a graph traversal across the cluster database, merging previous unauthenticated event histories into the unified customer profile timeline.
            </p>
            <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA] space-y-2 text-xs">
              <div className="font-bold text-[#1E2229]">Graph Invariants:</div>
              <ul className="list-disc list-inside space-y-1 text-[#596780] text-[11px]">
                <li>Deterministic edges have 1.0 confidence and never expire unless explicitly requested under GDPR Article 17.</li>
                <li>Probabilistic edges decay over 90 days if not re-observed.</li>
                <li>DULE privacy policies automatically propagate across all stitched nodes.</li>
              </ul>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Probabilistic Matching & Merge Policies Studio */}
      {activeTabMode === 'probabilistic_studio' && (
        <div className="space-y-6">
          {/* Rules & Weights Configuration Panel */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-white shrink-0" />
                  <span>Probabilistic Matching Engine Parameters</span>
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Configure statistical distance metrics, confidence gates, and dimension weighting for cross-device identity linkage.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs font-semibold text-blue-100">Threshold:</span>
                <div className="flex items-center space-x-2 bg-white/15 px-3 py-1 rounded border border-white/25">
                  <input
                    type="range"
                    min="60"
                    max="95"
                    value={confidenceThreshold}
                    onChange={e => setConfidenceThreshold(Number(e.target.value))}
                    className="w-24 accent-white cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{confidenceThreshold}% Match</span>
                </div>
              </div>
            </div>

            <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA]">
                <label className="text-[10px] uppercase font-bold text-[#596780] block mb-1">Similarity Metric</label>
                <select
                  value={similarityAlgo}
                  onChange={e => setSimilarityAlgo(e.target.value as any)}
                  className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#1E2229] font-medium"
                >
                  <option value="jaro_winkler">Jaro-Winkler Distance (Prefix Boosted)</option>
                  <option value="levenshtein">Levenshtein Edit Distance (Character Shift)</option>
                </select>
                <span className="text-[10px] text-[#596780] mt-1 block">Best for person names & addresses</span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-[#596780]">Name Weight</label>
                  <span className="font-mono font-bold text-[#1E2229]">{nameWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={nameWeight}
                  onChange={e => setNameWeight(Number(e.target.value))}
                  className="w-full accent-[#1473E6] cursor-pointer"
                />
                <span className="text-[10px] text-[#596780] block mt-1">First & Last Name string closeness</span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-[#596780]">Device / Subnet</label>
                  <span className="font-mono font-bold text-[#1E2229]">{deviceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={deviceWeight}
                  onChange={e => setDeviceWeight(Number(e.target.value))}
                  className="w-full accent-[#1473E6] cursor-pointer"
                />
                <span className="text-[10px] text-[#596780] block mt-1">IP /24 subnet & hardware fingerprint</span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-[#596780]">Email Domain</label>
                  <span className="font-mono font-bold text-[#1E2229]">{emailDomainWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={emailDomainWeight}
                  onChange={e => setEmailDomainWeight(Number(e.target.value))}
                  className="w-full accent-[#1473E6] cursor-pointer"
                />
                <span className="text-[10px] text-[#596780] block mt-1">Corporate or ISP email domain similarity</span>
              </div>
            </div>
            </div>
          </div>

          {/* Feedback message if merge occurred */}
          {probabilisticMergeSuccess && (
            <div className="p-3.5 bg-[#EBF3FC] border border-[#BFDBFE] rounded text-xs text-[#0A3D82] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D66D0] shrink-0" />
                <span>{probabilisticMergeSuccess}</span>
              </div>
              <button
                onClick={() => setProbabilisticMergeSuccess(null)}
                className="text-[#0D66D0] font-bold hover:underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Two-Column Grid: Candidate Matches & Graph Split Utility */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Probabilistic Candidate Matches */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-white shrink-0" />
                  <span>Discovered Candidate Matches (≥ {confidenceThreshold}% Threshold)</span>
                </h3>
                <span className="text-[10px] bg-white/15 border border-white/25 text-white font-mono px-2 py-0.5 rounded font-bold shrink-0">
                  Live Identity Scanner
                </span>
              </div>

              <div className="p-5 space-y-4">

              {/* Dynamic candidates generated from profiles */}
              <div className="space-y-3">
                {profiles.length >= 2 ? (
                  profiles.slice(0, 3).map((p1, idx) => {
                    const p2 = profiles[(idx + 1) % profiles.length];
                    const pairKey = `${p1.id}_${p2.id}`;
                    if (dismissedPairs.has(pairKey) || p1.id === p2.id) return null;

                    // Compute mock realistic confidence based on threshold
                    const score = Math.min(94, Math.max(confidenceThreshold, 82 + idx * 3));
                    if (score < confidenceThreshold) return null;

                    return (
                      <div key={pairKey} className="p-4 rounded border border-[#E1E5EA] bg-[#F8FAFC] hover:bg-white transition-all space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#1E2229]">{p1.unifiedName}</span>
                            <span className="text-[10px] text-[#596780]">({p1.primaryEmail})</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#596780]" />
                            <span className="text-xs font-bold text-[#1E2229]">{p2.unifiedName}</span>
                            <span className="text-[10px] text-[#596780]">({p2.primaryEmail})</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                              {score}% Confidence
                            </span>
                          </div>
                        </div>

                        {/* Breakdown pills */}
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <span className="bg-white border border-[#CBD5E1] px-2 py-0.5 rounded text-[#1E2229]">
                            Name Closeness: <strong>{score - 2}%</strong>
                          </span>
                          <span className="bg-white border border-[#CBD5E1] px-2 py-0.5 rounded text-[#1E2229]">
                            Subnet /24: <strong>Matched (192.168.1.0/24)</strong>
                          </span>
                          <span className="bg-white border border-[#CBD5E1] px-2 py-0.5 rounded text-[#1E2229]">
                            Combined Lifetime Spend: <strong>${((p1.attributes.totalSpend || 0) + (p2.attributes.totalSpend || 0)).toLocaleString()}</strong>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E1E5EA]">
                          <button
                            onClick={() => setDismissedPairs(prev => new Set(prev).add(pairKey))}
                            className="text-xs text-[#596780] hover:text-[#1E2229] font-medium px-3 py-1 rounded hover:bg-[#F2F4F7]"
                          >
                            Dismiss (False Positive)
                          </button>
                          <button
                            onClick={() => {
                              const ok = mergeProfiles(p2.id, p1.id, score / 100, `Probabilistic score of ${score}%`);
                              if (ok) {
                                setProbabilisticMergeSuccess(`Successfully merged ${p2.unifiedName} into ${p1.unifiedName} with full event timeline reconciliation.`);
                              }
                            }}
                            className="flex items-center space-x-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold px-3.5 py-1.5 rounded shadow-2xs transition-all cursor-pointer"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>Merge Graphs</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#596780]">Minimum 2 profiles required to evaluate candidate matches.</p>
                )}
              </div>
              </div>
            </div>

            {/* Right: Graph Partition & Split Console */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4]">
                <div className="flex items-center space-x-2">
                  <Split className="w-4 h-4 text-white shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Graph Split & Unmerge Studio
                  </h3>
                </div>
                <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                  If an identity node was improperly linked (e.g., shared household kiosk or recycled phone number), select the node below to detach it into an isolated profile partition.
                </p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#596780] block mb-1">Select Profile</label>
                  <select
                    value={splitSourceProfileId}
                    onChange={e => {
                      setSplitSourceProfileId(e.target.value);
                      const p = profiles.find(pr => pr.id === e.target.value);
                      setSplitTargetNodeId(p?.identities[0]?.value || '');
                    }}
                    className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#1E2229] font-medium"
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.unifiedName} ({p.identities.length} nodes)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#596780] block mb-1">Identity Node to Sever</label>
                  {(() => {
                    const prof = profiles.find(p => p.id === splitSourceProfileId) || profiles[0];
                    return (
                      <select
                        value={splitTargetNodeId}
                        onChange={e => setSplitTargetNodeId(e.target.value)}
                        className="w-full bg-white border border-[#CBD5E1] rounded px-2.5 py-1.5 text-xs text-[#1E2229] font-medium"
                      >
                        {prof?.identities.map(i => (
                          <option key={i.id} value={i.value}>
                            {i.type.toUpperCase()}: {i.value}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const ok = splitProfileIdentity(splitSourceProfileId, splitTargetNodeId);
                    if (ok) {
                      setSplitSuccessMsg(`Successfully severed node "${splitTargetNodeId}" and generated isolated partition profile.`);
                      setTimeout(() => setSplitSuccessMsg(null), 5000);
                    }
                  }}
                  className="w-full py-2 bg-gradient-to-r from-[#1473E6] to-[#0A3D82] hover:from-[#0D66D0] hover:to-[#082E63] text-white font-bold text-xs rounded transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer mt-2"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Sever Node & Partition Graph</span>
                </button>

                {splitSuccessMsg && (
                  <div className="p-3 bg-[#EBF3FC] border border-[#BFDBFE] text-[#0A3D82] rounded text-[11px] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D66D0] shrink-0" />
                    <span>{splitSuccessMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
