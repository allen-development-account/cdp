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
      <div className="bg-[#FFFFFF] border-b border-[#E1E5EA] px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#1473E6] flex items-center justify-center text-white shadow-2xs">
            <Plug className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#2C2C2C] block">Connectors & Integrations Catalog</span>
            <span className="text-[11px] text-[#1E2229]">Inbound Streaming Sources & Outbound Privacy-Compliant Destinations</span>
          </div>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex items-center bg-[#F2F4F7] p-0.5 rounded border border-[#E1E5EA]">
          <button
            onClick={() => handleSubTabChange('sources')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
              isSources
                ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs font-semibold'
                : 'text-[#1E2229] hover:text-[#2C2C2C]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSources ? 'text-[#1473E6]' : 'text-[#262A33]'}`} />
            <span>Sources</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSources ? 'bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]' : 'bg-[#E1E5EA] text-[#1A1D23]'}`}>
              {ingestionSources?.length || 0}
            </span>
          </button>

          <button
            onClick={() => handleSubTabChange('destinations')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
              isDestinations && !isSources
                ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs font-semibold'
                : 'text-[#1E2229] hover:text-[#2C2C2C]'
            }`}
          >
            <Send className={`w-3.5 h-3.5 ${isDestinations && !isSources ? 'text-[#0E7A36]' : 'text-[#262A33]'}`} />
            <span>Destinations</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isDestinations && !isSources ? 'bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]' : 'bg-[#E1E5EA] text-[#1A1D23]'}`}>
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
