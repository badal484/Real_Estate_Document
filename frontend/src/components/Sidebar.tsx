import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Plus,
  ShieldCheck,
  BookOpen,
  Layers,
  History,
  Users,
  BookOpenCheck,
  ChevronDown,
  FileText,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AgentPlaybookModal } from './deal/AgentPlaybookModal';

const MAIN_NAV = [
  { href: '/deals', label: 'Transactions', icon: Layers },
  { href: '/leads', label: 'Lead Pipeline', icon: Users },
  { href: '/properties', label: 'Property Inventory', icon: Building2 },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpenCheck },
];

const SECONDARY_NAV = [
  { href: '/organization', label: 'Organization & Team', icon: ShieldCheck },
  { href: '/audit', label: 'Audit Trail', icon: History },
  { href: '/contracts', label: 'Contracts Library', icon: FileText },
  { href: '/security', label: 'Security & Access', icon: Lock },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, signOut } = useAuth();
  const [playbookOpen, setPlaybookOpen] = useState(false);

  return (
    <>
      <aside className="w-64 flex-shrink-0 bg-white border-r border-[#E4E4E7] flex flex-col justify-between min-h-screen sticky top-0 z-30 select-none shadow-clean-xs">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between">
            <Link to="/deals" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#09090B] text-white font-bold shadow-clean-xs group-hover:scale-105 transition-all">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-[#09090B] block">
                  Contingency Copilot
                </span>
                <span className="text-[10px] text-[#71717A] font-medium block">
                  Real Estate Closing Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Org Workspace Switcher */}
          <div className="px-3.5 py-3 border-b border-[#E4E4E7]">
            <div className="flex items-center justify-between p-2 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] hover:border-neutral-400 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 min-w-0 pl-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-xs font-semibold text-[#09090B] truncate">Apex Realty &amp; Escrow</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#71717A] shrink-0 mr-1" />
            </div>
          </div>

          {/* Main Navigation Group */}
          <div className="p-3.5 space-y-6">
            <div>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#71717A]">
                Transaction Operations
              </p>
              <nav className="space-y-1">
                {MAIN_NAV.map((item) => {
                  const active =
                    item.href === '/deals'
                      ? pathname === '/deals'
                      : pathname === linkHref(item.href, pathname);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#09090B] text-white shadow-clean-xs'
                          : 'text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#09090B]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-[#71717A]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Ingestion CTA Button */}
            <div className="px-1">
              <Link
                to="/upload"
                className="w-full btn-pill-primary text-xs font-semibold py-2.5 flex items-center justify-center gap-2 shadow-clean-xs"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Ingest Contract PDF</span>
              </Link>
            </div>

            {/* Management & Governance Navigation */}
            <div>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#71717A]">
                Governance &amp; Audit
              </p>
              <nav className="space-y-1">
                {SECONDARY_NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#09090B] text-white shadow-clean-xs'
                          : 'text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#09090B]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-[#71717A]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Trust Assurance Mini Card */}
            <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-3.5 text-[11px] text-[#09090B]">
              <div className="flex items-center gap-1.5 font-semibold mb-1 text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>E&amp;O Compliance Guard</span>
              </div>
              <p className="text-[10px] text-[#71717A] leading-relaxed">
                Deterministic state date math across WA, CA, FL, TX &amp; NY standard contracts.
              </p>
            </div>
          </div>
        </div>

        {/* Footer User Profile & Agent Playbook */}
        <div className="p-3.5 border-t border-[#E4E4E7] space-y-2 bg-[#FAFAFA]">
          <button
            type="button"
            onClick={() => setPlaybookOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-full bg-white border border-[#E4E4E7] hover:border-neutral-400 text-xs font-medium text-[#52525B] hover:text-[#09090B] shadow-clean-xs transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2 pl-1">
              <BookOpen className="h-3.5 w-3.5 text-[#09090B]" />
              <span>Brokerage Playbook</span>
            </span>
            <Sparkles className="h-3 w-3 text-amber-500 mr-1" />
          </button>

          {user && (
            <div className="flex items-center justify-between pt-1 px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-full bg-[#09090B] text-white font-semibold flex items-center justify-center text-[10px] shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#09090B] truncate">{user.name || 'Managing Broker'}</p>
                  <p className="text-[10px] text-[#71717A] truncate font-mono">{user.email}</p>
                </div>
              </div>

              <button
                onClick={signOut}
                className="p-1.5 text-[#71717A] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <AgentPlaybookModal isOpen={playbookOpen} onClose={() => setPlaybookOpen(false)} />
    </>
  );
}

function linkHref(href: string, pathname: string): string {
  return pathname === href || pathname.startsWith(`${href}/`) ? href : '';
}
