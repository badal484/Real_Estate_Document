import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Plus, ShieldCheck, BookOpen, Layers, History } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { AgentPlaybookModal } from './deal/AgentPlaybookModal';
import { Badge } from './ui/badge';

const NAV_LINKS = [
  { href: '/deals', label: 'Transactions', icon: Layers },
  { href: '/upload', label: 'New Contract', icon: Plus, highlight: true },
  { href: '/audit', label: 'Audit History', icon: History },
];

export function Navbar() {
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xs transition-all">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Brand Logo */}
          <Link to="/deals" className="flex items-center gap-2.5 group select-none">
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-primary text-white shadow-2xs group-hover:bg-primary-hover transition-colors">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-primary-text">
                Contingency Copilot
              </span>
              <span className="hidden sm:inline-flex rounded border border-border bg-secondary px-1.5 py-0.2 text-[10px] font-medium text-secondary-text">
                Real Estate Compliance
              </span>
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
                    className="inline-flex items-center gap-1 rounded-md bg-primary text-white px-2.5 py-1 text-xs font-semibold shadow-2xs hover:bg-primary-hover transition-colors"
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                    active
                      ? 'bg-secondary text-primary font-semibold shadow-2xs'
                      : 'text-secondary-text hover:bg-secondary hover:text-primary-text'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-secondary-text" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="h-3.5 w-px bg-border mx-1 hidden md:block" />

            <button
              type="button"
              onClick={() => setPlaybookOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-secondary-text hover:bg-secondary hover:text-primary-text shadow-2xs transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-secondary-text" />
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
