import React, { useState, useMemo, useEffect } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { evaluateAudience, isProfileDuleTargetable } from '../../utils/audienceEvaluator';
import { resolveAvatarUrl } from '../../utils/avatarResolver';
import {
  Layers,
  Sparkles,
  Users,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Plus,
  Split,
  Tag
} from 'lucide-react';

function getModeValue(values: string[], fallback: string): string {
  if (values.length === 0) return fallback;
  const counts = new Map<string, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let best = values[0];
  let bestCount = 0;
  for (const [val, count] of counts.entries()) {
    if (count > bestCount) {
      best = val;
      bestCount = count;
    }
  }
  return best;
}

export const AudienceOverlapExplorerView: React.FC = () => {
  const { audiences, profiles, createAudience, setActiveTab, setSelectedProfileId } = useCDP();

  const [segmentAId, setSegmentAId] = useState<string>(audiences[0]?.id || '');
  const [segmentBId, setSegmentBId] = useState<string>(audiences[1]?.id || audiences[0]?.id || '');
  const [isThreeWay, setIsThreeWay] = useState<boolean>(false);
  const [segmentCId, setSegmentCId] = useState<string>(audiences[2]?.id || audiences[1]?.id || audiences[0]?.id || '');

  // 'only_a' | 'only_b' | 'intersection_ab' | 'only_c' | 'intersection_ac' | 'intersection_bc' | 'intersection_all'
  const [activeVennFilter, setActiveVennFilter] = useState<string>('intersection_ab');
  const [exclusionSuccessMsg, setExclusionSuccessMsg] = useState<string | null>(null);

  // Sync segment IDs cleanly when audiences populate/update (e.g. creating segments or toggling Demo)
  useEffect(() => {
    if (audiences.length === 0) {
      setSegmentAId('');
      setSegmentBId('');
      setSegmentCId('');
      return;
    }

    const nextA = audiences.some(a => a.id === segmentAId) ? segmentAId : audiences[0].id;
    let nextB = audiences.some(a => a.id === segmentBId) ? segmentBId : (audiences[1]?.id || audiences[0].id);
    if (audiences.length >= 2 && nextB === nextA) {
      const alt = audiences.find(a => a.id !== nextA);
      if (alt) nextB = alt.id;
    }
    const nextC = audiences.some(a => a.id === segmentCId)
      ? segmentCId
      : (audiences.find(a => a.id !== nextA && a.id !== nextB)?.id || nextB);

    if (nextA !== segmentAId) setSegmentAId(nextA);
    if (nextB !== segmentBId) setSegmentBId(nextB);
    if (nextC !== segmentCId) setSegmentCId(nextC);
  }, [audiences, segmentAId, segmentBId, segmentCId]);

  const segmentA = audiences.find(a => a.id === segmentAId) || audiences[0];
  const segmentB = audiences.find(a => a.id === segmentBId) || audiences[1] || audiences[0];
  const segmentC = audiences.find(a => a.id === segmentCId) || audiences[2] || audiences[1] || audiences[0];

  // Deterministic qualification evaluation across unified profiles
  const profilesInA = useMemo(() => {
    if (!segmentA) return [];
    return profiles.filter(p => evaluateAudience(p, segmentA, audiences));
  }, [profiles, segmentA, audiences]);

  const profilesInB = useMemo(() => {
    if (!segmentB) return [];
    return profiles.filter(p => evaluateAudience(p, segmentB, audiences));
  }, [profiles, segmentB, audiences]);

  const profilesInC = useMemo(() => {
    if (!isThreeWay || !segmentC) return [];
    return profiles.filter(p => evaluateAudience(p, segmentC, audiences));
  }, [profiles, isThreeWay, segmentC, audiences]);

  const setAIds = useMemo(() => new Set(profilesInA.map(p => p.id)), [profilesInA]);
  const setBIds = useMemo(() => new Set(profilesInB.map(p => p.id)), [profilesInB]);
  const setCIds = useMemo(() => new Set(profilesInC.map(p => p.id)), [profilesInC]);

  // Exact mutually-disjoint Venn regions
  const onlyAProfiles = useMemo(
    () => profilesInA.filter(p => !setBIds.has(p.id) && (!isThreeWay || !setCIds.has(p.id))),
    [profilesInA, setBIds, isThreeWay, setCIds]
  );

  const onlyBProfiles = useMemo(
    () => profilesInB.filter(p => !setAIds.has(p.id) && (!isThreeWay || !setCIds.has(p.id))),
    [profilesInB, setAIds, isThreeWay, setCIds]
  );

  const onlyCProfiles = useMemo(() => {
    if (!isThreeWay) return [];
    return profilesInC.filter(p => !setAIds.has(p.id) && !setBIds.has(p.id));
  }, [isThreeWay, profilesInC, setAIds, setBIds]);

  const intersectionABOnly = useMemo(
    () => profilesInA.filter(p => setBIds.has(p.id) && (!isThreeWay || !setCIds.has(p.id))),
    [profilesInA, setBIds, isThreeWay, setCIds]
  );

  const intersectionACOnly = useMemo(() => {
    if (!isThreeWay) return [];
    return profilesInA.filter(p => setCIds.has(p.id) && !setBIds.has(p.id));
  }, [isThreeWay, profilesInA, setCIds, setBIds]);

  const intersectionBCOnly = useMemo(() => {
    if (!isThreeWay) return [];
    return profilesInB.filter(p => setCIds.has(p.id) && !setAIds.has(p.id));
  }, [isThreeWay, profilesInB, setCIds, setAIds]);

  const intersectionAll = useMemo(() => {
    if (!isThreeWay) return [];
    return profilesInA.filter(p => setBIds.has(p.id) && setCIds.has(p.id));
  }, [isThreeWay, profilesInA, setBIds, setCIds]);

  // Total A ∩ B regardless of C (and union universe covered by selected segments)
  const totalABOverlap = useMemo(
    () => profilesInA.filter(p => setBIds.has(p.id)),
    [profilesInA, setBIds]
  );

  const overlapRateA = useMemo(() => {
    if (profilesInA.length === 0) return 0;
    return Math.round((totalABOverlap.length / profilesInA.length) * 100);
  }, [totalABOverlap.length, profilesInA.length]);

  const isSameSegmentSelected = Boolean(segmentA && segmentB && segmentA.id === segmentB.id);

  // Fatigue risk assessment
  const fatigueRisk = useMemo<{
    level: 'Low' | 'Moderate' | 'High';
    color: string;
    bg: string;
    border: string;
    description: string;
  }>(() => {
    if (isSameSegmentSelected) {
      return {
        level: 'Moderate',
        color: 'text-[#B76E00]',
        bg: 'bg-[#FFF4E5]',
        border: 'border-[#FFE2B3]',
        description: 'Identical segments selected for A and B. Choose two distinct segments to measure real overlap.'
      };
    }
    if (totalABOverlap.length === 0) {
      return {
        level: 'Low',
        color: 'text-[#0E7A36]',
        bg: 'bg-[#DEFBE6]',
        border: 'border-[#B4F0C3]',
        description: 'Zero overlap detected. Segments are mutually exclusive and safe for concurrent activation.'
      };
    }
    if (overlapRateA > 40 || totalABOverlap.length >= 3) {
      return {
        level: 'High',
        color: 'text-[#D7373F]',
        bg: 'bg-[#FFF1F2]',
        border: 'border-[#FECDD3]',
        description: `High overlap: ${totalABOverlap.length} profile(s) (${overlapRateA}% of Segment A) qualify for both "${segmentA?.name}" and "${segmentB?.name}".`
      };
    }
    return {
      level: 'Moderate',
      color: 'text-[#B76E00]',
      bg: 'bg-[#FFF4E5]',
      border: 'border-[#FFE2B3]',
      description: `Moderate overlap: ${totalABOverlap.length} profile(s) (${overlapRateA}% of Segment A) belong to both cohorts.`
    };
  }, [isSameSegmentSelected, totalABOverlap.length, overlapRateA, segmentA?.name, segmentB?.name]);

  // Active region profiles & accurate label
  const displayedProfiles = useMemo(() => {
    switch (activeVennFilter) {
      case 'only_a':
        return {
          title: `Only in ${segmentA?.name || 'Segment A'}`,
          shortLabel: 'Only Seg A',
          profiles: onlyAProfiles
        };
      case 'only_b':
        return {
          title: `Only in ${segmentB?.name || 'Segment B'}`,
          shortLabel: 'Only Seg B',
          profiles: onlyBProfiles
        };
      case 'only_c':
        return {
          title: `Only in ${segmentC?.name || 'Segment C'}`,
          shortLabel: 'Only Seg C',
          profiles: onlyCProfiles
        };
      case 'intersection_ac':
        return {
          title: `Overlap: ${segmentA?.name} ∩ ${segmentC?.name} (excl. B)`,
          shortLabel: 'A ∩ C (excl. B)',
          profiles: intersectionACOnly
        };
      case 'intersection_bc':
        return {
          title: `Overlap: ${segmentB?.name} ∩ ${segmentC?.name} (excl. A)`,
          shortLabel: 'B ∩ C (excl. A)',
          profiles: intersectionBCOnly
        };
      case 'intersection_all':
        return {
          title: `Triple Intersection: ${segmentA?.name} ∩ ${segmentB?.name} ∩ ${segmentC?.name}`,
          shortLabel: 'A ∩ B ∩ C',
          profiles: intersectionAll
        };
      case 'intersection_ab':
      default:
        return {
          title: isThreeWay
            ? `Pairwise Overlap: ${segmentA?.name} ∩ ${segmentB?.name} (excl. C)`
            : `Intersection: ${segmentA?.name} ∩ ${segmentB?.name}`,
          shortLabel: isThreeWay ? 'A ∩ B (excl. C)' : 'A ∩ B',
          profiles: isThreeWay ? intersectionABOnly : totalABOverlap
        };
    }
  }, [
    activeVennFilter,
    segmentA?.name,
    segmentB?.name,
    segmentC?.name,
    onlyAProfiles,
    onlyBProfiles,
    onlyCProfiles,
    intersectionABOnly,
    intersectionACOnly,
    intersectionBCOnly,
    intersectionAll,
    isThreeWay,
    totalABOverlap
  ]);

  // Validated Persona Diagnostics computed dynamically on the SELECTED Venn region
  const regionStats = useMemo(() => {
    const list = displayedProfiles.profiles;
    if (list.length === 0) {
      return {
        count: 0,
        avgSpend: 0,
        spendBadge: { text: 'No Data', cls: 'bg-[#F2F4F7] text-[#596780] border-[#D0D7DE]' },
        topTier: 'N/A',
        tierBadge: { text: 'No Data', cls: 'bg-[#F2F4F7] text-[#596780] border-[#D0D7DE]' },
        gdprRate: 0,
        targetableCount: 0,
        topCategory: 'N/A'
      };
    }

    const totalSpend = list.reduce((sum, p) => sum + (p.attributes?.totalSpend || 0), 0);
    const avgSpend = Math.round(totalSpend / list.length);
    const spendBadge =
      avgSpend >= 3000
        ? { text: 'High LTV Cohort', cls: 'bg-[#DEFBE6] text-[#0E7A36] border-[#B4F0C3]' }
        : avgSpend >= 1000
        ? { text: 'Mid-Value Cohort', cls: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]' }
        : { text: 'Standard LTV', cls: 'bg-[#F2F4F7] text-[#1E2229] border-[#D0D7DE]' };

    const tiers = list.map(p => p.attributes?.customerTier || 'Silver').filter(Boolean);
    const topTier = getModeValue(tiers, 'Silver');
    const isVipTier = ['VIP', 'Platinum', 'Enterprise'].includes(topTier);
    const tierBadge = isVipTier
      ? { text: 'VIP Cluster', cls: 'bg-[#EBF3FC] text-[#0D66D0] border-[#C5DCFA]' }
      : { text: `${topTier} Majority`, cls: 'bg-[#F2F4F7] text-[#1E2229] border-[#D0D7DE]' };

    const gdprCount = list.filter(p => p.consent?.gdprConsent).length;
    const gdprRate = Math.round((gdprCount / list.length) * 100);
    const targetableCount = list.filter(isProfileDuleTargetable).length;

    const categories = list.map(p => p.attributes?.preferredCategory).filter((c): c is string => Boolean(c));
    const topCategory = getModeValue(categories, 'General');

    return {
      count: list.length,
      avgSpend,
      spendBadge,
      topTier,
      tierBadge,
      gdprRate,
      targetableCount,
      topCategory
    };
  }, [displayedProfiles.profiles]);

  // Deterministic One-Click Exclude Overlap handler (uses true excludedAudienceIds exclusion)
  const handleCreateMutuallyExclusiveSegment = () => {
    if (!segmentA || !segmentB || isSameSegmentSelected) return;

    const newSegmentName = `${segmentA.name} [Excl. ${segmentB.name}]`;
    createAudience({
      name: newSegmentName,
      description: `Mutually exclusive cohort derived from "${segmentA.name}" excluding all members qualifying for "${segmentB.name}".`,
      status: 'Active',
      rulesMatch: segmentA.rulesMatch,
      rules: [...segmentA.rules],
      excludedAudienceIds: [...(segmentA.excludedAudienceIds || []), segmentB.id],
      tags: ['Deduplicated', 'Anti-Fatigue', 'Venn-Optimized']
    });

    setExclusionSuccessMsg(`Created mutually exclusive segment "${newSegmentName}" in Audience Catalog!`);
    setTimeout(() => setExclusionSuccessMsg(null), 5000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="audiences" fallbackLabel="Audiences & Segments" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Split className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Audience Overlap & Venn Intersection Explorer</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded uppercase">
                Anti-Fatigue Analytics
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Quantify exact segment intersections, inspect regional customer diagnostics, and generate mutually exclusive audience cohorts.
            </p>
          </div>
        </div>

        {audiences.length >= 2 && (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const next = !isThreeWay;
                setIsThreeWay(next);
                if (!next && ['only_c', 'intersection_ac', 'intersection_bc', 'intersection_all'].includes(activeVennFilter)) {
                  setActiveVennFilter('intersection_ab');
                }
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                isThreeWay
                  ? 'bg-white text-[#0D66D0] border-white shadow-2xs'
                  : 'bg-white/15 text-white border-white/25 hover:bg-white/25'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isThreeWay ? '3-Way Venn Active' : 'Enable 3-Way Venn'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Require at least 2 segments for Venn Analysis */}
      {audiences.length < 2 ? (
        <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-sm p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E0F2FE] to-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center mx-auto">
            <Split className="w-7 h-7" />
          </div>
          <div className="max-w-lg mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-[#1E2229]">
              Create at Least 2 Segments to Compare Overlap
            </h3>
            <p className="text-xs text-[#596780] leading-relaxed">
              The Interactive Venn Explorer compares qualifying profiles across 2 or 3 audience segments ({audiences.length} of 2 segments currently created).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('audiences')}
            className="px-5 py-2.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Go to Audience Segmentation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Segment Selector Strip */}
          <div className="bg-white rounded border border-[#E1E5EA] shadow-2xs p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className={`${isThreeWay ? 'md:col-span-4' : 'md:col-span-5'}`}>
                <label className="text-[11px] font-bold text-[#1473E6] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Segment A (Primary Cohort)</span>
                  <span className="text-[10px] font-mono text-[#596780]">{profilesInA.length} Qualifying</span>
                </label>
                <select
                  value={segmentAId}
                  onChange={e => setSegmentAId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#0F172A] focus:bg-white focus:border-[#1473E6] focus:outline-none"
                >
                  {audiences.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({profiles.filter(p => evaluateAudience(p, a, audiences)).length} qualifying)
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${isThreeWay ? 'md:col-span-1' : 'md:col-span-2'} flex justify-center`}>
                <div className="w-8 h-8 rounded-full bg-[#F2F4F7] border border-[#D0D7DE] flex items-center justify-center text-xs font-bold text-[#596780]">
                  VS
                </div>
              </div>

              <div className={`${isThreeWay ? 'md:col-span-4' : 'md:col-span-5'}`}>
                <label className="text-[11px] font-bold text-[#7B2CBF] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Segment B (Comparison Cohort)</span>
                  <span className="text-[10px] font-mono text-[#596780]">{profilesInB.length} Qualifying</span>
                </label>
                <select
                  value={segmentBId}
                  onChange={e => setSegmentBId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#0F172A] focus:bg-white focus:border-[#7B2CBF] focus:outline-none"
                >
                  {audiences.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({profiles.filter(p => evaluateAudience(p, a, audiences)).length} qualifying)
                    </option>
                  ))}
                </select>
              </div>

              {isThreeWay && (
                <div className="md:col-span-3">
                  <label className="text-[11px] font-bold text-[#0E7A36] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Segment C (3rd Cohort)</span>
                    <span className="text-[10px] font-mono text-[#596780]">{profilesInC.length} Qualifying</span>
                  </label>
                  <select
                    value={segmentCId}
                    onChange={e => setSegmentCId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded text-xs font-semibold text-[#0F172A] focus:bg-white focus:border-[#0E7A36] focus:outline-none"
                  >
                    {audiences.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({profiles.filter(p => evaluateAudience(p, a, audiences)).length} qualifying)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded border border-[#E1E5EA] shadow-2xs p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#596780]">
                  {isThreeWay ? 'Triple Overlap (A ∩ B ∩ C)' : 'Intersection Cohort (A ∩ B)'}
                </span>
                <Users className="w-4 h-4 text-[#1473E6]" />
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-[#1E2229]">
                  {(isThreeWay ? intersectionAll.length : totalABOverlap.length).toLocaleString()}
                </span>
                <span className="text-xs text-[#596780]">shared profiles</span>
              </div>
              <p className="text-[11px] text-[#596780] mt-1">
                {isThreeWay
                  ? `A ∩ B total: ${totalABOverlap.length} shared profiles`
                  : 'Qualify simultaneously for both Segment A and B.'}
              </p>
            </div>

            <div className="bg-white rounded border border-[#E1E5EA] shadow-2xs p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#596780]">Overlap Ratio (A ∩ B)</span>
                <Split className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-mono text-[#1D4ED8]">
                  {overlapRateA}%
                </span>
                <span className="text-xs text-[#596780]">of Segment A</span>
              </div>
              <div className="w-full bg-[#E1E5EA] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0EA5E9] to-[#1D4ED8] h-full transition-all duration-500" style={{ width: `${Math.min(100, overlapRateA)}%` }} />
              </div>
            </div>

            <div className={`rounded border shadow-2xs p-4 ${fatigueRisk.bg} ${fatigueRisk.border}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E2229]">Syndication Fatigue</span>
                <AlertTriangle className="w-4 h-4 text-[#0A3D82]" />
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`text-xl font-bold uppercase ${fatigueRisk.color}`}>
                  {fatigueRisk.level} Risk
                </span>
              </div>
              <p className="text-[11px] text-[#1E2229] mt-1 line-clamp-2 leading-relaxed">
                {fatigueRisk.description}
              </p>
            </div>

            <div className="bg-white rounded border border-[#E1E5EA] shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#596780]">One-Click Anti-Fatigue</span>
                <p className="text-[11px] text-[#1E2229] mt-1">
                  Create a deduplicated cohort from A excluding members in B.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateMutuallyExclusiveSegment}
                disabled={totalABOverlap.length === 0 || isSameSegmentSelected}
                className={`mt-2 w-full py-1.5 px-2.5 rounded text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                  totalABOverlap.length > 0 && !isSameSegmentSelected
                    ? 'bg-[#1473E6] hover:bg-[#0D66D0] text-white shadow-2xs cursor-pointer'
                    : 'bg-[#E1E5EA] text-[#8C95A6] cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Exclusive Segment</span>
              </button>
            </div>
          </div>

          {exclusionSuccessMsg && (
            <div className="p-3 bg-[#EBF3FC] border border-[#BFDBFE] text-[#0A3D82] rounded-lg text-xs font-medium flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D66D0]" />
                <span>{exclusionSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('audiences')}
                className="text-xs font-bold underline hover:text-[#1473E6] cursor-pointer"
              >
                Open in Audience Builder &rarr;
              </button>
            </div>
          )}

          {/* Main Analysis Section: Interactive Venn Diagram & Selected Region Trait Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Venn Membership Map
                  </h3>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Click any Venn region or chip below to inspect matching profiles and validated region stats.
                  </p>
                </div>
                <span className="text-xs font-mono bg-white/15 px-2.5 py-1 rounded border border-white/25 text-white shrink-0 self-start sm:self-center">
                  Universe: {profiles.length} Profiles
                </span>
              </div>

              <div className="p-6">
              <div className="relative bg-[#FAFBFD] rounded-xl border border-[#E1E5EA] p-6 flex flex-col items-center justify-center min-h-[340px] select-none">
                {!isThreeWay ? (
                  <div className="relative w-full max-w-md h-64 flex items-center justify-center">
                    <svg viewBox="0 0 500 300" className="w-full h-full">
                      <defs>
                        <linearGradient id="vennA" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1473E6" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#0D66D0" stopOpacity="0.55" />
                        </linearGradient>
                        <linearGradient id="vennB" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7B2CBF" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#5A189A" stopOpacity="0.55" />
                        </linearGradient>
                      </defs>

                      <circle
                        cx="195"
                        cy="150"
                        r="105"
                        fill="url(#vennA)"
                        stroke="#1473E6"
                        strokeWidth={activeVennFilter === 'only_a' ? 3.5 : 1.5}
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => setActiveVennFilter('only_a')}
                      />

                      <circle
                        cx="305"
                        cy="150"
                        r="105"
                        fill="url(#vennB)"
                        stroke="#7B2CBF"
                        strokeWidth={activeVennFilter === 'only_b' ? 3.5 : 1.5}
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => setActiveVennFilter('only_b')}
                      />

                      <path
                        d="M 250,60 A 105,105 0 0,0 250,240 A 105,105 0 0,0 250,60"
                        fill={activeVennFilter === 'intersection_ab' ? 'rgba(67, 56, 202, 0.35)' : 'rgba(67, 56, 202, 0.12)'}
                        stroke={activeVennFilter === 'intersection_ab' ? '#312E81' : 'transparent'}
                        strokeWidth="2.5"
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('intersection_ab')}
                      />

                      <text x="135" y="145" textAnchor="middle" className="font-bold text-base fill-[#0B4A99] pointer-events-none">
                        {onlyAProfiles.length}
                      </text>
                      <text x="135" y="165" textAnchor="middle" className="text-[11px] font-semibold fill-[#1E2229] pointer-events-none">
                        Only Seg A
                      </text>

                      <text x="250" y="145" textAnchor="middle" className="font-bold text-lg fill-[#1E2229] pointer-events-none">
                        {totalABOverlap.length}
                      </text>
                      <text x="250" y="165" textAnchor="middle" className="text-[11px] font-bold fill-[#312E81] pointer-events-none">
                        A ∩ B ({overlapRateA}%)
                      </text>

                      <text x="365" y="145" textAnchor="middle" className="font-bold text-base fill-[#5A189A] pointer-events-none">
                        {onlyBProfiles.length}
                      </text>
                      <text x="365" y="165" textAnchor="middle" className="text-[11px] font-semibold fill-[#1E2229] pointer-events-none">
                        Only Seg B
                      </text>
                    </svg>
                  </div>
                ) : (
                  <div className="relative w-full max-w-md h-72 flex items-center justify-center">
                    <svg viewBox="0 0 500 350" className="w-full h-full">
                      {/* Circle A (Top Left) */}
                      <circle
                        cx="200"
                        cy="145"
                        r="92"
                        fill="#1473E6"
                        fillOpacity="0.28"
                        stroke="#1473E6"
                        strokeWidth={activeVennFilter === 'only_a' ? 3.5 : 1.5}
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('only_a')}
                      />
                      {/* Circle B (Top Right) */}
                      <circle
                        cx="300"
                        cy="145"
                        r="92"
                        fill="#7B2CBF"
                        fillOpacity="0.28"
                        stroke="#7B2CBF"
                        strokeWidth={activeVennFilter === 'only_b' ? 3.5 : 1.5}
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('only_b')}
                      />
                      {/* Circle C (Bottom Center) */}
                      <circle
                        cx="250"
                        cy="225"
                        r="92"
                        fill="#0E7A36"
                        fillOpacity="0.28"
                        stroke="#0E7A36"
                        strokeWidth={activeVennFilter === 'only_c' ? 3.5 : 1.5}
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('only_c')}
                      />

                      {/* Clickable Hit Targets & Labels for All 7 Regions */}
                      <text x="155" y="122" textAnchor="middle" className="font-bold text-xs fill-[#0B4A99] pointer-events-none">
                        {onlyAProfiles.length} (Only A)
                      </text>
                      <text x="345" y="122" textAnchor="middle" className="font-bold text-xs fill-[#5A189A] pointer-events-none">
                        {onlyBProfiles.length} (Only B)
                      </text>
                      <text x="250" y="278" textAnchor="middle" className="font-bold text-xs fill-[#0E7A36] pointer-events-none">
                        {onlyCProfiles.length} (Only C)
                      </text>

                      {/* A ∩ B only */}
                      <circle
                        cx="250"
                        cy="115"
                        r="22"
                        fill={activeVennFilter === 'intersection_ab' ? 'rgba(67,56,202,0.35)' : 'transparent'}
                        stroke={activeVennFilter === 'intersection_ab' ? '#312E81' : 'transparent'}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('intersection_ab')}
                      />
                      <text x="250" y="119" textAnchor="middle" className="font-bold text-[11px] fill-[#1E2229] cursor-pointer" onClick={() => setActiveVennFilter('intersection_ab')}>
                        {intersectionABOnly.length} (A∩B)
                      </text>

                      {/* A ∩ C only */}
                      <circle
                        cx="198"
                        cy="198"
                        r="22"
                        fill={activeVennFilter === 'intersection_ac' ? 'rgba(20,115,230,0.35)' : 'transparent'}
                        stroke={activeVennFilter === 'intersection_ac' ? '#0B4A99' : 'transparent'}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('intersection_ac')}
                      />
                      <text x="198" y="202" textAnchor="middle" className="font-bold text-[11px] fill-[#1E2229] cursor-pointer" onClick={() => setActiveVennFilter('intersection_ac')}>
                        {intersectionACOnly.length} (A∩C)
                      </text>

                      {/* B ∩ C only */}
                      <circle
                        cx="302"
                        cy="198"
                        r="22"
                        fill={activeVennFilter === 'intersection_bc' ? 'rgba(123,44,191,0.35)' : 'transparent'}
                        stroke={activeVennFilter === 'intersection_bc' ? '#5A189A' : 'transparent'}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('intersection_bc')}
                      />
                      <text x="302" y="202" textAnchor="middle" className="font-bold text-[11px] fill-[#1E2229] cursor-pointer" onClick={() => setActiveVennFilter('intersection_bc')}>
                        {intersectionBCOnly.length} (B∩C)
                      </text>

                      {/* A ∩ B ∩ C center */}
                      <circle
                        cx="250"
                        cy="172"
                        r="24"
                        fill={activeVennFilter === 'intersection_all' ? 'rgba(14,122,54,0.35)' : 'transparent'}
                        stroke={activeVennFilter === 'intersection_all' ? '#0E7A36' : 'transparent'}
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => setActiveVennFilter('intersection_all')}
                      />
                      <text
                        x="250"
                        y="176"
                        textAnchor="middle"
                        className="font-bold text-xs fill-[#0F172A] cursor-pointer"
                        onClick={() => setActiveVennFilter('intersection_all')}
                      >
                        {intersectionAll.length} (All 3)
                      </text>
                    </svg>
                  </div>
                )}

                {/* Quick Filter Selection Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[#E1E5EA] w-full">
                  <span className="text-[11px] font-bold text-[#596780] uppercase mr-1">Region:</span>
                  <button
                    type="button"
                    onClick={() => setActiveVennFilter('intersection_ab')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      activeVennFilter === 'intersection_ab'
                        ? 'bg-[#1E2229] text-white'
                        : 'bg-[#F2F4F7] text-[#1E2229] hover:bg-[#E1E5EA]'
                    }`}
                  >
                    {isThreeWay ? `A ∩ B (${intersectionABOnly.length})` : `A ∩ B (${totalABOverlap.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVennFilter('only_a')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      activeVennFilter === 'only_a'
                        ? 'bg-[#1473E6] text-white'
                        : 'bg-[#F2F4F7] text-[#1473E6] hover:bg-[#E1E5EA]'
                    }`}
                  >
                    Only A ({onlyAProfiles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVennFilter('only_b')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                      activeVennFilter === 'only_b'
                        ? 'bg-[#7B2CBF] text-white'
                        : 'bg-[#F2F4F7] text-[#7B2CBF] hover:bg-[#E1E5EA]'
                    }`}
                  >
                    Only B ({onlyBProfiles.length})
                  </button>
                  {isThreeWay && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveVennFilter('only_c')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          activeVennFilter === 'only_c'
                            ? 'bg-[#0E7A36] text-white'
                            : 'bg-[#F2F4F7] text-[#0E7A36] hover:bg-[#E1E5EA]'
                        }`}
                      >
                        Only C ({onlyCProfiles.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVennFilter('intersection_ac')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          activeVennFilter === 'intersection_ac'
                            ? 'bg-[#0D66D0] text-white'
                            : 'bg-[#F2F4F7] text-[#0D66D0] hover:bg-[#E1E5EA]'
                        }`}
                      >
                        A ∩ C ({intersectionACOnly.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVennFilter('intersection_bc')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          activeVennFilter === 'intersection_bc'
                            ? 'bg-[#5A189A] text-white'
                            : 'bg-[#F2F4F7] text-[#5A189A] hover:bg-[#E1E5EA]'
                        }`}
                      >
                        B ∩ C ({intersectionBCOnly.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVennFilter('intersection_all')}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          activeVennFilter === 'intersection_all'
                            ? 'bg-[#0F172A] text-white'
                            : 'bg-[#F2F4F7] text-[#0F172A] hover:bg-[#E1E5EA]'
                        }`}
                      >
                        A ∩ B ∩ C ({intersectionAll.length})
                      </button>
                    </>
                  )}
                </div>
              </div>
              </div>
            </div>

            {/* Right: Selected Region Persona Diagnostics */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
                <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4]">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-white shrink-0" />
                      <span>Region Persona Diagnostics</span>
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shrink-0">
                      {displayedProfiles.shortLabel} • {regionStats.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 mt-1">
                    Computed directly across the {regionStats.count} profile{regionStats.count === 1 ? '' : 's'} in <strong className="text-white">{displayedProfiles.shortLabel}</strong>.
                  </p>
                </div>

                <div className="p-5 space-y-3">
                  <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#596780] uppercase">Average Customer Spend</span>
                      <p className="text-sm font-bold font-mono text-[#1E2229]">
                        ${regionStats.avgSpend.toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-[10px] border font-bold px-2 py-0.5 rounded ${regionStats.spendBadge.cls}`}>
                      {regionStats.spendBadge.text}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#596780] uppercase">Dominant Loyalty Tier</span>
                      <p className="text-sm font-bold text-[#1E2229]">{regionStats.topTier}</p>
                    </div>
                    <span className={`text-[10px] border font-bold px-2 py-0.5 rounded ${regionStats.tierBadge.cls}`}>
                      {regionStats.tierBadge.text}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#596780] uppercase">GDPR Privacy Consent</span>
                      <p className="text-sm font-bold font-mono text-[#1E2229]">
                        {regionStats.gdprRate}% Opt-in ({regionStats.targetableCount}/{regionStats.count} Targetable)
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#F2F4F7] text-[#1E2229] border border-[#D0D7DE] font-bold px-2 py-0.5 rounded">
                      DULE Evaluated
                    </span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded border border-[#E1E5EA] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#596780] uppercase">Top Product Category</span>
                      <p className="text-sm font-bold text-[#1E2229]">{regionStats.topCategory}</p>
                    </div>
                    <Tag className="w-4 h-4 text-[#0284C7]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#FAFBFD] rounded border border-[#CBD5E1] p-4 text-xs text-[#1E2229] space-y-2">
                <div className="flex items-center space-x-2 font-bold text-[#1E2229]">
                  <ShieldCheck className="w-4 h-4 text-[#1473E6]" />
                  <span>Recommended Activation Guardrail</span>
                </div>
                <p className="text-[11px] text-[#596780] leading-relaxed">
                  {totalABOverlap.length > 0 && !isSameSegmentSelected
                    ? `Suppressing ${totalABOverlap.length} overlapping profile(s) avoids duplicate ad spend and customer message fatigue across campaigns.`
                    : 'No duplicate targeting detected between Segment A and Segment B.'}
                </p>
              </div>
            </div>
          </div>

          {/* Matching Profiles Drilldown Table */}
          <div className="bg-white rounded-xl border border-[#E1E5EA] shadow-2xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span>{displayedProfiles.title}</span>
                  <span className="text-xs font-mono bg-white/15 text-white border border-white/25 px-2 py-0.5 rounded">
                    {displayedProfiles.profiles.length} Profiles
                  </span>
                </h3>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Live inspection of unified customer profiles satisfying the selected Venn region.
                </p>
              </div>
            </div>

            <div className="p-5">

            {displayedProfiles.profiles.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#D0D7DE] rounded-lg bg-[#FAFBFD]">
                <p className="text-xs font-semibold text-[#1E2229]">No profiles in this intersection region</p>
                <p className="text-[11px] text-[#596780] mt-0.5">
                  Select a different Venn region chip above (e.g. Only A or Only B) or adjust your segment criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E1E5EA] bg-[#F8FAFC] text-[#596780] font-semibold">
                      <th className="py-2.5 px-3">Unified Profile</th>
                      <th className="py-2.5 px-3">Customer Tier</th>
                      <th className="py-2.5 px-3">Total Spend</th>
                      <th className="py-2.5 px-3">Active Segments</th>
                      <th className="py-2.5 px-3">Consent Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EA]">
                    {displayedProfiles.profiles.map(p => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2.5">
                            {p.avatarUrl ? (
                              <img
                                src={resolveAvatarUrl(p.avatarUrl, p.id)}
                                alt={p.unifiedName}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-[#E1E5EA] shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA] flex items-center justify-center text-[10px] font-bold shrink-0">
                                {(p.unifiedName || 'U')
                                  .split(' ')
                                  .map(s => s[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-[#1E2229] truncate">{p.unifiedName}</p>
                              <p className="text-[10px] text-[#596780] font-mono truncate">{p.primaryEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                            {p.attributes?.customerTier || 'Silver'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#1E2229]">
                          ${(p.attributes?.totalSpend || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono bg-[#F2F4F7] text-[#1E2229] px-2 py-0.5 rounded border border-[#D0D7DE]">
                            {p.qualifyingAudienceIds?.length || 0} segments
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {isProfileDuleTargetable(p) ? (
                            <span className="text-[10px] text-[#0D66D0] font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                              <span>DULE Cleared</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#0A3D82] font-semibold flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#1E40AF]" />
                              <span>Restricted</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfileId(p.id);
                              setActiveTab('profiles');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-[#1473E6] hover:bg-[#EBF3FC] rounded transition-colors inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Profile 360</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
