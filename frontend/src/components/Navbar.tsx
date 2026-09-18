import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700 text-lg">
          <span className="text-2xl">🏠</span>
          <span>Contingency Copilot</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/upload" className="hover:text-brand-700 transition-colors">
            Upload
          </Link>
          <Link href="/deals" className="hover:text-brand-700 transition-colors">
            Deals
          </Link>
          <Link href="/audit" className="hover:text-brand-700 transition-colors">
            Audit Log
          </Link>
        </div>
      </div>
    </nav>
  );
}
