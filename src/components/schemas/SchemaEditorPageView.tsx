import React, { useState, useEffect, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { SchemaDefinition, SchemaField, PrivacyClassification } from '../../types/cdp';
import {
  STANDARD_FIELD_GROUPS,
  FieldGroupTemplate,
  XDM_CLASSES,
  XdmClassDefinition
} from '../../data/fieldGroupsLibrary';
import {
  Database,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  Shield,
  Key,
  Layers,
  Search,
  Filter,
  Code2,
  Copy,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  X,
  ExternalLink,
  Zap,
  Eye,
  FileCode,
  Tag,
  Radio,
  Clock,
  Hash,
  Type,
  ToggleLeft,
  Brackets,
  FolderTree,
  AlertCircle
} from 'lucide-react';

interface SchemaEditorPageViewProps {
  onBack?: () => void;
}

export const SchemaEditorPageView: React.FC<SchemaEditorPageViewProps> = ({ onBack }) => {
  const {
    schemas,
    createSchema,
    updateSchema,
    datasets,
    editingSchemaId,
    setEditingSchemaId,
    setActiveTab,
    setIsSidebarCollapsed,
    addTerminalLog,
    ingestEvent,
  } = useCDP();

  // Auto-minimize the left-side menu panel when arriving on this dedicated schema builder page
  useEffect(() => {
    setIsSidebarCollapsed(true);
  }, [setIsSidebarCollapsed]);

  // Existing schema to edit if editingSchemaId is set
  const existingSchema = useMemo(() => {
    if (!editingSchemaId) return null;
    return schemas.find(s => s.id === editingSchemaId) || null;
  }, [editingSchemaId, schemas]);

  // Schema General Metadata
  const [schemaName, setSchemaName] = useState<string>(
    existingSchema ? existingSchema.name : 'Customer Profile Schema'
  );
  const [schemaDescription, setSchemaDescription] = useState<string>(
    existingSchema ? existingSchema.description : 'Canonical omnichannel individual profile model with deterministic identity stitching.'
  );
  const [selectedClassId, setSelectedClassId] = useState<XdmClassDefinition['id']>(
    existingSchema ? existingSchema.category : 'Profile'
  );
  const [version, setVersion] = useState<string>(
    existingSchema ? existingSchema.version : '1.0.0'
  );
  const [tenantNamespace, setTenantNamespace] = useState<string>(
    existingSchema ? existingSchema.tenantNamespace || '_tenant' : '_tenant'
  );
  const [isProfileEnabled, setIsProfileEnabled] = useState<boolean>(
    existingSchema ? existingSchema.status === 'Enabled for Profile' : true
  );

  // Attached Field Groups
  const [attachedGroupIds, setAttachedGroupIds] = useState<string[]>(() => {
    if (existingSchema?.fieldGroups && existingSchema.fieldGroups.length > 0) {
      return existingSchema.fieldGroups;
    }
    // Default standard field groups for profile
    return ['fg_demographic_details', 'fg_personal_contact_details', 'fg_identity_descriptors'];
  });

  // Working fields list
  const [fields, setFields] = useState<SchemaField[]>(() => {
    if (existingSchema && existingSchema.fields.length > 0) {
      return existingSchema.fields;
    }
    // Pre-populate with fields from default attached groups
    const defaultFields: SchemaField[] = [];
    const initialGroups = STANDARD_FIELD_GROUPS.filter(g =>
      ['fg_demographic_details', 'fg_personal_contact_details', 'fg_identity_descriptors'].includes(g.id)
    );
    initialGroups.forEach(g => {
      g.fields.forEach(f => {
        defaultFields.push({
          ...f,
          id: 'f_' + Math.random().toString(36).substring(2, 9),
        });
      });
    });
    return defaultFields;
  });

  // Selection in Structure Canvas (null means root schema selected)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Search & Filters in Structure Canvas
  const [structureSearchQuery, setStructureSearchQuery] = useState('');
  const [structureFilter, setStructureFilter] = useState<'ALL' | 'IDENTITIES' | 'REQUIRED' | 'DULE'>('ALL');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    person: true,
    personalEmail: true,
    postalAddress: true,
    loyalty: true,
    commerce: true,
    web: true,
    b2b: true,
    consents: true,
  });

  // Modals & Drawers
  const [isAddFieldGroupsModalOpen, setIsAddFieldGroupsModalOpen] = useState(false);
  const [isClassSelectorModalOpen, setIsClassSelectorModalOpen] = useState(false);
  const [isJsonSchemaModalOpen, setIsJsonSchemaModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdSchemaResult, setCreatedSchemaResult] = useState<SchemaDefinition | null>(null);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);

  // Quick Ingestion Test State inside Success Dialog
  const [testEventStatus, setTestEventStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [testEventResult, setTestEventResult] = useState<any>(null);

  // Active current class object
  const currentClass = useMemo(() => {
    return XDM_CLASSES.find(c => c.id === selectedClassId) || XDM_CLASSES[0];
  }, [selectedClassId]);

  // Selected field object
  const selectedField = useMemo(() => {
    if (!selectedFieldId) return null;
    return fields.find(f => f.id === selectedFieldId) || null;
  }, [selectedFieldId, fields]);

  // Identity fields list
  const identityFields = useMemo(() => {
    return fields.filter(f => f.isIdentifier);
  }, [fields]);

  // Field tree parsing (hierarchical grouping by dot notation e.g. person.name.firstName)
  interface TreeNode {
    key: string;
    label: string;
    fullPath: string;
    isLeaf: boolean;
    field?: SchemaField;
    children: TreeNode[];
  }

  const fieldTree = useMemo(() => {
    const rootNodes: TreeNode[] = [];

    // Filter fields based on search & filter
    const visibleFields = fields.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(structureSearchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(structureSearchQuery.toLowerCase()) ||
        f.dataType.toLowerCase().includes(structureSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (structureFilter === 'IDENTITIES') return f.isIdentifier;
      if (structureFilter === 'REQUIRED') return f.isRequired;
      if (structureFilter === 'DULE') return f.privacyLabels && f.privacyLabels.length > 0;
      return true;
    });

    visibleFields.forEach(field => {
      const parts = field.name.split('.');
      let currentLevel = rootNodes;

      parts.forEach((part, index) => {
        const isLeaf = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('.');
        let existingNode = currentLevel.find(n => n.label === part);

        if (!existingNode) {
          existingNode = {
            key: currentPath,
            label: part,
            fullPath: currentPath,
            isLeaf,
            field: isLeaf ? field : undefined,
            children: []
          };
          currentLevel.push(existingNode);
        } else if (isLeaf) {
          existingNode.isLeaf = true;
          existingNode.field = field;
        }

        currentLevel = existingNode.children;
      });
    });

    return rootNodes;
  }, [fields, structureSearchQuery, structureFilter]);

  const toggleNodeExpansion = (nodeKey: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  const handleSelectField = (field: SchemaField) => {
    setSelectedFieldId(field.id);
  };

  const handleUpdateSelectedField = (updates: Partial<SchemaField>) => {
    if (!selectedFieldId) return;
    setFields(prev => prev.map(f => (f.id === selectedFieldId ? { ...f, ...updates } : f)));
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  // Add field group template
  const handleToggleFieldGroup = (group: FieldGroupTemplate) => {
    const isAlreadyAttached = attachedGroupIds.includes(group.id);

    if (isAlreadyAttached) {
      // Remove group
      setAttachedGroupIds(prev => prev.filter(id => id !== group.id));
      const groupFieldNames = new Set(group.fields.map(f => f.name));
      setFields(prev => prev.filter(f => !groupFieldNames.has(f.name)));
      if (selectedField && group.fields.some(f => f.name === selectedField.name)) {
        setSelectedFieldId(null);
      }
    } else {
      // Add group
      setAttachedGroupIds(prev => [...prev, group.id]);
      const newFieldsToAdd: SchemaField[] = [];
      const currentFieldNames = new Set(fields.map(f => f.name));

      group.fields.forEach(f => {
        if (!currentFieldNames.has(f.name)) {
          newFieldsToAdd.push({
            ...f,
            id: 'f_' + Math.random().toString(36).substring(2, 9),
          });
        }
      });

      setFields(prev => [...prev, ...newFieldsToAdd]);
      addTerminalLog('info', 'SCHEMA-COMPOSITION', `Attached field group [${group.name}] (+${newFieldsToAdd.length} attributes)`);
    }
  };

  // Add custom attribute
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomType, setNewCustomType] = useState<SchemaField['dataType']>('string');
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomIsId, setNewCustomIsId] = useState(false);
  const [newCustomIdType, setNewCustomIdType] = useState<SchemaField['identifierType']>('crmId');
  const [newCustomRequired, setNewCustomRequired] = useState(false);
  const [customFieldError, setCustomFieldError] = useState<string | null>(null);
  const [schemaNotice, setSchemaNotice] = useState<string | null>(null);
  const [jsonCopied, setJsonCopied] = useState(false);

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim()) return;
    setCustomFieldError(null);

    const formatted = newCustomName.trim().replace(/[^a-zA-Z0-9_.]/g, '');
    if (fields.some(f => f.name.toLowerCase() === formatted.toLowerCase())) {
      setCustomFieldError(`Field "${formatted}" already exists in this schema.`);
      return;
    }

    const created: SchemaField = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: formatted,
      dataType: newCustomType,
      description: newCustomDesc || `${formatted} attribute`,
      classification: 'Standard',
      isIdentifier: newCustomIsId,
      identifierType: newCustomIsId ? newCustomIdType : undefined,
      isRequired: newCustomRequired,
      isSensitive: false,
    };

    setFields(prev => [...prev, created]);
    setSelectedFieldId(created.id);
    setNewCustomName('');
    setNewCustomDesc('');
    setNewCustomIsId(false);
    setNewCustomRequired(false);
    setCustomFieldError(null);
    setIsCustomFieldModalOpen(false);
  };

  // Save / Publish Schema
  const handleSaveSchema = () => {
    setSchemaNotice(null);
    if (!schemaName.trim()) {
      setSchemaNotice('Please specify a valid schema name.');
      return;
    }

    if (fields.length === 0) {
      setSchemaNotice('A schema must contain at least one field before publishing.');
      return;
    }

    const schemaPayload: Omit<SchemaDefinition, 'id' | 'createdDate' | 'lastUpdated'> = {
      name: schemaName.trim(),
      version: version.trim() || '1.0.0',
      category: selectedClassId,
      description: schemaDescription.trim(),
      baseClass: currentClass.baseUri,
      fieldGroups: attachedGroupIds,
      tenantNamespace: tenantNamespace.trim() || '_tenant',
      status: isProfileEnabled ? 'Enabled for Profile' : 'Draft',
      fields,
    };

    let resultSchema: SchemaDefinition;

    if (existingSchema) {
      updateSchema(existingSchema.id, schemaPayload);
      resultSchema = {
        ...existingSchema,
        ...schemaPayload,
        lastUpdated: new Date().toISOString()
      };
      addTerminalLog('success', 'SCHEMA-PUBLISH', `Updated XDM Schema [${resultSchema.name}] in real-time registry.`);
    } else {
      resultSchema = createSchema(schemaPayload);
    }

    setCreatedSchemaResult(resultSchema);
    setIsSuccessModalOpen(true);
  };

  // Generate JSON Schema representation
  const jsonSchemaRepresentation = useMemo(() => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    fields.forEach(f => {
      if (f.isRequired) required.push(f.name);
      properties[f.name] = {
        title: f.name,
        description: f.description,
        type: f.dataType === 'timestamp' ? 'string' : f.dataType,
        format: f.dataType === 'timestamp' ? 'date-time' : undefined,
        'meta:xdmField': true,
        'meta:isIdentifier': f.isIdentifier,
        'meta:identifierType': f.identifierType,
        'meta:classification': f.classification,
        'meta:duleLabels': f.privacyLabels || []
      };
    });

    return {
      $id: `https://ns.xprplatform.com/schemas/${schemaName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      $schema: 'http://json-schema.org/draft-06/schema#',
      title: schemaName,
      type: 'object',
      version,
      description: schemaDescription,
      'meta:baseClass': currentClass.baseUri,
      'meta:tenantNamespace': tenantNamespace,
      'meta:status': isProfileEnabled ? 'Enabled for Real-Time Customer Profile' : 'Draft',
      'meta:fieldGroups': attachedGroupIds,
      required: required.length > 0 ? required : undefined,
      properties
    };
  }, [fields, schemaName, version, schemaDescription, currentClass, tenantNamespace, isProfileEnabled, attachedGroupIds]);

  // Execute Real-Time Simulated Ingestion Test
  const handleExecuteLiveTestIngest = async () => {
    setTestEventStatus('testing');
    try {
      const samplePayload: Record<string, any> = {
        eventType: selectedClassId === 'ExperienceEvent' ? 'PageView' : 'ProfileSync',
        timestamp: new Date().toISOString(),
      };

      // Populate sample fields
      fields.slice(0, 8).forEach(f => {
        if (f.name === 'email' || f.name.includes('Email')) {
          samplePayload[f.name] = 'sarah.connor@cyberdyne.org';
        } else if (f.name === 'phone' || f.name.includes('Phone')) {
          samplePayload[f.name] = '+14155552671';
        } else if (f.name === 'profileId' || f.name.includes('Id')) {
          samplePayload[f.name] = 'CRM_LIVE_99214';
        } else if (f.dataType === 'number') {
          samplePayload[f.name] = 1250;
        } else if (f.dataType === 'boolean') {
          samplePayload[f.name] = true;
        } else {
          samplePayload[f.name] = 'Live Sample Value';
        }
      });

      // Call ingestEvent in context
      const res = ingestEvent(samplePayload);
      setTestEventResult(res);
      setTestEventStatus('success');
      addTerminalLog('success', 'SCHEMA-REALTIME', `Real-time test event verified against schema [${schemaName}]. Ingestion latency: 0.9ms.`);
    } catch (e: any) {
      setTestEventStatus('idle');
      setSchemaNotice(`Test ingestion failed: ${e.message}`);
    }
  };

  const getDataTypeIcon = (type: SchemaField['dataType']) => {
    switch (type) {
      case 'string':
        return <Type className="w-3.5 h-3.5 text-[#1473E6]" />;
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-[#0E7A36]" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-[#7024C4]" />;
      case 'timestamp':
        return <Clock className="w-3.5 h-3.5 text-[#D97706]" />;
      case 'array':
        return <Brackets className="w-3.5 h-3.5 text-[#0284C7]" />;
      case 'object':
      default:
        return <FolderTree className="w-3.5 h-3.5 text-[#4B4B4B]" />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FFFFFF] text-[#2C2C2C] overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR                                                         */}
      {/* ========================================================================= */}
      <header className="h-[56px] bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left Section: Back, Title & Class */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => {
              setEditingSchemaId(null);
              if (onBack) onBack();
              else setActiveTab('schemas');
            }}
            className="flex items-center space-x-1.5 text-xs font-medium text-white bg-white/15 hover:bg-white/25 border border-white/25 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
            title="Return to Schemas Registry"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Schemas</span>
          </button>

          <div className="h-4 w-px bg-white/25" />

          <div className="w-7 h-7 rounded bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>

          {/* Editable Schema Display Name */}
          <div className="flex items-center space-x-2 min-w-0">
            <input
              type="text"
              value={schemaName}
              onChange={e => setSchemaName(e.target.value)}
              placeholder="Schema Name"
              className="text-sm font-bold text-white placeholder-blue-200 bg-white/10 hover:bg-white/20 focus:bg-white focus:text-[#1E2229] px-2.5 py-1 rounded border border-white/20 focus:border-white outline-none max-w-xs md:max-w-md truncate transition-colors"
            />

            {/* Class Pill */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border hidden md:inline-flex items-center space-x-1 bg-white/15 text-white border-white/25">
              <span>{currentClass.name}</span>
            </span>

            {/* Profile Status Indicator */}
            {isProfileEnabled ? (
              <span className="text-[10px] font-medium text-[#8CE2A7] bg-white/15 border border-[#8CE2A7]/40 px-2 py-0.5 rounded flex items-center space-x-1 hidden lg:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CE2A7] animate-pulse" />
                <span>Profile Enabled</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium text-blue-100 bg-white/15 border border-white/25 px-2 py-0.5 rounded hidden lg:inline-flex">
                Draft
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Metadata & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden xl:flex items-center space-x-2 text-xs text-blue-100 pr-2">
            <span>{attachedGroupIds.length} Field groups</span>
            <span aria-hidden="true">·</span>
            <span>{fields.length} Attributes</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-white">v{version}</span>
          </div>

          <button
            onClick={() => setIsJsonSchemaModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded transition-colors shadow-2xs cursor-pointer"
            title="Inspect XDM JSON Schema Draft"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-100" />
            <span className="hidden sm:inline">JSON Schema</span>
          </button>

          <button
            onClick={() => {
              setEditingSchemaId(null);
              if (onBack) onBack();
              else setActiveTab('schemas');
            }}
            className="px-3 py-1.5 text-xs font-medium text-blue-100 hover:text-white hover:bg-white/15 rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveSchema}
            disabled={fields.length === 0 || !schemaName.trim()}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-[#0D66D0] bg-white hover:bg-[#F2F4F7] disabled:bg-white/40 disabled:text-blue-950/60 disabled:cursor-not-allowed rounded shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Schema</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THREE-PANEL ENTERPRISE XDM SCHEMA WORKSPACE                            */}
      {/* ========================================================================= */}
      {schemaNotice && (
        <div className="px-4 py-2 bg-[#FFEBEB] border-b border-[#FFCCD0] text-xs text-[#D7373F] flex items-center justify-between">
          <span>{schemaNotice}</span>
          <button onClick={() => setSchemaNotice(null)} className="font-bold">✕</button>
        </div>
      )}
      <div className="flex-1 flex overflow-hidden bg-[#F2F4F7]">
        {/* ======================================================================= */}
        {/* PANEL 1: COMPOSITION (Left Rail, 280px)                                 */}
        {/* ======================================================================= */}
        <div className="w-72 bg-[#FAFAFA] border-r border-[#E1E5EA] flex flex-col shrink-0 overflow-y-auto">
          {/* Rail Header */}
          <div className="p-3.5 border-b border-[#E1E5EA] bg-[#FFFFFF] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">Composition</h2>
              <p className="text-[11px] text-[#6E6E6E]">Building blocks of your schema</p>
            </div>
            <button
              onClick={() => setSelectedFieldId(null)}
              className="text-[11px] text-[#1473E6] hover:underline font-medium"
            >
              Schema info
            </button>
          </div>

          <div className="p-3 space-y-4">
            {/* Section 1: Class */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#4B4B4B] uppercase tracking-wide">Class</span>
                <button
                  onClick={() => setIsClassSelectorModalOpen(true)}
                  className="text-[11px] font-medium text-[#1473E6] hover:text-[#0D66D0]"
                >
                  Change
                </button>
              </div>

              <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1E2229]">{currentClass.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#6E6E6E] border border-[#E1E5EA]">
                    {currentClass.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6E6E] leading-relaxed">
                  {currentClass.description}
                </p>
              </div>
            </div>

            {/* Section 2: Field Groups */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-semibold text-[#4B4B4B] uppercase tracking-wide">Field groups</span>
                  <span className="text-[10px] font-mono text-[#6E6E6E] bg-[#E1E5EA] px-1.5 py-0.2 rounded font-bold">
                    {attachedGroupIds.length}
                  </span>
                </div>

                <button
                  onClick={() => setIsAddFieldGroupsModalOpen(true)}
                  className="text-xs font-semibold text-[#1473E6] hover:text-[#0D66D0] flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* List of Attached Field Groups */}
              <div className="space-y-1.5">
                {attachedGroupIds.map(groupId => {
                  const group = STANDARD_FIELD_GROUPS.find(g => g.id === groupId);
                  if (!group) return null;

                  return (
                    <div
                      key={group.id}
                      className="p-2.5 bg-[#FFFFFF] rounded border border-[#E1E5EA] hover:border-[#C5DCFA] shadow-2xs group flex items-start justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <Layers className="w-3 h-3 text-[#1473E6] shrink-0" />
                          <h4 className="text-xs font-semibold text-[#1E2229] truncate">{group.name}</h4>
                        </div>
                        <p className="text-[10px] text-[#6E6E6E] line-clamp-1 mt-0.5">{group.category} · {group.fields.length} attributes</p>
                      </div>

                      <button
                        onClick={() => handleToggleFieldGroup(group)}
                        title="Remove field group from schema"
                        className="text-[#888888] hover:text-[#DC2626] p-1 rounded hover:bg-[#FFEBEB] transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => setIsAddFieldGroupsModalOpen(true)}
                  className="w-full py-2 border border-dashed border-[#C5DCFA] hover:border-[#1473E6] bg-[#FFFFFF] hover:bg-[#EBF3FC] text-[#1473E6] rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field Groups</span>
                </button>
              </div>
            </div>

            {/* Section 3: Identities Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#4B4B4B] uppercase tracking-wide">Identities</span>
                <span className="text-[10px] font-mono text-[#6E6E6E] bg-[#E1E5EA] px-1.5 py-0.2 rounded font-bold">
                  {identityFields.length}
                </span>
              </div>

              <div className="p-2.5 bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs space-y-1.5">
                {identityFields.length === 0 ? (
                  <p className="text-[11px] text-[#888888] italic">No identity keys defined in this schema.</p>
                ) : (
                  identityFields.map(idField => (
                    <div
                      key={idField.id}
                      onClick={() => handleSelectField(idField)}
                      className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-[#F2F4F7] cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <Key className="w-3 h-3 text-[#1473E6] shrink-0" />
                        <span className="font-mono text-[11px] text-[#1E2229] truncate">{idField.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-[#0D66D0] bg-[#EBF3FC] px-1.5 py-0.2 rounded border border-[#C5DCFA] shrink-0">
                        {idField.identifierType || 'CRM'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 4: Real-Time Customer Profile Toggle */}
            <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E2229]">Real-Time Profile</span>
                <button
                  type="button"
                  onClick={() => setIsProfileEnabled(!isProfileEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isProfileEnabled ? 'bg-[#1473E6]' : 'bg-[#D5D5D5]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isProfileEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-[#6E6E6E] leading-relaxed">
                When enabled, streaming datasets mapped to this schema will stitch into the real-time unified customer graph.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* PANEL 2: STRUCTURE (Center Canvas Hierarchical Tree)                    */}
        {/* ======================================================================= */}
        <div className="flex-1 bg-[#FFFFFF] flex flex-col min-w-0 border-r border-[#E1E5EA]">
          {/* Structure Toolbar */}
          <div className="h-11 px-4 border-b border-[#E1E5EA] flex items-center justify-between gap-3 bg-[#FFFFFF] shrink-0">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={structureSearchQuery}
                  onChange={e => setStructureSearchQuery(e.target.value)}
                  placeholder="Search schema fields..."
                  className="w-full pl-8 pr-3 py-1 bg-[#F8F9FA] hover:bg-[#FFFFFF] focus:bg-[#FFFFFF] text-xs text-[#1E2229] border border-[#E1E5EA] focus:border-[#1473E6] rounded outline-none transition-colors"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="hidden md:flex items-center space-x-1 text-xs">
              <button
                onClick={() => setStructureFilter('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  structureFilter === 'ALL'
                    ? 'bg-[#1473E6] text-white shadow-2xs'
                    : 'text-[#4B4B4B] hover:bg-[#F2F4F7]'
                }`}
              >
                All Fields ({fields.length})
              </button>
              <button
                onClick={() => setStructureFilter('IDENTITIES')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1 ${
                  structureFilter === 'IDENTITIES'
                    ? 'bg-[#1473E6] text-white shadow-2xs'
                    : 'text-[#4B4B4B] hover:bg-[#F2F4F7]'
                }`}
              >
                <Key className="w-3 h-3" />
                <span>Identities ({identityFields.length})</span>
              </button>
              <button
                onClick={() => setStructureFilter('REQUIRED')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  structureFilter === 'REQUIRED'
                    ? 'bg-[#1473E6] text-white shadow-2xs'
                    : 'text-[#4B4B4B] hover:bg-[#F2F4F7]'
                }`}
              >
                Required ({fields.filter(f => f.isRequired).length})
              </button>
              <button
                onClick={() => setStructureFilter('DULE')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1 ${
                  structureFilter === 'DULE'
                    ? 'bg-[#1473E6] text-white shadow-2xs'
                    : 'text-[#4B4B4B] hover:bg-[#F2F4F7]'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>DULE ({fields.filter(f => f.privacyLabels && f.privacyLabels.length > 0).length})</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCustomFieldModalOpen(true)}
                className="px-3 py-1 bg-[#FFFFFF] hover:bg-[#EBF3FC] text-[#1473E6] border border-[#1473E6] text-xs font-semibold rounded flex items-center space-x-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add field</span>
              </button>
            </div>
          </div>

          {/* Hierarchical Structure Canvas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Root Schema Node */}
            <div
              onClick={() => setSelectedFieldId(null)}
              className={`p-2.5 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                selectedFieldId === null
                  ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6] shadow-2xs'
                  : 'bg-[#F8F9FA] border-[#E1E5EA] hover:border-[#C5DCFA]'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-6 h-6 rounded bg-[#1473E6] text-white flex items-center justify-center shrink-0">
                  <Database className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#1E2229] truncate">{schemaName}</span>
                    <span className="text-[10px] font-mono text-[#6E6E6E] bg-[#FFFFFF] px-1.5 py-0.2 rounded border border-[#E1E5EA]">
                      root object
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6E6E6E] truncate block">{currentClass.baseUri}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-[#6E6E6E]">{fields.length} attributes</span>
                <ChevronDown className="w-4 h-4 text-[#888888]" />
              </div>
            </div>

            {/* Tree Branch Guide Lines */}
            <div className="pl-4 pt-1 space-y-1 border-l-2 border-[#E1E5EA] ml-3.5">
              {fieldTree.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#888888]">
                  No attributes match the selected filter query.
                </div>
              ) : (
                fieldTree.map(node => renderTreeNode(node))
              )}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* PANEL 3: FIELD / SCHEMA PROPERTIES (Right Rail, 340px)                  */}
        {/* ======================================================================= */}
        <div className="w-80 bg-[#FAFAFA] flex flex-col shrink-0 overflow-y-auto">
          {selectedField ? (
            /* Selected Field Properties Panel */
            <div className="p-4 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA]">
                <div>
                  <h3 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">Field Properties</h3>
                  <p className="text-[11px] text-[#6E6E6E]">Configure attribute behavior & privacy</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                  {selectedField.dataType}
                </span>
              </div>

              {/* Field Name & Display Title */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Field Name (XDM Path)</label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={e => handleUpdateSelectedField({ name: e.target.value })}
                    className="w-full text-xs font-mono text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Data Type</label>
                  <select
                    value={selectedField.dataType}
                    onChange={e => handleUpdateSelectedField({ dataType: e.target.value as any })}
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none"
                  >
                    <option value="string">string (Text)</option>
                    <option value="number">number (Integer / Double)</option>
                    <option value="boolean">boolean (True / False)</option>
                    <option value="timestamp">timestamp (ISO 8601 Date & Time)</option>
                    <option value="object">object (Nested Container)</option>
                    <option value="array">array (Repeated Elements)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={selectedField.description}
                    onChange={e => handleUpdateSelectedField({ description: e.target.value })}
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none"
                  />
                </div>

                {/* Required Checkbox */}
                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={selectedField.isRequired}
                    onChange={e => handleUpdateSelectedField({ isRequired: e.target.checked })}
                    className="w-4 h-4 text-[#1473E6] rounded border-[#D5D5D5] focus:ring-0"
                  />
                  <span className="text-xs font-medium text-[#2C2C2C]">Required Field</span>
                </label>
              </div>

              {/* Identity Configuration Box */}
              <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span className="text-xs font-bold text-[#1E2229]">Identity Stitching</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedField.isIdentifier}
                    onChange={e => handleUpdateSelectedField({
                      isIdentifier: e.target.checked,
                      identifierType: e.target.checked ? (selectedField.identifierType || 'crmId') : undefined
                    })}
                    className="w-4 h-4 text-[#1473E6] rounded border-[#D5D5D5] focus:ring-0"
                  />
                </div>

                {selectedField.isIdentifier && (
                  <div className="space-y-2 pt-2 border-t border-[#F2F4F7]">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6E6E6E] uppercase mb-1">Identity Namespace</label>
                      <select
                        value={selectedField.identifierType || 'crmId'}
                        onChange={e => handleUpdateSelectedField({ identifierType: e.target.value as any })}
                        className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] rounded p-1.5 outline-none"
                      >
                        <option value="email">Email (Primary Deterministic)</option>
                        <option value="phone">Phone (E.164)</option>
                        <option value="cookie">ECID (Experience Cloud ID)</option>
                        <option value="crmId">CRM ID (Customer Primary Key)</option>
                        <option value="device">Device ID / IDFA / GAID</option>
                      </select>
                    </div>
                    <p className="text-[10px] text-[#6E6E6E]">
                      Enables real-time graph links between pseudonymous cookies and authenticated profiles.
                    </p>
                  </div>
                )}
              </div>

              {/* Data Governance & DULE Privacy Labels */}
              <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs space-y-3">
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#0E7A36]" />
                  <span className="text-xs font-bold text-[#1E2229]">Data Usage Labels (DULE)</span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#6E6E6E] uppercase mb-1">Privacy Classification</label>
                  <select
                    value={selectedField.classification}
                    onChange={e => handleUpdateSelectedField({ classification: e.target.value as PrivacyClassification })}
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] rounded p-1.5 outline-none"
                  >
                    <option value="Standard">Standard (General Public)</option>
                    <option value="Sensitive">Sensitive (Masking Required)</option>
                    <option value="Financial">Financial (PCI DSS / Monetary)</option>
                    <option value="Health">Health (HIPAA Directive)</option>
                    <option value="Behavioral">Behavioral (Digital Tracking)</option>
                  </select>
                </div>

                {/* Quick DULE Label Toggles */}
                <div>
                  <span className="block text-[10px] font-semibold text-[#6E6E6E] uppercase mb-1.5">Applied DULE Labels</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['C1', 'C2', 'I1', 'I2', 'S1', 'S2', 'S3', 'R1', 'R2'].map(code => {
                      const isApplied = (selectedField.privacyLabels || []).includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            const current = selectedField.privacyLabels || [];
                            const next = isApplied
                              ? current.filter(c => c !== code)
                              : [...current, code];
                            handleUpdateSelectedField({ privacyLabels: next });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                            isApplied
                              ? 'bg-[#1473E6] text-white border-[#1473E6]'
                              : 'bg-[#FFFFFF] text-[#6E6E6E] border-[#E1E5EA] hover:border-[#1473E6]'
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => handleDeleteField(selectedField.id)}
                  className="w-full py-2 bg-[#FFFFFF] hover:bg-[#FFEBEB] text-[#DC2626] border border-[#FFCCD0] rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Attribute</span>
                </button>
              </div>
            </div>
          ) : (
            /* Root Schema Properties Panel */
            <div className="p-4 space-y-5">
              <div className="pb-3 border-b border-[#E1E5EA]">
                <h3 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">Schema Properties</h3>
                <p className="text-[11px] text-[#6E6E6E]">Global settings for this Experience Data Model</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Display Name</label>
                  <input
                    type="text"
                    value={schemaName}
                    onChange={e => setSchemaName(e.target.value)}
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={schemaDescription}
                    onChange={e => setSchemaDescription(e.target.value)}
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Tenant Namespace</label>
                  <input
                    type="text"
                    value={tenantNamespace}
                    onChange={e => setTenantNamespace(e.target.value)}
                    className="w-full text-xs font-mono text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    className="w-full text-xs font-mono text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] focus:border-[#1473E6] rounded p-2 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold text-[#4B4B4B] uppercase tracking-wide">Base Class Contract</span>
                <div className="text-xs font-mono text-[#1473E6] bg-[#F8F9FA] p-2 rounded border border-[#E1E5EA] break-all">
                  {currentClass.baseUri}
                </div>
                <div className="flex items-center justify-between text-xs text-[#6E6E6E] pt-1">
                  <span>Class Category:</span>
                  <span className="font-semibold text-[#1E2229]">{currentClass.category}</span>
                </div>
              </div>

              <div className="p-3 bg-[#EBF3FC] rounded border border-[#C5DCFA] text-xs text-[#0D66D0] space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Real-Time Ingestion Ready</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#0D66D0]/90">
                  When saved, an authorized dataset will automatically bind to this schema and start ingesting edge events in sub-millisecond intervals.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: ADD FIELD GROUPS                                                */}
      {/* ========================================================================= */}
      {isAddFieldGroupsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] rounded-md shadow-2xl border border-[#E1E5EA] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#1473E6]" />
                <h3 className="font-bold text-sm text-[#1E2229]">Add Field Groups</h3>
              </div>
              <button
                onClick={() => setIsAddFieldGroupsModalOpen(false)}
                className="text-[#6E6E6E] hover:text-[#1E2229] p-1 rounded hover:bg-[#E1E5EA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-[#6E6E6E]">
                Select pre-configured modular field groups compatible with <strong className="text-[#1E2229]">{currentClass.name}</strong>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STANDARD_FIELD_GROUPS.filter(g => g.compatibleClasses.includes(selectedClassId)).map(group => {
                  const isAttached = attachedGroupIds.includes(group.id);

                  return (
                    <div
                      key={group.id}
                      onClick={() => handleToggleFieldGroup(group)}
                      className={`p-3.5 rounded border transition-all cursor-pointer flex flex-col justify-between ${
                        isAttached
                          ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                          : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#C5DCFA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#F2F4F7] text-[#4B4B4B] border border-[#E1E5EA]">
                            {group.category}
                          </span>
                          <span className="text-[10px] font-mono text-[#6E6E6E]">
                            {group.fields.length} attributes
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-[#1E2229] mb-1">{group.name}</h4>
                        <p className="text-[11px] text-[#6E6E6E] leading-snug line-clamp-2">{group.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#F2F4F7] flex items-center justify-between">
                        <span className="text-[10px] text-[#888888]">
                          {isAttached ? '✓ Currently Attached' : 'Click to attach'}
                        </span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                          isAttached ? 'bg-[#1473E6]' : 'border border-[#D5D5D5]'
                        }`}>
                          {isAttached && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-end">
              <button
                onClick={() => setIsAddFieldGroupsModalOpen(false)}
                className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: CHANGE CLASS                                                    */}
      {/* ========================================================================= */}
      {isClassSelectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-[#FFFFFF] rounded-md shadow-2xl border border-[#E1E5EA] w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="font-bold text-sm text-[#1E2229]">Select Schema Class</h3>
              <button onClick={() => setIsClassSelectorModalOpen(false)} className="text-[#6E6E6E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {XDM_CLASSES.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    setIsClassSelectorModalOpen(false);
                    addTerminalLog('info', 'SCHEMA-CLASS', `Assigned class [${cls.name}] to schema.`);
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    selectedClassId === cls.id
                      ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                      : 'bg-[#FFFFFF] border-[#E1E5EA] hover:border-[#C5DCFA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1E2229]">{cls.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#F2F4F7] text-[#6E6E6E]">
                      {cls.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E6E6E]">{cls.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: ADD CUSTOM ATTRIBUTE                                            */}
      {/* ========================================================================= */}
      {isCustomFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-[#FFFFFF] rounded-md shadow-2xl border border-[#E1E5EA] w-full max-w-md overflow-hidden">
            <form onSubmit={handleCreateCustomField}>
              <div className="p-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
                <h3 className="font-bold text-sm text-[#1E2229]">Add Custom Field</h3>
                <button type="button" onClick={() => setIsCustomFieldModalOpen(false)} className="text-[#6E6E6E]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {customFieldError && (
                  <div className="p-2.5 bg-[#FFEBEB] border border-[#FFCCD0] rounded text-xs text-[#D7373F]">
                    {customFieldError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Field Name (camelCase)</label>
                  <input
                    type="text"
                    required
                    value={newCustomName}
                    onChange={e => { setNewCustomName(e.target.value); setCustomFieldError(null); }}
                    placeholder="e.g. loyaltyPoints or _tenant.customScore"
                    className="w-full text-xs font-mono text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] rounded p-2 outline-none focus:border-[#1473E6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Data Type</label>
                  <select
                    value={newCustomType}
                    onChange={e => setNewCustomType(e.target.value as any)}
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] rounded p-2 outline-none"
                  >
                    <option value="string">string (Text)</option>
                    <option value="number">number (Numeric / Float)</option>
                    <option value="boolean">boolean (True / False)</option>
                    <option value="timestamp">timestamp (ISO 8601)</option>
                    <option value="array">array (List of values)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4B4B4B] mb-1">Description</label>
                  <input
                    type="text"
                    value={newCustomDesc}
                    onChange={e => setNewCustomDesc(e.target.value)}
                    placeholder="Brief description of field usage"
                    className="w-full text-xs text-[#1E2229] bg-[#FFFFFF] border border-[#E1E5EA] rounded p-2 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCustomIsId}
                      onChange={e => setNewCustomIsId(e.target.checked)}
                      className="w-4 h-4 text-[#1473E6] rounded"
                    />
                    <span className="text-xs text-[#2C2C2C]">Set as Identity Key</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCustomRequired}
                      onChange={e => setNewCustomRequired(e.target.checked)}
                      className="w-4 h-4 text-[#1473E6] rounded"
                    />
                    <span className="text-xs text-[#2C2C2C]">Required</span>
                  </label>
                </div>
              </div>

              <div className="p-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCustomFieldModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4B4B4B] hover:text-[#2C2C2C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded shadow-2xs"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: JSON SCHEMA INSPECTOR                                           */}
      {/* ========================================================================= */}
      {isJsonSchemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-[#FFFFFF] rounded-md shadow-2xl border border-[#E1E5EA] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-[#1473E6]" />
                <h3 className="font-bold text-sm text-[#1E2229]">XDM JSON Schema Specification</h3>
              </div>
              <button onClick={() => setIsJsonSchemaModalOpen(false)} className="text-[#6E6E6E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-[#121620]">
              <pre className="text-xs font-mono text-[#E2E8F0] leading-relaxed whitespace-pre overflow-x-auto">
                {JSON.stringify(jsonSchemaRepresentation, null, 2)}
              </pre>
            </div>

            <div className="p-3 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-between items-center">
              <span className="text-[11px] text-[#6E6E6E]">Draft-06 compliant schema definition</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(jsonSchemaRepresentation, null, 2));
                  setJsonCopied(true);
                  setTimeout(() => setJsonCopied(false), 2000);
                }}
                className="px-4 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#2C2C2C] text-xs font-semibold rounded shadow-2xs flex items-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{jsonCopied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: SCHEMA SAVED & REAL-TIME INGESTION ACTIVE                         */}
      {/* ========================================================================= */}
      {isSuccessModalOpen && createdSchemaResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in zoom-in-95 duration-150">
          <div className="bg-[#FFFFFF] rounded-lg shadow-2xl border border-[#E1E5EA] w-full max-w-lg overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#1E2229]">Schema Active in Real-Time Engine</h3>
                <p className="text-xs text-[#6E6E6E] mt-1">
                  Schema <strong className="text-[#1E2229]">{createdSchemaResult.name}</strong> was registered with {createdSchemaResult.fields.length} attributes.
                </p>
              </div>

              {/* Status Specs */}
              <div className="bg-[#F8F9FA] rounded-md border border-[#E1E5EA] p-3 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Class:</span>
                  <span className="font-semibold text-[#1E2229]">{createdSchemaResult.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Real-Time Profile Status:</span>
                  <span className="text-[#0E7A36] font-semibold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E7A36] inline-block" />
                    <span>Enabled for Stitching</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Linked Streaming Dataset:</span>
                  <span className="font-mono text-[#1473E6] font-semibold">{createdSchemaResult.name} Dataset</span>
                </div>
              </div>

              {/* Real-Time Event Test Widget */}
              <div className="p-3 bg-[#EBF3FC] rounded-md border border-[#C5DCFA] text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0D66D0]">Test Real-Time Event Ingestion</span>
                  <span className="text-[10px] font-mono text-[#0D66D0] bg-[#FFFFFF] px-1.5 py-0.2 rounded border border-[#C5DCFA]">
                    Edge Pipeline
                  </span>
                </div>

                <p className="text-[11px] text-[#0D66D0]/90">
                  Verify that the real-time event pipeline validates and accepts events conforming to this schema right now:
                </p>

                {testEventStatus === 'success' && testEventResult && (
                  <div className="p-2 bg-[#FFFFFF] rounded border border-[#B4F0C3] text-[11px] font-mono text-[#0E7A36] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E7A36]" />
                    <span className="truncate">Ingested in 0.9ms! Profile ID: {testEventResult.profileId}</span>
                  </div>
                )}

                <button
                  onClick={handleExecuteLiveTestIngest}
                  disabled={testEventStatus === 'testing'}
                  className="w-full py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{testEventStatus === 'testing' ? 'Ingesting...' : 'Dispatch Live Ingest Test'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-[#E1E5EA] bg-[#F8F9FA] flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('xdm_tester');
                }}
                className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#4B4B4B] border border-[#D5D5D5] text-xs font-semibold rounded"
              >
                Open in Live XDM Tester
              </button>

              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setEditingSchemaId(null);
                  if (onBack) onBack();
                  else setActiveTab('schemas');
                }}
                className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded shadow-2xs"
              >
                Return to Schemas Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render tree node
  function renderTreeNode(node: TreeNode, depth: number = 0): React.ReactNode {
    const isSelected = selectedFieldId === node.field?.id;
    const isExpanded = expandedNodes[node.key] !== false;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.key} className="space-y-1">
        <div
          onClick={() => {
            if (node.field) {
              handleSelectField(node.field);
            } else if (hasChildren) {
              toggleNodeExpansion(node.key);
            }
          }}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`py-1.5 pr-2.5 rounded transition-all cursor-pointer flex items-center justify-between text-xs group ${
            isSelected
              ? 'bg-[#EBF3FC] text-[#0D66D0] font-semibold border-l-2 border-[#1473E6]'
              : 'hover:bg-[#F2F4F7] text-[#2C2C2C]'
          }`}
        >
          <div className="flex items-center space-x-1.5 min-w-0">
            {/* Expansion chevron */}
            {hasChildren ? (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  toggleNodeExpansion(node.key);
                }}
                className="p-0.5 rounded hover:bg-[#E1E5EA] text-[#6E6E6E]"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {/* Type Icon */}
            {node.field ? (
              getDataTypeIcon(node.field.dataType)
            ) : (
              <FolderTree className="w-3.5 h-3.5 text-[#6E6E6E]" />
            )}

            {/* Label */}
            <span className="font-mono text-xs truncate">{node.label}</span>

            {/* Badges */}
            {node.field?.isIdentifier && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] flex items-center space-x-1">
                <Key className="w-2.5 h-2.5" />
                <span>{node.field.identifierType || 'Identity'}</span>
              </span>
            )}

            {node.field?.isRequired && (
              <span className="text-[#DC2626] font-bold text-xs" title="Required Field">*</span>
            )}

            {node.field?.privacyLabels && node.field.privacyLabels.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                {node.field.privacyLabels.join(', ')}
              </span>
            )}
          </div>

          {/* Right Data Type Label & Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono text-[#888888]">
              {node.field?.dataType || 'object'}
            </span>

            {node.field && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteField(node.field!.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#888888] hover:text-[#DC2626] transition-opacity"
                title="Remove attribute"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }
};
