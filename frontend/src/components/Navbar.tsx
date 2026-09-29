import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconBuilding, IconBot, IconSparkles, IconPlus, IconMagnifyingGlass } from './icons';
import { CopilotDrawer } from './CopilotDrawer';

const LINKS = [
  { href: '/upload', label: 'Upload Contract' },
  { href: '/deals', label: 'Deals Portfolio' },
  { href: '/audit', label: 'Audit History' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
                <IconBuilding className="h-5 w-5" />
              </span>
              <div>
                <span className="text-base font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  Contingency Copilot
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real Estate Document AI</span>
                </div>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {LINKS.map((link) => {
                const active = pathname === link.href || (link.href !== '/upload' && pathname.startsWith(`${link.href}`));
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-xl px-3.5 py-2 transition-all duration-200 ${
                      active
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Ask AI Copilot Button */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-950/80 to-slate-900 px-3.5 py-2 text-xs font-semibold text-brand-300 shadow-sm hover:border-brand-400 hover:bg-brand-500/20 hover:text-white transition-all"
            >
              <IconBot className="h-4 w-4 text-brand-400 animate-float" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Upload Button */}
            <Link
              to="/upload"
              className="btn-primary text-xs py-2 px-3.5 shadow-md shadow-brand-600/20"
            >
              <IconPlus className="h-4 w-4" />
              <span>New Contract</span>
            </Link>
          </div>
        </div>
      </header>

      {/* AI Copilot Drawer */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </>
  );
}

