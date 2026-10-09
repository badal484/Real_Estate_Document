import { useState } from 'react';
import { Search, Bell, Sparkles, Command } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function TopHeader() {
  const [unreadCount] = useState(3);

  return (
    <header className="h-14 bg-white border-b border-[#e3e8ee] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs select-none">
      {/* Global Search Bar with Keyboard Shortcut */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8792a2]" />
        <input
          type="text"
          placeholder="Search transactions, clients, or property addresses..."
          className="w-full rounded-lg border border-[#e3e8ee] bg-[#f8f9fa] pl-9 pr-12 py-1.5 text-xs text-[#1a1f36] placeholder:text-[#a3acb9] focus:border-[#635bff] focus:bg-white focus:outline-none transition-all"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-[#e3e8ee] text-[10px] text-[#8792a2] font-mono">
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Right Utility Actions */}
      <div className="flex items-center gap-3">
        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-[#059669]">
          <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
          <span>System Operational</span>
        </div>

        {/* AI Copilot Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#635bff]/10 border border-[#635bff]/20 text-[11px] font-semibold text-[#635bff]">
          <Sparkles className="h-3 w-3 text-[#635bff]" />
          <span>AI Engine Ready</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fa] rounded-lg transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-[#e3e8ee]" />

        {/* User Account Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
