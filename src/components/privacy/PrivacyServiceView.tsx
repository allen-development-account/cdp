import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import { PrivacyDsarRequest } from '../../types/cdp';
import {
  ShieldCheck,
  ShieldAlert,
  UserX,
  FileCheck,
  Download,
  Trash2,
  Lock,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Key,
  X
} from 'lucide-react';

export const PrivacyServiceView: React.FC = () => {
  const { dsarRequests, submitDsarRequest, profiles, addTerminalLog } = useCDP();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegulation, setSelectedRegulation] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PrivacyDsarRequest | null>(null);

  // Form state
  const [requestType, setRequestType] = useState<PrivacyDsarRequest['requestType']>('ACCESS_EXPORT');
  const [subjectIdType, setSubjectIdType] = useState<PrivacyDsarRequest['subjectIdentifierType']>('email');
  const [subjectIdValue, setSubjectIdValue] = useState('');
  const [regulation, setRegulation] = useState<PrivacyDsarRequest['regulation']>('GDPR (EU)');

  const filteredRequests = dsarRequests.filter(r => {
    const matchesSearch = r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subjectIdentifierValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReg = selectedRegulation === 'All' || r.regulation.includes(selectedRegulation);
    return matchesSearch && matchesReg;
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectIdValue) return;

    const res = submitDsarRequest({
      requestType,
      subjectIdentifierType: subjectIdType,
      subjectIdentifierValue: subjectIdValue.trim(),
      regulation,
      status: 'COMPLETED',
      notes: ''
    });

    setIsModalOpen(false);
    setSelectedReceipt(res);
    setSubjectIdValue('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-[#2C2C2C]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white rounded-xl border border-[#0E4DA4] shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <PageBackButton fallbackTab="hub_governance" fallbackLabel="Privacy & Governance" className="mt-1 shrink-0" />
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Privacy Rights & DSAR Service</h2>
              <span className="text-[10px] bg-white/15 text-white border border-white/25 font-bold px-2 py-0.5 rounded uppercase">
                XLR8 Privacy Service
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Automated Data Subject Access Requests (DSAR) processing for GDPR, CCPA/CPRA, and LGPD with graph-wide identity erasure and SHA-256 compliance receipts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-[#F2F4F7] text-[#0D66D0] text-xs font-semibold px-3.5 py-1.5 rounded shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit DSAR Request</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Total Requests</span>
            <FileCheck className="w-3.5 h-3.5 text-[#1473E6]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">{dsarRequests.length}</p>
          <span className="text-[10px] text-[#0E7A36] font-semibold mt-1 block">100% Processed in SLA</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Right to Forget Erased</span>
            <Trash2 className="w-3.5 h-3.5 text-[#0A3D82]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">
            {dsarRequests.filter(r => r.requestType === 'DELETE_FORGET').length} Profiles
          </p>
          <span className="text-[10px] text-[#1E2229] font-semibold mt-1 block">PII Shredded</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">CCPA Opt-Out Enforced</span>
            <Lock className="w-3.5 h-3.5 text-[#1D4ED8]" />
          </div>
          <p className="text-xl font-bold text-[#2C2C2C] mt-1 font-mono">
            {dsarRequests.filter(r => r.requestType === 'OPT_OUT_SALE').length} Identifiers
          </p>
          <span className="text-[10px] text-[#C76A00] font-semibold mt-1 block">Ad Networks Suppressed</span>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded border border-[#E1E5EA] shadow-2xs">
          <div className="flex items-center justify-between text-[#1E2229] text-xs font-medium">
            <span className="text-[10px] uppercase font-bold text-[#1E2229]">Average Resolution</span>
            <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
          </div>
          <p className="text-xl font-bold text-[#0E7A36] mt-1 font-mono">&lt; 1.2s</p>
          <span className="text-[10px] text-[#0E7A36] font-semibold mt-1 block">Real-Time Graph Traversal</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#1E2229] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Request ID, email, or identity token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs rounded border border-[#D5D5D5] text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#1473E6]"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'GDPR', 'CCPA', 'LGPD'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegulation(reg)}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                selectedRegulation === reg
                  ? 'bg-[#1473E6] text-white shadow-2xs'
                  : 'bg-[#FFFFFF] text-[#1A1D23] hover:bg-[#F2F4F7] border border-[#D5D5D5]'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E1E5EA] overflow-hidden shadow-2xs">
        <div className="bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white px-5 py-3.5 border-b border-[#0E4DA4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">DSAR Compliance & Rights Execution Log</h3>
            <p className="text-[11px] text-blue-100 mt-0.5">
              Verified graph-wide privacy jobs with cryptographic SHA-256 compliance receipts.
            </p>
          </div>
          <span className="text-xs font-mono bg-white/15 border border-white/25 text-white px-2.5 py-1 rounded shrink-0 self-start sm:self-center tabular-nums">
            {filteredRequests.length} Request{filteredRequests.length === 1 ? '' : 's'}
          </span>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F2F4F7] border-b border-[#E1E5EA] text-[#1E2229] font-semibold">
              <th className="py-2.5 px-4">Request Code</th>
              <th className="py-2.5 px-4">Type & Regulation</th>
              <th className="py-2.5 px-4">Target Data Subject</th>
              <th className="py-2.5 px-4">Graph Traversal & Action</th>
              <th className="py-2.5 px-4">Status & SLA</th>
              <th className="py-2.5 px-4 text-right">Audit Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E5EA]">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-[#1473E6]">{req.requestId}</span>
                  <p className="text-[10px] text-[#1E2229] mt-0.5">{new Date(req.submittedAt).toLocaleDateString()}</p>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      req.requestType === 'DELETE_FORGET'
                        ? 'bg-[#FDE6E8] text-[#D7373F] border-[#F88B8B]'
                        : req.requestType === 'OPT_OUT_SALE'
                        ? 'bg-[#FFF0D4] text-[#C76A00] border-[#FFD085]'
                        : 'bg-[#EBF3FC] text-[#1473E6] border-[#C5DCFA]'
                    }`}>
                      {req.requestType === 'DELETE_FORGET' ? 'Right to be Forgotten' : req.requestType === 'OPT_OUT_SALE' ? 'Opt-Out of Sale' : 'Access Data Export'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1E2229] mt-0.5">{req.regulation}</p>
                </td>

                <td className="py-3 px-4">
                  <span className="font-mono text-[#2C2C2C] font-semibold">{req.subjectIdentifierValue}</span>
                  <p className="text-[10px] text-[#1E2229] uppercase">Type: {req.subjectIdentifierType}</p>
                </td>

                <td className="py-3 px-4">
                  <p className="text-[#1A1D23] text-[11px] leading-snug">{req.notes}</p>
                </td>

                <td className="py-3 px-4">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-[#EBF3FC] text-[#0D66D0] px-2 py-0.5 rounded border border-[#BFDBFE]">
                    <CheckCircle2 className="w-3 h-3 text-[#0284C7]" />
                    <span>{req.status}</span>
                  </span>
                  <p className="text-[10px] text-[#1E2229] mt-0.5">{req.daysRemaining}d SLA Window</p>
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedReceipt(req)}
                    className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#2C2C2C] border border-[#D5D5D5] font-semibold rounded text-xs transition-colors shadow-2xs"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compliance Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-[#2C2C2C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#1473E6]" />
                <h3 className="text-base font-bold text-[#2C2C2C]">Cryptographic Privacy Audit Receipt</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-[#1E2229] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-[#F2F4F7] p-3 rounded border border-[#E1E5EA] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#1E2229]">Job Reference:</span>
                  <span className="font-mono font-bold text-[#1473E6]">{selectedReceipt.requestId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E2229]">Regulation Standard:</span>
                  <span className="font-semibold text-[#2C2C2C]">{selectedReceipt.regulation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E2229]">Subject Identifier:</span>
                  <span className="font-mono text-[#2C2C2C] font-semibold">{selectedReceipt.subjectIdentifierValue}</span>
                </div>
              </div>

              <div>
                <span className="block font-semibold text-[#1A1D23] mb-1">SHA-256 Compliance Signature Hash</span>
                <div className="bg-[#1E1E1E] text-[#7DD3FC] font-mono text-[11px] p-2.5 rounded border border-[#3E3E3E] break-all">
                  {selectedReceipt.complianceCertHash}
                </div>
              </div>

              <div className="p-3 bg-[#EBF3FC] rounded border border-[#BFDBFE] text-[#0A3D82] text-xs">
                <p className="font-bold flex items-center space-x-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D66D0]" />
                  <span>Legally Enforced Audit Seal</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  All downstream activation connectors (Meta, Google, Salesforce) and edge clusters have synchronized this privacy job across all distributed storage shards.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white font-semibold rounded text-xs shadow-2xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit DSAR Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C2C2C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] rounded max-w-lg w-full border border-[#E1E5EA] shadow-xl p-6">
            <div className="flex items-center justify-between border-b border-[#E1E5EA] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">Initiate Privacy Rights / DSAR Job</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#1E2229] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                >
                  <option value="ACCESS_EXPORT">Right of Access (Download Profile Archive)</option>
                  <option value="DELETE_FORGET">Right to be Forgotten (Cryptographic Erasure)</option>
                  <option value="OPT_OUT_SALE">Do Not Sell / Share My Personal Information (CCPA/DULE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Identifier Type</label>
                  <select
                    value={subjectIdType}
                    onChange={(e) => setSubjectIdType(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  >
                    <option value="email">Email Address</option>
                    <option value="cookie">Anonymous Cookie ID (cid)</option>
                    <option value="phone">Phone Number</option>
                    <option value="crmId">CRM Customer ID</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1D23] mb-1">Regulation Framework</label>
                  <select
                    value={regulation}
                    onChange={(e) => setRegulation(e.target.value as any)}
                    className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                  >
                    <option value="GDPR (EU)">GDPR (European Union)</option>
                    <option value="CCPA / CPRA (California)">CCPA / CPRA (California)</option>
                    <option value="LGPD (Brazil)">LGPD (Brazil)</option>
                    <option value="HIPAA Privacy">HIPAA Privacy Rule</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1D23] mb-1">Data Subject Identifier Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. elena.rostova@techenterprise.com or cid_anon_temp_5104"
                  value={subjectIdValue}
                  onChange={(e) => setSubjectIdValue(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D5D5D5] rounded px-3 py-1.5 text-xs text-[#2C2C2C] focus:ring-1 focus:ring-[#1473E6] focus:outline-none"
                />
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
                  Execute Privacy Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
