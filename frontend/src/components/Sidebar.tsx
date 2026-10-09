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
      <aside className="w-60 flex-shrink-0 bg-white border-r border-[#e3e8ee] flex flex-col justify-between min-h-screen sticky top-0 z-30 select-none">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#e3e8ee] flex items-center justify-between">
            <Link to="/deals" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#635bff] text-white font-bold shadow-2xs group-hover:bg-[#5469d4] transition-colors">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#0a2540]">
                Contingency Copilot
              </span>
            </Link>
          </div>

          {/* Org Workspace Switcher */}
          <div className="px-3 py-2.5 border-b border-[#e3e8ee] bg-[#f8f9fa]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e3e8ee] cursor-pointer hover:border-[#cbd5e1] transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-5 w-5 rounded bg-[#0a2540] text-white font-bold flex items-center justify-center text-[10px]">
                  A
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#0a2540] truncate">Apex Brokerage Group</p>
                  <p className="text-[9px] text-[#8792a2] truncate">Main Account</p>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#8792a2]" />
            </div>
          </div>

          {/* Main Navigation Group */}
          <div className="p-3 space-y-5">
            <div>
              <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8792a2]">
                Workspace
              </p>
              <nav className="space-y-0.5">
                {MAIN_NAV.map((item) => {
                  const active =
                    item.href === '/deals'
                      ? pathname === '/deals'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#635bff]/10 text-[#635bff] font-semibold'
                          : 'text-[#4f566b] hover:bg-[#f8f9fa] hover:text-[#0a2540]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${active ? 'text-[#635bff]' : 'text-[#8792a2]'}`} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Ingestion CTA Button */}
            <div className="px-1">
              <Link
                to="/upload"
                className="w-full btn-stripe-primary text-xs font-semibold py-1.5 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Contract</span>
              </Link>
            </div>

            {/* Management & Governance Navigation */}
            <div>
              <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8792a2]">
                Admin &amp; Settings
              </p>
              <nav className="space-y-0.5">
                {SECONDARY_NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#635bff]/10 text-[#635bff] font-semibold'
                          : 'text-[#4f566b] hover:bg-[#f8f9fa] hover:text-[#0a2540]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-[#635bff]' : 'text-[#8792a2]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Footer User Profile & Agent Playbook */}
        <div className="p-3 border-t border-[#e3e8ee] space-y-2 bg-[#f8f9fa]">
          <button
            type="button"
            onClick={() => setPlaybookOpen(true)}
            className="w-full flex items-center justify-between p-1.5 rounded-md bg-white border border-[#e3e8ee] hover:border-[#cbd5e1] text-xs font-semibold text-[#4f566b] hover:text-[#0a2540] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-[#635bff]" />
              <span>Agent Playbook</span>
            </span>
            <Sparkles className="h-3 w-3 text-[#635bff]" />
          </button>

          {user && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded-full bg-[#0a2540] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0a2540] truncate">{user.name || 'Broker Admin'}</p>
                  <p className="text-[10px] text-[#8792a2] truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={signOut}
                className="p-1 text-[#8792a2] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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
