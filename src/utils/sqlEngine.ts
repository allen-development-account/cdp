/**
 * XLR8 Real-Time CDP - Embedded ANSI-SQL Query Engine
 * 
 * Provides an in-memory SQL compiler & execution engine for Data Distiller.
 * Supports:
 * - SELECT col1, col2, COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col)
 * - FROM xdm_individual_profile, xdm_experience_events, xdm_b2b_accounts, uploaded_records, datasets
 * - WHERE conditions (=, !=, <>, >, <, >=, <=, LIKE, IN, AND, OR, IS NULL, IS NOT NULL)
 * - GROUP BY
 * - ORDER BY col ASC/DESC
 * - LIMIT n
 */

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowsScanned: number;
  bytesProcessed: string;
  error?: string;
}

export interface SqlTableData {
  profiles: any[];
  events: any[];
  b2bAccounts?: any[];
  datasets?: any[];
  uploadedRecords?: any[];
}

export function executeSql(sql: string, data: SqlTableData): SqlQueryResult {
  const startTime = performance.now();
  const cleanSql = sql.trim().replace(/;+$/, '');

  try {
    // 1. Determine target table
    const fromMatch = cleanSql.match(/\bFROM\s+([a-zA-Z0-9_]+)/i);
    if (!fromMatch) {
      throw new Error('Missing or invalid FROM clause in SQL query.');
    }
    const tableName = fromMatch[1].toLowerCase();

    // 2. Select data source based on table name
    let sourceRows: Record<string, any>[] = [];
    if (tableName.includes('profile') || tableName === 'profiles') {
      sourceRows = data.profiles.map(p => ({
        profile_id: p.id,
        customer_name: p.unifiedName,
        email: p.primaryEmail,
        phone: p.primaryPhone || '—',
        crm_id: p.identities?.find((i: any) => i.namespace === 'CRM_ID')?.value || p.id,
        ecid: p.identities?.find((i: any) => i.namespace === 'ECID')?.value || '—',
        total_spend: p.attributes?.totalSpend ?? 0,
        purchase_count: p.attributes?.purchaseCount ?? 0,
        loyalty_tier: p.attributes?.loyaltyTier || 'Standard',
        churn_risk: p.predictions?.churnRisk ?? 25,
        predicted_ltv: p.predictions?.predictedLtv ?? 0,
        gdpr_consent: p.consent?.gdprConsent ? 'TRUE' : 'FALSE',
        ccpa_opt_out: p.consent?.ccpaOptOut ? 'TRUE' : 'FALSE',
        created_at: p.firstSeen || p.createdAt || '2026-01-15'
      }));
    } else if (tableName.includes('event') || tableName === 'events') {
      sourceRows = data.events.map((e, idx) => ({
        event_id: e.id || `evt_${idx}`,
        profile_id: e.profileId || e.customerId || '—',
        email: e.email || e.primaryEmail || '—',
        event_type: e.eventType || e.type || e.event_name || 'PageView',
        channel: e.channel || 'Web SDK',
        timestamp: e.timestamp || new Date().toISOString(),
        order_value: e.value || e.total_amount || e.order_total || 0,
        currency: e.currency || 'USD',
        page_url: e.page || e.url || '/'
      }));
    } else if (tableName.includes('b2b') || tableName.includes('account')) {
      sourceRows = (data.b2bAccounts || []).map(b => ({
        account_id: b.id,
        account_name: b.accountName,
        domain: b.domain,
        tier: b.accountTier,
        pipeline_value: b.totalPipelineValue || 0,
        intent_score: b.intentScore || 0,
        buying_group_count: b.buyingGroup?.length || 0
      }));
    } else if (tableName.includes('upload') || tableName === 'uploaded_records') {
      sourceRows = data.uploadedRecords && data.uploadedRecords.length > 0 
        ? data.uploadedRecords 
        : data.profiles.map(p => ({
            id: p.id,
            name: p.unifiedName,
            email: p.primaryEmail,
            total_spend: p.attributes?.totalSpend || 0
          }));
    } else if (tableName.includes('dataset')) {
      sourceRows = (data.datasets || []).map(d => ({
        dataset_id: d.id,
        dataset_name: d.name,
        record_count: d.recordCount || 0,
        schema_title: d.schemaTitle || d.schemaName || 'XDM Standard',
        dule_labels: Array.isArray(d.duleLabels) ? d.duleLabels.join(', ') : 'None'
      }));
    } else {
      // Default to profiles
      sourceRows = data.profiles.map(p => ({
        profile_id: p.id,
        name: p.unifiedName,
        email: p.primaryEmail,
        spend: p.attributes?.totalSpend || 0
      }));
    }

    const rowsScanned = sourceRows.length;

    // 3. Evaluate WHERE clause
    const whereMatch = cleanSql.match(/\bWHERE\s+([\s\S]+?)(?=\bGROUP\s+BY|\bORDER\s+BY|\bLIMIT|$)/i);
    let filteredRows = sourceRows;

    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      filteredRows = sourceRows.filter(row => evaluateWhere(row, whereClause));
    }

    // 4. Evaluate GROUP BY and SELECT projections
    const selectMatch = cleanSql.match(/\bSELECT\s+([\s\S]+?)\s+\bFROM\b/i);
    const selectClause = selectMatch ? selectMatch[1].trim() : '*';

    const groupByMatch = cleanSql.match(/\bGROUP\s+BY\s+([\s\S]+?)(?=\bORDER\s+BY|\bLIMIT|$)/i);
    const groupByCols = groupByMatch ? groupByMatch[1].split(',').map(s => s.trim().toLowerCase()) : null;

    let processedRows: Record<string, any>[] = [];
    let finalColumns: string[] = [];

    if (groupByCols && groupByCols.length > 0) {
      // Grouping aggregation
      const groups = new Map<string, Record<string, any>[]>();
      for (const row of filteredRows) {
        const groupKey = groupByCols.map(col => String(row[col] ?? '')).join(':::');
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(row);
      }

      processedRows = [];
      const parsedSelects = parseSelectExpressions(selectClause);

      for (const [, groupItems] of groups.entries()) {
        const representative = groupItems[0];
        const resultRow: Record<string, any> = {};

        for (const sel of parsedSelects) {
          if (sel.isAggregate) {
            resultRow[sel.alias] = computeAggregate(sel.aggType!, sel.argField, groupItems);
          } else {
            resultRow[sel.alias] = representative[sel.field] ?? null;
          }
        }
        processedRows.push(resultRow);
      }

      finalColumns = parsedSelects.map(s => s.alias);
    } else {
      // Non-grouped projection
      const parsedSelects = parseSelectExpressions(selectClause);

      if (parsedSelects.length === 1 && parsedSelects[0].field === '*') {
        processedRows = filteredRows;
        finalColumns = filteredRows.length > 0 ? Object.keys(filteredRows[0]) : ['result'];
      } else {
        const hasAggregates = parsedSelects.some(s => s.isAggregate);
        if (hasAggregates) {
          // Single row global aggregate
          const resultRow: Record<string, any> = {};
          for (const sel of parsedSelects) {
            if (sel.isAggregate) {
              resultRow[sel.alias] = computeAggregate(sel.aggType!, sel.argField, filteredRows);
            } else {
              resultRow[sel.alias] = filteredRows[0] ? filteredRows[0][sel.field] : null;
            }
          }
          processedRows = [resultRow];
          finalColumns = parsedSelects.map(s => s.alias);
        } else {
          processedRows = filteredRows.map(row => {
            const mapped: Record<string, any> = {};
            for (const sel of parsedSelects) {
              mapped[sel.alias] = row[sel.field] ?? null;
            }
            return mapped;
          });
          finalColumns = parsedSelects.map(s => s.alias);
        }
      }
    }

    // 5. Evaluate ORDER BY
    const orderByMatch = cleanSql.match(/\bORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
    if (orderByMatch) {
      const orderCol = orderByMatch[1].trim();
      const orderDir = (orderByMatch[2] || 'ASC').toUpperCase();
      processedRows.sort((a, b) => {
        const valA = a[orderCol];
        const valB = b[orderCol];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return orderDir === 'DESC' ? valB - valA : valA - valB;
        }
        return orderDir === 'DESC'
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      });
    }

    // 6. Evaluate LIMIT
    const limitMatch = cleanSql.match(/\bLIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limitVal = parseInt(limitMatch[1], 10);
      processedRows = processedRows.slice(0, limitVal);
    }

    const duration = Math.round((performance.now() - startTime) * 10) / 10;
    const approximateBytes = Math.round((JSON.stringify(sourceRows).length * 1.5) / 1024);

    return {
      columns: finalColumns.length > 0 ? finalColumns : ['empty_result'],
      rows: processedRows,
      executionTimeMs: Math.max(duration, 4),
      rowsScanned,
      bytesProcessed: `${approximateBytes} KB`
    };
  } catch (err: any) {
    return {
      columns: ['error'],
      rows: [{ error: err.message || 'SQL Execution error' }],
      executionTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
      rowsScanned: 0,
      bytesProcessed: '0 KB',
      error: err.message
    };
  }
}

interface SelectExpr {
  field: string;
  alias: string;
  isAggregate: boolean;
  aggType?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  argField?: string;
}

function parseSelectExpressions(selectStr: string): SelectExpr[] {
  const parts = splitTopLevelCommas(selectStr);
  return parts.map(part => {
    const trimmed = part.trim();
    // Check alias: "expr AS alias" or "expr alias"
    let expr = trimmed;
    let alias = trimmed;

    const asMatch = trimmed.match(/^([\s\S]+?)\s+\bAS\b\s+([a-zA-Z0-9_]+)$/i);
    if (asMatch) {
      expr = asMatch[1].trim();
      alias = asMatch[2].trim();
    } else {
      // Check simple alias like "COUNT(*) total"
      const simpleAliasMatch = trimmed.match(/^([\s\S]+?)\s+([a-zA-Z0-9_]+)$/);
      if (simpleAliasMatch && !simpleAliasMatch[1].toUpperCase().startsWith('CASE')) {
        expr = simpleAliasMatch[1].trim();
        alias = simpleAliasMatch[2].trim();
      }
    }

    // Check aggregate
    const aggMatch = expr.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(([\s\S]*?)\)$/i);
    if (aggMatch) {
      const aggType = aggMatch[1].toUpperCase() as any;
      const argField = aggMatch[2].trim();
      return {
        field: expr,
        alias: alias.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
        isAggregate: true,
        aggType,
        argField
      };
    }

    return {
      field: expr,
      alias: alias.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      isAggregate: false
    };
  });
}

function computeAggregate(aggType: string, argField: string | undefined, rows: any[]): any {
  if (aggType === 'COUNT') {
    if (!argField || argField === '*') return rows.length;
    return rows.filter(r => r[argField] !== undefined && r[argField] !== null).length;
  }

  const numericValues = rows
    .map(r => {
      const val = argField ? r[argField] : 0;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    })
    .filter((v): v is number => v !== null);

  if (numericValues.length === 0) return 0;

  if (aggType === 'SUM') {
    const sum = numericValues.reduce((a, b) => a + b, 0);
    return Math.round(sum * 100) / 100;
  }
  if (aggType === 'AVG') {
    const sum = numericValues.reduce((a, b) => a + b, 0);
    return Math.round((sum / numericValues.length) * 100) / 100;
  }
  if (aggType === 'MIN') {
    return Math.min(...numericValues);
  }
  if (aggType === 'MAX') {
    return Math.max(...numericValues);
  }

  return 0;
}

function evaluateWhere(row: Record<string, any>, whereClause: string): boolean {
  // Support AND / OR condition splits
  const orParts = whereClause.split(/\s+\bOR\b\s+/i);
  return orParts.some(orPart => {
    const andParts = orPart.split(/\s+\bAND\b\s+/i);
    return andParts.every(andCondition => evaluateSimpleCondition(row, andCondition.trim()));
  });
}

function evaluateSimpleCondition(row: Record<string, any>, condition: string): boolean {
  // Strip outer parenthesis if matched
  let cond = condition.trim();
  if (cond.startsWith('(') && cond.endsWith(')')) {
    cond = cond.slice(1, -1).trim();
  }

  // IS NOT NULL / IS NULL
  if (/\bIS\s+NOT\s+NULL\b/i.test(cond)) {
    const field = cond.replace(/\bIS\s+NOT\s+NULL\b/i, '').trim();
    return row[field] !== undefined && row[field] !== null && row[field] !== '';
  }
  if (/\bIS\s+NULL\b/i.test(cond)) {
    const field = cond.replace(/\bIS\s+NULL\b/i, '').trim();
    return row[field] === undefined || row[field] === null || row[field] === '';
  }

  // LIKE operator
  const likeMatch = cond.match(/^([a-zA-Z0-9_]+)\s+\bLIKE\b\s+['"](.*?)['"]$/i);
  if (likeMatch) {
    const field = likeMatch[1].trim();
    const pattern = likeMatch[2].replace(/%/g, '.*');
    const regex = new RegExp(`^${pattern}$`, 'i');
    return regex.test(String(row[field] ?? ''));
  }

  // IN operator
  const inMatch = cond.match(/^([a-zA-Z0-9_]+)\s+\bIN\b\s*\(([\s\S]+?)\)$/i);
  if (inMatch) {
    const field = inMatch[1].trim();
    const values = inMatch[2].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    return values.includes(String(row[field] ?? ''));
  }

  // Comparison operators: >=, <=, !=, <>, =, >, <
  const compMatch = cond.match(/^([a-zA-Z0-9_]+)\s*(>=|<=|!=|<>|=|>|<)\s*([\s\S]+)$/);
  if (!compMatch) return true;

  const field = compMatch[1].trim();
  const op = compMatch[2];
  let rawVal = compMatch[3].trim().replace(/^['"]|['"]$/g, '');

  const rowVal = row[field];
  if (rowVal === undefined) return false;

  const numRowVal = typeof rowVal === 'number' ? rowVal : parseFloat(String(rowVal).replace(/[^0-9.-]/g, ''));
  const numTargetVal = parseFloat(rawVal);

  const isNumericComp = !isNaN(numRowVal) && !isNaN(numTargetVal) && !isNaN(Number(rawVal));

  if (isNumericComp) {
    if (op === '=') return numRowVal === numTargetVal;
    if (op === '!=' || op === '<>') return numRowVal !== numTargetVal;
    if (op === '>') return numRowVal > numTargetVal;
    if (op === '<') return numRowVal < numTargetVal;
    if (op === '>=') return numRowVal >= numTargetVal;
    if (op === '<=') return numRowVal <= numTargetVal;
  } else {
    const strRowVal = String(rowVal).toLowerCase();
    const strTargetVal = rawVal.toLowerCase();
    if (op === '=') return strRowVal === strTargetVal;
    if (op === '!=' || op === '<>') return strRowVal !== strTargetVal;
    if (op === '>') return strRowVal > strTargetVal;
    if (op === '<') return strRowVal < strTargetVal;
  }

  return true;
}

function splitTopLevelCommas(str: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current) result.push(current);
  return result;
}
