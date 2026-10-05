import React from 'react';
import { VersionInfo, SystemHealth } from '../types';

interface SystemStatusProps {
  health: SystemHealth | null;
  version: VersionInfo | null;
  latencyMs: number;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ health, version, latencyMs }) => {
  return (
    <footer className="w-full max-w-5xl mx-auto mt-12 pb-12 px-4 text-xs font-mono text-slate-400">
      <div className="p-5 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold text-slate-200">KUBERNETES HIGH AVAILABILITY PLATFORM</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Latency: <strong className="text-emerald-400">{latencyMs}ms</strong></span>
            <span>Replicas: <strong className="text-cyan-400">3/3 Ready</strong></span>
            <span>HPA: <strong className="text-purple-400">3-10 Pods</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-400">
          <div>
            <span className="text-slate-500 block">ORCHESTRATION</span>
            <span className="text-slate-300">AWS EKS v1.31</span>
          </div>
          <div>
            <span className="text-slate-500 block">PERSISTENCE</span>
            <span className="text-slate-300">PostgreSQL (ACID Safe)</span>
          </div>
          <div>
            <span className="text-slate-500 block">APP VERSION</span>
            <span className="text-slate-300">{version ? `v${version.version} (${version.gitSha.slice(0, 7)})` : 'v1.0.0'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">OBSERVABILITY</span>
            <span className="text-slate-300">Prometheus + Grafana</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
