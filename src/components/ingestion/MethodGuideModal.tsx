import React, { useState } from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  X,
  Copy,
  Check,
  Globe,
  Smartphone,
  Radio,
  Database,
  Upload,
  Send,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Code
} from 'lucide-react';

export interface IngestionMethodDetails {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  category: string;
  icon: string;
  description: string;
  sla: string;
  protocol: string;
  steps: { number: number; title: string; desc: string }[];
  snippets: { language: string; label: string; code: string }[];
  testPayload: Record<string, any>;
  channel: 'Web SDK' | 'Mobile SDK' | 'Snowflake Batch' | 'Salesforce CRM' | 'POS Terminal' | 'Kafka Ingestion';
  schemaId: string;
}

interface MethodGuideModalProps {
  method: IngestionMethodDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchWizard: (templateId: string) => void;
}

export const MethodGuideModal: React.FC<MethodGuideModalProps> = ({
  method,
  isOpen,
  onClose,
  onLaunchWizard
}) => {
  const { ingestEvent, setSelectedProfileId, setActiveTab } = useCDP();
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen || !method) return null;

  const currentSnippet = method.snippets[activeSnippetIdx] || method.snippets[0];

  const handleCopy = () => {
    if (!currentSnippet) return;
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTestPing = () => {
    setIsTesting(true);
    setTimeout(() => {
      const res = ingestEvent(method.testPayload, method.channel, method.schemaId);
      setTestResult(res);
      setIsTesting(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#D5D5D5] rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E5EA] bg-[#F8F9FA]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#1473E6] flex items-center justify-center text-white shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#2C2C2C]">{method.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  {method.badge}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F2F4F7] text-[#1E2229] border border-[#E1E5EA]">
                  SLA: {method.sla}
                </span>
              </div>
              <p className="text-xs text-[#1E2229] mt-0.5">{method.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1E2229] hover:text-[#2C2C2C] hover:bg-[#E1E5EA] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Step by step checklist */}
          <div>
            <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider mb-2.5">
              Implementation Blueprint
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {method.steps.map((step) => (
                <div key={step.number} className="p-3 rounded border border-[#E1E5EA] bg-[#F8F9FA]">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#1473E6] text-white flex items-center justify-center text-[10px] font-bold">
                      {step.number}
                    </span>
                    <span className="font-bold text-xs text-[#2C2C2C]">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-[#1E2229] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                {method.snippets.map((snip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSnippetIdx(idx)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                      idx === activeSnippetIdx
                        ? 'bg-[#1473E6] text-white border-[#1473E6]'
                        : 'bg-[#F2F4F7] text-[#1E2229] border-[#D5D5D5] hover:bg-[#E1E5EA]'
                    }`}
                  >
                    {snip.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-[#1473E6] hover:text-[#0D66D0] flex items-center gap-1 bg-[#F2F7FE] border border-[#C5DCFA] px-2.5 py-1 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span className="text-[#0284C7]">Copied Snippet</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 bg-[#1E1E1E] text-[#9CDCFE] font-mono text-[11px] rounded border border-[#3E3E3E] max-h-56 overflow-y-auto leading-relaxed">
              <pre>{currentSnippet?.code}</pre>
            </div>
          </div>

          {/* Live Ingestion Ping Test Box */}
          <div className="p-4 bg-[#F8F9FA] rounded border border-[#E1E5EA] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#2C2C2C] flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#1473E6]" />
                  <span>Interactive Pipeline Probe</span>
                </h4>
                <p className="text-[11px] text-[#1E2229] mt-0.5">
                  Fire a test payload to verify real-time ingestion, canonical mapping, and identity stitching.
                </p>
              </div>

              <button
                onClick={handleRunTestPing}
                disabled={isTesting}
                className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#90BFF9] text-white font-bold text-xs rounded transition-all flex items-center space-x-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Sending...' : 'Test Ingestion Ping'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-[#EBF3FC] border border-[#BFDBFE] rounded flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs text-[#0A3D82]">{testResult.message}</p>
                    <p className="text-[11px] text-[#1A1D23] mt-0.5">
                      Unified Profile ID: <span className="font-mono font-bold text-[#2C2C2C]">{testResult.profileId}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProfileId(testResult.profileId);
                    setActiveTab('profiles');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-white border border-[#BFDBFE] hover:bg-[#E0F2FE] text-[#0D66D0] font-bold text-[11px] rounded transition-colors whitespace-nowrap"
                >
                  View Profile 360
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E1E5EA] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[#1E2229] hover:text-[#2C2C2C] font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>

          <button
            onClick={() => {
              onClose();
              onLaunchWizard(method.id);
            }}
            className="px-4 py-2 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded shadow-2xs transition-all flex items-center space-x-1.5"
          >
            <span>Launch Complete Ingestion Wizard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
