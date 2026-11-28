import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { CustomerProfile } from '../../types/cdp';
import { ProfileDetailModal } from './ProfileDetailModal';
import { resolveAvatarUrl } from '../../utils/avatarResolver';
import {
  Users,
  Search,
  Filter,
  ExternalLink,
  Shield,
  ShieldAlert,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export const ProfileExplorerView: React.FC = () => {
  const { profiles, selectedProfileId, setSelectedProfileId, uiMode, generateSampleProfiles } = useCDP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [privacyFilter, setPrivacyFilter] = useState<'ALL' | 'OPTED_OUT' | 'CONSENTED'>('ALL');
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [modalProfile, setModalProfile] = useState<CustomerProfile | null>(() => {
    if (selectedProfileId) {
      return profiles.find(p => p.id === selectedProfileId) || null;
    }
    return null;
  });

  const filteredProfiles = profiles.filter(p => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.unifiedName.toLowerCase().includes(q);
      const matchEmail = p.primaryEmail.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchIdentities = p.identities.some(i => i.value.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchId && !matchIdentities) return false;
    }

    // Tier filter
    if (selectedTierFilter !== 'ALL' && p.attributes.customerTier !== selectedTierFilter) {
      return false;
    }

    // Privacy filter
    if (privacyFilter === 'OPTED_OUT' && !p.consent.ccpaOptOut && p.consent.gdprConsent) {
      return false;
    }
    if (privacyFilter === 'CONSENTED' && (p.consent.ccpaOptOut || !p.consent.gdprConsent)) {
      return false;
    }

    // High Risk filter
    if (highRiskOnly && p.predictions.churnRisk < 75) {
      return false;
    }

    return true;
  });

  const handleOpenModal = (p: CustomerProfile) => {
    setModalProfile(p);
    setSelectedProfileId(p.id);
  };

  const handleCloseModal = () => {
    setModalProfile(null);
    setSelectedProfileId(null);
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <PageBackButton fallbackTab="hub_customers" fallbackLabel="Customers" />
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-100 mb-0.5">
              <span>Customer</span>
              <span>/</span>
              <span className="font-medium text-white">Profiles (Customer 360)</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Real-Time Customer Profiles</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-xs">
          <span className="px-3 py-1.5 bg-white/15 border border-white/25 rounded font-medium text-white shadow-2xs">
            Total Unified Records: <strong className="text-white font-bold">{profiles.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar Tile */}
      <div className="bg-[#FFFFFF] rounded-md border border-[#E1E5EA] shadow-2xs p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#262A33] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, identity node, ECID, or profile ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-[#D5D5D5] rounded text-xs focus:outline-none focus:border-[#1473E6] bg-[#FFFFFF]"
            />
          </div>

          {/* Tier Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto">
            {['ALL', 'VIP', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTierFilter(tier)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedTierFilter === tier
                    ? 'bg-[#1473E6] text-white'
                    : 'bg-[#F2F4F7] hover:bg-[#E8ECEF] text-[#1A1D23]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#E8ECEF] text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#1E2229] font-semibold uppercase text-[10px]">Consent Status:</span>
            <button
              onClick={() => setPrivacyFilter('ALL')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${privacyFilter === 'ALL' ? 'bg-[#2C2C2C] text-white font-semibold' : 'bg-[#F2F4F7] text-[#1A1D23]'}`}
            >
              All
            </button>
            <button
              onClick={() => setPrivacyFilter('OPTED_OUT')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${privacyFilter === 'OPTED_OUT' ? 'bg-[#FFEBEB] text-[#D7373F] border border-[#FFCCD0] font-semibold' : 'bg-[#F2F4F7] text-[#1A1D23]'}`}
            >
              Opt-Out / Suppressed
            </button>
            <button
              onClick={() => setPrivacyFilter('CONSENTED')}
              className={`px-2 py-0.5 rounded text-xs font-medium ${privacyFilter === 'CONSENTED' ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] font-semibold' : 'bg-[#F2F4F7] text-[#1A1D23]'}`}
            >
              Targetable
            </button>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[#1A1D23] font-medium select-none text-xs">
            <input
              type="checkbox"
              checked={highRiskOnly}
              onChange={e => setHighRiskOnly(e.target.checked)}
              className="rounded text-[#1473E6] focus:ring-[#1473E6]"
            />
            <span>Show High Churn Risk (75%+) Only</span>
          </label>
        </div>
      </div>

      {/* Profiles Table Container */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Unified Customer Directory</h2>
            <p className="text-[11px] text-blue-100 mt-0.5">
              Click any customer profile row to inspect identity graph edges, consent flags, and behavioral timeline.
            </p>
          </div>
          <span className="text-xs font-mono bg-white/15 border border-white/25 text-white px-2.5 py-1 rounded shrink-0 self-start sm:self-center tabular-nums">
            Showing {filteredProfiles.length} of {profiles.length} Profiles
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8F9FA] text-[10px] font-semibold text-[#1E2229] uppercase tracking-wider border-b border-[#E8ECEF]">
              <tr>
                <th className="px-4 py-2.5">Unified Customer ID</th>
                {uiMode === 'pro' && <th className="px-4 py-2.5">Identity Graph Nodes</th>}
                <th className="px-4 py-2.5">Customer Tier</th>
                <th className="px-4 py-2.5 text-right">Lifetime Spend</th>
                {uiMode === 'pro' && (
                  <>
                    <th className="px-4 py-2.5">AI Churn Risk</th>
                    <th className="px-4 py-2.5 text-right">Predicted LTV</th>
                  </>
                )}
                <th className="px-4 py-2.5">DULE Policy Status</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E8ECEF]">
              {filteredProfiles.map((p) => {
                const isBlocked = p.consent.ccpaOptOut || !p.consent.gdprConsent;
                return (
                  <tr
                    key={p.id}
                    onClick={() => handleOpenModal(p)}
                    className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                  >
                    {/* Customer Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        {p.avatarUrl ? (
                          <img
                            src={resolveAvatarUrl(p.avatarUrl, p.id)}
                            alt={p.unifiedName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-[#E1E5EA] shrink-0"
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
                        <div>
                          <p className="font-semibold text-[#2C2C2C] group-hover:text-[#1473E6] transition-colors">
                            {p.unifiedName}
                          </p>
                          <p className="text-[11px] text-[#262A33] font-mono truncate max-w-[170px]">
                            {p.primaryEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Identities count - Pro Mode */}
                    {uiMode === 'pro' && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.identities.slice(0, 3).map((ident, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 bg-[#F2F4F7] text-[#1A1D23] rounded text-[9px] font-mono font-medium border border-[#E1E5EA]"
                            >
                              {ident.type}
                            </span>
                          ))}
                          {p.identities.length > 3 && (
                            <span className="px-1.5 py-0.2 bg-[#EBF3FC] text-[#0D66D0] rounded text-[9px] font-semibold">
                              +{p.identities.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Tier */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#F2F4F7] text-[#1A1D23] rounded font-medium text-[10px] border border-[#E1E5EA]">
                        {p.attributes.customerTier}
                      </span>
                    </td>

                    {/* Lifetime Spend */}
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[#2C2C2C]">
                      ${p.attributes.totalSpend.toFixed(2)}
                    </td>

                    {/* AI Churn Risk & Predicted LTV - Pro Mode */}
                    {uiMode === 'pro' && (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-1.5 bg-[#E1E5EA] rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  p.predictions.churnRisk > 70
                                    ? 'bg-[#D7373F]'
                                    : p.predictions.churnRisk > 30
                                    ? 'bg-[#B25900]'
                                    : 'bg-[#0E7A36]'
                                }`}
                                style={{ width: `${p.predictions.churnRisk}%` }}
                              />
                            </div>
                            <span className={`font-mono font-medium text-[11px] ${
                              p.predictions.churnRisk > 70 ? 'text-[#D7373F]' : 'text-[#1A1D23]'
                            }`}>
                              {p.predictions.churnRisk}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-semibold text-[#2C2C2C]">
                          ${p.predictions.predictedLtv.toLocaleString()}
                        </td>
                      </>
                    )}

                    {/* Privacy / DULE status */}
                    <td className="px-4 py-3">
                      {isBlocked ? (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-[#EFF6FF] border border-[#93C5FD] text-[#0A3D82] rounded font-medium text-[10px]">
                          <ShieldAlert className="w-3 h-3 text-[#0A3D82]" />
                          <span>Suppressed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] rounded font-medium text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-[#0284C7]" />
                          <span>Targetable</span>
                        </span>
                      )}
                    </td>

                    {/* View Button */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(p);
                        }}
                        className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F2F4F7] hover:text-[#1473E6] text-[#1A1D23] font-medium rounded border border-[#D5D5D5] transition-colors inline-flex items-center space-x-1 text-xs shadow-2xs"
                      >
                        <span>360 View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProfiles.length === 0 && (
          <div className="p-8 text-center text-[#262A33]">
            <Users className="w-7 h-7 mx-auto mb-2 opacity-40 text-[#262A33]" />
            <p className="font-semibold text-xs text-[#1A1D23]">No matching unified profiles found</p>
            <p className="text-[11px] text-[#262A33] mt-0.5">
              {profiles.length === 0 ? 'Generate sample unified customer profiles to get started.' : 'Try adjusting search criteria or clearing filters.'}
            </p>
            {profiles.length === 0 && (
              <button
                type="button"
                onClick={generateSampleProfiles}
                className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Customer Profiles</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 360 Detail Modal */}
      {modalProfile && (
        <ProfileDetailModal
          profile={modalProfile}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

