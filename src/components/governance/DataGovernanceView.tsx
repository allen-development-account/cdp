import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { STANDARD_PRIVACY_LABEL_CATEGORIES, ALL_PRIVACY_LABELS } from '../../data/privacyLabelsData';
import { PrivacyLabelCategoryType, PrivacyLabelDefinition } from '../../types/cdp';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  EyeOff,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  Fingerprint,
  Check,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  Sliders,
  Database,
  Send,
  Zap,
  Tag
} from 'lucide-react';

export const DataGovernanceView: React.FC = () => {
  const { schemas, profiles, destinations, datasets, setActiveTab } = useCDP();

  const [activeGovernanceTab, setActiveGovernanceTab] = useState<'label_categories' | 'policy_simulator' | 'enforced_policies' | 'dsar_audit'>('label_categories');
  const [selectedCategory, setSelectedCategory] = useState<PrivacyLabelCategoryType>('Contract');
  const [selectedLabelCode, setSelectedLabelCode] = useState<string>('C1');
  const [searchLabelQuery, setSearchLabelQuery] = useState('');

  // Policy Simulator State
  const [simField, setSimField] = useState('email');
  const [simDestination, setSimDestination] = useState('dest_meta_ads');
  const [simProfileConsentGdpr, setSimProfileConsentGdpr] = useState(true);
  const [simProfileCcpaOptOut, setSimProfileCcpaOptOut] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  const ccpaOptOutCount = profiles.filter(p => p?.consent?.ccpaOptOut).length;
  const gdprOptInCount = profiles.filter(p => p?.consent?.gdprConsent).length;

  const currentCategoryData = STANDARD_PRIVACY_LABEL_CATEGORIES.find(c => c.id === selectedCategory) || STANDARD_PRIVACY_LABEL_CATEGORIES[0];
  const currentLabelDetail = ALL_PRIVACY_LABELS.find(l => l.code === selectedLabelCode) || currentCategoryData.labels[0];

  // Simulator Evaluator
  const runSimulator = () => {
    const dest = destinations.find(d => d.id === simDestination) || destinations[0];
    let action: 'ALLOWED' | 'MASKED' | 'BLOCKED' = 'ALLOWED';
    let reasons: string[] = [];

    // Check consent opt-out
    if (simProfileCcpaOptOut) {
      action = 'BLOCKED';
      reasons.push('CCPA "Do Not Sell/Share" opt-out active: Profile excluded from all ad networks.');
    } else if (!simProfileConsentGdpr) {
      action = 'BLOCKED';
      reasons.push('GDPR Article 6 consent missing: Profiling and syndication disallowed.');
    }

    // Check field classification
    if (simField === 'ssnLast4' || simField === 'creditCardToken' || simField === 'medicalCategory') {
      action = 'BLOCKED';
      reasons.push(`Field '${simField}' carries S1/S2 Sensitive Label: Strictly blocked from export.`);
    } else if (simField === 'email' || simField === 'phone') {
      if (action !== 'BLOCKED') {
        action = 'MASKED';
        reasons.push(`Field '${simField}' is I1 Direct PII: Normalized (E.164 / lowercase) & SHA-256 hashed before payload transmission.`);
      }
    } else {
      if (action !== 'BLOCKED') {
        reasons.push(`Field '${simField}' is standard non-PII attribute: Allowed for syndication.`);
      }
    }

    setSimResult({
      status: action,
      reasons,
      timestamp: new Date().toLocaleTimeString(),
      destinationName: dest?.name || 'Meta Custom Audiences',
      fieldName: simField
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_governance" fallbackLabel="Privacy & Governance" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Data Governance & Privacy Label Categories (DULE)</h2>
              <span className="text-[10px] bg-white/15 text-[#8CE2A7] border border-[#8CE2A7]/40 font-bold px-2 py-0.5 rounded uppercase">
                XLR8 DULE & ISO 27701
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Enterprise Data Usage Labeling & Enforcement. Standardized taxonomy for Contract (C-Series), Identity (I-Series), Sensitive (S-Series), and Regulatory (R-Series) privacy governance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 bg-white/15 border border-[#8CE2A7]/40 text-[#8CE2A7] rounded text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            SOC 2 / GDPR DULE Active
          </span>
          <button
            onClick={() => setActiveTab('datasets')}
            className="px-3 py-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Labeling Studio ({datasets.length}) →</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">
            Active Privacy Labels
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-[#1473E6] font-mono">
              {ALL_PRIVACY_LABELS.length} Labels
            </span>
            <span className="text-xs text-[#1E2229] font-medium">Across 4 Series</span>
          </div>
          <p className="text-[10px] text-[#1E2229] mt-1">C, I, S, and R governance series</p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">
            GDPR Consent Cleared
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-[#0E7A36] font-mono">
              {gdprOptInCount} / {profiles.length}
            </span>
            <span className="text-xs text-[#1E2229] font-medium">
              ({profiles.length > 0 ? Math.round((gdprOptInCount / profiles.length) * 100) : 100}%)
            </span>
          </div>
          <p className="text-[10px] text-[#1E2229] mt-1">Valid processing under EU Article 6</p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">
            CCPA Opt-Out Suppressed
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-[#D7373F] font-mono">
              {ccpaOptOutCount} Profiles
            </span>
            <span className="text-xs text-[#D7373F] font-medium">Blocked from Ads</span>
          </div>
          <p className="text-[10px] text-[#1E2229] mt-1">Automatic zero-leakage suppression</p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E2229]">
            DULE Policy Compliance
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-[#1473E6] font-mono">
              100%
            </span>
            <span className="text-xs text-[#0E7A36] font-medium">0 Violations</span>
          </div>
          <p className="text-[10px] text-[#1E2229] mt-1">Real-time edge policy gatekeeper</p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center space-x-1.5 bg-[#F2F4F7] p-1 rounded border border-[#E1E5EA] w-fit">
        <button
          onClick={() => setActiveGovernanceTab('label_categories')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
            activeGovernanceTab === 'label_categories'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs border border-[#E1E5EA]'
              : 'text-[#1A1D23] hover:text-[#2C2C2C]'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-[#1473E6]" />
          <span>Privacy Label Categories Matrix</span>
        </button>

        <button
          onClick={() => setActiveGovernanceTab('policy_simulator')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
            activeGovernanceTab === 'policy_simulator'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs border border-[#E1E5EA]'
              : 'text-[#1A1D23] hover:text-[#2C2C2C]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#C76A00]" />
          <span>Live DULE Policy Simulator</span>
        </button>

        <button
          onClick={() => setActiveGovernanceTab('enforced_policies')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
            activeGovernanceTab === 'enforced_policies'
              ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs border border-[#E1E5EA]'
              : 'text-[#1A1D23] hover:text-[#2C2C2C]'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-[#D7373F]" />
          <span>Enforced DULE Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('datasets')}
          className="px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 text-[#1A1D23] hover:text-[#1473E6] hover:bg-white/60"
        >
          <Database className="w-3.5 h-3.5 text-[#1473E6]" />
          <span>Dataset Labeling Studio ({datasets.length}) ↗</span>
        </button>
      </div>

      {/* TAB 1: PRIVACY LABEL CATEGORIES MATRIX */}
      {activeGovernanceTab === 'label_categories' && (
        <div className="space-y-6">
          {/* Category Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STANDARD_PRIVACY_LABEL_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedLabelCode(cat.labels[0].code);
                  }}
                  className={`p-4 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#1473E6] shadow-2xs ring-1 ring-[#1473E6]'
                      : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#B0B0B0] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs bg-[#EBF3FC] text-[#1473E6] px-2 py-0.5 rounded border border-[#C5DCFA]">
                      {cat.codePrefix}-SERIES
                    </span>
                    <span className="text-[10px] font-bold text-[#1E2229]">
                      {cat.labels.length} Labels
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-[#2C2C2C]">{cat.name}</h3>
                  <p className="text-[11px] text-[#1E2229] mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Master-Detail View: Label Cards on Left + Full Details on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Labels in this Category */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">
                  {currentCategoryData.name} ({currentCategoryData.labels.length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {currentCategoryData.labels.map(lbl => {
                  const isSelected = selectedLabelCode === lbl.code;
                  return (
                    <div
                      key={lbl.code}
                      onClick={() => setSelectedLabelCode(lbl.code)}
                      className={`p-4 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#1473E6] shadow-2xs ring-1 ring-[#1473E6]'
                          : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#B0B0B0] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded bg-[#EBF3FC] text-[#1473E6] font-mono font-bold text-xs flex items-center justify-center border border-[#C5DCFA]">
                            {lbl.code}
                          </span>
                          <span className="font-bold text-xs text-[#2C2C2C]">{lbl.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          lbl.defaultAction === 'Block' ? 'bg-[#FDE6E8] text-[#D7373F] border-[#F88B8B]' :
                          lbl.defaultAction === 'Mask_SHA256' ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]' :
                          'bg-[#DEFBE6] text-[#0E7A36] border-[#A1ECC4]'
                        }`}>
                          {lbl.defaultAction}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1E2229] line-clamp-2 leading-relaxed">
                        {lbl.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Label Deep Dive Inspector */}
            <div className="lg:col-span-7">
              <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs p-6 space-y-5">
                <div className="flex items-start justify-between border-b border-[#E1E5EA] pb-4">
                  <div className="flex items-start space-x-3">
                    <span className="w-10 h-10 rounded bg-[#EBF3FC] text-[#1473E6] font-mono font-bold text-base flex items-center justify-center border border-[#C5DCFA] shrink-0">
                      {currentLabelDetail.code}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-[#2C2C2C] text-sm">{currentLabelDetail.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2F4F7] text-[#1A1D23] border border-[#E1E5EA]">
                          {currentLabelDetail.category} Series
                        </span>
                      </div>
                      <p className="text-xs text-[#1E2229] mt-1 leading-relaxed">
                        {currentLabelDetail.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-[#F2F4F7] rounded border border-[#E1E5EA] space-y-1">
                    <span className="text-[10px] font-bold text-[#1E2229] uppercase tracking-wider block">
                      Enforced DULE Action
                    </span>
                    <span className="font-mono font-bold text-[#2C2C2C] text-xs flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#1473E6]" />
                      <span>{currentLabelDetail.defaultAction}</span>
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#F2F4F7] rounded border border-[#E1E5EA] space-y-1">
                    <span className="text-[10px] font-bold text-[#1E2229] uppercase tracking-wider block">
                      Severity Classification
                    </span>
                    <span className="font-bold text-[#D7373F] text-xs flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{currentLabelDetail.severity} Severity</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#2C2C2C]">Usage Restrictions & Constraints</h4>
                  <div className="p-3.5 bg-[#FDE6E8]/40 rounded border border-[#F88B8B] text-[#D7373F] leading-relaxed text-xs">
                    {currentLabelDetail.usageRestrictions}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#2C2C2C]">Applicable Regulations & Governance Standards</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLabelDetail.applicableRegulations.map((reg, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#F2F4F7] text-[#1A1D23] rounded font-semibold text-xs border border-[#E1E5EA]">
                        ⚖️ {reg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#2C2C2C]">Example Data Fields in XDM Schemas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLabelDetail.examples.map((ex, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#EBF3FC] text-[#1473E6] rounded font-mono font-bold text-xs border border-[#C5DCFA]">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DULE POLICY SIMULATOR */}
      {activeGovernanceTab === 'policy_simulator' && (
        <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs p-6 space-y-5">
          <div>
            <h3 className="font-bold text-sm text-[#2C2C2C] flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#C76A00]" />
              <span>Real-Time DULE Policy & Privacy Gate Simulator</span>
            </h3>
            <p className="text-xs text-[#1E2229] mt-0.5">
              Simulate edge policy evaluation before executing downstream destination syndications. Verifies if attributes are permitted, masked with SHA-256, or suppressed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Input Controls */}
            <div className="space-y-4 p-5 bg-[#F2F4F7] rounded border border-[#E1E5EA]">
              <h4 className="font-bold text-xs text-[#2C2C2C]">Simulation Parameters</h4>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D23] mb-1">Target XDM Field</label>
                <select
                  value={simField}
                  onChange={e => setSimField(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded text-xs font-mono text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                >
                  <option value="email">profile.primaryEmail (I1 Direct PII)</option>
                  <option value="phone">profile.phone (I1 Direct PII)</option>
                  <option value="totalSpend">profile.attributes.totalSpend (Standard Attribute)</option>
                  <option value="customerTier">profile.attributes.customerTier (Standard)</option>
                  <option value="ssnLast4">profile.attributes.ssnLast4 (S1 Financial Sensitive)</option>
                  <option value="medicalCategory">profile.attributes.medicalCategory (S2 HIPAA Health)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D23] mb-1">Target Destination Platform</label>
                <select
                  value={simDestination}
                  onChange={e => setSimDestination(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded text-xs font-semibold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E1E5EA]">
                <label className="block text-xs font-semibold text-[#1A1D23]">Simulated Profile Consent State</label>
                
                <label className="flex items-center space-x-2 text-xs text-[#2C2C2C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simProfileConsentGdpr}
                    onChange={e => setSimProfileConsentGdpr(e.target.checked)}
                    className="rounded text-[#1473E6] focus:ring-[#1473E6]"
                  />
                  <span>GDPR Article 6 Consent = Granted (True)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-[#2C2C2C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simProfileCcpaOptOut}
                    onChange={e => setSimProfileCcpaOptOut(e.target.checked)}
                    className="rounded text-[#D7373F] focus:ring-[#D7373F]"
                  />
                  <span className="text-[#D7373F] font-medium">CCPA "Do Not Sell / Share" = Opted-Out (True)</span>
                </label>
              </div>

              <button
                type="button"
                onClick={runSimulator}
                className="w-full py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Evaluate DULE Policy Gate</span>
              </button>
            </div>

            {/* Simulation Results Output */}
            <div className="space-y-4 p-5 bg-[#1E1E1E] rounded border border-[#3E3E3E] text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#3E3E3E] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">Simulation Audit Log</span>
                  <span className="text-[10px] font-mono text-[#76D69D]">Engine: DULE Kernel v1.4</span>
                </div>

                {simResult ? (
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#999999]">Decision Outcome:</span>
                      <span className={`px-3 py-0.5 rounded text-xs font-bold font-mono border ${
                        simResult.status === 'ALLOWED' ? 'bg-[#0E7A36]/30 text-[#DEFBE6] border-[#A1ECC4]' :
                        simResult.status === 'MASKED' ? 'bg-[#1473E6]/30 text-[#C5DCFA] border-[#74B2F7]' :
                        'bg-[#D7373F]/30 text-[#FDE6E8] border-[#F88B8B]'
                      }`}>
                        {simResult.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <span className="text-[#B0B0B0] block font-semibold">Enforcement Rationale:</span>
                      {simResult.reasons.map((r: string, i: number) => (
                        <p key={i} className="text-[#E0E0E0] bg-[#2C2C2C] p-2.5 rounded border border-[#3E3E3E] text-[11px] leading-relaxed">
                          • {r}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#8E8E8E] text-xs">
                    Click "Evaluate DULE Policy Gate" to test field syndication against active privacy rules.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#3E3E3E] text-[10px] text-[#8E8E8E] flex items-center justify-between">
                <span>Deterministic Zero-Trust Evaluation</span>
                <span>Audit Ref: dlu_{Date.now().toString(36)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENFORCED DULE POLICIES */}
      {activeGovernanceTab === 'enforced_policies' && (
        <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-sm text-[#2C2C2C]">Enforced Enterprise Privacy Policies</h3>

          <div className="space-y-3">
            <div className="p-4 bg-[#F2F4F7] rounded border border-[#E1E5EA] flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#EBF3FC] rounded text-[#1473E6] border border-[#C5DCFA]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2C2C2C]">DULE Policy 01: Ad Network PII Masking (I1 Series)</h4>
                  <p className="text-[11px] text-[#1E2229] mt-0.5">
                    All Email addresses and Phone numbers syndicated to Meta, Google, and TikTok Ads must be hashed using SHA-256 (E.164 normalized) prior to transmission.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-[#DEFBE6] text-[#0E7A36] border border-[#A1ECC4] rounded font-bold text-[10px]">
                ACTIVE & ENFORCED
              </span>
            </div>

            <div className="p-4 bg-[#F2F4F7] rounded border border-[#E1E5EA] flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#FDE6E8] rounded text-[#D7373F] border border-[#F88B8B]">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2C2C2C]">DULE Policy 02: Sensitive Health & Financial Data Strip (S1 & S2 Series)</h4>
                  <p className="text-[11px] text-[#1E2229] mt-0.5">
                    Attributes tagged with "Health" or "Financial" classifications are completely excluded from external messaging and analytics pipelines.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-[#DEFBE6] text-[#0E7A36] border border-[#A1ECC4] rounded font-bold text-[10px]">
                ACTIVE & ENFORCED
              </span>
            </div>

            <div className="p-4 bg-[#F2F4F7] rounded border border-[#E1E5EA] flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#FFF0D4] rounded text-[#C76A00] border border-[#FFD085]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2C2C2C]">DULE Policy 03: CCPA / CPRA Global Opt-Out Suppression (R2 Series)</h4>
                  <p className="text-[11px] text-[#1E2229] mt-0.5">
                    Profiles marked with CCPA Opt-Out are automatically filtered out from all third-party sync connectors.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-[#DEFBE6] text-[#0E7A36] border border-[#A1ECC4] rounded font-bold text-[10px]">
                ACTIVE & ENFORCED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
