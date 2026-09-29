import { useState } from 'react';
import type { InboundAddressResponse } from '@/types';
import { IconInbox, IconClipboard, IconCheckCircle } from '../icons';

interface Props {
  dealId: string;
  inboundInfo: InboundAddressResponse | null;
}

export function InboundEmailInfo({ dealId, inboundInfo }: Props) {
  const [copied, setCopied] = useState(false);

  // Fallback alias if server not configured with custom domain yet
  const displayEmail =
    inboundInfo?.inboundEmail || `deal-${dealId.slice(0, 8)}@deals.contingencycopilot.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card p-6 border-brand-200 bg-gradient-to-br from-white via-brand-50/20 to-brand-50/40">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <IconInbox className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Direct Inbound Email Intake
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Forward purchase agreements, addenda, or inspection reports directly to this deal.
              </p>
            </div>
            <span className="self-start rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Active Inbound
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm max-w-xl">
            <span className="flex-1 font-mono text-xs text-slate-800 select-all truncate">
              {displayEmail}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs shrink-0"
            >
              {copied ? (
                <>
                  <IconCheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <IconClipboard className="h-3.5 w-3.5 text-slate-600" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-500 space-y-1">
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              PDF attachments are extracted, parsed for contingency dates, and indexed for AI Q&amp;A.
            </p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              Only authorized recipient emails or verified agents are accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
