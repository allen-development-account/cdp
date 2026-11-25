import React, { useState, useMemo, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { AudienceSegment, AudienceRule } from '../../types/cdp';
import {
  evaluateAudience,
  isProfileDuleTargetable
} from '../../utils/audienceEvaluator';
import {
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Split,
  Users,
  Send,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Code,
  Sliders,
  Copy,
  Check,
  Search,
  GitBranch,
  Database,
  FileDown,
  Tag,
  Info,
  AlertCircle,
  Ban,
  X
} from 'lucide-react';

const PREBUILT_SEGMENT_TEMPLATES = [
  {
    id: 'tmpl_high_value_churn',
    name: 'High-Value VIPs with High Churn Risk',
    description: 'Profiles with lifetime spend >= $3,000 and Sensei AI predicted churn risk >= 70%. High urgency win-back campaign.',
    color: 'rose',
    tags: ['Sensei AI', 'VIP Retention', 'Urgent'],
    rulesMatch: 'ALL' as const,
    rules: [
      {
        id: 'r_spend',
        category: 'attribute' as const,
        field: 'totalSpend',
        operator: 'gte' as const,
        value: 3000,
        label: 'Lifetime Spend >= $3,000'
      },
      {
        id: 'r_churn',
        category: 'ai_predictive' as const,
        field: 'churnRisk',
        operator: 'gte' as const,
        value: 70,
        label: 'Predictive Churn Risk >= 70%'
      }
    ]
  },
  {
    id: 'tmpl_cart_abandoners',
    name: 'Recent High-Intent Cart Abandoners (7 Days)',
    description: 'Visitors who added products to cart in the past 7 days without completing a purchase event.',
    color: 'amber',
    tags: ['Behavioral', 'E-Commerce', 'Retargeting'],
    rulesMatch: 'ALL' as const,
    rules: [
      {
        id: 'r_cart_7d',
        category: 'event' as const,
        field: 'AddToCart',
        operator: 'event_performed' as const,
        value: 'AddToCart',
        minEventCount: 1,
        timeWindowDays: 7,
        label: 'Performed AddToCart >= 1 in last 7 days'
      },
      {
        id: 'r_purch_7d',
        category: 'event' as const,
        field: 'Purchase',
        operator: 'event_not_performed' as const,
        value: 'Purchase',
        minEventCount: 0,
        timeWindowDays: 7,
        label: 'Did NOT perform Purchase in last 7 days'
      }
    ]
  },
  {
    id: 'tmpl_b2b_intent_surge',
    name: 'B2B Enterprise Decision Makers & Intent Surge',
    description: 'Profiles in Enterprise accounts holding executive titles (VP, Director, CIO) with high engagement.',
    color: 'indigo',
    tags: ['B2B Edition', 'Account-Based', 'Buying Group'],
    rulesMatch: 'ALL' as const,
    rules: [
      {
        id: 'r_job_title',
        category: 'attribute' as const,
        field: 'jobTitle',
        operator: 'contains' as const,
        value: 'VP',
        label: 'Job Title contains "VP"'
      },
      {
        id: 'r_upsell',
        category: 'ai_predictive' as const,
        field: 'upsellPropensity',
        operator: 'gte' as const,
        value: 60,
        label: 'Upsell Propensity Score >= 60%'
      }
    ]
  },
  {
    id: 'tmpl_gdpr_loyalty',
    name: 'GDPR-Opted-In Omnichannel Champions',
    description: 'Customers with verified EU GDPR consent, no CCPA opt-out, and >= 3 purchases ready for ad activation.',
    color: 'emerald',
    tags: ['DULE Verified', 'Zero-Trust', 'High-LTV'],
    rulesMatch: 'ALL' as const,
    rules: [
      {
        id: 'r_gdpr_ok',
        category: 'consent' as const,
        field: 'gdprConsent',
        operator: 'equals' as const,
        value: true,
        label: 'GDPR Lawful Consent = True'
      },
      {
        id: 'r_ccpa_ok',
        category: 'consent' as const,
        field: 'ccpaOptOut',
        operator: 'equals' as const,
        value: false,
        label: 'CCPA Opt-Out = False'
      },
      {
        id: 'r_purch_cnt',
        category: 'attribute' as const,
        field: 'purchaseCount',
        operator: 'gte' as const,
        value: 3,
        label: 'Total Purchases >= 3'
      }
    ]
  }
];

const createEmptyRule = (): AudienceRule => ({
  id: 'r_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
  category: 'attribute',
  field: '',
  operator: '',
  value: '',
  label: 'New Segmentation Rule'
});

export const AudienceBuilderView: React.FC = () => {
  const { audiences, profiles, createAudience, deleteAudience, setActiveTab, setSelectedProfileId, uiMode } = useCDP();

  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(audiences[0]?.id || '');
  const [isInspectingSegment, setIsInspectingSegment] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [creationStep, setCreationStep] = useState<1 | 2 | 3>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabMode, setActiveTabMode] = useState<'visual_builder' | 'pql_expression' | 'sql_preview' | 'templates'>('visual_builder');

  // Form State for New Segment Wizard
  const [audienceName, setAudienceName] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [rulesMatch, setRulesMatch] = useState<'ALL' | 'ANY'>('ALL');
  const [audienceTags, setAudienceTags] = useState<string[]>(['Real-Time', 'Dynamic XDM']);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [audienceToDelete, setAudienceToDelete] = useState<AudienceSegment | null>(null);
  const [showAddRuleMenu, setShowAddRuleMenu] = useState(false);
  const [starterStage, setStarterStage] = useState<'empty' | 'choose_method'>('empty');

  // Active Rule list during creation
  const [rules, setRules] = useState<AudienceRule[]>([createEmptyRule()]);

  // Keep selectedAudienceId synced whenever audiences array changes (e.g., fresh -> demo, or create/delete)
  useEffect(() => {
    if (audiences.length === 0) {
      setSelectedAudienceId('');
      setIsInspectingSegment(false);
    } else if (!selectedAudienceId || !audiences.some(a => a.id === selectedAudienceId)) {
      setSelectedAudienceId(audiences[0].id);
    }
  }, [audiences, selectedAudienceId]);

  const currentAudience = useMemo(
    () => audiences.find(a => a.id === selectedAudienceId) || audiences[0],
    [audiences, selectedAudienceId]
  );
  const hasSegments = audiences.length > 0 && Boolean(currentAudience);

  // Start guided creation flow
  const startNewSegmentWizard = (initialStep: 1 | 2 | 3 = 1) => {
    setFormError(null);
    setAudienceName('');
    setAudienceDesc('');
    setRulesMatch('ALL');
    setAudienceTags(['Real-Time', 'Dynamic XDM']);
    setRules([createEmptyRule()]);
    setShowAddRuleMenu(false);
    setStarterStage('empty');
    setCreationStep(initialStep);
    setIsInspectingSegment(false);
    setActiveTabMode('visual_builder');
    setIsCreatingNew(true);
  };

  // Draft segment object for live deterministic sizing preview
  const draftSegment: AudienceSegment = useMemo(() => ({
    id: 'draft_preview',
    name: audienceName || 'Untitled Dynamic Segment',
    description: audienceDesc,
    status: 'Draft',
    rulesMatch,
    rules,
    qualifyingProfileCount: 0,
    targetableProfileCount: 0,
    estimatedReachPercentage: 0,
    lastEvaluatedAt: '',
    color: 'indigo'
  }), [audienceName, audienceDesc, rulesMatch, rules]);

  const activeSegmentForSizing = isCreatingNew ? draftSegment : currentAudience;
  const activeRulesList = isCreatingNew ? rules : (currentAudience?.rules || []);
  const activeMatch = isCreatingNew ? rulesMatch : (currentAudience?.rulesMatch || 'ALL');

  const qualifyingProfiles = useMemo(() => {
    if (!activeSegmentForSizing) return [];
    return profiles.filter(p => evaluateAudience(p, activeSegmentForSizing, audiences));
  }, [profiles, activeSegmentForSizing, audiences]);

  const targetableProfiles = useMemo(() => {
    return qualifyingProfiles.filter(isProfileDuleTargetable);
  }, [qualifyingProfiles]);

  const privacyBlockedCount = qualifyingProfiles.length - targetableProfiles.length;

  // Generate XLR8 PQL (Profile Query Language) representation
  const generatedPql = useMemo(() => {
    const validRules = activeRulesList.filter(r => r.field && r.operator);
    if (validRules.length === 0) {
      return `// Profile Query Language (PQL) Expression\nSELECT * FROM xdm_individual_profile WHERE true;`;
    }

    const expressions = validRules.map(r => {
      if (r.category === 'attribute') {
        const opSymbol =
          r.operator === 'gte' ? '>=' :
          r.operator === 'lte' ? '<=' :
          r.operator === 'greater_than' ? '>' :
          r.operator === 'less_than' ? '<' :
          r.operator === 'equals' ? '==' :
          r.operator === 'not_equals' ? '!=' :
          r.operator === 'contains' ? 'LIKE' :
          r.operator === 'is_set' ? 'IS NOT NULL' : '==';
        if (r.operator === 'is_set') return `profile.attributes.${r.field} IS NOT NULL`;
        const formattedVal = typeof r.value === 'string' && isNaN(Number(r.value)) ? `'${r.value}'` : r.value;
        return `profile.attributes.${r.field} ${opSymbol} ${formattedVal}`;
      }
      if (r.category === 'event') {
        const lookback = r.timeWindowDays ? `, lookback = '${r.timeWindowDays}d'` : '';
        const minCount = r.minEventCount || 1;
        if (r.operator === 'event_not_performed') {
          return `COUNT(ExperienceEvent[eventType == '${r.field}'${lookback}]) == 0`;
        }
        return `COUNT(ExperienceEvent[eventType == '${r.field}'${lookback}]) >= ${minCount}`;
      }
      if (r.category === 'ai_predictive') {
        const opSymbol = r.operator === 'lte' || r.operator === 'less_than' ? '<=' : '>=';
        return `profile.predictions.${r.field} ${opSymbol} ${r.value}`;
      }
      if (r.category === 'calculated_attribute') {
        return `profile.calculatedAttributes.${r.field} ${r.operator === 'lte' ? '<=' : r.operator === 'equals' ? '==' : '>='} ${r.value}`;
      }
      if (r.category === 'consent') {
        return `profile.consent.${r.field} == ${r.value}`;
      }
      return `true`;
    });

    const joinOperator = activeMatch === 'ALL' ? ' AND\n  ' : ' OR\n  ';
    const exclusionNote =
      !isCreatingNew && currentAudience?.excludedAudienceIds?.length
        ? `\nAND NOT IN_SEGMENT(${currentAudience.excludedAudienceIds.join(', ')})`
        : '';

    return `// XLR8 Platform PQL Definition\n// Segment: ${isCreatingNew ? (audienceName || 'Untitled Dynamic Segment') : currentAudience?.name}\n\nSELECT * FROM xdm_individual_profile\nWHERE (\n  ${expressions.join(joinOperator)}\n)${exclusionNote}\nWITH DULE_POLICY(enforce_gdpr_article6 = true, enforce_ccpa_opt_out = true);`;
  }, [activeRulesList, activeMatch, isCreatingNew, audienceName, currentAudience]);

  // Generate standard SQL equivalent
  const generatedSql = useMemo(() => {
    const validRules = activeRulesList.filter(r => r.field && r.operator);
    if (validRules.length === 0) {
      return `-- Data Distiller SQL Definition for Segment Sizing\nSELECT \n  p.id AS profile_id,\n  p.unifiedName AS customer_name,\n  p.primaryEmail AS email\nFROM xdm_individual_profile p;`;
    }
    return `-- Data Distiller SQL Definition for Segment Sizing\nSELECT \n  p.id AS profile_id,\n  p.unifiedName AS customer_name,\n  p.primaryEmail AS email,\n  p.attributes.customerTier AS tier,\n  p.attributes.totalSpend AS total_spend,\n  p.predictions.churnRisk AS churn_risk_pct\nFROM xdm_individual_profile p\nWHERE (\n  ${validRules.map(r => {
      if (r.category === 'attribute') {
        const op = r.operator === 'gte' ? '>=' : r.operator === 'lte' ? '<=' : r.operator === 'greater_than' ? '>' : r.operator === 'less_than' ? '<' : r.operator === 'not_equals' ? '!=' : '=';
        return `p.attributes.${r.field} ${op} ${typeof r.value === 'string' && isNaN(Number(r.value)) ? `'${r.value}'` : r.value}`;
      }
      if (r.category === 'ai_predictive') return `p.predictions.${r.field} ${r.operator === 'lte' ? '<=' : '>='} ${r.value}`;
      if (r.category === 'consent') return `p.consent.${r.field} = ${r.value}`;
      if (r.category === 'calculated_attribute') return `p.calculatedAttributes.${r.field} ${r.operator === 'lte' ? '<=' : '>='} ${r.value}`;
      return `${r.operator === 'event_not_performed' ? 'NOT ' : ''}EXISTS (SELECT 1 FROM xdm_experience_events e WHERE e.identifiers.email = p.primaryEmail AND e.eventType = '${r.field}')`;
    }).join(activeMatch === 'ALL' ? '\n  AND ' : '\n  OR ')}\n)\nORDER BY p.attributes.totalSpend DESC;`;
  }, [activeRulesList, activeMatch]);

  // Rule Handlers
  const handleAddRule = (category: AudienceRule['category']) => {
    setFormError(null);
    const newRule: AudienceRule = {
      id: 'r_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      category,
      field: '',
      operator: category === 'event' ? 'event_performed' : category === 'consent' ? 'equals' : '',
      value: category === 'event' ? '' : category === 'ai_predictive' ? 70 : category === 'consent' ? true : '',
      minEventCount: category === 'event' ? 1 : undefined,
      timeWindowDays: category === 'event' ? 7 : undefined,
      label: 'New Segmentation Rule'
    };
    setRules(prev => [...prev, newRule]);
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<AudienceRule>) => {
    setFormError(null);
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, ...updates } : r));
  };

  const handleRemoveRule = (ruleId: string) => {
    setFormError(null);
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleLoadTemplate = (tmpl: typeof PREBUILT_SEGMENT_TEMPLATES[0]) => {
    setFormError(null);
    setIsInspectingSegment(false);
    setIsCreatingNew(true);
    setCreationStep(2);
    setAudienceName(tmpl.name);
    setAudienceDesc(tmpl.description);
    setRulesMatch(tmpl.rulesMatch);
    setAudienceTags([...tmpl.tags]);
    setRules(tmpl.rules.map(r => ({ ...r, id: 'r_' + Math.random().toString(36).substring(2, 8) })));
    setActiveTabMode('visual_builder');
  };

  const handleNextStep = () => {
    setFormError(null);
    if (creationStep === 1) {
      if (!audienceName.trim()) {
        setFormError('Please enter a descriptive Segment Name before proceeding to Step 2.');
        return;
      }
      setCreationStep(2);
    } else if (creationStep === 2) {
      const validRules = rules.filter(r => r.field && r.operator);
      if (validRules.length === 0) {
        setFormError('Please configure at least one rule with a field and comparison operator before reviewing.');
        return;
      }
      setCreationStep(3);
    }
  };

  const handleSaveAudience = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!audienceName.trim()) {
      setFormError('Segment Name is required.');
      setCreationStep(1);
      return;
    }

    const validRules = rules.filter(r => r.field && r.operator);
    if (validRules.length === 0) {
      setFormError('Please configure at least one rule with a selected field and operator before saving.');
      setCreationStep(2);
      return;
    }

    const created = createAudience({
      name: audienceName.trim(),
      description: audienceDesc || `Dynamic audience with ${validRules.length} real-time criteria rule${validRules.length === 1 ? '' : 's'}`,
      status: 'Active',
      rulesMatch,
      rules: validRules,
      color: 'indigo',
      tags: audienceTags.length > 0 ? audienceTags : ['Real-Time', 'Custom-Built'],
      pqlExpression: generatedPql,
      sqlQuery: generatedSql
    });

    setSelectedAudienceId(created.id);
    setAudienceName('');
    setAudienceDesc('');
    setIsCreatingNew(false);
    setIsInspectingSegment(false);
    setActiveTabMode('visual_builder');
    setCreationStep(1);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !audienceTags.includes(tagInput.trim())) {
      setAudienceTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAudienceTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredAudiences = audiences.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fresh Day-0 Onboarding Landing Screen when 0 segments exist and user hasn't entered wizard/templates yet
  const showFreshAccountStarter = !hasSegments && !isCreatingNew && activeTabMode !== 'templates';

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <PageBackButton fallbackTab="hub_customers" fallbackLabel="Customers" className="mt-0.5 shrink-0" />
          <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Segment Builder & Audience Engine</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-semibold px-2 py-0.5 rounded uppercase">
                XLR8 PQL & XDM Native
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Build high-precision segments combining profile attributes, streaming ExperienceEvents, AI predictive scores, and DULE privacy constraints with live sizing.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {audiences.length >= 2 && (
            <button
              onClick={() => setActiveTab('audience_overlap')}
              className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-medium text-xs px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              <Split className="w-3.5 h-3.5 text-blue-100" />
              <span>Venn Overlap Explorer</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsCreatingNew(false);
              setIsInspectingSegment(false);
              setActiveTabMode('templates');
            }}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-medium text-xs px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-100" />
            <span>Blueprints Library</span>
          </button>

          <button
            onClick={() => startNewSegmentWizard(1)}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] font-semibold text-xs px-3.5 py-1.5 rounded shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Segment</span>
          </button>
        </div>
      </div>

      {/* FRESH ACCOUNT STARTING POINT: Simplified Day-0 Screen */}
      {showFreshAccountStarter ? (
        starterStage === 'empty' ? (
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-sm p-10">
            <div className="max-w-xl mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF3FC] border border-[#C5DCFA] text-[#1473E6] flex items-center justify-center mx-auto shadow-xs">
                <Layers className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E1E5EA] text-[11px] font-semibold text-[#1E2229]">
                <span>Clean Account Workspace</span>
                <span>•</span>
                <span className="font-mono text-[#1473E6]">{profiles.length} Unified Profiles Ready</span>
              </div>

              <h3 className="text-xl font-bold text-[#1E2229] tracking-tight">
                No Audience Segments Available Yet
              </h3>

              <p className="text-xs sm:text-sm text-[#596780] leading-relaxed">
                There is currently no audience segmentation available in this workspace yet. Get started below to create your first real-time segment.
              </p>

              <div className="pt-2 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStarterStage('choose_method')}
                  className="px-6 py-3 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-colors inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create your first segment guided step-by-step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {profiles.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('create_dataset')}
                    className="text-xs font-semibold text-[#0D66D0] hover:underline cursor-pointer"
                  >
                    Or upload customer data (Excel / CSV) first
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-sm overflow-hidden">
            {/* Blue Gradient Strip with Backward Navigation Icon */}
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStarterStage('empty')}
                  aria-label="Back to overview"
                  title="Back"
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Choose How to Build Your First Segment
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Pick a guided creation workflow or start quickly with a ready-made segment blueprint.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {/* Card 1: Create using a guided flow */}
                <button
                  type="button"
                  onClick={() => startNewSegmentWizard(1)}
                  className="p-6 rounded-xl bg-[#FAFBFD] hover:bg-[#F2F7FE] border border-[#E1E5EA] hover:border-[#1473E6] text-left transition-all flex flex-col justify-between space-y-5 group cursor-pointer shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1473E6] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#1E2229] group-hover:text-[#0D66D0] transition-colors">
                        Create using a guided flow
                      </h4>
                      <p className="text-xs text-[#596780] mt-1.5 leading-relaxed">
                        Walk step-by-step through naming your segment, selecting match logic (AND/OR), configuring custom qualification rules, and previewing live audience sizing.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#1473E6]">
                    <span>Start Guided Flow</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Card 2: Start from Segment Blueprint */}
                <button
                  type="button"
                  onClick={() => setActiveTabMode('templates')}
                  className="p-6 rounded-xl bg-[#FAFBFD] hover:bg-[#F0F9FF] border border-[#E1E5EA] hover:border-[#0284C7] text-left transition-all flex flex-col justify-between space-y-5 group cursor-pointer shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#1E2229] group-hover:text-[#0284C7] transition-colors">
                        Use a readymade segment blueprint and save time
                      </h4>
                      <p className="text-xs text-[#596780] mt-1.5 leading-relaxed">
                        Start from pre-configured enterprise segment blueprints for high-value VIPs, cart abandoners, churn risk, and consent-safe cohorts.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#0284C7]">
                    <span>Start from Segment Blueprint</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      ) : !isCreatingNew && activeTabMode === 'templates' ? (
        /* Standalone Blueprints Library View */
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setActiveTabMode('visual_builder')}
                aria-label="Back to Segments"
                title="Back"
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Pre-built Audience Blueprints
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Click any blueprint to customize qualification rules in Step 2.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PREBUILT_SEGMENT_TEMPLATES.map(tmpl => (
              <div
                key={tmpl.id}
                className="p-4 bg-[#FAFBFD] hover:bg-white rounded-xl border border-[#E1E5EA] hover:border-[#1473E6] transition-all space-y-2.5 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-xs sm:text-sm text-[#1E2229]">{tmpl.name}</h5>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] shrink-0">
                      {tmpl.rules.length} Rules
                    </span>
                  </div>
                  <p className="text-xs text-[#596780] mt-1.5 leading-relaxed">{tmpl.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tmpl.tags.map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-[#F2F4F7] text-[#1A1D23] px-2 py-0.5 rounded border border-[#E1E5EA]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLoadTemplate(tmpl)}
                  className="mt-3 w-full py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use Blueprint in Step 2</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : !isCreatingNew && !isInspectingSegment ? (
        /* Sequential Segment List View */
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Segment Catalog ({filteredAudiences.length})
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Select any segment row to open its full rule builder, sizing metrics, and qualifying profiles.
              </p>
            </div>
            <span className="text-[11px] text-white bg-white/15 border border-white/25 px-2.5 py-1 rounded-md font-mono font-semibold">
              Real-Time Sync
            </span>
          </div>

          <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E1E5EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#596780] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search segment name, description, or tag..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-lg text-xs text-[#1E2229] placeholder:text-[#475569] focus:outline-none focus:border-[#1473E6]"
              />
            </div>
            <span className="text-[11px] font-medium text-[#596780]">
              Showing {filteredAudiences.length} of {audiences.length} segment{audiences.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredAudiences.length === 0 ? (
            <div className="p-10 text-center space-y-2.5">
              <p className="text-sm font-bold text-[#1E2229]">No matching segments</p>
              <p className="text-xs text-[#596780]">Try a different search term or create a new segment.</p>
              <button
                type="button"
                onClick={() => startNewSegmentWizard(1)}
                className="mt-1 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Segment</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E1E5EA]">
              {filteredAudiences.map((aud, idx) => {
                const liveQualCount = profiles.filter(p => evaluateAudience(p, aud, audiences)).length;
                const liveTargCount = profiles.filter(
                  p => evaluateAudience(p, aud, audiences) && isProfileDuleTargetable(p)
                ).length;

                return (
                  <div
                    key={aud.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedAudienceId(aud.id);
                      setIsCreatingNew(false);
                      setActiveTabMode('visual_builder');
                      setIsInspectingSegment(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAudienceId(aud.id);
                        setIsCreatingNew(false);
                        setActiveTabMode('visual_builder');
                        setIsInspectingSegment(true);
                      }
                    }}
                    className="px-5 py-3.5 hover:bg-[#F2F7FE] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-[#EBF3FC] border border-[#C5DCFA] text-[#0D66D0] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="font-bold text-sm text-[#1E2229] group-hover:text-[#0D66D0] truncate transition-colors">
                            {aud.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3] shrink-0">
                            {aud.status}
                          </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-[#596780]">
                          <span className="font-mono text-[#1E2229] font-medium">
                            {liveQualCount} Qualifying
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[#0D66D0] font-semibold">
                            {liveTargCount} Targetable
                          </span>
                          <span>•</span>
                          <span>{aud.rules?.length || 0} rule{(aud.rules?.length || 0) === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAudienceId(aud.id);
                          setExportModalOpen(true);
                        }}
                        title={`Export "${aud.name}"`}
                        aria-label={`Export segment ${aud.name}`}
                        className="p-2 rounded-lg border border-[#D5D5D5] bg-white hover:bg-[#F2F4F7] text-[#1E2229] hover:text-[#1473E6] transition-colors cursor-pointer shadow-2xs"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudienceToDelete(aud);
                        }}
                        title={`Delete "${aud.name}"`}
                        aria-label={`Delete segment ${aud.name}`}
                        className="p-2 rounded-lg border border-[#BFDBFE] bg-white hover:bg-[#EFF6FF] text-[#0A3D82] hover:text-[#072B5C] transition-colors cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAudienceId(aud.id);
                          setActiveTab('destinations');
                        }}
                        title={`Activate "${aud.name}" to Destination`}
                        aria-label={`Activate segment ${aud.name} to Destination`}
                        className="p-2 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white border border-[#1473E6] transition-colors cursor-pointer shadow-2xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-[#596780] group-hover:text-[#1473E6] group-hover:translate-x-0.5 transition-all ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full-Width Inner Screen (Selected Segment Details) OR Guided Creation Flow */
        <div className="space-y-4">
          <div className="space-y-4">
            {/* Live Membership KPI Header Tile */}
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] rounded-xl p-4 text-white shadow-sm border border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3 min-w-0">
                {!isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsInspectingSegment(false);
                      setActiveTabMode('visual_builder');
                    }}
                    aria-label="Back to Segment Catalog"
                    title="Back to Segment List"
                    className="w-8 h-8 mt-0.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                      {isCreatingNew ? 'Live Draft Segment Sizing' : 'Live Real-Time Audience Sizing'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-md">
                    {isCreatingNew
                      ? (audienceName || 'New Segment (Step-by-Step Guide)')
                      : (currentAudience?.name || 'Select a Blueprint or Create a Segment')}
                  </h3>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Evaluated deterministically across {profiles.length} unified profile{profiles.length === 1 ? '' : 's'} with automated DULE gatekeeping.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <span className="text-xl font-bold text-white font-mono">
                    {activeSegmentForSizing ? qualifyingProfiles.length : 0}
                  </span>
                  <span className="text-[10px] text-blue-100 block font-medium">Total Qualifying</span>
                </div>
                <div className="h-7 w-px bg-white/25" />
                <div className="text-right">
                  <span className="text-xl font-bold text-sky-200 font-mono">
                    {activeSegmentForSizing ? targetableProfiles.length : 0}
                  </span>
                  <span className="text-[10px] text-sky-200 block font-medium">DULE Targetable</span>
                </div>
                <div className="h-7 w-px bg-white/25" />
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-200 font-mono">
                    {activeSegmentForSizing ? privacyBlockedCount : 0}
                  </span>
                  <span className="text-[10px] text-blue-200 block font-medium">Suppressed</span>
                </div>
              </div>
            </div>

            {/* Builder Canvas Box */}
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs p-5 space-y-4">
              {/* View Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E5EA] pb-3">
                <div className="flex items-center space-x-1 bg-[#F2F4F7] p-0.5 rounded border border-[#E1E5EA]">
                  <button
                    onClick={() => setActiveTabMode('visual_builder')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                      activeTabMode === 'visual_builder'
                        ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs font-semibold'
                        : 'text-[#1E2229] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#1473E6]" />
                    <span>{isCreatingNew ? 'Guided Builder' : 'Rule Canvas'}</span>
                  </button>

                  {uiMode === 'pro' && (
                    <>
                      <button
                        onClick={() => setActiveTabMode('pql_expression')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                          activeTabMode === 'pql_expression'
                            ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs font-semibold'
                            : 'text-[#1E2229] hover:text-[#2C2C2C]'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5 text-[#1473E6]" />
                        <span>XLR8 PQL</span>
                      </button>

                      <button
                        onClick={() => setActiveTabMode('sql_preview')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                          activeTabMode === 'sql_preview'
                            ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs font-semibold'
                            : 'text-[#1E2229] hover:text-[#2C2C2C]'
                        }`}
                      >
                        <Database className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>SQL Query</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setActiveTabMode('templates')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                      activeTabMode === 'templates'
                        ? 'bg-[#FFFFFF] text-[#2C2C2C] shadow-2xs font-semibold'
                        : 'text-[#1E2229] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Blueprints</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {!isCreatingNew && hasSegments && (
                    <>
                      <button
                        onClick={() => setExportModalOpen(true)}
                        className="px-2.5 py-1 border rounded text-xs font-medium flex items-center space-x-1 bg-[#FFFFFF] hover:bg-[#F2F4F7] border-[#D5D5D5] text-[#1A1D23] transition-colors cursor-pointer"
                        title="Export Segment"
                      >
                        <FileDown className="w-3.5 h-3.5 text-[#0D66D0]" />
                        <span>Export</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => currentAudience && setAudienceToDelete(currentAudience)}
                        className="px-2.5 py-1 border border-[#BFDBFE] bg-white hover:bg-[#EFF6FF] text-[#0A3D82] hover:text-[#072B5C] rounded text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                        title={`Delete segment "${currentAudience?.name}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#0A3D82]" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('destinations')}
                        className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded transition-colors bg-[#1473E6] hover:bg-[#0D66D0] text-white shadow-2xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Activate to Destination</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* TAB 1: VISUAL RULE BUILDER CANVAS */}
              {activeTabMode === 'visual_builder' && (
                <>
                  {isCreatingNew ? (
                    <div className="space-y-5">
                      {/* Simplified Current Step Strip with Gradient Background & Backward Navigation */}
                      {(() => {
                        const currentStepTitle =
                          creationStep === 1
                            ? '1. Name & Match Logic'
                            : creationStep === 2
                            ? '2. Build Rules'
                            : '3. Review & Activate';
                        return (
                          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-lg border border-[#0E4DA4] px-4 py-3 shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormError(null);
                                  if (creationStep > 1) {
                                    setCreationStep((creationStep - 1) as 1 | 2 | 3);
                                  } else {
                                    setIsCreatingNew(false);
                                  }
                                }}
                                aria-label={creationStep > 1 ? `Back to Step ${creationStep - 1}` : 'Exit Segment Builder'}
                                title={creationStep > 1 ? `Back to Step ${creationStep - 1}` : 'Back'}
                                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>

                              <div className="w-6 h-6 rounded-full bg-white text-[#0D66D0] flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                                {creationStep}
                              </div>

                              <span className="text-sm font-bold text-white truncate">
                                {currentStepTitle}
                              </span>
                            </div>

                            <span className="text-[11px] font-semibold bg-white/15 border border-white/25 text-white px-2.5 py-1 rounded-md shrink-0">
                              Step {creationStep} of 3
                            </span>
                          </div>
                        );
                      })()}

                      {formError && (
                        <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg flex items-center space-x-2 text-xs text-[#D7373F] font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      {/* STEP 1: Segment Identity & Match Logic */}
                      {creationStep === 1 && (
                        <div className="rounded-xl bg-[#FAFBFD] border border-[#E1E5EA] overflow-hidden">
                          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-4 py-3 border-b border-[#0E4DA4]">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              Step 1: Define Segment Identity & Match Logic
                            </h4>
                            <p className="text-[11px] text-blue-100 mt-0.5">
                              Give your segment a clear business name and choose how multiple segmentation rules should be combined.
                            </p>
                          </div>

                          <div className="p-4 space-y-4">

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">
                                Segment Name <span className="text-[#D7373F]">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. High-Value Repeat Buyers"
                                value={audienceName}
                                onChange={e => {
                                  setFormError(null);
                                  setAudienceName(e.target.value);
                                }}
                                className="w-full px-3 py-2 bg-white border border-[#D5D5D5] rounded text-xs text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[#2C2C2C] mb-1">
                                Description (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="Campaign objective or target criteria notes"
                                value={audienceDesc}
                                onChange={e => setAudienceDesc(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#D5D5D5] rounded text-xs text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-[#2C2C2C]">
                              Rule Evaluation Logic
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setRulesMatch('ALL')}
                                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                                  rulesMatch === 'ALL'
                                    ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                                    : 'bg-white border-[#D5D5D5] hover:border-[#94A3B8]'
                                }`}
                              >
                                <p className="text-xs font-bold text-[#1E2229]">Match ALL Rules (AND)</p>
                                <p className="text-[11px] text-[#596780] mt-0.5">
                                  Strict targeting: a customer profile must satisfy every rule you add.
                                </p>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRulesMatch('ANY')}
                                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                                  rulesMatch === 'ANY'
                                    ? 'bg-[#EBF3FC] border-[#1473E6] ring-1 ring-[#1473E6]'
                                    : 'bg-white border-[#D5D5D5] hover:border-[#94A3B8]'
                                }`}
                              >
                                <p className="text-xs font-bold text-[#1E2229]">Match ANY Rule (OR)</p>
                                <p className="text-[11px] text-[#596780] mt-0.5">
                                  Broad reach: a customer qualifies if they satisfy at least one rule.
                                </p>
                              </button>
                            </div>
                          </div>

                          {/* Tags Input */}
                          <div className="flex items-center space-x-2 pt-1">
                            <Tag className="w-3.5 h-3.5 text-[#262A33] shrink-0" />
                            <div className="flex flex-wrap gap-1.5 items-center flex-1">
                              {audienceTags.map(t => (
                                <span key={t} className="inline-flex items-center space-x-1 text-[10px] font-semibold bg-[#EBF3FC] text-[#0D66D0] px-2 py-0.5 rounded border border-[#C5DCFA]">
                                  <span>#{t}</span>
                                  <button type="button" onClick={() => handleRemoveTag(t)} className="text-[#0D66D0] hover:text-[#094895] cursor-pointer">×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                placeholder="+ add tag & press Enter"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                className="text-xs px-2 py-1 bg-[#FFFFFF] border border-[#D5D5D5] rounded focus:outline-none focus:border-[#1473E6] w-40"
                              />
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#E1E5EA] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setIsCreatingNew(false)}
                              className="px-3.5 py-1.5 border border-[#D5D5D5] rounded text-[#1A1D23] font-medium hover:bg-[#F2F4F7] text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleNextStep}
                              className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded text-xs shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <span>Next: Step 2 (Build Rules)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Rule Nodes Canvas */}
                      {creationStep === 2 && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] px-4 py-3 flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                                <GitBranch className="w-3.5 h-3.5 text-white shrink-0" />
                                <span>Step 2: Configure Qualification Rules ({rules.length})</span>
                              </h4>
                              <p className="text-[11px] text-blue-100 mt-0.5">
                                Pick a rule category, field, operator, and value. Live audience size above updates automatically.
                              </p>
                            </div>
                            <span className="text-[10px] bg-white/15 text-white border border-white/25 px-2 py-0.5 rounded font-mono font-semibold shrink-0">
                              Combine via {rulesMatch}
                            </span>
                          </div>

                          {rules.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-[#CBD5E1] rounded bg-[#FAFBFD] text-xs text-[#596780]">
                              No rule nodes added yet. Click &quot;Add Rule&quot; below to add your first rule.
                            </div>
                          ) : (
                            rules.map((rule, idx) => (
                              <div
                                key={rule.id}
                                className="p-3 bg-[#F8F9FA] rounded border border-[#E1E5EA] space-y-2.5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-[#0D66D0] bg-[#EBF3FC] border border-[#C5DCFA] px-1.5 py-0.5 rounded text-[10px] font-mono">
                                      RULE #{idx + 1}
                                    </span>

                                    <select
                                      value={rule.category || ''}
                                      onChange={e => handleUpdateRule(rule.id, {
                                        category: e.target.value as AudienceRule['category'],
                                        field: '',
                                        operator: e.target.value === 'event' ? 'event_performed' : e.target.value === 'consent' ? 'equals' : '',
                                        value: e.target.value === 'ai_predictive' ? 70 : e.target.value === 'consent' ? true : ''
                                      })}
                                      className="px-2 py-1 bg-white border border-[#D5D5D5] rounded font-semibold text-xs text-[#2C2C2C] focus:outline-none focus:border-[#1473E6]"
                                    >
                                      <option value="attribute">Profile Attribute</option>
                                      <option value="event">ExperienceEvent (Behavioral)</option>
                                      <option value="ai_predictive">Sensei AI Score</option>
                                      <option value="calculated_attribute">Calculated Attribute</option>
                                      <option value="consent">Privacy & Consent (DULE)</option>
                                    </select>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRule(rule.id)}
                                    className="p-1 text-[#0D66D0] hover:text-[#0A3D82] rounded hover:bg-[#EBF3FC] transition-colors cursor-pointer"
                                    title="Remove rule node"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                                  {rule.category === 'attribute' && (
                                    <>
                                      <div className="sm:col-span-4">
                                        <select
                                          value={rule.field || ''}
                                          onChange={e => handleUpdateRule(rule.id, { field: e.target.value })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium not-italic focus:outline-none focus:border-[#1473E6] ${!rule.field ? 'text-[#334155]' : 'font-mono text-[#1E2229]'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic font-sans">Select Profile Attribute...</option>
                                          <option value="totalSpend" className="text-[#1E2229] bg-white not-italic font-mono">attributes.totalSpend ($)</option>
                                          <option value="customerTier" className="text-[#1E2229] bg-white not-italic font-mono">attributes.customerTier (VIP/Gold...)</option>
                                          <option value="purchaseCount" className="text-[#1E2229] bg-white not-italic font-mono">attributes.purchaseCount</option>
                                          <option value="loyaltyPoints" className="text-[#1E2229] bg-white not-italic font-mono">attributes.loyaltyPoints</option>
                                          <option value="city" className="text-[#1E2229] bg-white not-italic font-mono">attributes.city</option>
                                          <option value="country" className="text-[#1E2229] bg-white not-italic font-mono">attributes.country</option>
                                          <option value="preferredCategory" className="text-[#1E2229] bg-white not-italic font-mono">attributes.preferredCategory</option>
                                          <option value="hasActiveSubscription" className="text-[#1E2229] bg-white not-italic font-mono">attributes.hasActiveSubscription</option>
                                          <option value="jobTitle" className="text-[#1E2229] bg-white not-italic font-mono">attributes.jobTitle</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-3">
                                        <select
                                          value={rule.operator || ''}
                                          onChange={e => handleUpdateRule(rule.id, { operator: e.target.value as AudienceRule['operator'] })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium not-italic focus:outline-none focus:border-[#1473E6] ${!rule.operator ? 'text-[#334155]' : 'text-[#1E2229]'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic">Select Operator...</option>
                                          <option value="gte" className="text-[#1E2229] bg-white not-italic">&gt;= (Greater or Equal)</option>
                                          <option value="greater_than" className="text-[#1E2229] bg-white not-italic">&gt; (Greater Than)</option>
                                          <option value="lte" className="text-[#1E2229] bg-white not-italic">&lt;= (Less or Equal)</option>
                                          <option value="less_than" className="text-[#1E2229] bg-white not-italic">&lt; (Less Than)</option>
                                          <option value="equals" className="text-[#1E2229] bg-white not-italic">equals</option>
                                          <option value="not_equals" className="text-[#1E2229] bg-white not-italic">does not equal</option>
                                          <option value="contains" className="text-[#1E2229] bg-white not-italic">contains text</option>
                                          <option value="is_set" className="text-[#1E2229] bg-white not-italic">is set / present</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-5">
                                        <input
                                          type="text"
                                          disabled={rule.operator === 'is_set'}
                                          value={rule.operator === 'is_set' ? '(any non-empty value)' : rule.value}
                                          placeholder="Enter value (e.g. 500 or VIP)"
                                          onChange={e => handleUpdateRule(rule.id, { value: e.target.value })}
                                          className="w-full px-2.5 py-1.5 bg-white border border-[#D5D5D5] rounded font-mono text-xs text-[#1E2229] placeholder:text-[#475569] focus:outline-none focus:border-[#1473E6] disabled:bg-[#F2F4F7] disabled:text-[#475569]"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {rule.category === 'event' && (
                                    <>
                                      <div className="sm:col-span-4">
                                        <select
                                          value={rule.field || ''}
                                          onChange={e => handleUpdateRule(rule.id, { field: e.target.value, value: e.target.value })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs not-italic focus:outline-none focus:border-[#1473E6] ${!rule.field ? 'text-[#334155] font-medium' : 'text-[#1E2229] font-semibold'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic">Select Experience Event...</option>
                                          <option value="AddToCart" className="text-[#1E2229] bg-white not-italic">AddToCart (Cart Interaction)</option>
                                          <option value="Purchase" className="text-[#1E2229] bg-white not-italic">Purchase (Order Conversion)</option>
                                          <option value="PageView" className="text-[#1E2229] bg-white not-italic">PageView (Web Browse)</option>
                                          <option value="AppOpen" className="text-[#1E2229] bg-white not-italic">AppOpen (Mobile Session)</option>
                                          <option value="FormSubmit" className="text-[#1E2229] bg-white not-italic">FormSubmit (Lead Capture)</option>
                                          <option value="SupportTicket" className="text-[#1E2229] bg-white not-italic">SupportTicket (CS Desk)</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-3">
                                        <select
                                          value={rule.operator || ''}
                                          onChange={e => handleUpdateRule(rule.id, { operator: e.target.value as AudienceRule['operator'] })}
                                          className="w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium text-[#1E2229] not-italic focus:outline-none focus:border-[#1473E6]"
                                        >
                                          <option value="event_performed" className="text-[#1E2229] bg-white not-italic">Performed At Least (&gt;=)</option>
                                          <option value="event_not_performed" className="text-[#1E2229] bg-white not-italic">Did NOT Perform (== 0)</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-2">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={rule.operator === 'event_not_performed'}
                                          value={rule.minEventCount ?? 1}
                                          onChange={e => handleUpdateRule(rule.id, { minEventCount: Number(e.target.value) })}
                                          className="w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-mono text-[#1E2229] placeholder:text-[#475569] focus:outline-none focus:border-[#1473E6] disabled:bg-[#F2F4F7] disabled:text-[#475569]"
                                          placeholder="Count"
                                        />
                                      </div>

                                      <div className="sm:col-span-3">
                                        <select
                                          value={rule.timeWindowDays || 7}
                                          onChange={e => handleUpdateRule(rule.id, { timeWindowDays: Number(e.target.value) })}
                                          className="w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium text-[#1E2229] not-italic focus:outline-none focus:border-[#1473E6]"
                                        >
                                          <option value="1" className="text-[#1E2229] bg-white not-italic">In last 24 hours</option>
                                          <option value="7" className="text-[#1E2229] bg-white not-italic">In last 7 days</option>
                                          <option value="14" className="text-[#1E2229] bg-white not-italic">In last 14 days</option>
                                          <option value="30" className="text-[#1E2229] bg-white not-italic">In last 30 days</option>
                                          <option value="90" className="text-[#1E2229] bg-white not-italic">In last 90 days</option>
                                        </select>
                                      </div>
                                    </>
                                  )}

                                  {rule.category === 'ai_predictive' && (
                                    <>
                                      <div className="sm:col-span-4">
                                        <select
                                          value={rule.field || ''}
                                          onChange={e => handleUpdateRule(rule.id, { field: e.target.value })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs not-italic focus:outline-none focus:border-[#1473E6] ${!rule.field ? 'text-[#334155] font-medium' : 'text-[#1E2229] font-semibold'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic">Select AI Predictive Model...</option>
                                          <option value="churnRisk" className="text-[#1E2229] bg-white not-italic">Sensei Churn Risk (0-100%)</option>
                                          <option value="predictedLtv" className="text-[#1E2229] bg-white not-italic">Predicted LTV ($ USD)</option>
                                          <option value="upsellPropensity" className="text-[#1E2229] bg-white not-italic">Upsell Propensity (0-100%)</option>
                                          <option value="brandLoyaltyScore" className="text-[#1E2229] bg-white not-italic">Brand Loyalty Index (0-100)</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-3">
                                        <select
                                          value={rule.operator || ''}
                                          onChange={e => handleUpdateRule(rule.id, { operator: e.target.value as AudienceRule['operator'] })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium not-italic focus:outline-none focus:border-[#1473E6] ${!rule.operator ? 'text-[#334155]' : 'text-[#1E2229]'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic">Select Threshold...</option>
                                          <option value="gte" className="text-[#1E2229] bg-white not-italic">&gt;= (At Least)</option>
                                          <option value="lte" className="text-[#1E2229] bg-white not-italic">&lt;= (At Most)</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-5 flex items-center space-x-2 bg-white p-1.5 border border-[#D5D5D5] rounded">
                                        <input
                                          type="range"
                                          min="0"
                                          max={rule.field === 'predictedLtv' ? 25000 : 100}
                                          value={Number(rule.value) || 0}
                                          onChange={e => handleUpdateRule(rule.id, { value: Number(e.target.value) })}
                                          className="flex-1 accent-[#1473E6]"
                                        />
                                        <span className="font-mono font-semibold text-xs text-[#0D66D0] min-w-[46px] text-right">
                                          {rule.field === 'predictedLtv' ? `$${rule.value}` : `${rule.value}%`}
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {rule.category === 'calculated_attribute' && (
                                    <>
                                      <div className="sm:col-span-5">
                                        <select
                                          value={rule.field || ''}
                                          onChange={e => handleUpdateRule(rule.id, { field: e.target.value })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium not-italic focus:outline-none focus:border-[#1473E6] ${!rule.field ? 'text-[#334155]' : 'font-mono text-[#1E2229]'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic font-sans">Select Calculated Attribute...</option>
                                          <option value="rolling_30d_total_spend" className="text-[#1E2229] bg-white not-italic font-mono">rolling_30d_total_spend (SUM)</option>
                                          <option value="days_since_last_web_visit" className="text-[#1E2229] bg-white not-italic font-mono">days_since_last_web_visit (DAYS_SINCE)</option>
                                          <option value="most_frequent_browse_category" className="text-[#1E2229] bg-white not-italic font-mono">most_frequent_browse_category (MODE)</option>
                                          <option value="account_composite_intent_surge" className="text-[#1E2229] bg-white not-italic font-mono">account_composite_intent_surge (COUNT)</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-3">
                                        <select
                                          value={rule.operator || ''}
                                          onChange={e => handleUpdateRule(rule.id, { operator: e.target.value as AudienceRule['operator'] })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium not-italic focus:outline-none focus:border-[#1473E6] ${!rule.operator ? 'text-[#334155]' : 'text-[#1E2229]'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic">Select Operator...</option>
                                          <option value="gte" className="text-[#1E2229] bg-white not-italic">&gt;= (Greater or Equal)</option>
                                          <option value="lte" className="text-[#1E2229] bg-white not-italic">&lt;= (Less or Equal)</option>
                                          <option value="equals" className="text-[#1E2229] bg-white not-italic">equals</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-4">
                                        <input
                                          type="text"
                                          value={rule.value}
                                          onChange={e => handleUpdateRule(rule.id, { value: e.target.value })}
                                          className="w-full px-2.5 py-1.5 bg-white border border-[#D5D5D5] rounded font-mono text-xs text-[#1E2229] placeholder:text-[#475569] focus:outline-none focus:border-[#1473E6]"
                                          placeholder="Threshold value"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {rule.category === 'consent' && (
                                    <>
                                      <div className="sm:col-span-5">
                                        <select
                                          value={rule.field || ''}
                                          onChange={e => handleUpdateRule(rule.id, { field: e.target.value })}
                                          className={`w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs not-italic focus:outline-none focus:border-[#1473E6] ${!rule.field ? 'text-[#334155] font-medium' : 'text-[#1E2229] font-semibold'}`}
                                        >
                                          <option value="" disabled className="text-[#475569] bg-[#F1F5F9] not-italic">Select Privacy & Consent Policy...</option>
                                          <option value="gdprConsent" className="text-[#1E2229] bg-white not-italic">GDPR Article 6 Consent (EU)</option>
                                          <option value="ccpaOptOut" className="text-[#1E2229] bg-white not-italic">CCPA "Do Not Sell" Opt-Out (CA)</option>
                                          <option value="thirdPartySharingConsent" className="text-[#1E2229] bg-white not-italic">3rd-Party Ad Sharing Allowed</option>
                                          <option value="marketingEmailConsent" className="text-[#1E2229] bg-white not-italic">Marketing Email Consent</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-3">
                                        <select
                                          value={rule.operator || 'equals'}
                                          onChange={e => handleUpdateRule(rule.id, { operator: e.target.value as AudienceRule['operator'] })}
                                          className="w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-medium text-[#1E2229] not-italic focus:outline-none focus:border-[#1473E6]"
                                        >
                                          <option value="equals" className="text-[#1E2229] bg-white not-italic">is equal to</option>
                                        </select>
                                      </div>

                                      <div className="sm:col-span-4">
                                        <select
                                          value={rule.value === '' ? '' : String(rule.value)}
                                          onChange={e => handleUpdateRule(rule.id, { value: e.target.value === 'true' })}
                                          className="w-full px-2 py-1.5 bg-white border border-[#D5D5D5] rounded text-xs font-semibold text-[#0D66D0] not-italic focus:outline-none focus:border-[#1473E6]"
                                        >
                                          <option value="true" className="text-[#1E2229] bg-white not-italic">TRUE (Granted / Active)</option>
                                          <option value="false" className="text-[#1E2229] bg-white not-italic">FALSE (Revoked / Disallowed)</option>
                                        </select>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}

                          {/* Centered Common Add Rule Button & Expandable Category Panel */}
                          <div className="pt-2 space-y-3">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => setShowAddRuleMenu(prev => !prev)}
                                className={`inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold border transition-all shadow-2xs cursor-pointer ${
                                  showAddRuleMenu
                                    ? 'bg-[#EBF3FC] text-[#0D66D0] border-[#1473E6]'
                                    : 'bg-white hover:bg-[#F2F7FE] text-[#1473E6] border-[#1473E6]'
                                }`}
                              >
                                <Plus className={`w-4 h-4 transition-transform ${showAddRuleMenu ? 'rotate-45' : ''}`} />
                                <span>Add Rule</span>
                              </button>
                            </div>

                            {showAddRuleMenu && (
                              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#D0D7DE] shadow-sm space-y-3 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-2">
                                  <span className="text-xs font-bold text-[#1E2229] uppercase tracking-wider">
                                    Select Rule Type to Add
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowAddRuleMenu(false)}
                                    aria-label="Close rule type panel"
                                    className="p-1 text-[#596780] hover:text-[#1E2229] rounded hover:bg-[#E1E5EA]/50 transition-colors cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddRule('attribute');
                                      setShowAddRuleMenu(false);
                                    }}
                                    className="p-3 bg-white hover:bg-[#F2F7FE] border border-[#E1E5EA] hover:border-[#1473E6] rounded-lg text-left transition-all flex items-start space-x-2.5 cursor-pointer group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-[#F2F4F7] group-hover:bg-[#EBF3FC] text-[#1473E6] flex items-center justify-center shrink-0">
                                      <Sliders className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#1E2229]">Profile Attribute</p>
                                      <p className="text-[10px] text-[#596780] mt-0.5">
                                        Spend, tier, loyalty &amp; identity fields
                                      </p>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddRule('event');
                                      setShowAddRuleMenu(false);
                                    }}
                                    className="p-3 bg-white hover:bg-[#F0F9FF] border border-[#E1E5EA] hover:border-[#0EA5E9] rounded-lg text-left transition-all flex items-start space-x-2.5 cursor-pointer group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                                      <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#1E2229]">ExperienceEvent</p>
                                      <p className="text-[10px] text-[#596780] mt-0.5">
                                        Real-time behavioral &amp; purchase events
                                      </p>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddRule('ai_predictive');
                                      setShowAddRuleMenu(false);
                                    }}
                                    className="p-3 bg-white hover:bg-[#EFF6FF] border border-[#E1E5EA] hover:border-[#1D4ED8] rounded-lg text-left transition-all flex items-start space-x-2.5 cursor-pointer group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                                      <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#1E2229]">Sensei AI Score</p>
                                      <p className="text-[10px] text-[#596780] mt-0.5">
                                        Churn risk, predicted LTV &amp; propensity
                                      </p>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddRule('calculated_attribute');
                                      setShowAddRuleMenu(false);
                                    }}
                                    className="p-3 bg-white hover:bg-[#F0F9FF] border border-[#E1E5EA] hover:border-[#0284C7] rounded-lg text-left transition-all flex items-start space-x-2.5 cursor-pointer group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shrink-0">
                                      <Database className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#1E2229]">Calculated Attribute</p>
                                      <p className="text-[10px] text-[#596780] mt-0.5">
                                        Event aggregations &amp; rolling recency
                                      </p>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddRule('consent');
                                      setShowAddRuleMenu(false);
                                    }}
                                    className="p-3 bg-white hover:bg-[#EFF6FF] border border-[#E1E5EA] hover:border-[#0A3D82] rounded-lg text-left transition-all flex items-start space-x-2.5 cursor-pointer group"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1D4ED8] to-[#0A3D82] text-white flex items-center justify-center shrink-0">
                                      <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#1E2229]">DULE Consent Gate</p>
                                      <p className="text-[10px] text-[#596780] mt-0.5">
                                        Marketing opt-in, GDPR &amp; CCPA checks
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-[#E1E5EA] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setFormError(null);
                                setCreationStep(1);
                              }}
                              className="px-3.5 py-1.5 border border-[#D5D5D5] rounded text-[#1A1D23] font-medium hover:bg-[#F2F4F7] text-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Back: Step 1</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleNextStep}
                              className="px-4 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-semibold rounded text-xs shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <span>Next: Step 3 (Review & Save)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Review & Activate */}
                      {creationStep === 3 && (
                        <div className="rounded-xl bg-[#FAFBFD] border border-[#E1E5EA] overflow-hidden">
                          <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-4 py-3 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Step 3: Review Segment Specification & Activate
                              </h4>
                              <p className="text-[11px] text-blue-100 mt-0.5">
                                Verify your criteria and compiled PQL/SQL before activating real-time qualification.
                              </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#0E7A36] bg-[#DEFBE6] border border-[#B4F0C3] px-2.5 py-1 rounded shrink-0 self-start sm:self-center">
                              {qualifyingProfiles.length} Qualifying • {targetableProfiles.length} Targetable
                            </span>
                          </div>

                          <div className="p-4 space-y-4">

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 bg-white rounded border border-[#E1E5EA]">
                              <span className="text-[10px] font-bold text-[#596780] uppercase">Segment Name</span>
                              <p className="font-bold text-[#1E2229] mt-0.5">{audienceName}</p>
                            </div>
                            <div className="p-3 bg-white rounded border border-[#E1E5EA]">
                              <span className="text-[10px] font-bold text-[#596780] uppercase">Match Criteria</span>
                              <p className="font-bold text-[#1473E6] mt-0.5">
                                {rulesMatch === 'ALL' ? 'Match ALL Rules (AND)' : 'Match ANY Rule (OR)'}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded border border-[#E1E5EA]">
                              <span className="text-[10px] font-bold text-[#596780] uppercase">Configured Rules</span>
                              <p className="font-bold text-[#1E2229] mt-0.5">
                                {rules.filter(r => r.field && r.operator).length} Active Rule(s)
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#1E1E1E] p-3.5 rounded border border-[#2D2D2D] text-[#66D9EF] font-mono text-[11px] overflow-x-auto leading-relaxed">
                            <pre>{generatedPql}</pre>
                          </div>

                          <div className="pt-3 border-t border-[#E1E5EA] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setCreationStep(2)}
                              className="px-3.5 py-1.5 border border-[#D5D5D5] rounded text-[#1A1D23] font-medium hover:bg-[#F2F4F7] text-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Back: Edit Rules</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSaveAudience()}
                              className="px-5 py-2 bg-gradient-to-r from-[#1473E6] to-[#0A3D82] hover:from-[#0D66D0] hover:to-[#072B5C] text-white font-semibold rounded text-xs shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Save & Activate Segment</span>
                            </button>
                          </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h4 className="font-bold text-[#2C2C2C] text-sm">{currentAudience?.name}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.2 bg-[#EBF3FC] text-[#0D66D0] rounded border border-[#C5DCFA]">
                              {currentAudience?.rulesMatch} Criteria
                            </span>
                            {currentAudience?.excludedAudienceIds && currentAudience.excludedAudienceIds.length > 0 && (
                              <span className="text-[10px] font-semibold px-2 py-0.2 bg-[#EBF3FC] text-[#0A3D82] rounded border border-[#BFDBFE] inline-flex items-center space-x-1">
                                <Ban className="w-3 h-3 text-[#0A3D82]" />
                                <span>Excludes {currentAudience.excludedAudienceIds.length} Segment</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#1E2229] mt-0.5">{currentAudience?.description}</p>
                        </div>

                        <button
                          onClick={() => {
                            setIsCreatingNew(true);
                            setCreationStep(2);
                            setFormError(null);
                            setAudienceName((currentAudience?.name || '') + ' (Copy)');
                            setAudienceDesc(currentAudience?.description || '');
                            setRulesMatch(currentAudience?.rulesMatch || 'ALL');
                            setAudienceTags(currentAudience?.tags || ['Real-Time']);
                            setRules(currentAudience?.rules ? [...currentAudience.rules] : [createEmptyRule()]);
                          }}
                          className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#1A1D23] rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          Edit / Duplicate
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-[10px] font-bold text-[#1E2229] uppercase tracking-wider">
                          Active Evaluated Rules ({currentAudience?.rules?.length || 0})
                        </p>
                        {currentAudience?.rules.map((r, i) => (
                          <div key={r.id || i} className="p-2.5 bg-[#F8F9FA] rounded border border-[#E1E5EA] flex items-center justify-between">
                            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                              <span className="font-semibold text-[#0D66D0] bg-[#EBF3FC] border border-[#C5DCFA] px-1.5 py-0.2 rounded text-[10px] font-mono">
                                {r.category.toUpperCase()}
                              </span>
                              <span className="font-mono text-[#2C2C2C] font-semibold">{r.field}</span>
                              <span className="text-[#1E2229] font-mono text-xs">{r.operator}</span>
                              <span className="font-mono bg-white px-2 py-0.2 rounded border border-[#D5D5D5] font-semibold text-[#2C2C2C]">
                                {String(r.value)}
                              </span>
                              {r.timeWindowDays && (
                                <span className="text-[10px] text-[#1E2229] font-mono">
                                  Lookback: {r.timeWindowDays}d
                                </span>
                              )}
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: XLR8 PQL EXPRESSION VIEWER */}
              {activeTabMode === 'pql_expression' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2C2C2C]">XLR8 Platform PQL Output</span>
                    <button
                      onClick={() => copyToClipboard(generatedPql)}
                      className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F2F4F7] border border-[#D5D5D5] rounded text-xs font-medium text-[#1A1D23] flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#0284C7]" /> : <Copy className="w-3.5 h-3.5 text-[#0D66D0]" />}
                      <span>{copiedCode ? 'Copied' : 'Copy PQL'}</span>
                    </button>
                  </div>
                  <div className="bg-[#1E1E1E] p-3.5 rounded border border-[#2D2D2D] text-[#66D9EF] font-mono text-xs overflow-x-auto leading-relaxed">
                    <pre>{generatedPql}</pre>
                  </div>
                </div>
              )}

              {/* TAB 3: DATA DISTILLER SQL QUERY */}
              {activeTabMode === 'sql_preview' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2C2C2C]">Data Distiller SQL Specification</span>
                    <button
                      onClick={() => copyToClipboard(generatedSql)}
                      className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F2F4F7] border border-[#D5D5D5] rounded text-xs font-medium text-[#1A1D23] flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#0284C7]" /> : <Copy className="w-3.5 h-3.5 text-[#0D66D0]" />}
                      <span>{copiedCode ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <div className="bg-[#1E1E1E] p-3.5 rounded border border-[#2D2D2D] text-[#A6E22E] font-mono text-xs overflow-x-auto leading-relaxed">
                    <pre>{generatedSql}</pre>
                  </div>
                </div>
              )}

              {/* TAB 4: TEMPLATES LIBRARY */}
              {activeTabMode === 'templates' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#2C2C2C]">Pre-built Audience Blueprints</h4>
                    <span className="text-[11px] text-[#596780]">Click any blueprint to customize in Step 2</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PREBUILT_SEGMENT_TEMPLATES.map(tmpl => (
                      <div
                        key={tmpl.id}
                        className="p-3.5 bg-[#FFFFFF] rounded border border-[#E1E5EA] hover:border-[#1473E6] transition-all space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-bold text-xs text-[#2C2C2C]">{tmpl.name}</h5>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] shrink-0">
                              {tmpl.rules.length} Rules
                            </span>
                          </div>
                          <p className="text-[11px] text-[#1E2229] mt-1 leading-relaxed">{tmpl.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tmpl.tags.map(t => (
                              <span key={t} className="text-[9px] font-semibold bg-[#F2F4F7] text-[#1A1D23] px-1.5 py-0.2 rounded border border-[#E1E5EA]">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLoadTemplate(tmpl)}
                          className="mt-3 w-full py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Use Blueprint in Step 2</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Separate Section: Real-Time Qualifying Profile Explorer */}
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <h5 className="font-bold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-100" />
                  <span>Real-Time Qualifying Profile Explorer ({qualifyingProfiles.length})</span>
                </h5>
                <span className="text-[11px] text-white bg-white/15 border border-white/25 px-2.5 py-1 rounded-md font-mono">
                  {targetableProfiles.length} DULE Cleared • {privacyBlockedCount} Privacy Suppressed
                </span>
              </div>

              <div className="p-5">
                {qualifyingProfiles.length === 0 ? (
                  <div className="p-4 rounded border border-dashed border-[#D0D7DE] bg-[#FAFBFD] text-center text-xs text-[#596780]">
                    {profiles.length === 0
                      ? 'No unified customer profiles ingested yet. Upload data or stream events to see live profile matches.'
                      : 'No customer profiles currently satisfy the active rules.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {qualifyingProfiles.map(p => {
                      const isDuleTargetable = isProfileDuleTargetable(p);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            setActiveTab('profiles');
                          }}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-2.5 ${
                            isDuleTargetable
                              ? 'bg-[#FFFFFF] hover:bg-[#F8F9FA] border-[#E1E5EA] hover:border-[#1473E6]'
                              : 'bg-[#FFF1F0] border-[#FFCCC7] hover:border-[#D7373F]'
                          }`}
                        >
                          <img
                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={p.unifiedName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[#2C2C2C] truncate">{p.unifiedName}</p>
                              {isDuleTargetable ? (
                                <ShieldCheck className="w-3 h-3 text-[#0284C7] shrink-0" />
                              ) : (
                                <ShieldAlert className="w-3 h-3 text-[#0A3D82] shrink-0" title="CCPA/GDPR Suppressed" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[10px] text-[#1E2229] font-mono">
                              <span>${(p.attributes.totalSpend || 0).toFixed(0)}</span>
                              <span>•</span>
                              <span className={p.predictions.churnRisk > 70 ? 'text-[#D7373F] font-semibold' : 'text-[#1A1D23]'}>
                                {p.predictions.churnRisk}% Churn
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Definition Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded shadow-xl border border-[#E1E5EA] max-w-lg w-full p-5 space-y-3.5 text-[#2C2C2C]">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-2.5">
              <div className="flex items-center space-x-2">
                <FileDown className="w-4 h-4 text-[#1473E6]" />
                <h3 className="font-bold text-[#2C2C2C] text-sm">Export Audience Segment Definition</h3>
              </div>
              <button onClick={() => setExportModalOpen(false)} className="text-[#262A33] hover:text-[#2C2C2C] text-sm font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#1E2229]">
              Download the JSON specification formatted for XLR8 Platform Segment Registry API or copy the evaluated profile identifiers.
            </p>

            <div className="bg-[#1E1E1E] p-3.5 rounded text-[#66D9EF] font-mono text-xs overflow-x-auto max-h-56">
              <pre>{JSON.stringify({
                segmentId: currentAudience?.id,
                name: currentAudience?.name,
                schemaVersion: '1.4.0',
                expression: generatedPql,
                membership: {
                  qualifyingCount: qualifyingProfiles.length,
                  targetableCount: targetableProfiles.length,
                  profiles: qualifyingProfiles.map(p => ({
                    profileId: p.id,
                    email: p.primaryEmail,
                    targetable: isProfileDuleTargetable(p)
                  }))
                }
              }, null, 2)}</pre>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-3.5 py-1.5 border border-[#D5D5D5] rounded text-[#1A1D23] font-medium hover:bg-[#F2F4F7] text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  copyToClipboard(JSON.stringify(currentAudience, null, 2));
                  setExportModalOpen(false);
                }}
                className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-medium rounded text-xs shadow-2xs cursor-pointer"
              >
                Copy JSON Payload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {audienceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#D0D7DE] max-w-md w-full p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FC] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#0A3D82]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#1E2229]">Delete Audience Segment?</h3>
                <p className="text-xs text-[#596780] mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-[#1E2229]">"{audienceToDelete.name}"</strong>? This will remove the segment criteria from the catalog and unbind any connected activation workflows.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E1E5EA]">
              <button
                type="button"
                onClick={() => setAudienceToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#D0D7DE] text-xs font-semibold text-[#1E2229] hover:bg-[#F2F4F7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = audienceToDelete.id;
                  deleteAudience(idToDelete);
                  if (selectedAudienceId === idToDelete) {
                    const remaining = audiences.filter(a => a.id !== idToDelete);
                    setSelectedAudienceId(remaining[0]?.id || '');
                    setIsInspectingSegment(false);
                  }
                  setAudienceToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#D7373F] hover:bg-[#B3242B] text-xs font-semibold text-white shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Segment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
