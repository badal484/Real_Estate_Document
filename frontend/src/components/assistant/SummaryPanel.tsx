import type { DealSummaryResponse } from '@/types';
import {
  IconBuilding,
  IconCheckCircle,
  IconExclamationTriangle,
  IconDocumentText,
  IconSparkles,
} from '../icons';

interface Props {
  summary: DealSummaryResponse | null;
  loading?: boolean;
}

export function SummaryPanel({ summary, loading }: Props) {
  if (loading || !summary) {
    return (
      <div className="card p-6 animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-16 bg-slate-100 rounded"></div>
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="card p-5 border-brand-100 bg-gradient-to-br from-white to-brand-50/20 space-y-3">
        <div className="flex items-center gap-2">
          <IconSparkles className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-900">Executive Transaction Summary</h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-700">
          {summary.executiveSummary}
        </p>
      </div>

      {/* Risk Matrix */}
      {summary.riskMatrix.length > 0 && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <IconExclamationTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              Transaction Risks &amp; Action Items ({summary.riskMatrix.length})
            </h3>
          </div>

          <div className="space-y-2">
            {summary.riskMatrix.map((risk, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs ${
                  risk.severity === 'high'
                    ? 'border-rose-200 bg-rose-50/60 text-rose-900'
                    : 'border-amber-200 bg-amber-50/60 text-amber-900'
                }`}
              >
                <span className="font-semibold">{risk.title}</span>
                <p className="mt-0.5 text-slate-700">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contingency Matrix */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Contingency Deadline Matrix</h3>
          <p className="text-[11px] text-slate-500">
            Current tracked dates with legal document sources
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Contingency</th>
                <th className="py-2.5 px-4 font-semibold">Target Date</th>
                <th className="py-2.5 px-4 font-semibold">Source Doc</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.contingencyMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-medium text-slate-900">{item.label}</td>
                  <td className="py-2.5 px-4 text-slate-700">{item.targetDate}</td>
                  <td className="py-2.5 px-4 text-slate-600 truncate max-w-[150px]">
                    {item.sourceDocument ? (
                      <span>
                        {item.sourceDocument} {item.pageNumber ? `(P.${item.pageNumber})` : ''}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {item.isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <IconCheckCircle className="h-3 w-3" />
                        Confirmed
                      </span>
                    ) : (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 text-[10px]">
                        Pending Review
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
