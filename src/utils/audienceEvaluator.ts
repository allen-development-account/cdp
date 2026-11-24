import { AudienceRule, AudienceSegment, CustomerProfile } from '../types/cdp';

/**
 * Single authoritative rule evaluator shared across CDPContext,
 * AudienceBuilderView, and AudienceOverlapExplorerView.
 */
export function evaluateRule(profile: CustomerProfile, rule: AudienceRule): boolean {
  if (!rule.field || !rule.operator) return true;

  if (rule.category === 'attribute') {
    const val = (profile.attributes as any)?.[rule.field];
    if (rule.operator === 'equals') {
      return String(val ?? '').toLowerCase() === String(rule.value ?? '').toLowerCase();
    }
    if (rule.operator === 'not_equals') {
      return String(val ?? '').toLowerCase() !== String(rule.value ?? '').toLowerCase();
    }
    if (rule.operator === 'greater_than') return Number(val || 0) > Number(rule.value);
    if (rule.operator === 'gte') return Number(val || 0) >= Number(rule.value);
    if (rule.operator === 'less_than') return Number(val || 0) < Number(rule.value);
    if (rule.operator === 'lte') return Number(val || 0) <= Number(rule.value);
    if (rule.operator === 'contains') {
      return String(val ?? '').toLowerCase().includes(String(rule.value ?? '').toLowerCase());
    }
    if (rule.operator === 'is_set') return val !== undefined && val !== null && val !== '';
    if (rule.operator === 'is_not_set') return val === undefined || val === null || val === '';
    if (rule.operator === 'between') {
      const num = Number(val || 0);
      const min = Number(rule.value);
      const max = Number(rule.secondValue !== undefined ? rule.secondValue : rule.value);
      return num >= min && num <= max;
    }
    if (rule.operator === 'in') {
      const arr = Array.isArray(rule.value)
        ? rule.value.map(v => String(v).trim().toLowerCase())
        : String(rule.value ?? '').split(',').map(s => s.trim().toLowerCase());
      return arr.includes(String(val ?? '').toLowerCase());
    }
    return true;
  }

  if (rule.category === 'event') {
    const nowMs = Date.now();
    const windowMs = rule.timeWindowDays ? rule.timeWindowDays * 24 * 60 * 60 * 1000 : null;
    const matchingEvents = (profile.events || []).filter(e => {
      const matchesType = e.eventType === rule.field || e.eventType === rule.value;
      if (!matchesType) return false;
      if (windowMs && e.timestamp) {
        const ts = Date.parse(e.timestamp);
        if (!Number.isNaN(ts) && nowMs - ts > windowMs) {
          // Demo/historic dates in future or far past should still match unless event is genuinely older than lookback relative to latest activity
          const latestTs = Math.max(nowMs, ...profile.events.map(ev => Date.parse(ev.timestamp) || 0));
          if (latestTs - ts > windowMs) return false;
        }
      }
      return true;
    });

    const count = matchingEvents.length;
    if (rule.operator === 'event_performed') {
      const minCount = rule.minEventCount !== undefined ? rule.minEventCount : 1;
      return count >= minCount;
    }
    if (rule.operator === 'event_not_performed') {
      return count === 0;
    }
    if (rule.operator === 'gte') return count >= Number(rule.value || 1);
    if (rule.operator === 'equals') return count === Number(rule.value || 1);
    return count > 0;
  }

  if (rule.category === 'ai_predictive') {
    const score = (profile.predictions as any)?.[rule.field];
    if (rule.operator === 'gte' || rule.operator === 'greater_than') return Number(score || 0) >= Number(rule.value);
    if (rule.operator === 'lte' || rule.operator === 'less_than') return Number(score || 0) <= Number(rule.value);
    if (rule.operator === 'equals') return Number(score || 0) === Number(rule.value);
    return Number(score || 0) >= Number(rule.value);
  }

  if (rule.category === 'calculated_attribute') {
    if (rule.field === 'rolling_30d_total_spend') {
      return Number(profile.attributes?.totalSpend || 0) >= Number(rule.value);
    }
    if (rule.field === 'days_since_last_web_visit') {
      return Number(rule.value) >= 5;
    }
    if (rule.field === 'most_frequent_browse_category') {
      return String(profile.attributes?.preferredCategory || '')
        .toLowerCase()
        .includes(String(rule.value ?? '').toLowerCase());
    }
    return true;
  }

  if (rule.category === 'consent') {
    const cVal = (profile.consent as any)?.[rule.field];
    if (rule.operator === 'equals') return String(cVal) === String(rule.value);
    if (rule.operator === 'not_equals') return String(cVal) !== String(rule.value);
    return Boolean(cVal) === Boolean(rule.value);
  }

  return true;
}

export function evaluateAudienceRules(
  profile: CustomerProfile,
  rules: AudienceRule[],
  rulesMatch: 'ALL' | 'ANY'
): boolean {
  if (!rules || rules.length === 0) return true;
  if (rulesMatch === 'ALL') {
    return rules.every(r => evaluateRule(profile, r));
  }
  return rules.some(r => evaluateRule(profile, r));
}

export function evaluateAudience(
  profile: CustomerProfile,
  audience: AudienceSegment,
  allAudiences: AudienceSegment[] = [],
  visited: Set<string> = new Set()
): boolean {
  if (visited.has(audience.id)) return false;

  const matchesRules = evaluateAudienceRules(profile, audience.rules || [], audience.rulesMatch || 'ALL');
  if (!matchesRules) return false;

  if (audience.excludedAudienceIds && audience.excludedAudienceIds.length > 0) {
    const nextVisited = new Set(visited);
    nextVisited.add(audience.id);

    for (const excludedId of audience.excludedAudienceIds) {
      const excludedAudience = allAudiences.find(a => a.id === excludedId);
      if (excludedAudience && evaluateAudience(profile, excludedAudience, allAudiences, nextVisited)) {
        return false;
      }
    }
  }

  return true;
}

export function isProfileDuleTargetable(profile: CustomerProfile): boolean {
  return Boolean(profile.consent?.gdprConsent) && !Boolean(profile.consent?.ccpaOptOut);
}

/**
 * Atomically recomputes both:
 *  - each profile's `qualifyingAudienceIds`
 *  - each audience's `qualifyingProfileCount`, `targetableProfileCount`, and `estimatedReachPercentage`
 */
export function recomputeAllAudiencesAndProfiles(
  profiles: CustomerProfile[],
  audiences: AudienceSegment[]
): { profiles: CustomerProfile[]; audiences: AudienceSegment[] } {
  const nowIso = new Date().toISOString();
  const totalProfiles = profiles.length;

  const matchingProfileIdsByAudience = new Map<string, string[]>();
  const targetableCountByAudience = new Map<string, number>();

  for (const aud of audiences) {
    const matched = profiles.filter(p => evaluateAudience(p, aud, audiences));
    const targetableCount = matched.filter(isProfileDuleTargetable).length;
    matchingProfileIdsByAudience.set(
      aud.id,
      matched.map(p => p.id)
    );
    targetableCountByAudience.set(aud.id, targetableCount);
  }

  const nextProfiles = profiles.map(p => {
    const qualifyingIds = audiences
      .filter(aud => (matchingProfileIdsByAudience.get(aud.id) || []).includes(p.id))
      .map(aud => aud.id);
    return {
      ...p,
      qualifyingAudienceIds: qualifyingIds,
    };
  });

  const nextAudiences = audiences.map(aud => {
    const qCount = (matchingProfileIdsByAudience.get(aud.id) || []).length;
    const tCount = targetableCountByAudience.get(aud.id) || 0;
    return {
      ...aud,
      qualifyingProfileCount: qCount,
      targetableProfileCount: tCount,
      estimatedReachPercentage: totalProfiles > 0 ? Math.round((qCount / totalProfiles) * 100) : 0,
      lastCalculated: nowIso,
    };
  });

  return {
    profiles: nextProfiles,
    audiences: nextAudiences,
  };
}
