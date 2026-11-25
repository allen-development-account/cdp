import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { CalculatedAttributeDefinition } from '../../types/cdp';
import {
  Calculator,
  Plus,
  Play,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Database,
  Calendar,
  Layers,
  Search,
  Filter,
  ArrowRight,
  X
} from 'lucide-react';

export const CalculatedAttributesView: React.FC = () => {
  const {
    calculatedAttributes,
    createCalculatedAttribute,
    toggleCalculatedAttributeStatus,
    profiles,
    b2bAccounts,
    addTerminalLog,
    recalculateCalculatedAttributes
  } = useCDP();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcResultMsg, setRecalcResultMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CalculatedAttributeDefinition['category']>('Spend');
  const [targetSchema, setTargetSchema] = useState<CalculatedAttributeDefinition['targetSchema']>('IndividualProfile');
  const [aggregationType, setAggregationType] = useState<CalculatedAttributeDefinition['aggregationType']>('SUM');
  const [sourceEvent, setSourceEvent] = useState('Purchase');
  const [sourceField, setSourceField] = useState('payload.total_amount');
  const [lookbackDays, setLookbackDays] = useState(30);

  const filteredAttributes = calculatedAttributes.filter(a => {
    const matchesSearch = a.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !displayName) return;

    createCalculatedAttribute({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      description,
      dataType: aggregationType === 'MOST_FREQUENT' ? 'string' : 'number',
      category,
      targetSchema,
      aggregationType,
      sourceEvent,
      sourceField,
      lookbackDays: Number(lookbackDays),
      status: 'Active',
      sampleValueFormula: `${aggregationType}(e.${sourceField} WHERE e.eventType == '${sourceEvent}' AND lookback <= ${lookbackDays}d)`
    });

    setIsModalOpen(false);
    setName('');
    setDisplayName('');
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_data_science" fallbackLabel="Data Science & Query" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Calculated Attributes Studio</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded uppercase">
                XLR8 RT-CDP Calculated Attributes
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Define continuous, event-driven calculated traits (aggregations, statistical mode, recency days) that automatically enrich unified customer and account profiles.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              setIsRecalculating(true);
              setTimeout(() => {
                recalculateCalculatedAttributes();
                setIsRecalculating(false);
                setRecalcResultMsg(`Continuous aggregation engine successfully refreshed calculated traits across ${profiles.length} profiles.`);
                setTimeout(() => setRecalcResultMsg(null), 5000);
              }, 400);
            }}
            disabled={isRecalculating}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded border border-white/25 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Trigger continuous aggregation engine"
          >
            <Play className={`w-3.5 h-3.5 text-sky-200 ${isRecalculating ? 'animate-spin' : 'fill-sky-200'}`} />
            <span>{isRecalculating ? 'Computing...' : 'Recalculate All'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-3.5 py-1.5 rounded shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Calculated Attribute</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#1E2229] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search calculated attributes by name or formula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs rounded border border-[#D5D5D5] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Spend', 'Engagement', 'Recency', 'B2B Surge'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#1473E6] text-white shadow-2xs'
                  : 'bg-[#FFFFFF] text-[#1A1D23] hover:bg-[#F2F4F7] border border-[#D5D5D5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Calculated Attribute Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAttributes.map((attr) => {
          const isActive = attr.status === 'Active';
          return (
            <div
              key={attr.id}
              className="bg-[#FFFFFF] rounded border border-[#E1E5EA] p-5 flex flex-col justify-between hover:border-[#B0B0B0] shadow-2xs transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-[#2C2C2C]">{attr.displayName}</h3>
                      <span className="text-[10px] bg-[#F2F4F7] text-[#1A1D23] font-mono font-semibold px-2 py-0.5 rounded border border-[#E1E5EA]">
                        {attr.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#1E2229] mt-1">{attr.description}</p>
                  </div>

                  <button
                    onClick={() => toggleCalculatedAttributeStatus(attr.id)}
                    className={`p-1.5 rounded border transition-all ${
                      isActive
                        ? 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                    }`}
                    title={isActive ? 'Pause calculation' : 'Activate calculation'}
                  >
                    {isActive ? <CheckCircle2 className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                  </button>
                </div>

                {/* Formula and Specs */}
                <div className="mt-4 p-3 bg-[#F2F4F7] rounded border border-[#E1E5EA] font-mono text-[11px] text-[#1473E6] leading-relaxed">
                  <div className="text-[9px] uppercase font-bold text-[#1E2229] tracking-wider mb-1">
                    Continuous Aggregation Formula
                  </div>
                  {attr.sampleValueFormula}
                </div>

                {/* Attribute Metadata Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#1E2229] font-medium">Target XDM Schema</span>
                    <p className="font-semibold text-[#2C2C2C] mt-0.5">{attr.targetSchema}</p>
                  </div>
                  <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#1E2229] font-medium">Function</span>
                    <p className="font-semibold text-[#1473E6] mt-0.5">{attr.aggregationType} ({attr.lookbackDays}d)</p>
                  </div>
                  <div className="bg-[#F2F4F7] p-2.5 rounded border border-[#E1E5EA]">
                    <span className="text-[10px] text-[#1E2229] font-medium">Category</span>
                    <p className="font-semibold text-[#2C2C2C] mt-0.5">{attr.category}</p>
                  </div>
                </div>
              </div>

              {/* Footer Evaluation Live Status */}
              <div className="mt-4 pt-3 border-t border-[#E1E5EA] flex items-center justify-between text-xs text-[#1E2229]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse" />
                  <span>Real-Time Stream Active</span>
                </span>
                <span>Evaluated: Today 13:50 UTC</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Aggregation Feedback */}
      {recalcResultMsg && (
        <div className="p-3.5 bg-[#E0F2FE] border border-[#BAE6FD] rounded text-xs text-[#0369A1] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
            <span>{recalcResultMsg}</span>
          </div>
          <button
            onClick={() => setRecalcResultMsg(null)}
            className="text-[#0369A1] font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Profile Calculated Trait Values Preview Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-white shrink-0" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Enriched Customer Profiles (Real-Time Calculated Trait State)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-white bg-white/15 border border-white/25 px-2 py-0.5 rounded shrink-0 tabular-nums">
            {profiles.length} Profiles Dynamically Enriched
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2F4F7] border-b border-[#E1E5EA] text-[#1E2229] font-semibold">
                <th className="py-2.5 px-4">Profile & Identity</th>
                <th className="py-2.5 px-4 font-mono text-[11px]">rolling_total_spend</th>
                <th className="py-2.5 px-4 font-mono text-[11px]">purchase_frequency</th>
                <th className="py-2.5 px-4 font-mono text-[11px]">predicted_ltv</th>
                <th className="py-2.5 px-4 font-mono text-[11px]">churn_risk_score</th>
                <th className="py-2.5 px-4">Stream Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E5EA]">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-[#1E2229]">{p.unifiedName}</div>
                    <div className="text-[11px] text-[#596780] font-mono">{p.primaryEmail}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-[#0369A1]">
                    ${p.attributes.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#1E2229]">
                    {p.attributes.purchaseCount} orders
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-[#1473E6]">
                    ${p.predictions.predictedLtv.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.predictions.churnRisk > 50 
                        ? 'bg-[#DBEAFE] text-[#0A3D82] border border-[#93C5FD]' 
                        : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                    }`}>
                      {p.predictions.churnRisk}% risk
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="flex items-center space-x-1.5 text-[11px] text-[#0284C7] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
                      <span>Streaming (0ms Lag)</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C2C2C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">Create Calculated Attribute</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#1E2229] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60-Day High Value Category Spend"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (!name) setName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                  }}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">System Technical Name (Field Key)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rolling_60d_high_value_spend"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs font-mono text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Target XDM Entity</label>
                  <select
                    value={targetSchema}
                    onChange={(e) => setTargetSchema(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  >
                    <option value="IndividualProfile">Individual Customer Profile</option>
                    <option value="B2BAccountProfile">B2B Account Profile</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  >
                    <option value="Spend">Spend</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Recency">Recency</option>
                    <option value="B2B Surge">B2B Surge</option>
                    <option value="Loyalty">Loyalty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Aggregation Operator</label>
                  <select
                    value={aggregationType}
                    onChange={(e) => setAggregationType(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  >
                    <option value="SUM">SUM (Total Aggregate)</option>
                    <option value="COUNT">COUNT (Frequency)</option>
                    <option value="AVG">AVG (Average Mean)</option>
                    <option value="MAX">MAX (Peak Value)</option>
                    <option value="DAYS_SINCE">DAYS_SINCE (Recency)</option>
                    <option value="MOST_FREQUENT">MOST_FREQUENT (Statistical Mode)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Lookback Window (Days)</label>
                  <input
                    type="number"
                    value={lookbackDays}
                    onChange={(e) => setLookbackDays(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E1E5EA] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#2C2C2C] border border-[#D5D5D5] font-semibold rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded text-xs shadow-2xs"
                >
                  Register Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
