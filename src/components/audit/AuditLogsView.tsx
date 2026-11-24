import React, { useState, useMemo } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { AuditLogEntry } from '../../types/cdp';
import {
  ShieldCheck,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  FileCode,
  Lock,
  Database,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Layers,
  Fingerprint,
  Info,
  ArrowUpDown,
  PlusCircle,
  Send
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, addAuditLog, addTerminalLog } = useCDP();

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [selectedLogForModal, setSelectedLogForModal] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // New simulation form state
  const [simAction, setSimAction] = useState('Update DULE Retention Policy for PII');
  const [simCategory, setSimCategory] = useState<AuditLogEntry['category']>('Privacy & Consent');
  const [simUserRole, setSimUserRole] = useState<AuditLogEntry['userRole']>('Data Protection Officer (DPO)');
  const [simTarget, setSimTarget] = useState('xdm_individual_profile.pii_fields');
  const [simSummary, setSimSummary] = useState('Updated data retention horizon from 730 days to 365 days under GDPR Article 5(1)(e).');

  const categories = [
    'ALL',
    'Administrative Action',
    'Schema & Ingestion',
    'Privacy & Consent',
    'Identity Graph',
    'Security & Auth',
    'Audience & Activation'
  ];

  const roles = [
    'ALL',
    'Super Admin',
    'Data Architect',
    'Data Protection Officer (DPO)',
    'SecOps Engineer',
    'Automation Agent',
    'Compliance Auditor'
  ];

  const statuses = ['ALL', 'SUCCESS', 'WARNING', 'FAILED'];

  // Filtered & Sorted logs (chronological: newest first)
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }
      // Role filter
      if (selectedRole !== 'ALL' && log.userRole !== selectedRole) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && log.status !== selectedStatus) {
        return false;
      }
      // Search query (matches action, userId, userName, targetEntity, summary, IP, complianceFlags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesUser = log.userName.toLowerCase().includes(q) || log.userId.toLowerCase().includes(q);
        const matchesTarget = log.targetEntity.toLowerCase().includes(q);
        const matchesSummary = log.summary.toLowerCase().includes(q);
        const matchesIp = log.ipAddress.toLowerCase().includes(q);
        const matchesFlags = log.complianceFlags.some(f => f.toLowerCase().includes(q));
        if (!matchesAction && !matchesUser && !matchesTarget && !matchesSummary && !matchesIp && !matchesFlags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, selectedCategory, selectedRole, selectedStatus, searchQuery]);

  // Telemetry metrics
  const totalLogs = auditLogs.length;
  const adminLogsCount = auditLogs.filter(l => l.category === 'Administrative Action').length;
  const schemaLogsCount = auditLogs.filter(l => l.category === 'Schema & Ingestion').length;
  const privacyLogsCount = auditLogs.filter(l => l.category === 'Privacy & Consent').length;
  const securityLogsCount = auditLogs.filter(l => l.category === 'Security & Auth').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (format: 'JSON' | 'CSV') => {
    if (format === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `nexus_cdp_audit_ledger_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['ID', 'Timestamp', 'User ID', 'User Name', 'Role', 'Category', 'Action', 'Target Entity', 'Status', 'IP Address', 'Summary', 'Compliance Flags'];
      const rows = filteredLogs.map(l => [
        `"${l.id}"`,
        `"${l.timestamp}"`,
        `"${l.userId}"`,
        `"${l.userName}"`,
        `"${l.userRole}"`,
        `"${l.category}"`,
        `"${l.action.replace(/"/g, '""')}"`,
        `"${l.targetEntity.replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${l.ipAddress}"`,
        `"${l.summary.replace(/"/g, '""')}"`,
        `"${l.complianceFlags.join('; ')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `nexus_cdp_audit_trail_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    addTerminalLog('info', 'AUDIT', `Exported ${filteredLogs.length} audit trail records in ${format} format`);
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actorMap: Record<AuditLogEntry['userRole'], { name: string; email: string; ip: string }> = {
      'Super Admin': { name: 'Elena Rostova', email: 'usr_admin_elena@nexus.enterprise.io', ip: '194.105.140.12' },
      'Data Architect': { name: 'Dr. Arthur Chen', email: 'usr_arch_chen@nexus.enterprise.io', ip: '172.56.21.90' },
      'Data Protection Officer (DPO)': { name: 'Sophia Laurent', email: 'usr_dpo_sophia@privacy.nexus.io', ip: '10.240.4.19' },
      'SecOps Engineer': { name: 'Marcus Vance', email: 'usr_sec_marcus@nexus.enterprise.io', ip: '192.241.142.88' },
      'Automation Agent': { name: 'Autonomous Drift Sentinel Agent', email: 'system_autonomous_sentinel', ip: '10.240.0.8' },
      'Compliance Auditor': { name: 'Lukas Hansen', email: 'usr_auditor_hansen@deloitte.com', ip: '62.216.4.11' }
    };

    const actor = actorMap[simUserRole];
    addAuditLog({
      userId: actor.email,
      userName: actor.name,
      userRole: simUserRole,
      category: simCategory,
      action: simAction,
      targetEntity: simTarget,
      status: 'SUCCESS',
      ipAddress: actor.ip,
      client: 'NEXUS Administrative Web Console v4.2',
      summary: simSummary,
      details: {
        jsonPayload: {
          simulatedBy: 'User Demonstration Console',
          timestamp: new Date().toISOString(),
          actorEmail: actor.email,
          targetEntity: simTarget
        }
      },
      complianceFlags: ['SOC2 Type II', 'Immutable Ledger Audit', 'ISO 27001']
    });

    addTerminalLog('success', 'AUDIT', `Recorded new audit log: [${simAction}] by ${actor.name}`);
    setIsSimulateModalOpen(false);
  };

  const getCategoryColor = (cat: AuditLogEntry['category']) => {
    switch (cat) {
      case 'Administrative Action':
        return 'bg-[#EBF3FC] text-[#1473E6] border-[#C5DCFA]';
      case 'Schema & Ingestion':
        return 'bg-[#DEFBE6] text-[#0E7A36] border-[#A1ECC4]';
      case 'Privacy & Consent':
        return 'bg-[#FFF0D4] text-[#C76A00] border-[#FFD085]';
      case 'Identity Graph':
        return 'bg-[#F2EDFC] text-[#7A3EB0] border-[#D6C4F7]';
      case 'Security & Auth':
        return 'bg-[#FDE6E8] text-[#D7373F] border-[#F88B8B]';
      case 'Audience & Activation':
        return 'bg-[#DEFBE6] text-[#0E7A36] border-[#A1ECC4]';
      default:
        return 'bg-[#F2F4F7] text-[#1E2229] border-[#E1E5EA]';
    }
  };

  const getStatusBadge = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DEFBE6] text-[#0E7A36] border border-[#A1ECC4]">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUCCESS</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF0D4] text-[#C76A00] border border-[#FFD085]">
            <AlertTriangle className="w-3 h-3" />
            <span>WARNING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDE6E8] text-[#D7373F] border border-[#F88B8B]">
            <XCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F2F4F7] text-[#1E2229] border border-[#E1E5EA]">
            <span>{status}</span>
          </span>
        );
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return {
        dateStr: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        timeStr: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        iso: ts
      };
    } catch {
      return { dateStr: ts, timeStr: '', iso: ts };
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border border-[#0E4DA4] rounded-xl p-5 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_governance" fallbackLabel="Privacy & Governance" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight">Audit Logs & Compliance Ledger</h1>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-[#8CE2A7] border border-[#8CE2A7]/40 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CE2A7] animate-pulse" />
                <span>Immutable SHA-256 Ledger</span>
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Chronological history of all administrative actions, XDM schema evolutions, and privacy consent updates with User IDs and cryptographic timestamps.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded border border-white/25 transition-colors shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-100" />
            <span>Record Action</span>
          </button>

          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded border border-white/25 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-100" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleExport('JSON')}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-3 py-1.5 rounded shadow-2xs transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export JSON Ledger</span>
          </button>
        </div>
      </div>

      {/* Telemetry Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-medium text-[#1E2229]">Total Audit Events</p>
            <p className="text-2xl font-bold text-[#2C2C2C] mt-0.5">{totalLogs}</p>
            <span className="text-[11px] text-[#0E7A36] font-semibold">100% tamper-evident</span>
          </div>
          <div className="w-10 h-10 rounded bg-[#F2F4F7] border border-[#E1E5EA] flex items-center justify-center text-[#1E2229]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-medium text-[#1E2229]">Admin & IAM Events</p>
            <p className="text-2xl font-bold text-[#1473E6] mt-0.5">{adminLogsCount + securityLogsCount}</p>
            <span className="text-[11px] text-[#1473E6]">RBAC & Secrets</span>
          </div>
          <div className="w-10 h-10 rounded bg-[#EBF3FC] border border-[#C5DCFA] flex items-center justify-center text-[#1473E6]">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-medium text-[#1E2229]">Schema & Ingestion</p>
            <p className="text-2xl font-bold text-[#0E7A36] mt-0.5">{schemaLogsCount}</p>
            <span className="text-[11px] text-[#0E7A36]">XDM Evolution & DLQ</span>
          </div>
          <div className="w-10 h-10 rounded bg-[#DEFBE6] border border-[#A1ECC4] flex items-center justify-center text-[#0E7A36]">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-medium text-[#1E2229]">Privacy & Consent</p>
            <p className="text-2xl font-bold text-[#C76A00] mt-0.5">{privacyLogsCount}</p>
            <span className="text-[11px] text-[#C76A00]">GDPR & CCPA Opt-Outs</span>
          </div>
          <div className="w-10 h-10 rounded bg-[#FFF0D4] border border-[#FFD085] flex items-center justify-center text-[#C76A00]">
            <Fingerprint className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#1E2229] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, User ID, user name, target entity, IP address, or compliance flag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded pl-9 pr-4 py-1.5 text-xs text-[#2C2C2C] placeholder-[#6E6E6E] focus:outline-none focus:ring-1 focus:ring-[#1473E6] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1E2229] hover:text-[#2C2C2C]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Clear All Filters */}
          {(selectedCategory !== 'ALL' || selectedRole !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-[#1473E6] hover:underline font-semibold px-2 py-1 shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E1E5EA]">
          <div>
            <label className="block text-[11px] font-semibold text-[#1A1D23] mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1A1D23] mb-1">Actor Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r === 'ALL' ? 'All User Roles' : r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1A1D23] mb-1">Execution Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table / List */}
      <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-[#E1E5EA] flex items-center justify-between bg-[#F2F4F7]">
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold text-[#2C2C2C]">Chronological Audit Events</h2>
            <span className="text-[10px] bg-[#FFFFFF] text-[#1A1D23] border border-[#D5D5D5] px-2 py-0.5 rounded font-mono">
              {filteredLogs.length} of {auditLogs.length} events
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#1E2229]">
            <Clock className="w-3.5 h-3.5 text-[#1E2229]" />
            <span>Ordered newest first (UTC/Local)</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center mx-auto mb-2 text-[#1E2229]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-[#2C2C2C]">No audit records match your filters</h3>
            <p className="text-xs text-[#1E2229] mt-0.5 max-w-sm mx-auto">
              Try adjusting your search query, clearing category filters, or selecting a broader role.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E1E5EA]">
            {filteredLogs.map((log) => {
              const formattedTime = formatTimestamp(log.timestamp);
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="transition-colors hover:bg-[#F9FAFB]">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Timestamp & User Info */}
                    <div className="flex items-start space-x-3.5 lg:w-1/3 shrink-0">
                      <button className="mt-0.5 text-[#1E2229] hover:text-[#2C2C2C]">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div>
                        {/* Timestamp */}
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#2C2C2C]">{formattedTime.timeStr}</span>
                          <span className="text-[11px] text-[#1E2229] font-mono">{formattedTime.dateStr}</span>
                        </div>

                        {/* User & Role */}
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <User className="w-3 h-3 text-[#1E2229]" />
                          <span className="text-xs font-semibold text-[#2C2C2C]">{log.userName}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono text-[#1E2229] truncate max-w-[190px]" title={log.userId}>
                            {log.userId}
                          </span>
                          <span className="text-[10px] bg-[#F2F4F7] text-[#1A1D23] px-1.5 py-0.2 rounded border border-[#E1E5EA] font-mono">
                            {log.userRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Action, Target Entity, and Summary */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#2C2C2C] truncate">{log.action}</h4>
                      </div>

                      <p className="text-xs text-[#1A1D23] mt-1 line-clamp-1">
                        {log.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                        <span className="text-[#1E2229] font-medium">Target:</span>
                        <code className="text-[#1473E6] bg-[#EBF3FC] px-1.5 py-0.5 rounded border border-[#C5DCFA] text-[10px] font-mono">
                          {log.targetEntity}
                        </code>
                        <span className="text-[#D5D5D5]">•</span>
                        <span className="text-[#1E2229] text-[10px] font-mono">IP: {log.ipAddress}</span>
                      </div>
                    </div>

                    {/* Right: Status & Compliance Badges */}
                    <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-2 shrink-0">
                      <div>{getStatusBadge(log.status)}</div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {log.complianceFlags.slice(0, 2).map((flag, idx) => (
                          <span key={idx} className="text-[9px] font-mono bg-[#F2F4F7] text-[#1A1D23] px-1.5 py-0.5 rounded border border-[#E1E5EA]">
                            {flag}
                          </span>
                        ))}
                        {log.complianceFlags.length > 2 && (
                          <span className="text-[9px] font-mono text-[#1E2229] self-center">
                            +{log.complianceFlags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 bg-[#F9FAFB] border-t border-[#E1E5EA] space-y-4">
                      {/* Summary callout */}
                      <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-3.5 text-xs shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                            <Info className="w-3.5 h-3.5 text-[#1473E6]" />
                            <span>Action Execution Narrative</span>
                          </span>
                          <button
                            onClick={() => setSelectedLogForModal(log)}
                            className="text-[#1473E6] hover:underline text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Full Ledger Inspector</span>
                          </button>
                        </div>
                        <p className="text-[#1A1D23] leading-relaxed">{log.summary}</p>
                      </div>

                      {/* Before and After State Diff */}
                      {log.details && (log.details.before || log.details.after) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {log.details.before && (
                            <div className="bg-[#FDE6E8]/40 border border-[#F88B8B] rounded p-3 text-xs">
                              <span className="text-[11px] font-bold text-[#D7373F] uppercase tracking-wider block mb-1">
                                Prior State (Before)
                              </span>
                              <p className="font-mono text-[11px] text-[#2C2C2C] break-words">{log.details.before}</p>
                            </div>
                          )}
                          {log.details.after && (
                            <div className="bg-[#DEFBE6]/40 border border-[#A1ECC4] rounded p-3 text-xs">
                              <span className="text-[11px] font-bold text-[#0E7A36] uppercase tracking-wider block mb-1">
                                Modified State (After)
                              </span>
                              <p className="font-mono text-[11px] text-[#2C2C2C] break-words">{log.details.after}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* JSON Payload Inspection */}
                      {log.details?.jsonPayload && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-[#1E2229] uppercase tracking-wider font-mono">
                              Contextual Metadata Payload
                            </span>
                            <button
                              onClick={() => handleCopy(JSON.stringify(log.details?.jsonPayload, null, 2), log.id)}
                              className="text-[#1E2229] hover:text-[#2C2C2C] text-[11px] flex items-center space-x-1"
                            >
                              {copiedId === log.id ? <Check className="w-3 h-3 text-[#0E7A36]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === log.id ? 'Copied' : 'Copy JSON'}</span>
                            </button>
                          </div>
                          <pre className="bg-[#FFFFFF] border border-[#E1E5EA] rounded p-3 text-[11px] font-mono text-[#1473E6] overflow-x-auto">
                            {JSON.stringify(log.details.jsonPayload, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Client Agent and Compliance Frameworks */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#1E2229] pt-2 border-t border-[#E1E5EA]">
                        <div className="flex items-center space-x-2">
                          <span>Client: <strong className="text-[#2C2C2C] font-mono">{log.client}</strong></span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span>Enforced Frameworks:</span>
                          {log.complianceFlags.map((flag, idx) => (
                            <span key={idx} className="bg-[#F2F4F7] text-[#1A1D23] px-2 py-0.5 rounded text-[10px] font-mono border border-[#E1E5EA]">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Full Audit Inspector */}
      {selectedLogForModal && (
        <div className="fixed inset-0 bg-[#2C2C2C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#E1E5EA] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded bg-[#EBF3FC] text-[#1473E6] flex items-center justify-center border border-[#C5DCFA]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C]">Immutable Ledger Proof #{selectedLogForModal.id}</h3>
                  <p className="text-[11px] text-[#1E2229]">Cryptographically signed audit receipt</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForModal(null)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-xs font-semibold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F2F4F7] p-4 rounded border border-[#E1E5EA]">
                <div>
                  <span className="text-[#1E2229] font-mono text-[10px] uppercase">Actor Name</span>
                  <p className="font-semibold text-[#2C2C2C] mt-0.5">{selectedLogForModal.userName}</p>
                </div>
                <div>
                  <span className="text-[#1E2229] font-mono text-[10px] uppercase">Actor User ID</span>
                  <p className="font-mono text-[#2C2C2C] text-[11px] mt-0.5">{selectedLogForModal.userId}</p>
                </div>
                <div>
                  <span className="text-[#1E2229] font-mono text-[10px] uppercase">Timestamp (ISO 8601)</span>
                  <p className="font-mono text-[#2C2C2C] text-[11px] mt-0.5">{selectedLogForModal.timestamp}</p>
                </div>
                <div>
                  <span className="text-[#1E2229] font-mono text-[10px] uppercase">IP Address / Client</span>
                  <p className="font-mono text-[#2C2C2C] text-[11px] mt-0.5">{selectedLogForModal.ipAddress}</p>
                </div>
              </div>

              <div>
                <span className="text-[#1A1D23] font-semibold block mb-1">Action & Target</span>
                <p className="text-[#2C2C2C] font-bold text-sm">{selectedLogForModal.action}</p>
                <code className="text-[#1473E6] bg-[#EBF3FC] px-2 py-0.5 rounded border border-[#C5DCFA] text-[11px] font-mono inline-block mt-1">
                  {selectedLogForModal.targetEntity}
                </code>
              </div>

              <div>
                <span className="text-[#1A1D23] font-semibold block mb-1">Action Description</span>
                <p className="text-[#2C2C2C] bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA] leading-relaxed">
                  {selectedLogForModal.summary}
                </p>
              </div>

              {selectedLogForModal.details && (
                <div>
                  <span className="text-[#1A1D23] font-semibold block mb-1 font-mono">Payload Ledger</span>
                  <pre className="bg-[#FFFFFF] border border-[#E1E5EA] p-3 rounded text-[11px] font-mono text-[#0E7A36] overflow-x-auto">
                    {JSON.stringify(selectedLogForModal.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#E1E5EA] bg-[#F2F4F7] flex items-center justify-between">
              <span className="text-[11px] text-[#1E2229] font-mono">
                Ledger SHA-256: e8b9...77a1 (Signed)
              </span>
              <button
                onClick={() => handleCopy(JSON.stringify(selectedLogForModal, null, 2), 'modal_copy')}
                className="bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold px-3.5 py-1.5 rounded flex items-center space-x-1 shadow-2xs"
              >
                {copiedId === 'modal_copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === 'modal_copy' ? 'Copied Receipt' : 'Copy Signed JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Simulate / Record Administrative Action */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 bg-[#2C2C2C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] border border-[#E1E5EA] rounded max-w-lg w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#E1E5EA] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-[#EBF3FC] text-[#1473E6] flex items-center justify-center border border-[#C5DCFA]">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#2C2C2C]">Record Administrative / Privacy Action</h3>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-[#1E2229] hover:text-[#2C2C2C] text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#1A1D23] font-semibold mb-1">Action Name</label>
                <input
                  type="text"
                  required
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3.5 py-1.5 text-[#2C2C2C] placeholder-[#6E6E6E] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1A1D23] font-semibold mb-1">Category</label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value as AuditLogEntry['category'])}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                  >
                    <option value="Administrative Action">Administrative Action</option>
                    <option value="Schema & Ingestion">Schema & Ingestion</option>
                    <option value="Privacy & Consent">Privacy & Consent</option>
                    <option value="Identity Graph">Identity Graph</option>
                    <option value="Security & Auth">Security & Auth</option>
                    <option value="Audience & Activation">Audience & Activation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1A1D23] font-semibold mb-1">Actor Role</label>
                  <select
                    value={simUserRole}
                    onChange={(e) => setSimUserRole(e.target.value as AuditLogEntry['userRole'])}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                  >
                    <option value="Super Admin">Super Admin (Elena Rostova)</option>
                    <option value="Data Architect">Data Architect (Dr. Arthur Chen)</option>
                    <option value="Data Protection Officer (DPO)">DPO (Sophia Laurent)</option>
                    <option value="SecOps Engineer">SecOps (Marcus Vance)</option>
                    <option value="Automation Agent">Automation Agent (Sentinel)</option>
                    <option value="Compliance Auditor">Auditor (Lukas Hansen)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1A1D23] font-semibold mb-1">Target Entity / Resource</label>
                <input
                  type="text"
                  required
                  value={simTarget}
                  onChange={(e) => setSimTarget(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3.5 py-1.5 text-[#2C2C2C] placeholder-[#6E6E6E] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
                />
              </div>

              <div>
                <label className="block text-[#1A1D23] font-semibold mb-1">Summary / Audit Description</label>
                <textarea
                  rows={3}
                  required
                  value={simSummary}
                  onChange={(e) => setSimSummary(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3.5 py-1.5 text-[#2C2C2C] placeholder-[#6E6E6E] focus:outline-none focus:ring-1 focus:ring-[#1473E6] resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E1E5EA]">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-[#FFFFFF] hover:bg-[#F2F4F7] border border-[#D5D5D5] text-[#2C2C2C] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit to Audit Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
