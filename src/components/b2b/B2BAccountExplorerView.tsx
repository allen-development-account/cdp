import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { B2BAccountProfile, BuyingGroupMember, B2BOpportunity } from '../../types/cdp';
import {
  Building2,
  Users2,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  Search,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Globe,
  ExternalLink,
  ChevronRight,
  Mail,
  UserCheck,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';

export const B2BAccountExplorerView: React.FC = () => {
  const { b2bAccounts, createB2BAccount, addTerminalLog, profiles } = useCDP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedAccount, setSelectedAccount] = useState<B2BAccountProfile | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Account Form state
  const [newAccountName, setNewAccountName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newIndustry, setNewIndustry] = useState('Enterprise Cloud Infrastructure');
  const [newRevenue, setNewRevenue] = useState(150000000);
  const [newEmployees, setNewEmployees] = useState(1200);
  const [newTier, setNewTier] = useState<B2BAccountProfile['accountTier']>('Enterprise');
  const [newRegion, setNewRegion] = useState('North America (West)');

  const filteredAccounts = b2bAccounts.filter(acc => {
    const matchesSearch = acc.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'All' || acc.accountTier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const totalPipeline = b2bAccounts.reduce((sum, a) => sum + a.totalPipelineValue, 0);
  const avgIntent = Math.round(b2bAccounts.reduce((sum, a) => sum + a.intentScore, 0) / (b2bAccounts.length || 1));
  const highIntentAccounts = b2bAccounts.filter(a => a.intentScore >= 80).length;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName || !newDomain) return;

    createB2BAccount({
      accountName: newAccountName,
      domain: newDomain.toLowerCase().trim(),
      industry: newIndustry,
      naicsCode: '541512 - Systems Engineering',
      annualRevenue: Number(newRevenue),
      employeeCount: Number(newEmployees),
      accountTier: newTier,
      region: newRegion,
      headquarters: 'Austin, TX',
      intentScore: 88,
      healthScore: 90,
      totalPipelineValue: 150000,
      matchedLeadCount: 4,
      lastEngagedAt: new Date().toISOString(),
      techStack: ['AWS', 'Salesforce CRM', 'Kubernetes', 'Datadog'],
      buyingGroup: [
        {
          personId: 'c_lead_' + Date.now(),
          fullName: 'Lead Contact',
          email: `lead@${newDomain.toLowerCase().trim()}`,
          role: 'Decision Maker',
          jobTitle: 'VP of Technology',
          engagementScore: 85,
          lastActive: new Date().toISOString(),
          leadScore: 88
        }
      ],
      opportunities: [
        {
          id: 'opp_' + Date.now(),
          name: `${newAccountName} - Cloud CDP Rollout`,
          amount: 150000,
          stage: 'Discovery',
          probability: 50,
          expectedCloseDate: '2026-11-15',
          ownerName: 'Rachel Thorne'
        }
      ]
    });

    setIsCreateModalOpen(false);
    setNewAccountName('');
    setNewDomain('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_customers" fallbackLabel="Customers" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">B2B Account 360 & Buying Groups</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded uppercase">
                XLR8 RT-CDP B2B Edition
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Unified account hierarchies, Lead-to-Account (L2A) matching, buying group committee mapping, and pipeline health scores.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-bold px-3.5 py-2 rounded shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create B2B Account</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Container */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Total Pipeline</span>
            <DollarSign className="w-3.5 h-3.5 text-[#0284C7]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">
            ${totalPipeline.toLocaleString()}
          </p>
          <span className="text-[10px] text-[#0E7A36] font-semibold mt-1 block">4 Qualified Opportunities</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Target Accounts</span>
            <Building2 className="w-3.5 h-3.5 text-[#1473E6]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">
            {b2bAccounts.length}
          </p>
          <span className="text-[10px] text-[#1E2229] font-semibold mt-1 block">100% L2A Matched</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Avg Intent Surge</span>
            <Zap className="w-3.5 h-3.5 text-[#1D4ED8]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">
            {avgIntent} / 100
          </p>
          <span className="text-[10px] text-[#E68619] font-semibold mt-1 block">High Buying Intent</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">High-Surge Accounts</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#1473E6]" />
          </div>
          <p className="text-xl font-bold text-[#1473E6] mt-1 font-mono">
            {highIntentAccounts} of {b2bAccounts.length}
          </p>
          <span className="text-[10px] text-[#1473E6] font-semibold mt-1 block">Intent &gt;= 80 Surge</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#1E2229] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search account name, domain, industry, tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] pl-9 pr-3.5 py-1.5 text-xs rounded border border-[#D5D5D5] focus:outline-none focus:ring-1 focus:ring-[#1473E6] text-[#2C2C2C]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Strategic VIP', 'Enterprise', 'Mid-Market'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                selectedTier === tier
                  ? 'bg-[#1473E6] text-white shadow-2xs'
                  : 'bg-[#FFFFFF] text-[#1A1D23] hover:bg-[#F2F4F7] border border-[#E1E5EA]'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAccounts.map((account) => {
          const isHighIntent = account.intentScore >= 80;
          const isAtRisk = account.healthScore < 50;

          return (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 hover:border-[#1473E6] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-[#0EA5E9] to-[#0A3D82] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                      {account.accountName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-[#2C2C2C]">{account.accountName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          account.accountTier === 'Strategic VIP'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                            : account.accountTier === 'Enterprise'
                            ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]'
                            : 'bg-[#F2F4F7] text-[#1A1D23] border-[#D5D5D5]'
                        }`}>
                          {account.accountTier}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-[#1E2229] mt-0.5">
                        <span className="font-mono">{account.domain}</span>
                        <span>•</span>
                        <span>{account.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Intent & Health Indicators */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 justify-end">
                        <Zap className={`w-3.5 h-3.5 ${isHighIntent ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
                        <span className="text-xs font-bold text-[#2C2C2C]">{account.intentScore}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-[#1E2229]">Surge Index</span>
                    </div>
                  </div>
                </div>

                {/* Firmographics & Pipeline Specs */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E1E5EA] text-xs">
                  <div>
                    <span className="text-[10px] text-[#1E2229] font-medium">Revenue</span>
                    <p className="font-bold text-[#2C2C2C]">${(account.annualRevenue / 1000000).toFixed(0)}M/yr</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1E2229] font-medium">Employees</span>
                    <p className="font-bold text-[#2C2C2C]">{account.employeeCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1E2229] font-medium">Pipeline Value</span>
                    <p className="font-bold text-[#0E7A36] font-mono">${account.totalPipelineValue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Buying Group Members */}
                <div className="mt-4 pt-3 border-t border-[#E1E5EA]">
                  <div className="flex items-center justify-between text-xs text-[#1E2229] mb-2">
                    <span className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                      <Users2 className="w-3.5 h-3.5 text-[#1473E6]" />
                      <span>Buying Group ({account.buyingGroup.length} Contacts)</span>
                    </span>
                    <span className="text-[10px] text-[#1E2229]">L2A Auto-Linked</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {account.buyingGroup.map((member, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F2F4F7] border border-[#E1E5EA] px-2.5 py-1 rounded flex items-center space-x-1.5 text-xs text-[#2C2C2C]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                        <span className="font-semibold">{member.fullName}</span>
                        <span className="text-[10px] text-[#1E2229]">({member.role})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {account.techStack.slice(0, 4).map((tech, i) => (
                    <span key={i} className="text-[10px] bg-[#F2F4F7] border border-[#E1E5EA] text-[#1A1D23] font-medium px-2 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                  {account.techStack.length > 4 && (
                    <span className="text-[10px] text-[#1E2229] font-medium px-1">
                      +{account.techStack.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Action */}
              <div className="mt-4 pt-3 border-t border-[#E1E5EA] flex items-center justify-between text-xs">
                <span className={`font-semibold flex items-center space-x-1 ${
                  isAtRisk ? 'text-[#0A3D82]' : 'text-[#0D66D0]'
                }`}>
                  {isAtRisk ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-[#0A3D82]" />
                      <span>Health: {account.healthScore}/100 (At-Risk)</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Health: {account.healthScore}/100 (Healthy)</span>
                    </>
                  )}
                </span>

                <span className="text-[#1473E6] font-semibold flex items-center space-x-1 hover:text-[#0D66D0]">
                  <span>View Account 360</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Detail Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#E1E5EA] shadow-xl p-6 text-[#2C2C2C]">
            <div className="flex items-start justify-between border-b border-[#E1E5EA] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded bg-[#1473E6] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
                  {selectedAccount.accountName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-[#2C2C2C]">{selectedAccount.accountName}</h2>
                    <span className="text-xs bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] font-bold px-2 py-0.5 rounded">
                      {selectedAccount.accountTier}
                    </span>
                  </div>
                  <p className="text-xs text-[#1E2229] font-mono mt-0.5">
                    {selectedAccount.domain} • NAICS {selectedAccount.naicsCode} • {selectedAccount.headquarters}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 text-[#1E2229] hover:text-[#2C2C2C] rounded hover:bg-[#F2F4F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Column 1 & 2: Buying Committee & Active Opportunities */}
              <div className="md:col-span-2 space-y-6">
                {/* Buying Committee Matrix */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#1E2229] mb-3 flex items-center space-x-2">
                    <Users2 className="w-4 h-4 text-[#1473E6]" />
                    <span>Buying Group Committee ({selectedAccount.buyingGroup.length})</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedAccount.buyingGroup.map((member, i) => (
                      <div key={i} className="bg-[#F2F4F7] border border-[#E1E5EA] p-3.5 rounded flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#2C2C2C]">{member.fullName}</span>
                            <span className="text-[10px] bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] font-bold px-2 py-0.5 rounded">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-[#1E2229] mt-0.5">{member.jobTitle} • {member.email}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#2C2C2C] font-mono">{member.engagementScore}%</span>
                          <p className="text-[10px] text-[#1E2229]">Engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Opportunities */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#1E2229] mb-3 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-[#0284C7]" />
                    <span>Active Opportunities ({selectedAccount.opportunities.length})</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedAccount.opportunities.map((opp) => (
                      <div key={opp.id} className="bg-[#F2F4F7] border border-[#E1E5EA] p-3.5 rounded flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#2C2C2C]">{opp.name}</p>
                          <p className="text-[11px] text-[#1E2229] mt-0.5">
                            Stage: <span className="font-bold text-[#2C2C2C]">{opp.stage}</span> • Close: {opp.expectedCloseDate} • Owner: {opp.ownerName}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-[#0E7A36] font-mono">${opp.amount.toLocaleString()}</p>
                          <span className="text-[10px] text-[#1E2229] font-semibold">{opp.probability}% Probability</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Account Metrics & Tech Stack */}
              <div className="space-y-5 bg-[#F2F4F7] p-4 rounded border border-[#E1E5EA]">
                <div>
                  <h5 className="text-xs font-bold text-[#2C2C2C] mb-2">Intent & Health Indicators</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#1E2229]">Bombora / 6sense Surge:</span>
                      <span className="font-bold text-[#E68619]">{selectedAccount.intentScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#1E2229]">Account Health Index:</span>
                      <span className="font-bold text-[#0E7A36]">{selectedAccount.healthScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#1E2229]">Matched Leads Count:</span>
                      <span className="font-bold text-[#2C2C2C]">{selectedAccount.matchedLeadCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E1E5EA]">
                  <h5 className="text-xs font-bold text-[#2C2C2C] mb-2">Verified Technology Stack</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedAccount.techStack.map((tech, i) => (
                      <span key={i} className="text-[10px] bg-[#FFFFFF] border border-[#E1E5EA] text-[#1A1D23] font-medium px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E1E5EA]">
                  <button
                    onClick={() => {
                      addTerminalLog('ai', 'B2B_JOURNEY', `Enrolled Account "${selectedAccount.accountName}" into B2B Strategic VIP Nurture Journey`);
                      setSelectedAccount(null);
                    }}
                    className="w-full bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs py-2.5 rounded shadow-2xs transition-all"
                  >
                    Trigger B2B ABM Activation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6 text-[#2C2C2C]">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">Provision B2B Account Profile</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#1E2229] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Systems"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Primary Domain (for L2A auto-stitching)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. apexsystems.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Industry</label>
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Account Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  >
                    <option value="Strategic VIP">Strategic VIP</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Annual Revenue ($)</label>
                  <input
                    type="number"
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(Number(e.target.value))}
                    className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Employee Count</label>
                  <input
                    type="number"
                    value={newEmployees}
                    onChange={(e) => setNewEmployees(Number(e.target.value))}
                    className="w-full bg-[#F2F4F7] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:bg-white focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E5EA] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#F2F4F7] hover:bg-[#E1E5EA] text-[#2C2C2C] font-semibold rounded text-xs border border-[#D5D5D5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded text-xs shadow-2xs"
                >
                  Save B2B Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
