import { useState } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function TopHeader() {
  const [unreadCount] = useState(3);

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-[#E4E4E7] px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Global Real Estate Search Bar with Keyboard Shortcut */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
        <input
          type="text"
          placeholder="Search MLS #, property address, buyer, or contingency..."
          className="w-full rounded-full border border-[#E4E4E7] bg-[#F4F4F5] pl-9 pr-12 py-1.5 text-xs text-[#09090B] placeholder:text-[#A1A1AA] focus:border-[#09090B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white border border-[#E4E4E7] text-[10px] text-[#71717A] font-mono shadow-clean-xs">
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Right Utility Actions */}
      <div className="flex items-center gap-3">
        {/* Clean System Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#52525B] font-medium bg-[#F4F4F5] px-3 py-1 rounded-full border border-[#E4E4E7]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
          <span>MLS Live</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-[#71717A] hover:text-[#09090B] hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          title="Notifications & Alerts"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-[#E4E4E7]" />

        {/* User Account Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
