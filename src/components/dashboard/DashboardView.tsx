import React from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { MetricTile } from '../common/MetricTile';
import { TerminalLog } from '../common/TerminalLog';
import { DULEBadge } from '../common/DULEBadge';
import {
  Users,
  GitMerge,
  Target,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Bot,
  Sparkles,
  Wand2,
  RefreshCw,
  Layers,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const THROUGHPUT_DATA = [
  { time: '13:20', rate: 10400, stitched: 320 },
  { time: '13:22', rate: 11200, stitched: 390 },
  { time: '13:24', rate: 12800, stitched: 450 },
  { time: '13:26', rate: 12100, stitched: 410 },
  { time: '13:28', rate: 13400, stitched: 520 },
  { time: '13:30', rate: 12900, stitched: 480 },
  { time: '13:32', rate: 14200, stitched: 610 },
];

const ZERO_THROUGHPUT_DATA = [
  { time: '13:20', rate: 0, stitched: 0 },
  { time: '13:22', rate: 0, stitched: 0 },
  { time: '13:24', rate: 0, stitched: 0 },
  { time: '13:26', rate: 0, stitched: 0 },
  { time: '13:28', rate: 0, stitched: 0 },
  { time: '13:30', rate: 0, stitched: 0 },
  { time: '13:32', rate: 0, stitched: 0 },
];

export const DashboardView: React.FC = () => {
  const {
    profiles,
    audiences,
    destinations,
    schemas,
    systemMetrics,
    anomalies,
    uiMode,
    isDemoMode,
    setActiveTab,
    setSelectedProfileId
  } = useCDP();

  const hasLiveTraffic = isDemoMode || systemMetrics.todayEvents > 0 || profiles.length > 0;
  const chartThroughputData = hasLiveTraffic ? THROUGHPUT_DATA : ZERO_THROUGHPUT_DATA;

  const handleOpenProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    setActiveTab('profiles');
  };

  const highChurnProfiles = profiles.filter(p => p.predictions.churnRisk >= 75);
  const avgLoyalty = Math.round(profiles.reduce((acc, p) => acc + p.predictions.brandLoyaltyScore, 0) / (profiles.length || 1));
  const avgUpsell = Math.round(profiles.reduce((acc, p) => acc + p.predictions.upsellPropensity, 0) / (profiles.length || 1));
  const activeAnomalies = anomalies ? anomalies.filter(a => a.status === 'Active') : [];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Page Title & Breadcrumb Header Bar */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <PageBackButton fallbackTab="home" fallbackLabel="Home" />
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-100 mb-0.5">
              <span>XLR8 Platform</span>
              <span>/</span>
              <span className="font-medium text-white">Real-Time Customer Data Platform</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Overview & Metrics</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('schemas')}
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded border border-white/25 transition-colors shadow-2xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-blue-100" />
            <span>Manage Schemas</span>
          </button>
          <button
            onClick={() => setActiveTab('audiences')}
            className="px-3.5 py-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold rounded transition-colors shadow-2xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Create Audience</span>
          </button>
        </div>
      </div>

      {/* 4 Spectrum KPI Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Unified Profiles"
          value={systemMetrics.totalProfiles.toLocaleString()}
          change={profiles.length > 0 ? 'Live Identity Store' : 'Clean Slate'}
          changeType="positive"
          subtitle="Deterministic Single-Customer View"
          icon={<Users className="w-4 h-4 text-[#1473E6]" />}
        />
        <MetricTile
          label="Identity Stitching"
          value={profiles.length > 0 ? systemMetrics.stitchingRatio : '0%'}
          change={profiles.length > 0 ? 'Deterministic' : 'Awaiting Data'}
          changeType="accent"
          subtitle="Linked Cookies, Emails, IDs"
          icon={<GitMerge className="w-4 h-4 text-[#1473E6]" />}
        />
        <MetricTile
          label="Targetable Audience"
          value={systemMetrics.targetableProfiles.toLocaleString()}
          change={`${audiences.length} Active Segments`}
          changeType="positive"
          subtitle="Privacy & Consent Approved"
          icon={<Target className="w-4 h-4 text-[#1473E6]" />}
        />
        <MetricTile
          label="DULE Consent Blocks"
          value={systemMetrics.privacyBlockedCount.toLocaleString()}
          change="GDPR / CCPA Protected"
          changeType="negative"
          subtitle="Ad Network Suppression Active"
          icon={<ShieldCheck className="w-4 h-4 text-[#0A3D82]" />}
        />
      </div>

      {/* XLR8 GenStudio & Autonomous Copilot Hub (Pro mode) */}
      {uiMode === 'pro' && (
        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-5 py-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wide">XLR8 GenStudio & Autonomous Copilot</h3>
                <span className="text-[10px] bg-white/15 text-white font-semibold px-2 py-0.5 rounded border border-white/25">
                  Natural Language SQL + Self-Healing
                </span>
                {activeAnomalies.length > 0 && (
                  <span className="text-[10px] bg-[#FFEBEB] text-[#D7373F] font-semibold px-2 py-0.5 rounded border border-[#FFCCD0] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D7373F] animate-ping" />
                    <span>{activeAnomalies.length} Drift Alerts</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Query federated data lakehouse tables using natural language, calculate churn uplifts, and trigger automated policy remediations.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('agentic_studio')}
            className="bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Sensei Studio</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Grid: Profiles Table (col 8) + AI Predictive Risk (col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recently Unified Profiles Table */}
        <div className="lg:col-span-8 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">Real-Time Unified Profiles</h3>
              <span className="text-[10px] bg-[#DEFBE6] text-[#0E7A36] font-semibold px-2 py-0.5 rounded border border-[#B4F0C3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A36] animate-pulse" />
                Live Stream
              </span>
            </div>
            <button
              onClick={() => setActiveTab('profiles')}
              className="text-xs text-white bg-white/15 hover:bg-white/25 border border-white/25 px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>View All Profiles</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8F9FA] text-[10px] font-semibold text-[#1E2229] uppercase tracking-wider border-b border-[#E8ECEF]">
                <tr>
                  <th className="px-4 py-2.5">Unified Customer ID</th>
                  <th className="px-4 py-2.5">Identity Graph Nodes</th>
                  <th className="px-4 py-2.5">Churn Propensity</th>
                  <th className="px-4 py-2.5 text-right">Predicted LTV</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8ECEF]">
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#596780]">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="w-6 h-6 text-[#94A3B8]" />
                        <p className="font-semibold text-[#1E2229]">No Unified Customer Profiles Yet</p>
                        <p className="text-[11px] max-w-md">
                          Upload an Excel/CSV file, stream XDM events via Ingestion, or toggle Demo Mode in the top bar to see real-time stitched customer profiles.
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => setActiveTab('create_dataset')}
                            className="px-3 py-1.5 rounded bg-[#1473E6] hover:bg-[#0D66D0] text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Upload Data / Dataset
                          </button>
                          <button
                            onClick={() => setActiveTab('sources')}
                            className="px-3 py-1.5 rounded bg-white border border-[#D5D5D5] hover:bg-[#F2F4F7] text-[#1E2229] text-[11px] font-semibold cursor-pointer"
                          >
                            Connect Source
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  profiles.slice(0, 5).map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                    onClick={() => handleOpenProfile(profile.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={profile.unifiedName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-[#E1E5EA]"
                        />
                        <div>
                          <p className="font-semibold text-[#2C2C2C] group-hover:text-[#1473E6] transition-colors">
                            {profile.unifiedName}
                          </p>
                          <span className="text-[10px] text-[#262A33] font-mono">
                            {profile.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {profile.identities.slice(0, 3).map((ident, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-[#F2F4F7] text-[#1A1D23] rounded text-[10px] font-medium border border-[#E1E5EA]"
                          >
                            {ident.type.toUpperCase()}
                          </span>
                        ))}
                        {profile.identities.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-[#EBF3FC] text-[#0D66D0] rounded text-[10px] font-semibold">
                            +{profile.identities.length - 3}
                          </span>
                        )}
                        {profile.consent.ccpaOptOut && (
                          <span className="px-1.5 py-0.5 bg-[#FFEBEB] text-[#D7373F] rounded text-[10px] font-semibold border border-[#FFCCD0]">
                            Opt-Out
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-[#E1E5EA] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              profile.predictions.churnRisk > 70
                                ? 'bg-[#D7373F]'
                                : profile.predictions.churnRisk > 30
                                ? 'bg-[#B25900]'
                                : 'bg-[#0E7A36]'
                            }`}
                            style={{ width: `${profile.predictions.churnRisk}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-mono font-medium ${
                          profile.predictions.churnRisk > 70 ? 'text-[#D7373F]' : 'text-[#1A1D23]'
                        }`}>
                          {profile.predictions.churnRisk}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-[#2C2C2C] font-mono">
                        ${profile.predictions.predictedLtv.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfile(profile.id);
                        }}
                        className="p-1 text-[#1E2229] hover:text-[#1473E6] hover:bg-[#EBF3FC] rounded transition-colors"
                        title="View 360 Customer Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Throughput Area Chart Footer inside Card (Pro only) */}
          {uiMode === 'pro' && (
            <div className="p-3 bg-[#F9FAFB] border-t border-[#E8ECEF]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#1E2229] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1473E6]" />
                  Real-Time Ingestion Throughput (Events / sec)
                </span>
                <span className="text-[10px] font-mono text-[#262A33]">
                  {hasLiveTraffic ? (isDemoMode ? 'Peak: 14.2k/s' : `Live: ${systemMetrics.ratePerSec} evt/s`) : '0 evt/s (Idle)'}
                </span>
              </div>
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartThroughputData} margin={{ top: 2, right: 0, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1473E6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1473E6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#888888" fontSize={9} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#2C2C2C', borderColor: '#444444', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#1473E6" strokeWidth={1.5} fillOpacity={1} fill="url(#rateGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Predictive Risk & Recommendations */}
        <div className="lg:col-span-4 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-white shrink-0" />
              <span>Sensei AI Propensity Models</span>
            </h3>
            <span className="text-[10px] text-white font-semibold bg-white/15 px-1.5 py-0.5 rounded border border-white/25 shrink-0">
              Continuous ML
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
          <div>

            {/* Score Gauges */}
            <div className="space-y-3.5">
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#1A1D23]">High Churn Risk Cohort</span>
                  <span className="text-[#D7373F] font-mono">
                    {highChurnProfiles.length} Profiles ({profiles.length > 0 ? Math.round((highChurnProfiles.length / profiles.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E1E5EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D7373F] rounded-full transition-all duration-500"
                    style={{ width: `${profiles.length > 0 ? (highChurnProfiles.length / profiles.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#1A1D23]">Upsell Propensity Index</span>
                  <span className="text-[#0E7A36] font-mono">{avgUpsell}% AVG</span>
                </div>
                <div className="w-full h-1.5 bg-[#E1E5EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0E7A36] rounded-full transition-all duration-500"
                    style={{ width: `${avgUpsell}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#1A1D23]">Brand Affinity Composite</span>
                  <span className="text-[#0D66D0] font-mono">{avgLoyalty}% AVG</span>
                </div>
                <div className="w-full h-1.5 bg-[#E1E5EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1473E6] rounded-full transition-all duration-500"
                    style={{ width: `${avgLoyalty}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Next Best Actions Box */}
            <div className="mt-4 bg-[#F8F9FA] p-3 rounded border border-[#E1E5EA]">
              <p className="text-[10px] font-bold text-[#1E2229] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#0284C7]" />
                Sensei Next-Best-Action Engine
              </p>
              <ul className="space-y-1.5 text-[11px] text-[#1A1D23]">
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#1473E6] font-bold">•</span>
                  <span><strong>Churn Suppression:</strong> Route {highChurnProfiles.length} high-risk users to VIP retention workflow.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#0E7A36] font-bold">•</span>
                  <span><strong>Cross-Sell:</strong> Push 15% incentive to high-intent cart abandoners via Edge Target.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#B25900] font-bold">•</span>
                  <span>
                    <strong>DULE Guardrail:</strong> {systemMetrics.privacyBlockedCount} profile{systemMetrics.privacyBlockedCount === 1 ? '' : 's'} suppressed from ad sync due to consent rules.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('audiences')}
            className="mt-3.5 w-full py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#1473E6] text-xs font-semibold rounded border border-[#D5D5D5] transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Open Segment Builder</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Real-Time Ingestion Loop + Activation Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Terminal Log (Pro only) */}
        {uiMode === 'pro' && (
          <div className="lg:col-span-5">
            <TerminalLog maxItems={7} className="h-64" />
          </div>
        )}

        {/* Activation Destinations Catalog preview */}
        <div className={`${uiMode === 'pro' ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden flex flex-col justify-between`}>
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Activated Destinations</h3>
              <p className="text-[11px] text-blue-100">Streaming connectors with DULE privacy enforcement</p>
            </div>
            <button
              onClick={() => setActiveTab('destinations')}
              className="text-xs text-white bg-white/15 hover:bg-white/25 border border-white/25 px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
          <div>

            {destinations.length === 0 ? (
              <div className="border border-dashed border-[#D0D7DE] rounded-lg p-6 text-center bg-[#F9FAFB] space-y-2">
                <p className="text-xs font-semibold text-[#1E2229]">No Destinations Connected Yet</p>
                <p className="text-[11px] text-[#596780]">Explore 18+ ad, CRM, personalization, and cloud destinations to activate real-time segments.</p>
                <button
                  onClick={() => setActiveTab('destinations')}
                  className="px-3 py-1.5 rounded bg-[#1473E6] hover:bg-[#0D66D0] text-white text-[11px] font-semibold cursor-pointer"
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {destinations.slice(0, 4).map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => setActiveTab('destinations')}
                    className="border border-[#E1E5EA] rounded p-3 flex flex-col items-center justify-center text-center space-y-1.5 hover:bg-[#F9FAFB] hover:border-[#CBD2DA] transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#1473E6] to-[#0A3D82] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {dest.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#2C2C2C] truncate max-w-[110px]">{dest.name}</p>
                      <span className="text-[10px] text-[#0E7A36] font-medium">{dest.totalSynced.toLocaleString()} Synced</span>
                    </div>
                    <span className="text-[9px] bg-[#F0F2F5] text-[#1A1D23] px-1.5 py-0.2 rounded font-mono">
                      {dest.syncFrequency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-[#E8ECEF] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center space-x-4 font-mono text-[#1E2229]">
              <span>SYNC FREQ: <strong className="text-[#2C2C2C]">STREAMING</strong></span>
              <span>EDGE LATENCY: <strong className="text-[#2C2C2C]">180ms</strong></span>
            </div>
            <div className="flex items-center space-x-1 font-semibold text-[#0D66D0]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0D66D0]" />
              <span>DULE POLICY ENFORCED</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

