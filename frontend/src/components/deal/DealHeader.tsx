import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Deal, NotificationSetting } from '@/types';
import { formatDate } from '@/utils/date';
import {
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Mail,
  FileCheck,
  History,
  BookOpen,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { AgentPlaybookModal } from './AgentPlaybookModal';
import { Badge } from '../ui/badge';

interface Props {
  deal: Deal | null;
  notifSettings?: NotificationSetting | null;
  activeTab?: 'milestones' | 'assistant' | 'notifications' | 'documents' | 'audit';
}

export function DealHeader({ deal, notifSettings, activeTab }: Props) {
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const location = useLocation();

  if (!deal) return null;

  const currentTab =
    activeTab ??
    (location.pathname.endsWith('/assistant')
      ? 'assistant'
      : location.pathname.endsWith('/notifications')
      ? 'notifications'
      : location.pathname.endsWith('/review')
      ? 'documents'
      : 'milestones');

  const alertsActive = notifSettings?.enabled && (notifSettings.recipients?.length ?? 0) > 0;

  return (
    <>
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#71717A]">
          <Link to="/deals" className="hover:text-[#09090B] font-medium transition-colors">
            Portfolio
          </Link>
          <ChevronRight className="h-3 w-3 text-[#A1A1AA]" />
          <span className="font-semibold text-[#09090B] truncate">
            {deal.propertyAddress}
          </span>
        </nav>

        {/* Command Center Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E4E7] shadow-clean-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7] shrink-0">
                <Building2 className="h-6 w-6 text-[#09090B]" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#09090B] tracking-tight">
                    {deal.propertyAddress}
                  </h1>

                  <Badge variant="success" className="text-[11px] px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
                    <span>{deal.status}</span>
                  </Badge>

                  {alertsActive ? (
                    <Badge variant="neutral" className="bg-zinc-100 border-zinc-200 text-zinc-800 text-[11px] px-2.5 py-0.5 rounded-full">
                      <Mail className="h-3 w-3 mr-1 text-zinc-600" />
                      <span>Resend Alerts Active ({notifSettings?.recipients?.length})</span>
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[11px] px-2.5 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
                      <span>Alerts Standby</span>
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#71717A]">
                  {deal.acceptanceDate && (
                    <span>
                      Acceptance: <strong className="font-mono text-[#09090B] font-medium">{formatDate(deal.acceptanceDate)}</strong>
                    </span>
                  )}
                  {deal.buyerName && (
                    <span>
                      Buyer: <strong className="text-[#09090B] font-medium">{deal.buyerName}</strong>
                    </span>
                  )}
                  {deal.sellerName && (
                    <span>
                      Seller: <strong className="text-[#09090B] font-medium">{deal.sellerName}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Export PDF Report</span>
              </button>
              <button
                type="button"
                onClick={() => setPlaybookOpen(true)}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F4F5] text-[#09090B] text-xs font-medium flex items-center gap-1.5 border border-[#E4E4E7] transition-all cursor-pointer active:scale-95"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#71717A]" />
                <span>Agent Playbook</span>
              </button>
            </div>
          </div>

          {/* ElevenLabs Segmented Tab Bar */}
          <div className="mt-6 pt-5 border-t border-[#E4E4E7]">
            <div className="inline-flex items-center gap-1 p-1 bg-[#F4F4F5] rounded-full border border-[#E4E4E7] overflow-x-auto max-w-full">
              <Link
                to={`/deals/${deal.id}`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  currentTab === 'milestones'
                    ? 'bg-white text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Milestones</span>
              </Link>

              <Link
                to={`/deals/${deal.id}/assistant`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  currentTab === 'assistant'
                    ? 'bg-white text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${currentTab === 'assistant' ? 'text-amber-500' : 'text-[#71717A]'}`} />
                <span>AI Copilot</span>
              </Link>

              <Link
                to={`/deals/${deal.id}/notifications`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  currentTab === 'notifications'
                    ? 'bg-white text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email &amp; Alerts</span>
              </Link>

              <Link
                to={`/deals/${deal.id}/review`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  currentTab === 'documents'
                    ? 'bg-white text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>Clause Verification</span>
              </Link>

              <Link
                to={`/audit?dealId=${deal.id}`}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  currentTab === 'audit'
                    ? 'bg-white text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Audit History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AgentPlaybookModal isOpen={playbookOpen} onClose={() => setPlaybookOpen(false)} />
    </>
  );
}
