import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Plus, ShieldCheck, BookOpen, Layers, History, Users, BookOpenCheck } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { AgentPlaybookModal } from './deal/AgentPlaybookModal';
import { Badge } from './ui/badge';

const NAV_LINKS = [
  { href: '/leads', label: 'AI Leads', icon: Users },
  { href: '/properties', label: 'Inventory', icon: Building2 },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpenCheck },
  { href: '/organization', label: 'Team / Org', icon: ShieldCheck },
  { href: '/deals', label: 'Deals & Tasks', icon: Layers },
  { href: '/upload', label: 'New Contract', icon: Plus, highlight: true },
  { href: '/audit', label: 'Audit Log', icon: History },
];

export function Navbar() {
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav transition-all">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Brand Logo */}
          <Link to="/deals" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md group-hover:bg-slate-800 transition-all ring-1 ring-white/20">
              <Building2 className="h-4.5 w-4.5 text-sky-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Contingency Copilot
              </span>
              <Badge variant="neutral" className="hidden sm:inline-flex text-[10px] px-2 py-0.5 glass-badge text-slate-700">
                <ShieldCheck className="h-3 w-3 text-emerald-600 mr-1" />
                2026 AI Verified
              </Badge>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-2 text-xs font-medium">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === '/deals'
                  ? pathname === '/deals'
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;

              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all"
                  >
                    <Icon className="h-3.5 w-3.5 text-sky-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
                    active
                      ? 'glass-card text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-200/80 mx-1 hidden md:block" />

            <button
              type="button"
              onClick={() => setPlaybookOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl glass-badge px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white/90 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              <span>Agent Playbook</span>
            </button>

            <UserMenu />
          </nav>
        </div>
      </header>

      <AgentPlaybookModal isOpen={playbookOpen} onClose={() => setPlaybookOpen(false)} />
    </>
  );
}
