import React, { useEffect } from 'react';
import { CDPProvider, useCDP } from './context/CDPContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { SchemaRegistryView } from './components/schemas/SchemaRegistryView';
import { SchemaEditorPageView } from './components/schemas/SchemaEditorPageView';
import { DataIngestionView } from './components/ingestion/DataIngestionView';
import { IdentityGraphView } from './components/identities/IdentityGraphView';
import { ProfileExplorerView } from './components/profiles/ProfileExplorerView';
import { B2BAccountExplorerView } from './components/b2b/B2BAccountExplorerView';
import { DataDistillerView } from './components/distiller/DataDistillerView';
import { CalculatedAttributesView } from './components/attributes/CalculatedAttributesView';
import { EdgeSimulatorView } from './components/edge/EdgeSimulatorView';
import { SenseiStudioView } from './components/cleanroom/SenseiStudioView';
import { AudienceBuilderView } from './components/audiences/AudienceBuilderView';
import { AudienceOverlapExplorerView } from './components/audiences/AudienceOverlapExplorerView';
import { LiveXDMTesterView } from './components/ingestion/LiveXDMTesterView';
import { JourneyCanvasView } from './components/journeys/JourneyCanvasView';
import { DestinationsView } from './components/connectors/DestinationsView';
import { SourcesView } from './components/connectors/SourcesView';
import { PrivacyServiceView } from './components/privacy/PrivacyServiceView';
import { DataGovernanceView } from './components/governance/DataGovernanceView';
import { FederatedCompositionView } from './components/federated/FederatedCompositionView';
import { AgenticStudioView } from './components/ai/AgenticStudioView';
import { XLR8AISupportView } from './components/ai/XLR8AISupportView';
import { WhyChooseExcelR8View } from './components/comparison/WhyChooseExcelR8View';
import { DatasetsView } from './components/datasets/DatasetsView';
import { CreateDatasetPageView } from './components/datasets/CreateDatasetPageView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { HomePageView } from './components/home/HomePageView';
import { AppDrawerPageView } from './components/drawer/AppDrawerPageView';
import { GetStartedGuidedView } from './components/walkthrough/GetStartedGuidedView';
import { LiveEcommerceStorefrontView } from './components/ecommerce/LiveEcommerceStorefrontView';
import { DatabricksWarehouseView } from './components/federated/DatabricksWarehouseView';

const MainContent: React.FC = () => {
  const { activeTab, goBack, goForward, canGoBack, canGoForward, toggleSidebar } = useCDP();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        if (canGoBack) {
          e.preventDefault();
          goBack();
        }
      } else if (e.altKey && e.key === 'ArrowRight') {
        if (canGoForward) {
          e.preventDefault();
          goForward();
        }
      } else if (e.altKey && (e.key === '[' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, canGoForward, goBack, goForward, toggleSidebar]);

  return (
    <div className="flex h-screen w-screen bg-[#F2F4F7] font-sans text-[#121212] overflow-hidden">
      {/* Containerized Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Global Search & Privacy Toggle */}
        <Header />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'home' && <HomePageView />}
          {activeTab === 'get_started' && <GetStartedGuidedView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'hub_data_management' && <AppDrawerPageView category="data_management" />}
          {activeTab === 'hub_connections' && <AppDrawerPageView category="connections" />}
          {activeTab === 'hub_customers' && <AppDrawerPageView category="customers" />}
          {activeTab === 'hub_data_science' && <AppDrawerPageView category="data_science" />}
          {activeTab === 'hub_governance' && <AppDrawerPageView category="governance" />}
          {activeTab === 'hub_intelligence' && <AppDrawerPageView category="intelligence" />}
          {activeTab === 'schemas' && <SchemaRegistryView />}
          {(activeTab === 'create_schema' || activeTab === 'schema_editor') && <SchemaEditorPageView />}
          {activeTab === 'ingestion' && <DataIngestionView />}
          {activeTab === 'ecommerce_store' && <LiveEcommerceStorefrontView />}
          {activeTab === 'databricks_warehouse' && <DatabricksWarehouseView />}
          {activeTab === 'identities' && <IdentityGraphView />}
          {activeTab === 'profiles' && <ProfileExplorerView />}
          {activeTab === 'b2b_accounts' && <B2BAccountExplorerView />}
          {activeTab === 'agentic_studio' && <AgenticStudioView />}
          {activeTab === 'federated_composition' && <FederatedCompositionView />}
          {activeTab === 'data_distiller' && <DataDistillerView />}
          {activeTab === 'calc_attributes' && <CalculatedAttributesView />}
          {activeTab === 'edge_simulator' && <EdgeSimulatorView />}
          {activeTab === 'ai_models' && <SenseiStudioView />}
          {activeTab === 'audiences' && <AudienceBuilderView />}
          {activeTab === 'audience_overlap' && <AudienceOverlapExplorerView />}
          {activeTab === 'xdm_tester' && <LiveXDMTesterView />}
          {activeTab === 'journeys' && <JourneyCanvasView />}
          {activeTab === 'destinations' && <DestinationsView />}
          {activeTab === 'connectors_destinations' && <DestinationsView />}
          {activeTab === 'sources' && <SourcesView />}
          {activeTab === 'connectors_sources' && <SourcesView />}
          {activeTab === 'connectors' && <SourcesView />}
          {activeTab === 'privacy_service' && <PrivacyServiceView />}
          {activeTab === 'governance' && <DataGovernanceView />}
          {activeTab === 'datasets' && <div className="p-4 sm:p-6 h-full overflow-y-auto max-w-7xl mx-auto"><DatasetsView /></div>}
          {(activeTab === 'create_dataset' || activeTab === 'bring_in_dataset') && (
            <div className="p-4 sm:p-6 h-full overflow-y-auto max-w-7xl mx-auto">
              <CreateDatasetPageView />
            </div>
          )}
          {activeTab === 'audit_logs' && <AuditLogsView />}
          {activeTab === 'ai_support' && <XLR8AISupportView />}
          {activeTab === 'why_excelr8' && <WhyChooseExcelR8View />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CDPProvider>
      <MainContent />
    </CDPProvider>
  );
}

