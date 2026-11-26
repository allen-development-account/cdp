import React from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Home,
  LayoutDashboard,
  Database,
  Plug,
  Users,
  GitMerge,
  Layers,
  Cpu,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
  LifeBuoy,
  Award,
  Compass,
  ShoppingBag
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    resetToDefaults,
    schemas,
    datasets,
    destinations,
    ingestionSources,
    audiences,
    anomalies,
    isDemoMode,
    isSidebarCollapsed,
    toggleSidebar,
    openGuidedOverview,
    clearGuidedReturn
  } = useCDP();

  const navigateFromSidebar = (tab: string) => {
    clearGuidedReturn();
    setActiveTab(tab);
  };

  const isSchemasActive =
    activeTab === 'schemas' ||
    activeTab === 'create_schema' ||
    activeTab === 'schema_editor';

  const isDataManagementActive =
    activeTab === 'hub_data_management' ||
    activeTab === 'datasets' ||
    activeTab === 'create_dataset' ||
    activeTab === 'bring_in_dataset' ||
    activeTab === 'ingestion' ||
    activeTab === 'ecommerce_store' ||
    activeTab === 'databricks_warehouse' ||
    activeTab === 'xdm_tester' ||
    activeTab === 'federated_composition';

  const isConnectionsActive =
    activeTab === 'hub_connections' ||
    activeTab === 'sources' ||
    activeTab === 'destinations' ||
    activeTab === 'connectors_sources' ||
    activeTab === 'connectors_destinations' ||
    activeTab === 'connectors';

  const isCustomersActive =
    activeTab === 'hub_customers' ||
    activeTab === 'profiles' ||
    activeTab === 'audiences' ||
    activeTab === 'audience_overlap' ||
    activeTab === 'b2b_accounts';

  const isDataScienceActive =
    activeTab === 'hub_data_science' ||
    activeTab === 'data_distiller' ||
    activeTab === 'calc_attributes' ||
    activeTab === 'ai_models' ||
    activeTab === 'edge_simulator';

  const isGovernanceActive =
    activeTab === 'hub_governance' ||
    activeTab === 'governance' ||
    activeTab === 'privacy_service' ||
    activeTab === 'audit_logs';

  const isIntelligenceActive =
    activeTab === 'hub_intelligence' ||
    activeTab === 'agentic_studio' ||
    activeTab === 'journeys';

  const mainHeadingItems = [
    {
      id: 'schemas',
      label: 'Schemas (XDM)',
      icon: <Layers className="w-4 h-4" />,
      isActive: isSchemasActive,
      count: schemas?.length || 0,
      badge: undefined
    },
    {
      id: 'identities',
      label: 'Identity Graph',
      icon: <GitMerge className="w-4 h-4" />,
      isActive: activeTab === 'identities',
      badge: 'Graph'
    },
    {
      id: 'hub_data_management',
      label: 'Data Management',
      icon: <Database className="w-4 h-4" />,
      isActive: isDataManagementActive,
      count: datasets?.length || 0,
      badge: undefined
    },
    {
      id: 'hub_customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" />,
      isActive: isCustomersActive,
      count: audiences.length,
      badge: undefined
    },
    {
      id: 'hub_connections',
      label: 'Connections',
      icon: <Plug className="w-4 h-4" />,
      isActive: isConnectionsActive,
      count: (ingestionSources?.length || 0) + (destinations?.length || 0),
      badge: undefined
    },
    {
      id: 'hub_data_science',
      label: 'Data Science & Query',
      icon: <Cpu className="w-4 h-4" />,
      isActive: isDataScienceActive,
      badge: 'SQL & ML'
    },
    {
      id: 'hub_governance',
      label: 'Privacy & Governance',
      icon: <ShieldCheck className="w-4 h-4" />,
      isActive: isGovernanceActive,
      badge: 'DULE'
    },
    {
      id: 'hub_intelligence',
      label: 'Intelligence Services',
      icon: <Sparkles className="w-4 h-4" />,
      isActive: isIntelligenceActive,
      badge: anomalies && anomalies.filter(a => a.status === 'Active').length > 0
        ? `${anomalies.filter(a => a.status === 'Active').length} Alert`
        : 'GenAI'
    }
  ];

  return (
    <aside
      className={`${
        isSidebarCollapsed ? 'w-16' : 'w-60'
      } bg-gradient-to-b from-[#0F172A] via-[#131F35] to-[#0A1120] flex flex-col h-full border-r border-slate-800/90 shrink-0 select-none text-slate-200 transition-all duration-200 ease-in-out shadow-xl`}
      id="platform-sidebar-root"
    >
      {/* Real-Time Processing Status Header & Panel Toggle */}
      {isSidebarCollapsed ? (
        <div className="py-2.5 bg-[#0B111E]/60 border-b border-slate-800/80 flex flex-col items-center justify-center min-h-[41px] relative">
          <button
            onClick={toggleSidebar}
            title="Expand sidebar panel"
            aria-label="Expand sidebar panel"
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors flex items-center justify-center cursor-pointer"
            id="sidebar-toggle-btn"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_6px_rgba(56,189,248,0.8)] absolute top-1.5 right-2" title="Pipeline Active" />
        </div>
      ) : (
        <div className="px-3 py-2 bg-[#0B111E]/60 border-b border-slate-800/80 flex items-center justify-between text-xs min-h-[41px]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.75)]" />
            <span className="text-[11px] font-semibold text-slate-200">Pipeline Active</span>
          </div>
          <button
            onClick={toggleSidebar}
            title="Collapse sidebar panel"
            aria-label="Collapse sidebar panel"
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors flex items-center justify-center cursor-pointer"
            id="sidebar-toggle-btn"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation List */}
      <nav className={`flex-1 ${isSidebarCollapsed ? 'px-1.5' : 'px-2.5'} py-3 space-y-4 overflow-y-auto overflow-x-hidden`}>
        {/* Core Navigation: HOME above OVERVIEW */}
        <div className="space-y-1">
          {/* 1. HOME */}
          <button
            onClick={() => navigateFromSidebar('home')}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } rounded-lg transition-all text-left relative group cursor-pointer ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
            }`}
            title="Home"
          >
            {activeTab === 'home' && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
            )}
            <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
              <div className={activeTab === 'home' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}>
                <Home className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && <span className="text-xs tracking-tight">Home</span>}
            </div>
            {!isSidebarCollapsed && (
              <ChevronRight
                className={`w-3.5 h-3.5 ${
                  activeTab === 'home' ? 'text-[#38BDF8]' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'
                }`}
              />
            )}
          </button>

          {/* 1B. GET STARTED (GUIDED STEPS) above OVERVIEW */}
          <button
            id="sidebar-nav-get-started"
            onClick={openGuidedOverview}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } rounded-lg transition-all text-left relative group cursor-pointer ${
              activeTab === 'get_started'
                ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
            }`}
            title="Get Started (Guided Steps)"
          >
            {activeTab === 'get_started' && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
            )}
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
              <div className={`shrink-0 ${activeTab === 'get_started' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}`}>
                <Compass className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <span className="text-xs tracking-tight truncate">Get Started (Guided Steps)</span>
              )}
            </div>
            {!isSidebarCollapsed && activeTab === 'get_started' && (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#38BDF8]" />
            )}
          </button>

          {/* 3. XLR8 AI SUPPORT (Dedicated Troubleshooting & Guidance Agent) */}
          <button
            id="sidebar-nav-ai-support"
            onClick={() => navigateFromSidebar('ai_support')}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } rounded-lg transition-all text-left relative group cursor-pointer ${
              activeTab === 'ai_support'
                ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
            }`}
            title="XLR8 AI Support (Screenshot & Query Troubleshooting)"
          >
            {activeTab === 'ai_support' && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
            )}
            <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
              <div className={activeTab === 'ai_support' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}>
                <Bot className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && <span className="text-xs tracking-tight font-medium">XLR8 AI Support</span>}
            </div>
            {!isSidebarCollapsed && (
              <ChevronRight
                className={`w-3.5 h-3.5 ${
                  activeTab === 'ai_support' ? 'text-[#38BDF8]' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'
                }`}
              />
            )}
            {isSidebarCollapsed && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            )}
          </button>

          {/* 4. LIVE E-COMMERCE STOREFRONT */}
          <button
            id="sidebar-nav-ecommerce-store"
            onClick={() => navigateFromSidebar('ecommerce_store')}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } rounded-lg transition-all text-left relative group cursor-pointer ${
              activeTab === 'ecommerce_store'
                ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
            }`}
            title="Live E-Commerce Storefront (Real-Time Web SDK Stream)"
          >
            {activeTab === 'ecommerce_store' && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
            )}
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
              <div className={`shrink-0 ${activeTab === 'ecommerce_store' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}`}>
                <ShoppingBag className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && <span className="text-xs tracking-tight truncate font-medium">Live Storefront</span>}
            </div>
            {!isSidebarCollapsed && (
              <span className="text-[9px] font-bold bg-[#1473E6]/25 text-sky-200 px-1.5 py-0.2 rounded border border-sky-400/30 shrink-0">
                Live
              </span>
            )}
          </button>

          {/* 5. DATABRICKS LAKEHOUSE */}
          <button
            id="sidebar-nav-databricks"
            onClick={() => navigateFromSidebar('databricks_warehouse')}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } rounded-lg transition-all text-left relative group cursor-pointer ${
              activeTab === 'databricks_warehouse'
                ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
            }`}
            title="Databricks Unity Catalog & Delta Lakehouse"
          >
            {activeTab === 'databricks_warehouse' && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
            )}
            <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
              <div className={`shrink-0 ${activeTab === 'databricks_warehouse' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}`}>
                <Database className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && <span className="text-xs tracking-tight truncate font-medium">Databricks Delta</span>}
            </div>
            {!isSidebarCollapsed && (
              <span className="text-[9px] font-bold bg-[#1473E6]/25 text-sky-200 px-1.5 py-0.2 rounded border border-sky-400/30 shrink-0">
                DW
              </span>
            )}
          </button>
        </div>

        {/* SECTION DIVIDER & HEADING */}
        <div className="pt-2 border-t border-slate-800/80">
          {!isSidebarCollapsed ? (
            <div className="mb-2 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-[#1473E6] via-[#105EBF] to-[#0D4488] text-white flex items-center justify-between shadow-sm border border-sky-400/25">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                Platform Modules
              </span>
              <span className="text-[9px] font-semibold text-blue-100 bg-white/15 px-1.5 py-0.5 rounded border border-white/20">
                App Drawers
              </span>
            </div>
          ) : (
            <div className="my-2 mx-auto w-8 h-1 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#1473E6]" title="Platform Modules" />
          )}

          {/* ONLY MAIN HEADINGS */}
          <div className="space-y-1">
            {mainHeadingItems.map(item => {
              const isActive = item.isActive;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateFromSidebar(item.id)}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
                  } rounded-lg transition-all text-left relative group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                      : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
                  }`}
                  title={`${item.label}${item.badge ? ` (${item.badge})` : ''}${item.count !== undefined ? ` [${item.count}]` : ''}`}
                >
                  {/* Left Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
                  )}

                  <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-2.5'} truncate`}>
                    <div className={isActive ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}>
                      {item.icon}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="text-xs truncate tracking-tight">{item.label}</span>
                    )}
                  </div>

                  {/* Badges and Chevron when expanded */}
                  {!isSidebarCollapsed && (
                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                      {item.badge && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                          isActive
                            ? 'bg-[#1473E6]/35 text-sky-200 border-sky-400/35'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700/70'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                          isActive
                            ? 'bg-[#1473E6]/35 text-sky-200 border-sky-400/35'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700/70'
                        }`}>
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#38BDF8]' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'}`} />
                    </div>
                  )}

                  {/* Dot indicator when collapsed if alert/badge exists */}
                  {isSidebarCollapsed && (item.badge || (item.count !== undefined && item.count > 0)) && (
                    <span
                      className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                        item.id === 'hub_intelligence' && anomalies && anomalies.filter(a => a.status === 'Active').length > 0
                          ? 'bg-[#38BDF8]'
                          : isActive
                          ? 'bg-[#38BDF8]'
                          : 'bg-[#60A5FA]/70'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* BOTTOM MENU ITEMS: Why Choose XLR8? + Overview & Metrics */}
          <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1">
            <button
              id="sidebar-nav-why-xlr8"
              onClick={() => navigateFromSidebar('why_excelr8')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
              } rounded-lg transition-all text-left relative group cursor-pointer ${
                activeTab === 'why_excelr8'
                  ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold border border-[#38BDF8]/30 shadow-xs'
                  : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-normal border border-transparent'
              }`}
              title="Why Choose XLR8 Realtime CDP? (vs Adobe RT-CDP)"
            >
              {activeTab === 'why_excelr8' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
              )}
              <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
                <div className={activeTab === 'why_excelr8' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}>
                  <Award className="w-4 h-4" />
                </div>
                {!isSidebarCollapsed && <span className="text-xs tracking-tight font-medium">Why Choose XLR8?</span>}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex items-center space-x-1 shrink-0">
                  <span className="text-[9px] font-bold bg-[#1473E6]/25 text-sky-200 px-1.5 py-0.2 rounded border border-sky-400/30">
                    vs Adobe
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      activeTab === 'why_excelr8' ? 'text-[#38BDF8]' : 'text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}
                  />
                </div>
              )}
              {isSidebarCollapsed && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              )}
            </button>

            {/* VERY LAST MENU ITEM: Overview & Metrics */}
            <button
              id="sidebar-nav-overview-metrics"
              type="button"
              onClick={() => navigateFromSidebar('dashboard')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
              } rounded-lg transition-all text-left relative group cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#1473E6]/30 to-[#0D66D0]/15 text-white font-semibold shadow-xs border border-[#38BDF8]/35'
                  : 'bg-white/[0.04] text-slate-200 hover:bg-white/[0.09] hover:text-white border border-slate-700/70 font-medium'
              }`}
              title="Overview & Metrics (Live Telemetry)"
            >
              {activeTab === 'dashboard' && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#38BDF8] to-[#1473E6] rounded-r" />
              )}
              <div className={`flex items-center min-w-0 ${isSidebarCollapsed ? '' : 'space-x-2.5'}`}>
                <div className={`shrink-0 ${activeTab === 'dashboard' ? 'text-[#38BDF8]' : 'text-[#60A5FA]/80 group-hover:text-[#38BDF8]'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                {!isSidebarCollapsed && <span className="text-xs tracking-tight truncate">Overview &amp; Metrics</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[9px] font-semibold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-400/30 shrink-0">
                  Live
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Footer: Demo Reset Action & Platform Identity */}
      <div className={`border-t border-slate-800/80 bg-[#090E1A]/75 ${isSidebarCollapsed ? 'p-2 flex flex-col items-center space-y-2' : 'p-2.5 space-y-2'}`}>
        <button
          onClick={resetToDefaults}
          className={`${
            isSidebarCollapsed ? 'w-10 h-9 p-0' : 'w-full py-1.5 px-2'
          } flex items-center justify-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white text-[11px] font-medium rounded-lg border border-slate-700/80 transition-colors shadow-2xs cursor-pointer`}
          title={isDemoMode ? 'Reset demo data to initial state' : 'Reset workspace to clean fresh state'}
          aria-label={isDemoMode ? 'Reset demo engine' : 'Reset clean slate'}
        >
          <RotateCcw className="w-3 h-3 text-[#38BDF8]" />
          {!isSidebarCollapsed && <span>{isDemoMode ? 'Reset Demo Engine' : 'Reset Clean Slate'}</span>}
        </button>

        {!isSidebarCollapsed && (
          <div className="px-2 py-0.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>XLR8 Realtime CDP</span>
            <span className="font-mono text-slate-300">v4.12.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

