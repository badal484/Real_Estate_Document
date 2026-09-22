'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBuilding } from './icons';

const LINKS = [
  { href: '/upload', label: 'Upload' },
  { href: '/deals', label: 'Deals' },
  { href: '/audit', label: 'Audit Log' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-white">
            <IconBuilding className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            Contingency Copilot
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
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
        </nav>
      </div>
    </header>
  );
}
