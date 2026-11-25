import React, { useState } from 'react';
import { SourcesView } from './SourcesView';
import { DestinationsView } from './DestinationsView';
import { Radio, Send, Plug } from 'lucide-react';
import { useCDP } from '../../context/CDPContext';

interface ConnectorsViewProps {
  initialSubTab?: 'sources' | 'destinations';
}

export const ConnectorsView: React.FC<ConnectorsViewProps> = ({ initialSubTab = 'sources' }) => {
  const { ingestionSources, destinations, activeTab, setActiveTab } = useCDP();
  const [activeSubTab, setActiveSubTab] = useState<'sources' | 'destinations'>(
    activeTab === 'connectors_destinations' || activeTab === 'destinations' ? 'destinations' : initialSubTab
  );

  const handleSubTabChange = (tab: 'sources' | 'destinations') => {
    setActiveSubTab(tab);
    if (tab === 'sources') {
      setActiveTab('connectors_sources');
    } else {
      setActiveTab('connectors_destinations');
    }
  };

  const isSources = activeSubTab === 'sources' || activeTab === 'connectors_sources';
  const isDestinations = activeSubTab === 'destinations' || activeTab === 'connectors_destinations' || activeTab === 'destinations';

  return (
    <div className="flex flex-col h-full overflow-hidden text-[#2C2C2C]">
      {/* Sub-Header Tab Switcher */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Plug className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Connectors & Integrations Catalog</span>
            <span className="text-[11px] text-blue-100">Inbound Streaming Sources & Outbound Privacy-Compliant Destinations</span>
          </div>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex items-center bg-white/15 p-1 rounded-lg border border-white/25 self-start sm:self-center">
          <button
            onClick={() => handleSubTabChange('sources')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              isSources
                ? 'bg-white text-[#0D66D0] shadow-2xs'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSources ? 'text-[#0D66D0]' : 'text-white'}`} />
            <span>Sources</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSources ? 'bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]' : 'bg-white/20 text-white'}`}>
              {ingestionSources?.length || 0}
            </span>
          </button>

          <button
            onClick={() => handleSubTabChange('destinations')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              isDestinations && !isSources
                ? 'bg-white text-[#0D66D0] shadow-2xs'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Send className={`w-3.5 h-3.5 ${isDestinations && !isSources ? 'text-[#0284C7]' : 'text-white'}`} />
            <span>Destinations</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isDestinations && !isSources ? 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]' : 'bg-white/20 text-white'}`}>
              {destinations?.length || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      <div className="flex-1 overflow-hidden">
        {isSources ? <SourcesView /> : <DestinationsView />}
      </div>
    </div>
  );
};
