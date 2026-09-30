import { Link, useLocation } from 'react-router-dom';
import { IconBuilding, IconShieldCheck } from './icons';
import { UserMenu } from './UserMenu';

const LINKS = [
  { href: '/deals', label: 'Deals & Escrows' },
  { href: '/upload', label: 'Upload Contract' },
  { href: '/audit', label: 'Audit Trail' },
];

export function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs group-hover:bg-brand-700 transition-colors">
            <IconBuilding className="h-4 w-4 text-brand-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Contingency Copilot
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-600 border border-slate-200">
                <IconShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                Enterprise
              </span>
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 text-xs font-semibold">
          {LINKS.map((link) => {
            const active =
              link.href === '/deals'
                ? pathname === '/deals' || pathname.startsWith('/deals/')
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                to={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-xl px-3 py-1.5 transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

