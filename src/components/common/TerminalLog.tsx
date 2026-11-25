import React from 'react';
import { useCDP } from '../../context/CDPContext';
import { Terminal, Activity } from 'lucide-react';

export const TerminalLog: React.FC<{ maxItems?: number; className?: string }> = ({
  maxItems = 8,
  className = ''
}) => {
  const { terminalLogs } = useCDP();
  const displayedLogs = terminalLogs.slice(0, maxItems);

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-sky-400 font-bold';
      case 'warn':
        return 'text-blue-300 font-bold';
      case 'error':
        return 'text-blue-200 font-bold';
      case 'ai':
        return 'text-cyan-400 font-bold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className={`bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-800 flex flex-col relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            Real-Time Ingestion Loop & Flink Worker
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>2.4ms Latency</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 font-mono text-[11px] overflow-y-auto pr-1 select-text">
        {displayedLogs.map((log) => (
          <div key={log.id} className="flex items-start justify-between gap-2 leading-relaxed border-b border-slate-800/40 pb-1.5 last:border-0">
            <div className="flex items-start space-x-2 min-w-0">
              <span className="text-slate-500 shrink-0 text-[10px]">[{log.timestamp}]</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider shrink-0 bg-slate-800 ${getBadgeStyle(log.level)}`}>
                {log.tag}
              </span>
              <span className="text-slate-300 truncate">
                {log.message}
              </span>
            </div>
            {log.meta?.channel && (
              <span className="text-[10px] text-sky-300/75 shrink-0 hidden sm:inline">
                {log.meta.channel}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-sky-400 font-bold">&gt; PIPELINE STATUS:</span>
          <span className="text-white">STREAM_OK</span>
        </div>
        <span className="text-slate-500">Deterministic Stitching Engine Active</span>
      </div>
    </div>
  );
};
