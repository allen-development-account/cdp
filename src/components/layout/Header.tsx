import React, { useState, useRef, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Shield,
  ShieldAlert,
  Bell,
  Search,
  PlusCircle,
  CheckCircle2,
  Lock,
  Layers,
  Box,
  GitMerge,
  ChevronDown,
  Ghost,
  SlidersHorizontal,
  HelpCircle,
  Globe,
  Check,
  FlaskConical
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDemoMode,
    toggleDemoMode,
    isGhostUser,
    toggleGhostUser,
    globalPrivacyMode,
    setGlobalPrivacyMode,
    terminalLogs,
    systemMetrics,
    sandboxes,
    activeSandboxId,
    setActiveSandboxId,
    mergePolicies,
    activeMergePolicyId,
    setActiveMergePolicyId
  } = useCDP();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('Acme Global Enterprise (EMEA)');
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  const [showDuleDropdown, setShowDuleDropdown] = useState(false);
  const [selectedDuleMode, setSelectedDuleMode] = useState<'DULE Mode' | 'DULE Enforced' | 'DULE Bypass'>('DULE Mode');
  const [duleSearch, setDuleSearch] = useState('');
  const duleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (duleDropdownRef.current && !duleDropdownRef.current.contains(event.target as Node)) {
        setShowDuleDropdown(false);
      }
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setShowOrgDropdown(false);
      }
    };
    if (showDuleDropdown || showOrgDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDuleDropdown, showOrgDropdown]);

  const duleOptions = [
    {
      id: 'DULE Mode' as const,
      label: 'DULE Mode',
      description: 'Default automated data usage labeling and policy validation',
      badge: 'Default',
      isEnforced: true,
    },
    {
      id: 'DULE Enforced' as const,
      label: 'DULE Enforced',
      description: 'Strict real-time blocking of non-compliant data streams',
      badge: 'Enforced',
      isEnforced: true,
    },
    {
      id: 'DULE Bypass' as const,
      label: 'DULE Bypass',
      description: 'Permissive development mode with governance checks bypassed',
      badge: 'Bypass',
      isEnforced: false,
    },
  ];

  const filteredDuleOptions = duleOptions.filter(opt =>
    opt.label.toLowerCase().includes(duleSearch.toLowerCase()) ||
    opt.description.toLowerCase().includes(duleSearch.toLowerCase())
  );

  const recentAlerts = terminalLogs.filter(l => l.level === 'warn' || l.level === 'ai' || l.level === 'success').slice(0, 5);

  return (
    <header className="h-14 bg-[#1E1E1E] text-white px-4 flex items-center justify-between shrink-0 z-30 select-none border-b border-[#333333]">
      {/* Left: XLR8 Global Brand & Platform Switcher */}
      <div className="flex items-center space-x-3">
        {/* XLR8 Platform Logo Icon (Real-Time CDP Unified Customer Nexus) + Product Name */}
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-7 h-7 rounded bg-gradient-to-br from-[#1473E6] via-[#0D66D0] to-[#084A9E] border border-[#3889EB]/50 flex items-center justify-center shadow-xs"
            title="XLR8 Realtime CDP - Customer Data Platform"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 text-white" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Central Unified Customer Profile Core */}
              <circle cx="12" cy="12" r="3" fill="white" />
              {/* Converging CDP Nodes: Ingestion, Graph, Destinations */}
              <circle cx="12" cy="4" r="1.6" fill="#90CAF9" />
              <circle cx="4.8" cy="16.5" r="1.6" fill="#90CAF9" />
              <circle cx="19.2" cy="16.5" r="1.6" fill="#90CAF9" />
              {/* Interconnection links */}
              <path d="M12 7V9M6.8 15L9.6 13.4M17.2 15L14.4 13.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              {/* Continuous Realtime CDP Orbital Cycle */}
              <circle cx="12" cy="12" r="7.8" stroke="white" strokeWidth="1.2" strokeDasharray="2.5 2.5" strokeOpacity="0.75" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight text-white">XLR8</span>
            <span className="text-[#666666] font-light">|</span>
            <span className="text-xs text-[#D5D5D5] font-normal hidden sm:inline">Realtime CDP</span>
          </div>
        </div>
      </div>

      {/* Center: Center-aligned controls */}
      <div className="flex-1 min-w-0 flex items-center justify-center gap-2 px-2">
        {/* Org Switcher Dropdown */}
        <div className="relative hidden md:block shrink-0" ref={orgDropdownRef}>
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            id="org-switcher-button"
            className="flex items-center space-x-2 px-3 py-1.5 text-xs text-[#E5E5E5] bg-[#262626] hover:bg-[#2F2F2F] rounded-md transition-all font-medium border border-[#525B6A] hover:border-[#8590A2] shadow-xs cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6]"
            aria-label="Select organization"
            aria-expanded={showOrgDropdown}
          >
            <Globe className="w-3.5 h-3.5 text-[#1473E6] shrink-0" />
            <span className="truncate max-w-[130px] xl:max-w-[190px] text-white font-medium">{selectedOrg}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#A0A0A0] shrink-0 transition-transform duration-150 ${showOrgDropdown ? 'rotate-180 text-white' : ''}`} />
          </button>

          {showOrgDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-64 bg-[#262626] border border-[#3E3E3E] rounded shadow-2xl py-1 z-50 text-xs text-[#E0E0E0]">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#8E8E8E] border-b border-[#3A3A3A]">
                Organizations
              </div>
              {['Acme Global Enterprise (EMEA)', 'Acme Retail Americas (US-East)', 'Acme APAC Cloud (Singapore)'].map((org) => (
                <button
                  key={org}
                  onClick={() => {
                    setSelectedOrg(org);
                    setShowOrgDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#383838] flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{org}</span>
                  {selectedOrg === org && <Check className="w-3.5 h-3.5 text-[#1473E6]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-[#3A3A3A] hidden md:block shrink-0" />

        {/* Sandbox Switcher (XLR8 Spectrum standard) */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#262626] border border-[#525B6A] hover:border-[#8590A2] px-2.5 py-1.5 rounded-md text-[11px] shadow-xs transition-colors shrink-0">
          <Box className="w-3.5 h-3.5 text-[#1473E6] shrink-0" />
          <span className="text-[#999999] font-medium text-[10px] whitespace-nowrap shrink-0">Sandbox:</span>
          <select
            value={activeSandboxId}
            onChange={(e) => setActiveSandboxId(e.target.value)}
            className="bg-transparent font-medium text-white text-xs focus:outline-none cursor-pointer pr-1 max-w-[165px] xl:max-w-[230px] truncate"
          >
            {sandboxes.map(sb => (
              <option key={sb.id} value={sb.id} className="bg-[#262626] text-white">
                {sb.name} ({sb.type})
              </option>
            ))}
          </select>
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-[#3A3A3A] hidden lg:block shrink-0" />

        {/* Global DULE Governance Dropdown */}
        <div className="relative shrink-0" ref={duleDropdownRef}>
          <button
            onClick={() => setShowDuleDropdown(!showDuleDropdown)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              selectedDuleMode === 'DULE Bypass'
                ? 'bg-[#0284C7]/20 border-[#38BDF8]/40 text-[#BAE6FD] hover:bg-[#0284C7]/30'
                : 'bg-[#1473E6]/25 border-[#60A5FA]/45 text-[#DBEAFE] hover:bg-[#1473E6]/35'
            }`}
            title="Select DULE Governance Mode"
            aria-label="Select DULE Governance Mode"
            id="dule-mode-dropdown-btn"
          >
            {selectedDuleMode === 'DULE Bypass' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" />
            )}
            <span className="font-mono text-[11px] font-bold tracking-tight whitespace-nowrap">
              {selectedDuleMode}
            </span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-150 ${showDuleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDuleDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-72 bg-[#262626] border border-[#3E3E3E] rounded-lg shadow-2xl py-1.5 z-50 text-xs text-[#E0E0E0] animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 border-b border-[#3A3A3A] flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#8E8E8E]">
                  DULE Governance Mode
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#333333] text-[#B0B0B0] font-mono">
                  Policies
                </span>
              </div>

              {/* Search / Filter Input */}
              <div className="p-2 border-b border-[#3A3A3A]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search DULE mode..."
                    value={duleSearch}
                    onChange={(e) => setDuleSearch(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#3E3E3E] rounded text-xs text-[#E0E0E0] placeholder-[#777777] pl-8 pr-2 py-1 focus:outline-none focus:border-[#1473E6]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="py-1">
                {filteredDuleOptions.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-[#777777]">
                    No matching DULE mode
                  </div>
                ) : (
                  filteredDuleOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedDuleMode(opt.id);
                        setGlobalPrivacyMode(opt.isEnforced);
                        setShowDuleDropdown(false);
                        setDuleSearch('');
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-[#333333] flex items-start justify-between transition-colors cursor-pointer ${
                        selectedDuleMode === opt.id ? 'bg-[#1E1E1E]' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-0.5">
                          {opt.isEnforced ? (
                            <Shield className="w-3.5 h-3.5 text-[#60A5FA]" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-[#7DD3FC]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold text-xs ${
                              selectedDuleMode === opt.id ? 'text-white' : 'text-[#CCCCCC]'
                            }`}>
                              {opt.label}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              opt.badge === 'Default'
                                ? 'bg-[#1473E6]/20 text-[#93C5FD] border border-[#1473E6]/35'
                                : opt.badge === 'Enforced'
                                ? 'bg-[#2563EB]/25 text-[#BFDBFE] border border-[#60A5FA]/35'
                                : 'bg-[#0284C7]/25 text-[#BAE6FD] border border-[#38BDF8]/35'
                            }`}>
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#9E9E9E] mt-0.5 leading-snug">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                      {selectedDuleMode === opt.id && (
                        <Check className="w-3.5 h-3.5 text-[#1473E6] shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Ingest Event */}
        <button
          onClick={() => setActiveTab('ingestion')}
          className="hidden sm:flex items-center space-x-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Quick Ingest Data Stream"
        >
          <PlusCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Ingest</span>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Ghost User Mode Toggle (Clean Private Session - Never shows demo content) */}
        <button
          id="header-btn-ghost-user"
          onClick={toggleGhostUser}
          className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md transition-all cursor-pointer relative shrink-0 ${
            isGhostUser
              ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 shadow-xs'
              : 'bg-white/5 hover:bg-white/12 text-[#A0A0A0] hover:text-white border border-white/10 hover:border-white/20'
          }`}
          title={isGhostUser ? 'Ghost User Session Active (Clean slate, zero demo data)' : 'Enable Ghost User Clean Session (Zero demo data)'}
          aria-label="Toggle Ghost User Session"
        >
          <Ghost className={`w-4 h-4 transition-transform duration-200 ${isGhostUser ? 'text-sky-200 scale-105' : 'text-[#8C9BAE]'}`} />
          {isGhostUser && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 absolute top-1.5 right-1.5 ring-2 ring-[#1E1E1E]" />
          )}
        </button>

        {/* Dedicated Demo Mode Toggle Icon Button (Disabled by default; click to load sample data) */}
        <button
          id="header-btn-demo-mode"
          onClick={toggleDemoMode}
          className={`h-8 px-2.5 rounded-lg flex items-center space-x-1.5 backdrop-blur-md transition-all cursor-pointer relative text-[11px] font-semibold whitespace-nowrap shrink-0 ${
            isDemoMode
              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/40 shadow-xs ring-1 ring-blue-400/20'
              : 'bg-white/5 hover:bg-white/12 text-[#A0A0A0] hover:text-white border border-white/10 hover:border-white/20'
          }`}
          title={isDemoMode ? 'Demo Mode Enabled — Showing sample CDP data (click to return to clean state)' : 'Enable Demo Mode to populate sample enterprise CDP data'}
          aria-label="Toggle Demo Mode"
        >
          <FlaskConical className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isDemoMode ? 'text-sky-300 scale-105' : 'text-[#8C9BAE]'}`} />
          <span className="hidden sm:inline">{isDemoMode ? 'Demo On' : 'Demo'}</span>
        </button>

        {/* Notifications & System Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded text-[#CCCCCC] hover:text-white hover:bg-[#2C2C2C] flex items-center justify-center transition-colors relative"
            title="XLR8 Platform System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#1473E6] absolute top-1.5 right-1.5 ring-2 ring-[#1E1E1E]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 bg-[#262626] rounded-md shadow-2xl border border-[#3E3E3E] p-3 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="flex items-center justify-between border-b border-[#383838] pb-2 mb-2">
                <span className="text-xs font-semibold text-white">System Notifications</span>
                <span className="text-[10px] bg-[#1473E6]/20 text-[#64B5F6] font-semibold px-1.5 py-0.5 rounded">
                  Platform Live
                </span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="p-2 rounded bg-[#303030] border border-[#3E3E3E] text-xs flex items-start space-x-2">
                    <div className="mt-0.5">
                      {alert.level === 'warn' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-[#93C5FD]" />
                      ) : alert.level === 'ai' ? (
                        <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-[11px] uppercase tracking-tight">{alert.tag}</span>
                        <span className="text-[10px] text-[#888888] font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-[#CCCCCC] text-[11px] leading-snug mt-0.5 truncate">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar (Spectrum circle avatar) */}
        <div className="w-7 h-7 rounded-full bg-[#383838] border border-[#505050] flex items-center justify-center font-bold text-xs text-white" title="XLR8 Platform Admin">
          XL
        </div>
      </div>
    </header>
  );
};

