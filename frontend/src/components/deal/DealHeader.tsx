import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Deal, NotificationSetting } from '@/types';
import { formatDate } from '@/utils/date';
import {
  IconBuilding,
  IconChevronRight,
  IconShieldCheck,
  IconSparkles,
  IconEnvelope,
  IconDocumentText,
  IconHistory,
  IconBookOpen,
  IconCalendar,
} from '../icons';
import { AgentPlaybookModal } from './AgentPlaybookModal';

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
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/deals" className="hover:text-slate-800 transition-colors">
            Portfolio
          </Link>
          <IconChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold text-slate-900 truncate">
            {deal.propertyAddress}
          </span>
        </nav>

        {/* Hero Card */}
        <div className="card border-slate-200 bg-white p-5 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
                <IconBuilding className="h-5 w-5 text-brand-300" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    {deal.propertyAddress}
                  </h1>
                  
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <IconShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>{deal.status}</span>
                  </span>

                  {alertsActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                      <IconEnvelope className="h-3 w-3 text-brand-600" />
                      <span>Resend Alerts Armed ({notifSettings?.recipients?.length})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                      <span>⚠️ Alerts Not Armed</span>
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-slate-500">
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

            {/* Quick Action Playbook Trigger */}
            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => setPlaybookOpen(true)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-slate-700 hover:text-slate-900"
              >
                <IconBookOpen className="h-3.5 w-3.5 text-brand-600" />
                <span>Agent Playbook (DOs &amp; DON'Ts)</span>
              </button>
            </div>
          </div>

          {/* Unified Sub-Navigation Sticky Tab Bar */}
          <div className="mt-4 -mb-1 flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 no-scrollbar text-xs font-semibold">
            <Link
              to={`/deals/${deal.id}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'milestones'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconCalendar className="h-3.5 w-3.5" />
              <span>Milestones &amp; Timeline</span>
            </Link>

            <Link
              to={`/deals/${deal.id}/assistant`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'assistant'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconSparkles className="h-3.5 w-3.5 text-brand-300" />
              <span>AI Legal Copilot</span>
            </Link>

            <Link
              to={`/deals/${deal.id}/notifications`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'notifications'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconEnvelope className="h-3.5 w-3.5" />
              <span>Email &amp; Alerts</span>
            </Link>

            <Link
              to={`/deals/${deal.id}/review`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'documents'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconDocumentText className="h-3.5 w-3.5" />
              <span>Clause Verification</span>
            </Link>

            <Link
              to={`/audit?dealId=${deal.id}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                currentTab === 'audit'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <IconHistory className="h-3.5 w-3.5" />
              <span>Audit Trail</span>
            </Link>
          </div>
        </div>
      </div>

      <AgentPlaybookModal isOpen={playbookOpen} onClose={() => setPlaybookOpen(false)} />
    </>
  );
}
