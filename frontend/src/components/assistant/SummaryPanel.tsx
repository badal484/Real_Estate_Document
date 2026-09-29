import React from 'react';
import type { ExecutiveSummary, RiskItem } from '@/types';
import { IconShieldCheck, IconExclamationTriangle, IconClock, IconSparkles } from '../icons';

interface SummaryPanelProps {
  summary: ExecutiveSummary | null;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <IconShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Deal Executive Summary</h3>
            <p className="text-[11px] text-slate-400">AI compliance overview &amp; risk matrix</p>
          </div>
        </div>

        <span className="badge-emerald text-[10px]">
          <IconSparkles className="h-3 w-3" />
          Live Audit
        </span>
      </div>

      {/* Executive Overview */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        {summary.overview}
      </p>

      {/* Risk Matrix */}
      {summary.risks && summary.risks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Risk &amp; Action Matrix ({summary.risks.length})
          </h4>

          <div className="space-y-2">
            {summary.risks.map((risk: RiskItem, idx: number) => {
              const isHigh = risk.severity === 'HIGH';
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 text-xs space-y-1 ${
                    isHigh
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <IconExclamationTriangle className={`h-3.5 w-3.5 ${isHigh ? 'text-amber-400' : 'text-slate-400'}`} />
                      {risk.title}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isHigh ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {risk.severity} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{risk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
