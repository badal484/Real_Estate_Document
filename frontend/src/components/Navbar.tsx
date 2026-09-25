import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { IconBuilding } from './icons';

const LINKS = [
  { href: '/upload', label: 'Upload' },
  { href: '/deals', label: 'Deals' },
  { href: '/audit', label: 'Audit Log' },
];

export function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-white">
            <IconBuilding className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Contingency Copilot
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                to={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user && (
            <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3">
              {user.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden max-w-[160px] truncate text-slate-700 md:inline" title={user.email}>
                {user.name ?? user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md px-3 py-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
