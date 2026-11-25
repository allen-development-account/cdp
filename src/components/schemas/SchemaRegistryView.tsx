import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { SchemaDefinition, SchemaField, PrivacyClassification } from '../../types/cdp';
import { DULEBadge } from '../common/DULEBadge';
import { CreateSchemaModal } from './CreateSchemaModal';
import { JsonSchemaViewerModal } from './JsonSchemaViewerModal';
import { STANDARD_SCHEMA_BLUEPRINTS } from '../../data/seedData';
import {
  Database,
  Plus,
  Shield,
  ShieldAlert,
  Key,
  Lock,
  EyeOff,
  CheckCircle,
  AlertCircle,
  FileCode,
  Layers,
  Sparkles,
  Search,
  Filter,
  Copy,
  Trash2,
  Code2,
  ExternalLink,
  Info,
  Sliders,
  Check,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';

export const SchemaRegistryView: React.FC = () => {
  const {
    schemas,
    addSchemaField,
    deleteSchemaField,
    updateSchemaField,
    toggleFieldSensitivity,
    deleteSchema,
    duplicateSchema,
    loadSchemaBlueprint,
    clearAllSchemas,
    setActiveTab,
    setEditingSchemaId
  } = useCDP();

  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(schemas[0]?.id || '');
  const [isCreateSchemaModalOpen, setIsCreateSchemaModalOpen] = useState(false);
  const [showBlueprintSelection, setShowBlueprintSelection] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [viewingJsonSchema, setViewingJsonSchema] = useState<SchemaDefinition | null>(null);

  // Field Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassificationFilter, setSelectedClassificationFilter] = useState<string>('ALL');

  // New field modal state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<SchemaField['dataType']>('string');
  const [newFieldDesc, setNewFieldDesc] = useState('');
  const [newFieldClassification, setNewFieldClassification] = useState<PrivacyClassification>('Standard');
  const [isIdentifier, setIsIdentifier] = useState(false);
  const [identifierType, setIdentifierType] = useState<SchemaField['identifierType']>('cookie');
  const [isRequired, setIsRequired] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);

  // Active current schema
  const currentSchema: SchemaDefinition | undefined = schemas.find(s => s.id === selectedSchemaId) || schemas[0];

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !currentSchema) return;

    addSchemaField(currentSchema.id, {
      name: newFieldName.trim().replace(/[^a-zA-Z0-9_]/g, ''),
      dataType: newFieldType,
      description: newFieldDesc || `${newFieldName} attribute in canonical schema`,
      classification: isSensitive ? 'Sensitive' : newFieldClassification,
      isIdentifier,
      identifierType: isIdentifier ? identifierType : undefined,
      isRequired,
      isSensitive,
      maskInExports: isSensitive,
      blockInAdNetworks: isSensitive,
    });

    // Reset form
    setNewFieldName('');
    setNewFieldDesc('');
    setNewFieldType('string');
    setNewFieldClassification('Standard');
    setIsIdentifier(false);
    setIsRequired(false);
    setIsSensitive(false);
    setIsAddFieldModalOpen(false);
  };

  const filteredFields = currentSchema?.fields.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.dataType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedClassificationFilter === 'ALL' || f.classification === selectedClassificationFilter;
    return matchesSearch && matchesFilter;
  }) || [];

  const sensitiveFieldsCount = currentSchema?.fields.filter(f => f.isSensitive).length || 0;
  const identityFieldsCount = currentSchema?.fields.filter(f => f.isIdentifier).length || 0;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <PageBackButton fallbackTab="hub_data_management" fallbackLabel="Data Management" />
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-100 mb-0.5">
              <span>Data Management</span>
              <span>/</span>
              <span className="font-medium text-white">Schemas (XDM Registry)</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Experience Data Model (XDM) Schemas</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="px-3 py-1.5 bg-white/15 rounded border border-white/25 text-xs font-medium text-white shadow-2xs">
            <span>Registered Schemas:</span> <strong className="text-white font-bold">{schemas.length}</strong>
          </div>

          <button
            onClick={() => {
              setEditingSchemaId(null);
              setActiveTab('create_schema');
            }}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-3.5 py-1.5 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Schema</span>
          </button>
        </div>
      </div>

      {/* Main Schema Workspace */}
      {schemas.length === 0 ? (
        !showBlueprintSelection ? (
          /* Screen 1: Clean Empty State with Two Clear Paths */
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs p-10 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] border border-[#BAE6FD] flex items-center justify-center text-[#1473E6] mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-[#1E2229]">No Schemas in Active Sandbox</h3>
              <p className="text-xs text-[#596780] leading-relaxed">
                Create a new custom Experience Data Model (XDM) schema from scratch, or start immediately from an industry-standard XLR8 Real-Time CDP blueprint.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEditingSchemaId(null);
                  setActiveTab('create_schema');
                }}
                className="px-4 py-2.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Schema from Scratch</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBlueprintSelection(true)}
                className="px-4 py-2.5 bg-[#EBF3FC] hover:bg-[#DCEAF9] border border-[#BFDBFE] text-[#0D66D0] text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instantiate Create Schema Using Blueprint</span>
              </button>
            </div>
          </div>
        ) : (
          /* Screen 2: Industry Standard Blueprint Selection */
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-6 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Instantiate Industry Standard Blueprint
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Choose one of the three pre-built XDM schema blueprints below to create it instantly in your active sandbox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlueprintSelection(false)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold inline-flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {STANDARD_SCHEMA_BLUEPRINTS.slice(0, 3).map(bp => (
                <div
                  key={bp.id}
                  className="p-5 rounded-xl border border-[#E1E5EA] hover:border-[#1473E6] bg-[#FFFFFF] transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                        {bp.category}
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B] tabular-nums">{bp.fields.length} Fields</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#1E2229] mb-1.5">{bp.name}</h4>
                    <p className="text-xs text-[#596780] leading-relaxed mb-5">{bp.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      loadSchemaBlueprint(bp.id);
                      setShowBlueprintSelection(false);
                    }}
                    className="w-full py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instantiate Blueprint</span>
                  </button>
                </div>
              ))}
            </div>
            </div>
          </div>
        )
      ) : (
        /* Populated Schemas View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Column: Schema List Nav */}
          <div className="lg:col-span-1 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase text-[#6E6E6E] tracking-wider">Registered Schemas</span>
              <button
                onClick={() => {
                  setEditingSchemaId(null);
                  setActiveTab('create_schema');
                }}
                className="text-xs font-medium text-[#1473E6] hover:text-[#0D66D0] flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {schemas.map(schema => {
                const isSelected = (currentSchema?.id === schema.id);
                return (
                  <div
                    key={schema.id}
                    onClick={() => setSelectedSchemaId(schema.id)}
                    className={`p-3 rounded border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#FFFFFF] border-[#1473E6] ring-1 ring-[#1473E6] shadow-2xs'
                        : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#D5D5D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                        schema.category === 'Profile'
                          ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]'
                          : schema.category === 'ExperienceEvent'
                          ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
                          : schema.category === 'B2BAccount'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                          : 'bg-[#DBEAFE] text-[#0A3D82] border-[#93C5FD]'
                      }`}>
                        {schema.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#888888]">v{schema.version}</span>
                    </div>

                    <h4 className="font-semibold text-xs text-[#2C2C2C] truncate">{schema.name}</h4>
                    <p className="text-[11px] text-[#6E6E6E] line-clamp-2 mt-0.5 leading-snug">
                      {schema.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-[#F2F4F7] flex items-center justify-between text-[10px] text-[#888888]">
                      <span>{schema.fields.length} Attributes</span>
                      <span className="font-semibold text-[#0284C7]">{schema.status || 'Active'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={clearAllSchemas}
                className="w-full py-1.5 bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#596780] hover:text-[#0A3D82] border border-[#E1E5EA] hover:border-[#BFDBFE] rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Schemas</span>
              </button>
            </div>
          </div>

          {/* Right Column: Schema Inspector & Field Table */}
          {currentSchema && (
            <div className="lg:col-span-3 space-y-4">
              {/* Selected Schema Header Card */}
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base font-bold text-white">{currentSchema.name}</h3>
                      <span className="text-[10px] font-mono bg-white/15 text-white px-1.5 py-0.5 rounded font-medium border border-white/25">
                        v{currentSchema.version}
                      </span>
                      <span className="text-[10px] font-medium text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
                        {currentSchema.status || 'Enabled for Profile'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">{currentSchema.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-blue-100">
                      <span><strong className="text-white">Base Class:</strong> {currentSchema.baseClass || 'https://ns.xprplatform.com/xdm/context/profile'}</span>
                      <span><strong className="text-white">Namespace:</strong> {currentSchema.tenantNamespace || '_tenant'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingSchemaId(currentSchema.id);
                        setActiveTab('create_schema');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold rounded transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                      title="Open in Dedicated Schema Editor"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Schema Editor</span>
                    </button>
                    <button
                      onClick={() => setViewingJsonSchema(currentSchema)}
                      className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded border border-white/25 transition-colors flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                      title="Inspect JSON Schema"
                    >
                      <Code2 className="w-3.5 h-3.5 text-white" />
                      <span>JSON Schema</span>
                    </button>
                    <button
                      onClick={() => duplicateSchema(currentSchema.id)}
                      className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded border border-white/25 transition-colors cursor-pointer"
                      title="Duplicate Schema"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSchema(currentSchema.id)}
                      className="p-1.5 bg-white/15 hover:bg-white/25 text-white hover:text-sky-200 rounded border border-white/25 hover:border-white/40 transition-colors cursor-pointer"
                      title="Delete Schema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Schema Metric Pills */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#F8F9FA] p-2 rounded border border-[#E1E5EA]">
                    <div className="text-[10px] text-[#6E6E6E] uppercase font-semibold">Total Fields</div>
                    <div className="text-base font-bold text-[#2C2C2C]">{currentSchema.fields.length}</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2 rounded border border-[#E1E5EA]">
                    <div className="text-[10px] text-[#0D66D0] uppercase font-semibold">Identity Keys</div>
                    <div className="text-base font-bold text-[#2C2C2C]">{identityFieldsCount}</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2 rounded border border-[#E1E5EA]">
                    <div className="text-[10px] text-[#0A3D82] uppercase font-semibold">Sensitive PII</div>
                    <div className="text-base font-bold text-[#2C2C2C]">{sensitiveFieldsCount}</div>
                  </div>
                  <div className="bg-[#F8F9FA] p-2 rounded border border-[#E1E5EA]">
                    <div className="text-[10px] text-[#0284C7] uppercase font-semibold">Field Groups</div>
                    <div className="text-base font-bold text-[#2C2C2C]">{currentSchema.fieldGroups?.length || 2}</div>
                  </div>
                </div>
              </div>

              {/* Fields Table Container */}
              <div className="bg-[#FFFFFF] rounded-md border border-[#E1E5EA] shadow-2xs overflow-hidden space-y-3 p-3.5">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[#E1E5EA]">
                  <div className="flex items-center space-x-2 flex-1 max-w-md">
                    <div className="relative w-full">
                      <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search attributes by name, type, or description..."
                        className="w-full pl-8 pr-3 py-1 bg-[#FFFFFF] border border-[#D5D5D5] rounded text-xs text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                      />
                    </div>

                    <select
                      value={selectedClassificationFilter}
                      onChange={(e) => setSelectedClassificationFilter(e.target.value)}
                      className="bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2 py-1 text-xs font-medium text-[#4B4B4B] focus:outline-none focus:border-[#1473E6]"
                    >
                      <option value="ALL">All DULE Classes</option>
                      <option value="Standard">Standard</option>
                      <option value="Sensitive">Sensitive</option>
                      <option value="Financial">Financial</option>
                      <option value="Health">Health</option>
                      <option value="Behavioral">Behavioral</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setIsAddFieldModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-medium px-3 py-1.5 rounded transition-colors shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Attribute</span>
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E5EA] bg-[#F8F9FA] text-[10px] font-semibold uppercase text-[#6E6E6E] tracking-wider">
                        <th className="py-2 px-3">Field Name</th>
                        <th className="py-2 px-3">Data Type</th>
                        <th className="py-2 px-3">Identity Role</th>
                        <th className="py-2 px-3">DULE Classification</th>
                        <th className="py-2 px-3">Ad Network Policy</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EA] font-medium">
                      {filteredFields.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#888888]">
                            No attributes matching current filter query.
                          </td>
                        </tr>
                      ) : (
                        filteredFields.map(field => (
                          <tr key={field.id} className="hover:bg-[#F9FAFB] transition-colors">
                            {/* Name & Desc */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-semibold text-[#2C2C2C]">{field.name}</span>
                                {field.isRequired && (
                                  <span className="text-[9px] font-semibold bg-[#E0F2FE] text-[#0369A1] px-1 py-0.2 rounded border border-[#BAE6FD]">
                                    REQ
                                  </span>
                                )}
                              </div>
                              {field.description && (
                                <p className="text-[11px] text-[#6E6E6E] mt-0.5 line-clamp-1">{field.description}</p>
                              )}
                            </td>

                            {/* Type */}
                            <td className="py-2.5 px-3 font-mono text-[#6E6E6E] text-xs">
                              {field.dataType}
                            </td>

                            {/* Identity */}
                            <td className="py-2.5 px-3">
                              {field.isIdentifier ? (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-[#EBF3FC] border border-[#C5DCFA] text-[#0D66D0] font-semibold text-[10px]">
                                  <Key className="w-3 h-3" />
                                  <span>{field.identifierType?.toUpperCase() || 'ID'}</span>
                                </span>
                              ) : (
                                <span className="text-[#888888] text-xs">-</span>
                              )}
                            </td>

                            {/* DULE */}
                            <td className="py-2.5 px-3">
                              <DULEBadge classification={field.classification} />
                            </td>

                            {/* Ad Policy */}
                            <td className="py-2.5 px-3">
                              {field.isSensitive ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-[#0A3D82] bg-[#EFF6FF] px-1.5 py-0.2 rounded border border-[#BFDBFE]">
                                  <Lock className="w-3 h-3" />
                                  <span>Blocked in Ads</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-[#4B4B4B]">
                                  <Check className="w-3 h-3 text-[#0284C7]" />
                                  <span>Syndication Allowed</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => toggleFieldSensitivity(currentSchema.id, field.id)}
                                  className={`p-1 rounded text-xs font-medium transition-colors border ${
                                    field.isSensitive
                                      ? 'bg-[#EFF6FF] text-[#0A3D82] border-[#BFDBFE] hover:bg-[#DBEAFE]'
                                      : 'bg-[#FFFFFF] text-[#0D66D0] border-[#D5D5D5] hover:bg-[#EBF3FC]'
                                  }`}
                                  title={field.isSensitive ? 'Mark Standard' : 'Mark Sensitive PII (DULE)'}
                                >
                                  {field.isSensitive ? <EyeOff className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => deleteSchemaField(currentSchema.id, field.id)}
                                  className="p-1 rounded text-[#888888] hover:text-[#0A3D82] hover:bg-[#EFF6FF] border border-transparent hover:border-[#BFDBFE] transition-colors"
                                  title="Delete Field"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Schema Field Modal */}
      {isAddFieldModalOpen && currentSchema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-md shadow-xl border border-[#E1E5EA] w-full max-w-lg overflow-hidden text-[#2C2C2C]">
            <div className="px-5 py-3.5 bg-[#F8F9FA] border-b border-[#E1E5EA] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-[#1473E6] text-white flex items-center justify-center shadow-2xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2C] text-xs">Add Field to {currentSchema.name}</h3>
                  <p className="text-[10px] text-[#6E6E6E] font-mono">XDM Tenant Attribute</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddFieldModalOpen(false)}
                className="w-6 h-6 rounded bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#6E6E6E] border border-[#E1E5EA] flex items-center justify-center text-xs"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateField} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Field Name (camelCase) *</label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  required
                  placeholder="e.g. churnProbabilityScore"
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Data Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs font-medium text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="timestamp">timestamp</option>
                    <option value="array">array</option>
                    <option value="object">object</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">DULE Classification</label>
                  <select
                    value={newFieldClassification}
                    onChange={(e) => setNewFieldClassification(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs font-medium text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Sensitive">Sensitive (PII)</option>
                    <option value="Financial">Financial</option>
                    <option value="Health">Health</option>
                    <option value="Behavioral">Behavioral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">Description</label>
                <input
                  type="text"
                  value={newFieldDesc}
                  onChange={(e) => setNewFieldDesc(e.target.value)}
                  placeholder="Attribute business definition and usage"
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                />
              </div>

              {/* Identity & Policy Options */}
              <div className="space-y-2 pt-2 border-t border-[#E1E5EA] text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIdentifier}
                    onChange={(e) => setIsIdentifier(e.target.checked)}
                    className="rounded text-[#1473E6] focus:ring-[#1473E6]"
                  />
                  <span className="font-semibold text-[#2C2C2C]">Identity Resolution Key</span>
                </label>

                {isIdentifier && (
                  <div className="pl-5 pt-1">
                    <label className="block text-[11px] font-semibold text-[#6E6E6E] mb-1">Identity Namespace</label>
                    <select
                      value={identifierType}
                      onChange={(e) => setIdentifierType(e.target.value as any)}
                      className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-2.5 py-1 text-xs font-semibold text-[#0D66D0]"
                    >
                      <option value="crmId">CRM ID / GUID</option>
                      <option value="email">Email Address</option>
                      <option value="phone">Telephone (E.164)</option>
                      <option value="cookie">1st-Party Cookie ECID</option>
                      <option value="device">Mobile Device Token</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="rounded text-[#1473E6] focus:ring-[#1473E6]"
                  />
                  <span className="text-[#4B4B4B]">Required Schema Attribute</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-[#0A3D82] font-semibold">
                  <input
                    type="checkbox"
                    checked={isSensitive}
                    onChange={(e) => setIsSensitive(e.target.checked)}
                    className="rounded text-[#1473E6] focus:ring-[#1473E6]"
                  />
                  <span>Sensitive PII (Auto-Mask & Block in Ad Networks)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E1E5EA] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFieldModalOpen(false)}
                  className="px-3.5 py-1.5 rounded text-xs font-medium text-[#4B4B4B] hover:bg-[#F2F4F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium shadow-2xs"
                >
                  Save Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Schema Modal */}
      <CreateSchemaModal
        isOpen={isCreateSchemaModalOpen}
        onClose={() => setIsCreateSchemaModalOpen(false)}
        onCreated={(schemaId) => {
          setSelectedSchemaId(schemaId);
        }}
      />

      {/* JSON Schema Viewer Modal */}
      <JsonSchemaViewerModal
        schema={viewingJsonSchema}
        isOpen={!!viewingJsonSchema}
        onClose={() => setViewingJsonSchema(null)}
      />
    </div>
  );
};

