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
      <div className="space-y-3">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/deals" className="hover:text-slate-800 transition-colors">
            Portfolio
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-900 truncate">
            {deal.propertyAddress}
          </span>
        </nav>

        {/* Command Center Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs shrink-0">
                <Building2 className="h-5 w-5 text-slate-100" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight">
                    {deal.propertyAddress}
                  </h1>

                  <Badge variant="success">
                    <ShieldCheck className="h-3 w-3 mr-0.5" />
                    <span>{deal.status}</span>
                  </Badge>

                  {alertsActive ? (
                    <Badge variant="info">
                      <Mail className="h-3 w-3 mr-0.5" />
                      <span>Resend Alerts Active ({notifSettings?.recipients?.length})</span>
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <AlertTriangle className="h-3 w-3 mr-0.5" />
                      <span>Alerts Inactive</span>
                    </Badge>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
                  {deal.acceptanceDate && (
                    <span>
                      Acceptance: <strong className="font-mono text-slate-800">{formatDate(deal.acceptanceDate)}</strong>
                    </span>
                  )}
                  {deal.buyerName && (
                    <span>
                      Buyer: <strong className="text-slate-800">{deal.buyerName}</strong>
                    </span>
                  )}
                  {deal.sellerName && (
                    <span>
                      Seller: <strong className="text-slate-800">{deal.sellerName}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Playbook Button */}
            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => setPlaybookOpen(true)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                <span>Agent Playbook</span>
              </button>
            </div>
          </div>

          {/* Unified Sub-Navigation Sticky Tab Bar */}
          <div className="mt-3.5 -mb-0.5 flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-2.5 no-scrollbar text-xs font-medium">
            <Link
              to={`/deals/${deal.id}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'milestones'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Milestones</span>
            </Link>

            <Link
              to={`/deals/${deal.id}/assistant`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'assistant'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              <span>AI Copilot</span>
            </Link>

            <Link
              to={`/deals/${deal.id}/notifications`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'notifications'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email &amp; Alerts</span>
            </Link>

            <Link
              to={`/deals/${deal.id}/review`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'documents'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Clause Verification</span>
            </Link>

            <Link
              to={`/audit?dealId=${deal.id}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'audit'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Audit History</span>
            </Link>
          </div>
        </div>
      </div>

      <AgentPlaybookModal isOpen={playbookOpen} onClose={() => setPlaybookOpen(false)} />
    </>
  );
}
