import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { CustomerProfile } from '../../types/cdp';
import { DULEBadge } from '../common/DULEBadge';
import {
  X,
  Shield,
  ShieldAlert,
  GitMerge,
  Clock,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  Database,
  Smartphone,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface ProfileDetailModalProps {
  profile: CustomerProfile;
  onClose: () => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ profile, onClose }) => {
  const { updateProfileConsent, audiences } = useCDP();
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'timeline' | 'consent'>('overview');

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-3.5 h-3.5 text-[#1473E6]" />;
      case 'cookie': return <Globe className="w-3.5 h-3.5 text-[#0EA5E9]" />;
      case 'phone': return <Phone className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'crmId': return <Database className="w-3.5 h-3.5 text-[#1D4ED8]" />;
      case 'device': return <Smartphone className="w-3.5 h-3.5 text-[#0A3D82]" />;
      default: return <GitMerge className="w-3.5 h-3.5 text-[#0F58B8]" />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'VIP': return 'bg-[#F2EDFD] text-[#7024C4] border-[#D3BCF6]';
      case 'Platinum': return 'bg-[#2C2C2C] text-white border-[#2C2C2C]';
      case 'Gold': return 'bg-[#FFF8E1] text-[#B25900] border-[#FFE082]';
      case 'Silver': return 'bg-[#F2F4F7] text-[#1A1D23] border-[#D5D5D5]';
      default: return 'bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]';
    }
  };

  const qualifyingAudienceObjs = audiences.filter(a => profile.qualifyingAudienceIds?.includes(a.id));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#FFFFFF] rounded-md shadow-xl border border-[#E1E5EA] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#2C2C2C]">
        {/* Modal Top Header */}
        <div className="p-5 bg-[#2C2C2C] text-white flex items-start justify-between border-b border-[#3E3E3E]">
          <div className="flex items-center space-x-3.5">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={profile.unifiedName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded object-cover border border-[#4B4B4B]"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">{profile.unifiedName}</h2>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTierBadge(profile.attributes.customerTier)}`}>
                  {profile.attributes.customerTier} TIER
                </span>
                {profile.consent.ccpaOptOut && (
                  <span className="text-[10px] bg-[#D7373F] text-white font-semibold px-2 py-0.5 rounded">
                    CCPA OPT-OUT
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#B5B5B5] mt-1 font-mono">
                <span>{profile.id}</span>
                <span>•</span>
                <span>{profile.primaryEmail}</span>
                {profile.attributes.city && (
                  <>
                    <span>•</span>
                    <span>{profile.attributes.city}, {profile.attributes.country}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#B5B5B5] hover:text-white p-1 rounded hover:bg-[#3E3E3E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="px-5 border-b border-[#E1E5EA] bg-[#F8F9FA] flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#1473E6] text-[#1473E6]'
                : 'border-transparent text-[#1E2229] hover:text-[#2C2C2C]'
            }`}
          >
            Profile Overview & AI Predictions
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'graph'
                ? 'border-[#1473E6] text-[#1473E6]'
                : 'border-transparent text-[#1E2229] hover:text-[#2C2C2C]'
            }`}
          >
            Identity Graph ({profile.identities.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-[#1473E6] text-[#1473E6]'
                : 'border-transparent text-[#1E2229] hover:text-[#2C2C2C]'
            }`}
          >
            Experience Events ({profile.events.length})
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'consent'
                ? 'border-[#1473E6] text-[#1473E6]'
                : 'border-transparent text-[#1E2229] hover:text-[#2C2C2C]'
            }`}
          >
            DULE Privacy & Consent
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* TAB 1: OVERVIEW & AI */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 3 AI Predictive Score Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Churn Risk */}
                <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#E1E5EA]">
                  <div className="flex items-center justify-between text-[#1E2229] font-semibold mb-1.5">
                    <span className="uppercase text-[10px]">Likelihood to Churn</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      profile.predictions.churnRisk > 70 ? 'bg-[#FFEBEB] text-[#D7373F]' : 'bg-[#DEFBE6] text-[#0E7A36]'
                    }`}>
                      {profile.predictions.churnRiskBand}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-[#2C2C2C] font-mono">
                      {profile.predictions.churnRisk}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E1E5EA] rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${profile.predictions.churnRisk > 70 ? 'bg-[#D7373F]' : 'bg-[#0E7A36]'}`}
                      style={{ width: `${profile.predictions.churnRisk}%` }}
                    />
                  </div>
                </div>

                {/* Predicted LTV */}
                <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#E1E5EA]">
                  <div className="flex items-center justify-between text-[#1E2229] font-semibold mb-1.5">
                    <span className="uppercase text-[10px]">Predicted LTV</span>
                    <DollarSign className="w-3.5 h-3.5 text-[#0284C7]" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-[#2C2C2C] font-mono">
                      ${profile.predictions.predictedLtv.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#262A33]">USD</span>
                  </div>
                  <p className="text-[10px] text-[#1E2229] mt-1">
                    Historical Spend: ${profile.attributes.totalSpend.toFixed(2)} ({profile.attributes.purchaseCount} orders)
                  </p>
                </div>

                {/* Loyalty Score */}
                <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#E1E5EA]">
                  <div className="flex items-center justify-between text-[#1E2229] font-semibold mb-1.5">
                    <span className="uppercase text-[10px]">Brand Loyalty Score</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#1473E6]" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-[#1473E6] font-mono">
                      {profile.predictions.brandLoyaltyScore} / 100
                    </span>
                  </div>
                  <p className="text-[10px] text-[#1E2229] mt-1">
                    Loyalty Points: {profile.attributes.loyaltyPoints.toLocaleString()} pts
                  </p>
                </div>
              </div>

              {/* AI Next Best Action Recommendation Banner */}
              <div className="p-3.5 bg-[#EBF3FC] rounded border border-[#C5DCFA] flex items-start space-x-3">
                <div className="p-1.5 bg-[#1473E6] rounded text-white shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#0D66D0] text-xs">AI Next Best Action & Offer Engine</h4>
                    <span className="text-[10px] font-mono text-[#0D66D0] font-semibold">Confidence: 94%</span>
                  </div>
                  <p className="text-xs text-[#2C2C2C] mt-0.5 font-medium">
                    {profile.predictions.nextBestAction}
                  </p>
                  <p className="text-[11px] text-[#1A1D23] mt-0.5">
                    Recommended Incentive: <strong className="text-[#0D66D0]">{profile.predictions.nextBestOffer}</strong>
                  </p>
                </div>
              </div>

              {/* Core Attributes & Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#E1E5EA] space-y-2">
                  <h4 className="font-semibold text-[#1E2229] text-[11px] uppercase tracking-wider">
                    Profile Demographics & B2B Context
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-[#F2F4F7]">
                      <span className="text-[#1E2229]">Full Legal Name</span>
                      <span className="font-semibold text-[#2C2C2C]">{profile.unifiedName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F2F4F7]">
                      <span className="text-[#1E2229]">Company & Title</span>
                      <span className="font-semibold text-[#2C2C2C]">{profile.attributes.company || 'Direct Consumer'} ({profile.attributes.jobTitle || 'Individual'})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F2F4F7]">
                      <span className="text-[#1E2229]">Preferred Category</span>
                      <span className="font-semibold text-[#2C2C2C]">{profile.attributes.preferredCategory || 'Enterprise Cloud'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#1E2229]">Active Subscription</span>
                      <span className="font-semibold text-[#0E7A36]">{profile.attributes.hasActiveSubscription ? 'Yes (Pro)' : 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#E1E5EA] space-y-2">
                  <h4 className="font-semibold text-[#1E2229] text-[11px] uppercase tracking-wider">
                    Qualifying Audiences ({qualifyingAudienceObjs.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {qualifyingAudienceObjs.map(aud => (
                      <span
                        key={aud.id}
                        className="px-2 py-0.5 bg-[#EBF3FC] border border-[#C5DCFA] text-[#0D66D0] rounded font-medium text-[11px]"
                      >
                        {aud.name}
                      </span>
                    ))}
                    {qualifyingAudienceObjs.length === 0 && (
                      <span className="text-[#262A33] text-xs">No active audience qualifications</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY GRAPH */}
          {activeTab === 'graph' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E1E5EA]">
                <h4 className="font-semibold text-[#2C2C2C] text-xs mb-0.5">
                  Stitched Cross-Channel Identifiers ({profile.identities.length})
                </h4>
                <p className="text-[11px] text-[#1E2229]">
                  Deterministic linkages established via deterministic key matching (Email, Phone, Cookies, CRMs).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {profile.identities.map(ident => (
                  <div
                    key={ident.id}
                    className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] flex items-center space-x-3 shadow-2xs"
                  >
                    <div className="p-2 bg-[#F2F4F7] rounded">
                      {getNodeIcon(ident.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase text-[#1E2229] font-mono">
                          {ident.type} {ident.isPrimary && '(Primary)'}
                        </span>
                        <span className="text-[9px] text-[#0E7A36] font-bold font-mono">1.0 CONFIDENCE</span>
                      </div>
                      <p className="font-semibold text-[#2C2C2C] font-mono text-xs truncate" title={ident.value}>
                        {ident.value}
                      </p>
                      <p className="text-[10px] text-[#262A33] mt-0.5">Source: {ident.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EVENT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#2C2C2C] text-xs">Chronological Multi-Channel Events</h4>
                <span className="text-[10px] font-mono text-[#262A33]">{profile.events.length} Events Logged</span>
              </div>

              <div className="space-y-2">
                {profile.events.map((evt, idx) => (
                  <div key={evt.id || idx} className="p-3 bg-[#F8F9FA] rounded border border-[#E1E5EA] space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-[#1473E6] text-white font-medium rounded text-[10px]">
                          {evt.eventType}
                        </span>
                        <span className="text-[#1A1D23] text-xs font-semibold">{evt.channel}</span>
                      </div>
                      <span className="text-[10px] text-[#262A33] font-mono">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 bg-[#1E1E1E] text-[#A6E22E] font-mono text-[10px] rounded max-h-24 overflow-y-auto">
                      <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & DULE CONSENT */}
          {activeTab === 'consent' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E1E5EA]">
                <div className="flex items-center space-x-2 text-[#2C2C2C] font-semibold mb-0.5">
                  <Shield className="w-4 h-4 text-[#1473E6]" />
                  <span>DULE Privacy & Consent Enforcement Center</span>
                </div>
                <p className="text-[11px] text-[#1E2229]">
                  Toggle privacy rights in real-time. Changes immediately update audience targetability and suppress exports to Meta/Google Ads.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* GDPR Consent */}
                <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-[#2C2C2C] text-xs">GDPR General Processing Consent</h5>
                    <p className="text-[10px] text-[#1E2229]">European Union General Data Protection Regulation Article 6/7</p>
                  </div>
                  <button
                    onClick={() => updateProfileConsent(profile.id, { gdprConsent: !profile.consent.gdprConsent })}
                    className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                      profile.consent.gdprConsent ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]' : 'bg-[#FFEBEB] text-[#D7373F] border border-[#FFCCD0]'
                    }`}
                  >
                    {profile.consent.gdprConsent ? 'CONSENT GRANTED' : 'OPTED-OUT'}
                  </button>
                </div>

                {/* CCPA Opt-Out */}
                <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-[#2C2C2C] text-xs">CCPA / CPRA "Do Not Sell or Share My Info"</h5>
                    <p className="text-[10px] text-[#1E2229]">California Consumer Privacy Act Right to Opt-Out</p>
                  </div>
                  <button
                    onClick={() => updateProfileConsent(profile.id, { ccpaOptOut: !profile.consent.ccpaOptOut })}
                    className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                      profile.consent.ccpaOptOut ? 'bg-[#FFEBEB] text-[#D7373F] border border-[#FFCCD0]' : 'bg-[#F2F4F7] text-[#1A1D23] border border-[#D5D5D5]'
                    }`}
                  >
                    {profile.consent.ccpaOptOut ? 'OPT-OUT ACTIVE' : 'NO OPT-OUT (ALLOWED)'}
                  </button>
                </div>

                {/* 3rd Party Sharing */}
                <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-[#2C2C2C] text-xs">Third-Party Advertising & Lookalike Syndication</h5>
                    <p className="text-[10px] text-[#1E2229]">Allows sync to Meta Custom Audiences and Google Customer Match</p>
                  </div>
                  <button
                    onClick={() => updateProfileConsent(profile.id, { thirdPartySharingConsent: !profile.consent.thirdPartySharingConsent })}
                    className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                      profile.consent.thirdPartySharingConsent ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]' : 'bg-[#FFF8E1] text-[#B25900] border border-[#FFE082]'
                    }`}
                  >
                    {profile.consent.thirdPartySharingConsent ? 'ALLOWED' : 'BLOCKED IN AD PIPES'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 bg-[#F8F9FA] border-t border-[#E1E5EA] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-[#1E2229]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D66D0]" />
            <span>Profile synchronized with real-time streaming state store</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white font-medium text-xs rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

