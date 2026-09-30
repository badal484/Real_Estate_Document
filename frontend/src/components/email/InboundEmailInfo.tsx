import { useState } from 'react';
import type { InboundAddressResponse } from '@/types';
import { Inbox, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Inbox className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  Direct Inbound Ingestion Mailbox
                </h3>
                <Badge variant="success" className="text-[10px]">
                  Listening
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Forward executed contracts, addenda, or inspection notices directly to this dedicated deal address.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 p-2 max-w-xl">
            <span className="flex-1 font-mono text-xs text-foreground px-2 select-all truncate">
              {displayEmail}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2.5 text-xs gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Copy Address</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0"></div>
              <span>PDF attachments automatically parsed for dates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0"></div>
              <span>Sender verification & audit trail logging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
