import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Plus, ShieldCheck, BookOpen, Layers, History } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { AgentPlaybookModal } from './deal/AgentPlaybookModal';
import { Badge } from './ui/badge';

const NAV_LINKS = [
  { href: '/deals', label: 'Portfolio', icon: Layers },
  { href: '/upload', label: 'New Contract', icon: Plus, highlight: true },
  { href: '/audit', label: 'Audit Log', icon: History },
];

export function Navbar() {
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2 sm:px-6">
          {/* Brand Logo */}
          <Link to="/deals" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
              <Building2 className="h-4 w-4 text-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-slate-900">
                Contingency Copilot
              </span>
              <Badge variant="neutral" className="hidden sm:inline-flex text-[10px] px-1.5 py-0">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600 mr-0.5" />
                Legal Tech
              </Badge>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1.5 text-xs font-medium">
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
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-2.5 py-1 text-xs font-semibold shadow-2xs hover:bg-slate-800 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                    active
                      ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="h-3.5 w-px bg-slate-200 mx-1 hidden md:block" />

            <button
              type="button"
              onClick={() => setPlaybookOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
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
