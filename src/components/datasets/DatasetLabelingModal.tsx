import React, { useState, useMemo } from 'react';
import {
  Dataset,
  PrivacyLabelDefinition,
  PrivacyLabelCategoryType
} from '../../types/cdp';
import { STANDARD_PRIVACY_LABEL_CATEGORIES, ALL_PRIVACY_LABELS, getCrispPurpose } from '../../data/privacyLabelsData';
import { useCDP } from '../../context/CDPContext';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Search,
  Check,
  AlertTriangle,
  X,
  FileText,
  Fingerprint,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Filter,
  Eye,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown
} from 'lucide-react';

interface DatasetLabelingModalProps {
  dataset: Dataset;
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetLabelingModal: React.FC<DatasetLabelingModalProps> = ({
  dataset,
  isOpen,
  onClose
}) => {
  const { updateDatasetLabels } = useCDP();

  // Local state for selected label codes on this dataset
  const [selectedLabels, setSelectedLabels] = useState<string[]>(() => dataset.labels || []);
  const [activeCategory, setActiveCategory] = useState<'All' | PrivacyLabelCategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'selection' | 'guide'>('selection');
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory'])
  );

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const expandAllCategories = () => {
    setExpandedCategories(new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory']));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  // Sync with dataset if opened with new dataset
  React.useEffect(() => {
    setSelectedLabels(dataset.labels || []);
    setSaveSuccess(false);
  }, [dataset]);

  if (!isOpen) return null;

  const toggleLabel = (code: string) => {
    setSelectedLabels(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
    setSaveSuccess(false);
  };

  const applyPreset = (presetCodes: string[]) => {
    setSelectedLabels(presetCodes);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    updateDatasetLabels(dataset.id, selectedLabels);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Filtered labels
  const filteredLabels = ALL_PRIVACY_LABELS.filter(lbl => {
    if (activeCategory !== 'All' && lbl.category !== activeCategory) {
      return false;
    }
    if (filterSelectedOnly && !selectedLabels.includes(lbl.code)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = lbl.code.toLowerCase().includes(q);
      const matchName = lbl.name.toLowerCase().includes(q);
      const matchDesc = lbl.description.toLowerCase().includes(q);
      const matchRestr = lbl.usageRestrictions.toLowerCase().includes(q);
      const matchReg = lbl.applicableRegulations.some(r => r.toLowerCase().includes(q));
      const matchEx = lbl.examples.some(e => e.toLowerCase().includes(q));
      return matchCode || matchName || matchDesc || matchRestr || matchReg || matchEx;
    }
    return true;
  });

  // Policy impact simulation based on selectedLabels
  const policyImpact = {
    metaAds: {
      blocked: selectedLabels.some(l => ['C1', 'C4', 'S4', 'S2', 'S3', 'C12', 'R2'].includes(l)),
      reasons: selectedLabels.filter(l => ['C1', 'C4', 'S4', 'S2', 'S3', 'C12', 'R2'].includes(l))
    },
    googleCustomerMatch: {
      blocked: selectedLabels.some(l => ['C1', 'C4', 'S3', 'S4', 'C12'].includes(l)),
      masked: selectedLabels.some(l => ['I1', 'I2'].includes(l)),
      reasons: selectedLabels.filter(l => ['C1', 'C4', 'S3', 'S4', 'C12', 'I1'].includes(l))
    },
    directMarketing: {
      blocked: selectedLabels.some(l => ['C3', 'C12'].includes(l)),
      reasons: selectedLabels.filter(l => ['C3', 'C12'].includes(l))
    },
    aiModelTraining: {
      blocked: selectedLabels.some(l => ['C9', 'S2', 'S3'].includes(l)),
      reasons: selectedLabels.filter(l => ['C9', 'S2', 'S3'].includes(l))
    },
    internalAnalytics: {
      blocked: selectedLabels.some(l => ['C8'].includes(l)),
      reasons: selectedLabels.filter(l => ['C8'].includes(l))
    }
  };

  const getCategoryColor = (cat: PrivacyLabelCategoryType) => {
    switch (cat) {
      case 'Contract':
        return {
          pill: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          accent: '#1D4ED8',
          bgLight: 'bg-blue-50/40'
        };
      case 'Identity':
        return {
          pill: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          accent: '#0D66D0',
          bgLight: 'bg-blue-50/40'
        };
      case 'Sensitive':
        return {
          pill: 'bg-[#EBF3FC] text-[#0A3D82] border-[#93C5FD]',
          accent: '#0A3D82',
          bgLight: 'bg-sky-50/40'
        };
      case 'Regulatory':
        return {
          pill: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
          accent: '#0284C7',
          bgLight: 'bg-sky-50/40'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFFFF] rounded-xl border border-[#D0D7DE] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E1E5EA] bg-[#F8FAFC] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#1473E6] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-base font-bold text-[#1E2229] truncate">
                  Adobe RT-CDP Data Usage Labels (DULE)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA] font-bold">
                  Dataset: {dataset.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] font-semibold">
                  {dataset.ingestionType}
                </span>
              </div>
              <p className="text-xs text-[#596780] mt-0.5 line-clamp-1">
                Select and apply governance labels to enforce automated marketing blocks, PII masking, and data licensing compliance across downstream activations.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#EAEEF4] p-0.5 rounded-lg border border-[#D0D7DE]">
              <button
                onClick={() => setViewMode('selection')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
                  viewMode === 'selection'
                    ? 'bg-[#FFFFFF] text-[#1473E6] shadow-xs'
                    : 'text-[#596780] hover:text-[#1E2229]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Assign Labels ({selectedLabels.length})</span>
              </button>
              <button
                onClick={() => setViewMode('guide')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
                  viewMode === 'guide'
                    ? 'bg-[#FFFFFF] text-[#1473E6] shadow-xs'
                    : 'text-[#596780] hover:text-[#1E2229]'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Reference Guide & Meanings</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-[#596780] hover:text-[#1E2229] hover:bg-[#EAEEF4] flex items-center justify-center transition-all"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Subheader / Presets Bar */}
        <div className="px-5 py-2.5 bg-[#FFFFFF] border-b border-[#E1E5EA] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-semibold text-[#596780] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1473E6]" />
              Standard Ingestion Presets:
            </span>
            <button
              onClick={() => applyPreset(['C1', 'C4', 'I2'])}
              className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] border border-[#E1E5EA] rounded text-[11px] font-medium text-[#1D4ED8] transition-all"
              title="C1 (No Syndication), C4 (No Retargeting), I2 (Indirect Identifiers)"
            >
              Web SDK Clickstream (C1, C4, I2)
            </button>
            <button
              onClick={() => applyPreset(['I1', 'C2', 'S4'])}
              className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#EBF3FC] hover:border-[#C5DCFA] border border-[#E1E5EA] rounded text-[11px] font-medium text-[#0D66D0] transition-all"
              title="I1 (Direct PII), C2 (Internal Only), S4 (Financial PCI)"
            >
              CRM Customer Master (I1, C2, S4)
            </button>
            <button
              onClick={() => applyPreset(['C4', 'C5', 'I2', 'S1'])}
              className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#E0F2FE] hover:border-[#BAE6FD] border border-[#E1E5EA] rounded text-[11px] font-medium text-[#0284C7] transition-all"
              title="C4, C5, I2, S1 (Precise Geolocation)"
            >
              Mobile App Telemetry (C4, C5, I2, S1)
            </button>
            <button
              onClick={() => applyPreset(['I1', 'C9', 'C11'])}
              className="px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#EBF3FC] hover:border-[#93C5FD] border border-[#E1E5EA] rounded text-[11px] font-medium text-[#0A3D82] transition-all"
              title="I1, C9 (No AI Training), C11 (Confidential NDA)"
            >
              Support & Verbatims (I1, C9, C11)
            </button>
            <button
              onClick={() => applyPreset([])}
              className="px-2 py-1 text-[#8C9BAE] hover:text-[#0A3D82] text-[11px] font-medium transition-all"
            >
              Clear All
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[#596780]">
              Active on Dataset:{' '}
              <strong className="text-[#1473E6] font-mono">{selectedLabels.length}</strong> of{' '}
              {ALL_PRIVACY_LABELS.length}
            </span>
            <button
              onClick={() => setFilterSelectedOnly(!filterSelectedOnly)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all flex items-center space-x-1 ${
                filterSelectedOnly
                  ? 'bg-[#1473E6] text-white border-[#1473E6]'
                  : 'bg-[#FFFFFF] text-[#596780] border-[#D0D7DE] hover:bg-[#F8FAFC]'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Show Selected ({selectedLabels.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Category Tabs & Search Bar */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E1E5EA] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                activeCategory === 'All'
                  ? 'bg-[#1473E6] text-white shadow-2xs'
                  : 'bg-[#FFFFFF] text-[#596780] border border-[#D0D7DE] hover:bg-[#F0F4F8]'
              }`}
            >
              <span>All Labels</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {ALL_PRIVACY_LABELS.length}
              </span>
            </button>

            {STANDARD_PRIVACY_LABEL_CATEGORIES.map(cat => {
              const isCatActive = activeCategory === cat.id;
              const appliedInCat = cat.labels.filter(l => selectedLabels.includes(l.code)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 border ${
                    isCatActive
                      ? 'bg-[#1473E6] text-white border-[#1473E6] shadow-2xs'
                      : 'bg-[#FFFFFF] text-[#596780] border-[#D0D7DE] hover:bg-[#F0F4F8]'
                  }`}
                >
                  <span>{cat.codePrefix}-Series ({cat.id})</span>
                  {appliedInCat > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isCatActive ? 'bg-white text-[#1473E6]' : 'bg-[#EBF3FC] text-[#0D66D0]'
                    }`}>
                      {appliedInCat}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input & Global Accordion Toggle */}
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by code (e.g. C1, S4), name, or crisp purpose..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-[#1E2229] placeholder-[#8C9BAE] focus:outline-none focus:ring-1 focus:ring-[#1473E6] focus:border-[#1473E6]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9BAE] hover:text-[#1E2229]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={expandAllCategories}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#FFFFFF] border border-[#D0D7DE] hover:bg-[#F0F4F8] text-[#2C3442] transition-colors"
                title="Expand all categories"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllCategories}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#FFFFFF] border border-[#D0D7DE] hover:bg-[#F0F4F8] text-[#596780] transition-colors"
                title="Collapse all categories"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Guide Mode Banner if active */}
          {viewMode === 'guide' && (
            <div className="p-4 rounded-lg bg-[#F0F7FF] border border-[#B8D7FF] text-xs text-[#0D66D0] leading-relaxed flex items-start space-x-3">
              <Info className="w-5 h-5 text-[#1473E6] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-[#1473E6] block mb-1">
                  About Adobe Real-Time CDP Data Usage Labeling & Enforcement (DULE)
                </strong>
                Data Usage Labels allow you to categorize datasets and fields according to governance policies and contractual restrictions.
                When datasets are ingested into XLR8 Real-Time CDP, these labels travel with the data. Downstream destinations (e.g., Meta, Google, email marketing) automatically check DULE policies and either permit the sync, block unauthorized attributes, or enforce SHA-256 cryptographic hashing.
              </div>
            </div>
          )}

          {/* Crisp Category Accordion Dropdowns for Label Selection */}
          <div className="space-y-3">
            {STANDARD_PRIVACY_LABEL_CATEGORIES
              .filter(cat => activeCategory === 'All' || activeCategory === cat.id)
              .map(cat => {
                const categoryLabels = cat.labels.filter(lbl => {
                  if (filterSelectedOnly && !selectedLabels.includes(lbl.code)) {
                    return false;
                  }
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    lbl.code.toLowerCase().includes(q) ||
                    lbl.name.toLowerCase().includes(q) ||
                    (lbl.crispPurpose && lbl.crispPurpose.toLowerCase().includes(q)) ||
                    lbl.description.toLowerCase().includes(q) ||
                    lbl.usageRestrictions.toLowerCase().includes(q)
                  );
                });

                if (categoryLabels.length === 0) return null;

                const isCatExpanded = expandedCategories.has(cat.id);
                const selectedInThisCat = categoryLabels.filter(l => selectedLabels.includes(l.code)).length;
                const colors = getCategoryColor(cat.id);

                return (
                  <div
                    key={cat.id}
                    className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-2xs bg-white ${
                      isCatExpanded
                        ? 'border-[#1473E6]/60 ring-1 ring-[#1473E6]/15'
                        : 'border-[#E1E5EA] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Category Accordion Header */}
                    <div
                      onClick={() => toggleCategory(cat.id)}
                      className="p-3.5 sm:p-4 cursor-pointer flex items-center justify-between gap-3 select-none hover:bg-[#F8FAFC]/80 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          className={`p-1.5 rounded-lg border transition-transform duration-200 shrink-0 ${
                            isCatExpanded
                              ? 'rotate-180 bg-[#EBF3FC] border-[#C5DCFA] text-[#1473E6]'
                              : 'bg-[#F8FAFC] border-[#E1E5EA] text-[#596780]'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-[#1E2229]">
                              {cat.name}
                            </h3>
                            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${colors.pill}`}>
                              {cat.codePrefix}-Series
                            </span>
                            {selectedInThisCat > 0 ? (
                              <span className="text-[11px] font-bold text-[#1473E6] bg-[#EBF3FC] border border-[#C5DCFA] px-2 py-0.5 rounded-full">
                                {selectedInThisCat} selected
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#8C9BAE]">
                                0 selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#596780] mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#1473E6] shrink-0 hidden sm:inline">
                        {isCatExpanded ? 'Collapse' : 'Expand Dropdown'}
                      </span>
                    </div>

                    {/* Category Accordion Content: Crisp Selection Table */}
                    {isCatExpanded && (
                      <div className="border-t border-[#E1E5EA] bg-[#FAFBFD] p-3 sm:p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-lg border border-[#E1E5EA] divide-y divide-[#E1E5EA] shadow-2xs overflow-hidden">
                          {/* Crisp Header: Direct label, label name, crisp purpose, and enforcement */}
                          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-[#F1F4F9]/80 text-[10px] font-bold text-[#596780] uppercase tracking-wider items-center">
                            <div className="col-span-1 flex items-center justify-center">Select</div>
                            <div className="col-span-2 sm:col-span-1">Label</div>
                            <div className="col-span-4 sm:col-span-3">Label Name</div>
                            <div className="col-span-3 sm:col-span-5">Purpose (Very Crisp Words)</div>
                            <div className="col-span-2 sm:col-span-2 text-right">Enforcement</div>
                          </div>

                          {/* Crisp Rows */}
                          {categoryLabels.map(lbl => {
                            const isSelected = selectedLabels.includes(lbl.code);
                            const crispText = lbl.crispPurpose || getCrispPurpose(lbl.code);

                            return (
                              <div
                                key={lbl.code}
                                onClick={() => toggleLabel(lbl.code)}
                                className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer transition-colors text-xs select-none ${
                                  isSelected
                                    ? 'bg-[#F0F7FF]/80 hover:bg-[#EBF4FE]'
                                    : 'hover:bg-[#F8FAFC]'
                                }`}
                              >
                                {/* Checkbox */}
                                <div className="col-span-1 flex items-center justify-center">
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                      isSelected
                                        ? 'bg-[#1473E6] border-[#1473E6] text-white'
                                        : 'border-[#CBD5E1] bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                {/* 1. Just the Label */}
                                <div className="col-span-2 sm:col-span-1">
                                  <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded border shadow-2xs ${colors.pill}`}>
                                    {lbl.code}
                                  </span>
                                </div>

                                {/* 2. What is the label name */}
                                <div className="col-span-4 sm:col-span-3">
                                  <div className="font-bold text-[#1E2229] leading-snug">
                                    {lbl.name}
                                  </div>
                                  <div className="text-[10px] text-[#8C9BAE] mt-0.5">
                                    {lbl.examples.slice(0, 2).join(', ')}
                                  </div>
                                </div>

                                {/* 3. What is the purpose in very crisp words */}
                                <div className="col-span-3 sm:col-span-5 text-[#2C3442] font-medium leading-relaxed">
                                  {crispText}
                                </div>

                                {/* Enforcement Action */}
                                <div className="col-span-2 sm:col-span-2 text-right">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      lbl.defaultAction === 'Block'
                                        ? 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                                        : lbl.defaultAction === 'Mask_SHA256'
                                        ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]'
                                        : lbl.defaultAction === 'Consent_Gated'
                                        ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                                        : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                                    }`}
                                  >
                                    {lbl.defaultAction === 'Mask_SHA256' ? 'Mask SHA-256' : lbl.defaultAction === 'Consent_Gated' ? 'Consent Gated' : lbl.defaultAction}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {filteredLabels.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[#D0D7DE] rounded-xl">
              <ShieldAlert className="w-10 h-10 text-[#8C9BAE] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1E2229]">No matching privacy labels found</p>
              <p className="text-xs text-[#596780] mt-1">Try relaxing your search query or category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setFilterSelectedOnly(false);
                }}
                className="mt-3 px-3 py-1.5 bg-[#1473E6] text-white rounded text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* DULE Enforcement Preview */}
          <div className="mt-6 p-4 rounded-xl bg-[#F8FAFC] border border-[#D0D7DE]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#1473E6]" />
                <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">
                  Live DULE Enforcement Impact Preview
                </h4>
              </div>
              <span className="text-[10px] text-[#596780]">
                Simulating outbound sync behavior for this dataset
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {/* Meta CAPI */}
              <div className={`p-3 rounded-lg border ${
                policyImpact.metaAds.blocked
                  ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                  : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
              }`}>
                <div className="font-bold flex items-center justify-between">
                  <span>Meta Ads (CAPI)</span>
                  <span>{policyImpact.metaAds.blocked ? '⛔ BLOCKED' : '✅ ALLOWED'}</span>
                </div>
                <p className="text-[10px] mt-1 opacity-90">
                  {policyImpact.metaAds.blocked
                    ? `Restricted by: ${policyImpact.metaAds.reasons.join(', ')}`
                    : 'Permitted for export'}
                </p>
              </div>

              {/* Google Match */}
              <div className={`p-3 rounded-lg border ${
                policyImpact.googleCustomerMatch.blocked
                  ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                  : policyImpact.googleCustomerMatch.masked
                  ? 'bg-[#EBF3FC] border-[#C5DCFA] text-[#0D66D0]'
                  : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
              }`}>
                <div className="font-bold flex items-center justify-between">
                  <span>Google Match</span>
                  <span>
                    {policyImpact.googleCustomerMatch.blocked
                      ? '⛔ BLOCKED'
                      : policyImpact.googleCustomerMatch.masked
                      ? '🔒 SHA-256'
                      : '✅ ALLOWED'}
                  </span>
                </div>
                <p className="text-[10px] mt-1 opacity-90">
                  {policyImpact.googleCustomerMatch.blocked
                    ? `Restricted by: ${policyImpact.googleCustomerMatch.reasons.join(', ')}`
                    : policyImpact.googleCustomerMatch.masked
                    ? 'Identifiers hashed'
                    : 'Permitted'}
                </p>
              </div>

              {/* Direct Marketing */}
              <div className={`p-3 rounded-lg border ${
                policyImpact.directMarketing.blocked
                  ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                  : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
              }`}>
                <div className="font-bold flex items-center justify-between">
                  <span>Email / SMS Mktg</span>
                  <span>{policyImpact.directMarketing.blocked ? '⛔ BLOCKED' : '✅ ALLOWED'}</span>
                </div>
                <p className="text-[10px] mt-1 opacity-90">
                  {policyImpact.directMarketing.blocked
                    ? `Restricted by: ${policyImpact.directMarketing.reasons.join(', ')}`
                    : 'Customer outreach allowed'}
                </p>
              </div>

              {/* AI Models */}
              <div className={`p-3 rounded-lg border ${
                policyImpact.aiModelTraining.blocked
                  ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                  : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
              }`}>
                <div className="font-bold flex items-center justify-between">
                  <span>AI ML Models</span>
                  <span>{policyImpact.aiModelTraining.blocked ? '⛔ BLOCKED' : '✅ ALLOWED'}</span>
                </div>
                <p className="text-[10px] mt-1 opacity-90">
                  {policyImpact.aiModelTraining.blocked
                    ? `Restricted by: ${policyImpact.aiModelTraining.reasons.join(', ')}`
                    : 'Eligible for training'}
                </p>
              </div>

              {/* Internal Analytics */}
              <div className={`p-3 rounded-lg border ${
                policyImpact.internalAnalytics.blocked
                  ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                  : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
              }`}>
                <div className="font-bold flex items-center justify-between">
                  <span>Query & BI</span>
                  <span>{policyImpact.internalAnalytics.blocked ? '⛔ BLOCKED' : '✅ ALLOWED'}</span>
                </div>
                <p className="text-[10px] mt-1 opacity-90">
                  {policyImpact.internalAnalytics.blocked
                    ? `Restricted by: ${policyImpact.internalAnalytics.reasons.join(', ')}`
                    : 'Internal query allowed'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:px-6 bg-[#FFFFFF] border-t border-[#E1E5EA] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#596780]">Selected Labels:</span>
            {selectedLabels.length === 0 ? (
              <span className="text-[#8C9BAE] italic">No labels selected (Unrestricted data)</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map(code => (
                  <span
                    key={code}
                    className="font-mono font-bold px-1.5 py-0.5 rounded bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA] text-[11px]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {saveSuccess && (
              <span className="text-xs font-bold text-[#0284C7] flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Labels Saved & DULE Policies Active!
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#596780] hover:text-[#1E2229] border border-[#D0D7DE] rounded-lg bg-[#FFFFFF] hover:bg-[#F8FAFC] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1473E6] hover:bg-[#0D66D0] rounded-lg shadow-xs transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Apply {selectedLabels.length} Labels to Dataset</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
