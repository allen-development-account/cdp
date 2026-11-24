import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { Dataset, PrivacyLabelCategoryType } from '../../types/cdp';
import { ALL_PRIVACY_LABELS, STANDARD_PRIVACY_LABEL_CATEGORIES, getCrispPurpose } from '../../data/privacyLabelsData';
import { PageBackButton } from '../common/PageBackButton';
import { DatasetLabelingModal } from './DatasetLabelingModal';
import { BringInDatasetModal } from './BringInDatasetModal';
import {
  Database,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Plus,
  Search,
  Filter,
  Layers,
  Radio,
  FileSpreadsheet,
  Cloud,
  CheckCircle2,
  Lock,
  ExternalLink,
  BookOpen,
  Info,
  Check,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Sliders,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X
} from 'lucide-react';

export const DatasetsView: React.FC = () => {
  const {
    datasets,
    deleteDataset,
    updateDatasetLabels,
    schemas,
    setActiveTab
  } = useCDP();

  const [activeViewTab, setActiveViewTab] = useState<'datasets' | 'guide' | 'simulator'>('datasets');
  const [searchQuery, setSearchQuery] = useState('');
  const [ingestionFilter, setIngestionFilter] = useState<'All' | 'Streaming' | 'Batch' | 'Zero-Copy'>('All');
  const [profileOnly, setProfileOnly] = useState(false);

  // Accordion dropdown states for Datasets
  const [expandedDatasetIds, setExpandedDatasetIds] = useState<Set<string>>(
    () => new Set(datasets.slice(0, 2).map(d => d.id))
  );

  // Accordion dropdown states for Reference Guide categories
  const [expandedGuideCategories, setExpandedGuideCategories] = useState<Set<string>>(
    () => new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory'])
  );

  // Labeling modal state
  const [labelingDataset, setLabelingDataset] = useState<Dataset | null>(null);
  const [isBringInModalOpen, setIsBringInModalOpen] = useState(false);

  // Guide state
  const [guideCategory, setGuideCategory] = useState<'All' | PrivacyLabelCategoryType>('All');
  const [guideSearch, setGuideSearch] = useState('');

  const toggleExpandDataset = (id: string) => {
    setExpandedDatasetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAllDatasets = (ids: string[]) => {
    setExpandedDatasetIds(new Set(ids));
  };

  const collapseAllDatasets = () => {
    setExpandedDatasetIds(new Set());
  };

  const toggleGuideCategory = (catId: string) => {
    setExpandedGuideCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Contract':
        return {
          badge: 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]',
          actionBadge: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
          accent: 'text-[#4F46E5]'
        };
      case 'Identity':
        return {
          badge: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          actionBadge: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]',
          accent: 'text-[#0D66D0]'
        };
      case 'Sensitive':
        return {
          badge: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
          actionBadge: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
          accent: 'text-[#E11D48]'
        };
      case 'Regulatory':
        return {
          badge: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          actionBadge: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]',
          accent: 'text-[#0E7A36]'
        };
      default:
        return {
          badge: 'bg-[#F1F4F9] text-[#596780] border-[#E1E5EA]',
          actionBadge: 'bg-[#F1F4F9] text-[#596780] border-[#E1E5EA]',
          accent: 'text-[#596780]'
        };
    }
  };

  // Filtered Datasets
  const filteredDatasets = useMemo(() => {
    return datasets.filter(ds => {
      if (ingestionFilter !== 'All' && ds.ingestionType !== ingestionFilter) {
        return false;
      }
      if (profileOnly && !ds.profileEnabled) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ds.name.toLowerCase().includes(q);
        const matchDesc = ds.description.toLowerCase().includes(q);
        const matchSchema = ds.schemaName.toLowerCase().includes(q);
        const matchConn = ds.sourceConnector.toLowerCase().includes(q);
        const matchLabels = ds.labels.some(l => l.toLowerCase().includes(q));
        return matchName || matchDesc || matchSchema || matchConn || matchLabels;
      }
      return true;
    });
  }, [datasets, ingestionFilter, profileOnly, searchQuery]);

  // Filtered Guide Labels
  const filteredGuideLabels = useMemo(() => {
    return ALL_PRIVACY_LABELS.filter(lbl => {
      if (guideCategory !== 'All' && lbl.category !== guideCategory) {
        return false;
      }
      if (guideSearch.trim()) {
        const q = guideSearch.toLowerCase();
        return (
          lbl.code.toLowerCase().includes(q) ||
          lbl.name.toLowerCase().includes(q) ||
          lbl.description.toLowerCase().includes(q) ||
          lbl.usageRestrictions.toLowerCase().includes(q) ||
          lbl.applicableRegulations.some(r => r.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [guideCategory, guideSearch]);

  const totalRecords = datasets.reduce((acc, d) => acc + d.recordCount, 0);
  const profileEnabledCount = datasets.filter(d => d.profileEnabled).length;
  const labeledCount = datasets.filter(d => d.labels.length > 0).length;

  return (
    <div className="space-y-6">
      
      {/* Navigation and Top Header with Unified Blue Gradient */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-2xl border border-[#0E4DA4] shadow-sm relative overflow-hidden p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <PageBackButton fallbackTab="hub_data_management" fallbackLabel="Data Management" />
              <div className="h-4 w-px bg-white/25" />
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/15 text-white border border-white/25 shadow-2xs">
                  XLR8 DATA MANAGEMENT
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-[#8CE2A7] border border-[#8CE2A7]/40 shadow-2xs">
                  Adobe RT-CDP DULE Compliant
                </span>
              </div>
            </div>

            {/* Main Heading with White Typography */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Datasets & Data Usage Labeling (DULE)
            </h1>

            {/* Description Text */}
            <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed font-medium">
              Manage data brought into the platform. Label datasets using the Adobe Real-Time CDP governance taxonomy
              (Contractual, Identity, Sensitive, and Regulatory) to guarantee automated compliance across downstream marketing activations.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveViewTab('guide')}
              className="px-3.5 py-2.5 rounded-xl border border-white/25 bg-white/15 hover:bg-white/25 text-xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-100" />
              <span>Label Reference Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('create_dataset')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2F4F7] text-xs font-bold text-[#0D66D0] flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Bring In Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#596780] mb-1">
            <span className="font-semibold">Brought-In Datasets</span>
            <Database className="w-4 h-4 text-[#1473E6]" />
          </div>
          <div className="text-2xl font-bold text-[#1E2229]">{datasets.length}</div>
          <div className="text-[11px] text-[#0E7A36] font-medium mt-1">
            {totalRecords.toLocaleString()} total records ingested
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#596780] mb-1">
            <span className="font-semibold">Profile-Enabled</span>
            <Layers className="w-4 h-4 text-[#0D66D0]" />
          </div>
          <div className="text-2xl font-bold text-[#1E2229]">{profileEnabledCount}</div>
          <div className="text-[11px] text-[#596780] font-medium mt-1">
            Feeding Real-Time Identity Graph
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#596780] mb-1">
            <span className="font-semibold">DULE Labeled Datasets</span>
            <ShieldCheck className="w-4 h-4 text-[#0E7A36]" />
          </div>
          <div className="text-2xl font-bold text-[#1E2229]">
            {labeledCount} <span className="text-xs font-normal text-[#596780]">/ {datasets.length}</span>
          </div>
          <div className="text-[11px] text-[#0E7A36] font-medium mt-1">
            100% policy-audited metadata
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#596780] mb-1">
            <span className="font-semibold">Active Governance Labels</span>
            <Tag className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="text-2xl font-bold text-[#1E2229]">{ALL_PRIVACY_LABELS.length}</div>
          <div className="text-[11px] text-[#4F46E5] font-medium mt-1">
            C-12, I-2, S-10, R-4 Taxonomy
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#E1E5EA] pb-px">
        <button
          onClick={() => setActiveViewTab('datasets')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeViewTab === 'datasets'
              ? 'border-[#1473E6] text-[#1473E6]'
              : 'border-transparent text-[#596780] hover:text-[#1E2229] hover:border-[#D0D7DE]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Dataset Inventory & Labeling ({datasets.length})</span>
        </button>

        <button
          onClick={() => setActiveViewTab('guide')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeViewTab === 'guide'
              ? 'border-[#1473E6] text-[#1473E6]'
              : 'border-transparent text-[#596780] hover:text-[#1E2229] hover:border-[#D0D7DE]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Adobe RT-CDP Label Reference Guide & Meanings</span>
        </button>

        <button
          onClick={() => setActiveViewTab('simulator')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeViewTab === 'simulator'
              ? 'border-[#1473E6] text-[#1473E6]'
              : 'border-transparent text-[#596780] hover:text-[#1E2229] hover:border-[#D0D7DE]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>DULE Downstream Activation Matrix</span>
        </button>
      </div>

      {/* TAB 1: DATASET INVENTORY */}
      {activeViewTab === 'datasets' && (
        <div className="space-y-4">
          
          {/* Filter and Search Bar */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search datasets by name, schema, connector, or label code (e.g. C1, S4)..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] placeholder-[#8C9BAE] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
              />
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <div className="flex items-center bg-[#F1F4F9] p-0.5 rounded-lg border border-[#E1E5EA]">
                {(['All', 'Streaming', 'Batch', 'Zero-Copy'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setIngestionFilter(type)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      ingestionFilter === type
                        ? 'bg-[#FFFFFF] text-[#1473E6] shadow-2xs'
                        : 'text-[#596780] hover:text-[#1E2229]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setProfileOnly(!profileOnly)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                  profileOnly
                    ? 'bg-[#1473E6] text-white border-[#1473E6]'
                    : 'bg-[#FFFFFF] text-[#596780] border-[#D0D7DE] hover:bg-[#F8FAFC]'
                }`}
              >
                Profile Enabled Only
              </button>

              <div className="h-4 w-px bg-[#E1E5EA] hidden sm:block" />

              {/* Accordion Global Controls */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => expandAllDatasets(filteredDatasets.map(d => d.id))}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#2C3442] transition-colors flex items-center gap-1"
                  title="Expand all dataset dropdowns"
                >
                  <ChevronsUpDown className="w-3 h-3 text-[#1473E6]" />
                  <span>Expand All</span>
                </button>
                <button
                  type="button"
                  onClick={collapseAllDatasets}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#596780] transition-colors"
                  title="Collapse all dataset dropdowns"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Dataset Accordion Dropdowns List */}
          <div className="space-y-3">
            {filteredDatasets.map(ds => {
              const appliedDefs = ALL_PRIVACY_LABELS.filter(l => ds.labels.includes(l.code));
              const isExpanded = expandedDatasetIds.has(ds.id);

              return (
                <div
                  key={ds.id}
                  className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-2xs bg-white ${
                    isExpanded
                      ? 'border-[#1473E6]/70 ring-1 ring-[#1473E6]/20'
                      : 'border-[#E1E5EA] hover:border-[#CBD5E1]'
                  }`}
                >
                  {/* Crisp Accordion Dropdown Header */}
                  <div
                    onClick={() => toggleExpandDataset(ds.id)}
                    className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none hover:bg-[#F8FAFC]/80 transition-colors"
                  >
                    {/* Left: Chevron toggle + Dataset Name & Metadata Badges */}
                    <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                      <button
                        type="button"
                        className={`p-1.5 rounded-lg border transition-transform duration-200 shrink-0 ${
                          isExpanded
                            ? 'rotate-180 bg-[#EBF3FC] border-[#C5DCFA] text-[#1473E6]'
                            : 'bg-[#F8FAFC] border-[#E1E5EA] text-[#596780] hover:text-[#1E2229]'
                        }`}
                        title={isExpanded ? 'Collapse dropdown' : 'Expand dropdown'}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="font-bold text-sm text-[#1E2229] hover:text-[#1473E6] transition-colors">
                            {ds.name}
                          </h3>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F1F4F9] text-[#596780] border border-[#E1E5EA]">
                            ID: {ds.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            ds.ingestionType === 'Streaming'
                              ? 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]'
                              : ds.ingestionType === 'Batch'
                              ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]'
                              : 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]'
                          }`}>
                            {ds.ingestionType}
                          </span>
                          {ds.profileEnabled && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0F7FF] text-[#1473E6] border border-[#B8D7FF] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Profile Enabled
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-[11px] text-[#596780] flex-wrap gap-y-0.5">
                          <span><strong>Records:</strong> {ds.recordCount.toLocaleString()} ({ds.sizeBytes})</span>
                          <span>•</span>
                          <span><strong>Format:</strong> {ds.format}</span>
                          <span>•</span>
                          <span className="text-[#64748B]"><strong>Schema:</strong> {ds.schemaName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Crisp Summary Badges & Quick Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      {/* Crisp Summary Pill */}
                      <div className="flex items-center space-x-1.5">
                        {ds.labels.length > 0 ? (
                          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#EBF3FC] border border-[#C5DCFA] text-xs font-semibold text-[#1473E6]">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{ds.labels.length} DULE {ds.labels.length === 1 ? 'Label' : 'Labels'}</span>
                            <div className="flex items-center space-x-1 pl-1">
                              {ds.labels.slice(0, 4).map(code => (
                                <span
                                  key={code}
                                  className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-white text-[#1473E6] shadow-2xs border border-[#C5DCFA]"
                                >
                                  {code}
                                </span>
                              ))}
                              {ds.labels.length > 4 && (
                                <span className="text-[10px] font-mono text-[#596780]">+{ds.labels.length - 4}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#F8FAFC] text-[#8C9BAE] text-xs font-medium border border-dashed border-[#CBD5E1]">
                            0 Labels (Unrestricted)
                          </span>
                        )}
                      </div>

                      <div className="h-4 w-px bg-[#E1E5EA] hidden sm:block" />

                      {/* Primary Label Selection Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLabelingDataset(ds);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
                        title="Select & apply DULE privacy labels"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Manage / Select Labels</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('schemas');
                        }}
                        className="p-2 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#F8FAFC] text-[#596780] hover:text-[#1E2229] transition-all"
                        title="Inspect Underlying Schema"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete dataset "${ds.name}"?`)) {
                            deleteDataset(ds.id);
                          }
                        }}
                        className="p-2 rounded-lg border border-[#D0D7DE] bg-white hover:bg-[#FFF1F2] hover:border-[#FECDD3] text-[#596780] hover:text-[#D7373F] transition-all"
                        title="Delete Dataset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Crisp Accordion Dropdown Content (When Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-[#E1E5EA] bg-[#FAFBFD] p-4 sm:p-5 space-y-4">
                      
                      {/* Context Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#596780] pb-3 border-b border-[#E1E5EA]/70">
                        <div className="max-w-2xl">
                          <strong className="text-[#1E2229]">Dataset Purpose:</strong> {ds.description}
                        </div>
                        <div className="flex items-center space-x-3 text-[11px]">
                          <span><strong>Connector:</strong> {ds.sourceConnector}</span>
                          <span>•</span>
                          <span><strong>Last Ingested:</strong> {ds.lastIngestedAt}</span>
                        </div>
                      </div>

                      {/* Crisp Labels Section: Label Name, Purpose in Very Crisp Words, and Label */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-[#1473E6]" />
                            <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">
                              Applied DULE Governance Labels ({appliedDefs.length})
                            </span>
                            <span className="text-[11px] text-[#596780] hidden md:inline">
                              — Showing label name, purpose in very crisp words, and the label:
                            </span>
                          </div>

                          <button
                            onClick={() => setLabelingDataset(ds)}
                            className="text-xs font-bold text-[#1473E6] hover:text-[#0D66D0] hover:underline flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select / Edit Labels</span>
                          </button>
                        </div>

                        {appliedDefs.length > 0 ? (
                          <div className="bg-white rounded-lg border border-[#E1E5EA] divide-y divide-[#E1E5EA] shadow-2xs overflow-hidden">
                            {/* Crisp Accordion Table Header */}
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-[#F1F4F9]/70 text-[10px] font-bold text-[#596780] uppercase tracking-wider">
                              <div className="col-span-2 sm:col-span-1">Label</div>
                              <div className="col-span-4 sm:col-span-3">Label Name</div>
                              <div className="col-span-4 sm:col-span-6">Purpose (Very Crisp Words)</div>
                              <div className="col-span-2 sm:col-span-2 text-right">Enforcement</div>
                            </div>

                            {/* Crisp Label Rows */}
                            {appliedDefs.map(lbl => {
                              const style = getCategoryStyles(lbl.category);
                              const crispText = lbl.crispPurpose || getCrispPurpose(lbl.code);

                              return (
                                <div
                                  key={lbl.code}
                                  className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-[#F8FAFC] transition-colors text-xs"
                                >
                                  {/* 1. Just the Label */}
                                  <div className="col-span-2 sm:col-span-1">
                                    <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded border shadow-2xs ${style.badge}`}>
                                      {lbl.code}
                                    </span>
                                  </div>

                                  {/* 2. What is the label name */}
                                  <div className="col-span-4 sm:col-span-3">
                                    <div className="font-bold text-[#1E2229] leading-snug">
                                      {lbl.name}
                                    </div>
                                    <div className="text-[10px] text-[#8C9BAE] mt-0.5">
                                      {lbl.category} Series
                                    </div>
                                  </div>

                                  {/* 3. What is the purpose in very crisp words */}
                                  <div className="col-span-4 sm:col-span-6 text-[#2C3442] font-medium leading-relaxed">
                                    {crispText}
                                  </div>

                                  {/* Enforcement & Remove Action */}
                                  <div className="col-span-2 sm:col-span-2 flex items-center justify-end space-x-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.actionBadge}`}>
                                      {lbl.defaultAction === 'Mask_SHA256' ? 'Mask SHA-256' : lbl.defaultAction === 'Consent_Gated' ? 'Consent Gated' : lbl.defaultAction}
                                    </span>
                                    <button
                                      onClick={() => {
                                        const updated = ds.labels.filter(c => c !== lbl.code);
                                        updateDatasetLabels(ds.id, updated);
                                      }}
                                      className="p-1 text-[#8C9BAE] hover:text-[#D7373F] rounded hover:bg-[#FFF1F2] transition-colors"
                                      title={`Remove label ${lbl.code} from dataset`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 bg-white rounded-lg border border-dashed border-[#D0D7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-2.5 text-xs text-[#596780]">
                              <Info className="w-4 h-4 text-[#8C9BAE] shrink-0" />
                              <span>No DULE governance labels assigned yet. This dataset is unrestricted for downstream activation and advertising destinations.</span>
                            </div>
                            <button
                              onClick={() => setLabelingDataset(ds)}
                              className="px-3 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded-md text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-2xs self-start sm:self-center"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Select Labels
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredDatasets.length === 0 && (
              <div className="text-center py-16 bg-[#FFFFFF] rounded-xl border border-dashed border-[#D0D7DE]">
                <Database className="w-10 h-10 text-[#8C9BAE] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#1E2229]">No datasets match your filters</p>
                <p className="text-xs text-[#596780] mt-1">Try resetting the search query or bring in a new dataset.</p>
                <button
                  onClick={() => setActiveTab('create_dataset')}
                  className="mt-3 px-4 py-1.5 bg-[#1473E6] text-white rounded-md text-xs font-bold"
                >
                  Bring In New Dataset
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADOBE REAL-TIME CDP LABEL REFERENCE GUIDE & MEANINGS */}
      {activeViewTab === 'guide' && (
        <div className="space-y-4">
          
          {/* Educational Intro Card */}
          <div className="p-5 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs space-y-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#1473E6]" />
              <h2 className="text-base font-bold text-[#1E2229]">
                Adobe Real-Time CDP Data Usage Labeling Reference Guide & Taxonomy
              </h2>
            </div>
            <p className="text-xs text-[#596780] leading-relaxed">
              Adobe Real-Time CDP applies data governance through <strong>Data Usage Labeling and Enforcement (DULE)</strong>.
              Labels are metadata tags applied directly to datasets and schema fields. When downstream marketing and analytics destinations
              attempt to export or process data, the XLR8 Governance Engine evaluates whether the labels violate contractual agreements,
              privacy consent policies, or global regulations (GDPR, CCPA, HIPAA, PCI).
            </p>
          </div>

          {/* Guide Search & Category Filters */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setGuideCategory('All')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  guideCategory === 'All'
                    ? 'bg-[#1473E6] text-white'
                    : 'bg-[#F1F4F9] text-[#596780] hover:bg-[#E9EEF4]'
                }`}
              >
                All Categories ({ALL_PRIVACY_LABELS.length})
              </button>
              {STANDARD_PRIVACY_LABEL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setGuideCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    guideCategory === cat.id
                      ? 'bg-[#1473E6] text-white'
                      : 'bg-[#F1F4F9] text-[#596780] hover:bg-[#E9EEF4]'
                  }`}
                >
                  {cat.codePrefix}-Series ({cat.id})
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guideSearch}
                  onChange={e => setGuideSearch(e.target.value)}
                  placeholder="Search labels, crisp purpose, or laws..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded-md text-xs text-[#1E2229] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>

              {/* Accordion expand/collapse all for guide */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpandedGuideCategories(new Set(['Contract', 'Identity', 'Sensitive', 'Regulatory']))}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#2C3442] transition-colors"
                  title="Expand all category accordions"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedGuideCategories(new Set())}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#F1F4F9] hover:bg-[#E9EEF4] text-[#596780] transition-colors"
                  title="Collapse all category accordions"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Guide Category Accordion Dropdowns */}
          <div className="space-y-3">
            {STANDARD_PRIVACY_LABEL_CATEGORIES
              .filter(cat => guideCategory === 'All' || guideCategory === cat.id)
              .map(cat => {
                const categoryLabels = cat.labels.filter(lbl => {
                  if (!guideSearch.trim()) return true;
                  const q = guideSearch.toLowerCase();
                  return (
                    lbl.code.toLowerCase().includes(q) ||
                    lbl.name.toLowerCase().includes(q) ||
                    (lbl.crispPurpose && lbl.crispPurpose.toLowerCase().includes(q)) ||
                    lbl.description.toLowerCase().includes(q) ||
                    lbl.usageRestrictions.toLowerCase().includes(q)
                  );
                });

                if (categoryLabels.length === 0) return null;

                const isCatExpanded = expandedGuideCategories.has(cat.id);
                const catStyles = getCategoryStyles(cat.id);

                return (
                  <div
                    key={cat.id}
                    className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-2xs bg-white ${
                      isCatExpanded ? 'border-[#1473E6]/60 ring-1 ring-[#1473E6]/15' : 'border-[#E1E5EA] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Category Accordion Header */}
                    <div
                      onClick={() => toggleGuideCategory(cat.id)}
                      className="p-4 cursor-pointer flex items-center justify-between gap-3 select-none hover:bg-[#F8FAFC]/80 transition-colors"
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
                            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${catStyles.badge}`}>
                              {cat.codePrefix}-Series
                            </span>
                            <span className="text-[11px] font-semibold text-[#596780] bg-[#F1F4F9] px-2 py-0.5 rounded border border-[#E1E5EA]">
                              {categoryLabels.length} {categoryLabels.length === 1 ? 'Label' : 'Labels'}
                            </span>
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

                    {/* Category Accordion Content */}
                    {isCatExpanded && (
                      <div className="border-t border-[#E1E5EA] bg-[#FAFBFD] p-3 sm:p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-lg border border-[#E1E5EA] divide-y divide-[#E1E5EA] shadow-2xs overflow-hidden">
                          {/* Crisp Table Header */}
                          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#F1F4F9]/80 text-[10px] font-bold text-[#596780] uppercase tracking-wider">
                            <div className="col-span-2 sm:col-span-1">Label</div>
                            <div className="col-span-4 sm:col-span-3">Label Name</div>
                            <div className="col-span-4 sm:col-span-6">Purpose (Very Crisp Words)</div>
                            <div className="col-span-2 sm:col-span-2 text-right">Enforcement</div>
                          </div>

                          {/* Crisp Rows */}
                          {categoryLabels.map(lbl => {
                            const crispText = lbl.crispPurpose || getCrispPurpose(lbl.code);

                            return (
                              <div
                                key={lbl.code}
                                className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-[#F8FAFC] transition-colors text-xs"
                              >
                                {/* 1. Just the Label */}
                                <div className="col-span-2 sm:col-span-1">
                                  <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded border shadow-2xs ${catStyles.badge}`}>
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
                                <div className="col-span-4 sm:col-span-6 text-[#2C3442] font-medium leading-relaxed">
                                  {crispText}
                                </div>

                                {/* Enforcement Action */}
                                <div className="col-span-2 sm:col-span-2 text-right">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${catStyles.actionBadge}`}>
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
        </div>
      )}

      {/* TAB 3: DULE DOWNSTREAM ENFORCEMENT SIMULATOR */}
      {activeViewTab === 'simulator' && (
        <div className="p-5 bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1E2229]">
              Real-Time CDP DULE Activation Enforcement Matrix
            </h2>
            <p className="text-xs text-[#596780] mt-0.5">
              How Adobe RT-CDP data usage labels automatically guard against privacy violations across major marketing destinations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] border-y border-[#E1E5EA] text-[#596780] font-bold">
                <tr>
                  <th className="p-3">Label Code & Category</th>
                  <th className="p-3">Label Name</th>
                  <th className="p-3">Meta Conversions API</th>
                  <th className="p-3">Google Customer Match</th>
                  <th className="p-3">Email & SMS (Braze/SFMC)</th>
                  <th className="p-3">AI Model Training</th>
                  <th className="p-3">Enforcement Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5EA]">
                {ALL_PRIVACY_LABELS.slice(0, 10).map(lbl => (
                  <tr key={lbl.code} className="hover:bg-[#F8FAFC]">
                    <td className="p-3 font-mono font-bold text-[#1473E6]">{lbl.code}</td>
                    <td className="p-3 font-semibold text-[#1E2229]">{lbl.name}</td>
                    <td className="p-3">
                      {['C1', 'C4', 'S4'].includes(lbl.code) ? (
                        <span className="text-[#E11D48] font-bold">⛔ Blocked</span>
                      ) : (
                        <span className="text-[#059669]">✅ Allowed</span>
                      )}
                    </td>
                    <td className="p-3">
                      {['C1', 'C4'].includes(lbl.code) ? (
                        <span className="text-[#E11D48] font-bold">⛔ Blocked</span>
                      ) : lbl.code === 'I1' ? (
                        <span className="text-[#0D66D0] font-bold">🔒 SHA-256</span>
                      ) : (
                        <span className="text-[#059669]">✅ Allowed</span>
                      )}
                    </td>
                    <td className="p-3">
                      {lbl.code === 'C3' ? (
                        <span className="text-[#E11D48] font-bold">⛔ Blocked</span>
                      ) : (
                        <span className="text-[#059669]">✅ Allowed</span>
                      )}
                    </td>
                    <td className="p-3">
                      {lbl.code === 'C9' ? (
                        <span className="text-[#E11D48] font-bold">⛔ Blocked</span>
                      ) : (
                        <span className="text-[#059669]">✅ Allowed</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-[#596780]">{lbl.defaultAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dataset Labeling Modal */}
      {labelingDataset && (
        <DatasetLabelingModal
          dataset={labelingDataset}
          isOpen={!!labelingDataset}
          onClose={() => setLabelingDataset(null)}
        />
      )}

      {/* Bring In Dataset Modal */}
      {isBringInModalOpen && (
        <BringInDatasetModal
          isOpen={isBringInModalOpen}
          onClose={() => setIsBringInModalOpen(false)}
          onDatasetCreated={newDs => {
            setLabelingDataset(newDs);
          }}
        />
      )}
    </div>
  );
};
