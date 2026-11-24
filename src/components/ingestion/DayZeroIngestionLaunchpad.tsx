import React from 'react';
import { useCDP } from '../../context/CDPContext';
import {
  Globe,
  Smartphone,
  Store,
  Database,
  Terminal,
  Radio,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface DayZeroIngestionLaunchpadProps {
  onOpenWizard: (sourceType?: string) => void;
  onQuickSimulate: () => void;
}

export const DayZeroIngestionLaunchpad: React.FC<DayZeroIngestionLaunchpadProps> = ({
  onOpenWizard,
  onQuickSimulate
}) => {
  const { loadDemoSources } = useCDP();

  return (
    <div className="bg-[#FFFFFF] rounded border border-[#E1E5EA] shadow-2xs overflow-hidden">
      {/* Launchpad Header */}
      <div className="p-5 border-b border-[#E1E5EA] bg-[#F8F9FA] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded bg-[#DEFBE6] border border-[#B4F0C3] flex items-center justify-center text-[#0E7A36] shrink-0 shadow-2xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#2C2C2C]">
                Sandbox Initialized • Awaiting First Ingestion Stream
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                Day 0 Clean State
              </span>
            </div>
            <p className="text-xs text-[#1E2229] mt-0.5 max-w-2xl">
              No telemetry streams or connectors have been connected yet. Real-Time CDP requires at least one inbound streaming or batch connector to begin continuous identity resolution and customer profile unification.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenWizard('tpl_web_sdk')}
            className="px-3.5 py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white font-bold text-xs rounded shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect First Source</span>
          </button>

          <button
            onClick={onQuickSimulate}
            className="px-3 py-1.5 bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] font-semibold text-xs rounded border border-[#D5D5D5] transition-colors flex items-center space-x-1.5"
            title="Fire an instant event to see immediate normalization & identity stitching"
          >
            <Play className="w-3.5 h-3.5 text-[#0E7A36]" />
            <span>1-Click Test Event</span>
          </button>

          <button
            onClick={loadDemoSources}
            className="px-3 py-1.5 bg-[#F2F4F7] hover:bg-[#E1E5EA] text-[#1E2229] hover:text-[#2C2C2C] font-semibold text-xs rounded border border-[#D5D5D5] transition-colors"
            title="Populate the sandbox with 19 enterprise demonstration connectors"
          >
            <span>Load 19 Demo Connectors</span>
          </button>
        </div>
      </div>

      {/* 3-Step Guided Blueprint Roadmap */}
      <div className="p-5 border-b border-[#E1E5EA] bg-[#FFFFFF]">
        <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider mb-3">
          Recommended Onboarding Steps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded border border-[#C5DCFA] bg-[#F2F7FE] flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#1473E6] text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <div>
              <h5 className="text-xs font-bold text-[#2C2C2C]">Choose Source Archetype</h5>
              <p className="text-[11px] text-[#1E2229] mt-0.5 leading-relaxed">
                Select your data origin: Client-side Web SDK, Mobile App, Cloud Storage, or CRM Webhooks.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded border border-[#E1E5EA] bg-[#F8F9FA] flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#E1E5EA] text-[#1E2229] flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <div>
              <h5 className="text-xs font-bold text-[#2C2C2C]">Bind Schema & Key Contract</h5>
              <p className="text-[11px] text-[#1E2229] mt-0.5 leading-relaxed">
                Map raw payload keys to standard XDM (ExperienceEvent or Profile) and set primary identity namespaces.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded border border-[#E1E5EA] bg-[#F8F9FA] flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#E1E5EA] text-[#1E2229] flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <div>
              <h5 className="text-xs font-bold text-[#2C2C2C]">Verify Stream & Stitch Graph</h5>
              <p className="text-[11px] text-[#1E2229] mt-0.5 leading-relaxed">
                Transmit your first live telemetry payload to verify 200 OK edge ingress and real-time profile resolution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Guided Ingestion Pathway Cards */}
      <div className="p-5">
        <h4 className="text-xs font-bold text-[#1E2229] uppercase tracking-wider mb-3">
          Select an Inbound Ingestion Pipeline to Begin
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pathway 1: Web SDK */}
          <div className="p-4 rounded border border-[#E1E5EA] hover:border-[#1473E6] bg-white hover:bg-[#F8F9FA] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded bg-[#EBF3FC] text-[#1473E6] border border-[#C5DCFA]">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                  Streaming
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#1473E6] uppercase tracking-wider">
                Client-Side Ingestion
              </span>
              <h5 className="text-xs font-bold text-[#2C2C2C] mt-0.5 group-hover:text-[#1473E6] transition-colors">
                XLR8 Web SDK & Tag Manager
              </h5>
              <p className="text-[11px] text-[#1E2229] mt-1.5 line-clamp-3 leading-relaxed">
                Deploy lightweight JavaScript tag or GTM extension to capture web visits, product views, and anonymous cookies in real time.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E1E5EA] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#1E2229] font-mono">
                <span>Latency: ~2.4ms</span>
                <span>Format: JSON / XDM</span>
              </div>
              <button
                onClick={() => onOpenWizard('tpl_web_sdk')}
                className="w-full py-1.5 bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-bold rounded shadow-2xs transition-colors flex items-center justify-center space-x-1"
              >
                <span>Launch 3-Step Setup</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pathway 2: Mobile SDK */}
          <div className="p-4 rounded border border-[#E1E5EA] hover:border-[#0E7A36] bg-white hover:bg-[#F8F9FA] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DEFBE6] text-[#0E7A36] border border-[#B4F0C3]">
                  Streaming
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#0E7A36] uppercase tracking-wider">
                Mobile Telemetry
              </span>
              <h5 className="text-xs font-bold text-[#2C2C2C] mt-0.5 group-hover:text-[#0E7A36] transition-colors">
                Native Mobile SDK (iOS & Android)
              </h5>
              <p className="text-[11px] text-[#1E2229] mt-1.5 line-clamp-3 leading-relaxed">
                Capture screen view events, in-app purchases, and push notifications with deterministic IDFA and GAID device resolution.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E1E5EA] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#1E2229] font-mono">
                <span>Latency: ~3.1ms</span>
                <span>Format: Mobile Event</span>
              </div>
              <button
                onClick={() => onOpenWizard('tpl_mobile_sdk')}
                className="w-full py-1.5 bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] border border-[#D5D5D5] text-xs font-bold rounded transition-colors flex items-center justify-center space-x-1"
              >
                <span>Configure Mobile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pathway 3: Enterprise CRM & Commerce */}
          <div className="p-4 rounded border border-[#E1E5EA] hover:border-[#E68619] bg-white hover:bg-[#F8F9FA] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded bg-[#FFF4E5] text-[#E68619] border border-[#FFE1B5]">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F1E8FF] text-[#5C2B97] border border-[#D0B3FF]">
                  Webhook
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#E68619] uppercase tracking-wider">
                CRM & Commerce
              </span>
              <h5 className="text-xs font-bold text-[#2C2C2C] mt-0.5 group-hover:text-[#E68619] transition-colors">
                Salesforce CRM & Shopify Webhook
              </h5>
              <p className="text-[11px] text-[#1E2229] mt-1.5 line-clamp-3 leading-relaxed">
                Stream real-time account updates, e-commerce checkout orders, and ticket resolutions into customer profile records.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E1E5EA] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#1E2229] font-mono">
                <span>Latency: ~4.8ms</span>
                <span>Format: REST Webhook</span>
              </div>
              <button
                onClick={() => onOpenWizard('tpl_salesforce')}
                className="w-full py-1.5 bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] border border-[#D5D5D5] text-xs font-bold rounded transition-colors flex items-center justify-center space-x-1"
              >
                <span>Set Up Webhook</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Pathway 4: Data Warehouse & Streaming API */}
          <div className="p-4 rounded border border-[#E1E5EA] hover:border-[#5C2B97] bg-white hover:bg-[#F8F9FA] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded bg-[#F1E8FF] text-[#5C2B97] border border-[#D0B3FF]">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EBF3FC] text-[#0D66D0] border border-[#C5DCFA]">
                  Batch / Kafka
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#5C2B97] uppercase tracking-wider">
                Warehouse & Kafka
              </span>
              <h5 className="text-xs font-bold text-[#2C2C2C] mt-0.5 group-hover:text-[#5C2B97] transition-colors">
                Snowflake & Streaming REST Ingress
              </h5>
              <p className="text-[11px] text-[#1E2229] mt-1.5 line-clamp-3 leading-relaxed">
                Sync enterprise tables from Snowflake or BigQuery, or stream directly via backend cURL / Kafka topics.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E1E5EA] space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#1E2229] font-mono">
                <span>Latency: Sub-2ms</span>
                <span>Protocol: REST / SQL</span>
              </div>
              <button
                onClick={() => onOpenWizard('tpl_snowflake')}
                className="w-full py-1.5 bg-white hover:bg-[#F2F4F7] text-[#2C2C2C] border border-[#D5D5D5] text-xs font-bold rounded transition-colors flex items-center justify-center space-x-1"
              >
                <span>Connect Warehouse</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
